// Moves My Week's Live Activity along without the app running.
//
// Apple only lets an app update its Live Activity while it runs, so the strip on the Lock Screen
// froze until the app was opened. Instead, this script works out the current block from the same
// routine as the app (ios/Shared/Schedule.swift) and sends it to every phone through an APNs
// broadcast channel. GitHub Actions runs it every 5 minutes (.github/workflows/live-activity.yml).
//
//   node live-activity-push.mjs create-channel   prints a new channel ID (done once)
//   node live-activity-push.mjs update           sends the current state to the channel
//
// Environment: APNS_KEY (the .p8 file's text), APNS_KEY_ID, APPLE_TEAM_ID, CHANNEL_ID,
// APNS_ENV ("production" for TestFlight and the App Store, "sandbox" for Xcode builds).

import crypto from "node:crypto";
import http2 from "node:http2";

const BUNDLE_ID = "com.imshivam.myweek";
const TIME_ZONE = "Europe/London";
const env = process.env.APNS_ENV === "sandbox" ? "sandbox" : "production";

// The routine. Must match Schedule.swift. Minutes after midnight; past midnight is 24 h + time.
const t = (h, m = 0) => h * 60 + m;
const weekday = [
  [t(6, 30), t(8, 30), "rise"], [t(8, 30), t(9, 30), "commute"], [t(9, 30), t(17, 30), "office"],
  [t(17, 30), t(18, 30), "home"], [t(18, 30), t(19, 30), "workout"], [t(19, 30), t(20, 30), "cook"],
  [t(20, 30), t(21, 30), "dinner"], [t(21, 30), t(23), "walk"], [t(23), t(30, 30), "sleep"],
];
const weekend = [[t(6, 30), t(8, 30), "rise"], [t(8, 30), t(18, 30), "open"], ...weekday.slice(-5)];
const dayStart = t(6, 30);

// Wall-clock time in London -> a real moment.
function londonParts(date) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", weekday: "short",
  }).formatToParts(date).map((x) => [x.type, x.value]));
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, wd: p.weekday };
}
function londonDate(y, mo, d, minutes) {
  const wall = Date.UTC(y, mo - 1, d, 0, minutes);
  let ms = wall;
  for (let i = 0; i < 2; i++) {
    const p = londonParts(new Date(ms));
    ms = wall - (Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi) - ms);
  }
  return new Date(ms);
}

// The morning a moment belongs to (before 6:30 am counts as the night before), as y/mo/d.
function anchorDay(now) {
  const p = londonParts(now);
  const back = p.h * 60 + p.mi < dayStart ? 1 : 0;
  const u = new Date(Date.UTC(p.y, p.mo - 1, p.d - back));
  return { y: u.getUTCFullYear(), mo: u.getUTCMonth() + 1, d: u.getUTCDate() };
}
const isWeekend = ({ y, mo, d }) => [0, 6].includes(new Date(Date.UTC(y, mo - 1, d)).getUTCDay());
const addDays = ({ y, mo, d }, n) => {
  const u = new Date(Date.UTC(y, mo - 1, d + n));
  return { y: u.getUTCFullYear(), mo: u.getUTCMonth() + 1, d: u.getUTCDate() };
};
function slotsOnDay(day) {
  return (isWeekend(day) ? weekend : weekday).map(([s, e, key]) => ({
    key, start: londonDate(day.y, day.mo, day.d, s), end: londonDate(day.y, day.mo, day.d, e),
  }));
}
/** The block happening at `now` and the ones after it, with the one before. */
function state(now) {
  let day = addDays(anchorDay(now), -1);
  let all = [];
  for (let i = 0; i < 3; i++, day = addDays(day, 1)) all = all.concat(slotsOnDay(day));
  const i = all.findIndex((s) => s.end > now);
  return { previous: all[i - 1], current: all[i], next: all[i + 1], after: all[i + 2] };
}

// ActivityKit decodes dates as seconds since 1 January 2001.
const ref = (date) => date.getTime() / 1000 - 978307200;
const slot = (s) => ({ key: s.key, start: ref(s.start), end: ref(s.end) });

function token() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const head = `${b64({ alg: "ES256", kid: process.env.APNS_KEY_ID })}.${b64({ iss: process.env.APPLE_TEAM_ID, iat: Math.floor(Date.now() / 1000) })}`;
  const sig = crypto.sign("sha256", Buffer.from(head), { key: process.env.APNS_KEY, dsaEncoding: "ieee-p1363" });
  return `${head}.${sig.toString("base64url")}`;
}

function request(host, path, headers, body) {
  return new Promise((resolve, reject) => {
    const client = http2.connect(`https://${host}`);
    client.on("error", reject);
    const req = client.request({ ":method": "POST", ":path": path, authorization: `bearer ${token()}`, ...headers });
    let data = "", responseHeaders = {};
    req.on("response", (h) => { responseHeaders = h; });
    req.on("data", (c) => { data += c; });
    req.on("end", () => { client.close(); resolve({ status: responseHeaders[":status"], headers: responseHeaders, body: data }); });
    req.on("error", reject);
    req.end(JSON.stringify(body));
  });
}

const mode = process.argv[2];
if (mode === "show") {
  const at = process.argv[3] ? new Date(process.argv[3]) : new Date();
  const s = state(at);
  for (const [k, v] of Object.entries(s)) console.log(k.padEnd(8), v.key.padEnd(8), v.start.toLocaleString("en-GB", { timeZone: TIME_ZONE }), "->", v.end.toLocaleString("en-GB", { timeZone: TIME_ZONE }));
} else if (mode === "create-channel") {
  const host = env === "sandbox" ? "api-manage-broadcast.sandbox.push.apple.com:2195" : "api-manage-broadcast.push.apple.com:2196";
  const r = await request(host, `/1/apps/${BUNDLE_ID}/channels`, { "content-type": "application/json" },
    { "message-storage-policy": 0, "push-type": "LiveActivity" });
  console.log(r.status, r.headers["apns-channel-id"] ?? r.body);
} else if (mode === "update") {
  const now = new Date();
  const s = state(now);
  const contentState = {
    previous: slot(s.previous), current: slot(s.current), next: slot(s.next), after: slot(s.after), updatedAt: ref(now),
  };
  const host = env === "sandbox" ? "api.sandbox.push.apple.com" : "api.push.apple.com";
  const r = await request(host, `/4/broadcasts/apps/${BUNDLE_ID}`, {
    "apns-channel-id": process.env.CHANNEL_ID, "apns-push-type": "liveactivity", "apns-priority": "5",
    "content-type": "application/json",
  }, {
    aps: {
      timestamp: Math.floor(now.getTime() / 1000), event: "update",
      "content-state": contentState, "stale-date": Math.floor(s.current.end.getTime() / 1000),
    },
  });
  console.log(`${now.toISOString()} ${s.current.key} -> ${r.status} ${r.body}`);
  if (r.status !== 200) process.exit(1);
} else {
  console.log("Usage: node live-activity-push.mjs create-channel | update");
  process.exit(1);
}

# Changelog

## 2.0 — 26 November 2026

The new design, chosen on the Claude Design canvas (direction A, inspired by mindmarket.com).

- What's on: big official 16:9 film pictures on white cards over cream, three across on desktop, one on phone. Each card shows the title, the next show (e.g. "Tonight · 6pm") and the cinema with its distance.
- One line under the title: "Shows after 5pm on weekdays and all day at weekends, with journey times from your work and home." Tapping "work" or "home" sets that postcode.
- Film page: picture, title and film details on the left (desktop) with the shows on the right; on phone, Shows and About tabs.
- Every show lists the distance, public transport time and walking time from both work and home, in an aligned table.
- About: description, trailer, release date, then ratings as rows (Letterboxd for now; IMDb, Rotten Tomatoes and Metacritic once an OMDb key is added).
- Tapping a cinema offers Citymapper, Google Maps or Apple Maps, opening the cinema's page rather than directions.
- Dark mode follows the device's setting.
- The morning update now also fetches each film's official picture, description, genre and release date from TMDB, and its Letterboxd score.

Why: Shivam wanted the films to feel exciting (big pictures, breathing room), travel from both places on every show, and ratings only where he's deciding on a film.

## Design exploration — 25 November 2026 (not shipped)

Four directions in `explore/`: Gallery, When can I go, One film at a time, Magazine. They share one film screen: big picture, then shows grouped by Today, Tomorrow and the date.

- Times are now 12-hour (6:45pm).
- Pictures are clean frames from each film's trailer, with the black bars trimmed off. The cinema site's own images are 640px banners with text on them, and Wikipedia's posters are about 260px wide, so neither can be shown big.
- Answered Shivam's privacy question: the live page doesn't show where he lives. His postcodes are saved only in his own browsers.

Why: Shivam found the small-thumbnail list unexciting and crowded, and wanted big pictures and breathing room on desktop as well as on the phone. Principles: `explore/PRINCIPLES.md`.

## 1.0 — 25 November 2026

First version.

- Lists the subtitled films showing at London-area cinemas, from Your Local Cinema, and keeps only shows Shivam can make: weekdays from 5pm, any time at weekends and on bank holidays.
- Each show has one travel time to decide with (walk if it's within 20 minutes or no slower, otherwise public transport), plus the other measures: public transport time and route, and the walk in miles and minutes.
- Weekday shows are measured from work, weekend shows from home.
- Shows more than 45 minutes away sit behind "Farther away" on each film.
- Tapping a show opens public transport directions in Google Maps.
- Listings refresh every morning with GitHub Actions (`.github/workflows/subtitled-listings.yml`).

Why: Shivam checks yourlocalcinema.com for subtitled screenings on his phone and laptop, and had to scroll every film's full UK list, work out which times suit him and where each cinema is.

Decisions:
- **Titles come from trailers.** The site shows film titles only inside poster images, so the reader takes each title from the film's YouTube trailer name.
- **Walking routes from OpenStreetMap, not TfL.** TfL's planner refuses walks longer than about an hour, so walking comes from OpenStreetMap's foot router in one request for all cinemas.
- **Home and work stay off GitHub.** The Lab is public, so the postcodes live only in the browser on each device. TfL times are worked out in the browser and kept there for 30 days.
- **Placeholder times.** Until TfL answers, a cinema's time is estimated from its walking distance (14 minutes plus 5.5 a mile, fitted to 68 real TfL journeys) and marked with "~".
- Cinema locations come from OpenStreetMap, matched by hand; three were looked up by postcode (Kiln, The Whiteley, Cineworld Wood Green).

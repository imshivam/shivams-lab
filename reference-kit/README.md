# Reference Kit

Real visual references for any project: screenshots, app screens and short motion clips, in one tagged library, turned into a private board where Shivam marks each one Keep or Drop.

Made because drawn stand-ins don't help a design decision. Seeing the real thing does.

## What's here

- `ref.py` collects assets into `assets/<project>/` and logs each one in `library.json`: title, direction, tags, source, link and date.
- `board.py` + `board-template.html` build the Keep / Drop board from the library.
- `boards/<project>-directions.json` defines the board's sections.
- `assets/` and `library.json` stay on this Mac. They hold other companies' screenshots and footage, so they never go to the public Lab.

## Collecting

```bash
python3 ref.py store "Balatro" --direction arcade --count 4                       # App Store screenshots
python3 ref.py url <image-url> --title "Tolan · card" --source Mobbin --link <mobbin-page>
python3 ref.py og https://example.com --title "Example · site"                    # a page's share image
python3 ref.py peek <youtube-url> --from 60 --to 240 --out sheet.jpg              # contact sheet to pick a moment
python3 ref.py clip <youtube-url> --start 118 --dur 6 --crop portrait --title "TCG Pocket · pack reveal"
python3 ref.py list --project card-game
```

Common flags: `--project` (default `card-game`), `--direction`, `--tags a,b`.

Sources that work well:

- **App Store.** Apple's public search API gives each app's real screenshots, with no scraping.
- **Mobbin.** Use the Mobbin connector's `search_screens`. Download `image_url` with `ref.py url`, and link to `mobbin_url`. It's strong for regular apps and weak for games.
- **YouTube.** Use `peek` to see frames across a stretch of video, then `clip` to cut a short, silent loop. Needs `yt-dlp` and `ffmpeg` (both from Homebrew).
- **Websites.** `og` grabs a page's share image. For anything else, take a screenshot in the browser.

## Building a board

```bash
python3 board.py card-game boards/card-game-directions.json OUT
```

Then publish `OUT/board.html` as an artifact:

- **Files:** every path in `OUT/files.json`.
- **Capabilities:** `{"db": {}}`.
- **Reading picks:** they are saved in the artifact's `picks` collection, one doc per asset with `verdict` and `note`, so Claude can read them back.

## Boards

- Card Game: https://claude.ai/artifact/5odjRkw1ivwmXGFKZ8AuDR

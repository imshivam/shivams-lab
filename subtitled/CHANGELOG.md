# Changelog

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

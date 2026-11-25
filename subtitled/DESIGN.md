# Subtitled: design principles

The job: see a subtitled film and know straight away whether there's a show you can make, and how far it is.

Sources: GOV.UK Service Manual, "One thing per page"; W3C *Making Content Usable for People with Cognitive and Learning Disabilities* (COGA), objectives 3 and 4 (help users find what they need, use clear and understandable content); Apple Human Interface Guidelines, Layout and Typography; NN/g, "Progressive Disclosure".

1. **Only shows you can make.** Weekday shows start at 5pm or later; weekends and bank holidays count at any time. Everything else is left out, not greyed out.
2. **Nearest first, far ones hidden.** Shows more than 45 minutes away sit behind one "Farther away" button per film (progressive disclosure).
3. **The right starting point, without asking.** Weekday evenings are measured from work, weekends from home. Each row says which.
4. **One number to decide with, two to check.** The big number is the way Claude would go: walking if it's within 20 minutes or no slower than transport, otherwise public transport. Under it: public transport time and the walk in miles and minutes.
5. **One job per screen.** Home: which films have a show you can make. Film: which show. Setup: your two places.
6. **The biggest text is what you act on.** Film titles on the home screen; show times on the film screen.
7. **Light or dark follows the phone.** System font, 44-point tap targets, visible focus.

## How travel is worked out

- **Walking:** real street routes from OpenStreetMap's foot router (routing.openstreetmap.de), one request for all cinemas. Miles and minutes at a normal walking pace.
- **Public transport:** TfL Journey Planner, fastest journey. From work on a weekday leaving 5:30pm, from home on a Saturday leaving 2pm. Kept on the device for 30 days.
- **Home and work** are saved on the device only (browser storage). They are not in the published code.

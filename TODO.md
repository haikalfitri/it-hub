# TODO

Updated 2026-11-27. Tick items as they are done, and add new ones as they appear. Keep `PROJECT_TRACKER.md` in step.

## Now
- [ ] Netlify: set Visitor access to public (site still returns a login redirect, 401)
- [ ] Check the live site from outside: every page, refresh on an inner page, `/?tour=start`
- [ ] Re-run Lighthouse on the live site (target performance ≥ 90 on mobile)
- [ ] Add the live link to `README.md` and the GitHub repo homepage field
- [ ] Update portfolio card #11 (`C:\dev\Portfolio\index.html`) with the live link and tour link; show the user before pushing
- [ ] Click through the tour yourself and adjust any wording

## Done
- [x] Design doc, plan, 16 tasks built, final review and fixes (112 tests)
- [x] Merged to `master`, public repo https://github.com/haikalfitri/it-hub
- [x] Deployed to Netlify: https://it-hub-ms.netlify.app/

## Later: guide videos
- [ ] Discuss the guide videos (what to record, length, where they live in the app)

## Deferred minors from the final review
- [ ] Tour button in the header below 1024px (mobile drawer)
- [ ] Linked ticket page shows the request's stepper
- [ ] Search palette: Staff should only find their own tickets/requests
- [ ] Dashboard warranty list: show the asset's real status instead of "In stock" for any ownerless asset
- [ ] Ticket trend "resolved" bucket: use resolution time, not `updatedAt`
- [ ] Refuse a second open surrender for the same asset
- [ ] Notify the waiting approver when a request is cancelled
- [ ] Onboarding checklist: don't require "Laptop imaged" when no laptop is needed
- [ ] Assets "My assets" default should follow role switches
- [ ] Inline theme script to avoid a light flash for dark-mode users
- [ ] Remove `clsx` / `tailwind-merge` if unused
- [ ] Dashboard mobile performance (~72): defer charts further or use lighter bar tiles

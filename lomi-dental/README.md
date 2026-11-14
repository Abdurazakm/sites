# Lomi Dental

A fictional Bole dental clinic demo with English and Amharic pages and a browser-only appointment preview. This standalone static site is separate from the Yaltopia application. No clinic inbox, analytics, payment processing, or patient records are connected.

## Run

From this directory, run `npm install`, `npm run build`, then `npm run dev`. Open http://127.0.0.1:4310. Inside the parent workspace, existing PostCSS and Tailwind dependencies are reused. For a standalone copy, install this directory’s dependencies first. Run `npm test` for the demo checks.

## Customize

- `src/clinic.mjs`: names, domain, location, hours, phone, messaging link, image paths, enabled treatments, and OKLCH brand colors.
- `src/content.mjs`: English and Amharic copy, dentist profiles, treatment explanations, form labels, FAQs, and privacy text.
- `src/ui-copy.mjs`: bilingual interface copy, treatment categories, booking guidance, and page headings.
- `src/presence-copy.mjs`: patient-focused storytelling and accurate bilingual image descriptions.
- `src/flow-copy.mjs`: treatment groups, page transitions, first-visit guidance, and treatment-page questions in both languages.
- `src/styles.css`: shared Tailwind tokens, typography, responsive layout, and dark mode.
- `src/template.mjs`: shared page layouts. The build generates separate HTML files per language and treatment, with canonical and alternate-language links.
- `public/assets/`: self-hosted illustrative photographs and fonts. Replace with approved clinic assets.

Rebuild after edits. Removing a treatment from clinic settings removes its page, listing, and appointment option. Hours and form day/time rules must be updated together if a clinic uses a different schedule.

Navigation follows Home → Treatments → Our dentists → Our clinic → Contact, with a consistent appointment action. The homepage provides a short introduction to each decision; deeper information lives on the relevant page. Treatments are grouped by patient need through `serviceGroups` in clinic settings. Every treatment page follows suitability → consultation → practical questions → appointment request, with related treatments from the same group. Dentist settings connect each profile to its focus areas. Qualification lists remain empty until verified clinic credentials are supplied.

## Before a real launch

Replace fictional content with verified clinic information. Have a fluent Amharic reviewer and the clinic review translations and treatment descriptions. Use credentials, patient stories, and patient photos only after verification and appropriate approval.

The demo form does not deliver or save requests. Connect a secure backend with server-side validation, rate limits, spam protection, staff access controls, delivery-error handling, and an accurate privacy notice before collecting real requests. The local honeypot alone is not production spam protection. Add analytics only after configuring the clinic’s actual privacy practices.

Disabling `demo` alone does not create a live booking service. Replace demo notices and confirmation text, configure exact map directions and contact details, enable indexing, and add verified Dentist structured data when the business is real. The demo is excluded from indexing and has no invented ratings, testimonials, or business schema.

## References and assets

The current presentation uses a dark teal photo-led hero, patient-oriented treatment entry points, an image gallery, and original illustrative photographs featuring Ethiopian people. Four original images in `public/assets/presence-*.jpg` and eleven distinct page images in `public/assets/unique-*.jpg` were made with the built-in `image_gen` tool. The complete prompts and source references are recorded in `IMAGE-PROMPTS.json`. These are fictional scenes, not actual staff, patients, facilities, or treatment results. Photography provenance is recorded here and in the image prompt manifest; repeated photo credits are omitted from the marketing pages. Replace them with clinic-approved photographs for a real client launch.

Photography now follows a one-placement rule across the site: a photo appears once per language, and translated versions of the same page share its assigned image. The homepage has three selected treatment photographs; the treatment directory uses six additional distinct photo cards with visible treatment links, while related links use compact text rows. Each treatment detail page has a distinct image, and each dentist has a separate illustrative portrait. Shared FAQ and appointment prompts deliberately contain no decorative photos. Tests compare image content hashes across all routes to catch repeated files even if renamed.

The six `public/assets/catalog-*.jpg` images were created with the built-in image generation tool specifically for the treatment directory. Exact prompts are saved in `IMAGE-PROMPTS.json`. Change `catalogImages` in clinic settings to customize these independently of homepage and detail photos.

The visual refinement applies the official [frontend-design skill](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md), the project UI/UX guidelines, and design-engineering guidance: one strong hero, a restrained type scale, useful section structure, clear focus states, reduced motion, and immediate button feedback.

The supplied healthcare references informed the large photography, clear navigation, cool teal/blue palette, and treatment hierarchy. Additional references: [A2 Design](https://dribbble.com/shots/25686884-Dental-Clinic-Website), [Suiten Design](https://dribbble.com/shots/26600764-Dental-Clinic-Website-UI-Design), and [Oravia by Rafi](https://dribbble.com/shots/27764795-Modern-Dental-Clinic-Website-Design). Layouts and code are original; Dribbble artwork is not redistributed.

Illustrative photos from Unsplash: `photo-1629909613654-28e377c37b09`, `photo-1609840114035-3c981b782dfe`, `photo-1622253692010-333f2da6031d`, `photo-1629909615184-74f495363b67`, `photo-1598256989800-fe5f95da9787`, `photo-1606811841689-23dfddce3e95`, and `photo-1606811971618-4486d14f3f99`. The hero photograph appears first on mobile, and treatment photographs are selected through `treatmentImages` in the clinic settings. Self-hosted DM Sans and Noto Sans Ethiopic are from Google Fonts. Review asset licensing and replace illustrative photos with approved clinic photography for client delivery.

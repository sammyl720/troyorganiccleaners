# Troy Organic Cleaners Design System

## Positioning

Troy Organic Cleaners should feel like a trusted neighborhood garment-care shop, not a generic wellness brand. The design should combine three signals:

- **Careful craft:** tailoring, pressing, crisp folded laundry, garment tags, hangers, seams, and finishing details.
- **Organic process:** clean air, plant-based care, freshness, low-chemical confidence, and environmental responsibility.
- **Local trust:** Brooklyn storefront, 407 Troy Ave, owner-led service, familiar customer relationships, practical pickup and delivery.

The current brand assets already point in the right direction: a black-and-white hanger logo with a leaf mark, a deep teal storefront, brick, warm interior lighting, and direct owner photography. Keep those cues and build around them.

## Visual Direction

### Mood

Clean, personal, tailored, and grounded. The site should feel polished enough for suit alterations and dry cleaning, but still approachable for wash-and-fold customers.

Avoid a spa-like eco aesthetic. Do not rely on pale green gradients, leaf patterns, or stock nature photography. The "organic" message should show up through restraint, cleanliness, and material choices rather than decorative nature motifs.

### References From Research

- Public business information confirms the core services: organic dry cleaning, wash-and-fold, custom tailoring, and pickup/delivery.
- Review summaries emphasize friendly staff, meticulous service, quick turnaround, quality cleaning, and strong neighborhood usefulness.
- Current site assets show a real storefront with teal trim, brick, warm lights, and owner-led personality.

## Color System

Use a warm neutral base with storefront teal, leaf green, ink black, and a small brass accent.

| Token | Hex | Use |
| --- | --- | --- |
| `--color-ink` | `#141414` | Primary text, logo contrast, footer |
| `--color-paper` | `#FAF8F2` | Main page background |
| `--color-white` | `#FFFFFF` | Forms, cards, high-contrast surfaces |
| `--color-storefront` | `#0E5660` | Header accents, hero overlays, primary brand blocks |
| `--color-storefront-dark` | `#08363D` | Footer/nav dark surfaces |
| `--color-leaf` | `#4D7C52` | Organic proof points, success states, secondary buttons |
| `--color-brick` | `#7A4637` | Small local/storefront accents |
| `--color-brass` | `#B4834B` | Highlight rules, badges, focus details |
| `--color-mist` | `#E7EFEA` | Soft section background |
| `--color-stone` | `#D9D2C5` | Borders, dividers |

Use color in a controlled way:

- Most surfaces should be paper, white, or mist.
- Teal should anchor the brand and storefront connection.
- Green should support "organic" but should not dominate the page.
- Brass should be used sparingly for warmth and detail.

## Typography

The logo has a classic serif and high-contrast sign-painting feel. Pair that with modern, readable text.

- **Display:** `Cormorant Garamond` or `Libre Baskerville`
- **Interface/body:** `Inter`, `Source Sans 3`, or `Montserrat` if keeping the current dependency
- **Numeric/detail text:** same interface family, medium weight

Recommended scale:

| Role | Size | Weight | Notes |
| --- | --- | --- | --- |
| Hero title | 48-64px desktop, 36-42px mobile | 700 | Short, literal, service-forward |
| Section title | 34-44px desktop, 28-32px mobile | 700 | No wide letter spacing |
| Card title | 21-24px | 700 | Tight, practical |
| Body | 17-18px | 400 | 1.55-1.7 line height |
| Small detail | 13-14px | 600 | Hours, labels, chips |

Avoid all-caps paragraphs and wide tracking. The business should feel precise, not loud.

## Layout Principles

- Keep sections full-width with constrained inner content, not floating page cards.
- Use compact cards only for repeated service items, hours, testimonials, or contact methods.
- Prioritize the practical customer path: services, hours, pickup/delivery, directions, contact.
- Let the storefront and owner imagery carry trust in the first viewport.
- Use 8px radius or less for cards and controls.
- Keep the design dense enough for a local service business; avoid oversized marketing whitespace.

Suggested page structure:

1. **Hero:** real storefront/owner image, brand name, short value prop, call/directions buttons, today’s hours.
2. **Service Strip:** dry cleaning, wash-and-fold, tailoring, pickup/delivery.
3. **Organic Care Proof:** short explanation of organic cleaning, garment-safe care, family/environment benefit.
4. **Owner/Local Trust:** "Meet Toli" content, real quote, years of experience.
5. **Hours + Location:** address, map, direct phone/WhatsApp actions.
6. **Contact:** compact form and fast contact methods.

## Components

### Header

White or paper background with a thin stone border. Use the existing logo as a left-aligned mark, not a tiny centered badge. Nav labels should be simple: Services, Organic Care, Hours, Location, Contact.

Primary mobile action should be a phone or directions icon button.

### Buttons

Primary button:

- Background: storefront teal
- Text: white
- Radius: 6px
- Height: 44-48px
- Label examples: `Call Now`, `Get Directions`, `Schedule Pickup`

Secondary button:

- White/paper background
- Ink text
- 1px stone border

Organic/WhatsApp action:

- Leaf green background
- White text
- Use only for the WhatsApp/contact action, not everywhere.

### Service Cards

Cards should feel like garment tags or ticket stubs without becoming decorative:

- White surface
- 1px stone border
- 8px radius max
- Small brass or teal top rule
- Simple icon or small photo crop
- Short practical copy

Service card labels:

- Dry Cleaning
- Wash & Fold
- Custom Tailoring
- Free Local Pickup & Delivery

### Hours Block

Make hours scannable, not buried:

- Use two columns: day and time.
- Highlight the current day if JavaScript is added.
- Show Friday/Saturday clearly because the schedule is unusual.

### Location Block

Use the map as a supporting visual, not the whole section. Pair it with:

- Address
- Phone
- "Get Directions" button
- Parking/street context only if confirmed

### Forms

Forms should be quiet and utilitarian:

- Labels above inputs
- 44px minimum input height
- White surface with stone border
- Teal focus ring
- Submit button says `Send Message`

## Imagery

Use real business imagery first:

- Storefront at 407 Troy Ave
- Owner portrait
- Garments on hangers
- Pressed shirts/suits
- Tailoring tools and machine details
- Clean folded laundry

Photo treatment:

- Natural color
- Preserve teal storefront and warm shop light
- Do not heavily blur or darken
- Avoid stock nature, generic laundry baskets, or sterile white-room imagery

If image overlays are needed, use a dark teal overlay at 45-65% opacity. Keep text readable and avoid placing long paragraphs over photos.

## Iconography

Use line icons with consistent stroke weight:

- Hanger for dry cleaning
- Shirt for laundry
- Scissors/ruler for tailoring
- Truck or map pin for pickup/delivery/location
- Leaf for organic process

Do not mix Font Awesome brand icons with mismatched decorative icons except for social media.

## Copy Tone

Voice should be direct, local, and service-oriented.

Good:

- "Organic dry cleaning, careful tailoring, and wash-and-fold on Troy Ave."
- "Drop off before noon for faster turnaround."
- "Garments cleaned without harsh traditional dry-cleaning chemicals."
- "Call, WhatsApp, or stop by the shop."

Avoid:

- Abstract sustainability claims without service detail
- Luxury fashion language that feels detached from neighborhood customers
- Long medical/scientific paragraphs on the homepage

## Accessibility And UX Rules

- Minimum body contrast should pass WCAG AA.
- Use visible focus states on all links and controls.
- Do not put paragraphs over busy storefront photos.
- Keep tap targets at least 44px high.
- Make phone, WhatsApp, and directions actions available above the fold on mobile.
- Do not rely on color alone for open/closed or status indicators.

## CSS Token Starter

```css
:root {
  --color-ink: #141414;
  --color-paper: #faf8f2;
  --color-white: #ffffff;
  --color-storefront: #0e5660;
  --color-storefront-dark: #08363d;
  --color-leaf: #4d7c52;
  --color-brick: #7a4637;
  --color-brass: #b4834b;
  --color-mist: #e7efea;
  --color-stone: #d9d2c5;

  --font-display: "Cormorant Garamond", "Libre Baskerville", Georgia, serif;
  --font-body: "Inter", "Source Sans 3", "Montserrat", Arial, sans-serif;

  --radius-sm: 4px;
  --radius-md: 8px;
  --shadow-soft: 0 12px 30px rgba(20, 20, 20, 0.08);
  --shadow-lifted: 0 18px 45px rgba(8, 54, 61, 0.16);
}
```

## Implementation Notes For The Current Site

- Replace remote stock backgrounds in `#about`, `#contact`, and the services desktop background with local or newly sourced garment/shop imagery.
- Stop using the logo as a mobile hero background; it becomes oversized and reduces the premium/craft signal.
- Rework the homepage around a real hero with the storefront/owner image and clear CTAs.
- Reduce paragraph length in the about section and move deeper organic-cleaning detail to a secondary section or FAQ.
- Use the current teal storefront image as the color anchor for the palette.

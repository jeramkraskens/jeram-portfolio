# Jeram Kraskens — Portfolio

A single-page personal portfolio. No build step, no dependencies — plain HTML, CSS and JavaScript.

## Run it

Open `index.html` in a browser. For a local server (recommended, so fonts and assets load cleanly):

```bash
python3 -m http.server 5500     # or: npx serve .
```

Then visit `http://localhost:5500`.

## Files

```
jeram-portfolio/
├── index.html          # all page content
├── css/style.css       # theme + layout + animations
├── js/main.js          # interactions
├── assets/
│   ├── jeram.png       # portrait (transparent background)
│   └── favicon.svg
└── README.md
```

## Sections

Hero → About → Skills → Projects → Education → Contact → Footer

## Color theme

Defined once at the top of `css/style.css` under `:root`. Change these four and the whole site follows:

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#0F172A` | Page background |
| `--primary` | `#10B981` | Buttons, glows, bar fills |
| `--accent` | `#34D399` | Highlights, links, percentages |
| `--text` | `#F8FAFC` | Body text |

## Skill bars

Each bar animates its fill and counts its percentage up when it scrolls into view. The whole bar is driven by one attribute:

```html
<div class="bar" data-level="85">
  <span class="bar-label">JavaScript</span>
  <span class="bar-pct">0%</span>
  <span class="bar-track"><i></i></span>
</div>
```

Change `data-level` to any number from 0–100. Leave `bar-pct` as `0%` — JavaScript fills it in.

**The percentages I set are placeholders.** Go through and adjust them to match how you'd actually rate yourself — a recruiter will ask about anything above 80%.

To add a skill, copy one `.bar` block into the relevant `.skillgroup`. To add a whole category, copy a `.skillgroup` block.

## Orbiting tech icons

Two rings circle the portrait in opposite directions — an outer ring in front (JavaScript, React, Figma, Java, Tailwind) and an inner ring passing behind him (PHP, MySQL, Firebase, Flutter, Node.js), which gives the depth effect.

Each icon is one `.orbit-item`, positioned by its starting angle:

```html
<span class="orbit-item" style="--a:72deg">
  <span class="orbit-spin"><span class="chip" style="--c:#61DAFB">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="">
  </span></span>
</span>
```

- `--a` is where it sits on the ring. Space icons evenly: 5 icons = 0°, 72°, 144°, 216°, 288°.
- `--c` is the glow colour — use the brand colour of the tech.
- Icons come from the [devicon](https://devicon.dev) CDN. Browse there for others and swap the URL.

Ring radius and speed are in `css/style.css`: `--ra` / `--rb` under `.orbit-field`, and the `animation` durations on `.orbit-a` / `.orbit-b`. If you change a ring's duration, change its `.orbit-spin` duration to match — that's what keeps the icons upright as they travel.

The inner ring hides below 700px wide so the icons don't sit on top of the photo on phones.

To make the icons work offline, download the SVGs into `assets/icons/` and point the `src` at the local files instead.

## What else to update

**Project links** — each project links to `https://github.com/jeramkraskens`. Once the repos are public, use the direct URLs:

```html
<a class="proj-link" href="https://github.com/jeramkraskens/FuelMonitor" ...>
```

**Project bullet points** — the `.proj-points` lists describe what I inferred you built. Rewrite them in your own words; these are the lines a recruiter actually reads.

**Stats** — the four numbers under the hero use `data-to` and `data-suffix`:

```html
<b class="count" data-to="3">0</b>
```

**Rotating role text** — the `roles` array near the top of `js/main.js`.

**Resume download** — the reference site has one. To add it, drop your PDF into `assets/` and add a link in the hero:

```html
<a class="btn magnetic" href="assets/jeram-kraskens-cv.pdf" download>Download Resume</a>
```

## Contact form

The form validates input and then opens the visitor's email client with the message prefilled. That works everywhere but relies on the visitor having a mail app configured.

To receive messages directly instead, use [Formspree](https://formspree.io) (free tier):

1. Sign up, create a form, copy your endpoint URL.
2. In `index.html`, add `action` and `method` to the form tag:
   ```html
   <form class="contact-form" id="contactForm" action="https://formspree.io/f/YOUR_ID" method="POST">
   ```
3. In `js/main.js`, delete the `e.preventDefault();` line inside the submit handler (section 13) so the browser submits normally.

If you deploy to Netlify, add `netlify` to the form tag instead and it works with no third party.

## Animations

| Effect | Where |
|---|---|
| Preloader with progress counter | On load |
| Masked slide-up name reveal, staggered hero entrance | Hero |
| Typewriter cycling through your three roles | Under the name |
| Drifting particle field with connecting lines | Background |
| Animated gradient mesh | Background |
| Floating portrait, rotating ring, pulsing glow, mouse parallax | Hero |
| Two counter-rotating rings of tech icons orbiting the portrait | Hero |
| Count-up stat numbers | Stat strip |
| Scrolling tech ribbon | Below hero |
| Animated scroll hint | Bottom of hero |
| Skill bars filling with counting percentages and a travelling sheen | Skills |
| Scroll-triggered fade-up reveals | All sections |
| 3D tilt | About cards |
| Cursor spotlight | Project cards |
| Cursor-following ambient glow, magnetic buttons | Whole page |
| Scroll progress bar | Top of viewport |

All motion switches off automatically when the visitor has "reduce motion" enabled in their OS.

## Deploy

**Vercel or Netlify** — drag the folder onto the dashboard. No build command; publish directory is the root.

**GitHub Pages** — push to a repo, then Settings → Pages → deploy from `main` / root.

Before deploying, update the `og:image` and add an `og:url` meta tag in `index.html` pointing at your live domain, so link previews render properly on LinkedIn and WhatsApp.

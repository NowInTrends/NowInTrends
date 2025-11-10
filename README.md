# NowInTrends

> Signals before they settle: mapping the most consequential shifts across technology, policy, finance, and culture.

## What you get
- **Polished landing page** engineered for GitHub Pages: `https://nowintrends.github.io/NowInTrends/`
- **Markdown-native publishing** with tags, search, and responsive cards.
- **Admin console** (`admin.html`) for drafting, editing, deleting, importing, and exporting posts without a backend yet.
- **Contact form** that routes to `nowintrends.today@gmail.com` via the user’s email client.
- **Newsletter / RSS placeholder** that makes the roadmap visible while the automation layer is still pending.

## Repo layout
```
+-- index.html          # Public site
+-- admin.html          # Local admin workspace
+-- styles/main.css     # Shared styling token system
+-- scripts/
¦   +-- posts.js        # PostStore (localStorage + JSON defaults)
¦   +-- main.js         # Front-of-house interactions
¦   +-- admin.js        # Editorial workflow logic
+-- data/posts.json     # Seed content committed to the repo
+-- assets/logo.svg     # Vector logo used for favicon + UI
+-- README.md
```

## Publishing workflow
1. Open `admin.html` locally (double-click or `npx serve .` and browse).
2. Draft in Markdown, add tags, and save. Posts live in `localStorage` so you can iterate offline.
3. Hit **Export JSON** to download the current canonical list.
4. Replace `data/posts.json` with the export and commit/push to `main` for GitHub Pages.

### Editing existing posts
- Select a post from the library column to load it into the editor.
- Update details, save, and export when ready.
- Use **Delete** to drop a post from local storage (the committed JSON remains unchanged until you export + commit).

### Importing
If you collaborate across machines, import the latest `data/posts.json` first so your local store matches production.

## Contact + future growth
- Contact form opens a pre-filled email to `nowintrends.today@gmail.com`.
- Newsletter/RSS form is disabled for now but already wired into the layout; plug in your ESP or feed generator later.
- The `PostStore` class is isolated in `scripts/posts.js` so you can swap localStorage for an API call when you stand up a backend.

## Deploying to GitHub Pages
1. Push this repository to `github.com/NowInTrends/NowInTrends`.
2. In repository settings ? Pages, pick the `main` branch and `/ (root)` folder.
3. GitHub Pages will serve `index.html` at `https://nowintrends.github.io/NowInTrends/`.
4. Re-run the admin workflow whenever you have new posts, export, commit, and push.

You now have a professional, extendable publication shell ready for real-time insights.


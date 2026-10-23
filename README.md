# Katana Calderwood — portfolio site

HTML and CSS, plus one small script (`book.js`) for the page-turning books on the Architecture project pages.

## View offline
Unzip, then double-click `index.html`. Fonts load from Google Fonts, so an internet connection is needed to see the Algo(g)rave title in its intended typeface; offline, a plain condensed font is used.

## Pages
- `index.html` — home (animated name, full-bleed image)
- `architecture.html` — six projects (text + cover); each cover opens a page-turning book
  - `woodland-park-elementary-school.html` (5 pages), `ceresoma.html` and `hydrocache-hub.html` (page 1 real, pages 2–6 placeholders)
  - placeholders: `macrodosis-stage.html`, `suq-at-zouiat-ahansal.html`, `hrdc-tiny-home-village.html`
- `art-of-the-taboo.html` — project text + links; cover photo opens `algograve.html` (11 numbered photos)
- `photography.html` — 20 photos, four per screen (scroll, or use arrow/space keys, to jump screen to screen)
- `about.html` — bio, LinkedIn, email
- `style.css` — colors, fonts, layout (`--header-h` at the top of the last block controls how far down every page starts) · `book.js` — book viewer

## Copyright protection
Every real photo and project image in `images/` has ownership information embedded in the file (EXIF, IPTC and XMP): creator, "All rights reserved by Katana Calderwood", usage terms, contact e-mail and a unique image ID. All pages carry a copyright notice and a robots tag asking AI image crawlers not to use the images. Keep your original, full-resolution files; they are your strongest proof.
New images you add have no metadata until you embed it.

## Book controls
Click the arrows, click a page, or hover over the book and press Space or Return. Shift+Space (or the left arrow key) goes back.

## Adding pages to a book
Save page images in `images/` and list them in order inside `<ol class="book-pages">` in the project's HTML file. Page 1 is the cover. Set `--r` in `<main class="viewer" style="--r:1">` to page width ÷ height.
Placeholder files to replace: `<project>-cover.jpg` (shown on the Architecture page) and `<project>-02.jpg` … `-06.jpg`.

## Substack link
In `art-of-the-taboo.html`, replace `https://substack.com` with the URL of your post.

## Publish on GitHub Pages
1. Create a public repository (`YOURNAME.github.io` for a root address).
2. Upload everything in this folder to the repository root (**Add file → Upload files**).
3. **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.**

If you use a project address (`/REPO-NAME/`), change `href="/style.css"` to `href="style.css"` in `404.html`.

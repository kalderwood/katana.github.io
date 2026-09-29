# Katana Calderwood — portfolio site

Plain HTML and CSS. No JavaScript, no build step.

## Files
- `index.html` — home (large image)
- `photography.html` — photo gallery (click a photo to enlarge)
- `about.html` — bio
- `style.css` — colors, fonts, layout (settings at the top)
- `images/` — all photos (`hero.jpg` is the home image, `photo-01.jpg` to `photo-17.jpg` are the gallery)

## Publish on GitHub Pages
1. Create a new repository on github.com (public). For a site at `https://YOURNAME.github.io`, name it exactly `YOURNAME.github.io`. Any other name works too and gives `https://YOURNAME.github.io/REPO-NAME/`.
2. Upload everything in this folder to the repository root (drag and drop in the browser works: **Add file → Upload files**). Include the hidden `.nojekyll` file if your system shows it.
3. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose branch `main` and folder `/ (root)`, then **Save**.
4. Wait a minute or two. The live address appears at the top of the Pages settings.

## Editing
Change text in the `.html` files and colors or fonts in `style.css`, then commit. The site updates automatically.
Note: the 404 page assumes the site lives at the domain root. If you use a project site (`/REPO-NAME/`), change `href="/style.css"` in `404.html` to `href="style.css"`.

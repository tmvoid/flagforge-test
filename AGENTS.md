# Flag Forge — Agent Quick Reference

Three components: **Website** (`docs/`), **Extension** (`silentproxy-extension/`), **Launcher** (`silentproxy-launcher/`).
Flow: Website → Extension (content → background) → Native Messaging → Launcher → Docker Compose → 127.0.0.1 ports.

---

## Website (`docs/`)

**Run locally** (must use server, not `file://`):
```bash
python3 -m http.server 8000    # open http://localhost:8000/
```

**Test**: `npm test` — 38 tests (Node built-in runner, no browser)

**Key files**:
- `DESIGN.md` — the site's design system (tokens, mesh gradient, elevation, components). Read before restyling anything.
- `style.css` — shared system (tokens, nav, buttons, cards, footer, mesh gradient)
- `challenge.css` — challenge page on top of `style.css`
- `data/challenges.json` — challenge metadata (slugs, labs, contributors, status)
- `challenges/<slug>/README.md` — rendered as plain text (no raw HTML)
- `js/challenge.js` — renders `challenge.html` (missions, checklist, README, contributors)
- `js/home.js` — fills the homepage stat numbers
- `js/silentproxy-client.js` — shared SDK, checks extension/launcher/Docker on load
- `js/config.js` — launcher GitHub org/repo, extension store links, `chromeId`

**CSP is strict and enforced by tests** — every page carries the same policy and
`npm test` fails if any page has an inline `<script>`, a `style=` attribute, or an `on*=` handler.
`style-src 'self'` has **no `unsafe-inline`**, so `setAttribute("style", …)` is blocked in the browser.
Use a CSS class, or set a CSSOM property (`el.style.width = "50%"`), which CSP allows.

**Add a challenge**:
1. Add entry to `data/challenges.json` with `"status": "live"` and `labs` array matching `labs.json` IDs
2. Create `challenges/<slug>/README.md`
3. Add card in `jr-pentest.html` linking to `challenge.html?c=<slug>`
4. Add a `contributors` array — every challenge needs one or the data test fails

**Design rules** (from `docs/DESIGN.md`): one accent colour only (`--accent` green), the mesh gradient
never leaves hero scale, headings are sentence-case and weight 600 max, mono is for technical labels only,
card elevation is a stacked shadow + hairline ring (never one heavy drop).

**Publish on GitHub Pages**: Push `docs/`, enable Pages, build extension for that exact URL (see Extension below).

**Lab links** are only clickable for `127.0.0.1` / `localhost`.

---

## Extension (`silentproxy-extension/`)

**First-time setup**:
```bash
python3 tools/make_key.py           # prints stable Chrome extension ID; keep keys/chrome-key.pem private
```

**Build**:
```bash
# Production (GitHub Pages URL must end with /)
python3 tools/build.py --site https://<org>.github.io/<repo>/

# Local testing build (adds localhost as allowed site — NEVER ship this)
python3 tools/build.py --site https://<org>.github.io/<repo>/ --dev-site http://localhost:8000/
```

Outputs: `dist/chrome/`, `dist/firefox/`, `dist/silentproxy-extension-<browser>-<version>.zip`

**Install for testing**:
- Chrome/Edge/Brave: `chrome://extensions` → Load unpacked → `dist/chrome`
- Firefox: `about:debugging` → Load Temporary Add-on → `dist/firefox/manifest.json`

**Register with launcher** (after extension install):
```bash
silentproxy install --chrome-id <ID from make_key.py>
```

**Test**: `npm test` — 31 tests (Node built-in). Last test spawns real Python launcher (needs launcher checkout adjacent or `LAUNCHER_DIR=/path/to/silentproxy-launcher npm test`).

**Firefox signed build**: Submit `dist/silentproxy-extension-firefox-*.zip` to addons.mozilla.org as **unlisted** (free, automated).
**Chrome signed build**: Chrome Web Store ($5 one-time fee) or players load unpacked.

**Security**: Content script only runs on `--site` prefixes; background validates full URL before accepting requests. Only 8 whitelisted actions with strict field validation.

---

## Launcher (`silentproxy-launcher/`)

Pure Python 3.9+, stdlib only.

**Install (player)**:
```bash
./silentproxy-linux install                    # Firefox
./silentproxy-linux install --chrome-id <EXT_ID>  # + Chrome/Chromium/Edge/Brave
./silentproxy-linux doctor                     # checks Docker + Compose v2.17+
# Or from source:
python -m silentproxy install
```

**CLI** (easiest way to test without extension):
```bash
silentproxy doctor | list | status
silentproxy start <lab> [--replace]   stop <lab>   stop-all   extend <lab> <hours>   purge
```

**Test**: `python -m unittest discover -s tests -t .` — 46 tests (uses `tests/fake_docker.py`, no Docker needed)

**Dev mode** (for local development only):
```bash
export SILENTPROXY_DEV=1
# Enables:
#   SILENTPROXY_REGISTRY    — file path or URL for labs.json
#   SILENTPROXY_DOCKER_BIN  — custom docker binary
#   Non-GitHub download hosts
export SILENTPROXY_HOME=/custom/path   # relocates data dir (works in any mode)
```

**Before first release**: Edit `REGISTRY_URL` / `ALLOWED_URL_PREFIXES` in `silentproxy/config.py` to the real GitHub org/repo. Tag `vX.Y.Z` to build binaries via `.github/workflows/release.yml`.

**Package a lab**:
```bash
python tools/package_lab.py labs/mission-1-recon --id mission-1-recon --version 1.0.0 \
  --base-url https://github.com/<org>/<repo>/releases/download/mission-1-recon-v1.0.0 \
  --title "Mission 1: Setup & Recon" --port "MegaCorp portal:8081" --validate
```
Updates `labs.json` with checksum/size. Upload zip to that GitHub Release, commit `labs.json`.

**Lab compose rules**: All ports must be `127.0.0.1:<host>:<container>` and declared in `labs.json`. Policy (`policy.py`) rejects: privileged, host net/pid/ipc, extra caps, devices, unconfined profiles, non-127.0.0.1 ports, bind mounts outside lab folder, docker.sock, external build contexts/networks/volumes.

---

## Deployment

**Live site:** https://tmvoid.github.io/flagforge-test/

`tmvoid/flagforge-test` is a **fork** of `srinishbasu-cmd/flagforge-test`. You have push rights on the fork
and pull-only on upstream.

- **Pages**: enabled on the fork, deploys from `main` → `/docs`. Pushing to `main` rebuilds it automatically.
- **Lab catalogue**: the launcher reads `labs.json` from **upstream** (`srinishbasu-cmd`) via `REGISTRY_URL` in
  `silentproxy/config.py`. Lab zips live in upstream releases. Don't repoint these at the fork.
- **Launcher binaries + extension**: built by `.github/workflows/launcher-release.yml`. The release gets all three
  launcher binaries plus `docs/downloads/silentproxy-firefox.xpi`.
  **Cutting a release:** `git tag launcher-v0.1.0 && git push origin launcher-v0.1.0` — the tag push is the normal
  path and it publishes. `gh workflow run launcher-release.yml -f tag=launcher-v0.1.0` is the fallback, and the tag
  must already exist on the remote.
- **Extension site binding**: the extension only runs on the URL it was built for. `tools/build.py`'s `DEFAULT_SITE`
  is the live site. After changing it, rebuild and copy `dist/silentproxy-extension-firefox-*.zip` back to
  `docs/downloads/silentproxy-firefox.xpi`.
- **CI**: `.github/workflows/ci.yml` runs the website, extension and launcher suites on every push to `main` and on
  every pull request. The website suite is what enforces the strict CSP — don't merge without it.
- **Chrome extension ID**: `enekoeifnnaobnefccfijkkdbnaleleg`, from `keys/chrome-key.pem` (gitignored, private).
  `keys/chrome-key.pub.b64` is committed, so the ID is reproducible. Losing the `.pem` changes the ID and every
  player's `install --chrome-id`.
- **The Firefox `.xpi` is unsigned.** Firefox's *Load Temporary Add-on* accepts it, but a permanent install needs an
  addons.mozilla.org submission (unlisted, free) — only the repo owner can do that.

---

## Common Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| Website loads but "extension not detected" | Opened via `file://` | Use `python3 -m http.server 8000` |
| Extension install fails "host forbidden" | Chrome ID not registered | Run `silentproxy install --chrome-id <ID>` |
| Launcher "docker permission" error | User not in `docker` group | `sudo usermod -aG docker $USER && newgrp docker` |
| Tests fail "launcher not found" | Last extension test needs launcher | Set `LAUNCHER_DIR` or place launcher checkout next to extension |
| Build warns "no chrome-key.pub.b64" | `make_key.py` never run | Run `python3 tools/make_key.py` once |
| Local build doesn't work on prod site | `--dev-site` only allows localhost | Use separate production build without `--dev-site` |
| Launcher tests fail with `DOCKER_NOT_FOUND` | `tests/fake_docker.py` lost its executable bit | `chmod +x silentproxy-launcher/tests/fake_docker.py` |
| URL-allowlist test fails after moving the repo | test hardcodes an org name | Derive from `config.ALLOWED_URL_PREFIXES`, don't hardcode |

---

## Command Cheatsheet

```bash
# Website
cd docs && npm test
cd docs && python3 -m http.server 8000

# Extension
cd silentproxy-extension
python3 tools/make_key.py
python3 tools/build.py --site https://.../ --dev-site http://localhost:8000/
npm test
LAUNCHER_DIR=../silentproxy-launcher npm test   # full chain test

# Launcher
cd silentproxy-launcher
python -m unittest discover -s tests -t .
SILENTPROXY_DEV=1 python -m silentproxy doctor
python tools/package_lab.py ... --validate
```

---

## Architecture Notes (Not Obvious from Filenames)

- **Extension ID stability**: Chrome ID comes from `keys/chrome-key.pem` (generated by `make_key.py`). Firefox ID is hardcoded to `silentproxy-launcher@operationsilentproxy.local` in both `tools/build.py` and launcher `config.py` — keep in sync.
- **Single lab at a time**: Launcher enforces `MAX_RUNNING_LABS = 1`. Starting another prompts for replacement.
- **TTL enforcement**: Labs auto-stop after `ttl_hours` via detached reaper process (survives browser/extension close).
- **Lab catalogue**: `labs.json` is fetched from `REGISTRY_URL` at runtime. Zips downloaded from GitHub Releases, SHA-256 verified.
- **No hostnames in /etc/hosts**: Mission 1 teaches players to use Burp's hostname-resolution setting for `portal.megacorp.local` etc.
- **SDK shared**: `silentproxy-extension/sdk/silentproxy-client.js` is copied to `docs/js/silentproxy-client.js` — keep in sync.
- **Release assets**: `.github/workflows/launcher-release.yml` (repo root, not in the launcher folder) publishes the three
  launcher binaries **and** `docs/downloads/silentproxy-firefox.xpi`. The site's `js/config.js` download URLs point at that release.
- **No build step for the site**: `docs/` is plain HTML/CSS/JS on GitHub Pages. There is no bundler, no npm dependencies,
  and no web fonts — everything is a system font stack, because the CSP forbids remote assets.
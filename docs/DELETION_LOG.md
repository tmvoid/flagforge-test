# Code Deletion Log

A record of dead code removed from the Flag Forge repository, and of duplications that were consolidated.

---

## [2026-10-22] Refactor Session

Branch: `refactor/dead-code-cleanup` (from `main` at `e7eb44a`)

### Unused Dependencies Removed

None. Neither package declares runtime dependencies — `docs/package.json` and
`silentproxy-extension/package.json` have no `dependencies` block, and the launcher is
Python 3.9+ standard library only. `npx depcheck` found nothing to remove.

### Unused Imports Removed

| File | Removed | Reason |
|---|---|---|
| `silentproxy-launcher/silentproxy/manager.py:7` | `import os` | `os` never referenced in the module |
| `silentproxy-launcher/silentproxy/install.py:5` | `import os` | `os` never referenced in the module |
| `silentproxy-launcher/tests/test_host_e2e.py:3` | `import os` | `os` never referenced in the module |
| `silentproxy-launcher/tests/test_host_e2e.py:8` | `import threading` | `threading` never referenced in the module |
| `silentproxy-launcher/tests/test_units.py:14` | `GOOD_COMPOSE` | imported but never used; `tests/test_manager.py` is the only file that needs it |

### Unused Functions Removed

| File | Symbol | Reason |
|---|---|---|
| `silentproxy-launcher/silentproxy/reaper.py:27` | `pid_alive()` | Zero references. TTL expiry is decided from `state.snapshot()["labs"][id]["expires_at"]`, not from a process probe. The function also carried a Windows-only `ctypes` block that nothing exercised. |
| `silentproxy-launcher/silentproxy/docker.py:100` | `Docker._ok()` | Zero references. Every caller (`up`, `down`, `doctor`) runs a command through `Docker.run()` and checks `returncode` itself, raising `classify(...)` or a `LabError` directly. |

### Unused Exports Removed

| File | Symbol | Reason |
|---|---|---|
| `docs/tests/minidom.js:36` | `El`, `Text` | Exported but never imported. `markdown.test.js` and `page.test.js` only import `makeDoc`; both classes stay in the file because `makeDoc` builds them internally. |

### Unused Parameters Removed

| File | Symbol | Reason |
|---|---|---|
| `docs/js/challenge.js:509` | `renderChallenge(ch, data, ctlFactory)` | The `data` parameter was never read inside the function — the challenge object `ch` already carries everything the renderer needs. The only caller, `init()`, now passes `renderChallenge(ch, ctlFactory)`. |

### Unused CSS Removed

| File | Rule | Reason |
|---|---|---|
| `docs/style.css:159` | `.section-tight` | No `class="section-tight"` in any page, and no other selector in either stylesheet referenced it. Scanned all 181 class selectors in `style.css` + `challenge.css` against every HTML/JS/Python file in the repo; this was the only orphan. |

### Unused Files Deleted

| File | Reason |
|---|---|
| `HOW-TO-APPLY.txt` | One-off manual instructions for a single developer ("Unzip this INTO … C:\Users\Srinish Basu\Desktop\ctf_trial\flagforge-test"). Every change it lists is already committed to the repo, and its final line tells you to delete `silentproxy-launcher/.github\workflows\release.yml` — a file that no longer exists. Nothing in the repo referenced it. |
| `silentproxy-launcher/silentproxy-windows.spec` | An unreferenced second PyInstaller build definition. The only build path is `.github/workflows/launcher-release.yml`, which builds `packaging/entry.py` with explicit CLI flags. This spec was never run, pinned `name='silentproxy-windows'` (so it could not build the Linux or macOS binaries), enabled `upx=True` (UPX is not installed anywhere in the project), and would silently drift from the real build. |

### Duplicate Code Consolidated

**The SDK existed twice, byte for byte.**

`silentproxy-extension/sdk/silentproxy-client.js` and `docs/js/silentproxy-client.js` were
identical 79-line files. The site is a plain static site on GitHub Pages with no build
step, so it must ship its own copy — but the copy was maintained by hand, and only a
test caught the drift *after* the fact.

- `silentproxy-extension/sdk/silentproxy-client.js` is now the single canonical source.
- New `silentproxy-extension/tools/sync_sdk.py` copies it to `docs/js/silentproxy-client.js`.
- `silentproxy-extension/tools/build.py` calls that sync on every build, so the copy can
  no longer be forgotten during a release.
- `docs/tests/site.test.js` still fails if the two ever differ, so a stale copy cannot ship.

Verified end to end: appending a line to `docs/js/silentproxy-client.js` makes the website
suite fail (`the bundled SDK is the extension SDK (same file)`), and one run of
`tools/sync_sdk.py` makes it pass again.

**Not consolidated (deliberately).** `h()`, `clear()`, `$()` and the duration formatter are
implemented twice — in `docs/js/challenge.js` for the website and in
`silentproxy-extension/src/popup.js` for the extension popup. They are near-identical but
not equal (the popup sets `class` via `className`, the site via `setAttribute`, and only
the site supports the `text` property), and they sit on opposite sides of a runtime
boundary: the site has no bundler, and the popup talks to the background over
`runtime.connect` while the SDK talks to the page over `postMessage`. Merging them would
mean loading the page-side SDK into the extension popup for no benefit. Flagged for
review rather than changed.

### Documentation Corrected

| File | Change |
|---|---|
| `silentproxy-launcher/README.md:114` | Claimed "37 tests"; the launcher suite runs 46. |
| `AGENTS.md` | The "SDK shared" note now describes the automatic copy instead of "keep in sync". |
| `docs/README.md` | The republish steps mention that `tools/build.py` syncs the SDK. |

### Impact

| Measure | Before | After |
|---|---|---|
| Files deleted | — | 2 |
| Files added | — | 1 (`tools/sync_sdk.py`, 32 lines) |
| Functions removed | — | 2 (`pid_alive`, `Docker._ok`) |
| Imports removed | — | 5 |
| Exports removed | — | 2 (`El`, `Text`) |
| CSS rules removed | — | 1 |
| Unused parameters removed | — | 1 |
| Lines added | — | 46 |
| Lines deleted | — | 98 |
| Net line change | — | **−52** |
| Duplicated files kept in sync by hand | 1 | 0 (now automated) |

No public API was removed. `renderChallenge()` changed shape, but it is an internal helper
of `docs/js/challenge.js` with a single caller, and the module's other exports
(`init`, `detectOS`, `installCommands`, `fmtLeft`) are unchanged.

### Testing

| Suite | Command | Result |
|---|---|---|
| Website | `cd docs && npm test` | **38 / 38 pass** (run 4×, including 3 consecutive repeat runs) |
| Extension | `cd silentproxy-extension && npm test` | **31 / 31 pass** (includes the full chain test that spawns the real Python launcher) |
| Launcher | `cd silentproxy-launcher && python -m unittest discover -s tests -t .` | **46 / 46 pass** |
| **Total** | | **115 / 115 pass** — same as the pre-cleanup baseline |

Additional verification:

- **Browser smoke test** (`python3 -m http.server`, real Chromium): `challenge.html?c=burp-suite`
  renders with title `Burp Suite-CTF · Flag Forge`, 6 mission rows, 3 checklist items,
  8 panels, 87 rendered README nodes, 1 contributor card, dark theme background
  `rgb(6, 8, 10)` intact, `window.FF` and `window.SilentProxy` both defined, and **zero
  console warnings or errors**. `index.html` renders with the stat counters populated
  (1 CTF, 6 missions) and no console output.
- **Static analysis re-run after the cleanup**: `knip` reports no unused exports in
  `docs/`; the AST scan of the launcher reports no unreferenced module-level symbols and
  no unused imports; the CSS scan reports no orphaned class selectors.
- **`pyflakes` on the launcher**: 8 findings before the cleanup, 3 after. The 5 that were
  fixed are exactly the unused imports listed above. The 3 that remain are pre-existing and
  in files this session did not touch — `tests/test_windows.py:26` (`outer`),
  `tests/test_units.py:129` (`config` shadowed by a loop variable) and
  `tests/helpers.py:36` (`handler`). They are in test scaffolding rather than shipped
  code, and are listed here rather than fixed to keep this session's diff scoped to
  dead code.
- `knip`'s remaining "unused files" entries are false positives — it does not read
  `<script src>` tags in HTML (`docs/js/config.js`, `home.js`, `silentproxy-client.js`) nor
  the extension's `FILES` manifest in `tools/build.py` (`src/*.js`).

### Remaining (manual review needed)

These were left in place on purpose. Each is a value that is written but never read by
the website UI. They are part of the controller's public `state` object and several are
asserted by `docs/tests/controller.test.js`, so removing them means narrowing a public
data shape and editing tests — a product decision, not a mechanical cleanup.

| Location | Field | Notes |
|---|---|---|
| `docs/js/controller.js:98` | `L.services` | Written from the launcher's `status` payload, read by nobody in the site. The extension popup does render `lab.services` (`silentproxy-extension/src/popup.js:79`), so the launcher field itself is live. |
| `docs/js/controller.js:135` | `L.ready` | Written from `res.ready`, read by nobody. The `ctl.ready()` method is a different thing — it reports setup readiness. |
| `docs/js/controller.js:86` | `state.notice` | Set when `sp.status()` throws. The UI never renders it, so a failed status poll is currently silent. Removing it changes nothing visible; **surfacing** it would be an improvement worth raising separately. |
| `docs/js/controller.js:104` | `state.others` | "Running labs belonging to a different challenge". Asserted by `controller.test.js:147,151`, never rendered. Looks like a feature that was planned but never wired into the UI. |
| `docs/js/controller.js:124-138` | `L.progress` | Download/start progress. Asserted by `controller.test.js:65`, never rendered — the UI shows a generic "Starting…" badge instead. |

Also flagged, not changed:

| Location | Item | Notes |
|---|---|---|
| `DESIGN.md` (repo root) | 736-line light-mode design analysis | Unreferenced by any code or doc. `docs/DESIGN.md` is the design system actually implemented and is what `docs/style.css`, `docs/challenge.css` and `docs/README.md` point at. The root file describes a light-mode Vercel palette that the shipped dark theme does not use. Kept as the design inspiration it was written as — safe to delete if the team agrees it has no reference value. |
| `silentproxy-extension/tools/make_icons.py` | One-off Pillow icon generator | Not referenced anywhere; the generated PNGs are committed under `src/icons/`. Kept because it documents how the icons were produced. |
| `silentproxy-launcher/examples/demo-lab/` | Nginx lab for real-Docker smoke testing | Documented in `silentproxy-launcher/README.md:131`. Kept. |
| `silentproxy-extension/examples/test-page.html` | Manual extension test page | Documented in `silentproxy-extension/README.md:75`. Kept. |
| `silentproxy-launcher/silentproxy/config.py` vs `silentproxy-extension/tools/build.py` | `FIREFOX_EXTENSION_ID` / `GECKO_ID` | The same extension id is written down in two languages. `AGENTS.md` already calls out that they must be kept in sync; a cross-language constant cannot be shared without a generated file. |
| `silentproxy/v1` protocol namespace | `NS` in `docs/js/silentproxy-client.js`, `sdk/silentproxy-client.js`, `src/common.js` and `PROTOCOL_VERSION` in `silentproxy/protocol.py` | Same value in four places across two languages. Not shared for the same reason as above. |

### How the removals were verified

Before deleting anything, each candidate was checked with: an AST/symbol scan of the whole
repository (not just the defining file), a literal `grep` for the identifier including
attribute and string forms, a check that the symbol is not reached by a framework callback
(`unittest` discovers `setUp` / `test_*` by name), a check that it is not loaded through a
`<script src>` tag or a build manifest, and a check that no test depended on it. Every
removal was committed on its own, with the full test suite re-run between batches.

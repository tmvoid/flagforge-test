/* Renders challenge.html?c=<slug> from data/challenges.json + the challenge's README.md.
   All text goes through textContent / text nodes; nothing from the data files is parsed as HTML.
   No inline style attributes are used: the page runs under a strict CSP (style-src 'self'). */
(function (root, factory) {
	if (typeof module === "object" && module.exports) { module.exports = factory; return; }
	const FF = (root.FF = root.FF || {});
	FF.createPage = factory;
	const doc = root.document;
	if (doc && doc.getElementById("app")) {
		FF.createPage({
			document: doc, location: root.location, navigator: root.navigator, fetch: root.fetch.bind(root),
			config: root.FLAGFORGE, md: FF.md, createController: FF.createController, sp: root.SilentProxy,
			setInterval: root.setInterval.bind(root), setTimeout: root.setTimeout.bind(root), addEventListener: root.addEventListener.bind(root),
		}).init();
	}
})(typeof window !== "undefined" ? window : globalThis, function createPage(env) {
	"use strict";
	const doc = env.document;
	const CFG = env.config;

	function h(tag, props, ...kids) {
		const el = doc.createElement(tag);
		for (const [k, v] of Object.entries(props || {})) {
			if (v === undefined || v === null || v === false) continue;
			if (k === "text") el.textContent = v;
			else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
			else el.setAttribute(k, v === true ? "" : String(v));
		}
		for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(typeof kid === "object" ? kid : doc.createTextNode(String(kid)));
		return el;
	}
	const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); };
	const $ = (id) => doc.getElementById(id);

	/* ── OS detection ─────────────────────────────────────────── */
	function detectOS() {
		const nav = env.navigator || {};
		const s = String((nav.userAgentData && nav.userAgentData.platform) || nav.platform || nav.userAgent || "").toLowerCase();
		if (s.includes("win")) return "windows";
		if (s.includes("mac") || s.includes("iphone") || s.includes("ipad")) return "macos";
		return "linux";
	}
	const OS_LABEL = { linux: "Linux", macos: "macOS", windows: "Windows" };

	/** The exact shell commands a player runs to wire the launcher up on each OS. */
	function installCommands(os) {
		const f = CFG.launcher.fileNames[os];
		let firefox;
		if (os === "windows") firefox = ".\\" + f + " install";
		else if (os === "macos") firefox = "xattr -d com.apple.quarantine " + f + " 2>/dev/null; ./" + f + " install";
		else firefox = "./" + f + " install";
		const chromeId = (CFG.extension && CFG.extension.chromeId) || "";
		const chrome = "silentproxy install --chrome-id " + (chromeId || "<extension-id>");
		return { firefox, chrome };
	}

	/* ── Small helpers ────────────────────────────────────────── */
	function copyButton(text) {
		const b = h("button", { type: "button", class: "btn-ghost copy", text: "Copy" });
		b.addEventListener("click", async () => {
			try { await env.navigator.clipboard.writeText(text); b.textContent = "Copied!"; } catch (_e) { b.textContent = "Error"; }
			if (env.setTimeout) env.setTimeout(() => { b.textContent = "Copy"; }, 1500);
		});
		return b;
	}

	function initials(name) {
		const parts = String(name || "").trim().split(/\s+/).filter((w) => w && /[A-Za-z0-9]/.test(w[0]));
		return parts.slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
	}

	const HANDLE_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
	function safeHandle(v) {
		const s = String(v || "").trim();
		return HANDLE_RE.test(s) ? s : "";
	}
	function safePhoto(v) {
		const s = String(v || "").trim();
		if (!s || !/^[\w./-]+$/.test(s) || s.includes("..")) return "";
		return s;
	}

	const fmtLeft = (ms) => {
		const m = Math.max(0, Math.floor(ms / 60000));
		return Math.floor(m / 60) + "h " + String(m % 60).padStart(2, "0") + "m left";
	};

	function titleParts(title) {
		const t = String(title || "");
		const i = t.indexOf("-CTF");
		if (i === -1) return [t];
		return [t.slice(0, i), h("span", { class: "title-suffix", text: t.slice(i) })];
	}

	/* ── Terminal ─────────────────────────────────────────────── */
	function terminalBox(lines) {
		return h("div", { class: "terminal" },
			h("div", { class: "terminal-header" },
				h("div", { class: "terminal-dots", "aria-hidden": "true" }, h("i"), h("i"), h("i")),
				h("span", { class: "terminal-title", text: "~/flagforge" })
			),
			h("div", { class: "terminal-body" }, lines)
		);
	}
	function termLine(cls, text) {
		return h("span", { class: "terminal-line" }, h("span", { class: cls, text }));
	}

	/* ── Checklist (setup status) ─────────────────────────────── */
	function check(status, title, detail, extra) {
		const sym = { ok: "✓", bad: "!", wait: "…", idle: "·" }[status] || "·";
		return h("li", { class: "check" },
			h("span", { class: "dot " + status, "aria-hidden": "true", text: sym }),
			h("div", { class: "check-body" },
				h("div", { class: "check-title", text: title }),
				detail ? h("div", { class: "check-detail", text: detail }) : null,
				extra || null
			)
		);
	}

	function setupList(ctl) {
		const s = ctl.state.setup;
		const stat = (v) => (v === "ok" ? "ok" : v === "missing" || v === "bad" ? "bad" : v === "checking" ? "wait" : "idle");
		const items = [];
		items.push(check(stat(s.ext), "Browser extension",
			s.ext === "ok" ? "Detected" : s.ext === "checking" ? "Checking…" : s.reload ? "Reload the page." : "Not detected. Install it below."));
		items.push(check(stat(s.host), "Launcher app",
			s.host === "ok" ? "Connected" + (s.launcherVersion ? " (v" + s.launcherVersion + ")" : "") : s.host === "checking" ? "Checking…" : s.host === "missing" ? "Not found. Download it below." : "Waiting for extension.",
			s.host === "missing" && s.error ? h("div", { class: "check-hint", text: (s.error.message || "") + " " + (s.error.hint || "") }) : null));
		items.push(check(stat(s.docker), "Docker",
			s.docker === "ok" ? "Ready" : s.docker === "checking" ? "Checking…" : s.docker === "bad" ? "Not ready." : "Waiting.",
			s.docker === "bad" && s.error ? h("div", { class: "check-hint", text: (s.error.message || "") + " " + (s.error.hint || "") }) : null));
		return h("ol", { class: "checklist" }, items);
	}

	/* ── Error surfaces ───────────────────────────────────────── */
	function errorBox(err) {
		if (!err) return null;
		return h("div", { class: "alert alert-err", role: "alert" },
			h("strong", { text: err.message }),
			err.hint ? h("div", { class: "alert-hint", text: err.hint }) : null,
			err.problems && err.problems.length ? h("ul", { class: "alert-list" }, err.problems.map((p) => h("li", { text: p }))) : null,
			err.code ? h("div", { class: "alert-code mono", text: "Error code: " + err.code }) : null
		);
	}

	/* ── Flag submission (per mission) ────────────────────────── */
	function flagStore(key) {
		let mem = [];
		const ls = (function () {
			try { return env.localStorage || (typeof localStorage !== "undefined" ? localStorage : null); }
			catch (_e) { return null; }
		})();
		return {
			read() { try { return ls ? JSON.parse(ls.getItem(key) || "[]") : mem; } catch (_e) { return []; } },
			write(list) { mem = list; try { if (ls) ls.setItem(key, JSON.stringify(list)); } catch (_e) { /* ignore */ } },
		};
	}

	function flagPanel(lab) {
		const total = (lab.flags_list || []).length;
		if (!total) return null;
		const store = flagStore("ff_flags_" + lab.id);
		const found = new Set(store.read());

		const input = h("input", { type: "text", class: "form-input", placeholder: "FLAG{...}", "aria-label": "Submit a flag" });
		const msg = h("div", { class: "flag-msg", role: "status" });
		const countText = h("span", { class: "mono", text: found.size + "/" + total + " flags" });
		const percentText = h("span", { class: "mono flag-percent", text: Math.round((found.size / total) * 100) + "%" });
		const progressFill = h("div", { class: "flag-progress-fill" });
		progressFill.style.width = Math.round((found.size / total) * 100) + "%";

		const submit = h("button", { type: "button", class: "btn-primary small", text: "Submit flag" });

		function handleSubmit() {
			const val = input.value.trim();
			if (!val) return;
			msg.className = "flag-msg";
			if (found.has(val)) {
				msg.className = "flag-msg info";
				msg.textContent = "You already submitted this flag.";
				return;
			}
			if (lab.flags_list.includes(val)) {
				found.add(val);
				store.write([...found]);
				const pct = Math.round((found.size / total) * 100);
				countText.textContent = found.size + "/" + total + " flags";
				percentText.textContent = pct + "%";
				progressFill.style.width = pct + "%";
				msg.className = "flag-msg success";
				msg.textContent = found.size === total ? "Mission complete." : "Correct. Flag accepted.";
				input.value = "";
			} else {
				msg.className = "flag-msg error";
				msg.textContent = "Incorrect flag. Keep trying.";
			}
		}

		submit.addEventListener("click", handleSubmit);
		input.addEventListener("keypress", (e) => { if (e.key === "Enter") handleSubmit(); });

		return h("div", { class: "flag-box" },
			h("div", { class: "flag-head" },
				h("span", { class: "eyebrow", text: "FLAG RECOVERY" }),
				countText
			),
			h("div", { class: "flag-progress" }, h("div", { class: "flag-progress-track" }, progressFill), percentText),
			h("div", { class: "flag-input-row" },
				h("span", { class: "flag-prompt mono", text: "$" }),
				input,
				submit
			),
			msg
		);
	}

	/* ── Panels ───────────────────────────────────────────────── */
	function briefingPanel(ch) {
		if (!ch.briefing) return null;
		const b = ch.briefing;
		const intro = h("div", { class: "briefing-intro" }, (b.intro || []).map((p) => h("p", { text: p })));
		const setup = h("ol", { class: "briefing-list" }, (b.setup || []).map((s) => h("li", { text: s })));
		const hints = h("ul", { class: "briefing-list" }, (b.hints || []).map((hi) => h("li", {},
			h("span", { class: "badge mono", text: hi.unlocksAfter }), " " + hi.text)));

		return h("section", { class: "panel", id: "briefing" },
			h("div", { class: "panel-head" },
				h("h2", { text: "Briefing" }),
				h("span", { class: "panel-sub", text: "Mission context and objectives" })
			),
			intro,
			h("details", { class: "disclosure" },
				h("summary", { text: "Setup guide" }),
				setup
			),
			h("details", { class: "disclosure" },
				h("summary", { text: "Hints" }),
				hints
			)
		);
	}

	function objectiveList(lab) {
		const list = lab.objectives || [];
		if (!list.length) return null;
		return h("ol", { class: "objectives" }, list.map((o) =>
			h("li", { class: "objective" },
				h("span", { class: "objective-n mono", text: String(o.n).padStart(2, "0") }),
				h("div", {},
					h("div", { class: "objective-title", text: o.title }),
					h("div", { class: "objective-task", text: o.task })
				)
			)
		));
	}

	function missionPanel(ch, ctl) {
		const container = h("section", { class: "panel", id: "launch" });

		const render = () => {
			clear(container);
			const missions = h("div", { class: "mission-list" });

			ch.labs.forEach((lab, index) => {
				const L = ctl.state.labs[lab.id];
				const running = L.status === "running";
				const starting = L.status === "starting";

				let controls;
				if (starting) {
					controls = h("div", { class: "mission-side" },
						h("span", { class: "badge live" }, h("span", { class: "live-dot animate" }), "Starting…"));
				} else if (running) {
					const urls = L.urls || [];
					const mainUrl = urls.find((u) => u.link) || urls[0];
					const otherUrls = urls.filter((u) => u !== mainUrl);

					controls = h("div", { class: "mission-side" },
						h("span", { class: "badge live" }, h("span", { class: "live-dot" }), "Running"),
						h("span", { class: "mono mission-ttl", "data-expires": L.expiresAt, text: fmtLeft(L.expiresAt - Date.now()) }),
						mainUrl ? h("a", { class: "btn-primary small", href: mainUrl.url, target: "_blank", rel: "noopener noreferrer", text: "Open " + mainUrl.name }) : null,
						h("div", { class: "mission-actions" },
							h("button", { type: "button", class: "btn-ghost", text: "+1 hour", onclick: () => ctl.extend(lab.id, 1) }),
							h("button", { type: "button", class: "btn-danger", text: "Stop lab", onclick: () => ctl.stop(lab.id) })
						),
						otherUrls.length ? h("details", { class: "disclosure compact" },
							h("summary", { text: "All services" }),
							h("div", { class: "service-list" }, otherUrls.map((u) =>
								u.link ? h("a", { href: u.url, target: "_blank", rel: "noopener noreferrer", text: u.name }) : h("span", { text: u.name })
							))
						) : null
					);
				} else {
					controls = h("div", { class: "mission-side" },
						h("button", { type: "button", class: "btn-primary", text: "▶ Start lab", disabled: !ctl.ready(), onclick: () => ctl.start(lab.id) })
					);
				}

				const row = h("div", { class: "mission" + (running ? " running" : "") },
					h("div", { class: "mission-num mono", text: String(index + 1).padStart(2, "0") }),
					h("div", { class: "mission-main" },
						h("h3", { class: "mission-title", text: lab.title }),
						h("p", { class: "mission-summary", text: lab.summary }),
						objectiveList(lab),
						errorBox(L.error)
					),
					controls
				);

				if (running) row.append(flagPanel(lab));
				missions.append(row);
			});

			const conflict = ctl.state.conflict;
			if (conflict) {
				missions.append(h("div", { class: "alert alert-warn", role: "alert" },
					h("strong", { text: "Another lab is already running." }),
					h("div", { class: "alert-hint", text: "Running now: " + (conflict.running || []).join(", ") }),
					h("div", { class: "alert-actions" },
						h("button", { type: "button", class: "btn-primary small", text: "Stop it and start", onclick: () => ctl.start(conflict.labId, { replace: true }) }),
						h("button", { type: "button", class: "btn-ghost", text: "Keep it running", onclick: () => ctl.dismissConflict() })
					)
				));
			}

			container.append(
				h("div", { class: "panel-head panel-head-row" },
					h("div", {},
						h("h2", { text: "Missions" }),
						h("span", { class: "panel-sub", text: "Progress through the operation" })
					),
					h("span", { class: "mono panel-count", text: String(ch.labs.length).padStart(2, "0") + " missions" })
				)
			);
			container.append(missions);
		};

		ctl.onChange(render);
		render();
		return container;
	}

	function aboutPanel(ch) {
		const list = (title, items) => items && items.length
			? [h("h3", { class: "panel-h3", text: title }), h("ul", { class: "plain-list" }, items.map((t) => h("li", { text: t })))]
			: [];
		return h("section", { class: "panel", id: "about" },
			h("div", { class: "panel-head" },
				h("h2", { text: "About this lab" }),
				h("span", { class: "panel-sub", text: ch.tool || "" })
			),
			(ch.description || []).map((p) => h("p", { class: "panel-p", text: p })),
			list("What you will practise", ch.learn),
			list("What you need", ch.requirements)
		);
	}

	function readmePanel(ch) {
		const body = h("div", { class: "markdown", id: "readme-body" }, h("p", { class: "muted", text: "Loading README…" }));
		const panel = h("section", { class: "panel", id: "readme" },
			h("div", { class: "panel-head" },
				h("h2", { text: "README" }),
				h("span", { class: "panel-sub", text: "Full brief and rules" })
			),
			body);
		env.fetch(ch.readme)
			.then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
			.then((md) => { clear(body); env.md.renderInto(body, md, doc); })
			.catch(() => { clear(body); body.append(h("p", { class: "muted", text: "The README could not be loaded." })); });
		return panel;
	}

	function contributorsPanel(ch) {
		const people = (ch.contributors || []).map((p) => {
			const handle = safeHandle(p.github);
			const photo = safePhoto(p.photo);

			const avatar = photo
				? h("img", { class: "avatar", src: photo, alt: p.name, width: "40", height: "40" })
				: h("span", { class: "avatar", text: initials(p.name) });

			const body = h("div", { class: "person-body" },
				h("span", { class: "person-name", text: p.name }),
				p.role ? h("span", { class: "person-role", text: p.role }) : null
			);

			const children = [];
			if (handle) {
				children.push(h("a", { class: "person-link", href: "https://github.com/" + handle, target: "_blank", rel: "noopener noreferrer" },
					avatar, body));
			} else {
				children.push(avatar, body);
			}
			return h("div", { class: "person" }, children);
		});

		if (!people.length) return null;
		return h("section", { class: "panel", id: "contributors" },
			h("div", { class: "panel-head" },
				h("h2", { text: "Contributors" }),
				h("span", { class: "panel-sub", text: "Who built this lab" })
			),
			h("div", { class: "people-grid" }, people)
		);
	}

	/* ── Sidebar ──────────────────────────────────────────────── */
	function asidePanels(ch, ctl, os) {
		const cmds = installCommands(os);

		const setupBox = h("div");
		const renderSetup = () => { clear(setupBox); setupBox.append(setupList(ctl)); };
		ctl.onChange(renderSetup);
		renderSetup();

		const osButtons = Object.keys(OS_LABEL).map((k) =>
			h("button", { type: "button", class: "tab" + (k === os ? " active" : ""), text: OS_LABEL[k] })
		);

		const firefoxUrl = String(CFG.extension.firefox || "");
		const chromeUrl = String(CFG.extension.chrome || "");
		const isXpi = /\.xpi(\?|#|$)/i.test(firefoxUrl);

		return [
			h("section", { class: "panel side-panel" },
				h("div", { class: "panel-head" },
					h("h2", { text: "Setup status" }),
					h("span", { class: "panel-sub", text: "Check your environment" })
				),
				setupBox,
				h("button", { type: "button", class: "btn-ghost side-check", text: "Check again", onclick: () => ctl.checkSetup() })
			),
			h("section", { class: "panel side-panel" },
				h("div", { class: "panel-head" },
					h("h2", { text: "Get the launcher" }),
					h("span", { class: "panel-sub", text: "Connect to the challenge environment" })
				),
				h("div", { class: "tab-row" }, osButtons),
				terminalBox([
					termLine("p", "$ " + cmds.firefox),
					termLine("out", "# registers the browser extension id"),
					termLine("p", "$ " + cmds.chrome)
				]),
				h("a", { class: "btn-primary side-download", href: CFG.launcher.downloads[os], text: "Download launcher for " + OS_LABEL[os] })
			),
			h("section", { class: "panel side-panel" },
				h("div", { class: "panel-head" },
					h("h2", { text: "Browser extension" }),
					h("span", { class: "panel-sub", text: "Control the lab from the page" })
				),
				h("div", { class: "ext-buttons" },
					h("a", { class: "btn-secondary small", href: firefoxUrl, ...(isXpi ? {} : { target: "_blank", rel: "noopener noreferrer" }), text: "Firefox" }),
					h("a", { class: "btn-secondary small", href: chromeUrl, target: "_blank", rel: "noopener noreferrer", text: "Chrome / Edge / Brave" })
				),
				h("p", { class: "side-note", text: "Firefox: open about:debugging, choose Load Temporary Add-on, pick the manifest.json, then Click Allow, then Add." })
			)
		];
	}

	/* ── Page shell ───────────────────────────────────────────── */
	function hero(ch) {
		const live = ch.status === "live";

		return h("header", { class: "ch-hero" },
			h("div", { class: "ch-hero-main" },
				h("p", { class: "eyebrow" },
					h("span", { class: "live-dot" + (live ? " animate" : ""), "aria-hidden": "true" }),
					live ? "Active challenge" : "Coming soon"
				),
				h("h1", { class: "ch-title" }, titleParts(ch.title)),
				ch.codename ? h("p", { class: "ch-codename mono", text: ch.codename }) : null,
				h("p", { class: "ch-tagline", text: ch.tagline })
			),
			h("div", { class: "ch-hero-side" },
				h("span", { class: "badge danger", text: ch.difficulty || "Unrated" }),
				live ? h("span", { class: "badge live" }, h("span", { class: "live-dot" }), "Live") : null,
				(ch.labs || []).length ? h("span", { class: "badge", text: ch.labs.length + " missions" }) : null,
				live ? h("a", { class: "btn-primary", href: "#launch", text: "▶ Start lab" }) : null
			)
		);
	}

	function crumbs(ch) {
		return h("nav", { class: "crumbs", "aria-label": "Breadcrumb" },
			h("a", { href: "index.html", text: "Home" }),
			h("span", { class: "crumb-sep", "aria-hidden": "true", text: "/" }),
			h("a", { href: "jr-pentest.html", text: "Jr Penetration Testing" }),
			h("span", { class: "crumb-sep", "aria-hidden": "true", text: "/" }),
			h("span", { class: "crumb-current", text: ch.title })
		);
	}

	function comingSoonPanel(ch) {
		return h("section", { class: "panel", id: "about" },
			h("div", { class: "panel-head" },
				h("h2", { text: "About this lab" }),
				h("span", { class: "panel-sub", text: ch.tool || "" })
			),
			h("div", { class: "alert alert-warn" },
				h("strong", { text: "Coming soon" }),
				h("div", { class: "alert-hint", text: "This challenge is not ready yet — the lab is still being built." })
			),
			(ch.description || []).map((p) => h("p", { class: "panel-p", text: p }))
		);
	}

	function renderChallenge(ch, data, ctlFactory) {
		const os = detectOS();
		const live = ch.status === "live" && (ch.labs || []).length > 0;
		let ctl = null;
		if (live) ctl = ctlFactory(ch.labs.map((l) => l.id));

		const main = h("div", { class: "ch-main" },
			live ? briefingPanel(ch) : comingSoonPanel(ch),
			live ? missionPanel(ch, ctl) : null,
			live ? aboutPanel(ch) : null,
			readmePanel(ch),
			contributorsPanel(ch)
		);

		const aside = h("aside", { class: "side" }, live ? asidePanels(ch, ctl, os) : null);
		const page = h("div", { class: "ch-page" },
			h("div", { class: "container" },
				crumbs(ch),
				hero(ch),
				h("div", { class: "ch-layout" }, main, aside)
			)
		);
		return { page, ctl };
	}

	function showMessage(app, title, text) {
		clear(app);
		app.append(h("div", { class: "panel message-panel" },
			h("h2", { text: title }),
			h("p", { text: text }),
			h("p", {}, h("a", { class: "btn-secondary", href: "index.html", text: "← Back to Flag Forge" }))
		));
	}

	async function init() {
		const app = $("app");
		let data;
		try {
			const r = await env.fetch("data/challenges.json");
			if (!r.ok) throw new Error("HTTP " + r.status);
			data = await r.json();
		} catch (_e) {
			showMessage(app, "Could not load the challenge data", "If you opened this file directly from disk, serve the folder with a local web server instead.");
			return null;
		}
		const slug = new URLSearchParams(env.location.search).get("c") || "";
		const ch = (data.challenges || []).find((c) => c.slug === slug);
		if (!ch) { showMessage(app, "Challenge not found", "That challenge does not exist."); return null; }
		doc.title = ch.title + " · " + CFG.siteName;

		const { page, ctl } = renderChallenge(ch, data, (ids) => env.createController(env.sp, ids));
		clear(app);
		app.append(page);

		if (ctl) {
			ctl.checkSetup();
			if (env.setInterval) env.setInterval(() => {
				for (const el of doc.querySelectorAll("[data-expires]")) el.textContent = fmtLeft(Number(el.getAttribute("data-expires")) - Date.now());
			}, 1000);
			let last = 0;
			const recheck = () => {
				if (ctl.ready() || Date.now() - last < 2000) return;
				last = Date.now();
				ctl.checkSetup();
			};
			if (env.addEventListener) env.addEventListener("focus", recheck);
			doc.addEventListener("visibilitychange", () => { if (doc.visibilityState === "visible") recheck(); });
		}
		return { ch, ctl };
	}

	return { init, renderChallenge, detectOS, installCommands, fmtLeft };
});

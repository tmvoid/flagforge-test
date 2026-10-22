/* Homepage: fills the stat numbers from data/challenges.json.
   Loaded as a module-free classic script so the page stays CSP-clean (no inline script). */
(function () {
	"use strict";

	function setText(id, value) {
		var el = document.getElementById(id);
		if (el) el.textContent = String(value);
	}

	function render(data) {
		var challenges = (data && data.challenges) || [];
		var live = 0;
		var missions = 0;

		challenges.forEach(function (c) {
			if (c.status === "live") live += 1;
			if (c.labs) missions += c.labs.length;
		});

		setText("stat-ctfs", live);
		setText("stat-missions", missions);
	}

	fetch("data/challenges.json")
		.then(function (res) {
			if (!res.ok) throw new Error("HTTP " + res.status);
			return res.json();
		})
		.then(render)
		.catch(function (err) {
			// Leave the em dashes in place; the page still reads fine without stats.
			console.error("Could not load stats", err);
		});
})();

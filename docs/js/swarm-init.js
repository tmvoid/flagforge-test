/* ==========================================================================
   FLAG FORGE — SwarmCursor init
   ========================================================================== */
(function () {
	'use strict';
	function init() {
		var container = document.querySelector('.swarm-cursor-container');
		if (!container) return;
		if (typeof window.FFSwarmCursor === 'function') {
			new window.FFSwarmCursor(container, {
				count: 600,
				size: 2.6,
				color: '#ffffff',
				accentColor: '#2ee59d'
			});
		}
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
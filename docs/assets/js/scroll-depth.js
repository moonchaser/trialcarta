// How far down each page visitors get, sent to Google Analytics (live site only; gtag is loaded
// only on trialcarta.com). GA4's own "scroll" event covers 90%; this adds:
//   scroll_25, scroll_50, scroll_75   once each per page view
//   section_view (section_id)         the first time a section reaches the middle of the screen
// Nothing personal is sent: only the page path GA4 already records, and these names.
(function () {
	if (typeof window.gtag !== 'function' || !/(^|\.)trialcarta\.com$/.test(location.hostname)) return;

	var marks = [25, 50, 75], sent = {};
	function depth() {
		var doc = document.documentElement;
		var scrollable = doc.scrollHeight - window.innerHeight;
		if (scrollable <= 0) return 100;
		return (window.scrollY || doc.scrollTop) / scrollable * 100;
	}
	var ticking = false;
	function check() {
		ticking = false;
		var d = depth();
		marks.forEach(function (m) {
			if (d >= m && !sent[m]) {
				sent[m] = true;
				gtag('event', 'scroll_' + m, { percent_scrolled: m });
			}
		});
		if (marks.every(function (m) { return sent[m]; })) window.removeEventListener('scroll', onScroll);
	}
	function onScroll() {
		if (!ticking) { ticking = true; window.requestAnimationFrame(check); }
	}
	window.addEventListener('scroll', onScroll, { passive: true });

	if (!('IntersectionObserver' in window)) return;
	var seen = {};
	// A section counts once it reaches the middle fifth of the screen, whatever its height.
	var observer = new IntersectionObserver(function (entries) {
		entries.forEach(function (e) {
			var id = e.target.id;
			if (e.isIntersecting && !seen[id]) {
				seen[id] = true;
				gtag('event', 'section_view', { section_id: id });
				observer.unobserve(e.target);
			}
		});
	}, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
	document.querySelectorAll('section[id]').forEach(function (s) { observer.observe(s); });
})();

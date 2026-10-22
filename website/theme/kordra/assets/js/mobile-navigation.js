(() => {
	"use strict";

	const API_NAME = "KordraMobileNavigation";
	const NAV_SELECTOR = ".kordra-header .wp-block-navigation.kordra-navigation";
	const OPEN_CLASS = "is-menu-open";
	const DECORATION_ATTRIBUTE = "data-kordra-mobile-nav-decoration";
	const previousController = window[API_NAME];

	if (previousController && typeof previousController.destroy === "function") {
		previousController.destroy();
	}

	const controllers = new Set();

	function createElement(tagName, className, text) {
		const element = document.createElement(tagName);
		element.className = className;
		if (text) {
			element.textContent = text;
		}
		element.setAttribute(DECORATION_ATTRIBUTE, "");
		return element;
	}

	function addEditorialDetails(nav, content, list) {
		const sourceBrand = document.querySelector(".kordra-header .kordra-brand");
		const brand = sourceBrand ? sourceBrand.cloneNode(true) : createElement("a", "kordra-mobile-nav__brand", "KORDRA");
		brand.classList.add("kordra-mobile-nav__brand");
		brand.setAttribute(DECORATION_ATTRIBUTE, "brand");

		const label = createElement("p", "kordra-mobile-nav__label", "01 / NAVIGATION");
		const orbit = createElement("div", "kordra-mobile-nav__orbit");
		orbit.innerHTML = `<svg viewBox="0 0 640 180" aria-hidden="true" focusable="false">
			<g class="kordra-mobile-nav__orbit-spin">
				<ellipse cx="320" cy="90" rx="278" ry="54" />
				<ellipse cx="320" cy="90" rx="206" ry="76" transform="rotate(-18 320 90)" />
				<ellipse cx="320" cy="90" rx="132" ry="48" transform="rotate(23 320 90)" />
				<path d="M42 90h556M320 13v154M112 35l416 110M113 145 527 35" />
				<circle cx="74" cy="90" r="4" />
				<circle cx="320" cy="14" r="4" />
				<circle cx="535" cy="90" r="4" />
				<circle cx="320" cy="166" r="4" />
			</g>
			<circle class="kordra-mobile-nav__orbit-core" cx="320" cy="90" r="17" />
		</svg>`;

		const footer = createElement("div", "kordra-mobile-nav__footer");
		const status = createElement("p", "kordra-mobile-nav__status", "IN DEVELOPMENT");
		const statusMark = createElement("span", "kordra-mobile-nav__status-mark");
		statusMark.setAttribute("aria-hidden", "true");
		status.prepend(statusMark);
		const tagline = createElement("p", "kordra-mobile-nav__tagline", "One Control Plane. Any Infrastructure.");
		footer.append(status, tagline);

		const items = Array.from(list.querySelectorAll(":scope > li"));
		items.forEach((item, index) => {
			const link = item.querySelector(":scope > a");
			if (!link) {
				return;
			}
			link.querySelectorAll(".kordra-mobile-nav__number").forEach((existing) => existing.remove());
			const number = createElement("span", "kordra-mobile-nav__number", String(index + 1).padStart(2, "0"));
			number.setAttribute("aria-hidden", "true");
			link.append(number);

			item.querySelectorAll(":scope > .kordra-mobile-nav__divider").forEach((existing) => existing.remove());
			const divider = createElement("span", "kordra-mobile-nav__divider");
			divider.setAttribute("aria-hidden", "true");
			item.append(divider);
		});

		content.prepend(brand, label);
		content.append(orbit, footer);

		return { brand, label, items, orbit, footer, status, tagline };
	}

	function initialize(nav) {
		const overlay = nav.querySelector(".wp-block-navigation__responsive-container");
		const content = overlay?.querySelector(".wp-block-navigation__responsive-container-content");
		const dialog = overlay?.querySelector(".wp-block-navigation__responsive-dialog");
		const list = content?.querySelector("ul.wp-block-navigation__container");
		const openButton = nav.querySelector(".wp-block-navigation__responsive-container-open");
		const closeButton = nav.querySelector(".wp-block-navigation__responsive-container-close");
		const gsap = window.gsap;

		if (!overlay || !content || !dialog || !list || !openButton || !closeButton || !gsap) {
			return;
		}
		if (!overlay.id) {
			overlay.id = "kordra-mobile-navigation-overlay";
		}
		openButton.setAttribute("aria-controls", overlay.id);
		openButton.setAttribute("aria-expanded", String(overlay.classList.contains(OPEN_CLASS)));

		const editorial = addEditorialDetails(nav, content, list);
		const links = editorial.items
			.map((item) => item.querySelector(":scope > a"))
			.filter(Boolean);
		const dividers = editorial.items
			.map((item) => item.querySelector(":scope > .kordra-mobile-nav__divider"))
			.filter(Boolean);
		const spin = editorial.orbit.querySelector(".kordra-mobile-nav__orbit-spin");
		const controller = new AbortController();
		const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
		let observer;
		let context;
		let timeline;
		let orbitTween;
		let closing = false;
		let nativeCloseInProgress = false;
		let previouslyOpen = false;
		let destroyed = false;

		const isOpen = () => overlay.classList.contains(OPEN_CLASS);
		const motionReduced = () => motionPreference.matches;

		function primeOpeningState() {
			gsap.set(overlay, { backgroundColor: "rgba(0, 0, 0, 0)" });
			gsap.set(editorial.brand, { opacity: 0, y: -8 });
			gsap.set(closeButton, { opacity: 0, rotation: -8 });
			gsap.set(editorial.label, { opacity: 0, y: 8 });
			gsap.set(links, { opacity: 0, y: 16 });
			gsap.set(dividers, { scaleX: 0, transformOrigin: "left center" });
			gsap.set([editorial.orbit, editorial.footer], { opacity: 0 });
			gsap.set(editorial.footer, { y: 12 });
		}

		function clearMotionStyles() {
			gsap.set(overlay, { clearProps: "backgroundColor" });
			gsap.set(
				[editorial.brand, closeButton, editorial.label, links, editorial.orbit, editorial.footer],
				{ clearProps: "opacity,transform" }
			);
			gsap.set(dividers, { clearProps: "transform,transformOrigin" });
		}

		context = gsap.context(() => {
			timeline = gsap.timeline({
				paused: true,
				defaults: { ease: "power2.out" },
				onComplete: () => {
					if (isOpen() && !closing && !motionReduced() && !document.hidden) {
						orbitTween.play();
					}
				},
				onReverseComplete: () => {
					orbitTween.pause();
					if (closing) {
						closeNatively();
					} else {
						clearMotionStyles();
					}
				},
			});
			timeline.fromTo(
				overlay,
				{ backgroundColor: "rgba(0, 0, 0, 0)" },
				{ backgroundColor: "rgb(0, 0, 0)", duration: 0.35, immediateRender: false },
				0
			);
			timeline.fromTo(
				editorial.brand,
				{ opacity: 0, y: -8 },
				{ opacity: 1, y: 0, duration: 0.28, immediateRender: false },
				0.08
			);
			timeline.fromTo(
				closeButton,
				{ opacity: 0, rotation: -8 },
				{ opacity: 1, rotation: 0, duration: 0.28, immediateRender: false },
				0.08
			);
			timeline.fromTo(
				editorial.label,
				{ opacity: 0, y: 8 },
				{ opacity: 1, y: 0, duration: 0.22, immediateRender: false },
				0.32
			);
			timeline.fromTo(
				links,
				{ opacity: 0, y: 16 },
				{ opacity: 1, y: 0, duration: 0.32, stagger: 0.07, immediateRender: false },
				0.42
			);
			timeline.fromTo(
				dividers,
				{ scaleX: 0, transformOrigin: "left center" },
				{ scaleX: 1, duration: 0.2, stagger: 0.055, transformOrigin: "left center", immediateRender: false },
				">-0.03"
			);
			timeline.addLabel("decoration-reveal", ">-0.02");
			timeline.fromTo(
				editorial.orbit,
				{ opacity: 0 },
				{ opacity: 1, duration: 0.35, immediateRender: false },
				"decoration-reveal"
			);
			timeline.fromTo(
				editorial.footer,
				{ opacity: 0, y: 12 },
				{ opacity: 1, y: 0, duration: 0.28, immediateRender: false },
				"decoration-reveal"
			);
			orbitTween = gsap.to(spin, {
				rotation: 360,
				duration: 24,
				ease: "none",
				repeat: -1,
				svgOrigin: "320 90",
				paused: true,
			});
		}, overlay);

		function closeNatively() {
			if (destroyed || !isOpen()) {
				closing = false;
				return;
			}
			closing = false;
			nativeCloseInProgress = true;
			clearMotionStyles();
			closeButton.click();
			nativeCloseInProgress = false;
			window.requestAnimationFrame(() => {
				if (!isOpen() && !destroyed) {
					openButton.focus({ preventScroll: true });
				}
			});
		}

		function requestClose() {
			if (!isOpen() || closing || nativeCloseInProgress) {
				return;
			}
			closing = true;
			orbitTween.pause();
			if (motionReduced() || timeline.progress() <= 0.001) {
				timeline.pause(0, true);
				closeNatively();
				return;
			}
			timeline.reverse();
		}

		function synchronizeState() {
			const menuIsOpen = isOpen();
			openButton.setAttribute("aria-expanded", String(menuIsOpen));
			if (menuIsOpen) {
				if (!previouslyOpen) {
					previouslyOpen = true;
					window.requestAnimationFrame(() => {
						if (isOpen() && !closing) {
							(links[0] || closeButton).focus({ preventScroll: true });
						}
					});
				}
				closing = false;
				if (motionReduced()) {
					timeline.progress(1).pause();
					orbitTween.pause();
				} else {
					if (timeline.progress() <= 0.001 && !timeline.isActive()) {
						primeOpeningState();
					}
					timeline.play();
				}
				return;
			}

			previouslyOpen = false;
			orbitTween.pause();
			if (!closing && timeline.progress() > 0.001) {
				timeline.reverse();
			}
		}

		function onClickCapture(event) {
			if (nativeCloseInProgress || !isOpen()) {
				return;
			}
			const target = event.target instanceof Element ? event.target : null;
			if (!target || !target.closest(".wp-block-navigation__responsive-container-close")) {
				return;
			}
			event.preventDefault();
			event.stopImmediatePropagation();
			requestClose();
		}

		function onKeydownCapture(event) {
			if (event.key === "Tab" && isOpen()) {
				const focusable = Array.from(
					dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
				).filter((element) => {
					const style = window.getComputedStyle(element);
					return element.tabIndex >= 0 && style.visibility !== "hidden" && element.getClientRects().length > 0;
				});
				if (focusable.length === 0) {
					event.preventDefault();
					event.stopImmediatePropagation();
					closeButton.focus({ preventScroll: true });
					return;
				}

				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				const active = document.activeElement;
				if (!dialog.contains(active) || (event.shiftKey && active === first)) {
					event.preventDefault();
					event.stopImmediatePropagation();
					(event.shiftKey ? last : first).focus({ preventScroll: true });
					return;
				}
				if (!event.shiftKey && active === last) {
					event.preventDefault();
					event.stopImmediatePropagation();
					first.focus({ preventScroll: true });
					return;
				}
			}

			if (event.key !== "Escape" || !isOpen() || nativeCloseInProgress) {
				return;
			}
			event.preventDefault();
			event.stopImmediatePropagation();
			requestClose();
		}

		function onVisibilityChange() {
			if (document.hidden) {
				timeline.pause();
				orbitTween.pause();
			} else if (!isOpen() || motionReduced() || closing) {
				orbitTween.pause();
			} else if (timeline.progress() < 0.999) {
				timeline.play();
			} else {
				orbitTween.play();
			}
		}

		function onMotionPreferenceChange() {
			if (!isOpen()) {
				return;
			}
			if (motionReduced()) {
				if (closing) {
					timeline.pause(0, true);
					closeNatively();
					return;
				}
				closing = false;
				timeline.progress(1).pause();
				orbitTween.pause();
			} else if (closing) {
				timeline.reverse();
			} else if (timeline.progress() < 0.999) {
				timeline.play();
			}
		}

		const abortOptions = { signal: controller.signal };
		window.addEventListener("click", onClickCapture, { ...abortOptions, capture: true });
		window.addEventListener("keydown", onKeydownCapture, { ...abortOptions, capture: true });
		document.addEventListener("visibilitychange", onVisibilityChange, abortOptions);
		if (typeof motionPreference.addEventListener === "function") {
			motionPreference.addEventListener("change", onMotionPreferenceChange, abortOptions);
		} else if (typeof motionPreference.addListener === "function") {
			motionPreference.addListener(onMotionPreferenceChange);
		}

		observer = new MutationObserver(synchronizeState);
		observer.observe(overlay, { attributes: true, attributeFilter: ["class"] });
		synchronizeState();

		const instance = {
			destroy() {
				if (destroyed) {
					return;
				}
				destroyed = true;
				observer.disconnect();
				controller.abort();
				if (typeof motionPreference.removeListener === "function") {
					motionPreference.removeListener(onMotionPreferenceChange);
				}
				orbitTween.kill();
				timeline.kill();
				context.revert();
				nav.removeAttribute("data-kordra-mobile-nav-initialized");
				content.querySelectorAll(`[${DECORATION_ATTRIBUTE}]`).forEach((element) => element.remove());
				controllers.delete(instance);
				if (isOpen()) {
					closeButton.click();
				}
				window.requestAnimationFrame(() => {
					openButton.setAttribute("aria-expanded", String(isOpen()));
				});
			},
		};

		nav.setAttribute("data-kordra-mobile-nav-initialized", "true");
		controllers.add(instance);
		return instance;
	}

	function initializeAll() {
		document.querySelectorAll(NAV_SELECTOR).forEach((nav) => {
			if (nav.getAttribute("data-kordra-mobile-nav-initialized") !== "true") {
				initialize(nav);
			}
		});
	}

	const api = {
		init: initializeAll,
		destroy() {
			Array.from(controllers).forEach((controller) => controller.destroy());
		},
	};
	window[API_NAME] = api;

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initializeAll, { once: true });
	} else {
		initializeAll();
	}
})();

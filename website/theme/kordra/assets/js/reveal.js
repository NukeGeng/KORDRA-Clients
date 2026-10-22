/* Scroll-linked homepage motion with readable, repeatable GSAP enhancements. */
(() => {
	'use strict';

	const instanceKey = '__kordraHomepageMotion';
	window[instanceKey]?.destroy?.();

	if (!window.gsap || !window.matchMedia || !window.IntersectionObserver) return;

	const gsap = window.gsap;
	const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
	const wheelDeltaScale = 0.72;
	const maxWheelDelta = 180;
	const flowStepInterval = 280;
	const selector = [
		'.kordra-typewriter-line',
		'.kordra-statement__copy',
		'.kordra-statement .kordra-text-link',
		'.kordra-flow__heading > p',
		'.kordra-flow__list > li',
		'.kordra-section-note',
		'.kordra-topology__copy > p',
		'.kordra-orbit-map',
		'.kordra-status__details > p',
		'.kordra-status .wp-block-button',
	].join(',');
	const orbit = document.querySelector('.kordra-orbit-map');
	const orbitCenter = { x: 302, y: 190 };
	const satelliteLabels = orbit
		? Array.from(orbit.querySelectorAll('.kordra-orbit-map__satellite-label'), (element) => ({
			element,
			x: Number(element.getAttribute('x')),
			y: Number(element.getAttribute('y')),
		}))
		: [];
	const records = [];
	const pending = new Set();
	const animations = new Set();
	const orbitTweens = new Set();
	let observer = null;
	let revealFrame = null;
	let orbitFrame = null;
	let nextStartAt = 0;
	let active = false;
	let disposed = false;

	function revealTargets(element) {
		if (element.matches('.kordra-flow__list > li')) {
			return {
				kind: 'flow',
				targets: [
					element.querySelector('.kordra-flow__node'),
					element.querySelector('.kordra-flow__label'),
					element.querySelector(':scope > p'),
				].filter(Boolean),
			};
		}

		return { kind: 'block', targets: [element] };
	}

	function setState(record, state) {
		record.state = state;
		record.element.dataset.kordraRevealState = state;
	}

	function revealGap(record) {
		return record.kind === 'flow' ? flowStepInterval : 82;
	}

	function cancelRecordAnimations(record) {
		for (const animation of record.animations) {
			animation.kill();
			animations.delete(animation);
		}
		record.animations = [];
	}

	function recalculateNextStartAt() {
		const now = window.performance?.now?.() ?? Date.now();
		nextStartAt = records.reduce((latest, record) => {
			if (!record.inView || record.state !== 'entering') return latest;
			return Math.max(latest, record.startAt + revealGap(record));
		}, now);
	}

	function primeRecord(record) {
		if (record.kind === 'flow') {
			const [node, label, copy] = record.targets;
			if (node) gsap.set(node, { opacity: 0, scale: 0.72, transformOrigin: '50% 50%' });
			if (label) gsap.set(label, { opacity: 0, y: 12 });
			if (copy) gsap.set(copy, { opacity: 0, y: 12 });
		} else {
			gsap.set(record.element, { opacity: 0, y: 14 });
		}
	}

	function clearRecord(record) {
		cancelRecordAnimations(record);
		gsap.set(record.targets, { clearProps: 'opacity,transform,visibility' });
		delete record.element.dataset.kordraRevealState;
		record.state = 'waiting';
		record.inView = false;
		record.startAt = 0;
		pending.delete(record);
		recalculateNextStartAt();
	}

	function resetRecord(record) {
		if (record.state === 'waiting') return;
		clearRecord(record);
		primeRecord(record);
	}

	function completeRecord(record) {
		cancelRecordAnimations(record);
		gsap.set(record.targets, { clearProps: 'opacity,transform,visibility' });
		setState(record, 'complete');
		recalculateNextStartAt();
	}

	function createAnimations(record, startDelay) {
		let specs;
		if (record.kind === 'flow') {
			const [node, label, copy] = record.targets;
			specs = [
				...(node ? [{ target: node, offset: 0, vars: { opacity: 1, scale: 1, duration: 0.2 } }] : []),
				...(label ? [{ target: label, offset: 0.04, vars: { opacity: 1, y: 0, duration: 0.19 } }] : []),
				...(copy ? [{ target: copy, offset: 0.08, vars: { opacity: 1, y: 0, duration: 0.18 } }] : []),
			];
		} else {
			specs = [{ target: record.element, offset: 0, vars: { opacity: 1, y: 0, duration: 0.34 } }];
		}

		const recordAnimations = [];
		specs.forEach(({ target, offset, vars }, index) => {
			let animation;
			animation = gsap.to(target, {
				...vars,
				delay: Math.max(0, startDelay) + offset,
				ease: 'power2.out',
				onComplete: () => {
					animations.delete(animation);
					if (index === specs.length - 1 && record.state === 'entering') {
						record.animations = [];
						setState(record, 'complete');
						recalculateNextStartAt();
					}
				},
			});
			recordAnimations.push(animation);
			animations.add(animation);
		});
		return recordAnimations;
	}

	function accelerateVisibleQueue() {
		const now = window.performance?.now?.() ?? Date.now();
		let nextAllowedStartAt = now;
		const visible = records
			.filter((record) => record.inView && record.state === 'entering')
			.sort((left, right) => left.index - right.index);

		for (const record of visible) {
			const startAt = Math.max(now, nextAllowedStartAt);
			if (record.startAt > startAt) {
				cancelRecordAnimations(record);
				record.startAt = startAt;
				record.animations = createAnimations(record, (startAt - now) / 1000);
			}
			nextAllowedStartAt = Math.max(startAt, record.startAt) + revealGap(record);
		}
		recalculateNextStartAt();
	}

	function synchronizeVisibleRecords() {
		let exitedWhileEntering = false;
		for (const record of records) {
			const rect = record.element.getBoundingClientRect();
			const isInView = rect.top < window.innerHeight && rect.bottom > 0;
			if (isInView) {
				record.inView = true;
				if (record.state === 'waiting') queue(record);
				continue;
			}

			record.inView = false;
			if (record.state !== 'waiting') {
				if (record.state === 'entering') exitedWhileEntering = true;
				resetRecord(record);
			}
		}

		if (exitedWhileEntering) accelerateVisibleQueue();
	}

	function flushPending() {
		revealFrame = null;
		if (!active || disposed || preference.matches || document.hidden) return;

		const batch = Array.from(pending)
			.filter((record) => record.inView && record.state === 'waiting')
			.sort((left, right) => left.index - right.index);
		pending.clear();
		if (!batch.length) return;

		const statusCopy = records.find((record) => record.element.matches('.kordra-status__details > p'));
		const statusAction = records.find((record) => record.element.matches('.kordra-status .wp-block-button'));
		if (batch.includes(statusAction) && statusCopy?.inView && statusCopy.state === 'waiting' && !batch.includes(statusCopy)) {
			batch.push(statusCopy);
			batch.sort((left, right) => left.index - right.index);
		}

		const now = window.performance?.now?.() ?? Date.now();
		let startAt = Math.max(now, nextStartAt);
		const starts = new Map();
		for (const record of batch) {
			starts.set(record, startAt);
			startAt += revealGap(record);
		}

		if (statusCopy && statusAction && starts.has(statusAction)) {
			const copyStart = starts.get(statusCopy) ?? statusCopy.startAt;
			if (statusCopy.state !== 'complete' && copyStart) starts.set(statusAction, Math.max(starts.get(statusAction), copyStart + 390));
		}

		for (const record of batch) {
			if (!record.inView || record.state !== 'waiting') continue;
			const delay = Math.max(0, starts.get(record) - now) / 1000;
			record.startAt = now + delay * 1000;
			setState(record, 'entering');
			record.animations = createAnimations(record, delay);
		}
		nextStartAt = Math.max(startAt, ...Array.from(starts, ([record, start]) => start + revealGap(record)));
	}

	function queue(record) {
		pending.add(record);
		if (revealFrame === null) revealFrame = window.requestAnimationFrame(flushPending);
	}

	function onWheel(event) {
		if (!active || disposed || preference.matches || event.defaultPrevented || !event.cancelable || !event.deltaY || event.ctrlKey || event.metaKey || event.shiftKey) return;
		if (document.querySelector('.wp-block-navigation__responsive-container.is-menu-open')) return;
		if (Math.abs(event.deltaX || 0) >= Math.abs(event.deltaY)) return;
		if (!records.some((record) => record.inView && (record.state === 'entering' || pending.has(record)))) return;

		let deltaY = event.deltaY;
		if (event.deltaMode === 1) deltaY *= 16;
		else if (event.deltaMode === 2) deltaY *= window.innerHeight;

		const pacedDelta = Math.sign(deltaY) * Math.min(Math.abs(deltaY) * wheelDeltaScale, maxWheelDelta);
		if (!pacedDelta) return;

		event.preventDefault();
		window.scrollBy({ top: pacedDelta, behavior: 'instant' });
	}

	function onIntersections(entries) {
		if (entries.length) synchronizeVisibleRecords();
	}

	function progressOrbit() {
		orbitFrame = null;
		if (!orbit || !active || disposed || preference.matches || document.hidden) return;
		const rect = orbit.getBoundingClientRect();
		const total = Math.max(1, window.innerHeight + rect.height);
		const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total));
		const satelliteLinks = orbit.querySelector('.kordra-orbit-map__satellite-links');
		const satellites = orbit.querySelector('.kordra-orbit-map__satellites');
		const dottedRing = orbit.querySelector('.kordra-orbit-map__orbit-ring');
		const middleRing = orbit.querySelector('.kordra-orbit-map__middle-ring');
		const coreRing = orbit.querySelector('.kordra-orbit-map__core-ring');

		for (const tween of orbitTweens) tween.kill();
		orbitTweens.clear();
		const rotation = -18 + progress * 36;
		const radians = rotation * Math.PI / 180;
		const cos = Math.cos(radians);
		const sin = Math.sin(radians);
		if (satelliteLinks) {
			orbitTweens.add(gsap.to(satelliteLinks, {
				rotation,
				svgOrigin: `${orbitCenter.x} ${orbitCenter.y}`,
				duration: 0.16,
				ease: 'power1.out',
			}));
		}
		if (satellites) {
			orbitTweens.add(gsap.to(satellites, {
				rotation,
				svgOrigin: `${orbitCenter.x} ${orbitCenter.y}`,
				duration: 0.16,
				ease: 'power1.out',
			}));
		}
		for (const label of satelliteLabels) {
			const x = orbitCenter.x + (label.x - orbitCenter.x) * cos - (label.y - orbitCenter.y) * sin;
			const y = orbitCenter.y + (label.x - orbitCenter.x) * sin + (label.y - orbitCenter.y) * cos;
			orbitTweens.add(gsap.to(label.element, {
				attr: { x, y },
				duration: 0.16,
				ease: 'power1.out',
			}));
		}
		if (dottedRing) {
			orbitTweens.add(gsap.to(dottedRing, {
				attr: { 'stroke-dashoffset': -28 * progress },
				duration: 0.16,
				ease: 'power1.out',
			}));
		}
		if (middleRing) {
			orbitTweens.add(gsap.to(middleRing, {
				scale: 0.985 + progress * 0.03,
				svgOrigin: '302 190',
				duration: 0.16,
				ease: 'power1.out',
			}));
		}
		if (coreRing) {
			orbitTweens.add(gsap.to(coreRing, {
				scale: 1.015 - progress * 0.03,
				svgOrigin: '302 190',
				duration: 0.16,
				ease: 'power1.out',
			}));
		}
	}

	function scheduleOrbit() {
		if (orbit && active && !disposed && orbitFrame === null && !document.hidden && !preference.matches) {
			orbitFrame = window.requestAnimationFrame(progressOrbit);
		}
	}

	function onViewportChange() {
		if (!active || disposed || document.hidden || preference.matches) return;
		synchronizeVisibleRecords();
		scheduleOrbit();
	}

	function revealFocusedTarget(event) {
		const record = records.find((item) => item.element.contains(event.target));
		if (!record) return;
		record.inView = true;
		pending.delete(record);
		completeRecord(record);
	}

	function onVisibilityChange() {
		const paused = document.hidden;
		for (const animation of animations) animation.paused(paused);
		for (const tween of orbitTweens) tween.paused(paused);
		if (!paused) {
			if (pending.size && revealFrame === null) revealFrame = window.requestAnimationFrame(flushPending);
			onViewportChange();
		}
	}

	function onMotionPreferenceChange() {
		if (preference.matches) {
			teardownMotion();
		} else {
			controller.initialize();
		}
	}

	function teardownMotion() {
		active = false;
		observer?.disconnect();
		observer = null;
		if (revealFrame !== null) window.cancelAnimationFrame(revealFrame);
		if (orbitFrame !== null) window.cancelAnimationFrame(orbitFrame);
		revealFrame = null;
		orbitFrame = null;
		window.removeEventListener('scroll', onViewportChange);
		window.removeEventListener('resize', onViewportChange);
		window.removeEventListener('wheel', onWheel);
		document.removeEventListener('focusin', revealFocusedTarget);
		document.removeEventListener('visibilitychange', onVisibilityChange);
		for (const animation of animations) animation.kill();
		for (const tween of orbitTweens) tween.kill();
		animations.clear();
		orbitTweens.clear();
		for (const record of records) {
			gsap.set(record.targets, { clearProps: 'opacity,transform,visibility' });
			delete record.element.dataset.kordraRevealState;
			record.state = 'waiting';
			record.animations = [];
		}
		records.length = 0;
		pending.clear();
		nextStartAt = 0;
	}

	const controller = {
		initialize() {
			if (disposed || active || preference.matches) return;
			active = true;
			try {
				records.length = 0;
				document.querySelectorAll(selector).forEach((element, index) => {
					const parts = revealTargets(element);
					const record = { element, index, ...parts, state: 'waiting', inView: false, animations: [], startAt: 0 };
					if (!record.targets.length) return;
					records.push(record);
					element.dataset.kordraRevealState = 'waiting';
					primeRecord(record);
				});
				observer = new window.IntersectionObserver(onIntersections, { threshold: 0 });
				for (const record of records) observer.observe(record.element);
				window.addEventListener('scroll', onViewportChange, { passive: true });
				window.addEventListener('resize', onViewportChange, { passive: true });
				if (records.length) window.addEventListener('wheel', onWheel, { passive: false });
				document.addEventListener('focusin', revealFocusedTarget);
				document.addEventListener('visibilitychange', onVisibilityChange);
				scheduleOrbit();
			} catch {
				controller.destroy();
			}
		},
		destroy() {
			if (disposed) return;
			disposed = true;
			teardownMotion();
			preference.removeEventListener?.('change', onMotionPreferenceChange);
			if (window[instanceKey] === controller) delete window[instanceKey];
		},
	};

	window[instanceKey] = controller;
	preference.addEventListener?.('change', onMotionPreferenceChange);
	controller.initialize();
})();

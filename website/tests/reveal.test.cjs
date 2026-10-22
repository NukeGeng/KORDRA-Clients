/* Exercise the production GSAP reveal controller with a deterministic browser fixture. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const sourcePath = path.join(__dirname, '../theme/kordra/assets/js/reveal.js');
const source = fs.readFileSync(sourcePath, 'utf8');

function browser(specs = [], options = {}) {
  let clock = 0;
  let nextId = 0;
  let intersectionObserver;
  let preferenceListener;
  const rafs = new Map();
  const timers = new Map();
  const windowEvents = new Map();
  const documentEvents = new Map();
  const gsapCalls = { sets: [], tweens: [] };

  const preference = {
    matches: Boolean(options.reduced),
    addEventListener: (_, callback) => { preferenceListener = callback; },
    removeEventListener: (_, callback) => {
      if (preferenceListener === callback) preferenceListener = null;
    },
  };
  const openMenu = options.menuOpen ? {} : null;

  function apply(target, values) {
    const targets = Array.isArray(target) ? target : [target];
    for (const item of targets) {
      if (!item?.style) continue;
      if (values.clearProps) {
        for (const property of values.clearProps.split(',')) {
          if (property === 'transform') {
            delete item.style.transform;
            delete item.style.y;
            delete item.style.scale;
            delete item.style.rotation;
          } else {
            delete item.style[property];
          }
        }
      }
      for (const [property, value] of Object.entries(values)) {
        if (property === 'clearProps' || property === 'duration' || property === 'delay' || property === 'ease' || property === 'overwrite' || property === 'svgOrigin' || property === 'onComplete') continue;
        if (property === 'attr') {
          item.attributes ||= {};
          Object.assign(item.attributes, value);
        } else {
          item.style[property] = value;
        }
      }
    }
  }

  const gsap = {
    set(target, vars) {
      gsapCalls.sets.push({ target, vars: { ...vars } });
      apply(target, vars);
    },
    to(target, vars) {
      let timerId = null;
      let dueAt = 0;
      let remaining = Math.max(0, ((vars.delay || 0) + (vars.duration || 0)) * 1000);
      let killed = false;
      let isPaused = false;
      const finish = () => {
        timerId = null;
        if (killed || isPaused) return;
        apply(target, vars);
        vars.onComplete?.();
      };
      const schedule = (wait) => {
        dueAt = clock + wait;
        timerId = window.setTimeout(finish, wait);
      };
      const tween = {
        target,
        vars: { ...vars },
        get killed() { return killed; },
        kill() {
          killed = true;
          if (timerId !== null) window.clearTimeout(timerId);
          timerId = null;
        },
        paused(value) {
          if (value === undefined || value === isPaused) return isPaused;
          isPaused = value;
          if (isPaused && timerId !== null) {
            remaining = Math.max(0, dueAt - clock);
            window.clearTimeout(timerId);
            timerId = null;
          } else if (!isPaused && timerId === null && !killed) {
            schedule(remaining);
          }
          return isPaused;
        },
      };
      gsapCalls.tweens.push(tween);
      if (vars.onComplete || vars.delay) schedule(remaining);
      else apply(target, vars);
      return tween;
    },
  };

  function makeNode(owner, kind) {
    return {
      owner,
      kind,
      style: {},
      attributes: {},
      getBoundingClientRect: () => owner.getBoundingClientRect(),
    };
  }

  const elements = specs.map((spec, index) => {
    const element = {
      index,
      top: spec.top ?? 100,
      width: spec.width ?? 320,
      height: spec.height ?? 28,
      inView: false,
      style: {},
      dataset: {},
      attributes: {},
      matches(selector) {
        if (selector === '.kordra-flow__list > li') return Boolean(spec.flow);
        if (selector === '.kordra-status__details > p') return Boolean(spec.statusCopy);
        if (selector === '.kordra-status .wp-block-button') return Boolean(spec.statusAction);
        return false;
      },
      querySelector(selector) {
        if (selector === '.kordra-flow__node') return element.node;
        if (selector === '.kordra-flow__label') return element.label;
        if (selector === ':scope > p') return element.copy;
        return null;
      },
      contains(target) { return target === element || target?.owner === element; },
      getBoundingClientRect() {
        return {
          top: element.top,
          bottom: element.top + element.height,
          left: 0,
          right: element.width,
          width: element.width,
          height: element.height,
        };
      },
    };
    if (spec.flow) {
      element.node = makeNode(element, 'node');
      element.label = makeNode(element, 'label');
      element.copy = makeNode(element, 'copy');
    }
    return element;
  });

  const flowItems = elements.filter((element) => element.matches('.kordra-flow__list > li'));

	const labelCoordinates = [[42, 99], [468, 73], [43, 327], [454, 343]];
	const orbitNodes = options.orbit ? {
	  links: { style: {}, attributes: {} },
    satellites: { style: {}, attributes: {} },
	  labels: labelCoordinates.map(([x, y]) => ({
	    style: {},
	    attributes: { x, y },
	    getAttribute(name) { return this.attributes[name]; },
	  })),
    dotted: { style: {}, attributes: {} },
    middle: { style: {}, attributes: {} },
    core: { style: {}, attributes: {} },
  } : null;
  const orbit = orbitNodes ? {
    top: options.orbitTop ?? 700,
    height: options.orbitHeight ?? 390,
    querySelector(selector) {
	  if (selector === '.kordra-orbit-map__satellite-links') return orbitNodes.links;
      if (selector === '.kordra-orbit-map__satellites') return orbitNodes.satellites;
      if (selector === '.kordra-orbit-map__orbit-ring') return orbitNodes.dotted;
      if (selector === '.kordra-orbit-map__middle-ring') return orbitNodes.middle;
      if (selector === '.kordra-orbit-map__core-ring') return orbitNodes.core;
      return null;
    },
    querySelectorAll(selector) {
	  return selector === '.kordra-orbit-map__satellite-label' ? orbitNodes.labels : [];
	},
    getBoundingClientRect() {
      return { top: this.top, bottom: this.top + this.height, height: this.height, width: 600 };
    },
  } : null;

  class MockIntersectionObserver {
    constructor(callback, config) {
      this.callback = callback;
      this.config = config;
      this.observed = new Set();
      this.disconnected = false;
      intersectionObserver = this;
    }
    observe(element) { this.observed.add(element); }
    disconnect() { this.disconnected = true; this.observed.clear(); }
    emit(entries) { this.callback(entries.map(({ element, isIntersecting }) => ({ target: element, isIntersecting }))); }
  }

  const document = {
    hidden: false,
    activeElement: null,
    querySelectorAll: () => elements,
    querySelector: (selector) => selector === '.kordra-orbit-map' ? orbit : selector === '.wp-block-navigation__responsive-container.is-menu-open' ? openMenu : null,
    addEventListener: (name, callback) => documentEvents.set(name, callback),
    removeEventListener: (name, callback) => {
      if (documentEvents.get(name) === callback) documentEvents.delete(name);
    },
  };
  const window = {
    innerHeight: options.innerHeight ?? 1000,
    scrollY: 0,
    scrollByCalls: [],
    scrollBy(value) { this.scrollByCalls.push(value); this.scrollY += value.top || 0; },
    performance: { now: () => clock },
    gsap: options.gsap === false ? undefined : gsap,
    matchMedia: () => preference,
    IntersectionObserver: options.observer === false ? undefined : MockIntersectionObserver,
    requestAnimationFrame(callback) { const id = ++nextId; rafs.set(id, callback); return id; },
    cancelAnimationFrame(id) { rafs.delete(id); },
    setTimeout(callback, delay = 0) {
      const id = ++nextId;
      timers.set(id, { at: clock + delay, callback });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    addEventListener: (name, callback) => windowEvents.set(name, callback),
    removeEventListener: (name, callback) => {
      if (windowEvents.get(name) === callback) windowEvents.delete(name);
    },
  };

  function runTimers() {
    while (true) {
      const next = [...timers.entries()].filter(([, timer]) => timer.at <= clock).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      const [id, timer] = next;
      timers.delete(id);
      timer.callback();
    }
  }

  vm.runInNewContext(source, { window, document, Date, Math, Set, Array });

  const api = {
    elements,
    orbit,
    orbitNodes,
    gsapCalls,
    get observer() { return intersectionObserver; },
    get controller() { return window.__kordraHomepageMotion; },
    get rafCount() { return rafs.size; },
    get eventCounts() { return { window: windowEvents.size, document: documentEvents.size }; },
    get scrollByCalls() { return window.scrollByCalls; },
    step(ms = 16) {
      clock += ms;
      const callbacks = [...rafs.values()];
      rafs.clear();
      callbacks.forEach((callback) => callback(clock));
      runTimers();
    },
    advance(ms) {
      const target = clock + ms;
      while (clock < target) api.step(Math.min(16, target - clock));
    },
    enter(indices) {
      const list = (Array.isArray(indices) ? indices : [indices]).map((index) => elements[index]);
      list.forEach((element) => { element.inView = true; });
      intersectionObserver?.emit(list.map((element) => ({ element, isIntersecting: true })));
    },
    enterFlow() {
	  flowItems.forEach((element) => { element.top = 100; });
      intersectionObserver?.emit(flowItems.map((element) => ({ element, isIntersecting: true })));
    },
    leaveFlow() {
	  flowItems.forEach((element) => { element.top = -element.height; });
      intersectionObserver?.emit(flowItems.map((element) => ({ element, isIntersecting: false })));
    },
    wheel(deltaY, extras = {}) {
      let prevented = false;
      windowEvents.get('wheel')?.({ cancelable: true, deltaMode: 0, deltaX: 0, deltaY, preventDefault() { prevented = true; }, ...extras });
      return prevented;
    },
    key(key, extras = {}) {
      let prevented = false;
      windowEvents.get('keydown')?.({ key, preventDefault() { prevented = true; }, ...extras });
      return prevented;
    },
    get flowItems() { return flowItems; },
    scroll(tops) {
      tops.forEach((top, index) => { elements[index].top = top; });
      const changes = elements.filter((element) => {
        const rect = element.getBoundingClientRect();
        const visible = rect.top < window.innerHeight && rect.bottom > 0;
        if (visible === element.inView) return false;
        element.inView = visible;
        return true;
      });
      intersectionObserver?.emit(changes.map((element) => ({ element, isIntersecting: element.inView })));
      windowEvents.get('scroll')?.();
    },
    scrollWithoutObserver(tops) {
	  tops.forEach((top, index) => { elements[index].top = top; });
	  windowEvents.get('scroll')?.();
	},
    moveOrbit(top) {
      if (!orbit) return;
      orbit.top = top;
      windowEvents.get('scroll')?.();
      api.step();
    },
    focus(index) {
      const target = { owner: elements[index] };
      document.activeElement = target;
      documentEvents.get('focusin')?.({ target });
    },
    reduce(value) {
      preference.matches = value;
      preferenceListener?.({ matches: value });
    },
    setHidden(value) {
      document.hidden = value;
      documentEvents.get('visibilitychange')?.();
    },
    reinitialize() { vm.runInNewContext(source, { window, document, Date, Math, Set, Array }); },
  };
  return api;
}

test('reveals visible targets in DOM order with a short stagger and completes without more scrolling', () => {
  const page = browser([{ top: 100 }, { top: 140 }, { top: 180 }]);
  page.enter([0, 1, 2]);
  page.step();
  assert.deepEqual(page.elements.map((element) => element.dataset.kordraRevealState), ['entering', 'entering', 'entering']);
  const delays = page.gsapCalls.tweens
    .filter((tween) => tween.vars.onComplete && page.elements.includes(tween.target))
    .map((tween) => tween.vars.delay);
  assert.ok(delays[0] < delays[1] && delays[1] < delays[2]);
  page.advance(800);
  assert.deepEqual(page.elements.map((element) => element.dataset.kordraRevealState), ['complete', 'complete', 'complete']);
  assert.equal(page.rafCount, 0);
});

test('partial exits remain visible; full exits reset and replay in both directions', () => {
  const page = browser([{ top: 100, height: 20 }]);
  page.enter(0); page.step(); page.advance(400);
  assert.equal(page.elements[0].dataset.kordraRevealState, 'complete');
  page.scroll([-19]); page.step();
  assert.equal(page.elements[0].dataset.kordraRevealState, 'complete');
  page.scroll([-20]); page.step();
  assert.equal(page.elements[0].dataset.kordraRevealState, undefined);
  page.scroll([10]); page.step();
  assert.equal(page.elements[0].dataset.kordraRevealState, 'entering');
  page.advance(400);
  page.scroll([1000]); page.step();
  assert.equal(page.elements[0].dataset.kordraRevealState, undefined);
  page.scroll([940]); page.step();
  assert.equal(page.elements[0].dataset.kordraRevealState, 'entering');
});

test('the five release milestones pop their circles in left-to-right sequence', () => {
	const page = browser(Array.from({ length: 5 }, () => ({ flow: true, top: 100, height: 90 })));
	page.enterFlow(); page.step();
	assert.deepEqual(page.flowItems.map((item) => item.dataset.kordraRevealState), ['entering', 'entering', 'entering', 'entering', 'entering']);

	const markerDelays = page.gsapCalls.tweens
		.filter((tween) => tween.target.kind === 'node')
		.map((tween) => tween.vars.delay);
	assert.deepEqual(markerDelays, [0, 0.28, 0.56, 0.84, 1.12]);
	const firstStep = page.gsapCalls.tweens.filter((tween) => tween.target.owner === page.flowItems[0]);
	assert.deepEqual(firstStep.map((tween) => tween.vars.delay), [0, 0.04, 0.08]);
	assert.deepEqual(firstStep.map((tween) => tween.vars.duration), [0.2, 0.19, 0.18]);
	assert.equal(page.wheel(120), true, 'active reveals gently pace wheel input');
	assert.ok(Math.abs(page.scrollByCalls[0].top - 86.4) < 1e-9);
	assert.equal(page.scrollByCalls[0].behavior, 'instant');
	assert.equal(page.key('ArrowDown'), false, 'homepage reveals do not intercept scroll keys');

	page.advance(260);
	assert.equal(page.flowItems[0].dataset.kordraRevealState, 'complete');
	assert.equal(page.flowItems[0].copy.style.opacity, 1, 'the first step finishes within 260ms');
	assert.equal(page.flowItems[1].node.style.opacity, 0, 'the next marker has not started yet');
	page.advance(20);
	assert.equal(page.flowItems[1].node.style.opacity, 0, 'the next marker starts after the 280ms interval');
	page.advance(120);
	assert.deepEqual(page.flowItems.slice(1).map((item) => item.dataset.kordraRevealState), ['entering', 'entering', 'entering', 'entering']);
	page.advance(1600);
	assert.ok(page.flowItems.every((item) => item.dataset.kordraRevealState === 'complete'));
	const pacedCalls = page.scrollByCalls.length;
	assert.equal(page.wheel(120), false, 'scroll pacing ends when the reveals complete');
	assert.equal(page.scrollByCalls.length, pacedCalls);
});

test('scroll changes recover visible targets even if IntersectionObserver skips an entry', () => {
	const page = browser([{ top: 1800 }, { top: 2400 }], { innerHeight: 1000 });
	page.scrollWithoutObserver([200, 1400]);
	page.step();
	assert.equal(page.elements[0].dataset.kordraRevealState, 'entering');
	assert.equal(page.elements[1].dataset.kordraRevealState, 'waiting');
	page.advance(400);
	assert.equal(page.elements[0].dataset.kordraRevealState, 'complete');
});

test('leaving targets cancels offscreen delays and accelerates the visible sequence', () => {
	const page = browser([
		{ flow: true, top: 100, height: 90 },
		{ flow: true, top: 300, height: 90 },
		{ flow: true, top: 500, height: 90 },
		{ flow: true, top: 700, height: 90 },
	], { innerHeight: 600 });
	page.enter([0, 1, 2]); page.step();
	page.advance(80);
	page.scroll([-100, 100, 300, 500]);
	page.step();
	assert.equal(page.flowItems[0].dataset.kordraRevealState, undefined);
	const visibleStarts = page.gsapCalls.tweens.filter((tween) => tween.target.kind === 'node' && !tween.killed);
	assert.deepEqual(visibleStarts.map((tween) => tween.vars.delay), [0, 0.28, 0.544]);
});

test('wheel pacing yields to idle scrolling, browser controls, horizontal input and the open menu', () => {
	const idle = browser([{ top: 100 }]);
	assert.equal(idle.wheel(120), false);
	assert.deepEqual(idle.scrollByCalls, []);

	const active = browser([{ top: 100 }]);
	active.enter(0); active.step();
	assert.equal(active.wheel(120, { ctrlKey: true }), false, 'browser zoom remains native');
	assert.equal(active.wheel(120, { metaKey: true }), false);
	assert.equal(active.wheel(120, { shiftKey: true }), false, 'shift-wheel horizontal scrolling remains native');
	assert.equal(active.wheel(120, { deltaX: 160 }), false, 'horizontal trackpad scrolling remains native');
	assert.equal(active.wheel(120, { cancelable: false }), false);
	assert.deepEqual(active.scrollByCalls, []);

	const menu = browser([{ top: 100 }], { menuOpen: true });
	menu.enter(0); menu.step();
	assert.equal(menu.wheel(120), false, 'the menu keeps its own scrolling behavior');
	assert.deepEqual(menu.scrollByCalls, []);
});

test('wheel pacing normalizes line/page deltas and caps unusually large wheel impulses', () => {
	const lines = browser([{ top: 100 }]);
	lines.enter(0); lines.step();
	assert.equal(lines.wheel(-3, { deltaMode: 1 }), true);
	assert.equal(lines.scrollByCalls[0].top, -34.56);

	const pages = browser([{ top: 100 }], { innerHeight: 900 });
	pages.enter(0); pages.step();
	assert.equal(pages.wheel(2, { deltaMode: 2 }), true);
	assert.equal(pages.scrollByCalls[0].top, 180, 'large page-mode input is capped');

	const impulse = browser([{ top: 100 }]);
	impulse.enter(0); impulse.step();
	assert.equal(impulse.wheel(2000), true);
	assert.equal(impulse.scrollByCalls[0].top, 180, 'large pixel-mode input is capped');
});

test('a quick full exit and return cancels stale sequencing delay', () => {
	const page = browser(Array.from({ length: 5 }, () => ({ flow: true, top: 100, height: 90 })));
	page.enterFlow(); page.step();
	const firstRunTweens = page.gsapCalls.tweens.length;
	page.advance(80);
	page.leaveFlow();
	assert.ok(page.flowItems.every((item) => item.dataset.kordraRevealState === undefined));

	page.enterFlow(); page.step();
	const replayMarker = page.gsapCalls.tweens.slice(firstRunTweens).find((tween) => tween.target.kind === 'node');
	assert.equal(replayMarker.vars.delay, 0, 'replay begins immediately instead of inheriting the abandoned queue');
	assert.ok(page.flowItems.every((item) => item.dataset.kordraRevealState === 'entering'));
});

test('the Foundation paragraph completes before its repository action begins', () => {
  const page = browser([
    { top: 400, statusCopy: true },
    { top: 500, statusAction: true },
  ]);
  page.enter([0, 1]); page.step();
  const copyStart = page.gsapCalls.tweens.find((tween) => tween.target === page.elements[0]).vars.delay;
  const actionStart = page.gsapCalls.tweens.find((tween) => tween.target === page.elements[1]).vars.delay;
  assert.ok(actionStart >= copyStart + 0.39);
  page.advance(900);
  assert.equal(page.elements[0].dataset.kordraRevealState, 'complete');
  assert.equal(page.elements[1].dataset.kordraRevealState, 'complete');
});

test('orbit satellites, dotted ring and circles respond to scroll progress', () => {
  const page = browser([], { orbit: true, orbitTop: 800 });
  page.moveOrbit(700);
  const firstRotation = page.orbitNodes.satellites.style.rotation;
  const firstLabelX = page.orbitNodes.labels[0].attributes.x;
  const firstDash = page.orbitNodes.dotted.attributes['stroke-dashoffset'];
  page.moveOrbit(180);
  assert.notEqual(page.orbitNodes.satellites.style.rotation, firstRotation);
  assert.equal(page.orbitNodes.links.style.rotation, page.orbitNodes.satellites.style.rotation, 'connection lines rotate with their endpoint dots');
  assert.notEqual(page.orbitNodes.labels[0].attributes.x, firstLabelX, 'satellite labels follow the nodes without rotating their text');
  assert.notEqual(page.orbitNodes.dotted.attributes['stroke-dashoffset'], firstDash);
  assert.notEqual(page.orbitNodes.middle.style.scale, undefined);
  assert.equal(page.gsapCalls.tweens.filter((tween) => !tween.killed).length, 9, 'scroll motion replaces prior tweens instead of accumulating them');
});

test('focus immediately exposes its target and cancels an in-progress tween', () => {
  const page = browser([{ top: 100 }]);
  page.enter(0); page.step();
  const tween = page.gsapCalls.tweens.find((animation) => animation.target === page.elements[0]);
  page.focus(0);
  assert.equal(page.elements[0].dataset.kordraRevealState, 'complete');
  assert.equal(page.elements[0].style.opacity, undefined);
  assert.equal(tween.killed, true);
});

test('reduced motion keeps content visible and changing the preference restores behavior safely', () => {
  const page = browser([{ top: 100 }], { reduced: true });
  assert.equal(page.elements[0].dataset.kordraRevealState, undefined);
  assert.equal(page.elements[0].style.opacity, undefined);
  page.reduce(false);
  assert.equal(page.observer.observed.size, 1);
  page.enter(0); page.step();
  assert.equal(page.elements[0].dataset.kordraRevealState, 'entering');
  page.reduce(true);
  assert.equal(page.elements[0].dataset.kordraRevealState, undefined);
  assert.equal(page.elements[0].style.opacity, undefined);
  assert.equal(page.observer.disconnected, true);

  const reducedWheel = browser([{ top: 100 }], { reduced: true });
  assert.equal(reducedWheel.wheel(120), false, 'reduced motion keeps wheel scrolling native');
});

test('content stays readable when GSAP or IntersectionObserver is unavailable', () => {
  const withoutGsap = browser([{ top: 100 }], { gsap: false });
  const withoutObserver = browser([{ top: 100 }], { observer: false });
  for (const page of [withoutGsap, withoutObserver]) {
    assert.equal(page.elements[0].dataset.kordraRevealState, undefined);
    assert.equal(page.elements[0].style.opacity, undefined);
  }
});

test('hiding the document pauses and resuming it continues active animations', () => {
  const page = browser([{ top: 100 }]);
  page.enter(0); page.step();
  const tween = page.gsapCalls.tweens.find((animation) => animation.target === page.elements[0]);
  page.setHidden(true);
  assert.equal(tween.paused(), true);
  page.setHidden(false);
  assert.equal(tween.paused(), false);
});

test('teardown restores content, disconnects observers and removes listeners', () => {
  const page = browser([{ top: 100 }, { flow: true, top: 200 }], { orbit: true });
  page.enter([0, 1]); page.step();
  page.controller.destroy();
  assert.equal(page.elements[0].dataset.kordraRevealState, undefined);
  assert.equal(page.elements[1].dataset.kordraRevealState, undefined);
  assert.equal(page.elements[0].style.opacity, undefined);
  assert.equal(page.elements[1].node.style.opacity, undefined);
  assert.equal(page.observer.disconnected, true);
  assert.deepEqual(page.eventCounts, { window: 0, document: 0 });
});

test('script reinitialization does not duplicate observers or event handlers', () => {
  const page = browser([{ top: 100 }]);
  const firstObserver = page.observer;
  page.reinitialize();
  assert.equal(firstObserver.disconnected, true);
  assert.equal(page.observer.observed.size, 1);
  assert.deepEqual(page.eventCounts, { window: 3, document: 2 });
});

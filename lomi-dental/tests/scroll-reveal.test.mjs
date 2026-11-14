import { test } from "node:test";
import assert from "node:assert/strict";
import { setupScrollReveals } from "../src/scroll-reveal.mjs";

function fixture({ reduced = false, supported = true } = {}) {
  const listeners = new Map();
  const preferenceListeners = new Map();
  const elements = [];
  const animations = [];
  const preference = {
    matches: reduced,
    addEventListener: (name, handler) => preferenceListeners.set(name, handler),
    removeEventListener: (name) => preferenceListeners.delete(name),
  };
  let observer;
  const root = {
    activeElement: null,
    querySelectorAll: () => elements,
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
  };
  class Element {
    constructor(top = 900) {
      this.top = top;
      this.children = [];
      this.parentElement = null;
      this.inForm = false;
      elements.push(this);
    }
    closest() {
      return this.inForm ? {} : null;
    }
    querySelector() {
      return null;
    }
    contains(other) {
      return other === this || this.children.includes(other);
    }
    getBoundingClientRect() {
      return { top: this.top, height: 200 };
    }
    animate(keyframes, options) {
      const animation = {
        target: this,
        keyframes,
        options,
        cancelled: false,
        finished: new Promise(() => {}),
        cancel() {
          this.cancelled = true;
        },
      };
      animations.push(animation);
      return animation;
    }
  }
  const view = {
    innerHeight: 700,
    Element,
    matchMedia: () => preference,
    IntersectionObserver: supported
      ? class {
          constructor(callback) {
            this.callback = callback;
            this.observed = new Set();
            this.disconnected = false;
            observer = this;
          }
          observe(element) {
            this.observed.add(element);
          }
          unobserve(element) {
            this.observed.delete(element);
          }
          disconnect() {
            this.disconnected = true;
            this.observed.clear();
          }
        }
      : undefined,
  };
  return {
    root,
    view,
    Element,
    preference,
    preferenceListeners,
    listeners,
    animations,
    get observer() {
      return observer;
    },
  };
}

test("Scroll reveals leave visible content and form controls immediately available", () => {
  const f = fixture();
  const visible = new f.Element(100);
  const belowFold = new f.Element(900);
  const form = new f.Element(1000);
  form.inForm = true;
  setupScrollReveals(f.root, f.view);
  assert.ok(!f.observer.observed.has(visible));
  assert.ok(!f.observer.observed.has(form));
  assert.ok(f.observer.observed.has(belowFold));
  assert.equal(f.animations.length, 0);
});

test("Scroll reveals animate once with a bounded stagger and no persistent transform", () => {
  const f = fixture();
  const targets = Array.from({ length: 4 }, () => new f.Element());
  setupScrollReveals(f.root, f.view);
  const entries = targets.map((target) => ({ target, isIntersecting: true }));
  f.observer.callback(entries);
  f.observer.callback(entries);
  assert.equal(f.animations.length, 4);
  assert.deepEqual(
    f.animations.map((animation) => animation.options.delay),
    [0, 60, 120, 120],
  );
  assert.ok(
    f.animations.every((animation) => animation.options.fill === "backwards"),
  );
  assert.equal(f.observer.observed.size, 0);
});

test("Scroll reveals respect reduced motion and unsupported-browser fallbacks", () => {
  for (const options of [{ reduced: true }, { supported: false }]) {
    const f = fixture(options);
    new f.Element();
    const cleanup = setupScrollReveals(f.root, f.view);
    assert.equal(f.observer, undefined);
    assert.equal(f.animations.length, 0);
    cleanup();
  }
});

test("Keyboard focus cancels entrance motion and prevents replay", () => {
  const f = fixture();
  const target = new f.Element();
  const link = {};
  target.children.push(link);
  setupScrollReveals(f.root, f.view);
  f.observer.callback([{ target, isIntersecting: true }]);
  f.listeners.get("focusin")({ target: link });
  assert.equal(f.animations[0].cancelled, true);
  f.observer.callback([{ target, isIntersecting: true }]);
  assert.equal(f.animations.length, 1);
});

test("Enabling reduced motion during a reveal cancels motion and disconnects observation", () => {
  const f = fixture();
  const target = new f.Element();
  setupScrollReveals(f.root, f.view);
  f.observer.callback([{ target, isIntersecting: true }]);
  f.preference.matches = true;
  f.preferenceListeners.get("change")();
  assert.equal(f.animations[0].cancelled, true);
  assert.equal(f.observer.disconnected, true);
  assert.equal(f.listeners.size, 0);
  assert.equal(f.preferenceListeners.size, 0);
});

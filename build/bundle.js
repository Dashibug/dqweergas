
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$1() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop$1;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop$1, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */


    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var createNanoEvents = function () {
        var events = {};
        var emit = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            for (var _a = 0, _b = events[event] || []; _a < _b.length; _a++) {
                var listener = _b[_a];
                listener.apply(void 0, args);
            }
        };
        var on = function (event, cb) {
            (events[event] = events[event] || []).push(cb);
            return function () {
                events[event] = events[event].filter(function (i) { return i !== cb; });
            };
        };
        var once = function (event, cb) {
            // eslint-disable-next-line
            // @ts-ignore И вот тут я сдался
            var off = on(event, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                cb.apply(void 0, args);
                off();
            });
            return off;
        };
        var clear = function () {
            events = {};
        };
        return {
            events: events,
            emit: emit,
            on: on,
            once: once,
            clear: clear,
        };
    };

    var createNanoObservable = function (observerFunc) {
        var _a = createNanoEvents(), on = _a.on, emit = _a.emit;
        var subscribe = function (_a) {
            var next = _a.next;
            var unsubscribe = on('next', next);
            return { unsubscribe: unsubscribe };
        };
        observerFunc({
            next: function (data) {
                emit('next', data);
            },
        });
        return {
            subscribe: subscribe,
        };
    };

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    let getRandomValues;
    const rnds8 = new Uint8Array(16);
    function rng() {
      // lazy load so that environments that need to polyfill have a chance to do so
      if (!getRandomValues) {
        // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
        getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

        if (!getRandomValues) {
          throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
      }

      return getRandomValues(rnds8);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */

    const byteToHex = [];

    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).slice(1));
    }

    function unsafeStringify(arr, offset = 0) {
      // Note: Be careful editing this code!  It's been tuned for performance
      // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
      return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
    }

    const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
    var native = {
      randomUUID
    };

    function v4(options, buf, offset) {
      if (native.randomUUID && !buf && !options) {
        return native.randomUUID();
      }

      options = options || {};
      const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        offset = offset || 0;

        for (let i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }

        return buf;
      }

      return unsafeStringify(rnds);
    }

    var isDeepEqual = function (a, b) {
        // Простое значение
        if (typeof a !== 'object' || a === null) {
            return a === b;
        }
        // Массив
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length !== b.length) {
                return false;
            }
            return !a.some(function (valA, key) { return !isDeepEqual(valA, b[key]); });
        }
        // Словарь
        if (typeof b !== 'object' || b === null) {
            return false;
        }
        var entriesA = Object.entries(a);
        var entriesB = Object.entries(b);
        if (entriesA.length !== entriesB.length) {
            return false;
        }
        return !entriesA.some(function (_a) {
            var key = _a[0], valA = _a[1];
            return !(key in b && isDeepEqual(valA, b[key]));
        });
    };
    var findCommandIndex = function (arr, command) {
        var insets = ['insets', 'minimum_static_insets', 'maximum_static_insets', 'dynamic_insets'];
        var index = -1;
        if (command.type === 'character') {
            index = arr.findIndex(function (c) { return c.type === 'character' && c.character.id === command.character.id; });
        }
        else if (insets.includes(command.type)) {
            index = arr.findIndex(function (c) { return c.type === command.type; });
        }
        else if (command.type === 'app_context') {
            index = arr.findIndex(function (c) { return c.type === 'app_context'; });
        }
        else {
            index = arr.findIndex(function (c) { return isDeepEqual(c, command); });
        }
        return index;
    };
    var appInitialData = (function () {
        var isPulled = false;
        var pulled = [];
        var committed = [];
        var diff = [];
        var isCommandWasPulled = function (command) { return findCommandIndex(pulled, command) >= 0; };
        return {
            /**
             * Прочитать appInitialData. Запоминает состояние на момент прочтения
             * @returns Массив комманд
             */
            pull: function () {
                isPulled = true;
                pulled = __spreadArray([], (window.appInitialData || []));
                return __spreadArray([], pulled);
            },
            /**
             * Прочитать appInitialData
             * @returns Массив комманд
             */
            get: function () { return __spreadArray([], (window.appInitialData || [])); },
            /**
             * Зафиксировать текущее состояние appInitialData
             */
            commit: function () {
                committed = __spreadArray([], (window.appInitialData || []));
                diff =
                    isPulled === true
                        ? (window.appInitialData || []).filter(function (c) { return !isCommandWasPulled(c); })
                        : __spreadArray([], (window.appInitialData || []));
            },
            /**
             * Возвращает диф appInitialData между pull и commit
             * @returns Массив комманд
             */
            diff: function () {
                return __spreadArray([], diff);
            },
            /**
             * Возвращает флаг наличия command в appInitialData на момент commit
             * @param command Команда, которую нужно проверить на наличие в appInitialData
             * @returns true - если команда была в appInitialData
             */
            isCommitted: function (command) {
                var commandIndex = findCommandIndex(committed, command);
                var isCommitted = commandIndex >= 0;
                if (isCommitted) {
                    committed.splice(commandIndex, 1);
                }
                return isCommitted;
            },
            /**
             * Возвращает первое сообщение из appInitialData, подходящее под фильтры param
             * @param param Параметры: тип сообщения (например, smart_app_data)
             * и тип команды (значение поля smart_app_data.type)
             * @returns Первое сообщение, соответствующее параметрам или undefined
             */
            find: function (_a) {
                var type = _a.type, command = _a.command;
                var initialCommands = __spreadArray([], (window.appInitialData || []));
                var result = initialCommands.find(function (initialCommand) {
                    if (!command && type && type === initialCommand.type) {
                        return true;
                    }
                    var isCommandInSmartAppData = command && 'smart_app_data' in initialCommand;
                    if (!isCommandInSmartAppData) {
                        return;
                    }
                    if (command === initialCommand.smart_app_data.command ||
                        command === initialCommand.smart_app_data.type) {
                        return true;
                    }
                    return false;
                });
                return (result && 'smart_app_data' in result ? result.smart_app_data : result);
            },
        };
    })();

    var excludeTags = ['A', 'AUDIO', 'BUTTON', 'INPUT', 'OPTION', 'SELECT', 'TEXTAREA', 'VIDEO'];
    function inIframe() {
        try {
            return window.self !== window.top;
        }
        catch (e) {
            return true;
        }
    }
    if (typeof window !== 'undefined' && inIframe()) {
        var postMessage_1 = function (action) {
            var _a;
            (_a = window.top) === null || _a === void 0 ? void 0 : _a.postMessage(JSON.stringify(action), '*');
        };
        var historyBack_1 = function () {
            var prevPage = window.location.href;
            window.history.back();
            setTimeout(function () {
                // закрываем страницу, если переход назад не поменял урл
                if (window.location.href === prevPage) {
                    postMessage_1({ type: 'close' });
                }
            }, 500);
        };
        window.appInitialData = [];
        window.AssistantHost = {
            sendDataContainer: function (json) {
                postMessage_1({ type: 'sendDataContainer', payload: json });
            },
            close: function () {
                postMessage_1({ type: 'close' });
            },
            sendData: function (json) {
                postMessage_1({ type: 'sendData', payload: json });
            },
            setSuggests: function (suggests) {
                postMessage_1({ type: 'setSuggests', payload: suggests });
            },
            setHints: function (hints) {
                postMessage_1({ type: 'setHints', payload: hints });
            },
            ready: function () {
                postMessage_1({ type: 'ready' });
            },
            sendText: function (message) {
                postMessage_1({ type: 'sendText', payload: message });
            },
            setHeaderButtons: function (headerButtons) {
                postMessage_1({ type: 'setHeaderButtons', payload: headerButtons });
            },
        };
        window.addEventListener('message', function (e) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            try {
                if (typeof e.data === 'string') {
                    var data = JSON.parse(e.data);
                    switch (data.type) {
                        case 'onBack':
                            historyBack_1();
                            break;
                        case 'onData':
                            (_b = (_a = window.AssistantClient) === null || _a === void 0 ? void 0 : _a.onData) === null || _b === void 0 ? void 0 : _b.call(_a, data.payload);
                            break;
                        case 'onRequestState': {
                            var state = (_d = (_c = window.AssistantClient) === null || _c === void 0 ? void 0 : _c.onRequestState) === null || _d === void 0 ? void 0 : _d.call(_c);
                            postMessage_1({ type: 'state', payload: state, requestId: data.requestId });
                            break;
                        }
                        case 'onRequestRecoveryState': {
                            var recoverystate = (_f = (_e = window.AssistantClient) === null || _e === void 0 ? void 0 : _e.onRequestRecoveryState) === null || _f === void 0 ? void 0 : _f.call(_e);
                            postMessage_1({ type: 'recoveryState', payload: recoverystate });
                            break;
                        }
                        case 'onStart':
                            (_h = (_g = window.AssistantClient) === null || _g === void 0 ? void 0 : _g.onStart) === null || _h === void 0 ? void 0 : _h.call(_g);
                            break;
                        default:
                            // eslint-disable-next-line no-console
                            console.error(e, 'Unknown parsed message');
                            break;
                    }
                }
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(err, 'Unknown message');
            }
        });
        window.addEventListener('keydown', function (_a) {
            var _b, _c;
            var code = _a.code;
            switch (code) {
                case 'Enter':
                    if (document.activeElement && !excludeTags.includes(document.activeElement.tagName)) {
                        (_c = (_b = document.activeElement).click) === null || _c === void 0 ? void 0 : _c.call(_b);
                    }
                    break;
                case 'Escape':
                    historyBack_1();
                    break;
            }
        });
    }
    var createAssistant$1 = function (_a) {
        var _b;
        var getState = _a.getState, getRecoveryState = _a.getRecoveryState, _c = _a.ready, ready = _c === void 0 ? true : _c;
        var _d = createNanoEvents(), on = _d.on, emitOriginal = _d.emit;
        var _e = createNanoEvents(), subscribeToCommand = _e.on, emitAllCommands = _e.emit;
        var observables = new Map();
        var currentGetState = getState;
        var currentGetRecoveryState = getRecoveryState;
        var isInitialCommandsEmitted = false;
        var readyRetries = 0;
        var emitCommand = function (command) {
            if (command.type === 'smart_app_data') {
                emitOriginal('command', command.smart_app_data);
            }
            if (command.type === 'smart_app_error') {
                emitOriginal('error', command.smart_app_error);
            }
            return emitOriginal('data', command);
        };
        var cancelTts = typeof ((_b = window.AssistantHost) === null || _b === void 0 ? void 0 : _b.cancelTts) !== 'undefined'
            ? function () {
                var _a, _b;
                (_b = (_a = window.AssistantHost).cancelTts) === null || _b === void 0 ? void 0 : _b.call(_a, '');
            }
            : undefined;
        var emitAppInitialData = function () {
            if (!isInitialCommandsEmitted) {
                appInitialData.diff().forEach(function (c) { return emitCommand(c); });
                isInitialCommandsEmitted = true;
            }
        };
        var saveFirstSmartAppDataMid = function (mid) {
            // eslint-disable-next-line no-underscore-dangle
            if (typeof window.__ASSISTANT_CLIENT__.firstSmartAppDataMid === 'undefined') {
                // eslint-disable-next-line no-underscore-dangle
                window.__ASSISTANT_CLIENT__.firstSmartAppDataMid = mid;
            }
        };
        window.AssistantClient = {
            onData: function (command) {
                var _a, _b, _c, _d, _e;
                if (appInitialData.isCommitted(command)) {
                    return;
                }
                emitAllCommands(command.type, command);
                if (command.type === 'smart_app_data' && (((_a = command.sdk_meta) === null || _a === void 0 ? void 0 : _a.mid) || '-1') !== '-1') {
                    saveFirstSmartAppDataMid((_b = command.sdk_meta) === null || _b === void 0 ? void 0 : _b.mid);
                }
                /// фильтр команды 'назад'
                /// может приходить type='system', но в типах это не отражаем
                // @ts-ignore
                if (command.type === 'system' && ((_d = (_c = command.system) === null || _c === void 0 ? void 0 : _c.command) === null || _d === void 0 ? void 0 : _d.toUpperCase()) === 'BACK') {
                    return;
                }
                if (command.type === 'tts_state_update') {
                    emitOriginal('tts', {
                        state: command.state,
                        owner: command.owner,
                    });
                }
                if ((command.type === 'smart_app_data' || command.type === 'smart_app_error') &&
                    ((_e = command.sdk_meta) === null || _e === void 0 ? void 0 : _e.requestId) &&
                    observables.has(command.sdk_meta.requestId)) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    var _f = command.sdk_meta; _f.requestId; var meta = __rest(_f, ["requestId"]);
                    var _g = observables.get(command.sdk_meta.requestId) || {}, requestId = _g.requestId, next = _g.next;
                    if (Object.keys(meta).length > 0 || requestId) {
                        // eslint-disable-next-line camelcase
                        command.sdk_meta = __assign({}, meta);
                        if (requestId) {
                            // eslint-disable-next-line camelcase
                            command.sdk_meta = { requestId: requestId };
                        }
                    }
                    next === null || next === void 0 ? void 0 : next(command.type === 'smart_app_data' ? command : command);
                }
                emitCommand(command);
            },
            onRequestState: function () {
                return currentGetState();
            },
            onRequestRecoveryState: function () {
                if (currentGetRecoveryState) {
                    return currentGetRecoveryState();
                }
                return undefined;
            },
            onStart: function () {
                emitOriginal('start');
                emitAppInitialData();
            },
        };
        var readyFn = function () { return __awaiter(void 0, void 0, void 0, function () {
            var firstSmartAppDataMid;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                readyRetries += 1;
                if (typeof ((_a = window.AssistantHost) === null || _a === void 0 ? void 0 : _a.ready) !== 'function') {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var _a;
                            if (readyRetries > 3) {
                                throw new Error("window.AssistantHost is not ready. The ready method has the type \"" + typeof ((_a = window.AssistantHost) === null || _a === void 0 ? void 0 : _a.ready) + "\"");
                            }
                            window.setTimeout(function () {
                                readyFn().then(resolve, reject);
                            }, 500);
                        })];
                }
                firstSmartAppDataMid = ((_c = (_b = appInitialData.get().find(function (c) {
                    var _a;
                    return c.type === 'smart_app_data' && (((_a = c.sdk_meta) === null || _a === void 0 ? void 0 : _a.mid) || '-1') !== '-1';
                    // @ts-ignore
                })) === null || _b === void 0 ? void 0 : _b.sdk_meta) === null || _c === void 0 ? void 0 : _c.mid) || '-1';
                if (firstSmartAppDataMid !== '-1') {
                    saveFirstSmartAppDataMid(firstSmartAppDataMid);
                }
                appInitialData.commit();
                window.AssistantHost.ready();
                return [2 /*return*/];
            });
        }); };
        if (ready) {
            window.setTimeout(readyFn); // таймаут для подписки на start
        }
        var sendData = function (_a, onData) {
            var _b, _c, _d;
            var action = _a.action, name = _a.name, requestId = _a.requestId;
            if ((_b = window.AssistantHost) === null || _b === void 0 ? void 0 : _b.sendDataContainer) {
                if (onData == null) {
                    (_c = window.AssistantHost) === null || _c === void 0 ? void 0 : _c.sendDataContainer(
                    /* eslint-disable-next-line camelcase */
                    JSON.stringify({ data: action, message_name: name || '', requestId: requestId }));
                    return function () { };
                }
                if (requestId && observables.has(requestId)) {
                    throw new Error('requestId должен быть уникальным');
                }
                var realRequestId_1 = requestId || v4();
                var subscribe = createNanoObservable(function (_a) {
                    var _b;
                    var next = _a.next;
                    (_b = window.AssistantHost) === null || _b === void 0 ? void 0 : _b.sendDataContainer(
                    /* eslint-disable-next-line camelcase */
                    JSON.stringify({ data: action, message_name: name || '', requestId: realRequestId_1 }));
                    observables.set(realRequestId_1, { next: next, requestId: requestId });
                }).subscribe;
                var unsubscribe_1 = subscribe({ next: onData }).unsubscribe;
                return function () {
                    unsubscribe_1();
                    observables.delete(realRequestId_1);
                };
            }
            if (onData != null) {
                throw new Error('Не поддерживается в данной версии клиента');
            }
            (_d = window.AssistantHost) === null || _d === void 0 ? void 0 : _d.sendData(JSON.stringify(action), name || null);
            return function () { };
        };
        return {
            cancelTts: cancelTts,
            close: function () { var _a; return (_a = window.AssistantHost) === null || _a === void 0 ? void 0 : _a.close(); },
            getInitialData: appInitialData.pull,
            findInInitialData: appInitialData.find,
            getRecoveryState: function () { return window.appRecoveryState; },
            on: on,
            subscribeToCommand: subscribeToCommand,
            sendAction: function (action, onData, onError, _a) {
                var _b = _a === void 0 ? {} : _a, name = _b.name, requestId = _b.requestId;
                return sendData({ action: action, name: name, requestId: requestId }, function (data) {
                    if (data.type === 'smart_app_data') {
                        onData === null || onData === void 0 ? void 0 : onData(data.smart_app_data);
                    }
                    if (data.type === 'smart_app_error') {
                        onError === null || onError === void 0 ? void 0 : onError(data.smart_app_error);
                    }
                });
            },
            sendData: sendData,
            setGetState: function (nextGetState) {
                currentGetState = nextGetState;
            },
            setGetRecoveryState: function (nextGetRecoveryState) {
                currentGetRecoveryState = nextGetRecoveryState;
            },
            setSuggests: function (suggestions) {
                var _a;
                (_a = window.AssistantHost) === null || _a === void 0 ? void 0 : _a.setSuggests(JSON.stringify({ suggestions: { buttons: suggestions } }));
            },
            setHints: function (hints) {
                var _a;
                (_a = window.AssistantHost) === null || _a === void 0 ? void 0 : _a.setHints(JSON.stringify({ hints: hints }));
            },
            sendText: function (message) { var _a; return (_a = window.AssistantHost) === null || _a === void 0 ? void 0 : _a.sendText(message); },
            setHeaderButtons: function (headerButtons) {
                var _a, _b;
                if (!((_a = window.AssistantHost) === null || _a === void 0 ? void 0 : _a.setHeaderButtons)) {
                    throw new Error('setHeaderButtons не поддерживается в данной версии клиента');
                }
                (_b = window.AssistantHost) === null || _b === void 0 ? void 0 : _b.setHeaderButtons(JSON.stringify(headerButtons));
            },
            ready: readyFn,
        };
    };
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-underscore-dangle
        window.__ASSISTANT_CLIENT__ = { version: '1.17.4' };
    }

    // eslint-disable-next-line no-shadow
    var VpsVersion;
    (function (VpsVersion) {
        VpsVersion[VpsVersion["1.0"] = 1] = "1.0";
        VpsVersion[VpsVersion["2.0"] = 2] = "2.0";
        VpsVersion[VpsVersion["3.0"] = 3] = "3.0";
        VpsVersion[VpsVersion["4.0"] = 4] = "4.0";
        VpsVersion[VpsVersion["5.0"] = 5] = "5.0";
    })(VpsVersion || (VpsVersion = {}));
    var MessageNames = {
        ANSWER_TO_USER: 'ANSWER_TO_USER',
        STT: 'STT',
        MUSIC_RECOGNITION: 'MUSIC_RECOGNITION',
        DO_NOTHING: 'DO_NOTHING',
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function commonjsRequire(path) {
    	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
    }

    var proto = {exports: {}};

    var indexMinimal = {};

    var minimal$1 = {};

    var aspromise;
    var hasRequiredAspromise;

    function requireAspromise () {
    	if (hasRequiredAspromise) return aspromise;
    	hasRequiredAspromise = 1;
    	aspromise = asPromise;

    	/**
    	 * Callback as used by {@link util.asPromise}.
    	 * @typedef asPromiseCallback
    	 * @type {function}
    	 * @param {Error|null} error Error, if any
    	 * @param {...*} params Additional arguments
    	 * @returns {undefined}
    	 */

    	/**
    	 * Returns a promise from a node-style callback function.
    	 * @memberof util
    	 * @param {asPromiseCallback} fn Function to call
    	 * @param {*} ctx Function context
    	 * @param {...*} params Function arguments
    	 * @returns {Promise<*>} Promisified function
    	 */
    	function asPromise(fn, ctx/*, varargs */) {
    	    var params  = new Array(arguments.length - 1),
    	        offset  = 0,
    	        index   = 2,
    	        pending = true;
    	    while (index < arguments.length)
    	        params[offset++] = arguments[index++];
    	    return new Promise(function executor(resolve, reject) {
    	        params[offset] = function callback(err/*, varargs */) {
    	            if (pending) {
    	                pending = false;
    	                if (err)
    	                    reject(err);
    	                else {
    	                    var params = new Array(arguments.length - 1),
    	                        offset = 0;
    	                    while (offset < params.length)
    	                        params[offset++] = arguments[offset];
    	                    resolve.apply(null, params);
    	                }
    	            }
    	        };
    	        try {
    	            fn.apply(ctx || null, params);
    	        } catch (err) {
    	            if (pending) {
    	                pending = false;
    	                reject(err);
    	            }
    	        }
    	    });
    	}
    	return aspromise;
    }

    var base64 = {};

    var hasRequiredBase64;

    function requireBase64 () {
    	if (hasRequiredBase64) return base64;
    	hasRequiredBase64 = 1;
    	(function (exports) {

    		/**
    		 * A minimal base64 implementation for number arrays.
    		 * @memberof util
    		 * @namespace
    		 */
    		var base64 = exports;

    		/**
    		 * Calculates the byte length of a base64 encoded string.
    		 * @param {string} string Base64 encoded string
    		 * @returns {number} Byte length
    		 */
    		base64.length = function length(string) {
    		    var p = string.length;
    		    if (!p)
    		        return 0;
    		    var n = 0;
    		    while (--p % 4 > 1 && string.charAt(p) === "=")
    		        ++n;
    		    return Math.ceil(string.length * 3) / 4 - n;
    		};

    		// Base64 encoding table
    		var b64 = new Array(64);

    		// Base64 decoding table
    		var s64 = new Array(123);

    		// 65..90, 97..122, 48..57, 43, 47
    		for (var i = 0; i < 64;)
    		    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;

    		/**
    		 * Encodes a buffer to a base64 encoded string.
    		 * @param {Uint8Array} buffer Source buffer
    		 * @param {number} start Source start
    		 * @param {number} end Source end
    		 * @returns {string} Base64 encoded string
    		 */
    		base64.encode = function encode(buffer, start, end) {
    		    var parts = null,
    		        chunk = [];
    		    var i = 0, // output index
    		        j = 0, // goto index
    		        t;     // temporary
    		    while (start < end) {
    		        var b = buffer[start++];
    		        switch (j) {
    		            case 0:
    		                chunk[i++] = b64[b >> 2];
    		                t = (b & 3) << 4;
    		                j = 1;
    		                break;
    		            case 1:
    		                chunk[i++] = b64[t | b >> 4];
    		                t = (b & 15) << 2;
    		                j = 2;
    		                break;
    		            case 2:
    		                chunk[i++] = b64[t | b >> 6];
    		                chunk[i++] = b64[b & 63];
    		                j = 0;
    		                break;
    		        }
    		        if (i > 8191) {
    		            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
    		            i = 0;
    		        }
    		    }
    		    if (j) {
    		        chunk[i++] = b64[t];
    		        chunk[i++] = 61;
    		        if (j === 1)
    		            chunk[i++] = 61;
    		    }
    		    if (parts) {
    		        if (i)
    		            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
    		        return parts.join("");
    		    }
    		    return String.fromCharCode.apply(String, chunk.slice(0, i));
    		};

    		var invalidEncoding = "invalid encoding";

    		/**
    		 * Decodes a base64 encoded string to a buffer.
    		 * @param {string} string Source string
    		 * @param {Uint8Array} buffer Destination buffer
    		 * @param {number} offset Destination offset
    		 * @returns {number} Number of bytes written
    		 * @throws {Error} If encoding is invalid
    		 */
    		base64.decode = function decode(string, buffer, offset) {
    		    var start = offset;
    		    var j = 0, // goto index
    		        t;     // temporary
    		    for (var i = 0; i < string.length;) {
    		        var c = string.charCodeAt(i++);
    		        if (c === 61 && j > 1)
    		            break;
    		        if ((c = s64[c]) === undefined)
    		            throw Error(invalidEncoding);
    		        switch (j) {
    		            case 0:
    		                t = c;
    		                j = 1;
    		                break;
    		            case 1:
    		                buffer[offset++] = t << 2 | (c & 48) >> 4;
    		                t = c;
    		                j = 2;
    		                break;
    		            case 2:
    		                buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
    		                t = c;
    		                j = 3;
    		                break;
    		            case 3:
    		                buffer[offset++] = (t & 3) << 6 | c;
    		                j = 0;
    		                break;
    		        }
    		    }
    		    if (j === 1)
    		        throw Error(invalidEncoding);
    		    return offset - start;
    		};

    		/**
    		 * Tests if the specified string appears to be base64 encoded.
    		 * @param {string} string String to test
    		 * @returns {boolean} `true` if probably base64 encoded, otherwise false
    		 */
    		base64.test = function test(string) {
    		    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
    		}; 
    	} (base64));
    	return base64;
    }

    var eventemitter;
    var hasRequiredEventemitter;

    function requireEventemitter () {
    	if (hasRequiredEventemitter) return eventemitter;
    	hasRequiredEventemitter = 1;
    	eventemitter = EventEmitter;

    	/**
    	 * Constructs a new event emitter instance.
    	 * @classdesc A minimal event emitter.
    	 * @memberof util
    	 * @constructor
    	 */
    	function EventEmitter() {

    	    /**
    	     * Registered listeners.
    	     * @type {Object.<string,*>}
    	     * @private
    	     */
    	    this._listeners = {};
    	}

    	/**
    	 * Registers an event listener.
    	 * @param {string} evt Event name
    	 * @param {function} fn Listener
    	 * @param {*} [ctx] Listener context
    	 * @returns {util.EventEmitter} `this`
    	 */
    	EventEmitter.prototype.on = function on(evt, fn, ctx) {
    	    (this._listeners[evt] || (this._listeners[evt] = [])).push({
    	        fn  : fn,
    	        ctx : ctx || this
    	    });
    	    return this;
    	};

    	/**
    	 * Removes an event listener or any matching listeners if arguments are omitted.
    	 * @param {string} [evt] Event name. Removes all listeners if omitted.
    	 * @param {function} [fn] Listener to remove. Removes all listeners of `evt` if omitted.
    	 * @returns {util.EventEmitter} `this`
    	 */
    	EventEmitter.prototype.off = function off(evt, fn) {
    	    if (evt === undefined)
    	        this._listeners = {};
    	    else {
    	        if (fn === undefined)
    	            this._listeners[evt] = [];
    	        else {
    	            var listeners = this._listeners[evt];
    	            for (var i = 0; i < listeners.length;)
    	                if (listeners[i].fn === fn)
    	                    listeners.splice(i, 1);
    	                else
    	                    ++i;
    	        }
    	    }
    	    return this;
    	};

    	/**
    	 * Emits an event by calling its listeners with the specified arguments.
    	 * @param {string} evt Event name
    	 * @param {...*} args Arguments
    	 * @returns {util.EventEmitter} `this`
    	 */
    	EventEmitter.prototype.emit = function emit(evt) {
    	    var listeners = this._listeners[evt];
    	    if (listeners) {
    	        var args = [],
    	            i = 1;
    	        for (; i < arguments.length;)
    	            args.push(arguments[i++]);
    	        for (i = 0; i < listeners.length;)
    	            listeners[i].fn.apply(listeners[i++].ctx, args);
    	    }
    	    return this;
    	};
    	return eventemitter;
    }

    var float;
    var hasRequiredFloat;

    function requireFloat () {
    	if (hasRequiredFloat) return float;
    	hasRequiredFloat = 1;

    	float = factory(factory);

    	/**
    	 * Reads / writes floats / doubles from / to buffers.
    	 * @name util.float
    	 * @namespace
    	 */

    	/**
    	 * Writes a 32 bit float to a buffer using little endian byte order.
    	 * @name util.float.writeFloatLE
    	 * @function
    	 * @param {number} val Value to write
    	 * @param {Uint8Array} buf Target buffer
    	 * @param {number} pos Target buffer offset
    	 * @returns {undefined}
    	 */

    	/**
    	 * Writes a 32 bit float to a buffer using big endian byte order.
    	 * @name util.float.writeFloatBE
    	 * @function
    	 * @param {number} val Value to write
    	 * @param {Uint8Array} buf Target buffer
    	 * @param {number} pos Target buffer offset
    	 * @returns {undefined}
    	 */

    	/**
    	 * Reads a 32 bit float from a buffer using little endian byte order.
    	 * @name util.float.readFloatLE
    	 * @function
    	 * @param {Uint8Array} buf Source buffer
    	 * @param {number} pos Source buffer offset
    	 * @returns {number} Value read
    	 */

    	/**
    	 * Reads a 32 bit float from a buffer using big endian byte order.
    	 * @name util.float.readFloatBE
    	 * @function
    	 * @param {Uint8Array} buf Source buffer
    	 * @param {number} pos Source buffer offset
    	 * @returns {number} Value read
    	 */

    	/**
    	 * Writes a 64 bit double to a buffer using little endian byte order.
    	 * @name util.float.writeDoubleLE
    	 * @function
    	 * @param {number} val Value to write
    	 * @param {Uint8Array} buf Target buffer
    	 * @param {number} pos Target buffer offset
    	 * @returns {undefined}
    	 */

    	/**
    	 * Writes a 64 bit double to a buffer using big endian byte order.
    	 * @name util.float.writeDoubleBE
    	 * @function
    	 * @param {number} val Value to write
    	 * @param {Uint8Array} buf Target buffer
    	 * @param {number} pos Target buffer offset
    	 * @returns {undefined}
    	 */

    	/**
    	 * Reads a 64 bit double from a buffer using little endian byte order.
    	 * @name util.float.readDoubleLE
    	 * @function
    	 * @param {Uint8Array} buf Source buffer
    	 * @param {number} pos Source buffer offset
    	 * @returns {number} Value read
    	 */

    	/**
    	 * Reads a 64 bit double from a buffer using big endian byte order.
    	 * @name util.float.readDoubleBE
    	 * @function
    	 * @param {Uint8Array} buf Source buffer
    	 * @param {number} pos Source buffer offset
    	 * @returns {number} Value read
    	 */

    	// Factory function for the purpose of node-based testing in modified global environments
    	function factory(exports) {

    	    // float: typed array
    	    if (typeof Float32Array !== "undefined") (function() {

    	        var f32 = new Float32Array([ -0 ]),
    	            f8b = new Uint8Array(f32.buffer),
    	            le  = f8b[3] === 128;

    	        function writeFloat_f32_cpy(val, buf, pos) {
    	            f32[0] = val;
    	            buf[pos    ] = f8b[0];
    	            buf[pos + 1] = f8b[1];
    	            buf[pos + 2] = f8b[2];
    	            buf[pos + 3] = f8b[3];
    	        }

    	        function writeFloat_f32_rev(val, buf, pos) {
    	            f32[0] = val;
    	            buf[pos    ] = f8b[3];
    	            buf[pos + 1] = f8b[2];
    	            buf[pos + 2] = f8b[1];
    	            buf[pos + 3] = f8b[0];
    	        }

    	        /* istanbul ignore next */
    	        exports.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
    	        /* istanbul ignore next */
    	        exports.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;

    	        function readFloat_f32_cpy(buf, pos) {
    	            f8b[0] = buf[pos    ];
    	            f8b[1] = buf[pos + 1];
    	            f8b[2] = buf[pos + 2];
    	            f8b[3] = buf[pos + 3];
    	            return f32[0];
    	        }

    	        function readFloat_f32_rev(buf, pos) {
    	            f8b[3] = buf[pos    ];
    	            f8b[2] = buf[pos + 1];
    	            f8b[1] = buf[pos + 2];
    	            f8b[0] = buf[pos + 3];
    	            return f32[0];
    	        }

    	        /* istanbul ignore next */
    	        exports.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
    	        /* istanbul ignore next */
    	        exports.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;

    	    // float: ieee754
    	    })(); else (function() {

    	        function writeFloat_ieee754(writeUint, val, buf, pos) {
    	            var sign = val < 0 ? 1 : 0;
    	            if (sign)
    	                val = -val;
    	            if (val === 0)
    	                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos);
    	            else if (isNaN(val))
    	                writeUint(2143289344, buf, pos);
    	            else if (val > 3.4028234663852886e+38) // +-Infinity
    	                writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
    	            else if (val < 1.1754943508222875e-38) // denormal
    	                writeUint((sign << 31 | Math.round(val / 1.401298464324817e-45)) >>> 0, buf, pos);
    	            else {
    	                var exponent = Math.floor(Math.log(val) / Math.LN2),
    	                    mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
    	                writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
    	            }
    	        }

    	        exports.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
    	        exports.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);

    	        function readFloat_ieee754(readUint, buf, pos) {
    	            var uint = readUint(buf, pos),
    	                sign = (uint >> 31) * 2 + 1,
    	                exponent = uint >>> 23 & 255,
    	                mantissa = uint & 8388607;
    	            return exponent === 255
    	                ? mantissa
    	                ? NaN
    	                : sign * Infinity
    	                : exponent === 0 // denormal
    	                ? sign * 1.401298464324817e-45 * mantissa
    	                : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
    	        }

    	        exports.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
    	        exports.readFloatBE = readFloat_ieee754.bind(null, readUintBE);

    	    })();

    	    // double: typed array
    	    if (typeof Float64Array !== "undefined") (function() {

    	        var f64 = new Float64Array([-0]),
    	            f8b = new Uint8Array(f64.buffer),
    	            le  = f8b[7] === 128;

    	        function writeDouble_f64_cpy(val, buf, pos) {
    	            f64[0] = val;
    	            buf[pos    ] = f8b[0];
    	            buf[pos + 1] = f8b[1];
    	            buf[pos + 2] = f8b[2];
    	            buf[pos + 3] = f8b[3];
    	            buf[pos + 4] = f8b[4];
    	            buf[pos + 5] = f8b[5];
    	            buf[pos + 6] = f8b[6];
    	            buf[pos + 7] = f8b[7];
    	        }

    	        function writeDouble_f64_rev(val, buf, pos) {
    	            f64[0] = val;
    	            buf[pos    ] = f8b[7];
    	            buf[pos + 1] = f8b[6];
    	            buf[pos + 2] = f8b[5];
    	            buf[pos + 3] = f8b[4];
    	            buf[pos + 4] = f8b[3];
    	            buf[pos + 5] = f8b[2];
    	            buf[pos + 6] = f8b[1];
    	            buf[pos + 7] = f8b[0];
    	        }

    	        /* istanbul ignore next */
    	        exports.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
    	        /* istanbul ignore next */
    	        exports.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;

    	        function readDouble_f64_cpy(buf, pos) {
    	            f8b[0] = buf[pos    ];
    	            f8b[1] = buf[pos + 1];
    	            f8b[2] = buf[pos + 2];
    	            f8b[3] = buf[pos + 3];
    	            f8b[4] = buf[pos + 4];
    	            f8b[5] = buf[pos + 5];
    	            f8b[6] = buf[pos + 6];
    	            f8b[7] = buf[pos + 7];
    	            return f64[0];
    	        }

    	        function readDouble_f64_rev(buf, pos) {
    	            f8b[7] = buf[pos    ];
    	            f8b[6] = buf[pos + 1];
    	            f8b[5] = buf[pos + 2];
    	            f8b[4] = buf[pos + 3];
    	            f8b[3] = buf[pos + 4];
    	            f8b[2] = buf[pos + 5];
    	            f8b[1] = buf[pos + 6];
    	            f8b[0] = buf[pos + 7];
    	            return f64[0];
    	        }

    	        /* istanbul ignore next */
    	        exports.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
    	        /* istanbul ignore next */
    	        exports.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;

    	    // double: ieee754
    	    })(); else (function() {

    	        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
    	            var sign = val < 0 ? 1 : 0;
    	            if (sign)
    	                val = -val;
    	            if (val === 0) {
    	                writeUint(0, buf, pos + off0);
    	                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos + off1);
    	            } else if (isNaN(val)) {
    	                writeUint(0, buf, pos + off0);
    	                writeUint(2146959360, buf, pos + off1);
    	            } else if (val > 1.7976931348623157e+308) { // +-Infinity
    	                writeUint(0, buf, pos + off0);
    	                writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
    	            } else {
    	                var mantissa;
    	                if (val < 2.2250738585072014e-308) { // denormal
    	                    mantissa = val / 5e-324;
    	                    writeUint(mantissa >>> 0, buf, pos + off0);
    	                    writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
    	                } else {
    	                    var exponent = Math.floor(Math.log(val) / Math.LN2);
    	                    if (exponent === 1024)
    	                        exponent = 1023;
    	                    mantissa = val * Math.pow(2, -exponent);
    	                    writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
    	                    writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
    	                }
    	            }
    	        }

    	        exports.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
    	        exports.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);

    	        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
    	            var lo = readUint(buf, pos + off0),
    	                hi = readUint(buf, pos + off1);
    	            var sign = (hi >> 31) * 2 + 1,
    	                exponent = hi >>> 20 & 2047,
    	                mantissa = 4294967296 * (hi & 1048575) + lo;
    	            return exponent === 2047
    	                ? mantissa
    	                ? NaN
    	                : sign * Infinity
    	                : exponent === 0 // denormal
    	                ? sign * 5e-324 * mantissa
    	                : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
    	        }

    	        exports.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
    	        exports.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);

    	    })();

    	    return exports;
    	}

    	// uint helpers

    	function writeUintLE(val, buf, pos) {
    	    buf[pos    ] =  val        & 255;
    	    buf[pos + 1] =  val >>> 8  & 255;
    	    buf[pos + 2] =  val >>> 16 & 255;
    	    buf[pos + 3] =  val >>> 24;
    	}

    	function writeUintBE(val, buf, pos) {
    	    buf[pos    ] =  val >>> 24;
    	    buf[pos + 1] =  val >>> 16 & 255;
    	    buf[pos + 2] =  val >>> 8  & 255;
    	    buf[pos + 3] =  val        & 255;
    	}

    	function readUintLE(buf, pos) {
    	    return (buf[pos    ]
    	          | buf[pos + 1] << 8
    	          | buf[pos + 2] << 16
    	          | buf[pos + 3] << 24) >>> 0;
    	}

    	function readUintBE(buf, pos) {
    	    return (buf[pos    ] << 24
    	          | buf[pos + 1] << 16
    	          | buf[pos + 2] << 8
    	          | buf[pos + 3]) >>> 0;
    	}
    	return float;
    }

    var inquire_1;
    var hasRequiredInquire;

    function requireInquire () {
    	if (hasRequiredInquire) return inquire_1;
    	hasRequiredInquire = 1;
    	inquire_1 = inquire;

    	/**
    	 * Requires a module only if available.
    	 * @memberof util
    	 * @param {string} moduleName Module to require
    	 * @returns {?Object} Required module if available and not empty, otherwise `null`
    	 */
    	function inquire(moduleName) {
    	    try {
    	        var mod = eval("quire".replace(/^/,"re"))(moduleName); // eslint-disable-line no-eval
    	        if (mod && (mod.length || Object.keys(mod).length))
    	            return mod;
    	    } catch (e) {} // eslint-disable-line no-empty
    	    return null;
    	}
    	return inquire_1;
    }

    var utf8 = {};

    var hasRequiredUtf8;

    function requireUtf8 () {
    	if (hasRequiredUtf8) return utf8;
    	hasRequiredUtf8 = 1;
    	(function (exports) {

    		/**
    		 * A minimal UTF8 implementation for number arrays.
    		 * @memberof util
    		 * @namespace
    		 */
    		var utf8 = exports;

    		/**
    		 * Calculates the UTF8 byte length of a string.
    		 * @param {string} string String
    		 * @returns {number} Byte length
    		 */
    		utf8.length = function utf8_length(string) {
    		    var len = 0,
    		        c = 0;
    		    for (var i = 0; i < string.length; ++i) {
    		        c = string.charCodeAt(i);
    		        if (c < 128)
    		            len += 1;
    		        else if (c < 2048)
    		            len += 2;
    		        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
    		            ++i;
    		            len += 4;
    		        } else
    		            len += 3;
    		    }
    		    return len;
    		};

    		/**
    		 * Reads UTF8 bytes as a string.
    		 * @param {Uint8Array} buffer Source buffer
    		 * @param {number} start Source start
    		 * @param {number} end Source end
    		 * @returns {string} String read
    		 */
    		utf8.read = function utf8_read(buffer, start, end) {
    		    var len = end - start;
    		    if (len < 1)
    		        return "";
    		    var parts = null,
    		        chunk = [],
    		        i = 0, // char offset
    		        t;     // temporary
    		    while (start < end) {
    		        t = buffer[start++];
    		        if (t < 128)
    		            chunk[i++] = t;
    		        else if (t > 191 && t < 224)
    		            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
    		        else if (t > 239 && t < 365) {
    		            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
    		            chunk[i++] = 0xD800 + (t >> 10);
    		            chunk[i++] = 0xDC00 + (t & 1023);
    		        } else
    		            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
    		        if (i > 8191) {
    		            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
    		            i = 0;
    		        }
    		    }
    		    if (parts) {
    		        if (i)
    		            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
    		        return parts.join("");
    		    }
    		    return String.fromCharCode.apply(String, chunk.slice(0, i));
    		};

    		/**
    		 * Writes a string as UTF8 bytes.
    		 * @param {string} string Source string
    		 * @param {Uint8Array} buffer Destination buffer
    		 * @param {number} offset Destination offset
    		 * @returns {number} Bytes written
    		 */
    		utf8.write = function utf8_write(string, buffer, offset) {
    		    var start = offset,
    		        c1, // character 1
    		        c2; // character 2
    		    for (var i = 0; i < string.length; ++i) {
    		        c1 = string.charCodeAt(i);
    		        if (c1 < 128) {
    		            buffer[offset++] = c1;
    		        } else if (c1 < 2048) {
    		            buffer[offset++] = c1 >> 6       | 192;
    		            buffer[offset++] = c1       & 63 | 128;
    		        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
    		            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
    		            ++i;
    		            buffer[offset++] = c1 >> 18      | 240;
    		            buffer[offset++] = c1 >> 12 & 63 | 128;
    		            buffer[offset++] = c1 >> 6  & 63 | 128;
    		            buffer[offset++] = c1       & 63 | 128;
    		        } else {
    		            buffer[offset++] = c1 >> 12      | 224;
    		            buffer[offset++] = c1 >> 6  & 63 | 128;
    		            buffer[offset++] = c1       & 63 | 128;
    		        }
    		    }
    		    return offset - start;
    		}; 
    	} (utf8));
    	return utf8;
    }

    var pool_1;
    var hasRequiredPool;

    function requirePool () {
    	if (hasRequiredPool) return pool_1;
    	hasRequiredPool = 1;
    	pool_1 = pool;

    	/**
    	 * An allocator as used by {@link util.pool}.
    	 * @typedef PoolAllocator
    	 * @type {function}
    	 * @param {number} size Buffer size
    	 * @returns {Uint8Array} Buffer
    	 */

    	/**
    	 * A slicer as used by {@link util.pool}.
    	 * @typedef PoolSlicer
    	 * @type {function}
    	 * @param {number} start Start offset
    	 * @param {number} end End offset
    	 * @returns {Uint8Array} Buffer slice
    	 * @this {Uint8Array}
    	 */

    	/**
    	 * A general purpose buffer pool.
    	 * @memberof util
    	 * @function
    	 * @param {PoolAllocator} alloc Allocator
    	 * @param {PoolSlicer} slice Slicer
    	 * @param {number} [size=8192] Slab size
    	 * @returns {PoolAllocator} Pooled allocator
    	 */
    	function pool(alloc, slice, size) {
    	    var SIZE   = size || 8192;
    	    var MAX    = SIZE >>> 1;
    	    var slab   = null;
    	    var offset = SIZE;
    	    return function pool_alloc(size) {
    	        if (size < 1 || size > MAX)
    	            return alloc(size);
    	        if (offset + size > SIZE) {
    	            slab = alloc(SIZE);
    	            offset = 0;
    	        }
    	        var buf = slice.call(slab, offset, offset += size);
    	        if (offset & 7) // align to 32 bit
    	            offset = (offset | 7) + 1;
    	        return buf;
    	    };
    	}
    	return pool_1;
    }

    var longbits;
    var hasRequiredLongbits;

    function requireLongbits () {
    	if (hasRequiredLongbits) return longbits;
    	hasRequiredLongbits = 1;
    	longbits = LongBits;

    	var util = requireMinimal$1();

    	/**
    	 * Constructs new long bits.
    	 * @classdesc Helper class for working with the low and high bits of a 64 bit value.
    	 * @memberof util
    	 * @constructor
    	 * @param {number} lo Low 32 bits, unsigned
    	 * @param {number} hi High 32 bits, unsigned
    	 */
    	function LongBits(lo, hi) {

    	    // note that the casts below are theoretically unnecessary as of today, but older statically
    	    // generated converter code might still call the ctor with signed 32bits. kept for compat.

    	    /**
    	     * Low bits.
    	     * @type {number}
    	     */
    	    this.lo = lo >>> 0;

    	    /**
    	     * High bits.
    	     * @type {number}
    	     */
    	    this.hi = hi >>> 0;
    	}

    	/**
    	 * Zero bits.
    	 * @memberof util.LongBits
    	 * @type {util.LongBits}
    	 */
    	var zero = LongBits.zero = new LongBits(0, 0);

    	zero.toNumber = function() { return 0; };
    	zero.zzEncode = zero.zzDecode = function() { return this; };
    	zero.length = function() { return 1; };

    	/**
    	 * Zero hash.
    	 * @memberof util.LongBits
    	 * @type {string}
    	 */
    	var zeroHash = LongBits.zeroHash = "\0\0\0\0\0\0\0\0";

    	/**
    	 * Constructs new long bits from the specified number.
    	 * @param {number} value Value
    	 * @returns {util.LongBits} Instance
    	 */
    	LongBits.fromNumber = function fromNumber(value) {
    	    if (value === 0)
    	        return zero;
    	    var sign = value < 0;
    	    if (sign)
    	        value = -value;
    	    var lo = value >>> 0,
    	        hi = (value - lo) / 4294967296 >>> 0;
    	    if (sign) {
    	        hi = ~hi >>> 0;
    	        lo = ~lo >>> 0;
    	        if (++lo > 4294967295) {
    	            lo = 0;
    	            if (++hi > 4294967295)
    	                hi = 0;
    	        }
    	    }
    	    return new LongBits(lo, hi);
    	};

    	/**
    	 * Constructs new long bits from a number, long or string.
    	 * @param {Long|number|string} value Value
    	 * @returns {util.LongBits} Instance
    	 */
    	LongBits.from = function from(value) {
    	    if (typeof value === "number")
    	        return LongBits.fromNumber(value);
    	    if (util.isString(value)) {
    	        /* istanbul ignore else */
    	        if (util.Long)
    	            value = util.Long.fromString(value);
    	        else
    	            return LongBits.fromNumber(parseInt(value, 10));
    	    }
    	    return value.low || value.high ? new LongBits(value.low >>> 0, value.high >>> 0) : zero;
    	};

    	/**
    	 * Converts this long bits to a possibly unsafe JavaScript number.
    	 * @param {boolean} [unsigned=false] Whether unsigned or not
    	 * @returns {number} Possibly unsafe number
    	 */
    	LongBits.prototype.toNumber = function toNumber(unsigned) {
    	    if (!unsigned && this.hi >>> 31) {
    	        var lo = ~this.lo + 1 >>> 0,
    	            hi = ~this.hi     >>> 0;
    	        if (!lo)
    	            hi = hi + 1 >>> 0;
    	        return -(lo + hi * 4294967296);
    	    }
    	    return this.lo + this.hi * 4294967296;
    	};

    	/**
    	 * Converts this long bits to a long.
    	 * @param {boolean} [unsigned=false] Whether unsigned or not
    	 * @returns {Long} Long
    	 */
    	LongBits.prototype.toLong = function toLong(unsigned) {
    	    return util.Long
    	        ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned))
    	        /* istanbul ignore next */
    	        : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
    	};

    	var charCodeAt = String.prototype.charCodeAt;

    	/**
    	 * Constructs new long bits from the specified 8 characters long hash.
    	 * @param {string} hash Hash
    	 * @returns {util.LongBits} Bits
    	 */
    	LongBits.fromHash = function fromHash(hash) {
    	    if (hash === zeroHash)
    	        return zero;
    	    return new LongBits(
    	        ( charCodeAt.call(hash, 0)
    	        | charCodeAt.call(hash, 1) << 8
    	        | charCodeAt.call(hash, 2) << 16
    	        | charCodeAt.call(hash, 3) << 24) >>> 0
    	    ,
    	        ( charCodeAt.call(hash, 4)
    	        | charCodeAt.call(hash, 5) << 8
    	        | charCodeAt.call(hash, 6) << 16
    	        | charCodeAt.call(hash, 7) << 24) >>> 0
    	    );
    	};

    	/**
    	 * Converts this long bits to a 8 characters long hash.
    	 * @returns {string} Hash
    	 */
    	LongBits.prototype.toHash = function toHash() {
    	    return String.fromCharCode(
    	        this.lo        & 255,
    	        this.lo >>> 8  & 255,
    	        this.lo >>> 16 & 255,
    	        this.lo >>> 24      ,
    	        this.hi        & 255,
    	        this.hi >>> 8  & 255,
    	        this.hi >>> 16 & 255,
    	        this.hi >>> 24
    	    );
    	};

    	/**
    	 * Zig-zag encodes this long bits.
    	 * @returns {util.LongBits} `this`
    	 */
    	LongBits.prototype.zzEncode = function zzEncode() {
    	    var mask =   this.hi >> 31;
    	    this.hi  = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
    	    this.lo  = ( this.lo << 1                   ^ mask) >>> 0;
    	    return this;
    	};

    	/**
    	 * Zig-zag decodes this long bits.
    	 * @returns {util.LongBits} `this`
    	 */
    	LongBits.prototype.zzDecode = function zzDecode() {
    	    var mask = -(this.lo & 1);
    	    this.lo  = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
    	    this.hi  = ( this.hi >>> 1                  ^ mask) >>> 0;
    	    return this;
    	};

    	/**
    	 * Calculates the length of this longbits when encoded as a varint.
    	 * @returns {number} Length
    	 */
    	LongBits.prototype.length = function length() {
    	    var part0 =  this.lo,
    	        part1 = (this.lo >>> 28 | this.hi << 4) >>> 0,
    	        part2 =  this.hi >>> 24;
    	    return part2 === 0
    	         ? part1 === 0
    	           ? part0 < 16384
    	             ? part0 < 128 ? 1 : 2
    	             : part0 < 2097152 ? 3 : 4
    	           : part1 < 16384
    	             ? part1 < 128 ? 5 : 6
    	             : part1 < 2097152 ? 7 : 8
    	         : part2 < 128 ? 9 : 10;
    	};
    	return longbits;
    }

    var hasRequiredMinimal$1;

    function requireMinimal$1 () {
    	if (hasRequiredMinimal$1) return minimal$1;
    	hasRequiredMinimal$1 = 1;
    	(function (exports) {
    		var util = exports;

    		// used to return a Promise where callback is omitted
    		util.asPromise = requireAspromise();

    		// converts to / from base64 encoded strings
    		util.base64 = requireBase64();

    		// base class of rpc.Service
    		util.EventEmitter = requireEventemitter();

    		// float handling accross browsers
    		util.float = requireFloat();

    		// requires modules optionally and hides the call from bundlers
    		util.inquire = requireInquire();

    		// converts to / from utf8 encoded strings
    		util.utf8 = requireUtf8();

    		// provides a node-like buffer pool in the browser
    		util.pool = requirePool();

    		// utility to work with the low and high bits of a 64 bit value
    		util.LongBits = requireLongbits();

    		/**
    		 * Whether running within node or not.
    		 * @memberof util
    		 * @type {boolean}
    		 */
    		util.isNode = Boolean(typeof commonjsGlobal !== "undefined"
    		                   && commonjsGlobal
    		                   && commonjsGlobal.process
    		                   && commonjsGlobal.process.versions
    		                   && commonjsGlobal.process.versions.node);

    		/**
    		 * Global object reference.
    		 * @memberof util
    		 * @type {Object}
    		 */
    		util.global = util.isNode && commonjsGlobal
    		           || typeof window !== "undefined" && window
    		           || typeof self   !== "undefined" && self
    		           || commonjsGlobal; // eslint-disable-line no-invalid-this

    		/**
    		 * An immuable empty array.
    		 * @memberof util
    		 * @type {Array.<*>}
    		 * @const
    		 */
    		util.emptyArray = Object.freeze ? Object.freeze([]) : /* istanbul ignore next */ []; // used on prototypes

    		/**
    		 * An immutable empty object.
    		 * @type {Object}
    		 * @const
    		 */
    		util.emptyObject = Object.freeze ? Object.freeze({}) : /* istanbul ignore next */ {}; // used on prototypes

    		/**
    		 * Tests if the specified value is an integer.
    		 * @function
    		 * @param {*} value Value to test
    		 * @returns {boolean} `true` if the value is an integer
    		 */
    		util.isInteger = Number.isInteger || /* istanbul ignore next */ function isInteger(value) {
    		    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    		};

    		/**
    		 * Tests if the specified value is a string.
    		 * @param {*} value Value to test
    		 * @returns {boolean} `true` if the value is a string
    		 */
    		util.isString = function isString(value) {
    		    return typeof value === "string" || value instanceof String;
    		};

    		/**
    		 * Tests if the specified value is a non-null object.
    		 * @param {*} value Value to test
    		 * @returns {boolean} `true` if the value is a non-null object
    		 */
    		util.isObject = function isObject(value) {
    		    return value && typeof value === "object";
    		};

    		/**
    		 * Checks if a property on a message is considered to be present.
    		 * This is an alias of {@link util.isSet}.
    		 * @function
    		 * @param {Object} obj Plain object or message instance
    		 * @param {string} prop Property name
    		 * @returns {boolean} `true` if considered to be present, otherwise `false`
    		 */
    		util.isset =

    		/**
    		 * Checks if a property on a message is considered to be present.
    		 * @param {Object} obj Plain object or message instance
    		 * @param {string} prop Property name
    		 * @returns {boolean} `true` if considered to be present, otherwise `false`
    		 */
    		util.isSet = function isSet(obj, prop) {
    		    var value = obj[prop];
    		    if (value != null && obj.hasOwnProperty(prop)) // eslint-disable-line eqeqeq, no-prototype-builtins
    		        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
    		    return false;
    		};

    		/**
    		 * Any compatible Buffer instance.
    		 * This is a minimal stand-alone definition of a Buffer instance. The actual type is that exported by node's typings.
    		 * @interface Buffer
    		 * @extends Uint8Array
    		 */

    		/**
    		 * Node's Buffer class if available.
    		 * @type {Constructor<Buffer>}
    		 */
    		util.Buffer = (function() {
    		    try {
    		        var Buffer = util.inquire("buffer").Buffer;
    		        // refuse to use non-node buffers if not explicitly assigned (perf reasons):
    		        return Buffer.prototype.utf8Write ? Buffer : /* istanbul ignore next */ null;
    		    } catch (e) {
    		        /* istanbul ignore next */
    		        return null;
    		    }
    		})();

    		// Internal alias of or polyfull for Buffer.from.
    		util._Buffer_from = null;

    		// Internal alias of or polyfill for Buffer.allocUnsafe.
    		util._Buffer_allocUnsafe = null;

    		/**
    		 * Creates a new buffer of whatever type supported by the environment.
    		 * @param {number|number[]} [sizeOrArray=0] Buffer size or number array
    		 * @returns {Uint8Array|Buffer} Buffer
    		 */
    		util.newBuffer = function newBuffer(sizeOrArray) {
    		    /* istanbul ignore next */
    		    return typeof sizeOrArray === "number"
    		        ? util.Buffer
    		            ? util._Buffer_allocUnsafe(sizeOrArray)
    		            : new util.Array(sizeOrArray)
    		        : util.Buffer
    		            ? util._Buffer_from(sizeOrArray)
    		            : typeof Uint8Array === "undefined"
    		                ? sizeOrArray
    		                : new Uint8Array(sizeOrArray);
    		};

    		/**
    		 * Array implementation used in the browser. `Uint8Array` if supported, otherwise `Array`.
    		 * @type {Constructor<Uint8Array>}
    		 */
    		util.Array = typeof Uint8Array !== "undefined" ? Uint8Array /* istanbul ignore next */ : Array;

    		/**
    		 * Any compatible Long instance.
    		 * This is a minimal stand-alone definition of a Long instance. The actual type is that exported by long.js.
    		 * @interface Long
    		 * @property {number} low Low bits
    		 * @property {number} high High bits
    		 * @property {boolean} unsigned Whether unsigned or not
    		 */

    		/**
    		 * Long.js's Long class if available.
    		 * @type {Constructor<Long>}
    		 */
    		util.Long = /* istanbul ignore next */ util.global.dcodeIO && /* istanbul ignore next */ util.global.dcodeIO.Long
    		         || /* istanbul ignore next */ util.global.Long
    		         || util.inquire("long");

    		/**
    		 * Regular expression used to verify 2 bit (`bool`) map keys.
    		 * @type {RegExp}
    		 * @const
    		 */
    		util.key2Re = /^true|false|0|1$/;

    		/**
    		 * Regular expression used to verify 32 bit (`int32` etc.) map keys.
    		 * @type {RegExp}
    		 * @const
    		 */
    		util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;

    		/**
    		 * Regular expression used to verify 64 bit (`int64` etc.) map keys.
    		 * @type {RegExp}
    		 * @const
    		 */
    		util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;

    		/**
    		 * Converts a number or long to an 8 characters long hash string.
    		 * @param {Long|number} value Value to convert
    		 * @returns {string} Hash
    		 */
    		util.longToHash = function longToHash(value) {
    		    return value
    		        ? util.LongBits.from(value).toHash()
    		        : util.LongBits.zeroHash;
    		};

    		/**
    		 * Converts an 8 characters long hash string to a long or number.
    		 * @param {string} hash Hash
    		 * @param {boolean} [unsigned=false] Whether unsigned or not
    		 * @returns {Long|number} Original value
    		 */
    		util.longFromHash = function longFromHash(hash, unsigned) {
    		    var bits = util.LongBits.fromHash(hash);
    		    if (util.Long)
    		        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
    		    return bits.toNumber(Boolean(unsigned));
    		};

    		/**
    		 * Merges the properties of the source object into the destination object.
    		 * @memberof util
    		 * @param {Object.<string,*>} dst Destination object
    		 * @param {Object.<string,*>} src Source object
    		 * @param {boolean} [ifNotSet=false] Merges only if the key is not already set
    		 * @returns {Object.<string,*>} Destination object
    		 */
    		function merge(dst, src, ifNotSet) { // used by converters
    		    for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
    		        if (dst[keys[i]] === undefined || !ifNotSet)
    		            dst[keys[i]] = src[keys[i]];
    		    return dst;
    		}

    		util.merge = merge;

    		/**
    		 * Converts the first character of a string to lower case.
    		 * @param {string} str String to convert
    		 * @returns {string} Converted string
    		 */
    		util.lcFirst = function lcFirst(str) {
    		    return str.charAt(0).toLowerCase() + str.substring(1);
    		};

    		/**
    		 * Creates a custom error constructor.
    		 * @memberof util
    		 * @param {string} name Error name
    		 * @returns {Constructor<Error>} Custom error constructor
    		 */
    		function newError(name) {

    		    function CustomError(message, properties) {

    		        if (!(this instanceof CustomError))
    		            return new CustomError(message, properties);

    		        // Error.call(this, message);
    		        // ^ just returns a new error instance because the ctor can be called as a function

    		        Object.defineProperty(this, "message", { get: function() { return message; } });

    		        /* istanbul ignore next */
    		        if (Error.captureStackTrace) // node
    		            Error.captureStackTrace(this, CustomError);
    		        else
    		            Object.defineProperty(this, "stack", { value: new Error().stack || "" });

    		        if (properties)
    		            merge(this, properties);
    		    }

    		    CustomError.prototype = Object.create(Error.prototype, {
    		        constructor: {
    		            value: CustomError,
    		            writable: true,
    		            enumerable: false,
    		            configurable: true,
    		        },
    		        name: {
    		            get: function get() { return name; },
    		            set: undefined,
    		            enumerable: false,
    		            // configurable: false would accurately preserve the behavior of
    		            // the original, but I'm guessing that was not intentional.
    		            // For an actual error subclass, this property would
    		            // be configurable.
    		            configurable: true,
    		        },
    		        toString: {
    		            value: function value() { return this.name + ": " + this.message; },
    		            writable: true,
    		            enumerable: false,
    		            configurable: true,
    		        },
    		    });

    		    return CustomError;
    		}

    		util.newError = newError;

    		/**
    		 * Constructs a new protocol error.
    		 * @classdesc Error subclass indicating a protocol specifc error.
    		 * @memberof util
    		 * @extends Error
    		 * @template T extends Message<T>
    		 * @constructor
    		 * @param {string} message Error message
    		 * @param {Object.<string,*>} [properties] Additional properties
    		 * @example
    		 * try {
    		 *     MyMessage.decode(someBuffer); // throws if required fields are missing
    		 * } catch (e) {
    		 *     if (e instanceof ProtocolError && e.instance)
    		 *         console.log("decoded so far: " + JSON.stringify(e.instance));
    		 * }
    		 */
    		util.ProtocolError = newError("ProtocolError");

    		/**
    		 * So far decoded message instance.
    		 * @name util.ProtocolError#instance
    		 * @type {Message<T>}
    		 */

    		/**
    		 * A OneOf getter as returned by {@link util.oneOfGetter}.
    		 * @typedef OneOfGetter
    		 * @type {function}
    		 * @returns {string|undefined} Set field name, if any
    		 */

    		/**
    		 * Builds a getter for a oneof's present field name.
    		 * @param {string[]} fieldNames Field names
    		 * @returns {OneOfGetter} Unbound getter
    		 */
    		util.oneOfGetter = function getOneOf(fieldNames) {
    		    var fieldMap = {};
    		    for (var i = 0; i < fieldNames.length; ++i)
    		        fieldMap[fieldNames[i]] = 1;

    		    /**
    		     * @returns {string|undefined} Set field name, if any
    		     * @this Object
    		     * @ignore
    		     */
    		    return function() { // eslint-disable-line consistent-return
    		        for (var keys = Object.keys(this), i = keys.length - 1; i > -1; --i)
    		            if (fieldMap[keys[i]] === 1 && this[keys[i]] !== undefined && this[keys[i]] !== null)
    		                return keys[i];
    		    };
    		};

    		/**
    		 * A OneOf setter as returned by {@link util.oneOfSetter}.
    		 * @typedef OneOfSetter
    		 * @type {function}
    		 * @param {string|undefined} value Field name
    		 * @returns {undefined}
    		 */

    		/**
    		 * Builds a setter for a oneof's present field name.
    		 * @param {string[]} fieldNames Field names
    		 * @returns {OneOfSetter} Unbound setter
    		 */
    		util.oneOfSetter = function setOneOf(fieldNames) {

    		    /**
    		     * @param {string} name Field name
    		     * @returns {undefined}
    		     * @this Object
    		     * @ignore
    		     */
    		    return function(name) {
    		        for (var i = 0; i < fieldNames.length; ++i)
    		            if (fieldNames[i] !== name)
    		                delete this[fieldNames[i]];
    		    };
    		};

    		/**
    		 * Default conversion options used for {@link Message#toJSON} implementations.
    		 *
    		 * These options are close to proto3's JSON mapping with the exception that internal types like Any are handled just like messages. More precisely:
    		 *
    		 * - Longs become strings
    		 * - Enums become string keys
    		 * - Bytes become base64 encoded strings
    		 * - (Sub-)Messages become plain objects
    		 * - Maps become plain objects with all string keys
    		 * - Repeated fields become arrays
    		 * - NaN and Infinity for float and double fields become strings
    		 *
    		 * @type {IConversionOptions}
    		 * @see https://developers.google.com/protocol-buffers/docs/proto3?hl=en#json
    		 */
    		util.toJSONOptions = {
    		    longs: String,
    		    enums: String,
    		    bytes: String,
    		    json: true
    		};

    		// Sets up buffer utility according to the environment (called in index-minimal)
    		util._configure = function() {
    		    var Buffer = util.Buffer;
    		    /* istanbul ignore if */
    		    if (!Buffer) {
    		        util._Buffer_from = util._Buffer_allocUnsafe = null;
    		        return;
    		    }
    		    // because node 4.x buffers are incompatible & immutable
    		    // see: https://github.com/dcodeIO/protobuf.js/pull/665
    		    util._Buffer_from = Buffer.from !== Uint8Array.from && Buffer.from ||
    		        /* istanbul ignore next */
    		        function Buffer_from(value, encoding) {
    		            return new Buffer(value, encoding);
    		        };
    		    util._Buffer_allocUnsafe = Buffer.allocUnsafe ||
    		        /* istanbul ignore next */
    		        function Buffer_allocUnsafe(size) {
    		            return new Buffer(size);
    		        };
    		}; 
    	} (minimal$1));
    	return minimal$1;
    }

    var writer;
    var hasRequiredWriter;

    function requireWriter () {
    	if (hasRequiredWriter) return writer;
    	hasRequiredWriter = 1;
    	writer = Writer;

    	var util      = requireMinimal$1();

    	var BufferWriter; // cyclic

    	var LongBits  = util.LongBits,
    	    base64    = util.base64,
    	    utf8      = util.utf8;

    	/**
    	 * Constructs a new writer operation instance.
    	 * @classdesc Scheduled writer operation.
    	 * @constructor
    	 * @param {function(*, Uint8Array, number)} fn Function to call
    	 * @param {number} len Value byte length
    	 * @param {*} val Value to write
    	 * @ignore
    	 */
    	function Op(fn, len, val) {

    	    /**
    	     * Function to call.
    	     * @type {function(Uint8Array, number, *)}
    	     */
    	    this.fn = fn;

    	    /**
    	     * Value byte length.
    	     * @type {number}
    	     */
    	    this.len = len;

    	    /**
    	     * Next operation.
    	     * @type {Writer.Op|undefined}
    	     */
    	    this.next = undefined;

    	    /**
    	     * Value to write.
    	     * @type {*}
    	     */
    	    this.val = val; // type varies
    	}

    	/* istanbul ignore next */
    	function noop() {} // eslint-disable-line no-empty-function

    	/**
    	 * Constructs a new writer state instance.
    	 * @classdesc Copied writer state.
    	 * @memberof Writer
    	 * @constructor
    	 * @param {Writer} writer Writer to copy state from
    	 * @ignore
    	 */
    	function State(writer) {

    	    /**
    	     * Current head.
    	     * @type {Writer.Op}
    	     */
    	    this.head = writer.head;

    	    /**
    	     * Current tail.
    	     * @type {Writer.Op}
    	     */
    	    this.tail = writer.tail;

    	    /**
    	     * Current buffer length.
    	     * @type {number}
    	     */
    	    this.len = writer.len;

    	    /**
    	     * Next state.
    	     * @type {State|null}
    	     */
    	    this.next = writer.states;
    	}

    	/**
    	 * Constructs a new writer instance.
    	 * @classdesc Wire format writer using `Uint8Array` if available, otherwise `Array`.
    	 * @constructor
    	 */
    	function Writer() {

    	    /**
    	     * Current length.
    	     * @type {number}
    	     */
    	    this.len = 0;

    	    /**
    	     * Operations head.
    	     * @type {Object}
    	     */
    	    this.head = new Op(noop, 0, 0);

    	    /**
    	     * Operations tail
    	     * @type {Object}
    	     */
    	    this.tail = this.head;

    	    /**
    	     * Linked forked states.
    	     * @type {Object|null}
    	     */
    	    this.states = null;

    	    // When a value is written, the writer calculates its byte length and puts it into a linked
    	    // list of operations to perform when finish() is called. This both allows us to allocate
    	    // buffers of the exact required size and reduces the amount of work we have to do compared
    	    // to first calculating over objects and then encoding over objects. In our case, the encoding
    	    // part is just a linked list walk calling operations with already prepared values.
    	}

    	var create = function create() {
    	    return util.Buffer
    	        ? function create_buffer_setup() {
    	            return (Writer.create = function create_buffer() {
    	                return new BufferWriter();
    	            })();
    	        }
    	        /* istanbul ignore next */
    	        : function create_array() {
    	            return new Writer();
    	        };
    	};

    	/**
    	 * Creates a new writer.
    	 * @function
    	 * @returns {BufferWriter|Writer} A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
    	 */
    	Writer.create = create();

    	/**
    	 * Allocates a buffer of the specified size.
    	 * @param {number} size Buffer size
    	 * @returns {Uint8Array} Buffer
    	 */
    	Writer.alloc = function alloc(size) {
    	    return new util.Array(size);
    	};

    	// Use Uint8Array buffer pool in the browser, just like node does with buffers
    	/* istanbul ignore else */
    	if (util.Array !== Array)
    	    Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);

    	/**
    	 * Pushes a new operation to the queue.
    	 * @param {function(Uint8Array, number, *)} fn Function to call
    	 * @param {number} len Value byte length
    	 * @param {number} val Value to write
    	 * @returns {Writer} `this`
    	 * @private
    	 */
    	Writer.prototype._push = function push(fn, len, val) {
    	    this.tail = this.tail.next = new Op(fn, len, val);
    	    this.len += len;
    	    return this;
    	};

    	function writeByte(val, buf, pos) {
    	    buf[pos] = val & 255;
    	}

    	function writeVarint32(val, buf, pos) {
    	    while (val > 127) {
    	        buf[pos++] = val & 127 | 128;
    	        val >>>= 7;
    	    }
    	    buf[pos] = val;
    	}

    	/**
    	 * Constructs a new varint writer operation instance.
    	 * @classdesc Scheduled varint writer operation.
    	 * @extends Op
    	 * @constructor
    	 * @param {number} len Value byte length
    	 * @param {number} val Value to write
    	 * @ignore
    	 */
    	function VarintOp(len, val) {
    	    this.len = len;
    	    this.next = undefined;
    	    this.val = val;
    	}

    	VarintOp.prototype = Object.create(Op.prototype);
    	VarintOp.prototype.fn = writeVarint32;

    	/**
    	 * Writes an unsigned 32 bit value as a varint.
    	 * @param {number} value Value to write
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.uint32 = function write_uint32(value) {
    	    // here, the call to this.push has been inlined and a varint specific Op subclass is used.
    	    // uint32 is by far the most frequently used operation and benefits significantly from this.
    	    this.len += (this.tail = this.tail.next = new VarintOp(
    	        (value = value >>> 0)
    	                < 128       ? 1
    	        : value < 16384     ? 2
    	        : value < 2097152   ? 3
    	        : value < 268435456 ? 4
    	        :                     5,
    	    value)).len;
    	    return this;
    	};

    	/**
    	 * Writes a signed 32 bit value as a varint.
    	 * @function
    	 * @param {number} value Value to write
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.int32 = function write_int32(value) {
    	    return value < 0
    	        ? this._push(writeVarint64, 10, LongBits.fromNumber(value)) // 10 bytes per spec
    	        : this.uint32(value);
    	};

    	/**
    	 * Writes a 32 bit value as a varint, zig-zag encoded.
    	 * @param {number} value Value to write
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.sint32 = function write_sint32(value) {
    	    return this.uint32((value << 1 ^ value >> 31) >>> 0);
    	};

    	function writeVarint64(val, buf, pos) {
    	    while (val.hi) {
    	        buf[pos++] = val.lo & 127 | 128;
    	        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
    	        val.hi >>>= 7;
    	    }
    	    while (val.lo > 127) {
    	        buf[pos++] = val.lo & 127 | 128;
    	        val.lo = val.lo >>> 7;
    	    }
    	    buf[pos++] = val.lo;
    	}

    	/**
    	 * Writes an unsigned 64 bit value as a varint.
    	 * @param {Long|number|string} value Value to write
    	 * @returns {Writer} `this`
    	 * @throws {TypeError} If `value` is a string and no long library is present.
    	 */
    	Writer.prototype.uint64 = function write_uint64(value) {
    	    var bits = LongBits.from(value);
    	    return this._push(writeVarint64, bits.length(), bits);
    	};

    	/**
    	 * Writes a signed 64 bit value as a varint.
    	 * @function
    	 * @param {Long|number|string} value Value to write
    	 * @returns {Writer} `this`
    	 * @throws {TypeError} If `value` is a string and no long library is present.
    	 */
    	Writer.prototype.int64 = Writer.prototype.uint64;

    	/**
    	 * Writes a signed 64 bit value as a varint, zig-zag encoded.
    	 * @param {Long|number|string} value Value to write
    	 * @returns {Writer} `this`
    	 * @throws {TypeError} If `value` is a string and no long library is present.
    	 */
    	Writer.prototype.sint64 = function write_sint64(value) {
    	    var bits = LongBits.from(value).zzEncode();
    	    return this._push(writeVarint64, bits.length(), bits);
    	};

    	/**
    	 * Writes a boolish value as a varint.
    	 * @param {boolean} value Value to write
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.bool = function write_bool(value) {
    	    return this._push(writeByte, 1, value ? 1 : 0);
    	};

    	function writeFixed32(val, buf, pos) {
    	    buf[pos    ] =  val         & 255;
    	    buf[pos + 1] =  val >>> 8   & 255;
    	    buf[pos + 2] =  val >>> 16  & 255;
    	    buf[pos + 3] =  val >>> 24;
    	}

    	/**
    	 * Writes an unsigned 32 bit value as fixed 32 bits.
    	 * @param {number} value Value to write
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.fixed32 = function write_fixed32(value) {
    	    return this._push(writeFixed32, 4, value >>> 0);
    	};

    	/**
    	 * Writes a signed 32 bit value as fixed 32 bits.
    	 * @function
    	 * @param {number} value Value to write
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.sfixed32 = Writer.prototype.fixed32;

    	/**
    	 * Writes an unsigned 64 bit value as fixed 64 bits.
    	 * @param {Long|number|string} value Value to write
    	 * @returns {Writer} `this`
    	 * @throws {TypeError} If `value` is a string and no long library is present.
    	 */
    	Writer.prototype.fixed64 = function write_fixed64(value) {
    	    var bits = LongBits.from(value);
    	    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
    	};

    	/**
    	 * Writes a signed 64 bit value as fixed 64 bits.
    	 * @function
    	 * @param {Long|number|string} value Value to write
    	 * @returns {Writer} `this`
    	 * @throws {TypeError} If `value` is a string and no long library is present.
    	 */
    	Writer.prototype.sfixed64 = Writer.prototype.fixed64;

    	/**
    	 * Writes a float (32 bit).
    	 * @function
    	 * @param {number} value Value to write
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.float = function write_float(value) {
    	    return this._push(util.float.writeFloatLE, 4, value);
    	};

    	/**
    	 * Writes a double (64 bit float).
    	 * @function
    	 * @param {number} value Value to write
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.double = function write_double(value) {
    	    return this._push(util.float.writeDoubleLE, 8, value);
    	};

    	var writeBytes = util.Array.prototype.set
    	    ? function writeBytes_set(val, buf, pos) {
    	        buf.set(val, pos); // also works for plain array values
    	    }
    	    /* istanbul ignore next */
    	    : function writeBytes_for(val, buf, pos) {
    	        for (var i = 0; i < val.length; ++i)
    	            buf[pos + i] = val[i];
    	    };

    	/**
    	 * Writes a sequence of bytes.
    	 * @param {Uint8Array|string} value Buffer or base64 encoded string to write
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.bytes = function write_bytes(value) {
    	    var len = value.length >>> 0;
    	    if (!len)
    	        return this._push(writeByte, 1, 0);
    	    if (util.isString(value)) {
    	        var buf = Writer.alloc(len = base64.length(value));
    	        base64.decode(value, buf, 0);
    	        value = buf;
    	    }
    	    return this.uint32(len)._push(writeBytes, len, value);
    	};

    	/**
    	 * Writes a string.
    	 * @param {string} value Value to write
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.string = function write_string(value) {
    	    var len = utf8.length(value);
    	    return len
    	        ? this.uint32(len)._push(utf8.write, len, value)
    	        : this._push(writeByte, 1, 0);
    	};

    	/**
    	 * Forks this writer's state by pushing it to a stack.
    	 * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.fork = function fork() {
    	    this.states = new State(this);
    	    this.head = this.tail = new Op(noop, 0, 0);
    	    this.len = 0;
    	    return this;
    	};

    	/**
    	 * Resets this instance to the last state.
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.reset = function reset() {
    	    if (this.states) {
    	        this.head   = this.states.head;
    	        this.tail   = this.states.tail;
    	        this.len    = this.states.len;
    	        this.states = this.states.next;
    	    } else {
    	        this.head = this.tail = new Op(noop, 0, 0);
    	        this.len  = 0;
    	    }
    	    return this;
    	};

    	/**
    	 * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
    	 * @returns {Writer} `this`
    	 */
    	Writer.prototype.ldelim = function ldelim() {
    	    var head = this.head,
    	        tail = this.tail,
    	        len  = this.len;
    	    this.reset().uint32(len);
    	    if (len) {
    	        this.tail.next = head.next; // skip noop
    	        this.tail = tail;
    	        this.len += len;
    	    }
    	    return this;
    	};

    	/**
    	 * Finishes the write operation.
    	 * @returns {Uint8Array} Finished buffer
    	 */
    	Writer.prototype.finish = function finish() {
    	    var head = this.head.next, // skip noop
    	        buf  = this.constructor.alloc(this.len),
    	        pos  = 0;
    	    while (head) {
    	        head.fn(head.val, buf, pos);
    	        pos += head.len;
    	        head = head.next;
    	    }
    	    // this.head = this.tail = null;
    	    return buf;
    	};

    	Writer._configure = function(BufferWriter_) {
    	    BufferWriter = BufferWriter_;
    	    Writer.create = create();
    	    BufferWriter._configure();
    	};
    	return writer;
    }

    var writer_buffer;
    var hasRequiredWriter_buffer;

    function requireWriter_buffer () {
    	if (hasRequiredWriter_buffer) return writer_buffer;
    	hasRequiredWriter_buffer = 1;
    	writer_buffer = BufferWriter;

    	// extends Writer
    	var Writer = requireWriter();
    	(BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;

    	var util = requireMinimal$1();

    	/**
    	 * Constructs a new buffer writer instance.
    	 * @classdesc Wire format writer using node buffers.
    	 * @extends Writer
    	 * @constructor
    	 */
    	function BufferWriter() {
    	    Writer.call(this);
    	}

    	BufferWriter._configure = function () {
    	    /**
    	     * Allocates a buffer of the specified size.
    	     * @function
    	     * @param {number} size Buffer size
    	     * @returns {Buffer} Buffer
    	     */
    	    BufferWriter.alloc = util._Buffer_allocUnsafe;

    	    BufferWriter.writeBytesBuffer = util.Buffer && util.Buffer.prototype instanceof Uint8Array && util.Buffer.prototype.set.name === "set"
    	        ? function writeBytesBuffer_set(val, buf, pos) {
    	          buf.set(val, pos); // faster than copy (requires node >= 4 where Buffers extend Uint8Array and set is properly inherited)
    	          // also works for plain array values
    	        }
    	        /* istanbul ignore next */
    	        : function writeBytesBuffer_copy(val, buf, pos) {
    	          if (val.copy) // Buffer values
    	            val.copy(buf, pos, 0, val.length);
    	          else for (var i = 0; i < val.length;) // plain array values
    	            buf[pos++] = val[i++];
    	        };
    	};


    	/**
    	 * @override
    	 */
    	BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
    	    if (util.isString(value))
    	        value = util._Buffer_from(value, "base64");
    	    var len = value.length >>> 0;
    	    this.uint32(len);
    	    if (len)
    	        this._push(BufferWriter.writeBytesBuffer, len, value);
    	    return this;
    	};

    	function writeStringBuffer(val, buf, pos) {
    	    if (val.length < 40) // plain js is faster for short strings (probably due to redundant assertions)
    	        util.utf8.write(val, buf, pos);
    	    else if (buf.utf8Write)
    	        buf.utf8Write(val, pos);
    	    else
    	        buf.write(val, pos);
    	}

    	/**
    	 * @override
    	 */
    	BufferWriter.prototype.string = function write_string_buffer(value) {
    	    var len = util.Buffer.byteLength(value);
    	    this.uint32(len);
    	    if (len)
    	        this._push(writeStringBuffer, len, value);
    	    return this;
    	};


    	/**
    	 * Finishes the write operation.
    	 * @name BufferWriter#finish
    	 * @function
    	 * @returns {Buffer} Finished buffer
    	 */

    	BufferWriter._configure();
    	return writer_buffer;
    }

    var reader;
    var hasRequiredReader;

    function requireReader () {
    	if (hasRequiredReader) return reader;
    	hasRequiredReader = 1;
    	reader = Reader;

    	var util      = requireMinimal$1();

    	var BufferReader; // cyclic

    	var LongBits  = util.LongBits,
    	    utf8      = util.utf8;

    	/* istanbul ignore next */
    	function indexOutOfRange(reader, writeLength) {
    	    return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
    	}

    	/**
    	 * Constructs a new reader instance using the specified buffer.
    	 * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
    	 * @constructor
    	 * @param {Uint8Array} buffer Buffer to read from
    	 */
    	function Reader(buffer) {

    	    /**
    	     * Read buffer.
    	     * @type {Uint8Array}
    	     */
    	    this.buf = buffer;

    	    /**
    	     * Read buffer position.
    	     * @type {number}
    	     */
    	    this.pos = 0;

    	    /**
    	     * Read buffer length.
    	     * @type {number}
    	     */
    	    this.len = buffer.length;
    	}

    	var create_array = typeof Uint8Array !== "undefined"
    	    ? function create_typed_array(buffer) {
    	        if (buffer instanceof Uint8Array || Array.isArray(buffer))
    	            return new Reader(buffer);
    	        throw Error("illegal buffer");
    	    }
    	    /* istanbul ignore next */
    	    : function create_array(buffer) {
    	        if (Array.isArray(buffer))
    	            return new Reader(buffer);
    	        throw Error("illegal buffer");
    	    };

    	var create = function create() {
    	    return util.Buffer
    	        ? function create_buffer_setup(buffer) {
    	            return (Reader.create = function create_buffer(buffer) {
    	                return util.Buffer.isBuffer(buffer)
    	                    ? new BufferReader(buffer)
    	                    /* istanbul ignore next */
    	                    : create_array(buffer);
    	            })(buffer);
    	        }
    	        /* istanbul ignore next */
    	        : create_array;
    	};

    	/**
    	 * Creates a new reader using the specified buffer.
    	 * @function
    	 * @param {Uint8Array|Buffer} buffer Buffer to read from
    	 * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
    	 * @throws {Error} If `buffer` is not a valid buffer
    	 */
    	Reader.create = create();

    	Reader.prototype._slice = util.Array.prototype.subarray || /* istanbul ignore next */ util.Array.prototype.slice;

    	/**
    	 * Reads a varint as an unsigned 32 bit value.
    	 * @function
    	 * @returns {number} Value read
    	 */
    	Reader.prototype.uint32 = (function read_uint32_setup() {
    	    var value = 4294967295; // optimizer type-hint, tends to deopt otherwise (?!)
    	    return function read_uint32() {
    	        value = (         this.buf[this.pos] & 127       ) >>> 0; if (this.buf[this.pos++] < 128) return value;
    	        value = (value | (this.buf[this.pos] & 127) <<  7) >>> 0; if (this.buf[this.pos++] < 128) return value;
    	        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0; if (this.buf[this.pos++] < 128) return value;
    	        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0; if (this.buf[this.pos++] < 128) return value;
    	        value = (value | (this.buf[this.pos] &  15) << 28) >>> 0; if (this.buf[this.pos++] < 128) return value;

    	        /* istanbul ignore if */
    	        if ((this.pos += 5) > this.len) {
    	            this.pos = this.len;
    	            throw indexOutOfRange(this, 10);
    	        }
    	        return value;
    	    };
    	})();

    	/**
    	 * Reads a varint as a signed 32 bit value.
    	 * @returns {number} Value read
    	 */
    	Reader.prototype.int32 = function read_int32() {
    	    return this.uint32() | 0;
    	};

    	/**
    	 * Reads a zig-zag encoded varint as a signed 32 bit value.
    	 * @returns {number} Value read
    	 */
    	Reader.prototype.sint32 = function read_sint32() {
    	    var value = this.uint32();
    	    return value >>> 1 ^ -(value & 1) | 0;
    	};

    	/* eslint-disable no-invalid-this */

    	function readLongVarint() {
    	    // tends to deopt with local vars for octet etc.
    	    var bits = new LongBits(0, 0);
    	    var i = 0;
    	    if (this.len - this.pos > 4) { // fast route (lo)
    	        for (; i < 4; ++i) {
    	            // 1st..4th
    	            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
    	            if (this.buf[this.pos++] < 128)
    	                return bits;
    	        }
    	        // 5th
    	        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
    	        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >>  4) >>> 0;
    	        if (this.buf[this.pos++] < 128)
    	            return bits;
    	        i = 0;
    	    } else {
    	        for (; i < 3; ++i) {
    	            /* istanbul ignore if */
    	            if (this.pos >= this.len)
    	                throw indexOutOfRange(this);
    	            // 1st..3th
    	            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
    	            if (this.buf[this.pos++] < 128)
    	                return bits;
    	        }
    	        // 4th
    	        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
    	        return bits;
    	    }
    	    if (this.len - this.pos > 4) { // fast route (hi)
    	        for (; i < 5; ++i) {
    	            // 6th..10th
    	            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
    	            if (this.buf[this.pos++] < 128)
    	                return bits;
    	        }
    	    } else {
    	        for (; i < 5; ++i) {
    	            /* istanbul ignore if */
    	            if (this.pos >= this.len)
    	                throw indexOutOfRange(this);
    	            // 6th..10th
    	            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
    	            if (this.buf[this.pos++] < 128)
    	                return bits;
    	        }
    	    }
    	    /* istanbul ignore next */
    	    throw Error("invalid varint encoding");
    	}

    	/* eslint-enable no-invalid-this */

    	/**
    	 * Reads a varint as a signed 64 bit value.
    	 * @name Reader#int64
    	 * @function
    	 * @returns {Long} Value read
    	 */

    	/**
    	 * Reads a varint as an unsigned 64 bit value.
    	 * @name Reader#uint64
    	 * @function
    	 * @returns {Long} Value read
    	 */

    	/**
    	 * Reads a zig-zag encoded varint as a signed 64 bit value.
    	 * @name Reader#sint64
    	 * @function
    	 * @returns {Long} Value read
    	 */

    	/**
    	 * Reads a varint as a boolean.
    	 * @returns {boolean} Value read
    	 */
    	Reader.prototype.bool = function read_bool() {
    	    return this.uint32() !== 0;
    	};

    	function readFixed32_end(buf, end) { // note that this uses `end`, not `pos`
    	    return (buf[end - 4]
    	          | buf[end - 3] << 8
    	          | buf[end - 2] << 16
    	          | buf[end - 1] << 24) >>> 0;
    	}

    	/**
    	 * Reads fixed 32 bits as an unsigned 32 bit integer.
    	 * @returns {number} Value read
    	 */
    	Reader.prototype.fixed32 = function read_fixed32() {

    	    /* istanbul ignore if */
    	    if (this.pos + 4 > this.len)
    	        throw indexOutOfRange(this, 4);

    	    return readFixed32_end(this.buf, this.pos += 4);
    	};

    	/**
    	 * Reads fixed 32 bits as a signed 32 bit integer.
    	 * @returns {number} Value read
    	 */
    	Reader.prototype.sfixed32 = function read_sfixed32() {

    	    /* istanbul ignore if */
    	    if (this.pos + 4 > this.len)
    	        throw indexOutOfRange(this, 4);

    	    return readFixed32_end(this.buf, this.pos += 4) | 0;
    	};

    	/* eslint-disable no-invalid-this */

    	function readFixed64(/* this: Reader */) {

    	    /* istanbul ignore if */
    	    if (this.pos + 8 > this.len)
    	        throw indexOutOfRange(this, 8);

    	    return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
    	}

    	/* eslint-enable no-invalid-this */

    	/**
    	 * Reads fixed 64 bits.
    	 * @name Reader#fixed64
    	 * @function
    	 * @returns {Long} Value read
    	 */

    	/**
    	 * Reads zig-zag encoded fixed 64 bits.
    	 * @name Reader#sfixed64
    	 * @function
    	 * @returns {Long} Value read
    	 */

    	/**
    	 * Reads a float (32 bit) as a number.
    	 * @function
    	 * @returns {number} Value read
    	 */
    	Reader.prototype.float = function read_float() {

    	    /* istanbul ignore if */
    	    if (this.pos + 4 > this.len)
    	        throw indexOutOfRange(this, 4);

    	    var value = util.float.readFloatLE(this.buf, this.pos);
    	    this.pos += 4;
    	    return value;
    	};

    	/**
    	 * Reads a double (64 bit float) as a number.
    	 * @function
    	 * @returns {number} Value read
    	 */
    	Reader.prototype.double = function read_double() {

    	    /* istanbul ignore if */
    	    if (this.pos + 8 > this.len)
    	        throw indexOutOfRange(this, 4);

    	    var value = util.float.readDoubleLE(this.buf, this.pos);
    	    this.pos += 8;
    	    return value;
    	};

    	/**
    	 * Reads a sequence of bytes preceeded by its length as a varint.
    	 * @returns {Uint8Array} Value read
    	 */
    	Reader.prototype.bytes = function read_bytes() {
    	    var length = this.uint32(),
    	        start  = this.pos,
    	        end    = this.pos + length;

    	    /* istanbul ignore if */
    	    if (end > this.len)
    	        throw indexOutOfRange(this, length);

    	    this.pos += length;
    	    if (Array.isArray(this.buf)) // plain array
    	        return this.buf.slice(start, end);
    	    return start === end // fix for IE 10/Win8 and others' subarray returning array of size 1
    	        ? new this.buf.constructor(0)
    	        : this._slice.call(this.buf, start, end);
    	};

    	/**
    	 * Reads a string preceeded by its byte length as a varint.
    	 * @returns {string} Value read
    	 */
    	Reader.prototype.string = function read_string() {
    	    var bytes = this.bytes();
    	    return utf8.read(bytes, 0, bytes.length);
    	};

    	/**
    	 * Skips the specified number of bytes if specified, otherwise skips a varint.
    	 * @param {number} [length] Length if known, otherwise a varint is assumed
    	 * @returns {Reader} `this`
    	 */
    	Reader.prototype.skip = function skip(length) {
    	    if (typeof length === "number") {
    	        /* istanbul ignore if */
    	        if (this.pos + length > this.len)
    	            throw indexOutOfRange(this, length);
    	        this.pos += length;
    	    } else {
    	        do {
    	            /* istanbul ignore if */
    	            if (this.pos >= this.len)
    	                throw indexOutOfRange(this);
    	        } while (this.buf[this.pos++] & 128);
    	    }
    	    return this;
    	};

    	/**
    	 * Skips the next element of the specified wire type.
    	 * @param {number} wireType Wire type received
    	 * @returns {Reader} `this`
    	 */
    	Reader.prototype.skipType = function(wireType) {
    	    switch (wireType) {
    	        case 0:
    	            this.skip();
    	            break;
    	        case 1:
    	            this.skip(8);
    	            break;
    	        case 2:
    	            this.skip(this.uint32());
    	            break;
    	        case 3:
    	            while ((wireType = this.uint32() & 7) !== 4) {
    	                this.skipType(wireType);
    	            }
    	            break;
    	        case 5:
    	            this.skip(4);
    	            break;

    	        /* istanbul ignore next */
    	        default:
    	            throw Error("invalid wire type " + wireType + " at offset " + this.pos);
    	    }
    	    return this;
    	};

    	Reader._configure = function(BufferReader_) {
    	    BufferReader = BufferReader_;
    	    Reader.create = create();
    	    BufferReader._configure();

    	    var fn = util.Long ? "toLong" : /* istanbul ignore next */ "toNumber";
    	    util.merge(Reader.prototype, {

    	        int64: function read_int64() {
    	            return readLongVarint.call(this)[fn](false);
    	        },

    	        uint64: function read_uint64() {
    	            return readLongVarint.call(this)[fn](true);
    	        },

    	        sint64: function read_sint64() {
    	            return readLongVarint.call(this).zzDecode()[fn](false);
    	        },

    	        fixed64: function read_fixed64() {
    	            return readFixed64.call(this)[fn](true);
    	        },

    	        sfixed64: function read_sfixed64() {
    	            return readFixed64.call(this)[fn](false);
    	        }

    	    });
    	};
    	return reader;
    }

    var reader_buffer;
    var hasRequiredReader_buffer;

    function requireReader_buffer () {
    	if (hasRequiredReader_buffer) return reader_buffer;
    	hasRequiredReader_buffer = 1;
    	reader_buffer = BufferReader;

    	// extends Reader
    	var Reader = requireReader();
    	(BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;

    	var util = requireMinimal$1();

    	/**
    	 * Constructs a new buffer reader instance.
    	 * @classdesc Wire format reader using node buffers.
    	 * @extends Reader
    	 * @constructor
    	 * @param {Buffer} buffer Buffer to read from
    	 */
    	function BufferReader(buffer) {
    	    Reader.call(this, buffer);

    	    /**
    	     * Read buffer.
    	     * @name BufferReader#buf
    	     * @type {Buffer}
    	     */
    	}

    	BufferReader._configure = function () {
    	    /* istanbul ignore else */
    	    if (util.Buffer)
    	        BufferReader.prototype._slice = util.Buffer.prototype.slice;
    	};


    	/**
    	 * @override
    	 */
    	BufferReader.prototype.string = function read_string_buffer() {
    	    var len = this.uint32(); // modifies pos
    	    return this.buf.utf8Slice
    	        ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len))
    	        : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
    	};

    	/**
    	 * Reads a sequence of bytes preceeded by its length as a varint.
    	 * @name BufferReader#bytes
    	 * @function
    	 * @returns {Buffer} Value read
    	 */

    	BufferReader._configure();
    	return reader_buffer;
    }

    var rpc = {};

    var service;
    var hasRequiredService;

    function requireService () {
    	if (hasRequiredService) return service;
    	hasRequiredService = 1;
    	service = Service;

    	var util = requireMinimal$1();

    	// Extends EventEmitter
    	(Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;

    	/**
    	 * A service method callback as used by {@link rpc.ServiceMethod|ServiceMethod}.
    	 *
    	 * Differs from {@link RPCImplCallback} in that it is an actual callback of a service method which may not return `response = null`.
    	 * @typedef rpc.ServiceMethodCallback
    	 * @template TRes extends Message<TRes>
    	 * @type {function}
    	 * @param {Error|null} error Error, if any
    	 * @param {TRes} [response] Response message
    	 * @returns {undefined}
    	 */

    	/**
    	 * A service method part of a {@link rpc.Service} as created by {@link Service.create}.
    	 * @typedef rpc.ServiceMethod
    	 * @template TReq extends Message<TReq>
    	 * @template TRes extends Message<TRes>
    	 * @type {function}
    	 * @param {TReq|Properties<TReq>} request Request message or plain object
    	 * @param {rpc.ServiceMethodCallback<TRes>} [callback] Node-style callback called with the error, if any, and the response message
    	 * @returns {Promise<Message<TRes>>} Promise if `callback` has been omitted, otherwise `undefined`
    	 */

    	/**
    	 * Constructs a new RPC service instance.
    	 * @classdesc An RPC service as returned by {@link Service#create}.
    	 * @exports rpc.Service
    	 * @extends util.EventEmitter
    	 * @constructor
    	 * @param {RPCImpl} rpcImpl RPC implementation
    	 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
    	 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
    	 */
    	function Service(rpcImpl, requestDelimited, responseDelimited) {

    	    if (typeof rpcImpl !== "function")
    	        throw TypeError("rpcImpl must be a function");

    	    util.EventEmitter.call(this);

    	    /**
    	     * RPC implementation. Becomes `null` once the service is ended.
    	     * @type {RPCImpl|null}
    	     */
    	    this.rpcImpl = rpcImpl;

    	    /**
    	     * Whether requests are length-delimited.
    	     * @type {boolean}
    	     */
    	    this.requestDelimited = Boolean(requestDelimited);

    	    /**
    	     * Whether responses are length-delimited.
    	     * @type {boolean}
    	     */
    	    this.responseDelimited = Boolean(responseDelimited);
    	}

    	/**
    	 * Calls a service method through {@link rpc.Service#rpcImpl|rpcImpl}.
    	 * @param {Method|rpc.ServiceMethod<TReq,TRes>} method Reflected or static method
    	 * @param {Constructor<TReq>} requestCtor Request constructor
    	 * @param {Constructor<TRes>} responseCtor Response constructor
    	 * @param {TReq|Properties<TReq>} request Request message or plain object
    	 * @param {rpc.ServiceMethodCallback<TRes>} callback Service callback
    	 * @returns {undefined}
    	 * @template TReq extends Message<TReq>
    	 * @template TRes extends Message<TRes>
    	 */
    	Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {

    	    if (!request)
    	        throw TypeError("request must be specified");

    	    var self = this;
    	    if (!callback)
    	        return util.asPromise(rpcCall, self, method, requestCtor, responseCtor, request);

    	    if (!self.rpcImpl) {
    	        setTimeout(function() { callback(Error("already ended")); }, 0);
    	        return undefined;
    	    }

    	    try {
    	        return self.rpcImpl(
    	            method,
    	            requestCtor[self.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
    	            function rpcCallback(err, response) {

    	                if (err) {
    	                    self.emit("error", err, method);
    	                    return callback(err);
    	                }

    	                if (response === null) {
    	                    self.end(/* endedByRPC */ true);
    	                    return undefined;
    	                }

    	                if (!(response instanceof responseCtor)) {
    	                    try {
    	                        response = responseCtor[self.responseDelimited ? "decodeDelimited" : "decode"](response);
    	                    } catch (err) {
    	                        self.emit("error", err, method);
    	                        return callback(err);
    	                    }
    	                }

    	                self.emit("data", response, method);
    	                return callback(null, response);
    	            }
    	        );
    	    } catch (err) {
    	        self.emit("error", err, method);
    	        setTimeout(function() { callback(err); }, 0);
    	        return undefined;
    	    }
    	};

    	/**
    	 * Ends this service and emits the `end` event.
    	 * @param {boolean} [endedByRPC=false] Whether the service has been ended by the RPC implementation.
    	 * @returns {rpc.Service} `this`
    	 */
    	Service.prototype.end = function end(endedByRPC) {
    	    if (this.rpcImpl) {
    	        if (!endedByRPC) // signal end to rpcImpl
    	            this.rpcImpl(null, null, null);
    	        this.rpcImpl = null;
    	        this.emit("end").off();
    	    }
    	    return this;
    	};
    	return service;
    }

    var hasRequiredRpc;

    function requireRpc () {
    	if (hasRequiredRpc) return rpc;
    	hasRequiredRpc = 1;
    	(function (exports) {

    		/**
    		 * Streaming RPC helpers.
    		 * @namespace
    		 */
    		var rpc = exports;

    		/**
    		 * RPC implementation passed to {@link Service#create} performing a service request on network level, i.e. by utilizing http requests or websockets.
    		 * @typedef RPCImpl
    		 * @type {function}
    		 * @param {Method|rpc.ServiceMethod<Message<{}>,Message<{}>>} method Reflected or static method being called
    		 * @param {Uint8Array} requestData Request data
    		 * @param {RPCImplCallback} callback Callback function
    		 * @returns {undefined}
    		 * @example
    		 * function rpcImpl(method, requestData, callback) {
    		 *     if (protobuf.util.lcFirst(method.name) !== "myMethod") // compatible with static code
    		 *         throw Error("no such method");
    		 *     asynchronouslyObtainAResponse(requestData, function(err, responseData) {
    		 *         callback(err, responseData);
    		 *     });
    		 * }
    		 */

    		/**
    		 * Node-style callback as used by {@link RPCImpl}.
    		 * @typedef RPCImplCallback
    		 * @type {function}
    		 * @param {Error|null} error Error, if any, otherwise `null`
    		 * @param {Uint8Array|null} [response] Response data or `null` to signal end of stream, if there hasn't been an error
    		 * @returns {undefined}
    		 */

    		rpc.Service = requireService(); 
    	} (rpc));
    	return rpc;
    }

    var roots;
    var hasRequiredRoots;

    function requireRoots () {
    	if (hasRequiredRoots) return roots;
    	hasRequiredRoots = 1;
    	roots = {};

    	/**
    	 * Named roots.
    	 * This is where pbjs stores generated structures (the option `-r, --root` specifies a name).
    	 * Can also be used manually to make roots available across modules.
    	 * @name roots
    	 * @type {Object.<string,Root>}
    	 * @example
    	 * // pbjs -r myroot -o compiled.js ...
    	 *
    	 * // in another module:
    	 * require("./compiled.js");
    	 *
    	 * // in any subsequent module:
    	 * var root = protobuf.roots["myroot"];
    	 */
    	return roots;
    }

    var hasRequiredIndexMinimal;

    function requireIndexMinimal () {
    	if (hasRequiredIndexMinimal) return indexMinimal;
    	hasRequiredIndexMinimal = 1;
    	(function (exports) {
    		var protobuf = exports;

    		/**
    		 * Build type, one of `"full"`, `"light"` or `"minimal"`.
    		 * @name build
    		 * @type {string}
    		 * @const
    		 */
    		protobuf.build = "minimal";

    		// Serialization
    		protobuf.Writer       = requireWriter();
    		protobuf.BufferWriter = requireWriter_buffer();
    		protobuf.Reader       = requireReader();
    		protobuf.BufferReader = requireReader_buffer();

    		// Utility
    		protobuf.util         = requireMinimal$1();
    		protobuf.rpc          = requireRpc();
    		protobuf.roots        = requireRoots();
    		protobuf.configure    = configure;

    		/* istanbul ignore next */
    		/**
    		 * Reconfigures the library according to the environment.
    		 * @returns {undefined}
    		 */
    		function configure() {
    		    protobuf.util._configure();
    		    protobuf.Writer._configure(protobuf.BufferWriter);
    		    protobuf.Reader._configure(protobuf.BufferReader);
    		}

    		// Set up buffer utility according to the environment
    		configure(); 
    	} (indexMinimal));
    	return indexMinimal;
    }

    var minimal;
    var hasRequiredMinimal;

    function requireMinimal () {
    	if (hasRequiredMinimal) return minimal;
    	hasRequiredMinimal = 1;
    	minimal = requireIndexMinimal();
    	return minimal;
    }

    /*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/

    (function (module) {
    	(function(global, factory) { /* global define, require, module */

    	    /* AMD */ if (typeof commonjsRequire === 'function' && 'object' === 'object' && module && module.exports)
    	        module.exports = factory(requireMinimal());

    	})(commonjsGlobal, function($protobuf) {

    	    // Common aliases
    	    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    	    
    	    // Exported root namespace
    	    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    	    
    	    $root.Message = (function() {
    	    
    	        /**
    	         * Properties of a Message.
    	         * @exports IMessage
    	         * @interface IMessage
    	         * @property {string|null} [userId] Message userId
    	         * @property {number|Long|null} [messageId] Message messageId
    	         * @property {number|null} [last] Message last
    	         * @property {string|null} [token] Message token
    	         * @property {string|null} [userChannel] Message userChannel
    	         * @property {string|null} [vpsToken] Message vpsToken
    	         * @property {Array.<IDevContext>|null} [devContext] Устарело с версии 3.
    	         * @property {string|null} [messageName] Message messageName
    	         * @property {number|null} [version] Message version
    	         * @property {IVoice|null} [voice] Message voice
    	         * @property {IText|null} [text] Message text
    	         * @property {ISystemMessage|null} [systemMessage] Message systemMessage
    	         * @property {ILegacyDevice|null} [legacyDevice] Message legacyDevice
    	         * @property {ISettings|null} [settings] Message settings
    	         * @property {IStatus|null} [status] Message status
    	         * @property {IDevice|null} [device] Message device
    	         * @property {IBytes|null} [bytes] Message bytes
    	         * @property {IInitialSettings|null} [initialSettings] Message initialSettings
    	         * @property {ICancel|null} [cancel] Message cancel
    	         * @property {IGetHistoryRequest|null} [getHistoryRequest] Message getHistoryRequest
    	         * @property {IMute|null} [mute] Message mute
    	         * @property {number|Long|null} [timestamp] Message timestamp
    	         * @property {Object.<string,string>|null} [meta] Message meta
    	         */
    	    
    	        /**
    	         * Constructs a new Message.
    	         * @exports Message
    	         * @classdesc Represents a Message.
    	         * @implements IMessage
    	         * @constructor
    	         * @param {IMessage=} [properties] Properties to set
    	         */
    	        function Message(properties) {
    	            this.devContext = [];
    	            this.meta = {};
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Message userId.
    	         * @member {string} userId
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.userId = "";
    	    
    	        /**
    	         * Message messageId.
    	         * @member {number|Long} messageId
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.messageId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    	    
    	        /**
    	         * Message last.
    	         * @member {number} last
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.last = 0;
    	    
    	        /**
    	         * Message token.
    	         * @member {string} token
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.token = "";
    	    
    	        /**
    	         * Message userChannel.
    	         * @member {string} userChannel
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.userChannel = "";
    	    
    	        /**
    	         * Message vpsToken.
    	         * @member {string} vpsToken
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.vpsToken = "";
    	    
    	        /**
    	         * Устарело с версии 3.
    	         * @member {Array.<IDevContext>} devContext
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.devContext = $util.emptyArray;
    	    
    	        /**
    	         * Message messageName.
    	         * @member {string} messageName
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.messageName = "";
    	    
    	        /**
    	         * Message version.
    	         * @member {number} version
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.version = 0;
    	    
    	        /**
    	         * Message voice.
    	         * @member {IVoice|null|undefined} voice
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.voice = null;
    	    
    	        /**
    	         * Message text.
    	         * @member {IText|null|undefined} text
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.text = null;
    	    
    	        /**
    	         * Message systemMessage.
    	         * @member {ISystemMessage|null|undefined} systemMessage
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.systemMessage = null;
    	    
    	        /**
    	         * Message legacyDevice.
    	         * @member {ILegacyDevice|null|undefined} legacyDevice
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.legacyDevice = null;
    	    
    	        /**
    	         * Message settings.
    	         * @member {ISettings|null|undefined} settings
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.settings = null;
    	    
    	        /**
    	         * Message status.
    	         * @member {IStatus|null|undefined} status
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.status = null;
    	    
    	        /**
    	         * Message device.
    	         * @member {IDevice|null|undefined} device
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.device = null;
    	    
    	        /**
    	         * Message bytes.
    	         * @member {IBytes|null|undefined} bytes
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.bytes = null;
    	    
    	        /**
    	         * Message initialSettings.
    	         * @member {IInitialSettings|null|undefined} initialSettings
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.initialSettings = null;
    	    
    	        /**
    	         * Message cancel.
    	         * @member {ICancel|null|undefined} cancel
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.cancel = null;
    	    
    	        /**
    	         * Message getHistoryRequest.
    	         * @member {IGetHistoryRequest|null|undefined} getHistoryRequest
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.getHistoryRequest = null;
    	    
    	        /**
    	         * Message mute.
    	         * @member {IMute|null|undefined} mute
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.mute = null;
    	    
    	        /**
    	         * Message timestamp.
    	         * @member {number|Long} timestamp
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    	    
    	        /**
    	         * Message meta.
    	         * @member {Object.<string,string>} meta
    	         * @memberof Message
    	         * @instance
    	         */
    	        Message.prototype.meta = $util.emptyObject;
    	    
    	        // OneOf field names bound to virtual getters and setters
    	        var $oneOfFields;
    	    
    	        /**
    	         * Message content.
    	         * @member {"voice"|"text"|"systemMessage"|"legacyDevice"|"settings"|"status"|"device"|"bytes"|"initialSettings"|"cancel"|"getHistoryRequest"|"mute"|undefined} content
    	         * @memberof Message
    	         * @instance
    	         */
    	        Object.defineProperty(Message.prototype, "content", {
    	            get: $util.oneOfGetter($oneOfFields = ["voice", "text", "systemMessage", "legacyDevice", "settings", "status", "device", "bytes", "initialSettings", "cancel", "getHistoryRequest", "mute"]),
    	            set: $util.oneOfSetter($oneOfFields)
    	        });
    	    
    	        /**
    	         * Creates a new Message instance using the specified properties.
    	         * @function create
    	         * @memberof Message
    	         * @static
    	         * @param {IMessage=} [properties] Properties to set
    	         * @returns {Message} Message instance
    	         */
    	        Message.create = function create(properties) {
    	            return new Message(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified Message message. Does not implicitly {@link Message.verify|verify} messages.
    	         * @function encode
    	         * @memberof Message
    	         * @static
    	         * @param {IMessage} message Message message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        Message.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
    	                writer.uint32(/* id 1, wireType 2 =*/10).string(message.userId);
    	            if (message.messageId != null && Object.hasOwnProperty.call(message, "messageId"))
    	                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.messageId);
    	            if (message.last != null && Object.hasOwnProperty.call(message, "last"))
    	                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.last);
    	            if (message.token != null && Object.hasOwnProperty.call(message, "token"))
    	                writer.uint32(/* id 4, wireType 2 =*/34).string(message.token);
    	            if (message.voice != null && Object.hasOwnProperty.call(message, "voice"))
    	                $root.Voice.encode(message.voice, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
    	            if (message.text != null && Object.hasOwnProperty.call(message, "text"))
    	                $root.Text.encode(message.text, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
    	            if (message.systemMessage != null && Object.hasOwnProperty.call(message, "systemMessage"))
    	                $root.SystemMessage.encode(message.systemMessage, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
    	            if (message.legacyDevice != null && Object.hasOwnProperty.call(message, "legacyDevice"))
    	                $root.LegacyDevice.encode(message.legacyDevice, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
    	            if (message.settings != null && Object.hasOwnProperty.call(message, "settings"))
    	                $root.Settings.encode(message.settings, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
    	            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
    	                $root.Status.encode(message.status, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
    	            if (message.userChannel != null && Object.hasOwnProperty.call(message, "userChannel"))
    	                writer.uint32(/* id 11, wireType 2 =*/90).string(message.userChannel);
    	            if (message.vpsToken != null && Object.hasOwnProperty.call(message, "vpsToken"))
    	                writer.uint32(/* id 12, wireType 2 =*/98).string(message.vpsToken);
    	            if (message.devContext != null && message.devContext.length)
    	                for (var i = 0; i < message.devContext.length; ++i)
    	                    $root.DevContext.encode(message.devContext[i], writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
    	            if (message.messageName != null && Object.hasOwnProperty.call(message, "messageName"))
    	                writer.uint32(/* id 14, wireType 2 =*/114).string(message.messageName);
    	            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
    	                writer.uint32(/* id 15, wireType 0 =*/120).int32(message.version);
    	            if (message.device != null && Object.hasOwnProperty.call(message, "device"))
    	                $root.Device.encode(message.device, writer.uint32(/* id 16, wireType 2 =*/130).fork()).ldelim();
    	            if (message.bytes != null && Object.hasOwnProperty.call(message, "bytes"))
    	                $root.Bytes.encode(message.bytes, writer.uint32(/* id 17, wireType 2 =*/138).fork()).ldelim();
    	            if (message.initialSettings != null && Object.hasOwnProperty.call(message, "initialSettings"))
    	                $root.InitialSettings.encode(message.initialSettings, writer.uint32(/* id 18, wireType 2 =*/146).fork()).ldelim();
    	            if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
    	                writer.uint32(/* id 19, wireType 0 =*/152).int64(message.timestamp);
    	            if (message.meta != null && Object.hasOwnProperty.call(message, "meta"))
    	                for (var keys = Object.keys(message.meta), i = 0; i < keys.length; ++i)
    	                    writer.uint32(/* id 20, wireType 2 =*/162).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.meta[keys[i]]).ldelim();
    	            if (message.cancel != null && Object.hasOwnProperty.call(message, "cancel"))
    	                $root.Cancel.encode(message.cancel, writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
    	            if (message.getHistoryRequest != null && Object.hasOwnProperty.call(message, "getHistoryRequest"))
    	                $root.GetHistoryRequest.encode(message.getHistoryRequest, writer.uint32(/* id 22, wireType 2 =*/178).fork()).ldelim();
    	            if (message.mute != null && Object.hasOwnProperty.call(message, "mute"))
    	                $root.Mute.encode(message.mute, writer.uint32(/* id 23, wireType 2 =*/186).fork()).ldelim();
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a Message message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Message
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Message} Message
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Message.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Message(), key, value;
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.userId = reader.string();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.messageId = reader.int64();
    	                        break;
    	                    }
    	                case 3: {
    	                        message.last = reader.int32();
    	                        break;
    	                    }
    	                case 4: {
    	                        message.token = reader.string();
    	                        break;
    	                    }
    	                case 11: {
    	                        message.userChannel = reader.string();
    	                        break;
    	                    }
    	                case 12: {
    	                        message.vpsToken = reader.string();
    	                        break;
    	                    }
    	                case 13: {
    	                        if (!(message.devContext && message.devContext.length))
    	                            message.devContext = [];
    	                        message.devContext.push($root.DevContext.decode(reader, reader.uint32()));
    	                        break;
    	                    }
    	                case 14: {
    	                        message.messageName = reader.string();
    	                        break;
    	                    }
    	                case 15: {
    	                        message.version = reader.int32();
    	                        break;
    	                    }
    	                case 5: {
    	                        message.voice = $root.Voice.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 6: {
    	                        message.text = $root.Text.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 7: {
    	                        message.systemMessage = $root.SystemMessage.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 8: {
    	                        message.legacyDevice = $root.LegacyDevice.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 9: {
    	                        message.settings = $root.Settings.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 10: {
    	                        message.status = $root.Status.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 16: {
    	                        message.device = $root.Device.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 17: {
    	                        message.bytes = $root.Bytes.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 18: {
    	                        message.initialSettings = $root.InitialSettings.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 21: {
    	                        message.cancel = $root.Cancel.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 22: {
    	                        message.getHistoryRequest = $root.GetHistoryRequest.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 23: {
    	                        message.mute = $root.Mute.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 19: {
    	                        message.timestamp = reader.int64();
    	                        break;
    	                    }
    	                case 20: {
    	                        if (message.meta === $util.emptyObject)
    	                            message.meta = {};
    	                        var end2 = reader.uint32() + reader.pos;
    	                        key = "";
    	                        value = "";
    	                        while (reader.pos < end2) {
    	                            var tag2 = reader.uint32();
    	                            switch (tag2 >>> 3) {
    	                            case 1:
    	                                key = reader.string();
    	                                break;
    	                            case 2:
    	                                value = reader.string();
    	                                break;
    	                            default:
    	                                reader.skipType(tag2 & 7);
    	                                break;
    	                            }
    	                        }
    	                        message.meta[key] = value;
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Message;
    	    })();
    	    
    	    $root.InitialSettings = (function() {
    	    
    	        /**
    	         * Properties of an InitialSettings.
    	         * @exports IInitialSettings
    	         * @interface IInitialSettings
    	         * @property {string|null} [userId] InitialSettings userId
    	         * @property {string|null} [userChannel] InitialSettings userChannel
    	         * @property {IDevice|null} [device] InitialSettings device
    	         * @property {ISettings|null} [settings] InitialSettings settings
    	         * @property {string|null} [locale] InitialSettings locale
    	         */
    	    
    	        /**
    	         * Constructs a new InitialSettings.
    	         * @exports InitialSettings
    	         * @classdesc Represents an InitialSettings.
    	         * @implements IInitialSettings
    	         * @constructor
    	         * @param {IInitialSettings=} [properties] Properties to set
    	         */
    	        function InitialSettings(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * InitialSettings userId.
    	         * @member {string} userId
    	         * @memberof InitialSettings
    	         * @instance
    	         */
    	        InitialSettings.prototype.userId = "";
    	    
    	        /**
    	         * InitialSettings userChannel.
    	         * @member {string} userChannel
    	         * @memberof InitialSettings
    	         * @instance
    	         */
    	        InitialSettings.prototype.userChannel = "";
    	    
    	        /**
    	         * InitialSettings device.
    	         * @member {IDevice|null|undefined} device
    	         * @memberof InitialSettings
    	         * @instance
    	         */
    	        InitialSettings.prototype.device = null;
    	    
    	        /**
    	         * InitialSettings settings.
    	         * @member {ISettings|null|undefined} settings
    	         * @memberof InitialSettings
    	         * @instance
    	         */
    	        InitialSettings.prototype.settings = null;
    	    
    	        /**
    	         * InitialSettings locale.
    	         * @member {string} locale
    	         * @memberof InitialSettings
    	         * @instance
    	         */
    	        InitialSettings.prototype.locale = "";
    	    
    	        /**
    	         * Creates a new InitialSettings instance using the specified properties.
    	         * @function create
    	         * @memberof InitialSettings
    	         * @static
    	         * @param {IInitialSettings=} [properties] Properties to set
    	         * @returns {InitialSettings} InitialSettings instance
    	         */
    	        InitialSettings.create = function create(properties) {
    	            return new InitialSettings(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified InitialSettings message. Does not implicitly {@link InitialSettings.verify|verify} messages.
    	         * @function encode
    	         * @memberof InitialSettings
    	         * @static
    	         * @param {IInitialSettings} message InitialSettings message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        InitialSettings.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
    	                writer.uint32(/* id 1, wireType 2 =*/10).string(message.userId);
    	            if (message.userChannel != null && Object.hasOwnProperty.call(message, "userChannel"))
    	                writer.uint32(/* id 2, wireType 2 =*/18).string(message.userChannel);
    	            if (message.device != null && Object.hasOwnProperty.call(message, "device"))
    	                $root.Device.encode(message.device, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
    	            if (message.settings != null && Object.hasOwnProperty.call(message, "settings"))
    	                $root.Settings.encode(message.settings, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
    	            if (message.locale != null && Object.hasOwnProperty.call(message, "locale"))
    	                writer.uint32(/* id 5, wireType 2 =*/42).string(message.locale);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes an InitialSettings message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof InitialSettings
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {InitialSettings} InitialSettings
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        InitialSettings.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.InitialSettings();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.userId = reader.string();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.userChannel = reader.string();
    	                        break;
    	                    }
    	                case 3: {
    	                        message.device = $root.Device.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 4: {
    	                        message.settings = $root.Settings.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 5: {
    	                        message.locale = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return InitialSettings;
    	    })();
    	    
    	    $root.Device = (function() {
    	    
    	        /**
    	         * Properties of a Device.
    	         * @exports IDevice
    	         * @interface IDevice
    	         * @property {string|null} [platformType] Device platformType
    	         * @property {string|null} [platformVersion] Device platformVersion
    	         * @property {string|null} [surface] Обязательно. Пример, SBERBOX
    	         * @property {string|null} [surfaceVersion] Device surfaceVersion
    	         * @property {string|null} [features] Device features
    	         * @property {string|null} [capabilities] Device capabilities
    	         * @property {string|null} [deviceId] Device deviceId
    	         * @property {string|null} [deviceManufacturer] Device deviceManufacturer
    	         * @property {string|null} [deviceModel] Device deviceModel
    	         * @property {string|null} [additionalInfo] Device additionalInfo
    	         * @property {string|null} [tenant] Device tenant
    	         */
    	    
    	        /**
    	         * Constructs a new Device.
    	         * @exports Device
    	         * @classdesc Represents a Device.
    	         * @implements IDevice
    	         * @constructor
    	         * @param {IDevice=} [properties] Properties to set
    	         */
    	        function Device(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Device platformType.
    	         * @member {string} platformType
    	         * @memberof Device
    	         * @instance
    	         */
    	        Device.prototype.platformType = "";
    	    
    	        /**
    	         * Device platformVersion.
    	         * @member {string} platformVersion
    	         * @memberof Device
    	         * @instance
    	         */
    	        Device.prototype.platformVersion = "";
    	    
    	        /**
    	         * Обязательно. Пример, SBERBOX
    	         * @member {string} surface
    	         * @memberof Device
    	         * @instance
    	         */
    	        Device.prototype.surface = "";
    	    
    	        /**
    	         * Device surfaceVersion.
    	         * @member {string} surfaceVersion
    	         * @memberof Device
    	         * @instance
    	         */
    	        Device.prototype.surfaceVersion = "";
    	    
    	        /**
    	         * Device features.
    	         * @member {string} features
    	         * @memberof Device
    	         * @instance
    	         */
    	        Device.prototype.features = "";
    	    
    	        /**
    	         * Device capabilities.
    	         * @member {string} capabilities
    	         * @memberof Device
    	         * @instance
    	         */
    	        Device.prototype.capabilities = "";
    	    
    	        /**
    	         * Device deviceId.
    	         * @member {string} deviceId
    	         * @memberof Device
    	         * @instance
    	         */
    	        Device.prototype.deviceId = "";
    	    
    	        /**
    	         * Device deviceManufacturer.
    	         * @member {string} deviceManufacturer
    	         * @memberof Device
    	         * @instance
    	         */
    	        Device.prototype.deviceManufacturer = "";
    	    
    	        /**
    	         * Device deviceModel.
    	         * @member {string} deviceModel
    	         * @memberof Device
    	         * @instance
    	         */
    	        Device.prototype.deviceModel = "";
    	    
    	        /**
    	         * Device additionalInfo.
    	         * @member {string} additionalInfo
    	         * @memberof Device
    	         * @instance
    	         */
    	        Device.prototype.additionalInfo = "";
    	    
    	        /**
    	         * Device tenant.
    	         * @member {string} tenant
    	         * @memberof Device
    	         * @instance
    	         */
    	        Device.prototype.tenant = "";
    	    
    	        /**
    	         * Creates a new Device instance using the specified properties.
    	         * @function create
    	         * @memberof Device
    	         * @static
    	         * @param {IDevice=} [properties] Properties to set
    	         * @returns {Device} Device instance
    	         */
    	        Device.create = function create(properties) {
    	            return new Device(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified Device message. Does not implicitly {@link Device.verify|verify} messages.
    	         * @function encode
    	         * @memberof Device
    	         * @static
    	         * @param {IDevice} message Device message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        Device.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.platformType != null && Object.hasOwnProperty.call(message, "platformType"))
    	                writer.uint32(/* id 1, wireType 2 =*/10).string(message.platformType);
    	            if (message.platformVersion != null && Object.hasOwnProperty.call(message, "platformVersion"))
    	                writer.uint32(/* id 2, wireType 2 =*/18).string(message.platformVersion);
    	            if (message.surface != null && Object.hasOwnProperty.call(message, "surface"))
    	                writer.uint32(/* id 3, wireType 2 =*/26).string(message.surface);
    	            if (message.surfaceVersion != null && Object.hasOwnProperty.call(message, "surfaceVersion"))
    	                writer.uint32(/* id 4, wireType 2 =*/34).string(message.surfaceVersion);
    	            if (message.features != null && Object.hasOwnProperty.call(message, "features"))
    	                writer.uint32(/* id 5, wireType 2 =*/42).string(message.features);
    	            if (message.capabilities != null && Object.hasOwnProperty.call(message, "capabilities"))
    	                writer.uint32(/* id 6, wireType 2 =*/50).string(message.capabilities);
    	            if (message.deviceId != null && Object.hasOwnProperty.call(message, "deviceId"))
    	                writer.uint32(/* id 7, wireType 2 =*/58).string(message.deviceId);
    	            if (message.deviceManufacturer != null && Object.hasOwnProperty.call(message, "deviceManufacturer"))
    	                writer.uint32(/* id 8, wireType 2 =*/66).string(message.deviceManufacturer);
    	            if (message.deviceModel != null && Object.hasOwnProperty.call(message, "deviceModel"))
    	                writer.uint32(/* id 9, wireType 2 =*/74).string(message.deviceModel);
    	            if (message.additionalInfo != null && Object.hasOwnProperty.call(message, "additionalInfo"))
    	                writer.uint32(/* id 10, wireType 2 =*/82).string(message.additionalInfo);
    	            if (message.tenant != null && Object.hasOwnProperty.call(message, "tenant"))
    	                writer.uint32(/* id 11, wireType 2 =*/90).string(message.tenant);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a Device message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Device
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Device} Device
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Device.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Device();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.platformType = reader.string();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.platformVersion = reader.string();
    	                        break;
    	                    }
    	                case 3: {
    	                        message.surface = reader.string();
    	                        break;
    	                    }
    	                case 4: {
    	                        message.surfaceVersion = reader.string();
    	                        break;
    	                    }
    	                case 5: {
    	                        message.features = reader.string();
    	                        break;
    	                    }
    	                case 6: {
    	                        message.capabilities = reader.string();
    	                        break;
    	                    }
    	                case 7: {
    	                        message.deviceId = reader.string();
    	                        break;
    	                    }
    	                case 8: {
    	                        message.deviceManufacturer = reader.string();
    	                        break;
    	                    }
    	                case 9: {
    	                        message.deviceModel = reader.string();
    	                        break;
    	                    }
    	                case 10: {
    	                        message.additionalInfo = reader.string();
    	                        break;
    	                    }
    	                case 11: {
    	                        message.tenant = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Device;
    	    })();
    	    
    	    $root.Settings = (function() {
    	    
    	        /**
    	         * Properties of a Settings.
    	         * @exports ISettings
    	         * @interface ISettings
    	         * @property {number|null} [dubbing] Settings dubbing
    	         * @property {number|null} [echo] Settings echo
    	         * @property {string|null} [ttsEngine] Settings ttsEngine
    	         * @property {string|null} [asrEngine] Settings asrEngine
    	         * @property {number|null} [asrAutoStop] Settings asrAutoStop
    	         * @property {number|null} [devMode] Settings devMode
    	         * @property {string|null} [authConnector] Settings authConnector
    	         * @property {string|null} [surface] Settings surface
    	         */
    	    
    	        /**
    	         * Constructs a new Settings.
    	         * @exports Settings
    	         * @classdesc Represents a Settings.
    	         * @implements ISettings
    	         * @constructor
    	         * @param {ISettings=} [properties] Properties to set
    	         */
    	        function Settings(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Settings dubbing.
    	         * @member {number} dubbing
    	         * @memberof Settings
    	         * @instance
    	         */
    	        Settings.prototype.dubbing = 0;
    	    
    	        /**
    	         * Settings echo.
    	         * @member {number} echo
    	         * @memberof Settings
    	         * @instance
    	         */
    	        Settings.prototype.echo = 0;
    	    
    	        /**
    	         * Settings ttsEngine.
    	         * @member {string} ttsEngine
    	         * @memberof Settings
    	         * @instance
    	         */
    	        Settings.prototype.ttsEngine = "";
    	    
    	        /**
    	         * Settings asrEngine.
    	         * @member {string} asrEngine
    	         * @memberof Settings
    	         * @instance
    	         */
    	        Settings.prototype.asrEngine = "";
    	    
    	        /**
    	         * Settings asrAutoStop.
    	         * @member {number} asrAutoStop
    	         * @memberof Settings
    	         * @instance
    	         */
    	        Settings.prototype.asrAutoStop = 0;
    	    
    	        /**
    	         * Settings devMode.
    	         * @member {number} devMode
    	         * @memberof Settings
    	         * @instance
    	         */
    	        Settings.prototype.devMode = 0;
    	    
    	        /**
    	         * Settings authConnector.
    	         * @member {string} authConnector
    	         * @memberof Settings
    	         * @instance
    	         */
    	        Settings.prototype.authConnector = "";
    	    
    	        /**
    	         * Settings surface.
    	         * @member {string} surface
    	         * @memberof Settings
    	         * @instance
    	         */
    	        Settings.prototype.surface = "";
    	    
    	        /**
    	         * Creates a new Settings instance using the specified properties.
    	         * @function create
    	         * @memberof Settings
    	         * @static
    	         * @param {ISettings=} [properties] Properties to set
    	         * @returns {Settings} Settings instance
    	         */
    	        Settings.create = function create(properties) {
    	            return new Settings(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified Settings message. Does not implicitly {@link Settings.verify|verify} messages.
    	         * @function encode
    	         * @memberof Settings
    	         * @static
    	         * @param {ISettings} message Settings message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        Settings.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.dubbing != null && Object.hasOwnProperty.call(message, "dubbing"))
    	                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.dubbing);
    	            if (message.echo != null && Object.hasOwnProperty.call(message, "echo"))
    	                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.echo);
    	            if (message.ttsEngine != null && Object.hasOwnProperty.call(message, "ttsEngine"))
    	                writer.uint32(/* id 3, wireType 2 =*/26).string(message.ttsEngine);
    	            if (message.asrEngine != null && Object.hasOwnProperty.call(message, "asrEngine"))
    	                writer.uint32(/* id 4, wireType 2 =*/34).string(message.asrEngine);
    	            if (message.asrAutoStop != null && Object.hasOwnProperty.call(message, "asrAutoStop"))
    	                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.asrAutoStop);
    	            if (message.devMode != null && Object.hasOwnProperty.call(message, "devMode"))
    	                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.devMode);
    	            if (message.authConnector != null && Object.hasOwnProperty.call(message, "authConnector"))
    	                writer.uint32(/* id 7, wireType 2 =*/58).string(message.authConnector);
    	            if (message.surface != null && Object.hasOwnProperty.call(message, "surface"))
    	                writer.uint32(/* id 8, wireType 2 =*/66).string(message.surface);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a Settings message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Settings
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Settings} Settings
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Settings.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Settings();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.dubbing = reader.int32();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.echo = reader.int32();
    	                        break;
    	                    }
    	                case 3: {
    	                        message.ttsEngine = reader.string();
    	                        break;
    	                    }
    	                case 4: {
    	                        message.asrEngine = reader.string();
    	                        break;
    	                    }
    	                case 5: {
    	                        message.asrAutoStop = reader.int32();
    	                        break;
    	                    }
    	                case 6: {
    	                        message.devMode = reader.int32();
    	                        break;
    	                    }
    	                case 7: {
    	                        message.authConnector = reader.string();
    	                        break;
    	                    }
    	                case 8: {
    	                        message.surface = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Settings;
    	    })();
    	    
    	    $root.LegacyDevice = (function() {
    	    
    	        /**
    	         * Properties of a LegacyDevice.
    	         * @exports ILegacyDevice
    	         * @interface ILegacyDevice
    	         * @property {string|null} [clientType] LegacyDevice clientType
    	         * @property {string|null} [channel] LegacyDevice channel
    	         * @property {string|null} [channelVersion] LegacyDevice channelVersion
    	         * @property {string|null} [platformName] LegacyDevice platformName
    	         * @property {string|null} [platformVersion] LegacyDevice platformVersion
    	         * @property {string|null} [sdkVersion] LegacyDevice sdkVersion
    	         * @property {string|null} [protocolVersion] LegacyDevice protocolVersion
    	         */
    	    
    	        /**
    	         * Constructs a new LegacyDevice.
    	         * @exports LegacyDevice
    	         * @classdesc Represents a LegacyDevice.
    	         * @implements ILegacyDevice
    	         * @constructor
    	         * @param {ILegacyDevice=} [properties] Properties to set
    	         */
    	        function LegacyDevice(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * LegacyDevice clientType.
    	         * @member {string} clientType
    	         * @memberof LegacyDevice
    	         * @instance
    	         */
    	        LegacyDevice.prototype.clientType = "";
    	    
    	        /**
    	         * LegacyDevice channel.
    	         * @member {string} channel
    	         * @memberof LegacyDevice
    	         * @instance
    	         */
    	        LegacyDevice.prototype.channel = "";
    	    
    	        /**
    	         * LegacyDevice channelVersion.
    	         * @member {string} channelVersion
    	         * @memberof LegacyDevice
    	         * @instance
    	         */
    	        LegacyDevice.prototype.channelVersion = "";
    	    
    	        /**
    	         * LegacyDevice platformName.
    	         * @member {string} platformName
    	         * @memberof LegacyDevice
    	         * @instance
    	         */
    	        LegacyDevice.prototype.platformName = "";
    	    
    	        /**
    	         * LegacyDevice platformVersion.
    	         * @member {string} platformVersion
    	         * @memberof LegacyDevice
    	         * @instance
    	         */
    	        LegacyDevice.prototype.platformVersion = "";
    	    
    	        /**
    	         * LegacyDevice sdkVersion.
    	         * @member {string} sdkVersion
    	         * @memberof LegacyDevice
    	         * @instance
    	         */
    	        LegacyDevice.prototype.sdkVersion = "";
    	    
    	        /**
    	         * LegacyDevice protocolVersion.
    	         * @member {string} protocolVersion
    	         * @memberof LegacyDevice
    	         * @instance
    	         */
    	        LegacyDevice.prototype.protocolVersion = "";
    	    
    	        /**
    	         * Creates a new LegacyDevice instance using the specified properties.
    	         * @function create
    	         * @memberof LegacyDevice
    	         * @static
    	         * @param {ILegacyDevice=} [properties] Properties to set
    	         * @returns {LegacyDevice} LegacyDevice instance
    	         */
    	        LegacyDevice.create = function create(properties) {
    	            return new LegacyDevice(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified LegacyDevice message. Does not implicitly {@link LegacyDevice.verify|verify} messages.
    	         * @function encode
    	         * @memberof LegacyDevice
    	         * @static
    	         * @param {ILegacyDevice} message LegacyDevice message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        LegacyDevice.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.clientType != null && Object.hasOwnProperty.call(message, "clientType"))
    	                writer.uint32(/* id 1, wireType 2 =*/10).string(message.clientType);
    	            if (message.channel != null && Object.hasOwnProperty.call(message, "channel"))
    	                writer.uint32(/* id 2, wireType 2 =*/18).string(message.channel);
    	            if (message.channelVersion != null && Object.hasOwnProperty.call(message, "channelVersion"))
    	                writer.uint32(/* id 3, wireType 2 =*/26).string(message.channelVersion);
    	            if (message.platformName != null && Object.hasOwnProperty.call(message, "platformName"))
    	                writer.uint32(/* id 4, wireType 2 =*/34).string(message.platformName);
    	            if (message.platformVersion != null && Object.hasOwnProperty.call(message, "platformVersion"))
    	                writer.uint32(/* id 5, wireType 2 =*/42).string(message.platformVersion);
    	            if (message.sdkVersion != null && Object.hasOwnProperty.call(message, "sdkVersion"))
    	                writer.uint32(/* id 6, wireType 2 =*/50).string(message.sdkVersion);
    	            if (message.protocolVersion != null && Object.hasOwnProperty.call(message, "protocolVersion"))
    	                writer.uint32(/* id 7, wireType 2 =*/58).string(message.protocolVersion);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a LegacyDevice message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof LegacyDevice
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {LegacyDevice} LegacyDevice
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        LegacyDevice.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.LegacyDevice();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.clientType = reader.string();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.channel = reader.string();
    	                        break;
    	                    }
    	                case 3: {
    	                        message.channelVersion = reader.string();
    	                        break;
    	                    }
    	                case 4: {
    	                        message.platformName = reader.string();
    	                        break;
    	                    }
    	                case 5: {
    	                        message.platformVersion = reader.string();
    	                        break;
    	                    }
    	                case 6: {
    	                        message.sdkVersion = reader.string();
    	                        break;
    	                    }
    	                case 7: {
    	                        message.protocolVersion = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return LegacyDevice;
    	    })();
    	    
    	    $root.Voice = (function() {
    	    
    	        /**
    	         * Properties of a Voice.
    	         * @exports IVoice
    	         * @interface IVoice
    	         * @property {Uint8Array|null} [data] Voice data
    	         */
    	    
    	        /**
    	         * Constructs a new Voice.
    	         * @exports Voice
    	         * @classdesc Represents a Voice.
    	         * @implements IVoice
    	         * @constructor
    	         * @param {IVoice=} [properties] Properties to set
    	         */
    	        function Voice(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Voice data.
    	         * @member {Uint8Array} data
    	         * @memberof Voice
    	         * @instance
    	         */
    	        Voice.prototype.data = $util.newBuffer([]);
    	    
    	        /**
    	         * Creates a new Voice instance using the specified properties.
    	         * @function create
    	         * @memberof Voice
    	         * @static
    	         * @param {IVoice=} [properties] Properties to set
    	         * @returns {Voice} Voice instance
    	         */
    	        Voice.create = function create(properties) {
    	            return new Voice(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified Voice message. Does not implicitly {@link Voice.verify|verify} messages.
    	         * @function encode
    	         * @memberof Voice
    	         * @static
    	         * @param {IVoice} message Voice message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        Voice.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.data != null && Object.hasOwnProperty.call(message, "data"))
    	                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.data);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a Voice message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Voice
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Voice} Voice
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Voice.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Voice();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.data = reader.bytes();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Voice;
    	    })();
    	    
    	    $root.Text = (function() {
    	    
    	        /**
    	         * Properties of a Text.
    	         * @exports IText
    	         * @interface IText
    	         * @property {string|null} [data] Text data
    	         * @property {string|null} [type] Text type
    	         */
    	    
    	        /**
    	         * Constructs a new Text.
    	         * @exports Text
    	         * @classdesc Represents a Text.
    	         * @implements IText
    	         * @constructor
    	         * @param {IText=} [properties] Properties to set
    	         */
    	        function Text(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Text data.
    	         * @member {string} data
    	         * @memberof Text
    	         * @instance
    	         */
    	        Text.prototype.data = "";
    	    
    	        /**
    	         * Text type.
    	         * @member {string} type
    	         * @memberof Text
    	         * @instance
    	         */
    	        Text.prototype.type = "";
    	    
    	        /**
    	         * Creates a new Text instance using the specified properties.
    	         * @function create
    	         * @memberof Text
    	         * @static
    	         * @param {IText=} [properties] Properties to set
    	         * @returns {Text} Text instance
    	         */
    	        Text.create = function create(properties) {
    	            return new Text(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified Text message. Does not implicitly {@link Text.verify|verify} messages.
    	         * @function encode
    	         * @memberof Text
    	         * @static
    	         * @param {IText} message Text message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        Text.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.data != null && Object.hasOwnProperty.call(message, "data"))
    	                writer.uint32(/* id 1, wireType 2 =*/10).string(message.data);
    	            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
    	                writer.uint32(/* id 2, wireType 2 =*/18).string(message.type);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a Text message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Text
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Text} Text
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Text.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Text();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.data = reader.string();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.type = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Text;
    	    })();
    	    
    	    $root.SystemMessage = (function() {
    	    
    	        /**
    	         * Properties of a SystemMessage.
    	         * @exports ISystemMessage
    	         * @interface ISystemMessage
    	         * @property {string|null} [data] SystemMessage data
    	         */
    	    
    	        /**
    	         * Constructs a new SystemMessage.
    	         * @exports SystemMessage
    	         * @classdesc Represents a SystemMessage.
    	         * @implements ISystemMessage
    	         * @constructor
    	         * @param {ISystemMessage=} [properties] Properties to set
    	         */
    	        function SystemMessage(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * SystemMessage data.
    	         * @member {string} data
    	         * @memberof SystemMessage
    	         * @instance
    	         */
    	        SystemMessage.prototype.data = "";
    	    
    	        /**
    	         * Creates a new SystemMessage instance using the specified properties.
    	         * @function create
    	         * @memberof SystemMessage
    	         * @static
    	         * @param {ISystemMessage=} [properties] Properties to set
    	         * @returns {SystemMessage} SystemMessage instance
    	         */
    	        SystemMessage.create = function create(properties) {
    	            return new SystemMessage(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified SystemMessage message. Does not implicitly {@link SystemMessage.verify|verify} messages.
    	         * @function encode
    	         * @memberof SystemMessage
    	         * @static
    	         * @param {ISystemMessage} message SystemMessage message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        SystemMessage.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.data != null && Object.hasOwnProperty.call(message, "data"))
    	                writer.uint32(/* id 1, wireType 2 =*/10).string(message.data);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a SystemMessage message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof SystemMessage
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {SystemMessage} SystemMessage
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        SystemMessage.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.SystemMessage();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.data = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return SystemMessage;
    	    })();
    	    
    	    $root.Status = (function() {
    	    
    	        /**
    	         * Properties of a Status.
    	         * @exports IStatus
    	         * @interface IStatus
    	         * @property {number|null} [code] Status code
    	         * @property {string|null} [description] Status description
    	         * @property {string|null} [technicalDescription] Status technicalDescription
    	         */
    	    
    	        /**
    	         * Constructs a new Status.
    	         * @exports Status
    	         * @classdesc Represents a Status.
    	         * @implements IStatus
    	         * @constructor
    	         * @param {IStatus=} [properties] Properties to set
    	         */
    	        function Status(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Status code.
    	         * @member {number} code
    	         * @memberof Status
    	         * @instance
    	         */
    	        Status.prototype.code = 0;
    	    
    	        /**
    	         * Status description.
    	         * @member {string} description
    	         * @memberof Status
    	         * @instance
    	         */
    	        Status.prototype.description = "";
    	    
    	        /**
    	         * Status technicalDescription.
    	         * @member {string} technicalDescription
    	         * @memberof Status
    	         * @instance
    	         */
    	        Status.prototype.technicalDescription = "";
    	    
    	        /**
    	         * Creates a new Status instance using the specified properties.
    	         * @function create
    	         * @memberof Status
    	         * @static
    	         * @param {IStatus=} [properties] Properties to set
    	         * @returns {Status} Status instance
    	         */
    	        Status.create = function create(properties) {
    	            return new Status(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified Status message. Does not implicitly {@link Status.verify|verify} messages.
    	         * @function encode
    	         * @memberof Status
    	         * @static
    	         * @param {IStatus} message Status message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        Status.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.code != null && Object.hasOwnProperty.call(message, "code"))
    	                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.code);
    	            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
    	                writer.uint32(/* id 2, wireType 2 =*/18).string(message.description);
    	            if (message.technicalDescription != null && Object.hasOwnProperty.call(message, "technicalDescription"))
    	                writer.uint32(/* id 3, wireType 2 =*/26).string(message.technicalDescription);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a Status message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Status
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Status} Status
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Status.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Status();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.code = reader.int32();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.description = reader.string();
    	                        break;
    	                    }
    	                case 3: {
    	                        message.technicalDescription = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Status;
    	    })();
    	    
    	    $root.Bytes = (function() {
    	    
    	        /**
    	         * Properties of a Bytes.
    	         * @exports IBytes
    	         * @interface IBytes
    	         * @property {Uint8Array|null} [data] Bytes data
    	         * @property {string|null} [desc] Bytes desc
    	         */
    	    
    	        /**
    	         * Constructs a new Bytes.
    	         * @exports Bytes
    	         * @classdesc Represents a Bytes.
    	         * @implements IBytes
    	         * @constructor
    	         * @param {IBytes=} [properties] Properties to set
    	         */
    	        function Bytes(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Bytes data.
    	         * @member {Uint8Array} data
    	         * @memberof Bytes
    	         * @instance
    	         */
    	        Bytes.prototype.data = $util.newBuffer([]);
    	    
    	        /**
    	         * Bytes desc.
    	         * @member {string} desc
    	         * @memberof Bytes
    	         * @instance
    	         */
    	        Bytes.prototype.desc = "";
    	    
    	        /**
    	         * Creates a new Bytes instance using the specified properties.
    	         * @function create
    	         * @memberof Bytes
    	         * @static
    	         * @param {IBytes=} [properties] Properties to set
    	         * @returns {Bytes} Bytes instance
    	         */
    	        Bytes.create = function create(properties) {
    	            return new Bytes(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified Bytes message. Does not implicitly {@link Bytes.verify|verify} messages.
    	         * @function encode
    	         * @memberof Bytes
    	         * @static
    	         * @param {IBytes} message Bytes message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        Bytes.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.data != null && Object.hasOwnProperty.call(message, "data"))
    	                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.data);
    	            if (message.desc != null && Object.hasOwnProperty.call(message, "desc"))
    	                writer.uint32(/* id 2, wireType 2 =*/18).string(message.desc);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a Bytes message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Bytes
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Bytes} Bytes
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Bytes.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Bytes();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.data = reader.bytes();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.desc = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Bytes;
    	    })();
    	    
    	    $root.DevContext = (function() {
    	    
    	        /**
    	         * Properties of a DevContext.
    	         * @exports IDevContext
    	         * @interface IDevContext
    	         * @property {string|null} [name] DevContext name
    	         * @property {number|Long|null} [timestampMs] DevContext timestampMs
    	         * @property {string|null} [data] DevContext data
    	         */
    	    
    	        /**
    	         * Constructs a new DevContext.
    	         * @exports DevContext
    	         * @classdesc Represents a DevContext.
    	         * @implements IDevContext
    	         * @constructor
    	         * @param {IDevContext=} [properties] Properties to set
    	         */
    	        function DevContext(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * DevContext name.
    	         * @member {string} name
    	         * @memberof DevContext
    	         * @instance
    	         */
    	        DevContext.prototype.name = "";
    	    
    	        /**
    	         * DevContext timestampMs.
    	         * @member {number|Long} timestampMs
    	         * @memberof DevContext
    	         * @instance
    	         */
    	        DevContext.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    	    
    	        /**
    	         * DevContext data.
    	         * @member {string} data
    	         * @memberof DevContext
    	         * @instance
    	         */
    	        DevContext.prototype.data = "";
    	    
    	        /**
    	         * Creates a new DevContext instance using the specified properties.
    	         * @function create
    	         * @memberof DevContext
    	         * @static
    	         * @param {IDevContext=} [properties] Properties to set
    	         * @returns {DevContext} DevContext instance
    	         */
    	        DevContext.create = function create(properties) {
    	            return new DevContext(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified DevContext message. Does not implicitly {@link DevContext.verify|verify} messages.
    	         * @function encode
    	         * @memberof DevContext
    	         * @static
    	         * @param {IDevContext} message DevContext message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        DevContext.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
    	                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
    	            if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
    	                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.timestampMs);
    	            if (message.data != null && Object.hasOwnProperty.call(message, "data"))
    	                writer.uint32(/* id 3, wireType 2 =*/26).string(message.data);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a DevContext message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof DevContext
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {DevContext} DevContext
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        DevContext.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.DevContext();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.name = reader.string();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.timestampMs = reader.int64();
    	                        break;
    	                    }
    	                case 3: {
    	                        message.data = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return DevContext;
    	    })();
    	    
    	    $root.Cancel = (function() {
    	    
    	        /**
    	         * Properties of a Cancel.
    	         * @exports ICancel
    	         * @interface ICancel
    	         */
    	    
    	        /**
    	         * Constructs a new Cancel.
    	         * @exports Cancel
    	         * @classdesc Represents a Cancel.
    	         * @implements ICancel
    	         * @constructor
    	         * @param {ICancel=} [properties] Properties to set
    	         */
    	        function Cancel(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Creates a new Cancel instance using the specified properties.
    	         * @function create
    	         * @memberof Cancel
    	         * @static
    	         * @param {ICancel=} [properties] Properties to set
    	         * @returns {Cancel} Cancel instance
    	         */
    	        Cancel.create = function create(properties) {
    	            return new Cancel(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified Cancel message. Does not implicitly {@link Cancel.verify|verify} messages.
    	         * @function encode
    	         * @memberof Cancel
    	         * @static
    	         * @param {ICancel} message Cancel message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        Cancel.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a Cancel message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Cancel
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Cancel} Cancel
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Cancel.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Cancel();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Cancel;
    	    })();
    	    
    	    $root.Mute = (function() {
    	    
    	        /**
    	         * Properties of a Mute.
    	         * @exports IMute
    	         * @interface IMute
    	         */
    	    
    	        /**
    	         * Constructs a new Mute.
    	         * @exports Mute
    	         * @classdesc Represents a Mute.
    	         * @implements IMute
    	         * @constructor
    	         * @param {IMute=} [properties] Properties to set
    	         */
    	        function Mute(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Creates a new Mute instance using the specified properties.
    	         * @function create
    	         * @memberof Mute
    	         * @static
    	         * @param {IMute=} [properties] Properties to set
    	         * @returns {Mute} Mute instance
    	         */
    	        Mute.create = function create(properties) {
    	            return new Mute(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified Mute message. Does not implicitly {@link Mute.verify|verify} messages.
    	         * @function encode
    	         * @memberof Mute
    	         * @static
    	         * @param {IMute} message Mute message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        Mute.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a Mute message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Mute
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Mute} Mute
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Mute.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Mute();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Mute;
    	    })();
    	    
    	    $root.GetHistoryRequest = (function() {
    	    
    	        /**
    	         * Properties of a GetHistoryRequest.
    	         * @exports IGetHistoryRequest
    	         * @interface IGetHistoryRequest
    	         * @property {Array.<string>|null} [messageTypes] GetHistoryRequest messageTypes
    	         * @property {IApp|null} [app] GetHistoryRequest app
    	         * @property {IOffset|null} [offset] GetHistoryRequest offset
    	         */
    	    
    	        /**
    	         * Constructs a new GetHistoryRequest.
    	         * @exports GetHistoryRequest
    	         * @classdesc Represents a GetHistoryRequest.
    	         * @implements IGetHistoryRequest
    	         * @constructor
    	         * @param {IGetHistoryRequest=} [properties] Properties to set
    	         */
    	        function GetHistoryRequest(properties) {
    	            this.messageTypes = [];
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * GetHistoryRequest messageTypes.
    	         * @member {Array.<string>} messageTypes
    	         * @memberof GetHistoryRequest
    	         * @instance
    	         */
    	        GetHistoryRequest.prototype.messageTypes = $util.emptyArray;
    	    
    	        /**
    	         * GetHistoryRequest app.
    	         * @member {IApp|null|undefined} app
    	         * @memberof GetHistoryRequest
    	         * @instance
    	         */
    	        GetHistoryRequest.prototype.app = null;
    	    
    	        /**
    	         * GetHistoryRequest offset.
    	         * @member {IOffset|null|undefined} offset
    	         * @memberof GetHistoryRequest
    	         * @instance
    	         */
    	        GetHistoryRequest.prototype.offset = null;
    	    
    	        /**
    	         * Creates a new GetHistoryRequest instance using the specified properties.
    	         * @function create
    	         * @memberof GetHistoryRequest
    	         * @static
    	         * @param {IGetHistoryRequest=} [properties] Properties to set
    	         * @returns {GetHistoryRequest} GetHistoryRequest instance
    	         */
    	        GetHistoryRequest.create = function create(properties) {
    	            return new GetHistoryRequest(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified GetHistoryRequest message. Does not implicitly {@link GetHistoryRequest.verify|verify} messages.
    	         * @function encode
    	         * @memberof GetHistoryRequest
    	         * @static
    	         * @param {IGetHistoryRequest} message GetHistoryRequest message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        GetHistoryRequest.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.messageTypes != null && message.messageTypes.length)
    	                for (var i = 0; i < message.messageTypes.length; ++i)
    	                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.messageTypes[i]);
    	            if (message.app != null && Object.hasOwnProperty.call(message, "app"))
    	                $root.App.encode(message.app, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
    	            if (message.offset != null && Object.hasOwnProperty.call(message, "offset"))
    	                $root.Offset.encode(message.offset, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a GetHistoryRequest message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof GetHistoryRequest
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {GetHistoryRequest} GetHistoryRequest
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        GetHistoryRequest.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GetHistoryRequest();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        if (!(message.messageTypes && message.messageTypes.length))
    	                            message.messageTypes = [];
    	                        message.messageTypes.push(reader.string());
    	                        break;
    	                    }
    	                case 2: {
    	                        message.app = $root.App.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 3: {
    	                        message.offset = $root.Offset.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return GetHistoryRequest;
    	    })();
    	    
    	    $root.App = (function() {
    	    
    	        /**
    	         * Properties of an App.
    	         * @exports IApp
    	         * @interface IApp
    	         * @property {google.protobuf.IStringValue|null} [type] App type
    	         * @property {google.protobuf.IStringValue|null} [projectId] App projectId
    	         * @property {google.protobuf.IStringValue|null} [systemName] App systemName
    	         */
    	    
    	        /**
    	         * Constructs a new App.
    	         * @exports App
    	         * @classdesc Represents an App.
    	         * @implements IApp
    	         * @constructor
    	         * @param {IApp=} [properties] Properties to set
    	         */
    	        function App(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * App type.
    	         * @member {google.protobuf.IStringValue|null|undefined} type
    	         * @memberof App
    	         * @instance
    	         */
    	        App.prototype.type = null;
    	    
    	        /**
    	         * App projectId.
    	         * @member {google.protobuf.IStringValue|null|undefined} projectId
    	         * @memberof App
    	         * @instance
    	         */
    	        App.prototype.projectId = null;
    	    
    	        /**
    	         * App systemName.
    	         * @member {google.protobuf.IStringValue|null|undefined} systemName
    	         * @memberof App
    	         * @instance
    	         */
    	        App.prototype.systemName = null;
    	    
    	        /**
    	         * Creates a new App instance using the specified properties.
    	         * @function create
    	         * @memberof App
    	         * @static
    	         * @param {IApp=} [properties] Properties to set
    	         * @returns {App} App instance
    	         */
    	        App.create = function create(properties) {
    	            return new App(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified App message. Does not implicitly {@link App.verify|verify} messages.
    	         * @function encode
    	         * @memberof App
    	         * @static
    	         * @param {IApp} message App message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        App.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
    	                $root.google.protobuf.StringValue.encode(message.type, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
    	            if (message.projectId != null && Object.hasOwnProperty.call(message, "projectId"))
    	                $root.google.protobuf.StringValue.encode(message.projectId, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
    	            if (message.systemName != null && Object.hasOwnProperty.call(message, "systemName"))
    	                $root.google.protobuf.StringValue.encode(message.systemName, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes an App message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof App
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {App} App
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        App.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.App();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.type = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 2: {
    	                        message.projectId = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 3: {
    	                        message.systemName = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return App;
    	    })();
    	    
    	    $root.Offset = (function() {
    	    
    	        /**
    	         * Properties of an Offset.
    	         * @exports IOffset
    	         * @interface IOffset
    	         * @property {google.protobuf.IStringValue|null} [limit] Offset limit
    	         * @property {google.protobuf.IStringValue|null} [contentId] Offset contentId
    	         */
    	    
    	        /**
    	         * Constructs a new Offset.
    	         * @exports Offset
    	         * @classdesc Represents an Offset.
    	         * @implements IOffset
    	         * @constructor
    	         * @param {IOffset=} [properties] Properties to set
    	         */
    	        function Offset(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Offset limit.
    	         * @member {google.protobuf.IStringValue|null|undefined} limit
    	         * @memberof Offset
    	         * @instance
    	         */
    	        Offset.prototype.limit = null;
    	    
    	        /**
    	         * Offset contentId.
    	         * @member {google.protobuf.IStringValue|null|undefined} contentId
    	         * @memberof Offset
    	         * @instance
    	         */
    	        Offset.prototype.contentId = null;
    	    
    	        /**
    	         * Creates a new Offset instance using the specified properties.
    	         * @function create
    	         * @memberof Offset
    	         * @static
    	         * @param {IOffset=} [properties] Properties to set
    	         * @returns {Offset} Offset instance
    	         */
    	        Offset.create = function create(properties) {
    	            return new Offset(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified Offset message. Does not implicitly {@link Offset.verify|verify} messages.
    	         * @function encode
    	         * @memberof Offset
    	         * @static
    	         * @param {IOffset} message Offset message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        Offset.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
    	                $root.google.protobuf.StringValue.encode(message.limit, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
    	            if (message.contentId != null && Object.hasOwnProperty.call(message, "contentId"))
    	                $root.google.protobuf.StringValue.encode(message.contentId, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes an Offset message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Offset
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Offset} Offset
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Offset.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Offset();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.limit = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 2: {
    	                        message.contentId = $root.google.protobuf.StringValue.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Offset;
    	    })();
    	    
    	    $root.ChatHistoryRequest = (function() {
    	    
    	        /**
    	         * Properties of a ChatHistoryRequest.
    	         * @exports IChatHistoryRequest
    	         * @interface IChatHistoryRequest
    	         * @property {IUuid|null} [uuid] ChatHistoryRequest uuid
    	         * @property {IDevice|null} [device] ChatHistoryRequest device
    	         * @property {IGetHistoryRequest|null} [getHistoryRequest] ChatHistoryRequest getHistoryRequest
    	         */
    	    
    	        /**
    	         * Constructs a new ChatHistoryRequest.
    	         * @exports ChatHistoryRequest
    	         * @classdesc Represents a ChatHistoryRequest.
    	         * @implements IChatHistoryRequest
    	         * @constructor
    	         * @param {IChatHistoryRequest=} [properties] Properties to set
    	         */
    	        function ChatHistoryRequest(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * ChatHistoryRequest uuid.
    	         * @member {IUuid|null|undefined} uuid
    	         * @memberof ChatHistoryRequest
    	         * @instance
    	         */
    	        ChatHistoryRequest.prototype.uuid = null;
    	    
    	        /**
    	         * ChatHistoryRequest device.
    	         * @member {IDevice|null|undefined} device
    	         * @memberof ChatHistoryRequest
    	         * @instance
    	         */
    	        ChatHistoryRequest.prototype.device = null;
    	    
    	        /**
    	         * ChatHistoryRequest getHistoryRequest.
    	         * @member {IGetHistoryRequest|null|undefined} getHistoryRequest
    	         * @memberof ChatHistoryRequest
    	         * @instance
    	         */
    	        ChatHistoryRequest.prototype.getHistoryRequest = null;
    	    
    	        /**
    	         * Creates a new ChatHistoryRequest instance using the specified properties.
    	         * @function create
    	         * @memberof ChatHistoryRequest
    	         * @static
    	         * @param {IChatHistoryRequest=} [properties] Properties to set
    	         * @returns {ChatHistoryRequest} ChatHistoryRequest instance
    	         */
    	        ChatHistoryRequest.create = function create(properties) {
    	            return new ChatHistoryRequest(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified ChatHistoryRequest message. Does not implicitly {@link ChatHistoryRequest.verify|verify} messages.
    	         * @function encode
    	         * @memberof ChatHistoryRequest
    	         * @static
    	         * @param {IChatHistoryRequest} message ChatHistoryRequest message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        ChatHistoryRequest.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.uuid != null && Object.hasOwnProperty.call(message, "uuid"))
    	                $root.Uuid.encode(message.uuid, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
    	            if (message.device != null && Object.hasOwnProperty.call(message, "device"))
    	                $root.Device.encode(message.device, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
    	            if (message.getHistoryRequest != null && Object.hasOwnProperty.call(message, "getHistoryRequest"))
    	                $root.GetHistoryRequest.encode(message.getHistoryRequest, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a ChatHistoryRequest message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof ChatHistoryRequest
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {ChatHistoryRequest} ChatHistoryRequest
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        ChatHistoryRequest.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChatHistoryRequest();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.uuid = $root.Uuid.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 2: {
    	                        message.device = $root.Device.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 4: {
    	                        message.getHistoryRequest = $root.GetHistoryRequest.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return ChatHistoryRequest;
    	    })();
    	    
    	    $root.Uuid = (function() {
    	    
    	        /**
    	         * Properties of an Uuid.
    	         * @exports IUuid
    	         * @interface IUuid
    	         * @property {string|null} [userId] Uuid userId
    	         * @property {string|null} [userChannel] Uuid userChannel
    	         * @property {string|null} [sub] Uuid sub
    	         */
    	    
    	        /**
    	         * Constructs a new Uuid.
    	         * @exports Uuid
    	         * @classdesc Represents an Uuid.
    	         * @implements IUuid
    	         * @constructor
    	         * @param {IUuid=} [properties] Properties to set
    	         */
    	        function Uuid(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Uuid userId.
    	         * @member {string} userId
    	         * @memberof Uuid
    	         * @instance
    	         */
    	        Uuid.prototype.userId = "";
    	    
    	        /**
    	         * Uuid userChannel.
    	         * @member {string} userChannel
    	         * @memberof Uuid
    	         * @instance
    	         */
    	        Uuid.prototype.userChannel = "";
    	    
    	        /**
    	         * Uuid sub.
    	         * @member {string} sub
    	         * @memberof Uuid
    	         * @instance
    	         */
    	        Uuid.prototype.sub = "";
    	    
    	        /**
    	         * Creates a new Uuid instance using the specified properties.
    	         * @function create
    	         * @memberof Uuid
    	         * @static
    	         * @param {IUuid=} [properties] Properties to set
    	         * @returns {Uuid} Uuid instance
    	         */
    	        Uuid.create = function create(properties) {
    	            return new Uuid(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified Uuid message. Does not implicitly {@link Uuid.verify|verify} messages.
    	         * @function encode
    	         * @memberof Uuid
    	         * @static
    	         * @param {IUuid} message Uuid message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        Uuid.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
    	                writer.uint32(/* id 1, wireType 2 =*/10).string(message.userId);
    	            if (message.userChannel != null && Object.hasOwnProperty.call(message, "userChannel"))
    	                writer.uint32(/* id 2, wireType 2 =*/18).string(message.userChannel);
    	            if (message.sub != null && Object.hasOwnProperty.call(message, "sub"))
    	                writer.uint32(/* id 3, wireType 2 =*/26).string(message.sub);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes an Uuid message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Uuid
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Uuid} Uuid
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Uuid.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Uuid();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.userId = reader.string();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.userChannel = reader.string();
    	                        break;
    	                    }
    	                case 3: {
    	                        message.sub = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Uuid;
    	    })();
    	    
    	    $root.GetHistoryResponse = (function() {
    	    
    	        /**
    	         * Properties of a GetHistoryResponse.
    	         * @exports IGetHistoryResponse
    	         * @interface IGetHistoryResponse
    	         * @property {Array.<IHistoryMessages>|null} [historyMessages] GetHistoryResponse historyMessages
    	         */
    	    
    	        /**
    	         * Constructs a new GetHistoryResponse.
    	         * @exports GetHistoryResponse
    	         * @classdesc Represents a GetHistoryResponse.
    	         * @implements IGetHistoryResponse
    	         * @constructor
    	         * @param {IGetHistoryResponse=} [properties] Properties to set
    	         */
    	        function GetHistoryResponse(properties) {
    	            this.historyMessages = [];
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * GetHistoryResponse historyMessages.
    	         * @member {Array.<IHistoryMessages>} historyMessages
    	         * @memberof GetHistoryResponse
    	         * @instance
    	         */
    	        GetHistoryResponse.prototype.historyMessages = $util.emptyArray;
    	    
    	        /**
    	         * Creates a new GetHistoryResponse instance using the specified properties.
    	         * @function create
    	         * @memberof GetHistoryResponse
    	         * @static
    	         * @param {IGetHistoryResponse=} [properties] Properties to set
    	         * @returns {GetHistoryResponse} GetHistoryResponse instance
    	         */
    	        GetHistoryResponse.create = function create(properties) {
    	            return new GetHistoryResponse(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified GetHistoryResponse message. Does not implicitly {@link GetHistoryResponse.verify|verify} messages.
    	         * @function encode
    	         * @memberof GetHistoryResponse
    	         * @static
    	         * @param {IGetHistoryResponse} message GetHistoryResponse message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        GetHistoryResponse.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.historyMessages != null && message.historyMessages.length)
    	                for (var i = 0; i < message.historyMessages.length; ++i)
    	                    $root.HistoryMessages.encode(message.historyMessages[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a GetHistoryResponse message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof GetHistoryResponse
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {GetHistoryResponse} GetHistoryResponse
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        GetHistoryResponse.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GetHistoryResponse();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        if (!(message.historyMessages && message.historyMessages.length))
    	                            message.historyMessages = [];
    	                        message.historyMessages.push($root.HistoryMessages.decode(reader, reader.uint32()));
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return GetHistoryResponse;
    	    })();
    	    
    	    $root.HistoryMessages = (function() {
    	    
    	        /**
    	         * Properties of a HistoryMessages.
    	         * @exports IHistoryMessages
    	         * @interface IHistoryMessages
    	         * @property {string|null} [content] HistoryMessages content
    	         * @property {string|null} [contentId] HistoryMessages contentId
    	         * @property {string|null} [timeCreated] HistoryMessages timeCreated
    	         */
    	    
    	        /**
    	         * Constructs a new HistoryMessages.
    	         * @exports HistoryMessages
    	         * @classdesc Represents a HistoryMessages.
    	         * @implements IHistoryMessages
    	         * @constructor
    	         * @param {IHistoryMessages=} [properties] Properties to set
    	         */
    	        function HistoryMessages(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * HistoryMessages content.
    	         * @member {string} content
    	         * @memberof HistoryMessages
    	         * @instance
    	         */
    	        HistoryMessages.prototype.content = "";
    	    
    	        /**
    	         * HistoryMessages contentId.
    	         * @member {string} contentId
    	         * @memberof HistoryMessages
    	         * @instance
    	         */
    	        HistoryMessages.prototype.contentId = "";
    	    
    	        /**
    	         * HistoryMessages timeCreated.
    	         * @member {string} timeCreated
    	         * @memberof HistoryMessages
    	         * @instance
    	         */
    	        HistoryMessages.prototype.timeCreated = "";
    	    
    	        /**
    	         * Creates a new HistoryMessages instance using the specified properties.
    	         * @function create
    	         * @memberof HistoryMessages
    	         * @static
    	         * @param {IHistoryMessages=} [properties] Properties to set
    	         * @returns {HistoryMessages} HistoryMessages instance
    	         */
    	        HistoryMessages.create = function create(properties) {
    	            return new HistoryMessages(properties);
    	        };
    	    
    	        /**
    	         * Encodes the specified HistoryMessages message. Does not implicitly {@link HistoryMessages.verify|verify} messages.
    	         * @function encode
    	         * @memberof HistoryMessages
    	         * @static
    	         * @param {IHistoryMessages} message HistoryMessages message or plain object to encode
    	         * @param {$protobuf.Writer} [writer] Writer to encode to
    	         * @returns {$protobuf.Writer} Writer
    	         */
    	        HistoryMessages.encode = function encode(message, writer) {
    	            if (!writer)
    	                writer = $Writer.create();
    	            if (message.content != null && Object.hasOwnProperty.call(message, "content"))
    	                writer.uint32(/* id 1, wireType 2 =*/10).string(message.content);
    	            if (message.contentId != null && Object.hasOwnProperty.call(message, "contentId"))
    	                writer.uint32(/* id 2, wireType 2 =*/18).string(message.contentId);
    	            if (message.timeCreated != null && Object.hasOwnProperty.call(message, "timeCreated"))
    	                writer.uint32(/* id 3, wireType 2 =*/26).string(message.timeCreated);
    	            return writer;
    	        };
    	    
    	        /**
    	         * Decodes a HistoryMessages message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof HistoryMessages
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {HistoryMessages} HistoryMessages
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        HistoryMessages.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.HistoryMessages();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.content = reader.string();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.contentId = reader.string();
    	                        break;
    	                    }
    	                case 3: {
    	                        message.timeCreated = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return HistoryMessages;
    	    })();
    	    
    	    $root.google = (function() {
    	    
    	        /**
    	         * Namespace google.
    	         * @exports google
    	         * @namespace
    	         */
    	        var google = {};
    	    
    	        google.protobuf = (function() {
    	    
    	            /**
    	             * Namespace protobuf.
    	             * @memberof google
    	             * @namespace
    	             */
    	            var protobuf = {};
    	    
    	            protobuf.DoubleValue = (function() {
    	    
    	                /**
    	                 * Properties of a DoubleValue.
    	                 * @memberof google.protobuf
    	                 * @interface IDoubleValue
    	                 * @property {number|null} [value] DoubleValue value
    	                 */
    	    
    	                /**
    	                 * Constructs a new DoubleValue.
    	                 * @memberof google.protobuf
    	                 * @classdesc Represents a DoubleValue.
    	                 * @implements IDoubleValue
    	                 * @constructor
    	                 * @param {google.protobuf.IDoubleValue=} [properties] Properties to set
    	                 */
    	                function DoubleValue(properties) {
    	                    if (properties)
    	                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                            if (properties[keys[i]] != null)
    	                                this[keys[i]] = properties[keys[i]];
    	                }
    	    
    	                /**
    	                 * DoubleValue value.
    	                 * @member {number} value
    	                 * @memberof google.protobuf.DoubleValue
    	                 * @instance
    	                 */
    	                DoubleValue.prototype.value = 0;
    	    
    	                /**
    	                 * Creates a new DoubleValue instance using the specified properties.
    	                 * @function create
    	                 * @memberof google.protobuf.DoubleValue
    	                 * @static
    	                 * @param {google.protobuf.IDoubleValue=} [properties] Properties to set
    	                 * @returns {google.protobuf.DoubleValue} DoubleValue instance
    	                 */
    	                DoubleValue.create = function create(properties) {
    	                    return new DoubleValue(properties);
    	                };
    	    
    	                /**
    	                 * Encodes the specified DoubleValue message. Does not implicitly {@link google.protobuf.DoubleValue.verify|verify} messages.
    	                 * @function encode
    	                 * @memberof google.protobuf.DoubleValue
    	                 * @static
    	                 * @param {google.protobuf.IDoubleValue} message DoubleValue message or plain object to encode
    	                 * @param {$protobuf.Writer} [writer] Writer to encode to
    	                 * @returns {$protobuf.Writer} Writer
    	                 */
    	                DoubleValue.encode = function encode(message, writer) {
    	                    if (!writer)
    	                        writer = $Writer.create();
    	                    if (message.value != null && Object.hasOwnProperty.call(message, "value"))
    	                        writer.uint32(/* id 1, wireType 1 =*/9).double(message.value);
    	                    return writer;
    	                };
    	    
    	                /**
    	                 * Decodes a DoubleValue message from the specified reader or buffer.
    	                 * @function decode
    	                 * @memberof google.protobuf.DoubleValue
    	                 * @static
    	                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	                 * @param {number} [length] Message length if known beforehand
    	                 * @returns {google.protobuf.DoubleValue} DoubleValue
    	                 * @throws {Error} If the payload is not a reader or valid buffer
    	                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	                 */
    	                DoubleValue.decode = function decode(reader, length) {
    	                    if (!(reader instanceof $Reader))
    	                        reader = $Reader.create(reader);
    	                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.DoubleValue();
    	                    while (reader.pos < end) {
    	                        var tag = reader.uint32();
    	                        switch (tag >>> 3) {
    	                        case 1: {
    	                                message.value = reader.double();
    	                                break;
    	                            }
    	                        default:
    	                            reader.skipType(tag & 7);
    	                            break;
    	                        }
    	                    }
    	                    return message;
    	                };
    	    
    	                return DoubleValue;
    	            })();
    	    
    	            protobuf.FloatValue = (function() {
    	    
    	                /**
    	                 * Properties of a FloatValue.
    	                 * @memberof google.protobuf
    	                 * @interface IFloatValue
    	                 * @property {number|null} [value] FloatValue value
    	                 */
    	    
    	                /**
    	                 * Constructs a new FloatValue.
    	                 * @memberof google.protobuf
    	                 * @classdesc Represents a FloatValue.
    	                 * @implements IFloatValue
    	                 * @constructor
    	                 * @param {google.protobuf.IFloatValue=} [properties] Properties to set
    	                 */
    	                function FloatValue(properties) {
    	                    if (properties)
    	                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                            if (properties[keys[i]] != null)
    	                                this[keys[i]] = properties[keys[i]];
    	                }
    	    
    	                /**
    	                 * FloatValue value.
    	                 * @member {number} value
    	                 * @memberof google.protobuf.FloatValue
    	                 * @instance
    	                 */
    	                FloatValue.prototype.value = 0;
    	    
    	                /**
    	                 * Creates a new FloatValue instance using the specified properties.
    	                 * @function create
    	                 * @memberof google.protobuf.FloatValue
    	                 * @static
    	                 * @param {google.protobuf.IFloatValue=} [properties] Properties to set
    	                 * @returns {google.protobuf.FloatValue} FloatValue instance
    	                 */
    	                FloatValue.create = function create(properties) {
    	                    return new FloatValue(properties);
    	                };
    	    
    	                /**
    	                 * Encodes the specified FloatValue message. Does not implicitly {@link google.protobuf.FloatValue.verify|verify} messages.
    	                 * @function encode
    	                 * @memberof google.protobuf.FloatValue
    	                 * @static
    	                 * @param {google.protobuf.IFloatValue} message FloatValue message or plain object to encode
    	                 * @param {$protobuf.Writer} [writer] Writer to encode to
    	                 * @returns {$protobuf.Writer} Writer
    	                 */
    	                FloatValue.encode = function encode(message, writer) {
    	                    if (!writer)
    	                        writer = $Writer.create();
    	                    if (message.value != null && Object.hasOwnProperty.call(message, "value"))
    	                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.value);
    	                    return writer;
    	                };
    	    
    	                /**
    	                 * Decodes a FloatValue message from the specified reader or buffer.
    	                 * @function decode
    	                 * @memberof google.protobuf.FloatValue
    	                 * @static
    	                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	                 * @param {number} [length] Message length if known beforehand
    	                 * @returns {google.protobuf.FloatValue} FloatValue
    	                 * @throws {Error} If the payload is not a reader or valid buffer
    	                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	                 */
    	                FloatValue.decode = function decode(reader, length) {
    	                    if (!(reader instanceof $Reader))
    	                        reader = $Reader.create(reader);
    	                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.FloatValue();
    	                    while (reader.pos < end) {
    	                        var tag = reader.uint32();
    	                        switch (tag >>> 3) {
    	                        case 1: {
    	                                message.value = reader.float();
    	                                break;
    	                            }
    	                        default:
    	                            reader.skipType(tag & 7);
    	                            break;
    	                        }
    	                    }
    	                    return message;
    	                };
    	    
    	                return FloatValue;
    	            })();
    	    
    	            protobuf.Int64Value = (function() {
    	    
    	                /**
    	                 * Properties of an Int64Value.
    	                 * @memberof google.protobuf
    	                 * @interface IInt64Value
    	                 * @property {number|Long|null} [value] Int64Value value
    	                 */
    	    
    	                /**
    	                 * Constructs a new Int64Value.
    	                 * @memberof google.protobuf
    	                 * @classdesc Represents an Int64Value.
    	                 * @implements IInt64Value
    	                 * @constructor
    	                 * @param {google.protobuf.IInt64Value=} [properties] Properties to set
    	                 */
    	                function Int64Value(properties) {
    	                    if (properties)
    	                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                            if (properties[keys[i]] != null)
    	                                this[keys[i]] = properties[keys[i]];
    	                }
    	    
    	                /**
    	                 * Int64Value value.
    	                 * @member {number|Long} value
    	                 * @memberof google.protobuf.Int64Value
    	                 * @instance
    	                 */
    	                Int64Value.prototype.value = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    	    
    	                /**
    	                 * Creates a new Int64Value instance using the specified properties.
    	                 * @function create
    	                 * @memberof google.protobuf.Int64Value
    	                 * @static
    	                 * @param {google.protobuf.IInt64Value=} [properties] Properties to set
    	                 * @returns {google.protobuf.Int64Value} Int64Value instance
    	                 */
    	                Int64Value.create = function create(properties) {
    	                    return new Int64Value(properties);
    	                };
    	    
    	                /**
    	                 * Encodes the specified Int64Value message. Does not implicitly {@link google.protobuf.Int64Value.verify|verify} messages.
    	                 * @function encode
    	                 * @memberof google.protobuf.Int64Value
    	                 * @static
    	                 * @param {google.protobuf.IInt64Value} message Int64Value message or plain object to encode
    	                 * @param {$protobuf.Writer} [writer] Writer to encode to
    	                 * @returns {$protobuf.Writer} Writer
    	                 */
    	                Int64Value.encode = function encode(message, writer) {
    	                    if (!writer)
    	                        writer = $Writer.create();
    	                    if (message.value != null && Object.hasOwnProperty.call(message, "value"))
    	                        writer.uint32(/* id 1, wireType 0 =*/8).int64(message.value);
    	                    return writer;
    	                };
    	    
    	                /**
    	                 * Decodes an Int64Value message from the specified reader or buffer.
    	                 * @function decode
    	                 * @memberof google.protobuf.Int64Value
    	                 * @static
    	                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	                 * @param {number} [length] Message length if known beforehand
    	                 * @returns {google.protobuf.Int64Value} Int64Value
    	                 * @throws {Error} If the payload is not a reader or valid buffer
    	                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	                 */
    	                Int64Value.decode = function decode(reader, length) {
    	                    if (!(reader instanceof $Reader))
    	                        reader = $Reader.create(reader);
    	                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Int64Value();
    	                    while (reader.pos < end) {
    	                        var tag = reader.uint32();
    	                        switch (tag >>> 3) {
    	                        case 1: {
    	                                message.value = reader.int64();
    	                                break;
    	                            }
    	                        default:
    	                            reader.skipType(tag & 7);
    	                            break;
    	                        }
    	                    }
    	                    return message;
    	                };
    	    
    	                return Int64Value;
    	            })();
    	    
    	            protobuf.UInt64Value = (function() {
    	    
    	                /**
    	                 * Properties of a UInt64Value.
    	                 * @memberof google.protobuf
    	                 * @interface IUInt64Value
    	                 * @property {number|Long|null} [value] UInt64Value value
    	                 */
    	    
    	                /**
    	                 * Constructs a new UInt64Value.
    	                 * @memberof google.protobuf
    	                 * @classdesc Represents a UInt64Value.
    	                 * @implements IUInt64Value
    	                 * @constructor
    	                 * @param {google.protobuf.IUInt64Value=} [properties] Properties to set
    	                 */
    	                function UInt64Value(properties) {
    	                    if (properties)
    	                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                            if (properties[keys[i]] != null)
    	                                this[keys[i]] = properties[keys[i]];
    	                }
    	    
    	                /**
    	                 * UInt64Value value.
    	                 * @member {number|Long} value
    	                 * @memberof google.protobuf.UInt64Value
    	                 * @instance
    	                 */
    	                UInt64Value.prototype.value = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    	    
    	                /**
    	                 * Creates a new UInt64Value instance using the specified properties.
    	                 * @function create
    	                 * @memberof google.protobuf.UInt64Value
    	                 * @static
    	                 * @param {google.protobuf.IUInt64Value=} [properties] Properties to set
    	                 * @returns {google.protobuf.UInt64Value} UInt64Value instance
    	                 */
    	                UInt64Value.create = function create(properties) {
    	                    return new UInt64Value(properties);
    	                };
    	    
    	                /**
    	                 * Encodes the specified UInt64Value message. Does not implicitly {@link google.protobuf.UInt64Value.verify|verify} messages.
    	                 * @function encode
    	                 * @memberof google.protobuf.UInt64Value
    	                 * @static
    	                 * @param {google.protobuf.IUInt64Value} message UInt64Value message or plain object to encode
    	                 * @param {$protobuf.Writer} [writer] Writer to encode to
    	                 * @returns {$protobuf.Writer} Writer
    	                 */
    	                UInt64Value.encode = function encode(message, writer) {
    	                    if (!writer)
    	                        writer = $Writer.create();
    	                    if (message.value != null && Object.hasOwnProperty.call(message, "value"))
    	                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.value);
    	                    return writer;
    	                };
    	    
    	                /**
    	                 * Decodes a UInt64Value message from the specified reader or buffer.
    	                 * @function decode
    	                 * @memberof google.protobuf.UInt64Value
    	                 * @static
    	                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	                 * @param {number} [length] Message length if known beforehand
    	                 * @returns {google.protobuf.UInt64Value} UInt64Value
    	                 * @throws {Error} If the payload is not a reader or valid buffer
    	                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	                 */
    	                UInt64Value.decode = function decode(reader, length) {
    	                    if (!(reader instanceof $Reader))
    	                        reader = $Reader.create(reader);
    	                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.UInt64Value();
    	                    while (reader.pos < end) {
    	                        var tag = reader.uint32();
    	                        switch (tag >>> 3) {
    	                        case 1: {
    	                                message.value = reader.uint64();
    	                                break;
    	                            }
    	                        default:
    	                            reader.skipType(tag & 7);
    	                            break;
    	                        }
    	                    }
    	                    return message;
    	                };
    	    
    	                return UInt64Value;
    	            })();
    	    
    	            protobuf.Int32Value = (function() {
    	    
    	                /**
    	                 * Properties of an Int32Value.
    	                 * @memberof google.protobuf
    	                 * @interface IInt32Value
    	                 * @property {number|null} [value] Int32Value value
    	                 */
    	    
    	                /**
    	                 * Constructs a new Int32Value.
    	                 * @memberof google.protobuf
    	                 * @classdesc Represents an Int32Value.
    	                 * @implements IInt32Value
    	                 * @constructor
    	                 * @param {google.protobuf.IInt32Value=} [properties] Properties to set
    	                 */
    	                function Int32Value(properties) {
    	                    if (properties)
    	                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                            if (properties[keys[i]] != null)
    	                                this[keys[i]] = properties[keys[i]];
    	                }
    	    
    	                /**
    	                 * Int32Value value.
    	                 * @member {number} value
    	                 * @memberof google.protobuf.Int32Value
    	                 * @instance
    	                 */
    	                Int32Value.prototype.value = 0;
    	    
    	                /**
    	                 * Creates a new Int32Value instance using the specified properties.
    	                 * @function create
    	                 * @memberof google.protobuf.Int32Value
    	                 * @static
    	                 * @param {google.protobuf.IInt32Value=} [properties] Properties to set
    	                 * @returns {google.protobuf.Int32Value} Int32Value instance
    	                 */
    	                Int32Value.create = function create(properties) {
    	                    return new Int32Value(properties);
    	                };
    	    
    	                /**
    	                 * Encodes the specified Int32Value message. Does not implicitly {@link google.protobuf.Int32Value.verify|verify} messages.
    	                 * @function encode
    	                 * @memberof google.protobuf.Int32Value
    	                 * @static
    	                 * @param {google.protobuf.IInt32Value} message Int32Value message or plain object to encode
    	                 * @param {$protobuf.Writer} [writer] Writer to encode to
    	                 * @returns {$protobuf.Writer} Writer
    	                 */
    	                Int32Value.encode = function encode(message, writer) {
    	                    if (!writer)
    	                        writer = $Writer.create();
    	                    if (message.value != null && Object.hasOwnProperty.call(message, "value"))
    	                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.value);
    	                    return writer;
    	                };
    	    
    	                /**
    	                 * Decodes an Int32Value message from the specified reader or buffer.
    	                 * @function decode
    	                 * @memberof google.protobuf.Int32Value
    	                 * @static
    	                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	                 * @param {number} [length] Message length if known beforehand
    	                 * @returns {google.protobuf.Int32Value} Int32Value
    	                 * @throws {Error} If the payload is not a reader or valid buffer
    	                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	                 */
    	                Int32Value.decode = function decode(reader, length) {
    	                    if (!(reader instanceof $Reader))
    	                        reader = $Reader.create(reader);
    	                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Int32Value();
    	                    while (reader.pos < end) {
    	                        var tag = reader.uint32();
    	                        switch (tag >>> 3) {
    	                        case 1: {
    	                                message.value = reader.int32();
    	                                break;
    	                            }
    	                        default:
    	                            reader.skipType(tag & 7);
    	                            break;
    	                        }
    	                    }
    	                    return message;
    	                };
    	    
    	                return Int32Value;
    	            })();
    	    
    	            protobuf.UInt32Value = (function() {
    	    
    	                /**
    	                 * Properties of a UInt32Value.
    	                 * @memberof google.protobuf
    	                 * @interface IUInt32Value
    	                 * @property {number|null} [value] UInt32Value value
    	                 */
    	    
    	                /**
    	                 * Constructs a new UInt32Value.
    	                 * @memberof google.protobuf
    	                 * @classdesc Represents a UInt32Value.
    	                 * @implements IUInt32Value
    	                 * @constructor
    	                 * @param {google.protobuf.IUInt32Value=} [properties] Properties to set
    	                 */
    	                function UInt32Value(properties) {
    	                    if (properties)
    	                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                            if (properties[keys[i]] != null)
    	                                this[keys[i]] = properties[keys[i]];
    	                }
    	    
    	                /**
    	                 * UInt32Value value.
    	                 * @member {number} value
    	                 * @memberof google.protobuf.UInt32Value
    	                 * @instance
    	                 */
    	                UInt32Value.prototype.value = 0;
    	    
    	                /**
    	                 * Creates a new UInt32Value instance using the specified properties.
    	                 * @function create
    	                 * @memberof google.protobuf.UInt32Value
    	                 * @static
    	                 * @param {google.protobuf.IUInt32Value=} [properties] Properties to set
    	                 * @returns {google.protobuf.UInt32Value} UInt32Value instance
    	                 */
    	                UInt32Value.create = function create(properties) {
    	                    return new UInt32Value(properties);
    	                };
    	    
    	                /**
    	                 * Encodes the specified UInt32Value message. Does not implicitly {@link google.protobuf.UInt32Value.verify|verify} messages.
    	                 * @function encode
    	                 * @memberof google.protobuf.UInt32Value
    	                 * @static
    	                 * @param {google.protobuf.IUInt32Value} message UInt32Value message or plain object to encode
    	                 * @param {$protobuf.Writer} [writer] Writer to encode to
    	                 * @returns {$protobuf.Writer} Writer
    	                 */
    	                UInt32Value.encode = function encode(message, writer) {
    	                    if (!writer)
    	                        writer = $Writer.create();
    	                    if (message.value != null && Object.hasOwnProperty.call(message, "value"))
    	                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.value);
    	                    return writer;
    	                };
    	    
    	                /**
    	                 * Decodes a UInt32Value message from the specified reader or buffer.
    	                 * @function decode
    	                 * @memberof google.protobuf.UInt32Value
    	                 * @static
    	                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	                 * @param {number} [length] Message length if known beforehand
    	                 * @returns {google.protobuf.UInt32Value} UInt32Value
    	                 * @throws {Error} If the payload is not a reader or valid buffer
    	                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	                 */
    	                UInt32Value.decode = function decode(reader, length) {
    	                    if (!(reader instanceof $Reader))
    	                        reader = $Reader.create(reader);
    	                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.UInt32Value();
    	                    while (reader.pos < end) {
    	                        var tag = reader.uint32();
    	                        switch (tag >>> 3) {
    	                        case 1: {
    	                                message.value = reader.uint32();
    	                                break;
    	                            }
    	                        default:
    	                            reader.skipType(tag & 7);
    	                            break;
    	                        }
    	                    }
    	                    return message;
    	                };
    	    
    	                return UInt32Value;
    	            })();
    	    
    	            protobuf.BoolValue = (function() {
    	    
    	                /**
    	                 * Properties of a BoolValue.
    	                 * @memberof google.protobuf
    	                 * @interface IBoolValue
    	                 * @property {boolean|null} [value] BoolValue value
    	                 */
    	    
    	                /**
    	                 * Constructs a new BoolValue.
    	                 * @memberof google.protobuf
    	                 * @classdesc Represents a BoolValue.
    	                 * @implements IBoolValue
    	                 * @constructor
    	                 * @param {google.protobuf.IBoolValue=} [properties] Properties to set
    	                 */
    	                function BoolValue(properties) {
    	                    if (properties)
    	                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                            if (properties[keys[i]] != null)
    	                                this[keys[i]] = properties[keys[i]];
    	                }
    	    
    	                /**
    	                 * BoolValue value.
    	                 * @member {boolean} value
    	                 * @memberof google.protobuf.BoolValue
    	                 * @instance
    	                 */
    	                BoolValue.prototype.value = false;
    	    
    	                /**
    	                 * Creates a new BoolValue instance using the specified properties.
    	                 * @function create
    	                 * @memberof google.protobuf.BoolValue
    	                 * @static
    	                 * @param {google.protobuf.IBoolValue=} [properties] Properties to set
    	                 * @returns {google.protobuf.BoolValue} BoolValue instance
    	                 */
    	                BoolValue.create = function create(properties) {
    	                    return new BoolValue(properties);
    	                };
    	    
    	                /**
    	                 * Encodes the specified BoolValue message. Does not implicitly {@link google.protobuf.BoolValue.verify|verify} messages.
    	                 * @function encode
    	                 * @memberof google.protobuf.BoolValue
    	                 * @static
    	                 * @param {google.protobuf.IBoolValue} message BoolValue message or plain object to encode
    	                 * @param {$protobuf.Writer} [writer] Writer to encode to
    	                 * @returns {$protobuf.Writer} Writer
    	                 */
    	                BoolValue.encode = function encode(message, writer) {
    	                    if (!writer)
    	                        writer = $Writer.create();
    	                    if (message.value != null && Object.hasOwnProperty.call(message, "value"))
    	                        writer.uint32(/* id 1, wireType 0 =*/8).bool(message.value);
    	                    return writer;
    	                };
    	    
    	                /**
    	                 * Decodes a BoolValue message from the specified reader or buffer.
    	                 * @function decode
    	                 * @memberof google.protobuf.BoolValue
    	                 * @static
    	                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	                 * @param {number} [length] Message length if known beforehand
    	                 * @returns {google.protobuf.BoolValue} BoolValue
    	                 * @throws {Error} If the payload is not a reader or valid buffer
    	                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	                 */
    	                BoolValue.decode = function decode(reader, length) {
    	                    if (!(reader instanceof $Reader))
    	                        reader = $Reader.create(reader);
    	                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.BoolValue();
    	                    while (reader.pos < end) {
    	                        var tag = reader.uint32();
    	                        switch (tag >>> 3) {
    	                        case 1: {
    	                                message.value = reader.bool();
    	                                break;
    	                            }
    	                        default:
    	                            reader.skipType(tag & 7);
    	                            break;
    	                        }
    	                    }
    	                    return message;
    	                };
    	    
    	                return BoolValue;
    	            })();
    	    
    	            protobuf.StringValue = (function() {
    	    
    	                /**
    	                 * Properties of a StringValue.
    	                 * @memberof google.protobuf
    	                 * @interface IStringValue
    	                 * @property {string|null} [value] StringValue value
    	                 */
    	    
    	                /**
    	                 * Constructs a new StringValue.
    	                 * @memberof google.protobuf
    	                 * @classdesc Represents a StringValue.
    	                 * @implements IStringValue
    	                 * @constructor
    	                 * @param {google.protobuf.IStringValue=} [properties] Properties to set
    	                 */
    	                function StringValue(properties) {
    	                    if (properties)
    	                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                            if (properties[keys[i]] != null)
    	                                this[keys[i]] = properties[keys[i]];
    	                }
    	    
    	                /**
    	                 * StringValue value.
    	                 * @member {string} value
    	                 * @memberof google.protobuf.StringValue
    	                 * @instance
    	                 */
    	                StringValue.prototype.value = "";
    	    
    	                /**
    	                 * Creates a new StringValue instance using the specified properties.
    	                 * @function create
    	                 * @memberof google.protobuf.StringValue
    	                 * @static
    	                 * @param {google.protobuf.IStringValue=} [properties] Properties to set
    	                 * @returns {google.protobuf.StringValue} StringValue instance
    	                 */
    	                StringValue.create = function create(properties) {
    	                    return new StringValue(properties);
    	                };
    	    
    	                /**
    	                 * Encodes the specified StringValue message. Does not implicitly {@link google.protobuf.StringValue.verify|verify} messages.
    	                 * @function encode
    	                 * @memberof google.protobuf.StringValue
    	                 * @static
    	                 * @param {google.protobuf.IStringValue} message StringValue message or plain object to encode
    	                 * @param {$protobuf.Writer} [writer] Writer to encode to
    	                 * @returns {$protobuf.Writer} Writer
    	                 */
    	                StringValue.encode = function encode(message, writer) {
    	                    if (!writer)
    	                        writer = $Writer.create();
    	                    if (message.value != null && Object.hasOwnProperty.call(message, "value"))
    	                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.value);
    	                    return writer;
    	                };
    	    
    	                /**
    	                 * Decodes a StringValue message from the specified reader or buffer.
    	                 * @function decode
    	                 * @memberof google.protobuf.StringValue
    	                 * @static
    	                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	                 * @param {number} [length] Message length if known beforehand
    	                 * @returns {google.protobuf.StringValue} StringValue
    	                 * @throws {Error} If the payload is not a reader or valid buffer
    	                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	                 */
    	                StringValue.decode = function decode(reader, length) {
    	                    if (!(reader instanceof $Reader))
    	                        reader = $Reader.create(reader);
    	                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.StringValue();
    	                    while (reader.pos < end) {
    	                        var tag = reader.uint32();
    	                        switch (tag >>> 3) {
    	                        case 1: {
    	                                message.value = reader.string();
    	                                break;
    	                            }
    	                        default:
    	                            reader.skipType(tag & 7);
    	                            break;
    	                        }
    	                    }
    	                    return message;
    	                };
    	    
    	                return StringValue;
    	            })();
    	    
    	            protobuf.BytesValue = (function() {
    	    
    	                /**
    	                 * Properties of a BytesValue.
    	                 * @memberof google.protobuf
    	                 * @interface IBytesValue
    	                 * @property {Uint8Array|null} [value] BytesValue value
    	                 */
    	    
    	                /**
    	                 * Constructs a new BytesValue.
    	                 * @memberof google.protobuf
    	                 * @classdesc Represents a BytesValue.
    	                 * @implements IBytesValue
    	                 * @constructor
    	                 * @param {google.protobuf.IBytesValue=} [properties] Properties to set
    	                 */
    	                function BytesValue(properties) {
    	                    if (properties)
    	                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                            if (properties[keys[i]] != null)
    	                                this[keys[i]] = properties[keys[i]];
    	                }
    	    
    	                /**
    	                 * BytesValue value.
    	                 * @member {Uint8Array} value
    	                 * @memberof google.protobuf.BytesValue
    	                 * @instance
    	                 */
    	                BytesValue.prototype.value = $util.newBuffer([]);
    	    
    	                /**
    	                 * Creates a new BytesValue instance using the specified properties.
    	                 * @function create
    	                 * @memberof google.protobuf.BytesValue
    	                 * @static
    	                 * @param {google.protobuf.IBytesValue=} [properties] Properties to set
    	                 * @returns {google.protobuf.BytesValue} BytesValue instance
    	                 */
    	                BytesValue.create = function create(properties) {
    	                    return new BytesValue(properties);
    	                };
    	    
    	                /**
    	                 * Encodes the specified BytesValue message. Does not implicitly {@link google.protobuf.BytesValue.verify|verify} messages.
    	                 * @function encode
    	                 * @memberof google.protobuf.BytesValue
    	                 * @static
    	                 * @param {google.protobuf.IBytesValue} message BytesValue message or plain object to encode
    	                 * @param {$protobuf.Writer} [writer] Writer to encode to
    	                 * @returns {$protobuf.Writer} Writer
    	                 */
    	                BytesValue.encode = function encode(message, writer) {
    	                    if (!writer)
    	                        writer = $Writer.create();
    	                    if (message.value != null && Object.hasOwnProperty.call(message, "value"))
    	                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.value);
    	                    return writer;
    	                };
    	    
    	                /**
    	                 * Decodes a BytesValue message from the specified reader or buffer.
    	                 * @function decode
    	                 * @memberof google.protobuf.BytesValue
    	                 * @static
    	                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	                 * @param {number} [length] Message length if known beforehand
    	                 * @returns {google.protobuf.BytesValue} BytesValue
    	                 * @throws {Error} If the payload is not a reader or valid buffer
    	                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	                 */
    	                BytesValue.decode = function decode(reader, length) {
    	                    if (!(reader instanceof $Reader))
    	                        reader = $Reader.create(reader);
    	                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.BytesValue();
    	                    while (reader.pos < end) {
    	                        var tag = reader.uint32();
    	                        switch (tag >>> 3) {
    	                        case 1: {
    	                                message.value = reader.bytes();
    	                                break;
    	                            }
    	                        default:
    	                            reader.skipType(tag & 7);
    	                            break;
    	                        }
    	                    }
    	                    return message;
    	                };
    	    
    	                return BytesValue;
    	            })();
    	    
    	            return protobuf;
    	        })();
    	    
    	        return google;
    	    })();

    	    return $root;
    	}); 
    } (proto));

    var protoExports = proto.exports;

    var createClientMethods = function (_a) {
        var getMessageId = _a.getMessageId, sendMessage = _a.sendMessage;
        var send = function (_a) {
            var payload = _a.payload, messageId = _a.messageId, other = __rest(_a, ["payload", "messageId"]);
            sendMessage(__assign(__assign(__assign({ messageName: '' }, payload), { messageId: messageId }), other));
        };
        var sendDevice = function (data, last, messageId) {
            if (last === void 0) { last = true; }
            if (messageId === void 0) { messageId = getMessageId(); }
            return send({
                payload: {
                    device: protoExports.Device.create(data),
                    last: last ? 1 : -1,
                },
                messageId: messageId,
            });
        };
        var sendInitialSettings = function (data, last, messageId, params) {
            if (last === void 0) { last = true; }
            if (messageId === void 0) { messageId = getMessageId(); }
            if (params === void 0) { params = {}; }
            return send({
                payload: __assign({ initialSettings: protoExports.InitialSettings.create(data), last: last ? 1 : -1 }, params),
                messageId: messageId,
            });
        };
        var getHistoryRequest = function (data, last, messageId) {
            if (last === void 0) { last = true; }
            if (messageId === void 0) { messageId = getMessageId(); }
            var uuid = data.uuid, device = data.device, historyClient = data.history;
            var historyProto = { messageTypes: historyClient === null || historyClient === void 0 ? void 0 : historyClient.messageTypes };
            // Мапим объект настроек от пользователя в формат объекта протобафа
            if (historyClient === null || historyClient === void 0 ? void 0 : historyClient.app) {
                historyProto.app = Object.entries(historyClient.app).reduce(function (acc, _a) {
                    var _b;
                    var key = _a[0], value = _a[1];
                    return (__assign(__assign({}, acc), (_b = {}, _b[key] = { value: value }, _b)));
                }, {});
            }
            if (historyClient === null || historyClient === void 0 ? void 0 : historyClient.offset) {
                historyProto.offset = Object.entries(historyClient.offset).reduce(function (acc, _a) {
                    var _b;
                    var key = _a[0], value = _a[1];
                    return (__assign(__assign({}, acc), (_b = {}, _b[key] = { value: value.toString() }, _b)));
                }, {});
            }
            return send({
                payload: __assign(__assign({}, protoExports.ChatHistoryRequest.create({
                    uuid: uuid,
                    device: device,
                    getHistoryRequest: historyProto,
                })), { messageName: 'GET_HISTORY', last: last ? 1 : -1 }),
                messageId: messageId,
            });
        };
        var sendCancel = function (data, last, messageId) {
            if (last === void 0) { last = true; }
            if (messageId === void 0) { messageId = getMessageId(); }
            return send({
                payload: {
                    cancel: protoExports.Cancel.create(data),
                    last: last ? 1 : -1,
                },
                messageId: messageId,
            });
        };
        var sendLegacyDevice = function (data, last, messageId) {
            if (last === void 0) { last = true; }
            if (messageId === void 0) { messageId = getMessageId(); }
            return send({
                payload: {
                    legacyDevice: protoExports.LegacyDevice.create(data),
                    last: last ? 1 : -1,
                },
                messageId: messageId,
            });
        };
        var sendSettings = function (data, last, messageId) {
            if (last === void 0) { last = true; }
            if (messageId === void 0) { messageId = getMessageId(); }
            return send({
                payload: {
                    settings: protoExports.Settings.create(data),
                    last: last ? 1 : -1,
                },
                messageId: messageId,
            });
        };
        var sendText = function (data, params, type, messageId) {
            var _a;
            if (params === void 0) { params = {}; }
            if (type === void 0) { type = ''; }
            if (messageId === void 0) { messageId = getMessageId(); }
            var text = type ? { data: data, type: type } : { data: data };
            send(__assign({ payload: {
                    text: protoExports.Text.create(text),
                    last: (_a = params.last) !== null && _a !== void 0 ? _a : 1,
                }, messageId: messageId }, params));
        };
        var sendSystemMessage = function (_a, last, messageId, params) {
            var data = _a.data, _b = _a.messageName, mesName = _b === void 0 ? '' : _b;
            if (last === void 0) { last = true; }
            if (messageId === void 0) { messageId = getMessageId(); }
            if (params === void 0) { params = {}; }
            send({
                payload: __assign({ systemMessage: protoExports.SystemMessage.create({
                        data: JSON.stringify(data),
                    }), messageName: mesName, last: last ? 1 : -1 }, params),
                messageId: messageId,
            });
        };
        var sendVoice = function (data, last, messageId, mesName, params) {
            if (last === void 0) { last = true; }
            if (messageId === void 0) { messageId = getMessageId(); }
            if (params === void 0) { params = {}; }
            return send({
                payload: __assign({ voice: protoExports.Voice.create({
                        data: new Uint8Array(data),
                    }), messageName: mesName, last: last ? 1 : -1 }, params),
                messageId: messageId,
            });
        };
        var batch = function (cb) {
            var batchingMessageId = getMessageId();
            var lastMessageSent = false;
            var checkLastMessageStatus = function (last) {
                if (lastMessageSent) {
                    if (last) {
                        throw new Error("Can't send two last items in batch");
                    }
                    else {
                        throw new Error("Can't send messages in batch after last message have been sent");
                    }
                }
                else if (last) {
                    lastMessageSent = true;
                }
            };
            var upgradedSendText = function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var data = _a[0], params = _a[1], type = _a[2];
                checkLastMessageStatus((params === null || params === void 0 ? void 0 : params.last) === 1);
                return sendText(data, params, type, batchingMessageId);
            };
            var upgradedSendSystemMessage = function (data, last, params) {
                checkLastMessageStatus(last);
                return sendSystemMessage(data, last, batchingMessageId, params);
            };
            var upgradedSendVoice = function (data, last, mesName, params) {
                checkLastMessageStatus(last);
                return sendVoice(data, last, batchingMessageId, mesName, params);
            };
            var upgradedSendSettings = function (data, last, messageId) {
                checkLastMessageStatus(last);
                return sendSettings(data, last, messageId);
            };
            return cb({
                sendText: upgradedSendText,
                sendSystemMessage: upgradedSendSystemMessage,
                sendVoice: upgradedSendVoice,
                sendSettings: upgradedSendSettings,
                messageId: batchingMessageId,
            });
        };
        return {
            sendDevice: sendDevice,
            sendInitialSettings: sendInitialSettings,
            getHistoryRequest: getHistoryRequest,
            sendCancel: sendCancel,
            sendLegacyDevice: sendLegacyDevice,
            sendSettings: sendSettings,
            sendText: sendText,
            sendSystemMessage: sendSystemMessage,
            sendVoice: sendVoice,
            batch: batch,
        };
    };

    var safeJSONParse = function (str, defaultValue) {
        try {
            return JSON.parse(str);
        }
        catch (err) {
            return defaultValue;
        }
    };
    var compileBasePayload = function (_a) {
        var userId = _a.userId, token = _a.token, userChannel = _a.userChannel, version = _a.version, messageName = _a.messageName, vpsToken = _a.vpsToken;
        if (version < 3) {
            return {
                userId: userId,
                token: token,
                userChannel: userChannel,
                messageName: messageName,
                vpsToken: vpsToken,
                version: version,
            };
        }
        return {
            token: token,
            messageName: messageName,
            version: version,
        };
    };
    var appendHeader = function (uint8Array) {
        // Добавляем 4 байта в начало с длинной сообщения
        var arrayBuffer = new ArrayBuffer(4);
        var dataView = new DataView(arrayBuffer, 0);
        dataView.setInt32(0, uint8Array.length, true);
        var newUint8Array = new Uint8Array(4 + uint8Array.length);
        newUint8Array.set(new Uint8Array(arrayBuffer));
        newUint8Array.set(uint8Array, 4);
        return newUint8Array;
    };
    var removeHeader = function (uint8Array) {
        // Убираем 4 байта в начале с длинной сообщения
        var newUint8Array = new Uint8Array(uint8Array).slice(4);
        return newUint8Array;
    };
    var createProtocol = function (transport, _a) {
        var logger = _a.logger, getToken = _a.getToken, getInitialMeta = _a.getInitialMeta, params = __rest(_a, ["logger", "getToken", "getInitialMeta"]);
        var configuration = __assign(__assign({}, params), { token: '' });
        var url = configuration.url, userId = configuration.userId, userChannel = configuration.userChannel, locale = configuration.locale, device = configuration.device, settings = configuration.settings, legacyDevice = configuration.legacyDevice, version = configuration.version, messageName = configuration.messageName, vpsToken = configuration.vpsToken;
        var basePayload = compileBasePayload({ userId: userId, token: '', messageName: messageName, vpsToken: vpsToken, userChannel: userChannel, version: version });
        var _b = createNanoEvents(), on = _b.on, emit = _b.emit;
        var subscriptions = [];
        var messageQueue = [];
        var initMessageId; // ид инициализационного сообщения, отправим мессаджи в неинициализированный протокол
        var currentSettings = { device: device, legacyDevice: legacyDevice, settings: settings, locale: locale };
        var currentMessageId = Date.now();
        var status = 'closed';
        var destroyed = false;
        var clearReadyTimer; // ид таймера установки состояния ready
        var cancelUpdatingSettingsWhenSocketReady = function () { }; // отменяет обновление настроек VPS при готовности сокета
        var getMessageId = function () {
            return currentMessageId++;
        };
        var send = function (message) {
            var createdMessage = protoExports.Message.create(__assign(__assign({}, basePayload), message));
            logger === null || logger === void 0 ? void 0 : logger({ type: 'outcoming', message: createdMessage });
            var encodedMessage = protoExports.Message.encode(createdMessage).finish();
            var encodedMessageWithHeader = appendHeader(encodedMessage);
            transport.send(encodedMessageWithHeader);
            emit('outcoming', createdMessage);
        };
        var sendMessage = function (message) {
            // отправляем инициализационные сообщения или все, когда сессия = ready
            if (status === 'ready' || (typeof initMessageId !== undefined && message.messageId === initMessageId)) {
                send(message);
                return;
            }
            // накапливаем сообщения, отправим после успешного коннекта
            messageQueue.push(message);
            if (status === 'closed' && !destroyed) {
                transport.open(url);
            }
        };
        var _c = createClientMethods({ getMessageId: getMessageId, sendMessage: sendMessage }), sendDeviceOriginal = _c.sendDevice, sendInitialSettingsOriginal = _c.sendInitialSettings, getHistoryRequestOriginal = _c.getHistoryRequest, sendCancel = _c.sendCancel, sendLegacyDeviceOriginal = _c.sendLegacyDevice, sendSettingsOriginal = _c.sendSettings, sendText = _c.sendText, sendSystemMessage = _c.sendSystemMessage, sendVoice = _c.sendVoice, batch = _c.batch;
        var sendDevice = (function (data) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            currentSettings = __assign(__assign({}, currentSettings), { device: data });
            return sendDeviceOriginal.apply(void 0, __spreadArray([data], args));
        });
        var sendInitialSettings = (function (data) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (data.device && data.settings) {
                currentSettings = __assign(__assign({}, currentSettings), { device: data.device, settings: data.settings, locale: data.locale || undefined });
            }
            return sendInitialSettingsOriginal.apply(void 0, __spreadArray([data], args));
        });
        var getHistoryRequest = function (data) {
            var _a, _b;
            return getHistoryRequestOriginal({
                device: currentSettings.device || null,
                uuid: {
                    userId: ((_a = data.uuid) === null || _a === void 0 ? void 0 : _a.userId) || userId,
                    userChannel: ((_b = data.uuid) === null || _b === void 0 ? void 0 : _b.userChannel) || userChannel,
                },
                history: __assign({}, (data.history || {})),
            });
        };
        var sendLegacyDevice = (function (data) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            currentSettings = __assign(__assign({}, currentSettings), { legacyDevice: data });
            return sendLegacyDeviceOriginal.apply(void 0, __spreadArray([data], args));
        });
        var updateDefaults = function (obj) {
            Object.assign(basePayload, obj);
            Object.assign(configuration, obj);
        };
        var updateDevice = function (obj) {
            var _a, _b;
            if (obj) {
                var additionalInfo = obj.additionalInfo, deviceOptions = __rest(obj, ["additionalInfo"]);
                var oldInfo = ((_a = currentSettings.device) === null || _a === void 0 ? void 0 : _a.additionalInfo)
                    ? safeJSONParse((_b = currentSettings.device) === null || _b === void 0 ? void 0 : _b.additionalInfo, {})
                    : {};
                var newInfo = additionalInfo ? safeJSONParse(additionalInfo, {}) : {};
                currentSettings.device = __assign(__assign(__assign({}, currentSettings.device), deviceOptions), { additionalInfo: JSON.stringify(__assign(__assign({}, oldInfo), newInfo)) });
            }
        };
        var updateSettings = function (obj) {
            var isSocketReady = status === 'connected' || status === 'ready';
            cancelUpdatingSettingsWhenSocketReady();
            Object.assign(currentSettings.settings, obj);
            if (!isSocketReady) {
                cancelUpdatingSettingsWhenSocketReady = on('ready', function () { return updateSettings(obj); });
                return;
            }
            sendSettingsOriginal(obj);
        };
        subscriptions.push(transport.on('connecting', function () {
            status = 'connecting';
        }));
        subscriptions.push(transport.on('close', function () {
            status = 'closed';
        }));
        subscriptions.push(transport.on('open', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b, _c, e_1, meta, _d;
            var _e;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 2, , 3]);
                        _b = (_a = Object).assign;
                        _c = [basePayload];
                        _e = {};
                        return [4 /*yield*/, getToken()];
                    case 1:
                        _b.apply(_a, _c.concat([(_e.token = _g.sent(), _e)]));
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _g.sent();
                        emit('error', {
                            type: 'GET_TOKEN_ERROR',
                            message: (_f = e_1) === null || _f === void 0 ? void 0 : _f.message,
                        });
                        return [2 /*return*/];
                    case 3:
                        Object.assign(configuration, { token: basePayload.token });
                        initMessageId = getMessageId();
                        if (!(version < 3)) return [3 /*break*/, 4];
                        if (version === 1 && currentSettings.legacyDevice) {
                            sendLegacyDevice(currentSettings.legacyDevice, false, initMessageId);
                        }
                        else if (version === 2 && currentSettings.device) {
                            sendDevice(currentSettings.device, false, initMessageId);
                        }
                        sendSettingsOriginal(currentSettings.settings, true, initMessageId);
                        return [3 /*break*/, 8];
                    case 4:
                        if (!getInitialMeta) return [3 /*break*/, 6];
                        return [4 /*yield*/, getInitialMeta()];
                    case 5:
                        _d = (_g.sent());
                        return [3 /*break*/, 7];
                    case 6:
                        _d = undefined;
                        _g.label = 7;
                    case 7:
                        meta = _d;
                        sendInitialSettings({
                            userId: userId,
                            userChannel: userChannel,
                            device: currentSettings.device,
                            settings: currentSettings.settings,
                            locale: version > 3 ? currentSettings.locale : undefined,
                        }, true, initMessageId, { meta: meta });
                        _g.label = 8;
                    case 8:
                        status = 'connected';
                        clearTimeout(clearReadyTimer);
                        /// считаем коннект = ready, если по истечении таймаута сокет не был разорван
                        /// т.к бек может разрывать сокет, если с settings что-то не так
                        clearReadyTimer = window.setTimeout(function () {
                            if (status !== 'connected') {
                                return;
                            }
                            while (messageQueue.length > 0) {
                                var message = messageQueue.shift();
                                if (message) {
                                    send(message);
                                }
                            }
                            status = 'ready';
                            emit('ready');
                        }, 500);
                        logger === null || logger === void 0 ? void 0 : logger({ type: 'init', params: __assign(__assign({}, configuration), currentSettings) });
                        return [2 /*return*/];
                }
            });
        }); }));
        subscriptions.push(transport.on('message', function (message) {
            var decodedMessage = protoExports.Message.decode(removeHeader(message));
            logger === null || logger === void 0 ? void 0 : logger({ type: 'incoming', message: decodedMessage });
            emit('incoming', decodedMessage);
            if (decodedMessage.status) {
                transport.close();
            }
        }));
        return {
            clearQueue: function () {
                messageQueue.splice(0, messageQueue.length);
            },
            destroy: function () {
                destroyed = true;
                transport.close();
                subscriptions.splice(0, subscriptions.length).map(function (unsubscribe) { return unsubscribe(); });
            },
            on: on,
            getHistoryRequest: getHistoryRequest,
            getMessageId: getMessageId,
            sendCancel: sendCancel,
            sendText: sendText,
            sendSystemMessage: sendSystemMessage,
            sendVoice: sendVoice,
            send: sendMessage,
            batch: batch,
            changeConfiguration: updateDefaults,
            changeDevice: updateDevice,
            changeSettings: updateSettings,
            reconnect: function () {
                if (status !== 'closed') {
                    transport.reconnect(url); // даем время случиться close
                }
                else {
                    transport.open(url);
                }
            },
            init: function () {
                // в отличии от reconnect не обрывает коннект если он в порядке
                if (status === 'ready' && window.navigator.onLine) {
                    return Promise.resolve();
                }
                return new Promise(function (resolve, reject) {
                    var subs = [];
                    subs.push(transport.on('open', function () {
                        subs.map(function (sub) { return sub(); });
                        resolve();
                    }));
                    subs.push(transport.on('error', function () {
                        subs.map(function (sub) { return sub(); });
                        reject(new Error('Network error'));
                    }));
                    transport.reconnect(url);
                });
            },
            get currentMessageId() {
                return currentMessageId;
            },
            get configuration() {
                return configuration;
            },
            get status() {
                return status;
            },
        };
    };

    var createBaseRecorder = function (isActive, getDefaultRecord) {
        if (isActive === void 0) { isActive = true; }
        var record = getDefaultRecord();
        var start = function () {
            record = getDefaultRecord();
            isActive = true;
        };
        var stop = function () {
            isActive = false;
        };
        function handler() { }
        var updateRecord = function (cb) { return cb(record); };
        var getRecord = function () { return record; };
        var prepareHandler = function (handlerToPrepare) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (isActive === false) {
                    return;
                }
                handlerToPrepare.apply(void 0, args);
            };
        };
        return {
            getRecord: getRecord,
            updateRecord: updateRecord,
            prepareHandler: prepareHandler,
            handler: handler,
            stop: stop,
            start: start,
        };
    };

    var lodash_clonedeep = {exports: {}};

    /**
     * lodash (Custom Build) <https://lodash.com/>
     * Build: `lodash modularize exports="npm" -o ./`
     * Copyright jQuery Foundation and other contributors <https://jquery.org/>
     * Released under MIT license <https://lodash.com/license>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     */
    lodash_clonedeep.exports;

    (function (module, exports) {
    	/** Used as the size to enable large array optimizations. */
    	var LARGE_ARRAY_SIZE = 200;

    	/** Used to stand-in for `undefined` hash values. */
    	var HASH_UNDEFINED = '__lodash_hash_undefined__';

    	/** Used as references for various `Number` constants. */
    	var MAX_SAFE_INTEGER = 9007199254740991;

    	/** `Object#toString` result references. */
    	var argsTag = '[object Arguments]',
    	    arrayTag = '[object Array]',
    	    boolTag = '[object Boolean]',
    	    dateTag = '[object Date]',
    	    errorTag = '[object Error]',
    	    funcTag = '[object Function]',
    	    genTag = '[object GeneratorFunction]',
    	    mapTag = '[object Map]',
    	    numberTag = '[object Number]',
    	    objectTag = '[object Object]',
    	    promiseTag = '[object Promise]',
    	    regexpTag = '[object RegExp]',
    	    setTag = '[object Set]',
    	    stringTag = '[object String]',
    	    symbolTag = '[object Symbol]',
    	    weakMapTag = '[object WeakMap]';

    	var arrayBufferTag = '[object ArrayBuffer]',
    	    dataViewTag = '[object DataView]',
    	    float32Tag = '[object Float32Array]',
    	    float64Tag = '[object Float64Array]',
    	    int8Tag = '[object Int8Array]',
    	    int16Tag = '[object Int16Array]',
    	    int32Tag = '[object Int32Array]',
    	    uint8Tag = '[object Uint8Array]',
    	    uint8ClampedTag = '[object Uint8ClampedArray]',
    	    uint16Tag = '[object Uint16Array]',
    	    uint32Tag = '[object Uint32Array]';

    	/**
    	 * Used to match `RegExp`
    	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
    	 */
    	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    	/** Used to match `RegExp` flags from their coerced string values. */
    	var reFlags = /\w*$/;

    	/** Used to detect host constructors (Safari). */
    	var reIsHostCtor = /^\[object .+?Constructor\]$/;

    	/** Used to detect unsigned integer values. */
    	var reIsUint = /^(?:0|[1-9]\d*)$/;

    	/** Used to identify `toStringTag` values supported by `_.clone`. */
    	var cloneableTags = {};
    	cloneableTags[argsTag] = cloneableTags[arrayTag] =
    	cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
    	cloneableTags[boolTag] = cloneableTags[dateTag] =
    	cloneableTags[float32Tag] = cloneableTags[float64Tag] =
    	cloneableTags[int8Tag] = cloneableTags[int16Tag] =
    	cloneableTags[int32Tag] = cloneableTags[mapTag] =
    	cloneableTags[numberTag] = cloneableTags[objectTag] =
    	cloneableTags[regexpTag] = cloneableTags[setTag] =
    	cloneableTags[stringTag] = cloneableTags[symbolTag] =
    	cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
    	cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    	cloneableTags[errorTag] = cloneableTags[funcTag] =
    	cloneableTags[weakMapTag] = false;

    	/** Detect free variable `global` from Node.js. */
    	var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    	/** Detect free variable `self`. */
    	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    	/** Used as a reference to the global object. */
    	var root = freeGlobal || freeSelf || Function('return this')();

    	/** Detect free variable `exports`. */
    	var freeExports = exports && !exports.nodeType && exports;

    	/** Detect free variable `module`. */
    	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    	/** Detect the popular CommonJS extension `module.exports`. */
    	var moduleExports = freeModule && freeModule.exports === freeExports;

    	/**
    	 * Adds the key-value `pair` to `map`.
    	 *
    	 * @private
    	 * @param {Object} map The map to modify.
    	 * @param {Array} pair The key-value pair to add.
    	 * @returns {Object} Returns `map`.
    	 */
    	function addMapEntry(map, pair) {
    	  // Don't return `map.set` because it's not chainable in IE 11.
    	  map.set(pair[0], pair[1]);
    	  return map;
    	}

    	/**
    	 * Adds `value` to `set`.
    	 *
    	 * @private
    	 * @param {Object} set The set to modify.
    	 * @param {*} value The value to add.
    	 * @returns {Object} Returns `set`.
    	 */
    	function addSetEntry(set, value) {
    	  // Don't return `set.add` because it's not chainable in IE 11.
    	  set.add(value);
    	  return set;
    	}

    	/**
    	 * A specialized version of `_.forEach` for arrays without support for
    	 * iteratee shorthands.
    	 *
    	 * @private
    	 * @param {Array} [array] The array to iterate over.
    	 * @param {Function} iteratee The function invoked per iteration.
    	 * @returns {Array} Returns `array`.
    	 */
    	function arrayEach(array, iteratee) {
    	  var index = -1,
    	      length = array ? array.length : 0;

    	  while (++index < length) {
    	    if (iteratee(array[index], index, array) === false) {
    	      break;
    	    }
    	  }
    	  return array;
    	}

    	/**
    	 * Appends the elements of `values` to `array`.
    	 *
    	 * @private
    	 * @param {Array} array The array to modify.
    	 * @param {Array} values The values to append.
    	 * @returns {Array} Returns `array`.
    	 */
    	function arrayPush(array, values) {
    	  var index = -1,
    	      length = values.length,
    	      offset = array.length;

    	  while (++index < length) {
    	    array[offset + index] = values[index];
    	  }
    	  return array;
    	}

    	/**
    	 * A specialized version of `_.reduce` for arrays without support for
    	 * iteratee shorthands.
    	 *
    	 * @private
    	 * @param {Array} [array] The array to iterate over.
    	 * @param {Function} iteratee The function invoked per iteration.
    	 * @param {*} [accumulator] The initial value.
    	 * @param {boolean} [initAccum] Specify using the first element of `array` as
    	 *  the initial value.
    	 * @returns {*} Returns the accumulated value.
    	 */
    	function arrayReduce(array, iteratee, accumulator, initAccum) {
    	  var index = -1,
    	      length = array ? array.length : 0;

    	  if (initAccum && length) {
    	    accumulator = array[++index];
    	  }
    	  while (++index < length) {
    	    accumulator = iteratee(accumulator, array[index], index, array);
    	  }
    	  return accumulator;
    	}

    	/**
    	 * The base implementation of `_.times` without support for iteratee shorthands
    	 * or max array length checks.
    	 *
    	 * @private
    	 * @param {number} n The number of times to invoke `iteratee`.
    	 * @param {Function} iteratee The function invoked per iteration.
    	 * @returns {Array} Returns the array of results.
    	 */
    	function baseTimes(n, iteratee) {
    	  var index = -1,
    	      result = Array(n);

    	  while (++index < n) {
    	    result[index] = iteratee(index);
    	  }
    	  return result;
    	}

    	/**
    	 * Gets the value at `key` of `object`.
    	 *
    	 * @private
    	 * @param {Object} [object] The object to query.
    	 * @param {string} key The key of the property to get.
    	 * @returns {*} Returns the property value.
    	 */
    	function getValue(object, key) {
    	  return object == null ? undefined : object[key];
    	}

    	/**
    	 * Checks if `value` is a host object in IE < 9.
    	 *
    	 * @private
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
    	 */
    	function isHostObject(value) {
    	  // Many host objects are `Object` objects that can coerce to strings
    	  // despite having improperly defined `toString` methods.
    	  var result = false;
    	  if (value != null && typeof value.toString != 'function') {
    	    try {
    	      result = !!(value + '');
    	    } catch (e) {}
    	  }
    	  return result;
    	}

    	/**
    	 * Converts `map` to its key-value pairs.
    	 *
    	 * @private
    	 * @param {Object} map The map to convert.
    	 * @returns {Array} Returns the key-value pairs.
    	 */
    	function mapToArray(map) {
    	  var index = -1,
    	      result = Array(map.size);

    	  map.forEach(function(value, key) {
    	    result[++index] = [key, value];
    	  });
    	  return result;
    	}

    	/**
    	 * Creates a unary function that invokes `func` with its argument transformed.
    	 *
    	 * @private
    	 * @param {Function} func The function to wrap.
    	 * @param {Function} transform The argument transform.
    	 * @returns {Function} Returns the new function.
    	 */
    	function overArg(func, transform) {
    	  return function(arg) {
    	    return func(transform(arg));
    	  };
    	}

    	/**
    	 * Converts `set` to an array of its values.
    	 *
    	 * @private
    	 * @param {Object} set The set to convert.
    	 * @returns {Array} Returns the values.
    	 */
    	function setToArray(set) {
    	  var index = -1,
    	      result = Array(set.size);

    	  set.forEach(function(value) {
    	    result[++index] = value;
    	  });
    	  return result;
    	}

    	/** Used for built-in method references. */
    	var arrayProto = Array.prototype,
    	    funcProto = Function.prototype,
    	    objectProto = Object.prototype;

    	/** Used to detect overreaching core-js shims. */
    	var coreJsData = root['__core-js_shared__'];

    	/** Used to detect methods masquerading as native. */
    	var maskSrcKey = (function() {
    	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    	  return uid ? ('Symbol(src)_1.' + uid) : '';
    	}());

    	/** Used to resolve the decompiled source of functions. */
    	var funcToString = funcProto.toString;

    	/** Used to check objects for own properties. */
    	var hasOwnProperty = objectProto.hasOwnProperty;

    	/**
    	 * Used to resolve the
    	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
    	 * of values.
    	 */
    	var objectToString = objectProto.toString;

    	/** Used to detect if a method is native. */
    	var reIsNative = RegExp('^' +
    	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
    	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    	);

    	/** Built-in value references. */
    	var Buffer = moduleExports ? root.Buffer : undefined,
    	    Symbol = root.Symbol,
    	    Uint8Array = root.Uint8Array,
    	    getPrototype = overArg(Object.getPrototypeOf, Object),
    	    objectCreate = Object.create,
    	    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    	    splice = arrayProto.splice;

    	/* Built-in method references for those with the same name as other `lodash` methods. */
    	var nativeGetSymbols = Object.getOwnPropertySymbols,
    	    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    	    nativeKeys = overArg(Object.keys, Object);

    	/* Built-in method references that are verified to be native. */
    	var DataView = getNative(root, 'DataView'),
    	    Map = getNative(root, 'Map'),
    	    Promise = getNative(root, 'Promise'),
    	    Set = getNative(root, 'Set'),
    	    WeakMap = getNative(root, 'WeakMap'),
    	    nativeCreate = getNative(Object, 'create');

    	/** Used to detect maps, sets, and weakmaps. */
    	var dataViewCtorString = toSource(DataView),
    	    mapCtorString = toSource(Map),
    	    promiseCtorString = toSource(Promise),
    	    setCtorString = toSource(Set),
    	    weakMapCtorString = toSource(WeakMap);

    	/** Used to convert symbols to primitives and strings. */
    	var symbolProto = Symbol ? Symbol.prototype : undefined,
    	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

    	/**
    	 * Creates a hash object.
    	 *
    	 * @private
    	 * @constructor
    	 * @param {Array} [entries] The key-value pairs to cache.
    	 */
    	function Hash(entries) {
    	  var index = -1,
    	      length = entries ? entries.length : 0;

    	  this.clear();
    	  while (++index < length) {
    	    var entry = entries[index];
    	    this.set(entry[0], entry[1]);
    	  }
    	}

    	/**
    	 * Removes all key-value entries from the hash.
    	 *
    	 * @private
    	 * @name clear
    	 * @memberOf Hash
    	 */
    	function hashClear() {
    	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
    	}

    	/**
    	 * Removes `key` and its value from the hash.
    	 *
    	 * @private
    	 * @name delete
    	 * @memberOf Hash
    	 * @param {Object} hash The hash to modify.
    	 * @param {string} key The key of the value to remove.
    	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
    	 */
    	function hashDelete(key) {
    	  return this.has(key) && delete this.__data__[key];
    	}

    	/**
    	 * Gets the hash value for `key`.
    	 *
    	 * @private
    	 * @name get
    	 * @memberOf Hash
    	 * @param {string} key The key of the value to get.
    	 * @returns {*} Returns the entry value.
    	 */
    	function hashGet(key) {
    	  var data = this.__data__;
    	  if (nativeCreate) {
    	    var result = data[key];
    	    return result === HASH_UNDEFINED ? undefined : result;
    	  }
    	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
    	}

    	/**
    	 * Checks if a hash value for `key` exists.
    	 *
    	 * @private
    	 * @name has
    	 * @memberOf Hash
    	 * @param {string} key The key of the entry to check.
    	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
    	 */
    	function hashHas(key) {
    	  var data = this.__data__;
    	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
    	}

    	/**
    	 * Sets the hash `key` to `value`.
    	 *
    	 * @private
    	 * @name set
    	 * @memberOf Hash
    	 * @param {string} key The key of the value to set.
    	 * @param {*} value The value to set.
    	 * @returns {Object} Returns the hash instance.
    	 */
    	function hashSet(key, value) {
    	  var data = this.__data__;
    	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
    	  return this;
    	}

    	// Add methods to `Hash`.
    	Hash.prototype.clear = hashClear;
    	Hash.prototype['delete'] = hashDelete;
    	Hash.prototype.get = hashGet;
    	Hash.prototype.has = hashHas;
    	Hash.prototype.set = hashSet;

    	/**
    	 * Creates an list cache object.
    	 *
    	 * @private
    	 * @constructor
    	 * @param {Array} [entries] The key-value pairs to cache.
    	 */
    	function ListCache(entries) {
    	  var index = -1,
    	      length = entries ? entries.length : 0;

    	  this.clear();
    	  while (++index < length) {
    	    var entry = entries[index];
    	    this.set(entry[0], entry[1]);
    	  }
    	}

    	/**
    	 * Removes all key-value entries from the list cache.
    	 *
    	 * @private
    	 * @name clear
    	 * @memberOf ListCache
    	 */
    	function listCacheClear() {
    	  this.__data__ = [];
    	}

    	/**
    	 * Removes `key` and its value from the list cache.
    	 *
    	 * @private
    	 * @name delete
    	 * @memberOf ListCache
    	 * @param {string} key The key of the value to remove.
    	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
    	 */
    	function listCacheDelete(key) {
    	  var data = this.__data__,
    	      index = assocIndexOf(data, key);

    	  if (index < 0) {
    	    return false;
    	  }
    	  var lastIndex = data.length - 1;
    	  if (index == lastIndex) {
    	    data.pop();
    	  } else {
    	    splice.call(data, index, 1);
    	  }
    	  return true;
    	}

    	/**
    	 * Gets the list cache value for `key`.
    	 *
    	 * @private
    	 * @name get
    	 * @memberOf ListCache
    	 * @param {string} key The key of the value to get.
    	 * @returns {*} Returns the entry value.
    	 */
    	function listCacheGet(key) {
    	  var data = this.__data__,
    	      index = assocIndexOf(data, key);

    	  return index < 0 ? undefined : data[index][1];
    	}

    	/**
    	 * Checks if a list cache value for `key` exists.
    	 *
    	 * @private
    	 * @name has
    	 * @memberOf ListCache
    	 * @param {string} key The key of the entry to check.
    	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
    	 */
    	function listCacheHas(key) {
    	  return assocIndexOf(this.__data__, key) > -1;
    	}

    	/**
    	 * Sets the list cache `key` to `value`.
    	 *
    	 * @private
    	 * @name set
    	 * @memberOf ListCache
    	 * @param {string} key The key of the value to set.
    	 * @param {*} value The value to set.
    	 * @returns {Object} Returns the list cache instance.
    	 */
    	function listCacheSet(key, value) {
    	  var data = this.__data__,
    	      index = assocIndexOf(data, key);

    	  if (index < 0) {
    	    data.push([key, value]);
    	  } else {
    	    data[index][1] = value;
    	  }
    	  return this;
    	}

    	// Add methods to `ListCache`.
    	ListCache.prototype.clear = listCacheClear;
    	ListCache.prototype['delete'] = listCacheDelete;
    	ListCache.prototype.get = listCacheGet;
    	ListCache.prototype.has = listCacheHas;
    	ListCache.prototype.set = listCacheSet;

    	/**
    	 * Creates a map cache object to store key-value pairs.
    	 *
    	 * @private
    	 * @constructor
    	 * @param {Array} [entries] The key-value pairs to cache.
    	 */
    	function MapCache(entries) {
    	  var index = -1,
    	      length = entries ? entries.length : 0;

    	  this.clear();
    	  while (++index < length) {
    	    var entry = entries[index];
    	    this.set(entry[0], entry[1]);
    	  }
    	}

    	/**
    	 * Removes all key-value entries from the map.
    	 *
    	 * @private
    	 * @name clear
    	 * @memberOf MapCache
    	 */
    	function mapCacheClear() {
    	  this.__data__ = {
    	    'hash': new Hash,
    	    'map': new (Map || ListCache),
    	    'string': new Hash
    	  };
    	}

    	/**
    	 * Removes `key` and its value from the map.
    	 *
    	 * @private
    	 * @name delete
    	 * @memberOf MapCache
    	 * @param {string} key The key of the value to remove.
    	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
    	 */
    	function mapCacheDelete(key) {
    	  return getMapData(this, key)['delete'](key);
    	}

    	/**
    	 * Gets the map value for `key`.
    	 *
    	 * @private
    	 * @name get
    	 * @memberOf MapCache
    	 * @param {string} key The key of the value to get.
    	 * @returns {*} Returns the entry value.
    	 */
    	function mapCacheGet(key) {
    	  return getMapData(this, key).get(key);
    	}

    	/**
    	 * Checks if a map value for `key` exists.
    	 *
    	 * @private
    	 * @name has
    	 * @memberOf MapCache
    	 * @param {string} key The key of the entry to check.
    	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
    	 */
    	function mapCacheHas(key) {
    	  return getMapData(this, key).has(key);
    	}

    	/**
    	 * Sets the map `key` to `value`.
    	 *
    	 * @private
    	 * @name set
    	 * @memberOf MapCache
    	 * @param {string} key The key of the value to set.
    	 * @param {*} value The value to set.
    	 * @returns {Object} Returns the map cache instance.
    	 */
    	function mapCacheSet(key, value) {
    	  getMapData(this, key).set(key, value);
    	  return this;
    	}

    	// Add methods to `MapCache`.
    	MapCache.prototype.clear = mapCacheClear;
    	MapCache.prototype['delete'] = mapCacheDelete;
    	MapCache.prototype.get = mapCacheGet;
    	MapCache.prototype.has = mapCacheHas;
    	MapCache.prototype.set = mapCacheSet;

    	/**
    	 * Creates a stack cache object to store key-value pairs.
    	 *
    	 * @private
    	 * @constructor
    	 * @param {Array} [entries] The key-value pairs to cache.
    	 */
    	function Stack(entries) {
    	  this.__data__ = new ListCache(entries);
    	}

    	/**
    	 * Removes all key-value entries from the stack.
    	 *
    	 * @private
    	 * @name clear
    	 * @memberOf Stack
    	 */
    	function stackClear() {
    	  this.__data__ = new ListCache;
    	}

    	/**
    	 * Removes `key` and its value from the stack.
    	 *
    	 * @private
    	 * @name delete
    	 * @memberOf Stack
    	 * @param {string} key The key of the value to remove.
    	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
    	 */
    	function stackDelete(key) {
    	  return this.__data__['delete'](key);
    	}

    	/**
    	 * Gets the stack value for `key`.
    	 *
    	 * @private
    	 * @name get
    	 * @memberOf Stack
    	 * @param {string} key The key of the value to get.
    	 * @returns {*} Returns the entry value.
    	 */
    	function stackGet(key) {
    	  return this.__data__.get(key);
    	}

    	/**
    	 * Checks if a stack value for `key` exists.
    	 *
    	 * @private
    	 * @name has
    	 * @memberOf Stack
    	 * @param {string} key The key of the entry to check.
    	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
    	 */
    	function stackHas(key) {
    	  return this.__data__.has(key);
    	}

    	/**
    	 * Sets the stack `key` to `value`.
    	 *
    	 * @private
    	 * @name set
    	 * @memberOf Stack
    	 * @param {string} key The key of the value to set.
    	 * @param {*} value The value to set.
    	 * @returns {Object} Returns the stack cache instance.
    	 */
    	function stackSet(key, value) {
    	  var cache = this.__data__;
    	  if (cache instanceof ListCache) {
    	    var pairs = cache.__data__;
    	    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
    	      pairs.push([key, value]);
    	      return this;
    	    }
    	    cache = this.__data__ = new MapCache(pairs);
    	  }
    	  cache.set(key, value);
    	  return this;
    	}

    	// Add methods to `Stack`.
    	Stack.prototype.clear = stackClear;
    	Stack.prototype['delete'] = stackDelete;
    	Stack.prototype.get = stackGet;
    	Stack.prototype.has = stackHas;
    	Stack.prototype.set = stackSet;

    	/**
    	 * Creates an array of the enumerable property names of the array-like `value`.
    	 *
    	 * @private
    	 * @param {*} value The value to query.
    	 * @param {boolean} inherited Specify returning inherited property names.
    	 * @returns {Array} Returns the array of property names.
    	 */
    	function arrayLikeKeys(value, inherited) {
    	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
    	  // Safari 9 makes `arguments.length` enumerable in strict mode.
    	  var result = (isArray(value) || isArguments(value))
    	    ? baseTimes(value.length, String)
    	    : [];

    	  var length = result.length,
    	      skipIndexes = !!length;

    	  for (var key in value) {
    	    if ((inherited || hasOwnProperty.call(value, key)) &&
    	        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
    	      result.push(key);
    	    }
    	  }
    	  return result;
    	}

    	/**
    	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
    	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
    	 * for equality comparisons.
    	 *
    	 * @private
    	 * @param {Object} object The object to modify.
    	 * @param {string} key The key of the property to assign.
    	 * @param {*} value The value to assign.
    	 */
    	function assignValue(object, key, value) {
    	  var objValue = object[key];
    	  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
    	      (value === undefined && !(key in object))) {
    	    object[key] = value;
    	  }
    	}

    	/**
    	 * Gets the index at which the `key` is found in `array` of key-value pairs.
    	 *
    	 * @private
    	 * @param {Array} array The array to inspect.
    	 * @param {*} key The key to search for.
    	 * @returns {number} Returns the index of the matched value, else `-1`.
    	 */
    	function assocIndexOf(array, key) {
    	  var length = array.length;
    	  while (length--) {
    	    if (eq(array[length][0], key)) {
    	      return length;
    	    }
    	  }
    	  return -1;
    	}

    	/**
    	 * The base implementation of `_.assign` without support for multiple sources
    	 * or `customizer` functions.
    	 *
    	 * @private
    	 * @param {Object} object The destination object.
    	 * @param {Object} source The source object.
    	 * @returns {Object} Returns `object`.
    	 */
    	function baseAssign(object, source) {
    	  return object && copyObject(source, keys(source), object);
    	}

    	/**
    	 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
    	 * traversed objects.
    	 *
    	 * @private
    	 * @param {*} value The value to clone.
    	 * @param {boolean} [isDeep] Specify a deep clone.
    	 * @param {boolean} [isFull] Specify a clone including symbols.
    	 * @param {Function} [customizer] The function to customize cloning.
    	 * @param {string} [key] The key of `value`.
    	 * @param {Object} [object] The parent object of `value`.
    	 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
    	 * @returns {*} Returns the cloned value.
    	 */
    	function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
    	  var result;
    	  if (customizer) {
    	    result = object ? customizer(value, key, object, stack) : customizer(value);
    	  }
    	  if (result !== undefined) {
    	    return result;
    	  }
    	  if (!isObject(value)) {
    	    return value;
    	  }
    	  var isArr = isArray(value);
    	  if (isArr) {
    	    result = initCloneArray(value);
    	    if (!isDeep) {
    	      return copyArray(value, result);
    	    }
    	  } else {
    	    var tag = getTag(value),
    	        isFunc = tag == funcTag || tag == genTag;

    	    if (isBuffer(value)) {
    	      return cloneBuffer(value, isDeep);
    	    }
    	    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
    	      if (isHostObject(value)) {
    	        return object ? value : {};
    	      }
    	      result = initCloneObject(isFunc ? {} : value);
    	      if (!isDeep) {
    	        return copySymbols(value, baseAssign(result, value));
    	      }
    	    } else {
    	      if (!cloneableTags[tag]) {
    	        return object ? value : {};
    	      }
    	      result = initCloneByTag(value, tag, baseClone, isDeep);
    	    }
    	  }
    	  // Check for circular references and return its corresponding clone.
    	  stack || (stack = new Stack);
    	  var stacked = stack.get(value);
    	  if (stacked) {
    	    return stacked;
    	  }
    	  stack.set(value, result);

    	  if (!isArr) {
    	    var props = isFull ? getAllKeys(value) : keys(value);
    	  }
    	  arrayEach(props || value, function(subValue, key) {
    	    if (props) {
    	      key = subValue;
    	      subValue = value[key];
    	    }
    	    // Recursively populate clone (susceptible to call stack limits).
    	    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
    	  });
    	  return result;
    	}

    	/**
    	 * The base implementation of `_.create` without support for assigning
    	 * properties to the created object.
    	 *
    	 * @private
    	 * @param {Object} prototype The object to inherit from.
    	 * @returns {Object} Returns the new object.
    	 */
    	function baseCreate(proto) {
    	  return isObject(proto) ? objectCreate(proto) : {};
    	}

    	/**
    	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
    	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
    	 * symbols of `object`.
    	 *
    	 * @private
    	 * @param {Object} object The object to query.
    	 * @param {Function} keysFunc The function to get the keys of `object`.
    	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
    	 * @returns {Array} Returns the array of property names and symbols.
    	 */
    	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    	  var result = keysFunc(object);
    	  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    	}

    	/**
    	 * The base implementation of `getTag`.
    	 *
    	 * @private
    	 * @param {*} value The value to query.
    	 * @returns {string} Returns the `toStringTag`.
    	 */
    	function baseGetTag(value) {
    	  return objectToString.call(value);
    	}

    	/**
    	 * The base implementation of `_.isNative` without bad shim checks.
    	 *
    	 * @private
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is a native function,
    	 *  else `false`.
    	 */
    	function baseIsNative(value) {
    	  if (!isObject(value) || isMasked(value)) {
    	    return false;
    	  }
    	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
    	  return pattern.test(toSource(value));
    	}

    	/**
    	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
    	 *
    	 * @private
    	 * @param {Object} object The object to query.
    	 * @returns {Array} Returns the array of property names.
    	 */
    	function baseKeys(object) {
    	  if (!isPrototype(object)) {
    	    return nativeKeys(object);
    	  }
    	  var result = [];
    	  for (var key in Object(object)) {
    	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
    	      result.push(key);
    	    }
    	  }
    	  return result;
    	}

    	/**
    	 * Creates a clone of  `buffer`.
    	 *
    	 * @private
    	 * @param {Buffer} buffer The buffer to clone.
    	 * @param {boolean} [isDeep] Specify a deep clone.
    	 * @returns {Buffer} Returns the cloned buffer.
    	 */
    	function cloneBuffer(buffer, isDeep) {
    	  if (isDeep) {
    	    return buffer.slice();
    	  }
    	  var result = new buffer.constructor(buffer.length);
    	  buffer.copy(result);
    	  return result;
    	}

    	/**
    	 * Creates a clone of `arrayBuffer`.
    	 *
    	 * @private
    	 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
    	 * @returns {ArrayBuffer} Returns the cloned array buffer.
    	 */
    	function cloneArrayBuffer(arrayBuffer) {
    	  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    	  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
    	  return result;
    	}

    	/**
    	 * Creates a clone of `dataView`.
    	 *
    	 * @private
    	 * @param {Object} dataView The data view to clone.
    	 * @param {boolean} [isDeep] Specify a deep clone.
    	 * @returns {Object} Returns the cloned data view.
    	 */
    	function cloneDataView(dataView, isDeep) {
    	  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
    	  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    	}

    	/**
    	 * Creates a clone of `map`.
    	 *
    	 * @private
    	 * @param {Object} map The map to clone.
    	 * @param {Function} cloneFunc The function to clone values.
    	 * @param {boolean} [isDeep] Specify a deep clone.
    	 * @returns {Object} Returns the cloned map.
    	 */
    	function cloneMap(map, isDeep, cloneFunc) {
    	  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
    	  return arrayReduce(array, addMapEntry, new map.constructor);
    	}

    	/**
    	 * Creates a clone of `regexp`.
    	 *
    	 * @private
    	 * @param {Object} regexp The regexp to clone.
    	 * @returns {Object} Returns the cloned regexp.
    	 */
    	function cloneRegExp(regexp) {
    	  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    	  result.lastIndex = regexp.lastIndex;
    	  return result;
    	}

    	/**
    	 * Creates a clone of `set`.
    	 *
    	 * @private
    	 * @param {Object} set The set to clone.
    	 * @param {Function} cloneFunc The function to clone values.
    	 * @param {boolean} [isDeep] Specify a deep clone.
    	 * @returns {Object} Returns the cloned set.
    	 */
    	function cloneSet(set, isDeep, cloneFunc) {
    	  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
    	  return arrayReduce(array, addSetEntry, new set.constructor);
    	}

    	/**
    	 * Creates a clone of the `symbol` object.
    	 *
    	 * @private
    	 * @param {Object} symbol The symbol object to clone.
    	 * @returns {Object} Returns the cloned symbol object.
    	 */
    	function cloneSymbol(symbol) {
    	  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    	}

    	/**
    	 * Creates a clone of `typedArray`.
    	 *
    	 * @private
    	 * @param {Object} typedArray The typed array to clone.
    	 * @param {boolean} [isDeep] Specify a deep clone.
    	 * @returns {Object} Returns the cloned typed array.
    	 */
    	function cloneTypedArray(typedArray, isDeep) {
    	  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    	  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    	}

    	/**
    	 * Copies the values of `source` to `array`.
    	 *
    	 * @private
    	 * @param {Array} source The array to copy values from.
    	 * @param {Array} [array=[]] The array to copy values to.
    	 * @returns {Array} Returns `array`.
    	 */
    	function copyArray(source, array) {
    	  var index = -1,
    	      length = source.length;

    	  array || (array = Array(length));
    	  while (++index < length) {
    	    array[index] = source[index];
    	  }
    	  return array;
    	}

    	/**
    	 * Copies properties of `source` to `object`.
    	 *
    	 * @private
    	 * @param {Object} source The object to copy properties from.
    	 * @param {Array} props The property identifiers to copy.
    	 * @param {Object} [object={}] The object to copy properties to.
    	 * @param {Function} [customizer] The function to customize copied values.
    	 * @returns {Object} Returns `object`.
    	 */
    	function copyObject(source, props, object, customizer) {
    	  object || (object = {});

    	  var index = -1,
    	      length = props.length;

    	  while (++index < length) {
    	    var key = props[index];

    	    var newValue = customizer
    	      ? customizer(object[key], source[key], key, object, source)
    	      : undefined;

    	    assignValue(object, key, newValue === undefined ? source[key] : newValue);
    	  }
    	  return object;
    	}

    	/**
    	 * Copies own symbol properties of `source` to `object`.
    	 *
    	 * @private
    	 * @param {Object} source The object to copy symbols from.
    	 * @param {Object} [object={}] The object to copy symbols to.
    	 * @returns {Object} Returns `object`.
    	 */
    	function copySymbols(source, object) {
    	  return copyObject(source, getSymbols(source), object);
    	}

    	/**
    	 * Creates an array of own enumerable property names and symbols of `object`.
    	 *
    	 * @private
    	 * @param {Object} object The object to query.
    	 * @returns {Array} Returns the array of property names and symbols.
    	 */
    	function getAllKeys(object) {
    	  return baseGetAllKeys(object, keys, getSymbols);
    	}

    	/**
    	 * Gets the data for `map`.
    	 *
    	 * @private
    	 * @param {Object} map The map to query.
    	 * @param {string} key The reference key.
    	 * @returns {*} Returns the map data.
    	 */
    	function getMapData(map, key) {
    	  var data = map.__data__;
    	  return isKeyable(key)
    	    ? data[typeof key == 'string' ? 'string' : 'hash']
    	    : data.map;
    	}

    	/**
    	 * Gets the native function at `key` of `object`.
    	 *
    	 * @private
    	 * @param {Object} object The object to query.
    	 * @param {string} key The key of the method to get.
    	 * @returns {*} Returns the function if it's native, else `undefined`.
    	 */
    	function getNative(object, key) {
    	  var value = getValue(object, key);
    	  return baseIsNative(value) ? value : undefined;
    	}

    	/**
    	 * Creates an array of the own enumerable symbol properties of `object`.
    	 *
    	 * @private
    	 * @param {Object} object The object to query.
    	 * @returns {Array} Returns the array of symbols.
    	 */
    	var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

    	/**
    	 * Gets the `toStringTag` of `value`.
    	 *
    	 * @private
    	 * @param {*} value The value to query.
    	 * @returns {string} Returns the `toStringTag`.
    	 */
    	var getTag = baseGetTag;

    	// Fallback for data views, maps, sets, and weak maps in IE 11,
    	// for data views in Edge < 14, and promises in Node.js.
    	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    	    (Map && getTag(new Map) != mapTag) ||
    	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    	    (Set && getTag(new Set) != setTag) ||
    	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
    	  getTag = function(value) {
    	    var result = objectToString.call(value),
    	        Ctor = result == objectTag ? value.constructor : undefined,
    	        ctorString = Ctor ? toSource(Ctor) : undefined;

    	    if (ctorString) {
    	      switch (ctorString) {
    	        case dataViewCtorString: return dataViewTag;
    	        case mapCtorString: return mapTag;
    	        case promiseCtorString: return promiseTag;
    	        case setCtorString: return setTag;
    	        case weakMapCtorString: return weakMapTag;
    	      }
    	    }
    	    return result;
    	  };
    	}

    	/**
    	 * Initializes an array clone.
    	 *
    	 * @private
    	 * @param {Array} array The array to clone.
    	 * @returns {Array} Returns the initialized clone.
    	 */
    	function initCloneArray(array) {
    	  var length = array.length,
    	      result = array.constructor(length);

    	  // Add properties assigned by `RegExp#exec`.
    	  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    	    result.index = array.index;
    	    result.input = array.input;
    	  }
    	  return result;
    	}

    	/**
    	 * Initializes an object clone.
    	 *
    	 * @private
    	 * @param {Object} object The object to clone.
    	 * @returns {Object} Returns the initialized clone.
    	 */
    	function initCloneObject(object) {
    	  return (typeof object.constructor == 'function' && !isPrototype(object))
    	    ? baseCreate(getPrototype(object))
    	    : {};
    	}

    	/**
    	 * Initializes an object clone based on its `toStringTag`.
    	 *
    	 * **Note:** This function only supports cloning values with tags of
    	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
    	 *
    	 * @private
    	 * @param {Object} object The object to clone.
    	 * @param {string} tag The `toStringTag` of the object to clone.
    	 * @param {Function} cloneFunc The function to clone values.
    	 * @param {boolean} [isDeep] Specify a deep clone.
    	 * @returns {Object} Returns the initialized clone.
    	 */
    	function initCloneByTag(object, tag, cloneFunc, isDeep) {
    	  var Ctor = object.constructor;
    	  switch (tag) {
    	    case arrayBufferTag:
    	      return cloneArrayBuffer(object);

    	    case boolTag:
    	    case dateTag:
    	      return new Ctor(+object);

    	    case dataViewTag:
    	      return cloneDataView(object, isDeep);

    	    case float32Tag: case float64Tag:
    	    case int8Tag: case int16Tag: case int32Tag:
    	    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
    	      return cloneTypedArray(object, isDeep);

    	    case mapTag:
    	      return cloneMap(object, isDeep, cloneFunc);

    	    case numberTag:
    	    case stringTag:
    	      return new Ctor(object);

    	    case regexpTag:
    	      return cloneRegExp(object);

    	    case setTag:
    	      return cloneSet(object, isDeep, cloneFunc);

    	    case symbolTag:
    	      return cloneSymbol(object);
    	  }
    	}

    	/**
    	 * Checks if `value` is a valid array-like index.
    	 *
    	 * @private
    	 * @param {*} value The value to check.
    	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
    	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
    	 */
    	function isIndex(value, length) {
    	  length = length == null ? MAX_SAFE_INTEGER : length;
    	  return !!length &&
    	    (typeof value == 'number' || reIsUint.test(value)) &&
    	    (value > -1 && value % 1 == 0 && value < length);
    	}

    	/**
    	 * Checks if `value` is suitable for use as unique object key.
    	 *
    	 * @private
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
    	 */
    	function isKeyable(value) {
    	  var type = typeof value;
    	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    	    ? (value !== '__proto__')
    	    : (value === null);
    	}

    	/**
    	 * Checks if `func` has its source masked.
    	 *
    	 * @private
    	 * @param {Function} func The function to check.
    	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
    	 */
    	function isMasked(func) {
    	  return !!maskSrcKey && (maskSrcKey in func);
    	}

    	/**
    	 * Checks if `value` is likely a prototype object.
    	 *
    	 * @private
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
    	 */
    	function isPrototype(value) {
    	  var Ctor = value && value.constructor,
    	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

    	  return value === proto;
    	}

    	/**
    	 * Converts `func` to its source code.
    	 *
    	 * @private
    	 * @param {Function} func The function to process.
    	 * @returns {string} Returns the source code.
    	 */
    	function toSource(func) {
    	  if (func != null) {
    	    try {
    	      return funcToString.call(func);
    	    } catch (e) {}
    	    try {
    	      return (func + '');
    	    } catch (e) {}
    	  }
    	  return '';
    	}

    	/**
    	 * This method is like `_.clone` except that it recursively clones `value`.
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 1.0.0
    	 * @category Lang
    	 * @param {*} value The value to recursively clone.
    	 * @returns {*} Returns the deep cloned value.
    	 * @see _.clone
    	 * @example
    	 *
    	 * var objects = [{ 'a': 1 }, { 'b': 2 }];
    	 *
    	 * var deep = _.cloneDeep(objects);
    	 * console.log(deep[0] === objects[0]);
    	 * // => false
    	 */
    	function cloneDeep(value) {
    	  return baseClone(value, true, true);
    	}

    	/**
    	 * Performs a
    	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
    	 * comparison between two values to determine if they are equivalent.
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 4.0.0
    	 * @category Lang
    	 * @param {*} value The value to compare.
    	 * @param {*} other The other value to compare.
    	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
    	 * @example
    	 *
    	 * var object = { 'a': 1 };
    	 * var other = { 'a': 1 };
    	 *
    	 * _.eq(object, object);
    	 * // => true
    	 *
    	 * _.eq(object, other);
    	 * // => false
    	 *
    	 * _.eq('a', 'a');
    	 * // => true
    	 *
    	 * _.eq('a', Object('a'));
    	 * // => false
    	 *
    	 * _.eq(NaN, NaN);
    	 * // => true
    	 */
    	function eq(value, other) {
    	  return value === other || (value !== value && other !== other);
    	}

    	/**
    	 * Checks if `value` is likely an `arguments` object.
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 0.1.0
    	 * @category Lang
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
    	 *  else `false`.
    	 * @example
    	 *
    	 * _.isArguments(function() { return arguments; }());
    	 * // => true
    	 *
    	 * _.isArguments([1, 2, 3]);
    	 * // => false
    	 */
    	function isArguments(value) {
    	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
    	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
    	}

    	/**
    	 * Checks if `value` is classified as an `Array` object.
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 0.1.0
    	 * @category Lang
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
    	 * @example
    	 *
    	 * _.isArray([1, 2, 3]);
    	 * // => true
    	 *
    	 * _.isArray(document.body.children);
    	 * // => false
    	 *
    	 * _.isArray('abc');
    	 * // => false
    	 *
    	 * _.isArray(_.noop);
    	 * // => false
    	 */
    	var isArray = Array.isArray;

    	/**
    	 * Checks if `value` is array-like. A value is considered array-like if it's
    	 * not a function and has a `value.length` that's an integer greater than or
    	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 4.0.0
    	 * @category Lang
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
    	 * @example
    	 *
    	 * _.isArrayLike([1, 2, 3]);
    	 * // => true
    	 *
    	 * _.isArrayLike(document.body.children);
    	 * // => true
    	 *
    	 * _.isArrayLike('abc');
    	 * // => true
    	 *
    	 * _.isArrayLike(_.noop);
    	 * // => false
    	 */
    	function isArrayLike(value) {
    	  return value != null && isLength(value.length) && !isFunction(value);
    	}

    	/**
    	 * This method is like `_.isArrayLike` except that it also checks if `value`
    	 * is an object.
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 4.0.0
    	 * @category Lang
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is an array-like object,
    	 *  else `false`.
    	 * @example
    	 *
    	 * _.isArrayLikeObject([1, 2, 3]);
    	 * // => true
    	 *
    	 * _.isArrayLikeObject(document.body.children);
    	 * // => true
    	 *
    	 * _.isArrayLikeObject('abc');
    	 * // => false
    	 *
    	 * _.isArrayLikeObject(_.noop);
    	 * // => false
    	 */
    	function isArrayLikeObject(value) {
    	  return isObjectLike(value) && isArrayLike(value);
    	}

    	/**
    	 * Checks if `value` is a buffer.
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 4.3.0
    	 * @category Lang
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
    	 * @example
    	 *
    	 * _.isBuffer(new Buffer(2));
    	 * // => true
    	 *
    	 * _.isBuffer(new Uint8Array(2));
    	 * // => false
    	 */
    	var isBuffer = nativeIsBuffer || stubFalse;

    	/**
    	 * Checks if `value` is classified as a `Function` object.
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 0.1.0
    	 * @category Lang
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
    	 * @example
    	 *
    	 * _.isFunction(_);
    	 * // => true
    	 *
    	 * _.isFunction(/abc/);
    	 * // => false
    	 */
    	function isFunction(value) {
    	  // The use of `Object#toString` avoids issues with the `typeof` operator
    	  // in Safari 8-9 which returns 'object' for typed array and other constructors.
    	  var tag = isObject(value) ? objectToString.call(value) : '';
    	  return tag == funcTag || tag == genTag;
    	}

    	/**
    	 * Checks if `value` is a valid array-like length.
    	 *
    	 * **Note:** This method is loosely based on
    	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 4.0.0
    	 * @category Lang
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
    	 * @example
    	 *
    	 * _.isLength(3);
    	 * // => true
    	 *
    	 * _.isLength(Number.MIN_VALUE);
    	 * // => false
    	 *
    	 * _.isLength(Infinity);
    	 * // => false
    	 *
    	 * _.isLength('3');
    	 * // => false
    	 */
    	function isLength(value) {
    	  return typeof value == 'number' &&
    	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    	}

    	/**
    	 * Checks if `value` is the
    	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
    	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 0.1.0
    	 * @category Lang
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
    	 * @example
    	 *
    	 * _.isObject({});
    	 * // => true
    	 *
    	 * _.isObject([1, 2, 3]);
    	 * // => true
    	 *
    	 * _.isObject(_.noop);
    	 * // => true
    	 *
    	 * _.isObject(null);
    	 * // => false
    	 */
    	function isObject(value) {
    	  var type = typeof value;
    	  return !!value && (type == 'object' || type == 'function');
    	}

    	/**
    	 * Checks if `value` is object-like. A value is object-like if it's not `null`
    	 * and has a `typeof` result of "object".
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 4.0.0
    	 * @category Lang
    	 * @param {*} value The value to check.
    	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
    	 * @example
    	 *
    	 * _.isObjectLike({});
    	 * // => true
    	 *
    	 * _.isObjectLike([1, 2, 3]);
    	 * // => true
    	 *
    	 * _.isObjectLike(_.noop);
    	 * // => false
    	 *
    	 * _.isObjectLike(null);
    	 * // => false
    	 */
    	function isObjectLike(value) {
    	  return !!value && typeof value == 'object';
    	}

    	/**
    	 * Creates an array of the own enumerable property names of `object`.
    	 *
    	 * **Note:** Non-object values are coerced to objects. See the
    	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
    	 * for more details.
    	 *
    	 * @static
    	 * @since 0.1.0
    	 * @memberOf _
    	 * @category Object
    	 * @param {Object} object The object to query.
    	 * @returns {Array} Returns the array of property names.
    	 * @example
    	 *
    	 * function Foo() {
    	 *   this.a = 1;
    	 *   this.b = 2;
    	 * }
    	 *
    	 * Foo.prototype.c = 3;
    	 *
    	 * _.keys(new Foo);
    	 * // => ['a', 'b'] (iteration order is not guaranteed)
    	 *
    	 * _.keys('hi');
    	 * // => ['0', '1']
    	 */
    	function keys(object) {
    	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    	}

    	/**
    	 * This method returns a new empty array.
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 4.13.0
    	 * @category Util
    	 * @returns {Array} Returns the new empty array.
    	 * @example
    	 *
    	 * var arrays = _.times(2, _.stubArray);
    	 *
    	 * console.log(arrays);
    	 * // => [[], []]
    	 *
    	 * console.log(arrays[0] === arrays[1]);
    	 * // => false
    	 */
    	function stubArray() {
    	  return [];
    	}

    	/**
    	 * This method returns `false`.
    	 *
    	 * @static
    	 * @memberOf _
    	 * @since 4.13.0
    	 * @category Util
    	 * @returns {boolean} Returns `false`.
    	 * @example
    	 *
    	 * _.times(2, _.stubFalse);
    	 * // => [false, false]
    	 */
    	function stubFalse() {
    	  return false;
    	}

    	module.exports = cloneDeep; 
    } (lodash_clonedeep, lodash_clonedeep.exports));

    lodash_clonedeep.exports;

    var createClient = function (protocol, provideMeta) {
        if (provideMeta === void 0) { provideMeta = undefined; }
        var _a = createNanoEvents(), on = _a.on, emit = _a.emit;
        /** ждет ответ бека и возвращает данные из этого ответа */
        var waitForAnswer = function (messageId) {
            return new Promise(function (resolve) {
                var off = on('systemMessage', function (systemMessageData, originalMessage) {
                    if (originalMessage.messageId === messageId &&
                        (originalMessage.messageName === MessageNames.ANSWER_TO_USER ||
                            originalMessage.messageName === MessageNames.DO_NOTHING)) {
                        off();
                        resolve(systemMessageData);
                    }
                });
            });
        };
        /** отправляет произвольный systemMessage, не подкладывает мету */
        var sendData = function (data, messageName, meta) {
            if (messageName === void 0) { messageName = ''; }
            var messageId = protocol.getMessageId();
            protocol.sendSystemMessage({
                data: data,
                messageName: messageName,
            }, true, messageId, { meta: meta || {} });
            return messageId;
        };
        /** отправляет cancel на сообщение */
        var sendCancel = function (messageId) {
            protocol.sendCancel({}, true, messageId);
        };
        /** отправляет приветствие */
        var sendOpenAssistant = function (_a) {
            var _b = _a === void 0 ? { isFirstSession: false } : _a, isFirstSession = _b.isFirstSession;
            return __awaiter(void 0, void 0, void 0, function () {
                var data, meta, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            data = isFirstSession ? { is_first_session: true } : {};
                            if (!provideMeta) return [3 /*break*/, 2];
                            return [4 /*yield*/, provideMeta()];
                        case 1:
                            _c = _d.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            _c = undefined;
                            _d.label = 3;
                        case 3:
                            meta = _c;
                            return [2 /*return*/, waitForAnswer(sendData(data, 'OPEN_ASSISTANT', meta))];
                    }
                });
            });
        };
        /** вызывает sendSystemMessage, куда подкладывает мету */
        var sendMeta = function (sendSystemMessage, additionalMeta) { return __awaiter(void 0, void 0, void 0, function () {
            var meta, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!provideMeta) return [3 /*break*/, 2];
                        return [4 /*yield*/, provideMeta(additionalMeta)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = {};
                        _b.label = 3;
                    case 3:
                        meta = _a;
                        if (typeof meta !== 'undefined') {
                            sendSystemMessage({
                                data: {},
                                messageName: '',
                            }, false, {
                                meta: meta,
                            });
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        /** отправляет server_action и мету */
        var sendServerAction = function (serverAction, appInfo, messageName) {
            if (messageName === void 0) { messageName = 'SERVER_ACTION'; }
            return __awaiter(void 0, void 0, void 0, function () {
                var messageId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            messageId = protocol.getMessageId();
                            // мету и server_action отправляем в одном systemMessage
                            return [4 /*yield*/, sendMeta(function (data, _, _a) {
                                    var _b = _a === void 0 ? {} : _a, meta = _b.meta;
                                    var systemData = __rest(data, []);
                                    protocol.sendSystemMessage({
                                        // eslint-disable-next-line camelcase
                                        data: __assign(__assign({}, systemData), { app_info: appInfo, server_action: serverAction }),
                                        messageName: messageName || 'SERVER_ACTION',
                                    }, true, messageId, { meta: meta });
                                }, {
                                    source: {
                                        sourceType: 'vps',
                                    },
                                })];
                        case 1:
                            // мету и server_action отправляем в одном systemMessage
                            _a.sent();
                            return [2 /*return*/, messageId];
                    }
                });
            });
        };
        /** отправляет текст и текущую мету */
        var sendText = function (text, isSsml, shouldSendDisableDubbing, additionalMeta) {
            if (isSsml === void 0) { isSsml = false; }
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (text.trim() === '') {
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, protocol.batch(function (_a) {
                            var sendSystemMessage = _a.sendSystemMessage, clientSendText = _a.sendText, sendSettings = _a.sendSettings, messageId = _a.messageId;
                            return __awaiter(void 0, void 0, void 0, function () {
                                var prevDubbing, sendDisableDubbing, isStillNeedReturnDubbing;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, sendMeta(sendSystemMessage, additionalMeta)];
                                        case 1:
                                            _b.sent();
                                            prevDubbing = protocol.configuration.settings.dubbing;
                                            sendDisableDubbing = prevDubbing !== -1 && shouldSendDisableDubbing;
                                            if (!sendDisableDubbing) return [3 /*break*/, 3];
                                            return [4 /*yield*/, sendSettings({ dubbing: -1 }, false)];
                                        case 2:
                                            _b.sent();
                                            _b.label = 3;
                                        case 3:
                                            isSsml ? clientSendText(text, {}, 'application/ssml') : clientSendText(text, {});
                                            isStillNeedReturnDubbing = prevDubbing === protocol.configuration.settings.dubbing;
                                            if (sendDisableDubbing && isStillNeedReturnDubbing) {
                                                sendSettings({ dubbing: prevDubbing });
                                            }
                                            return [2 /*return*/, messageId];
                                    }
                                });
                            });
                        })];
                });
            });
        };
        /** инициализирует исходящий голосовой поток, факт. передает в callback параметры для отправки голоса,
         * отправляет мету */
        var createVoiceStream = function (callback, additionalMeta) {
            return protocol.batch(function (_a) {
                var sendSystemMessage = _a.sendSystemMessage, sendVoice = _a.sendVoice, messageId = _a.messageId;
                return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, sendMeta(sendSystemMessage, additionalMeta)];
                            case 1:
                                _b.sent();
                                return [4 /*yield*/, callback({
                                        sendVoice: sendVoice,
                                        messageId: messageId,
                                        onMessage: function (cb) { return protocol.on('incoming', cb); },
                                    })];
                            case 2:
                                _b.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            });
        };
        var off = protocol.on('incoming', function (message) {
            var _a, _b, _c;
            if (message.voice) {
                emit('voice', message.voice.data || new Uint8Array(), message);
            }
            if ((_a = message.systemMessage) === null || _a === void 0 ? void 0 : _a.data) {
                emit('systemMessage', JSON.parse(message.systemMessage.data), message);
            }
            if (message.status) {
                emit('status', message.status, message);
            }
            if (message.messageName === 'TAKE_HISTORY' && ((_b = message.bytes) === null || _b === void 0 ? void 0 : _b.data)) {
                var history_1 = protoExports.GetHistoryResponse.decode((_c = message.bytes) === null || _c === void 0 ? void 0 : _c.data).historyMessages;
                var parsedHistory = history_1.map(function (historyMessage) { return (__assign(__assign({}, historyMessage), { content: JSON.parse(historyMessage.content || '') })); });
                emit('history', parsedHistory, message);
            }
        });
        return {
            destroy: function () {
                off();
            },
            init: protocol.init,
            createVoiceStream: createVoiceStream,
            sendData: sendData,
            sendMeta: sendMeta,
            sendOpenAssistant: sendOpenAssistant,
            sendServerAction: sendServerAction,
            sendText: sendText,
            sendCancel: sendCancel,
            on: on,
            waitForAnswer: waitForAnswer,
        };
    };

    var RETRY_INTERVAL = 300; // ms
    var defaultWSCreator = function (url) { return new WebSocket(url); };
    var createTransport = function (createWS) {
        if (createWS === void 0) { createWS = defaultWSCreator; }
        var _a = createNanoEvents(), on = _a.on, emit = _a.emit;
        var retryTimeoutId = -1;
        var retries = 0;
        var status = 'closed';
        var webSocket;
        var stopped = true;
        var close = function () {
            stopped = true;
            if (status === 'closing' || status === 'closed') {
                return;
            }
            status = 'closing';
            webSocket === null || webSocket === void 0 ? void 0 : webSocket.close();
        };
        var connect = function (url) {
            status = 'connecting';
            emit('connecting');
            webSocket = createWS(url);
            webSocket.binaryType = 'arraybuffer';
            webSocket.addEventListener('open', function () {
                if (webSocket.readyState !== 1) {
                    return;
                }
                clearTimeout(retryTimeoutId);
                retries = 0;
                status = 'open';
                emit('open');
            });
            webSocket.addEventListener('close', function () {
                status = 'closed';
                emit('close');
            });
            webSocket.addEventListener('error', function (e) {
                if (status !== 'connecting') {
                    throw e;
                }
                // пробуем переподключаться, если возникла ошибка при коннекте
                if (!webSocket || (webSocket.readyState === 3 && !stopped)) {
                    clearTimeout(retryTimeoutId);
                    if (retries < 2) {
                        retryTimeoutId = window.setTimeout(function () {
                            // eslint-disable-next-line @typescript-eslint/no-use-before-define
                            open(url);
                            retries++;
                        }, RETRY_INTERVAL * retries);
                    }
                    else {
                        retries = 0;
                        emit('error', e);
                    }
                }
            });
            webSocket.addEventListener('message', function (_a) {
                var data = _a.data;
                emit('message', data);
            });
        };
        var open = function (url) {
            if (status === 'connecting' || status === 'open') {
                return;
            }
            stopped = false;
            connect(url);
        };
        var reconnect = function (url) {
            if (status === 'closed') {
                open(url);
                return;
            }
            setTimeout(function () { return reconnect(url); });
            close();
        };
        var send = function (data) {
            webSocket.send(data);
        };
        return {
            close: close,
            get isOnline() {
                return window.navigator.onLine;
            },
            on: on,
            open: open,
            reconnect: reconnect,
            send: send,
        };
    };

    var convertToMetaPermissions = function (permission) {
        return Object.keys(permission).map(function (key) { return ({
            type: key,
            status: permission[key],
        }); });
    };
    var getLocation = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    navigator.geolocation.getCurrentPosition(function (_a) {
                        var coords = _a.coords, timestamp = _a.timestamp;
                        resolve({
                            lat: coords.latitude,
                            lon: coords.longitude,
                            accuracy: coords.accuracy,
                            timestamp: timestamp,
                        });
                    }, reject, { timeout: 5000 });
                })];
        });
    }); };
    var getTime = function () { return ({
        // Здесь нужен полифилл, т.к. `Intl.DateTimeFormat().resolvedOptions().timeZone` - возвращает пустую строку
        timezone_id: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezone_offset_sec: -new Date().getTimezoneOffset() * 60,
        timestamp: Date.now(),
    }); };
    var getAnswerForRequestPermissions = function (requestMessageId, appInfo, items) { return __awaiter(void 0, void 0, void 0, function () {
        var permissions, response;
        return __generator(this, function (_a) {
            permissions = {
                record_audio: 'denied_once',
                geo: 'denied_once',
                read_contacts: 'denied_permanently',
                push: 'denied_once',
            };
            response = {
                app_info: appInfo,
                meta: {
                    time: getTime(),
                    permissions: [],
                },
                server_action: {
                    action_id: 'command_response',
                    request_message_id: requestMessageId,
                    command_response: {
                        request_permissions: {
                            permissions: [],
                        },
                    },
                },
            };
            return [2 /*return*/, Promise.all(items.map(function (permission) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, location_1;
                    var _c, _d, _e;
                    return __generator(this, function (_f) {
                        switch (_f.label) {
                            case 0:
                                _a = permission;
                                switch (_a) {
                                    case 'geo': return [3 /*break*/, 1];
                                }
                                return [3 /*break*/, 5];
                            case 1:
                                _f.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, getLocation()];
                            case 2:
                                location_1 = _f.sent();
                                permissions.geo = 'granted';
                                response.meta.location = location_1;
                                (_c = response.server_action.command_response.request_permissions) === null || _c === void 0 ? void 0 : _c.permissions.push({
                                    type: 'geo',
                                    status: 'granted',
                                });
                                return [3 /*break*/, 4];
                            case 3:
                                _f.sent();
                                permissions.geo = 'denied_permanently';
                                (_d = response.server_action.command_response.request_permissions) === null || _d === void 0 ? void 0 : _d.permissions.push({
                                    type: 'geo',
                                    status: 'denied_permanently',
                                });
                                return [3 /*break*/, 4];
                            case 4: return [3 /*break*/, 6];
                            case 5:
                                // остальные доступы не поддерживаем
                                (_e = response.server_action.command_response.request_permissions) === null || _e === void 0 ? void 0 : _e.permissions.push({
                                    type: permission,
                                    status: 'denied_permanently',
                                });
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); })).then(function () {
                    response.meta.permissions = convertToMetaPermissions(permissions);
                    return response;
                })];
        });
    }); };

    var mtt = {exports: {}};

    /*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/

    (function (module) {
    	(function(global, factory) { /* global define, require, module */

    	    /* AMD */ if (typeof commonjsRequire === 'function' && 'object' === 'object' && module && module.exports)
    	        module.exports = factory(requireMinimal());

    	})(commonjsGlobal, function($protobuf) {

    	    // Common aliases
    	    var $Reader = $protobuf.Reader, $util = $protobuf.util;
    	    
    	    // Exported root namespace
    	    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    	    
    	    $root.Music2TrackProtocol = (function() {
    	    
    	        /**
    	         * Namespace Music2TrackProtocol.
    	         * @exports Music2TrackProtocol
    	         * @namespace
    	         */
    	        var Music2TrackProtocol = {};
    	    
    	        Music2TrackProtocol.DecoderResult = (function() {
    	    
    	            /**
    	             * Properties of a DecoderResult.
    	             * @memberof Music2TrackProtocol
    	             * @interface IDecoderResult
    	             * @property {string|null} [result] DecoderResult result
    	             * @property {boolean|null} [isMusicFound] DecoderResult isMusicFound
    	             * @property {boolean|null} [isFinal] DecoderResult isFinal
    	             */
    	    
    	            /**
    	             * Constructs a new DecoderResult.
    	             * @memberof Music2TrackProtocol
    	             * @classdesc Represents a DecoderResult.
    	             * @implements IDecoderResult
    	             * @constructor
    	             * @param {Music2TrackProtocol.IDecoderResult=} [properties] Properties to set
    	             */
    	            function DecoderResult(properties) {
    	                if (properties)
    	                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                        if (properties[keys[i]] != null)
    	                            this[keys[i]] = properties[keys[i]];
    	            }
    	    
    	            /**
    	             * DecoderResult result.
    	             * @member {string} result
    	             * @memberof Music2TrackProtocol.DecoderResult
    	             * @instance
    	             */
    	            DecoderResult.prototype.result = "";
    	    
    	            /**
    	             * DecoderResult isMusicFound.
    	             * @member {boolean} isMusicFound
    	             * @memberof Music2TrackProtocol.DecoderResult
    	             * @instance
    	             */
    	            DecoderResult.prototype.isMusicFound = false;
    	    
    	            /**
    	             * DecoderResult isFinal.
    	             * @member {boolean} isFinal
    	             * @memberof Music2TrackProtocol.DecoderResult
    	             * @instance
    	             */
    	            DecoderResult.prototype.isFinal = false;
    	    
    	            /**
    	             * Decodes a DecoderResult message from the specified reader or buffer.
    	             * @function decode
    	             * @memberof Music2TrackProtocol.DecoderResult
    	             * @static
    	             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	             * @param {number} [length] Message length if known beforehand
    	             * @returns {Music2TrackProtocol.DecoderResult} DecoderResult
    	             * @throws {Error} If the payload is not a reader or valid buffer
    	             * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	             */
    	            DecoderResult.decode = function decode(reader, length) {
    	                if (!(reader instanceof $Reader))
    	                    reader = $Reader.create(reader);
    	                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Music2TrackProtocol.DecoderResult();
    	                while (reader.pos < end) {
    	                    var tag = reader.uint32();
    	                    switch (tag >>> 3) {
    	                    case 1: {
    	                            message.result = reader.string();
    	                            break;
    	                        }
    	                    case 2: {
    	                            message.isMusicFound = reader.bool();
    	                            break;
    	                        }
    	                    case 3: {
    	                            message.isFinal = reader.bool();
    	                            break;
    	                        }
    	                    default:
    	                        reader.skipType(tag & 7);
    	                        break;
    	                    }
    	                }
    	                return message;
    	            };
    	    
    	            return DecoderResult;
    	        })();
    	    
    	        Music2TrackProtocol.ErrorResponse = (function() {
    	    
    	            /**
    	             * Properties of an ErrorResponse.
    	             * @memberof Music2TrackProtocol
    	             * @interface IErrorResponse
    	             * @property {string|null} [errorMessage] ErrorResponse errorMessage
    	             * @property {number|null} [errorCode] ErrorResponse errorCode
    	             */
    	    
    	            /**
    	             * Constructs a new ErrorResponse.
    	             * @memberof Music2TrackProtocol
    	             * @classdesc Represents an ErrorResponse.
    	             * @implements IErrorResponse
    	             * @constructor
    	             * @param {Music2TrackProtocol.IErrorResponse=} [properties] Properties to set
    	             */
    	            function ErrorResponse(properties) {
    	                if (properties)
    	                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                        if (properties[keys[i]] != null)
    	                            this[keys[i]] = properties[keys[i]];
    	            }
    	    
    	            /**
    	             * ErrorResponse errorMessage.
    	             * @member {string} errorMessage
    	             * @memberof Music2TrackProtocol.ErrorResponse
    	             * @instance
    	             */
    	            ErrorResponse.prototype.errorMessage = "";
    	    
    	            /**
    	             * ErrorResponse errorCode.
    	             * @member {number} errorCode
    	             * @memberof Music2TrackProtocol.ErrorResponse
    	             * @instance
    	             */
    	            ErrorResponse.prototype.errorCode = 0;
    	    
    	            /**
    	             * Decodes an ErrorResponse message from the specified reader or buffer.
    	             * @function decode
    	             * @memberof Music2TrackProtocol.ErrorResponse
    	             * @static
    	             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	             * @param {number} [length] Message length if known beforehand
    	             * @returns {Music2TrackProtocol.ErrorResponse} ErrorResponse
    	             * @throws {Error} If the payload is not a reader or valid buffer
    	             * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	             */
    	            ErrorResponse.decode = function decode(reader, length) {
    	                if (!(reader instanceof $Reader))
    	                    reader = $Reader.create(reader);
    	                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Music2TrackProtocol.ErrorResponse();
    	                while (reader.pos < end) {
    	                    var tag = reader.uint32();
    	                    switch (tag >>> 3) {
    	                    case 1: {
    	                            message.errorMessage = reader.string();
    	                            break;
    	                        }
    	                    case 2: {
    	                            message.errorCode = reader.int32();
    	                            break;
    	                        }
    	                    default:
    	                        reader.skipType(tag & 7);
    	                        break;
    	                    }
    	                }
    	                return message;
    	            };
    	    
    	            return ErrorResponse;
    	        })();
    	    
    	        Music2TrackProtocol.MttResponse = (function() {
    	    
    	            /**
    	             * Properties of a MttResponse.
    	             * @memberof Music2TrackProtocol
    	             * @interface IMttResponse
    	             * @property {Music2TrackProtocol.IDecoderResult|null} [decoderResultField] MttResponse decoderResultField
    	             * @property {Music2TrackProtocol.IErrorResponse|null} [errorResponse] MttResponse errorResponse
    	             */
    	    
    	            /**
    	             * Constructs a new MttResponse.
    	             * @memberof Music2TrackProtocol
    	             * @classdesc Represents a MttResponse.
    	             * @implements IMttResponse
    	             * @constructor
    	             * @param {Music2TrackProtocol.IMttResponse=} [properties] Properties to set
    	             */
    	            function MttResponse(properties) {
    	                if (properties)
    	                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                        if (properties[keys[i]] != null)
    	                            this[keys[i]] = properties[keys[i]];
    	            }
    	    
    	            /**
    	             * MttResponse decoderResultField.
    	             * @member {Music2TrackProtocol.IDecoderResult|null|undefined} decoderResultField
    	             * @memberof Music2TrackProtocol.MttResponse
    	             * @instance
    	             */
    	            MttResponse.prototype.decoderResultField = null;
    	    
    	            /**
    	             * MttResponse errorResponse.
    	             * @member {Music2TrackProtocol.IErrorResponse|null|undefined} errorResponse
    	             * @memberof Music2TrackProtocol.MttResponse
    	             * @instance
    	             */
    	            MttResponse.prototype.errorResponse = null;
    	    
    	            // OneOf field names bound to virtual getters and setters
    	            var $oneOfFields;
    	    
    	            /**
    	             * MttResponse MessageType.
    	             * @member {"decoderResultField"|"errorResponse"|undefined} MessageType
    	             * @memberof Music2TrackProtocol.MttResponse
    	             * @instance
    	             */
    	            Object.defineProperty(MttResponse.prototype, "MessageType", {
    	                get: $util.oneOfGetter($oneOfFields = ["decoderResultField", "errorResponse"]),
    	                set: $util.oneOfSetter($oneOfFields)
    	            });
    	    
    	            /**
    	             * Decodes a MttResponse message from the specified reader or buffer.
    	             * @function decode
    	             * @memberof Music2TrackProtocol.MttResponse
    	             * @static
    	             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	             * @param {number} [length] Message length if known beforehand
    	             * @returns {Music2TrackProtocol.MttResponse} MttResponse
    	             * @throws {Error} If the payload is not a reader or valid buffer
    	             * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	             */
    	            MttResponse.decode = function decode(reader, length) {
    	                if (!(reader instanceof $Reader))
    	                    reader = $Reader.create(reader);
    	                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Music2TrackProtocol.MttResponse();
    	                while (reader.pos < end) {
    	                    var tag = reader.uint32();
    	                    switch (tag >>> 3) {
    	                    case 1: {
    	                            message.decoderResultField = $root.Music2TrackProtocol.DecoderResult.decode(reader, reader.uint32());
    	                            break;
    	                        }
    	                    case 2: {
    	                            message.errorResponse = $root.Music2TrackProtocol.ErrorResponse.decode(reader, reader.uint32());
    	                            break;
    	                        }
    	                    default:
    	                        reader.skipType(tag & 7);
    	                        break;
    	                    }
    	                }
    	                return message;
    	            };
    	    
    	            return MttResponse;
    	        })();
    	    
    	        return Music2TrackProtocol;
    	    })();

    	    return $root;
    	}); 
    } (mtt));

    var mttExports = mtt.exports;

    var createMusicRecognizer = function (voiceListener) {
        var off;
        var status = 'inactive';
        var currentMessageId;
        var stop = function () {
            if (voiceListener.status !== 'stopped') {
                status = 'inactive';
                voiceListener.stop();
            }
        };
        var start = function (_a) {
            var sendVoice = _a.sendVoice, messageId = _a.messageId, onMessage = _a.onMessage;
            return voiceListener
                .listen(function (data, last) { return !last && sendVoice(data, last, MessageNames.MUSIC_RECOGNITION); })
                .then(function () {
                status = 'active';
                currentMessageId = messageId;
                off = onMessage(function (message) {
                    var _a, _b;
                    if (message.status && message.status.code != null && message.status.code < 0) {
                        off();
                        stop();
                    }
                    if (message.messageId === messageId &&
                        message.messageName.toUpperCase() === MessageNames.MUSIC_RECOGNITION) {
                        if (!((_b = (_a = message.bytes) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.length)) {
                            return;
                        }
                        var _c = mttExports.Music2TrackProtocol.MttResponse.decode(message.bytes.data), decoderResultField = _c.decoderResultField, errorResponse = _c.errorResponse;
                        if ((decoderResultField === null || decoderResultField === void 0 ? void 0 : decoderResultField.isFinal) || errorResponse) {
                            off();
                            stop();
                        }
                    }
                });
            });
        };
        return {
            start: start,
            stop: stop,
            get status() {
                return status;
            },
            get messageId() {
                return currentMessageId;
            },
        };
    };

    var asr = {exports: {}};

    /*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/

    (function (module) {
    	(function(global, factory) { /* global define, require, module */

    	    /* AMD */ if (typeof commonjsRequire === 'function' && 'object' === 'object' && module && module.exports)
    	        module.exports = factory(requireMinimal());

    	})(commonjsGlobal, function($protobuf) {

    	    // Common aliases
    	    var $Reader = $protobuf.Reader, $util = $protobuf.util;
    	    
    	    // Exported root namespace
    	    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    	    
    	    $root.Variables = (function() {
    	    
    	        /**
    	         * Properties of a Variables.
    	         * @exports IVariables
    	         * @interface IVariables
    	         * @property {Object.<string,string>|null} [variables] Variables variables
    	         */
    	    
    	        /**
    	         * Constructs a new Variables.
    	         * @exports Variables
    	         * @classdesc Represents a Variables.
    	         * @implements IVariables
    	         * @constructor
    	         * @param {IVariables=} [properties] Properties to set
    	         */
    	        function Variables(properties) {
    	            this.variables = {};
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Variables variables.
    	         * @member {Object.<string,string>} variables
    	         * @memberof Variables
    	         * @instance
    	         */
    	        Variables.prototype.variables = $util.emptyObject;
    	    
    	        /**
    	         * Decodes a Variables message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Variables
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Variables} Variables
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Variables.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Variables(), key, value;
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        if (message.variables === $util.emptyObject)
    	                            message.variables = {};
    	                        var end2 = reader.uint32() + reader.pos;
    	                        key = "";
    	                        value = "";
    	                        while (reader.pos < end2) {
    	                            var tag2 = reader.uint32();
    	                            switch (tag2 >>> 3) {
    	                            case 1:
    	                                key = reader.string();
    	                                break;
    	                            case 2:
    	                                value = reader.string();
    	                                break;
    	                            default:
    	                                reader.skipType(tag2 & 7);
    	                                break;
    	                            }
    	                        }
    	                        message.variables[key] = value;
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Variables;
    	    })();
    	    
    	    $root.UndecodedSeconds = (function() {
    	    
    	        /**
    	         * Properties of an UndecodedSeconds.
    	         * @exports IUndecodedSeconds
    	         * @interface IUndecodedSeconds
    	         * @property {number|null} [undecodedSeconds] UndecodedSeconds undecodedSeconds
    	         */
    	    
    	        /**
    	         * Constructs a new UndecodedSeconds.
    	         * @exports UndecodedSeconds
    	         * @classdesc Represents an UndecodedSeconds.
    	         * @implements IUndecodedSeconds
    	         * @constructor
    	         * @param {IUndecodedSeconds=} [properties] Properties to set
    	         */
    	        function UndecodedSeconds(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * UndecodedSeconds undecodedSeconds.
    	         * @member {number} undecodedSeconds
    	         * @memberof UndecodedSeconds
    	         * @instance
    	         */
    	        UndecodedSeconds.prototype.undecodedSeconds = 0;
    	    
    	        /**
    	         * Decodes an UndecodedSeconds message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof UndecodedSeconds
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {UndecodedSeconds} UndecodedSeconds
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        UndecodedSeconds.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.UndecodedSeconds();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.undecodedSeconds = reader.float();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return UndecodedSeconds;
    	    })();
    	    
    	    $root.FullyFinalized = (function() {
    	    
    	        /**
    	         * Properties of a FullyFinalized.
    	         * @exports IFullyFinalized
    	         * @interface IFullyFinalized
    	         */
    	    
    	        /**
    	         * Constructs a new FullyFinalized.
    	         * @exports FullyFinalized
    	         * @classdesc Represents a FullyFinalized.
    	         * @implements IFullyFinalized
    	         * @constructor
    	         * @param {IFullyFinalized=} [properties] Properties to set
    	         */
    	        function FullyFinalized(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Decodes a FullyFinalized message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof FullyFinalized
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {FullyFinalized} FullyFinalized
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        FullyFinalized.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.FullyFinalized();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return FullyFinalized;
    	    })();
    	    
    	    $root.EmotionResult = (function() {
    	    
    	        /**
    	         * Properties of an EmotionResult.
    	         * @exports IEmotionResult
    	         * @interface IEmotionResult
    	         * @property {string|null} [name] EmotionResult name
    	         * @property {number|null} [confidence] EmotionResult confidence
    	         */
    	    
    	        /**
    	         * Constructs a new EmotionResult.
    	         * @exports EmotionResult
    	         * @classdesc Represents an EmotionResult.
    	         * @implements IEmotionResult
    	         * @constructor
    	         * @param {IEmotionResult=} [properties] Properties to set
    	         */
    	        function EmotionResult(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * EmotionResult name.
    	         * @member {string} name
    	         * @memberof EmotionResult
    	         * @instance
    	         */
    	        EmotionResult.prototype.name = "";
    	    
    	        /**
    	         * EmotionResult confidence.
    	         * @member {number} confidence
    	         * @memberof EmotionResult
    	         * @instance
    	         */
    	        EmotionResult.prototype.confidence = 0;
    	    
    	        /**
    	         * Decodes an EmotionResult message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof EmotionResult
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {EmotionResult} EmotionResult
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        EmotionResult.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.EmotionResult();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.name = reader.string();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.confidence = reader.float();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return EmotionResult;
    	    })();
    	    
    	    $root.Hypothesis = (function() {
    	    
    	        /**
    	         * Properties of a Hypothesis.
    	         * @exports IHypothesis
    	         * @interface IHypothesis
    	         * @property {string|null} [words] Hypothesis words
    	         * @property {number|null} [acousticCost] Hypothesis acousticCost
    	         * @property {number|null} [linguisticCost] Hypothesis linguisticCost
    	         * @property {number|null} [finalCost] Hypothesis finalCost
    	         * @property {number|null} [phraseStart] Hypothesis phraseStart
    	         * @property {number|null} [phraseEnd] Hypothesis phraseEnd
    	         * @property {string|null} [normalizedText] Hypothesis normalizedText
    	         */
    	    
    	        /**
    	         * Constructs a new Hypothesis.
    	         * @exports Hypothesis
    	         * @classdesc Represents a Hypothesis.
    	         * @implements IHypothesis
    	         * @constructor
    	         * @param {IHypothesis=} [properties] Properties to set
    	         */
    	        function Hypothesis(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * Hypothesis words.
    	         * @member {string} words
    	         * @memberof Hypothesis
    	         * @instance
    	         */
    	        Hypothesis.prototype.words = "";
    	    
    	        /**
    	         * Hypothesis acousticCost.
    	         * @member {number} acousticCost
    	         * @memberof Hypothesis
    	         * @instance
    	         */
    	        Hypothesis.prototype.acousticCost = 0;
    	    
    	        /**
    	         * Hypothesis linguisticCost.
    	         * @member {number} linguisticCost
    	         * @memberof Hypothesis
    	         * @instance
    	         */
    	        Hypothesis.prototype.linguisticCost = 0;
    	    
    	        /**
    	         * Hypothesis finalCost.
    	         * @member {number} finalCost
    	         * @memberof Hypothesis
    	         * @instance
    	         */
    	        Hypothesis.prototype.finalCost = 0;
    	    
    	        /**
    	         * Hypothesis phraseStart.
    	         * @member {number} phraseStart
    	         * @memberof Hypothesis
    	         * @instance
    	         */
    	        Hypothesis.prototype.phraseStart = 0;
    	    
    	        /**
    	         * Hypothesis phraseEnd.
    	         * @member {number} phraseEnd
    	         * @memberof Hypothesis
    	         * @instance
    	         */
    	        Hypothesis.prototype.phraseEnd = 0;
    	    
    	        /**
    	         * Hypothesis normalizedText.
    	         * @member {string} normalizedText
    	         * @memberof Hypothesis
    	         * @instance
    	         */
    	        Hypothesis.prototype.normalizedText = "";
    	    
    	        /**
    	         * Decodes a Hypothesis message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof Hypothesis
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {Hypothesis} Hypothesis
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        Hypothesis.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Hypothesis();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.words = reader.string();
    	                        break;
    	                    }
    	                case 2: {
    	                        message.acousticCost = reader.float();
    	                        break;
    	                    }
    	                case 3: {
    	                        message.linguisticCost = reader.float();
    	                        break;
    	                    }
    	                case 4: {
    	                        message.finalCost = reader.float();
    	                        break;
    	                    }
    	                case 5: {
    	                        message.phraseStart = reader.float();
    	                        break;
    	                    }
    	                case 6: {
    	                        message.phraseEnd = reader.float();
    	                        break;
    	                    }
    	                case 7: {
    	                        message.normalizedText = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return Hypothesis;
    	    })();
    	    
    	    $root.DecoderResult = (function() {
    	    
    	        /**
    	         * Properties of a DecoderResult.
    	         * @exports IDecoderResult
    	         * @interface IDecoderResult
    	         * @property {Array.<IHypothesis>|null} [hypothesis] DecoderResult hypothesis
    	         * @property {number|null} [chunkStart] DecoderResult chunkStart
    	         * @property {number|null} [chunkEnd] DecoderResult chunkEnd
    	         * @property {number|null} [timeEndpointDetectionMs] DecoderResult timeEndpointDetectionMs
    	         * @property {number|null} [timeDecodingMs] DecoderResult timeDecodingMs
    	         * @property {IVariables|null} [variables] DecoderResult variables
    	         * @property {boolean|null} [isFinal] DecoderResult isFinal
    	         * @property {Array.<IEmotionResult>|null} [emotionResult] DecoderResult emotionResult
    	         * @property {Array.<DecoderResult.IContextAnswer>|null} [contextAnswer] DecoderResult contextAnswer
    	         */
    	    
    	        /**
    	         * Constructs a new DecoderResult.
    	         * @exports DecoderResult
    	         * @classdesc Represents a DecoderResult.
    	         * @implements IDecoderResult
    	         * @constructor
    	         * @param {IDecoderResult=} [properties] Properties to set
    	         */
    	        function DecoderResult(properties) {
    	            this.hypothesis = [];
    	            this.emotionResult = [];
    	            this.contextAnswer = [];
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * DecoderResult hypothesis.
    	         * @member {Array.<IHypothesis>} hypothesis
    	         * @memberof DecoderResult
    	         * @instance
    	         */
    	        DecoderResult.prototype.hypothesis = $util.emptyArray;
    	    
    	        /**
    	         * DecoderResult chunkStart.
    	         * @member {number} chunkStart
    	         * @memberof DecoderResult
    	         * @instance
    	         */
    	        DecoderResult.prototype.chunkStart = 0;
    	    
    	        /**
    	         * DecoderResult chunkEnd.
    	         * @member {number} chunkEnd
    	         * @memberof DecoderResult
    	         * @instance
    	         */
    	        DecoderResult.prototype.chunkEnd = 0;
    	    
    	        /**
    	         * DecoderResult timeEndpointDetectionMs.
    	         * @member {number} timeEndpointDetectionMs
    	         * @memberof DecoderResult
    	         * @instance
    	         */
    	        DecoderResult.prototype.timeEndpointDetectionMs = 0;
    	    
    	        /**
    	         * DecoderResult timeDecodingMs.
    	         * @member {number} timeDecodingMs
    	         * @memberof DecoderResult
    	         * @instance
    	         */
    	        DecoderResult.prototype.timeDecodingMs = 0;
    	    
    	        /**
    	         * DecoderResult variables.
    	         * @member {IVariables|null|undefined} variables
    	         * @memberof DecoderResult
    	         * @instance
    	         */
    	        DecoderResult.prototype.variables = null;
    	    
    	        /**
    	         * DecoderResult isFinal.
    	         * @member {boolean} isFinal
    	         * @memberof DecoderResult
    	         * @instance
    	         */
    	        DecoderResult.prototype.isFinal = false;
    	    
    	        /**
    	         * DecoderResult emotionResult.
    	         * @member {Array.<IEmotionResult>} emotionResult
    	         * @memberof DecoderResult
    	         * @instance
    	         */
    	        DecoderResult.prototype.emotionResult = $util.emptyArray;
    	    
    	        /**
    	         * DecoderResult contextAnswer.
    	         * @member {Array.<DecoderResult.IContextAnswer>} contextAnswer
    	         * @memberof DecoderResult
    	         * @instance
    	         */
    	        DecoderResult.prototype.contextAnswer = $util.emptyArray;
    	    
    	        /**
    	         * Decodes a DecoderResult message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof DecoderResult
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {DecoderResult} DecoderResult
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        DecoderResult.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.DecoderResult();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        if (!(message.hypothesis && message.hypothesis.length))
    	                            message.hypothesis = [];
    	                        message.hypothesis.push($root.Hypothesis.decode(reader, reader.uint32()));
    	                        break;
    	                    }
    	                case 2: {
    	                        message.chunkStart = reader.float();
    	                        break;
    	                    }
    	                case 3: {
    	                        message.chunkEnd = reader.float();
    	                        break;
    	                    }
    	                case 4: {
    	                        message.timeEndpointDetectionMs = reader.float();
    	                        break;
    	                    }
    	                case 5: {
    	                        message.timeDecodingMs = reader.float();
    	                        break;
    	                    }
    	                case 6: {
    	                        message.variables = $root.Variables.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 7: {
    	                        message.isFinal = reader.bool();
    	                        break;
    	                    }
    	                case 8: {
    	                        if (!(message.emotionResult && message.emotionResult.length))
    	                            message.emotionResult = [];
    	                        message.emotionResult.push($root.EmotionResult.decode(reader, reader.uint32()));
    	                        break;
    	                    }
    	                case 9: {
    	                        if (!(message.contextAnswer && message.contextAnswer.length))
    	                            message.contextAnswer = [];
    	                        message.contextAnswer.push($root.DecoderResult.ContextAnswer.decode(reader, reader.uint32()));
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        DecoderResult.ContextAnswer = (function() {
    	    
    	            /**
    	             * Properties of a ContextAnswer.
    	             * @memberof DecoderResult
    	             * @interface IContextAnswer
    	             * @property {Array.<DecoderResult.ContextAnswer.IContextRef>|null} [contextResult] ContextAnswer contextResult
    	             */
    	    
    	            /**
    	             * Constructs a new ContextAnswer.
    	             * @memberof DecoderResult
    	             * @classdesc Represents a ContextAnswer.
    	             * @implements IContextAnswer
    	             * @constructor
    	             * @param {DecoderResult.IContextAnswer=} [properties] Properties to set
    	             */
    	            function ContextAnswer(properties) {
    	                this.contextResult = [];
    	                if (properties)
    	                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                        if (properties[keys[i]] != null)
    	                            this[keys[i]] = properties[keys[i]];
    	            }
    	    
    	            /**
    	             * ContextAnswer contextResult.
    	             * @member {Array.<DecoderResult.ContextAnswer.IContextRef>} contextResult
    	             * @memberof DecoderResult.ContextAnswer
    	             * @instance
    	             */
    	            ContextAnswer.prototype.contextResult = $util.emptyArray;
    	    
    	            /**
    	             * Decodes a ContextAnswer message from the specified reader or buffer.
    	             * @function decode
    	             * @memberof DecoderResult.ContextAnswer
    	             * @static
    	             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	             * @param {number} [length] Message length if known beforehand
    	             * @returns {DecoderResult.ContextAnswer} ContextAnswer
    	             * @throws {Error} If the payload is not a reader or valid buffer
    	             * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	             */
    	            ContextAnswer.decode = function decode(reader, length) {
    	                if (!(reader instanceof $Reader))
    	                    reader = $Reader.create(reader);
    	                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.DecoderResult.ContextAnswer();
    	                while (reader.pos < end) {
    	                    var tag = reader.uint32();
    	                    switch (tag >>> 3) {
    	                    case 1: {
    	                            if (!(message.contextResult && message.contextResult.length))
    	                                message.contextResult = [];
    	                            message.contextResult.push($root.DecoderResult.ContextAnswer.ContextRef.decode(reader, reader.uint32()));
    	                            break;
    	                        }
    	                    default:
    	                        reader.skipType(tag & 7);
    	                        break;
    	                    }
    	                }
    	                return message;
    	            };
    	    
    	            ContextAnswer.ContextRef = (function() {
    	    
    	                /**
    	                 * Properties of a ContextRef.
    	                 * @memberof DecoderResult.ContextAnswer
    	                 * @interface IContextRef
    	                 * @property {string|null} [id] ContextRef id
    	                 * @property {number|null} [index] ContextRef index
    	                 * @property {string|null} [originalValue] ContextRef originalValue
    	                 * @property {string|null} [predictedValue] ContextRef predictedValue
    	                 * @property {number|null} [score] ContextRef score
    	                 */
    	    
    	                /**
    	                 * Constructs a new ContextRef.
    	                 * @memberof DecoderResult.ContextAnswer
    	                 * @classdesc Represents a ContextRef.
    	                 * @implements IContextRef
    	                 * @constructor
    	                 * @param {DecoderResult.ContextAnswer.IContextRef=} [properties] Properties to set
    	                 */
    	                function ContextRef(properties) {
    	                    if (properties)
    	                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                            if (properties[keys[i]] != null)
    	                                this[keys[i]] = properties[keys[i]];
    	                }
    	    
    	                /**
    	                 * ContextRef id.
    	                 * @member {string} id
    	                 * @memberof DecoderResult.ContextAnswer.ContextRef
    	                 * @instance
    	                 */
    	                ContextRef.prototype.id = "";
    	    
    	                /**
    	                 * ContextRef index.
    	                 * @member {number} index
    	                 * @memberof DecoderResult.ContextAnswer.ContextRef
    	                 * @instance
    	                 */
    	                ContextRef.prototype.index = 0;
    	    
    	                /**
    	                 * ContextRef originalValue.
    	                 * @member {string} originalValue
    	                 * @memberof DecoderResult.ContextAnswer.ContextRef
    	                 * @instance
    	                 */
    	                ContextRef.prototype.originalValue = "";
    	    
    	                /**
    	                 * ContextRef predictedValue.
    	                 * @member {string} predictedValue
    	                 * @memberof DecoderResult.ContextAnswer.ContextRef
    	                 * @instance
    	                 */
    	                ContextRef.prototype.predictedValue = "";
    	    
    	                /**
    	                 * ContextRef score.
    	                 * @member {number} score
    	                 * @memberof DecoderResult.ContextAnswer.ContextRef
    	                 * @instance
    	                 */
    	                ContextRef.prototype.score = 0;
    	    
    	                /**
    	                 * Decodes a ContextRef message from the specified reader or buffer.
    	                 * @function decode
    	                 * @memberof DecoderResult.ContextAnswer.ContextRef
    	                 * @static
    	                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	                 * @param {number} [length] Message length if known beforehand
    	                 * @returns {DecoderResult.ContextAnswer.ContextRef} ContextRef
    	                 * @throws {Error} If the payload is not a reader or valid buffer
    	                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	                 */
    	                ContextRef.decode = function decode(reader, length) {
    	                    if (!(reader instanceof $Reader))
    	                        reader = $Reader.create(reader);
    	                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.DecoderResult.ContextAnswer.ContextRef();
    	                    while (reader.pos < end) {
    	                        var tag = reader.uint32();
    	                        switch (tag >>> 3) {
    	                        case 1: {
    	                                message.id = reader.string();
    	                                break;
    	                            }
    	                        case 2: {
    	                                message.index = reader.int32();
    	                                break;
    	                            }
    	                        case 3: {
    	                                message.originalValue = reader.string();
    	                                break;
    	                            }
    	                        case 4: {
    	                                message.predictedValue = reader.string();
    	                                break;
    	                            }
    	                        case 5: {
    	                                message.score = reader.float();
    	                                break;
    	                            }
    	                        default:
    	                            reader.skipType(tag & 7);
    	                            break;
    	                        }
    	                    }
    	                    return message;
    	                };
    	    
    	                return ContextRef;
    	            })();
    	    
    	            return ContextAnswer;
    	        })();
    	    
    	        return DecoderResult;
    	    })();
    	    
    	    $root.ErrorResponse = (function() {
    	    
    	        /**
    	         * Properties of an ErrorResponse.
    	         * @exports IErrorResponse
    	         * @interface IErrorResponse
    	         * @property {string|null} [errorMessage] ErrorResponse errorMessage
    	         */
    	    
    	        /**
    	         * Constructs a new ErrorResponse.
    	         * @exports ErrorResponse
    	         * @classdesc Represents an ErrorResponse.
    	         * @implements IErrorResponse
    	         * @constructor
    	         * @param {IErrorResponse=} [properties] Properties to set
    	         */
    	        function ErrorResponse(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * ErrorResponse errorMessage.
    	         * @member {string} errorMessage
    	         * @memberof ErrorResponse
    	         * @instance
    	         */
    	        ErrorResponse.prototype.errorMessage = "";
    	    
    	        /**
    	         * Decodes an ErrorResponse message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof ErrorResponse
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {ErrorResponse} ErrorResponse
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        ErrorResponse.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ErrorResponse();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.errorMessage = reader.string();
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return ErrorResponse;
    	    })();
    	    
    	    $root.PacketWrapperFromServer = (function() {
    	    
    	        /**
    	         * Properties of a PacketWrapperFromServer.
    	         * @exports IPacketWrapperFromServer
    	         * @interface IPacketWrapperFromServer
    	         * @property {IUndecodedSeconds|null} [undecodedSecondsField] PacketWrapperFromServer undecodedSecondsField
    	         * @property {IFullyFinalized|null} [fullyFinalizedField] PacketWrapperFromServer fullyFinalizedField
    	         * @property {IDecoderResult|null} [decoderResultField] PacketWrapperFromServer decoderResultField
    	         * @property {IErrorResponse|null} [errorResponse] PacketWrapperFromServer errorResponse
    	         */
    	    
    	        /**
    	         * Constructs a new PacketWrapperFromServer.
    	         * @exports PacketWrapperFromServer
    	         * @classdesc Represents a PacketWrapperFromServer.
    	         * @implements IPacketWrapperFromServer
    	         * @constructor
    	         * @param {IPacketWrapperFromServer=} [properties] Properties to set
    	         */
    	        function PacketWrapperFromServer(properties) {
    	            if (properties)
    	                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
    	                    if (properties[keys[i]] != null)
    	                        this[keys[i]] = properties[keys[i]];
    	        }
    	    
    	        /**
    	         * PacketWrapperFromServer undecodedSecondsField.
    	         * @member {IUndecodedSeconds|null|undefined} undecodedSecondsField
    	         * @memberof PacketWrapperFromServer
    	         * @instance
    	         */
    	        PacketWrapperFromServer.prototype.undecodedSecondsField = null;
    	    
    	        /**
    	         * PacketWrapperFromServer fullyFinalizedField.
    	         * @member {IFullyFinalized|null|undefined} fullyFinalizedField
    	         * @memberof PacketWrapperFromServer
    	         * @instance
    	         */
    	        PacketWrapperFromServer.prototype.fullyFinalizedField = null;
    	    
    	        /**
    	         * PacketWrapperFromServer decoderResultField.
    	         * @member {IDecoderResult|null|undefined} decoderResultField
    	         * @memberof PacketWrapperFromServer
    	         * @instance
    	         */
    	        PacketWrapperFromServer.prototype.decoderResultField = null;
    	    
    	        /**
    	         * PacketWrapperFromServer errorResponse.
    	         * @member {IErrorResponse|null|undefined} errorResponse
    	         * @memberof PacketWrapperFromServer
    	         * @instance
    	         */
    	        PacketWrapperFromServer.prototype.errorResponse = null;
    	    
    	        // OneOf field names bound to virtual getters and setters
    	        var $oneOfFields;
    	    
    	        /**
    	         * PacketWrapperFromServer MessageType.
    	         * @member {"undecodedSecondsField"|"fullyFinalizedField"|"decoderResultField"|"errorResponse"|undefined} MessageType
    	         * @memberof PacketWrapperFromServer
    	         * @instance
    	         */
    	        Object.defineProperty(PacketWrapperFromServer.prototype, "MessageType", {
    	            get: $util.oneOfGetter($oneOfFields = ["undecodedSecondsField", "fullyFinalizedField", "decoderResultField", "errorResponse"]),
    	            set: $util.oneOfSetter($oneOfFields)
    	        });
    	    
    	        /**
    	         * Decodes a PacketWrapperFromServer message from the specified reader or buffer.
    	         * @function decode
    	         * @memberof PacketWrapperFromServer
    	         * @static
    	         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
    	         * @param {number} [length] Message length if known beforehand
    	         * @returns {PacketWrapperFromServer} PacketWrapperFromServer
    	         * @throws {Error} If the payload is not a reader or valid buffer
    	         * @throws {$protobuf.util.ProtocolError} If required fields are missing
    	         */
    	        PacketWrapperFromServer.decode = function decode(reader, length) {
    	            if (!(reader instanceof $Reader))
    	                reader = $Reader.create(reader);
    	            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PacketWrapperFromServer();
    	            while (reader.pos < end) {
    	                var tag = reader.uint32();
    	                switch (tag >>> 3) {
    	                case 1: {
    	                        message.undecodedSecondsField = $root.UndecodedSeconds.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 2: {
    	                        message.fullyFinalizedField = $root.FullyFinalized.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 4: {
    	                        message.decoderResultField = $root.DecoderResult.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                case 8: {
    	                        message.errorResponse = $root.ErrorResponse.decode(reader, reader.uint32());
    	                        break;
    	                    }
    	                default:
    	                    reader.skipType(tag & 7);
    	                    break;
    	                }
    	            }
    	            return message;
    	        };
    	    
    	        return PacketWrapperFromServer;
    	    })();

    	    return $root;
    	}); 
    } (asr));

    var asrExports = asr.exports;

    var createSpeechRecognizer = function (voiceListener) {
        var _a = createNanoEvents(), emit = _a.emit, on = _a.on;
        var off;
        var status = 'inactive';
        var currentMessageId;
        var stop = function () {
            if (voiceListener.status !== 'stopped') {
                status = 'inactive';
                voiceListener.stop();
            }
        };
        var start = function (_a) {
            var sendVoice = _a.sendVoice, messageId = _a.messageId, onMessage = _a.onMessage;
            return voiceListener.listen(sendVoice).then(function () {
                status = 'active';
                currentMessageId = messageId;
                off = onMessage(function (message) {
                    var _a, _b;
                    if (message.status && message.status.code != null && message.status.code < 0) {
                        off();
                        stop();
                    }
                    if (message.messageId === messageId && message.messageName === MessageNames.STT) {
                        if (message.text) {
                            emit('hypotesis', message.text.data || '', message.last === 1, message.messageId);
                            if (message.last === 1) {
                                off();
                                stop();
                            }
                        }
                        if ((_a = message.bytes) === null || _a === void 0 ? void 0 : _a.data) {
                            var decoderResultField = asrExports.PacketWrapperFromServer.decode(message.bytes.data).decoderResultField;
                            if (decoderResultField && ((_b = decoderResultField.hypothesis) === null || _b === void 0 ? void 0 : _b.length)) {
                                emit('hypotesis', decoderResultField.hypothesis[0].normalizedText || '', !!decoderResultField.isFinal, message.messageId);
                                if (decoderResultField.isFinal) {
                                    off();
                                    stop();
                                }
                            }
                        }
                    }
                });
            });
        };
        return {
            start: start,
            stop: stop,
            on: on,
            get status() {
                return status;
            },
            get messageId() {
                return currentMessageId;
            },
        };
    };

    var isAudioSupported = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    /**
     * Возвращает новый инстанс AudioContext или ошибку
     * @param options AudioContextOptions
     * @returns AudioContext
     */
    var createAudioContext = function (options) {
        if (window.AudioContext) {
            return new AudioContext(options);
        }
        if (window.webkitAudioContext) {
            // eslint-disable-next-line new-cap
            return new window.webkitAudioContext();
        }
        throw new Error('Audio not supported');
    };
    var _a = createNanoEvents(), on = _a.on, emit = _a.emit;
    var audioContext;
    /**
     * При помощи вызова функции из аргумента, возвращает, готовый к воспроизведению звука, AudioContext.
     * Всегда возвращает один и тот же AudioContext
     * @param onReady Функция, в аргумент которой будет возвращен AudioContext
     */
    var resolveAudioContext = function (onReady) {
        if (!audioContext) {
            var isSafari_1 = navigator.vendor.search('Apple') >= 0;
            var context_1 = createAudioContext();
            audioContext = {
                context: context_1,
                ready: !isSafari_1 && context_1.state === 'running',
                on: on,
            };
            /// Контекст может быть не готов для использования сразу после создания
            /// Если попробовать что-то воспроизвести в этом контексте - звука не будет
            if (!audioContext.ready) {
                var handleClick_1 = function () {
                    document.removeEventListener('click', handleClick_1);
                    document.removeEventListener('touchstart', handleClick_1);
                    if (isSafari_1) {
                        /// проигрываем тишину, т.к нужно что-то проиграть,
                        /// чтобы сафари разрешил воспроизводить звуки в любой момент в этом контексте
                        var oscillator = audioContext.context.createOscillator();
                        oscillator.frequency.value = 0;
                        oscillator.connect(audioContext.context.destination);
                        oscillator.start(0);
                        oscillator.stop(0.5);
                    }
                    if (audioContext.context.state === 'suspended') {
                        /// Developers who write games, WebRTC applications, or other websites that use the Web Audio API
                        /// should call context.resume() after the first user gesture (e.g. a click, or tap)
                        /// https://sites.google.com/a/chromium.org/dev/audio-video/autoplay
                        audioContext.context.resume();
                    }
                    audioContext.ready = true;
                    emit('ready');
                };
                /// чтобы сделать контекст готовым к использованию (воспроизведению звука),
                /// необходимо событие от пользователя
                // для пк
                document.addEventListener('click', handleClick_1);
                // для мобильных устройств
                document.addEventListener('touchstart', handleClick_1);
            }
        }
        if (audioContext.ready) {
            onReady && onReady(audioContext.context);
        }
        else {
            var unsubscribe_1 = on('ready', function () {
                onReady(audioContext.context);
                unsubscribe_1();
            });
        }
    };

    /**
     * Понижает sample rate c inSampleRate до значения outSampleRate и преобразует Float32Array в ArrayBuffer
     * @param buffer Аудио
     * @param inSampleRate текущий sample rate
     * @param outSampleRate требуемый sample rate
     * @returns Аудио со значением sample rate = outSampleRate
     */
    var downsampleBuffer = function (buffer, inSampleRate, outSampleRate) {
        if (outSampleRate > inSampleRate) {
            throw new Error('downsampling rate show be smaller than original sample rate');
        }
        var sampleRateRatio = inSampleRate / outSampleRate;
        var newLength = Math.round(buffer.length / sampleRateRatio);
        var result = new Int16Array(newLength);
        var offsetResult = 0;
        var offsetBuffer = 0;
        while (offsetResult < result.length) {
            var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
            var accum = 0;
            var count = 0;
            for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
                accum += buffer[i];
                count++;
            }
            result[offsetResult] = Math.min(1, accum / count) * 0x7fff;
            offsetResult++;
            offsetBuffer = nextOffsetBuffer;
        }
        return result.buffer;
    };
    var TARGET_SAMPLE_RATE = 16000;
    var IS_FIREFOX = typeof window !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    var IS_SAFARI = typeof window !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    var context;
    var processor;
    /**
     * Преобразует stream в чанки (кусочки), и передает их в cb,
     * будет это делать, пока не будет вызвана функция остановки
     * @param stream Аудио-поток
     * @param cb callback, куда будут переданы чанки из потока
     * @returns Функция, вызов которой остановит передачу чанков
     */
    var createAudioRecorder = function (stream, cb) {
        return new Promise(function (resolve) {
            var state = 'inactive';
            var input;
            var stop = function () {
                if (state === 'inactive') {
                    throw new Error("Can't stop inactive recorder");
                }
                state = 'inactive';
                stream.getTracks().forEach(function (track) {
                    track.stop();
                });
                input.disconnect();
            };
            var start = function () {
                if (state !== 'inactive') {
                    throw new Error("Can't start not inactive recorder");
                }
                state = 'recording';
                if (!context) {
                    context = createAudioContext({
                        // firefox не умеет выравнивать samplerate, будем делать это самостоятельно
                        sampleRate: IS_FIREFOX ? undefined : TARGET_SAMPLE_RATE,
                    });
                }
                input = context.createMediaStreamSource(stream);
                if (!processor) {
                    processor = context.createScriptProcessor(2048, 1, 1);
                }
                var listener = function (e) {
                    var buffer = e.inputBuffer.getChannelData(0);
                    var data = downsampleBuffer(buffer, context.sampleRate, TARGET_SAMPLE_RATE);
                    var last = state === 'inactive';
                    // отсылаем только чанки где есть звук voiceData > 0, т.к.
                    // в safari первые несколько чанков со звуком пустые
                    var dataWithVoice = new Uint8Array(data).some(function (voiceData) { return voiceData > 0; });
                    if (!IS_SAFARI || dataWithVoice) {
                        cb(data, last);
                    }
                    if (last) {
                        processor.removeEventListener('audioprocess', listener);
                    }
                };
                processor.addEventListener('audioprocess', listener);
                processor.addEventListener('audioprocess', function () { return resolve(stop); }, { once: true });
                input.connect(processor);
                processor.connect(context.destination);
            };
            start();
        });
    };
    /**
     * Запрашивает у браузера доступ к микрофону и резолвит Promise, если разрешение получено.
     * После получения разрешения, чанки с голосом будут передаваться в cb - пока не будет вызвана функция из результата.
     * @param cb Callback, куда будут передаваться чанки с голосом пользователя
     * @returns Promise, который содержит функцию прерывающую слушание
     */
    var createNavigatorAudioProvider = function (cb) {
        return navigator.mediaDevices
            .getUserMedia({
            audio: true,
        })
            .then(function (stream) {
            return createAudioRecorder(stream, cb);
        })
            .catch(function (err) {
            if (window.location.protocol === 'http:') {
                throw new Error('Audio is supported only on a secure connection');
            }
            throw err;
        });
    };

    /**
     * Возвращает объект, позволяющий получать запись голоса пользователя и управлять ею.
     * @param createAudioProvider Источник голоса
     * @returns Api для запуска и остановки слушания
     */
    var createVoiceListener = function (createAudioProvider) {
        if (createAudioProvider === void 0) { createAudioProvider = createNavigatorAudioProvider; }
        var _a = createNanoEvents(), emit = _a.emit, on = _a.on;
        var stopRecord;
        var status = 'stopped';
        var stop = function () {
            status = 'stopped';
            stopRecord();
            emit('status', 'stopped');
        };
        var listen = function (handleVoice) {
            status = 'started';
            emit('status', 'started');
            return createAudioProvider(function (data, last) { return handleVoice(new Uint8Array(data), last); })
                .then(function (recStop) {
                stopRecord = recStop;
            })
                .then(function () {
                status = 'listen';
                emit('status', 'listen');
            })
                .catch(function (err) {
                status = 'stopped';
                emit('status', 'stopped');
                throw err;
            });
        };
        return {
            listen: listen,
            stop: stop,
            on: on,
            get status() {
                return status;
            },
        };
    };

    /** Создает коллекцию треков  */
    var createTrackCollection = function () {
        var trackIds;
        var trackMap;
        var clear = function () {
            trackIds = new Array();
            trackMap = new Map();
        };
        var push = function (id, track) {
            if (trackMap.has(id)) {
                throw new Error('Track already exists');
            }
            trackMap.set(id, track);
            trackIds.push(id);
        };
        var has = function (id) { return trackMap.has(id); };
        var getById = function (id) {
            var track = trackMap.get(id);
            if (track === undefined) {
                throw new Error('Unknown track id');
            }
            return track;
        };
        var getByIndex = function (index) {
            if (index < 0 || index >= trackIds.length) {
                throw new Error('Index out of bounds');
            }
            var track = trackMap.get(trackIds[index]);
            if (track == null) {
                throw new Error('Something wrong...');
            }
            return track;
        };
        var some = function (predicate) { return trackIds.some(function (id) { return predicate(getById(id)); }); };
        clear();
        return {
            clear: clear,
            has: has,
            get: getById,
            getByIndex: getByIndex,
            push: push,
            some: some,
            get length() {
                return trackIds.length;
            },
        };
    };

    /** Создает структуру для хранения загружаемых и воспроизводимых частей трека */
    var createChunkQueue = function () {
        var buffer = []; // очередь на воспроизведение
        var chunks = []; // очередь воспроизведения
        var duration = 0; // продолжительность очереди на воспроизведение, сек
        var loaded = false; // флаг завершения загрузки
        /** Добавить чанк в очередь на воспроизведение */
        var push = function (chunk) {
            var _a;
            buffer.push(chunk);
            duration += ((_a = chunk.buffer) === null || _a === void 0 ? void 0 : _a.duration) || 0;
        };
        /** Добавить чанк в очередь воспроизведения */
        var toPlay = function (chunk) {
            chunks.push(chunk);
        };
        /** Удалить чанк из очереди воспроизведения */
        var remove = function (chunk) {
            chunks.splice(chunks.indexOf(chunk), 1);
        };
        /** Получить очередь на воспроизведение */
        var popAll = function () {
            duration = 0;
            return buffer.splice(0, buffer.length);
        };
        /** Проставляем признак окончания загрузки трека */
        var allLoaded = function () {
            loaded = true;
        };
        return {
            get bufferLen() {
                return buffer.length;
            },
            get chunks() {
                return chunks;
            },
            allLoaded: allLoaded,
            toPlay: toPlay,
            remove: remove,
            push: push,
            popAll: popAll,
            get length() {
                return chunks.length;
            },
            get duration() {
                return duration;
            },
            get ended() {
                // считаем трек законченным, когда все загружено и воспроизведено
                return loaded && chunks.length === 0 && buffer.length === 0;
            },
            get loaded() {
                return loaded;
            },
        };
    };

    var from16BitToFloat32 = function (incomingData) {
        var l = incomingData.length;
        var outputData = new Float32Array(l);
        for (var i = 0; i < l; i += 1) {
            outputData[i] = incomingData[i] / 32768.0;
        }
        return outputData;
    };
    /** Возвращает потоковый подгружаемый трек, который умеет себя проигрывать */
    var createTrackStream = function (ctx, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.sampleRate, sampleRate = _c === void 0 ? 24000 : _c, _d = _b.numberOfChannels, numberOfChannels = _d === void 0 ? 1 : _d, _e = _b.delay, delay = _e === void 0 ? 0 : _e, onPlay = _b.onPlay, onEnd = _b.onEnd, trackStatus = _b.trackStatus;
        // очередь загруженных чанков (кусочков) трека
        var queue = createChunkQueue();
        var extraByte = null;
        var status = trackStatus || 'stop';
        var lastChunkOffset = 0;
        var startTime = 0;
        var firstChunk = true;
        var end = function () {
            // останавливаем воспроизведение чанков из очереди воспроизведения
            queue.chunks.forEach(function (chunk) {
                chunk.stop();
            });
            status = 'end';
            onEnd && onEnd();
            startTime = 0;
            lastChunkOffset = 0;
        };
        var play = function () {
            if (status === 'end') {
                return;
            }
            if (status !== 'play') {
                status = 'play';
                onPlay && onPlay();
            }
            if (queue.ended) {
                end();
                return;
            }
            // воспроизводим трек, если он полностью загрузился или длина загруженного больше задержки
            if (queue.loaded || queue.duration >= delay) {
                startTime = queue.length === 0 ? ctx.currentTime : startTime;
                var chunks = queue.popAll();
                chunks.forEach(function (chunk) {
                    var _a;
                    queue.toPlay(chunk);
                    chunk.start(startTime + lastChunkOffset);
                    lastChunkOffset += ((_a = chunk.buffer) === null || _a === void 0 ? void 0 : _a.duration) || 0;
                });
            }
        };
        var getExtraBytes = function (data, bytesArraysSizes) {
            if (extraByte == null && bytesArraysSizes.incomingMessageVoiceDataLength % 2) {
                extraByte = data[bytesArraysSizes.incomingMessageVoiceDataLength - 1];
                bytesArraysSizes.incomingMessageVoiceDataLength -= 1;
                bytesArraysSizes.sourceLen -= 1;
            }
            else if (extraByte != null) {
                bytesArraysSizes.prepend = extraByte;
                bytesArraysSizes.start = 1;
                if (bytesArraysSizes.incomingMessageVoiceDataLength % 2) {
                    bytesArraysSizes.incomingMessageVoiceDataLength += 1;
                    extraByte = null;
                }
                else {
                    extraByte = data[bytesArraysSizes.incomingMessageVoiceDataLength - 1];
                    bytesArraysSizes.sourceLen -= 1;
                }
            }
        };
        var createChunk = function (chunk) {
            var audioBuffer = ctx.createBuffer(numberOfChannels, chunk.length / numberOfChannels, sampleRate);
            for (var i = 0; i < numberOfChannels; i++) {
                var channelChunk = new Float32Array(chunk.length / numberOfChannels);
                var index = 0;
                for (var j = i; j < chunk.length; j += numberOfChannels) {
                    channelChunk[index++] = chunk[j];
                }
                audioBuffer.getChannelData(i).set(channelChunk);
            }
            var source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = function () {
                queue.remove(source);
                if (queue.ended && status !== 'end') {
                    status = 'end';
                    onEnd && onEnd();
                }
            };
            return source;
        };
        /** добавляет чанк в очередь на воспроизведение */
        var write = function (data) {
            // 44 байта - заголовок трека
            var slicePoint = firstChunk ? 44 : 0;
            var bytesArraysSizes = {
                incomingMessageVoiceDataLength: data.length,
                sourceLen: data.length,
                start: 0,
                prepend: null,
            };
            firstChunk = false;
            if (slicePoint >= data.length) {
                return;
            }
            getExtraBytes(data, bytesArraysSizes);
            var dataBuffer = new ArrayBuffer(bytesArraysSizes.incomingMessageVoiceDataLength);
            var bufferUi8 = new Uint8Array(dataBuffer);
            var bufferI16 = new Int16Array(dataBuffer);
            bufferUi8.set(data.slice(0, bytesArraysSizes.sourceLen), bytesArraysSizes.start);
            if (bytesArraysSizes.prepend != null) {
                bufferUi8[0] = bytesArraysSizes.prepend;
            }
            var chunk = createChunk(from16BitToFloat32(bufferI16.slice(slicePoint)));
            queue.push(chunk);
            if (status === 'play') {
                play();
            }
        };
        return {
            get loaded() {
                return queue.loaded;
            },
            setLoaded: function () {
                queue.allLoaded();
                if (status === 'play') {
                    play();
                }
            },
            write: write,
            get status() {
                return status;
            },
            play: play,
            stop: end,
        };
    };

    var createVoicePlayer = function (actx, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.startVoiceDelay, startVoiceDelay = _c === void 0 ? 0.2 : _c, sampleRate = _b.sampleRate, numberOfChannels = _b.numberOfChannels;
        var _d = createNanoEvents(), on = _d.on, emit = _d.emit;
        var tracks = createTrackCollection();
        // true - воспроизводим все треки в очереди (новые в том числе), false - скипаем всю очередь (новые в т.ч.)
        var active = true;
        // индекс текущего трека в tracks
        var cursor = 0;
        var play = function () {
            if (cursor >= tracks.length) {
                if (tracks.some(function (track) { return !track.loaded; })) {
                    return;
                }
                // очищаем коллекцию, если все треки были воспроизведены
                cursor = 0;
                tracks.clear();
                return;
            }
            // рекурсивно последовательно включаем треки из очереди
            var current = tracks.getByIndex(cursor);
            if (current.status === 'end') {
                if (cursor < tracks.length) {
                    cursor++;
                    play();
                }
            }
            else {
                current.play();
            }
        };
        var append = function (data, trackId, last) {
            if (last === void 0) { last = false; }
            var current = tracks.has(trackId) ? tracks.get(trackId) : undefined;
            if (current == null) {
                /// если trackId нет в коллекции - создаем трек
                /// по окончании проигрывания - запускаем следующий трек, вызывая play
                current = createTrackStream(actx, {
                    sampleRate: sampleRate,
                    numberOfChannels: numberOfChannels,
                    delay: startVoiceDelay,
                    onPlay: function () { return emit('play', trackId); },
                    onEnd: function () {
                        emit('end', trackId);
                        play();
                    },
                    trackStatus: active ? 'stop' : 'end',
                });
                tracks.push(trackId, current);
            }
            if (current.status !== 'end' && data.length) {
                current.write(data);
            }
            if (last) {
                // все чанки трека загружены
                current.setLoaded();
            }
            play();
        };
        var stop = function () {
            while (cursor < tracks.length) {
                var cur = cursor;
                cursor++;
                tracks.getByIndex(cur).stop();
            }
        };
        return {
            append: append,
            setActive: function (value) {
                active = value;
                if (value) {
                    play();
                }
                else {
                    stop();
                }
            },
            on: on,
            stop: stop,
        };
    };

    var createVoice = function (client, settings, emit, 
    /// пока onReady не вызван, треки не воспроизводятся
    /// когда случится onReady, очередь треков начнет проигрываться
    onReady) {
        var voicePlayer;
        var listener = createVoiceListener();
        var musicRecognizer = createMusicRecognizer(listener);
        var speechRecognizer = createSpeechRecognizer(listener);
        var subscriptions = [];
        var appInfoDict = {};
        var mesIdQueue = [];
        var isPlaying = false; // проигрывается/не проигрывается озвучка
        var autolistenMesId = null; // id сообщения, после проигрывания которого, нужно активировать слушание
        /** останавливает слушание голоса, возвращает true - если слушание было активно */
        var stopListening = function () {
            var result = speechRecognizer.status === 'active' || musicRecognizer.status === 'active';
            autolistenMesId = null;
            if (speechRecognizer.status === 'active') {
                client.sendCancel(speechRecognizer.messageId);
                speechRecognizer.stop();
                return true;
            }
            if (musicRecognizer.status === 'active') {
                musicRecognizer.stop();
                client.sendCancel(musicRecognizer.messageId);
                return true;
            }
            return result;
        };
        /** Останавливает слушание и воспроизведение */
        var stop = function () {
            // здесь важен порядок остановки голоса
            stopListening();
            voicePlayer === null || voicePlayer === void 0 ? void 0 : voicePlayer.stop();
        };
        /** Активирует слушание голоса
         * если было активно слушание или проигрывание - останавливает, слушание в этом случае не активируется
         */
        var listen = function (_a, isAutoListening) {
            var _b = _a === void 0 ? {} : _a, begin = _b.begin;
            if (isAutoListening === void 0) { isAutoListening = false; }
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_c) {
                    if (stopListening()) {
                        return [2 /*return*/];
                    }
                    if (isPlaying) {
                        voicePlayer === null || voicePlayer === void 0 ? void 0 : voicePlayer.stop();
                        return [2 /*return*/];
                    }
                    if (settings.current.disableListening) {
                        return [2 /*return*/];
                    }
                    // повторные вызовы не пройдут, пока пользователь не разрешит/запретит аудио
                    if (listener.status === 'stopped') {
                        return [2 /*return*/, client.init().then(function () {
                                return client.createVoiceStream(function (_a) {
                                    var sendVoice = _a.sendVoice, messageId = _a.messageId, onMessage = _a.onMessage;
                                    begin === null || begin === void 0 ? void 0 : begin.forEach(function (chunk) { return sendVoice(new Uint8Array(chunk), false); });
                                    return speechRecognizer.start({
                                        sendVoice: sendVoice,
                                        messageId: messageId,
                                        onMessage: onMessage,
                                    });
                                }, {
                                    source: {
                                        sourceType: isAutoListening ? 'autoListening' : 'lavashar',
                                    },
                                });
                            })];
                    }
                    return [2 /*return*/];
                });
            });
        };
        /** Активирует распознавание музыки
         * если было активно слушание или проигрывание - останавливает, распознование музыки в этом случае не активируется
         */
        var shazam = function () {
            if (stopListening()) {
                return;
            }
            if (isPlaying) {
                voicePlayer === null || voicePlayer === void 0 ? void 0 : voicePlayer.stop();
            }
            if (settings.current.disableListening) {
                return;
            }
            // повторные вызовы не пройдут, пока пользователь не разрешит/запретит аудио
            if (listener.status === 'stopped') {
                client.createVoiceStream(function (_a) {
                    var sendVoice = _a.sendVoice, messageId = _a.messageId, onMessage = _a.onMessage;
                    return musicRecognizer.start({
                        sendVoice: sendVoice,
                        messageId: messageId,
                        onMessage: onMessage,
                    });
                }, {
                    source: {
                        sourceType: 'lavashar',
                    },
                });
            }
        };
        if (isAudioSupported) {
            resolveAudioContext(function (context) {
                /// создаем плеер только если поддерживается аудио
                /// и только когда готов AudioContext
                voicePlayer = createVoicePlayer(context, { startVoiceDelay: 1 });
                // начало проигрывания озвучки
                subscriptions.push(voicePlayer.on('play', function (mesId) {
                    isPlaying = true;
                    emit({ emotion: 'talk' });
                    emit({ tts: { status: 'start', messageId: Number(mesId), appInfo: appInfoDict[mesId] } });
                }));
                // окончание проигрывания озвучки
                subscriptions.push(voicePlayer.on('end', function (mesId) {
                    isPlaying = false;
                    emit({ emotion: 'idle' });
                    emit({ tts: { status: 'stop', messageId: Number(mesId), appInfo: appInfoDict[mesId] } });
                    if (mesId === autolistenMesId) {
                        listen();
                    }
                    // очистка сохраненных appInfo и messageId
                    var idx = 0;
                    do {
                        delete appInfoDict[mesIdQueue[0]];
                    } while (mesIdQueue[idx++] !== mesId && mesIdQueue.length > idx);
                    mesIdQueue.splice(0, idx);
                }));
                // оповещаем о готовности к воспроизведению звука
                onReady && onReady();
            });
        }
        // обработка входящей озвучки
        subscriptions.push(client.on('voice', function (data, message) {
            if (settings.current.disableDubbing) {
                return;
            }
            voicePlayer === null || voicePlayer === void 0 ? void 0 : voicePlayer.append(data, message.messageId.toString(), message.last === 1);
        }));
        // гипотезы распознавания речи
        subscriptions.push(speechRecognizer.on('hypotesis', function (text, isLast, mid) {
            emit({
                asr: {
                    text: listener.status === 'listen' && !settings.current.disableListening ? text : '',
                    last: isLast,
                    mid: mid,
                },
            });
        }));
        // статусы слушания речи
        subscriptions.push(listener.on('status', function (status) {
            emit({ listener: { status: status } });
            if (status === 'listen') {
                voicePlayer === null || voicePlayer === void 0 ? void 0 : voicePlayer.setActive(false);
                emit({ emotion: 'listen' });
            }
            else if (status === 'stopped') {
                voicePlayer === null || voicePlayer === void 0 ? void 0 : voicePlayer.setActive(!settings.current.disableDubbing);
                emit({ asr: { text: '' }, emotion: 'idle' });
            }
        }));
        // активация автослушания
        subscriptions.push(client.on('systemMessage', function (systemMessage, originalMessage) {
            var autoListening = systemMessage.auto_listening;
            var messageId = originalMessage.messageId.toString();
            if (typeof systemMessage.app_info !== 'undefined') {
                appInfoDict[messageId] = systemMessage.app_info;
                mesIdQueue.push(messageId);
            }
            if (autoListening) {
                /// если озвучка включена - сохраняем mesId чтобы включить слушание после озвучки
                /// если озвучка выключена - включаем слушание сразу
                if (settings.current.disableDubbing === false) {
                    autolistenMesId = messageId;
                }
                else {
                    listen({}, autoListening);
                }
            }
        }));
        subscriptions.push(settings.on('change-request', function (nextSettings) {
            var disableDubbing = nextSettings.disableDubbing, disableListening = nextSettings.disableListening;
            /// Важен порядок обработки флагов слушания и озвучки —
            /// сначала слушание, потом озвучка
            disableListening && stopListening();
            // Такой вызов необходим, чтобы включая озвучку она тут же проигралась (при её наличии), и наоборот
            settings.current.disableDubbing !== disableDubbing && (voicePlayer === null || voicePlayer === void 0 ? void 0 : voicePlayer.setActive(!disableDubbing));
        }));
        return {
            destroy: function () {
                stopListening();
                voicePlayer === null || voicePlayer === void 0 ? void 0 : voicePlayer.setActive(false);
                subscriptions.splice(0, subscriptions.length).map(function (unsubscribe) { return unsubscribe(); });
            },
            listen: listen,
            shazam: shazam,
            stop: stop,
            stopPlaying: function () {
                voicePlayer === null || voicePlayer === void 0 ? void 0 : voicePlayer.stop();
            },
        };
    };

    var createMutexedObject = function (initialObject) {
        var _a = createNanoEvents(), on = _a.on, emit = _a.emit;
        var object = __assign({}, initialObject);
        var nextObject = {};
        var mode = 'released';
        var tryApply = function () {
            if (mode === 'released') {
                var prevObject_1 = object;
                object = __assign(__assign({}, prevObject_1), nextObject);
                var isObjectChanged = Object.keys(nextObject).some(function (name) { return nextObject[name] !== prevObject_1[name]; });
                if (isObjectChanged) {
                    emit('changed', object, prevObject_1);
                }
            }
        };
        var lock = function () {
            mode = 'locked';
        };
        var release = function () {
            mode = 'released';
            tryApply();
        };
        var change = function (setts) {
            nextObject = __assign(__assign({}, nextObject), setts);
            emit('change-request', setts);
            tryApply();
        };
        var current = {};
        Object.keys(initialObject).forEach(function (prop) {
            Object.defineProperty(current, prop, {
                get: function () {
                    return object[prop];
                },
            });
        });
        return {
            on: on,
            lock: lock,
            release: release,
            change: change,
            current: current,
        };
    };

    var createMutexSwitcher = function (_a, initialDeps) {
        var lock = _a.lock, release = _a.release;
        var deps = __assign({}, initialDeps);
        return {
            change: function (nextDeps) {
                deps = __assign(__assign({}, deps), nextDeps);
                if (Object.values(deps).every(function (dep) { return dep; })) {
                    release();
                }
                else {
                    lock();
                }
            },
        };
    };

    var STATE_UPDATE_TIMEOUT = 200;
    var DEFAULT_PROJECT_ID = 'd929986a-611a-2ba0-6174-1928c99600a5';
    var DEFAULT_APPLICATION_ID = '7c4e23bf-cd93-b57e-874b-d9fc1b35f93d';
    var DEFAULT_APP_VERSION_ID = '26d0bb2e-45d6-a276-f70e-6c016d1f9cff';
    var DEFAULT_APP = {
        projectId: DEFAULT_PROJECT_ID,
        applicationId: DEFAULT_APPLICATION_ID,
        appversionId: DEFAULT_APP_VERSION_ID,
        frontendStateId: [DEFAULT_PROJECT_ID, DEFAULT_APPLICATION_ID, DEFAULT_APP_VERSION_ID].join('_'),
        frontendType: 'DIALOG',
        systemName: 'assistant',
        frontendEndpoint: 'None',
    };
    function convertFieldValuesToString(object) {
        return Object.keys(object).reduce(function (acc, key) {
            if (object[key]) {
                acc[key] = JSON.stringify(object[key]);
            }
            return acc;
        }, {});
    }
    var isDefaultApp = function (appInfo) { return appInfo.frontendStateId === DEFAULT_APP.frontendStateId; };
    var promiseTimeout = function (promise, timeout) {
        var timeoutId;
        return Promise.race([
            promise.then(function (v) {
                if (timeoutId) {
                    window.clearTimeout(timeoutId);
                }
                return v;
            }),
            new Promise(function (_, reject) {
                timeoutId = window.setTimeout(function () {
                    reject(new Error("Timed out in " + timeout + " ms."));
                }, timeout);
            }),
        ]);
    };
    var createAssistant = function (_a) {
        var _b;
        var getMeta = _a.getMeta, getInitialMeta = _a.getInitialMeta, configuration = __rest(_a, ["getMeta", "getInitialMeta"]);
        var _c = createNanoEvents(), on = _c.on, emit = _c.emit;
        // хеш [messageId]: requestId, где requestId - пользовательский ид экшена
        var requestIdMap = {};
        var subscriptions = [];
        var backgroundApps = {};
        var settings = createMutexedObject({
            disableDubbing: configuration.settings.dubbing === -1,
            disableListening: false,
            sendTextAsSsml: false,
        });
        var settingsSwitcher = createMutexSwitcher(settings, { isListenerStopped: true, isVoicePlayerEnded: true });
        // готов/не готов воспроизводить озвучку
        var voiceReady = false;
        // текущий апп
        var app = { info: DEFAULT_APP };
        var sdkMeta = { theme: 'dark' };
        var metaProvider = function (additionalMeta) { return __awaiter(void 0, void 0, void 0, function () {
            var appState, _a, current_app, getBackgroundAppsMeta, background_apps;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(app !== null && app.info.frontendType === 'WEB_APP' && app.getState)) return [3 /*break*/, 2];
                        return [4 /*yield*/, promiseTimeout(app.getState(), STATE_UPDATE_TIMEOUT).catch(function () {
                                // eslint-disable-next-line no-console
                                console.error('App-state wasn`t resolved, timeout had been expired');
                                return undefined;
                            })];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = undefined;
                        _b.label = 3;
                    case 3:
                        appState = _a;
                        current_app = {
                            app_info: app.info,
                            state: appState || {},
                        };
                        getBackgroundAppsMeta = function () { return __awaiter(void 0, void 0, void 0, function () {
                            var apps, backgroundAppsIds, backgroundAppsMeta;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        apps = __assign({}, backgroundApps);
                                        backgroundAppsIds = Object.keys(apps);
                                        backgroundAppsMeta = [];
                                        return [4 /*yield*/, Promise.all(backgroundAppsIds.map(function (applicationId) { return __awaiter(void 0, void 0, void 0, function () {
                                                var _a, getState;
                                                return __generator(this, function (_b) {
                                                    _a = apps[applicationId].getState, getState = _a === void 0 ? function () { return Promise.resolve({}); } : _a;
                                                    return [2 /*return*/, promiseTimeout(getState(), STATE_UPDATE_TIMEOUT).then(function (state) { return state; }, function () { return ({}); })];
                                                });
                                            }); })).then(function (results) {
                                                results.forEach(function (appResult, index) {
                                                    var state = appResult;
                                                    var applicationId = backgroundAppsIds[index];
                                                    backgroundAppsMeta.push({
                                                        app_info: apps[applicationId].appInfo,
                                                        state: state,
                                                    });
                                                });
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, backgroundAppsMeta];
                                }
                            });
                        }); };
                        return [4 /*yield*/, getBackgroundAppsMeta()];
                    case 4:
                        background_apps = _b.sent();
                        return [2 /*return*/, convertFieldValuesToString(__assign(__assign(__assign(__assign({}, sdkMeta), { time: getTime(), current_app: current_app, background_apps: background_apps }), (additionalMeta || {})), (getMeta ? getMeta() : {})))];
                }
            });
        }); };
        var transport = createTransport((_b = configuration.fakeVps) === null || _b === void 0 ? void 0 : _b.createFakeWS);
        var protocol = createProtocol(transport, __assign(__assign({}, configuration), { getInitialMeta: typeof getInitialMeta !== 'undefined' ? function () { return getInitialMeta().then(convertFieldValuesToString); } : undefined, 
            // пока голос не готов, выключаем озвучку
            settings: __assign(__assign({}, configuration.settings), { dubbing: -1 }) }));
        var client = createClient(protocol, metaProvider);
        var voice = createVoice(client, settings, function (event) {
            if (typeof event.tts !== 'undefined') {
                emit('tts', event.tts);
                settingsSwitcher.change({ isVoicePlayerEnded: event.tts.status === 'stop' });
                return;
            }
            if (typeof event.listener !== 'undefined') {
                settingsSwitcher.change({ isListenerStopped: event.listener.status === 'stopped' });
            }
            emit('assistant', event);
        }, function () {
            voiceReady = true;
            if (!settings.current.disableDubbing) {
                protocol.changeSettings({ dubbing: 1 });
            }
        });
        /** завершает текущий апп */
        var closeApp = function () {
            var current = app;
            app = {
                info: DEFAULT_APP,
            };
            if (!isDefaultApp(current.info)) {
                emit('app', { type: 'close', app: current.info });
            }
        };
        /** отправляет текст */
        var sendText = function (text, shouldSendDisableDubbing, additionalMeta) {
            if (shouldSendDisableDubbing === void 0) { shouldSendDisableDubbing = false; }
            voice.stop();
            client.sendText(text, settings.current.sendTextAsSsml, shouldSendDisableDubbing, additionalMeta);
        };
        /** отправляет server_action */
        var sendServerAction = function (serverAction, messageName, requestId, actionApp) {
            if (messageName === void 0) { messageName = 'SERVER_ACTION'; }
            if (requestId === void 0) { requestId = undefined; }
            if (actionApp === void 0) { actionApp = app.info; }
            client.sendServerAction(serverAction, actionApp, messageName).then(function (messageId) {
                if (requestId && messageId) {
                    requestIdMap[messageId.toString()] = requestId;
                }
            });
        };
        /** отправляет ответ на запрос доступа к местоположению и пр. меты */
        var sendMetaForPermissionRequest = function (requestMessageId, appInfo, items) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, props, data, meta;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, getAnswerForRequestPermissions(requestMessageId, appInfo, items)];
                    case 1:
                        _a = _b.sent(), props = __rest(_a.meta, []), data = __rest(_a, ["meta"]);
                        return [4 /*yield*/, metaProvider()];
                    case 2:
                        meta = _b.sent();
                        client.sendData(__assign({}, data), 'SERVER_ACTION', __assign(__assign({}, meta), convertFieldValuesToString(props)));
                        return [2 /*return*/];
                }
            });
        }); };
        subscriptions.push(protocol.on('ready', function () { return emit('vps', { type: 'ready' }); }));
        // пока voicePlayer не доступен, включение озвучки не будет отправлено
        subscriptions.push(settings.on('changed', function (nextSettings, prevSettings) {
            if (nextSettings.disableDubbing !== prevSettings.disableDubbing) {
                voiceReady && protocol.changeSettings({ dubbing: nextSettings.disableDubbing ? -1 : 1 });
            }
        }));
        // при неудачном переподключении к сокету
        subscriptions.push(transport.on('error', function (error) {
            voice.stop();
            protocol.clearQueue();
            emit('vps', { type: 'error', error: error });
        }));
        // обработка исходящих сообщений
        subscriptions.push(protocol.on('outcoming', function (message) {
            emit('vps', { type: 'outcoming', message: message });
        }));
        // обработка ошибок
        subscriptions.push(protocol.on('error', function (error) {
            emit('error', error);
        }));
        // оповещение о статусах
        subscriptions.push(client.on('status', function (status) {
            emit('status', status);
        }));
        // история на запрос GetHistoryRequest
        subscriptions.push(client.on('history', function (history) {
            emit('history', history);
        }));
        // обработка входящих команд, и событий аппа
        subscriptions.push(client.on('systemMessage', function (systemMessage, originalMessage) {
            if (originalMessage.messageName === 'ANSWER_TO_USER') {
                var activate_app_info = systemMessage.activate_app_info, items = systemMessage.items, mesAppInfo = systemMessage.app_info, character = systemMessage.character;
                if (character) {
                    emit('assistant', { character: character.id });
                }
                // по-умолчанию activate_app_info: true
                if (activate_app_info !== false && mesAppInfo && mesAppInfo.applicationId !== app.info.applicationId) {
                    emit('app', { type: 'run', app: mesAppInfo });
                }
                if (items) {
                    var _loop_1 = function (i) {
                        var command = items[i].command;
                        if (typeof command !== 'undefined') {
                            setTimeout(function () { return emit('command', command); });
                            if (command.type === 'start_music_recognition') {
                                voice.shazam();
                                return { value: void 0 };
                            }
                            if (command.type === 'request_permissions' && mesAppInfo) {
                                sendMetaForPermissionRequest(originalMessage.messageId, mesAppInfo, command.permissions);
                                return { value: void 0 };
                            }
                            if (command.type === 'action') {
                                emit('actionCommand', {
                                    type: 'command',
                                    command: command,
                                });
                            }
                            if ((command.type === 'smart_app_data' ||
                                command.type === 'smart_app_error' ||
                                command.type === 'start_smart_search' ||
                                command.type === 'navigation') &&
                                mesAppInfo) {
                                // эмитим все команды, т.к бывают фоновые команды
                                emit('app', {
                                    type: 'command',
                                    command: __assign(__assign({}, command), { sdk_meta: {
                                            mid: originalMessage.messageId.toString(),
                                            requestId: requestIdMap[originalMessage.messageId.toString()],
                                        } }),
                                    app: mesAppInfo,
                                });
                            }
                            if (command.type === 'close_app') {
                                closeApp();
                            }
                        }
                    };
                    for (var i = 0; i < (items || []).length; i++) {
                        var state_1 = _loop_1(i);
                        if (typeof state_1 === "object")
                            return state_1.value;
                    }
                }
                emit('vps', { type: 'incoming', systemMessage: systemMessage, originalMessage: originalMessage });
            }
        }));
        // прокидывает команды backgroundApp'ов в их подписчики
        on('app', function (event) {
            var _a;
            if (event.type === 'command') {
                var backgroundAppOnCommand = (_a = backgroundApps[event.app.applicationId]) === null || _a === void 0 ? void 0 : _a.commandsSubscribers;
                if (Array.isArray(backgroundAppOnCommand)) {
                    backgroundAppOnCommand.forEach(function (onCommand) {
                        var _a;
                        onCommand(event.command, (_a = event.command.sdk_meta) === null || _a === void 0 ? void 0 : _a.mid);
                    });
                }
            }
        });
        /** уничтожает ассистент, очищает подписки */
        var destroy = function () {
            voice.destroy();
            client.destroy();
            protocol.destroy();
            subscriptions.splice(0, subscriptions.length).map(function (unsubscribe) { return unsubscribe(); });
        };
        /** запускает ассистент (приветствие) */
        var start = function (_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.disableGreetings, disableGreetings = _c === void 0 ? false : _c, _d = _b.initPhrase, initPhrase = _d === void 0 ? undefined : _d, _e = _b.isFirstSession, isFirstSession = _e === void 0 ? false : _e;
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            if (!(!disableGreetings && isDefaultApp(app.info))) return [3 /*break*/, 2];
                            return [4 /*yield*/, client.sendOpenAssistant({ isFirstSession: isFirstSession })];
                        case 1:
                            _f.sent();
                            _f.label = 2;
                        case 2:
                            if (initPhrase) {
                                return [2 /*return*/, client
                                        .sendText(initPhrase)
                                        .then(function (messageId) { return (messageId ? client.waitForAnswer(messageId) : undefined); })];
                            }
                            return [2 /*return*/, undefined];
                    }
                });
            });
        };
        return {
            get activeApp() {
                return !isDefaultApp(app.info) ? app.info : null;
            },
            get settings() {
                return Object.create(Object.getPrototypeOf(settings.current), Object.getOwnPropertyDescriptors(settings.current));
            },
            destroy: destroy,
            closeApp: closeApp,
            listen: voice.listen,
            sendServerAction: sendServerAction,
            getHistoryRequest: protocol.getHistoryRequest,
            sendText: sendText,
            start: start,
            stop: function () {
                voice.stop();
                protocol.clearQueue();
                transport.close();
            },
            stopTts: voice.stopPlaying,
            stopVoice: voice.stop,
            emit: emit,
            on: on,
            changeConfiguration: protocol.changeConfiguration,
            changeSettings: settings.change,
            changeSdkMeta: function (nextSdkMeta) {
                sdkMeta = __assign(__assign({}, sdkMeta), nextSdkMeta);
            },
            reconnect: protocol.reconnect,
            get protocol() {
                return protocol;
            },
            setActiveApp: function (info, getState) {
                app = { info: info, getState: getState };
            },
            addBackgroundApp: function (_a) {
                var appInfo = _a.appInfo, getState = _a.getState;
                backgroundApps[appInfo.applicationId] = {
                    appInfo: appInfo,
                    getState: getState,
                    commandsSubscribers: [],
                };
                var remove = function () {
                    delete backgroundApps[appInfo.applicationId];
                };
                var onCommand = function (subscriber) {
                    var _a;
                    (_a = backgroundApps[appInfo.applicationId]) === null || _a === void 0 ? void 0 : _a.commandsSubscribers.push(subscriber);
                    return {
                        clearSubscribers: function () {
                            if (backgroundApps[appInfo.applicationId]) {
                                backgroundApps[appInfo.applicationId].commandsSubscribers = [];
                            }
                        },
                    };
                };
                var sendServerActionToBackgroundApp = function (serverAction, messageName, requestId) {
                    var _a;
                    if (messageName === void 0) { messageName = 'SERVER_ACTION'; }
                    if (requestId === void 0) { requestId = undefined; }
                    return sendServerAction(serverAction, messageName, requestId, (_a = backgroundApps[appInfo.applicationId]) === null || _a === void 0 ? void 0 : _a.appInfo);
                };
                return {
                    remove: remove,
                    onCommand: onCommand,
                    sendServerAction: sendServerActionToBackgroundApp,
                };
            },
            get status() {
                return protocol.status;
            },
        };
    };

    var createComponent = function (_a) {
        var baseHTMLTemplate = _a.baseHTMLTemplate, createRefs = _a.createRefs, render = _a.render;
        var effects = {
            deps: {},
            offs: {},
        };
        var root = null;
        var refs = null;
        var lastProps = null;
        var state = {};
        var setState = function () { };
        var renderMode = 'release';
        var renderId = -1;
        var uneffects = function () {
            Object.values(effects.offs).forEach(function (off) { return off(); });
            effects.deps = {};
            effects.offs = {};
        };
        var unmount = function () {
            uneffects();
            root === null || root === void 0 ? void 0 : root.remove();
            lastProps = null;
            state = {};
            renderMode = 'release';
            window.clearTimeout(renderId);
        };
        var tryRender = function (ren) {
            if (renderMode === 'release') {
                renderMode = 'lock';
                window.clearTimeout(renderId);
                renderId = window.setTimeout(function () {
                    ren();
                    renderMode = 'release';
                }, 20);
            }
        };
        var update = function (props) {
            lastProps = props;
            if (root && refs) {
                var currentDepsId_1 = -1;
                var effect = function (cb, deps) {
                    currentDepsId_1 += 1;
                    if (!effects.deps[currentDepsId_1]) {
                        effects.deps[currentDepsId_1] = {
                            arr: [],
                            calls: 0,
                        };
                    }
                    var _a = effects.deps[currentDepsId_1], prevDeps = _a.arr, calls = _a.calls;
                    var updateOnce = deps.length === 0 && calls === 0;
                    var updated = updateOnce || calls === 0 || prevDeps.some(function (prev, index) { return prev !== deps[index]; });
                    if (updated) {
                        effects.deps[currentDepsId_1].arr = deps;
                        effects.deps[currentDepsId_1].calls += 1;
                        if (typeof effects.offs[currentDepsId_1] === 'function') {
                            effects.offs[currentDepsId_1]();
                        }
                        var off = cb();
                        if (typeof off === 'function') {
                            effects.offs[currentDepsId_1] = off;
                        }
                    }
                };
                tryRender(render({ refs: refs, props: props, state: state, setState: setState, effect: effect }));
            }
        };
        setState = function (modi) {
            var nextState = typeof modi === 'function' ? modi(state) : modi;
            state = __assign(__assign({}, (state || {})), nextState);
            if (lastProps) {
                update(lastProps);
            }
        };
        var mount = function (element, props) {
            unmount();
            root = element;
            root.innerHTML = baseHTMLTemplate;
            refs = createRefs(root);
            update(props);
        };
        return {
            mount: mount,
            unmount: unmount,
            update: update,
            get mounted() {
                return !!(root && refs);
            },
        };
    };

    var FONTS_CDN = 'https://cdn-app.sberdevices.ru/shared-static/0.0.0/fonts/SBSansText/';
    var fontFace = "\n@font-face {\n    font-family: 'SB Sans Text';\n    src: local('SB Sans Text Medium'), local('SBSansText-Medium'), url('" + FONTS_CDN + "SBSansText-Medium.woff2') format('woff2'), url('" + FONTS_CDN + "SBSansText-Medium.woff') format('woff');\n    font-weight: 500;\n    font-style: normal;\n}\n\n@font-face {\n    font-family: 'SB Sans Text';\n    src: local('SB Sans Text Regular'), local('SBSansText-Regular'), url('" + FONTS_CDN + "SBSansText-Regular.woff2') format('woff2'), url('" + FONTS_CDN + "SBSansText-Regular.woff') format('woff');\n    font-weight: 400;\n    font-style: normal;\n}\n";
    var fontFamily500 = "\n    font-family: 'SB Sans Text';\n    font-weight: 500;\n";
    var fontFamily400 = "\n    font-family: 'SB Sans Text';\n    font-weight: 400;\n";

    var BubbleStyles = "\n.Bubble {\n    position: absolute;\n    top: -13px;\n    cursor: pointer;\n    transform: translateY(-100%);\n    max-width: 80%;\n    border-radius: 24px 24px 24px 6px;\n    background-color: rgba(255, 255, 255, 0.08);\n    padding: 12px 24px;\n    font-size: 16px;\n    font-weight: 500;\n    color: #fff;\n    z-index: -1;\n    " + fontFamily500 + "\n}\n.Bubble:empty {\n    display: none;\n}\n";
    var BubbleMDStyles = "\n    font-size: 16px;\n    padding: 12px 24px;\n";
    var BubbleSMStyles = "\n    font-size: 12px;\n    padding: 8px 12px;\n";

    var assistantSphereIcon = 'data:image/png;base64,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';
    var SphereButtonStyles = "\n.SphereButton {\n    box-sizing: border-box;\n    background-size: contain;\n    background-repeat: no-repeat;\n    transition: transform 0.2s;\n    background-position: center;\n    height: 56px;\n    width: 56px;\n    cursor: pointer;\n    background-image: url(" + assistantSphereIcon + ");\n}\n\n.SphereButton:hover {\n    transform: scale(1.1);\n}\n\n.SphereButton.active {\n    animation: rotation 2s linear infinite;\n}\n";
    var SphereButtonMDStyles = "\n    height: 50px;\n    width: 50px;\n";
    var SphereButtonSMStyles = "\n    height: 32px;\n    width: 32px;\n";

    // По дефолту `display: none`. Включается в месте устновки
    var CarouselTouchStyles = "\n.CarouselTouch {\n    display: none;\n    height: 38px;\n    width: 38px;\n}\n\n.CarouselTouchIcon {\n    width: 100%;\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    border-radius: 500px;\n    overflow: hidden;\n}\n.CarouselTouchIcon:not(:last-child) {\n    box-shadow: 5px 0px 4px rgb(18 18 18 / 25%);\n}\n.CarouselTouchIcon__mask {\n    background-color: #000000;\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    z-index: 2;\n}\n.CarouselTouchIcon__icon {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    z-index: 1;\n    background-size: cover;\n    background-repeat: no-repeat;\n}\n";

    var keyboardIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyMCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xOC4yNSAwQzE5LjIxNjUgMCAyMCAwLjc4MzUwMiAyMCAxLjc1VjEyLjI1QzIwIDEzLjIxNjUgMTkuMjE2NSAxNCAxOC4yNSAxNEgxLjc1QzAuNzgzNTAyIDE0IDAgMTMuMjE2NSAwIDEyLjI1VjEuNzVDMCAwLjc4MzUwMiAwLjc4MzUwMiAwIDEuNzUgMEgxOC4yNVpNMTcuMTI1IDEwSDIuODc1QzIuMzkxNzUgMTAgMiAxMC4zOTE4IDIgMTAuODc1VjExLjEyNUMyIDExLjYwODIgMi4zOTE3NSAxMiAyLjg3NSAxMkgxNy4xMjVDMTcuNjA4MiAxMiAxOCAxMS42MDgyIDE4IDExLjEyNVYxMC44NzVDMTggMTAuMzkxOCAxNy42MDgyIDEwIDE3LjEyNSAxMFpNNi4xMjUgNkg1Ljg3NUM1LjM5MTc1IDYgNSA2LjM5MTc1IDUgNi44NzVWNy4xMjVDNSA3LjYwODI1IDUuMzkxNzUgOCA1Ljg3NSA4SDYuMTI1QzYuNjA4MjUgOCA3IDcuNjA4MjUgNyA3LjEyNVY2Ljg3NUM3IDYuMzkxNzUgNi42MDgyNSA2IDYuMTI1IDZaTTEwLjEyNSA2SDkuODc1QzkuMzkxNzUgNiA5IDYuMzkxNzUgOSA2Ljg3NVY3LjEyNUM5IDcuNjA4MjUgOS4zOTE3NSA4IDkuODc1IDhIMTAuMTI1QzEwLjYwODIgOCAxMSA3LjYwODI1IDExIDcuMTI1VjYuODc1QzExIDYuMzkxNzUgMTAuNjA4MiA2IDEwLjEyNSA2Wk0xNC4xMjUgNkgxMy44NzVDMTMuMzkxOCA2IDEzIDYuMzkxNzUgMTMgNi44NzVWNy4xMjVDMTMgNy42MDgyNSAxMy4zOTE4IDggMTMuODc1IDhIMTQuMTI1QzE0LjYwODIgOCAxNSA3LjYwODI1IDE1IDcuMTI1VjYuODc1QzE1IDYuMzkxNzUgMTQuNjA4MiA2IDE0LjEyNSA2Wk0xNi4xMjUgM0gxNS44NzVDMTUuMzkxOCAzIDE1IDMuMzkxNzUgMTUgMy44NzVWNC4xMjVDMTUgNC42MDgyNSAxNS4zOTE4IDUgMTUuODc1IDVIMTYuMTI1QzE2LjYwODIgNSAxNyA0LjYwODI1IDE3IDQuMTI1VjMuODc1QzE3IDMuMzkxNzUgMTYuNjA4MiAzIDE2LjEyNSAzWk0xMi4xMjUgM0gxMS44NzVDMTEuMzkxOCAzIDExIDMuMzkxNzUgMTEgMy44NzVWNC4xMjVDMTEgNC42MDgyNSAxMS4zOTE4IDUgMTEuODc1IDVIMTIuMTI1QzEyLjYwODIgNSAxMyA0LjYwODI1IDEzIDQuMTI1VjMuODc1QzEzIDMuMzkxNzUgMTIuNjA4MiAzIDEyLjEyNSAzWk04LjEyNSAzSDcuODc1QzcuMzkxNzUgMyA3IDMuMzkxNzUgNyAzLjg3NVY0LjEyNUM3IDQuNjA4MjUgNy4zOTE3NSA1IDcuODc1IDVIOC4xMjVDOC42MDgyNSA1IDkgNC42MDgyNSA5IDQuMTI1VjMuODc1QzkgMy4zOTE3NSA4LjYwODI1IDMgOC4xMjUgM1pNNC4xMjUgM0gzLjg3NUMzLjM5MTc1IDMgMyAzLjM5MTc1IDMgMy44NzVWNC4xMjVDMyA0LjYwODI1IDMuMzkxNzUgNSAzLjg3NSA1SDQuMTI1QzQuNjA4MjUgNSA1IDQuNjA4MjUgNSA0LjEyNVYzLjg3NUM1IDMuMzkxNzUgNC42MDgyNSAzIDQuMTI1IDNaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjk2Ii8+Cjwvc3ZnPgo=';
    var KeyboardTouchStyles = "\n.KeyboardTouch {\n    width: 20px;\n    height: 14px;\n    opacity: .56;\n    background-size: cover;\n    background-repeat: no-repeat;\n    background-image: url(" + keyboardIcon + ");\n}\n";

    var voiceIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik03IDEyYzEuNjYgMCAzLTEuMzQgMy0zVjNjMC0xLjY2LTEuMzQtMy0zLTNTNCAxLjM0IDQgM3Y2YzAgMS42NiAxLjM0IDMgMyAzWm01LjkxLTNjLS40OSAwLS45LjM2LS45OC44NUMxMS41MiAxMi4yIDkuNDcgMTQgNyAxNGMtMi40NyAwLTQuNTItMS44LTQuOTMtNC4xNUEuOTk4Ljk5OCAwIDAgMCAxLjA5IDljLS42MSAwLTEuMDkuNTQtMSAxLjE0LjQ5IDMgMi44OSA1LjM1IDUuOTEgNS43OFYxOGMwIC41NS40NSAxIDEgMXMxLS40NSAxLTF2LTIuMDhhNi45OTMgNi45OTMgMCAwIDAgNS45MS01Ljc4Yy4xLS42LS4zOS0xLjE0LTEtMS4xNFoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=';
    var VoiceTouchStyles = "\n.VoiceTouch {\n    height: 38px;\n    width: 38px;\n    border-radius: 500px;\n    background-color: #24B23E;\n    background-size: 14px 19px;\n    background-repeat: no-repeat;\n    background-position: center;\n    background-image: url(" + voiceIcon + ");\n}\n";

    var SuggestsStyles = "\n.Suggests {\n    display: flex;\n    overflow-x: auto;\n    overflow-y: hidden;\n}\n\n.Suggests > *:last-child {\n    margin-right: 0;\n}\n\n.SuggestsSuggest {\n    border-radius: 500px;\n    color: #fff;\n    cursor: pointer;\n    white-space: nowrap;\n    line-height: 1;\n    " + fontFamily400 + "\n}\n";
    var SuggestLGStyles = "\n    font-size: 24px;\n    padding: 12px 24px;\n    margin-right: 18px;\n";
    var SuggestMDStyles = "\n    font-size: 14px;\n    padding: 8px 12px;\n    margin-right: 12px;\n";
    var SuggestSMStyles = "\n    font-size: 12px;\n    padding: 9px 12px;\n    margin-right: 12px;\n";
    var SuggestOutlinedStyles = "\n    border: 1px solid rgba(255, 255, 255, 0.28);\n";
    var SuggestFilledStyles = "\n    background-color: rgba(255, 255, 255, 0.12);\n    border: 1px solid transparent;\n";

    var TextInputStyles = "\n.TextInput {\n    width: 100%;\n    color: #fff;\n    line-height: 18px;\n    font-weight: 500;\n    border: 0;\n    " + fontFamily400 + "\n}\n";
    var TextInputPureStyles = "\n    font-size: 22px;\n    outline: none;\n    background: transparent;\n";
    var TextInputFilledStyles = "\n    height: 38px;\n    font-size: 16px;\n    background: rgb(144, 144, 144, 0.15);\n    border-radius: 500px;\n    padding: 8px 16px;\n    box-sizing: border-box;\n";

    var NativePanelStyles = "\n.NativePanel {\n    position: fixed;\n    bottom: 0;\n    left: 0;\n    z-index: 999;\n    width: 100%;\n    box-sizing: border-box;\n    display: flex;\n    align-items: center;\n    backdrop-filter: blur(5px);\n    background: linear-gradient(#ffffff00, #000000);\n}\n\n.NativePanel__sphere {\n    display: inline-block;\n}\n.NativePanel__textInputs {}\n.NativePanel__touch {\n    display: inline-block;\n    margin-left: 16px;\n}\n.NativePanel__touch .VoiceTouch {\n    display: none;\n}\n";
    var NativePanelPaddingsSMStyles = "\n.NativePanel {\n    height: 64px;\n    padding: 8px 20px;\n}\n\n.NativePanel .Suggests {\n    padding-left: 20px;\n    margin-left: -20px;\n    margin-right: -20px;\n}\n";
    var NativePanelPaddingsMDStyles = "\n.NativePanel {\n    padding: 28px 12px 12px;\n}\n\n.NativePanel .Suggests {\n    margin-right: -12px;\n}\n";
    var NativePanelPaddingsLGStyles = "\n.NativePanel {\n    padding: 36px 64px 24px;\n}\n\n.NativePanel .Suggests {\n    margin-right: -64px;\n}\n";
    var NativePanelInputOffsetMDStyles = "\n.NativePanel__textInputs {\n    margin-left: 24px;\n}\n";
    var NativePanelInputOffsetLGStyles = "\n.NativePanel__textInputs {\n    margin-left: 38px;\n}\n";
    // touch
    var NativePanelTouchVoiceInputStyles = "\n.NativePanel.voice-input .CarouselTouch {\n    display: block;\n    position: absolute;\n    left: 23px;\n    top: 50%;\n    transform: translateY(-50%);\n}\n.NativePanel.voice-input .NativePanel__sphere {\n    margin: 0 auto;\n}\n\n.NativePanel.voice-input .NativePanel__textInputs {\n    position: absolute;\n    top: -6px;\n    left: 20px;\n    right: 20px;\n    transform: translateY(-100%);\n}\n\n.NativePanel.voice-input .NativePanel__textInputs .TextInput {\n    display: none;\n}\n\n.NativePanel.voice-input .NativePanel__touch {\n    position: absolute;\n    right: 23px;\n    top: 50%;\n    transform: translateY(-50%);\n}\n";
    var NativePanelTouchTextInputStyles = "\n.NativePanel.text-input .NativePanel__textInputs {\n    width: 100%;\n}\n.NativePanel.text-input .NativePanel__textInputs .Suggests {\n    width: auto;\n    position: absolute;\n    top: 0;\n    left: 20px;\n    right: 20px;\n    transform: translateY(-100%);\n}\n.NativePanel.text-input .NativePanel__sphere {\n    display: none;\n}\n.NativePanel.text-input .NativePanel__touch .KeyboardTouch {\n    display: none;\n}\n.NativePanel.text-input .NativePanel__touch .VoiceTouch {\n    display: block;\n}\n";
    var NativePanelTouchStyles = "\n" + NativePanelTouchVoiceInputStyles + "\n" + NativePanelTouchTextInputStyles + "\n\n.NativePanel.production-mode .Bubble {\n    display: none;\n}\n\n.NativePanel.has-suggestions.voice-input .Bubble {\n    top: -54px;\n}\n\n.NativePanel.has-suggestions.text-input .Bubble {\n    top: -46px;\n}\n";
    // desktop
    var NativePanelDesktopNotscreenshotModeStyles = "\n.NativePanel:not(.production-mode) .NativePanel__textInputs {\n    position: relative;\n    width: 100%;\n}\n\n.NativePanel:not(.production-mode) .NativePanel__textInputs .Suggests {\n    position: absolute;\n    top: -13px;\n    left: 0;\n    right: 0;\n    transform: translateY(-100%);\n}\n";
    var NativePanelDesktopscreenshotModeStyles = "\n.NativePanel.production-mode .NativePanel__textInputs .TextInput,\n.NativePanel.production-mode .Bubble {\n    display: none;\n}\n";
    var NativePanelDesktopBubblePositionLG = "\n.NativePanel.has-suggestions:not(.production-mode) .Bubble {\n    top: -33px;\n}\n";
    var NativePanelDesktopBubblePositionMD = "\n.NativePanel.has-suggestions:not(.production-mode) .Bubble {\n    top: -26px;\n}\n";
    var NativePanelDesktopStyles = "\n" + NativePanelDesktopNotscreenshotModeStyles + "\n" + NativePanelDesktopscreenshotModeStyles + "\n\n.NativePanel__sphere {\n    display: inline-block;\n}\n\n.NativePanel__touch {\n    display: none;\n}\n\n.NativePanel:not(.has-suggestions) .Bubble,\n.NativePanel:not(.has-suggestions):not(.production-mode) .Bubble {\n    top: 12px\n}\n";

    var styles$1 = "\n" + fontFace + "\n" + NativePanelStyles + "\n" + BubbleStyles + "\n" + CarouselTouchStyles + "\n" + KeyboardTouchStyles + "\n" + SphereButtonStyles + "\n" + SuggestsStyles + "\n" + TextInputStyles + "\n" + VoiceTouchStyles + "\n\n@keyframes rotation {\n    0% {\n        transform: rotate(0deg);\n    }\n    100% {\n        transform: rotate(360deg);\n    }\n}\n\n/** small */\n@media screen and (max-width: 639px) {\n    " + NativePanelTouchStyles + "\n    " + NativePanelPaddingsSMStyles + "\n\n    .Bubble {\n        " + BubbleMDStyles + "\n    }\n\n    .SphereButton {\n        " + SphereButtonMDStyles + "\n    }\n\n    .TextInput {\n        " + TextInputFilledStyles + "\n    }\n\n    .SuggestsSuggest {\n        " + SuggestMDStyles + "\n        " + SuggestOutlinedStyles + "\n    }\n}\n\n/** medium */\n@media screen and (min-width: 640px) and (max-width: 959px) {\n    " + NativePanelDesktopStyles + "\n    " + NativePanelDesktopBubblePositionMD + "\n    " + NativePanelInputOffsetMDStyles + "\n    " + NativePanelPaddingsMDStyles + "\n\n    .Bubble {\n        " + BubbleSMStyles + "\n    }\n\n    .SphereButton {\n        " + SphereButtonSMStyles + "\n    }\n\n    .TextInput {\n        " + TextInputPureStyles + "\n    }\n\n    .SuggestsSuggest {\n        " + SuggestSMStyles + "\n        " + SuggestFilledStyles + "\n    }\n}\n\n/** large */\n@media screen and (min-width: 960px) {\n    " + NativePanelDesktopStyles + "\n    " + NativePanelDesktopBubblePositionLG + "\n    " + NativePanelInputOffsetLGStyles + "\n    " + NativePanelPaddingsLGStyles + "\n\n    .bubble {\n        font-size: calc(16px * 1.5);\n    }\n\n    .Bubble {\n        " + BubbleMDStyles + "\n    }\n\n    .SphereButton {\n        " + SphereButtonMDStyles + "\n    }\n\n    .TextInput {\n        " + TextInputPureStyles + "\n    }\n    \n    .SuggestsSuggest {\n        " + SuggestLGStyles + "\n        /* " + SuggestMDStyles + " */\n        " + SuggestFilledStyles + "\n    }\n}\n";

    /* eslint-disable no-tabs */
    var saluteIcon = 'data:image/png;base64,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';
    var musicIcon = 'data:image/png;base64,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';
    var newsIcon = 'data:image/png;base64,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';
    var createCarouselTouchIcon = function (_a) {
        var iconBase64 = _a.iconBase64, level = _a.level;
        return "\n\t\t<div\n\t\t\tclass=\"CarouselTouchIcon\"\n\t\t\tstyle=\"left: " + (level === 1 ? 0 : (level - 1) * 49) + "%; z-index: " + (4 - level) + ";\"\n\t\t>\n\t\t\t<div\n\t\t\t\tclass=\"CarouselTouchIcon__mask\"\n\t\t\t\tstyle=\"opacity: " + (level === 1 ? 0 : (level - 1) * 0.35) + ";\"\n\t\t\t></div>\n\t\t\t<div\n\t\t\t\tclass=\"CarouselTouchIcon__icon\"\n\t\t\t\tstyle=\"background-image: url(" + iconBase64 + ");\"\n\t\t\t></div>\n\t\t</div>\n\t";
    };
    var template$1 = "\n\t<div id=\"NativePanel\">\n\t\t<style>" + styles$1 + "</style>\n\n\t\t<div id=\"Bubble\" class=\"Bubble\"></div>\n\n\t\t<div id=\"CarouselTouch\" class=\"CarouselTouch\">\n\t\t\t" + createCarouselTouchIcon({ iconBase64: saluteIcon, level: 1 }) + "\n\t\t\t" + createCarouselTouchIcon({ iconBase64: musicIcon, level: 2 }) + "\n\t\t\t" + createCarouselTouchIcon({ iconBase64: newsIcon, level: 3 }) + "\n\t\t</div>\n\n\t\t<div class=\"NativePanel__sphere\">\n\t\t\t<div id=\"SphereButton\"></div>\n\t\t</div>\n\n\t\t<div class=\"NativePanel__textInputs\">\n\t\t\t<input type=\"text\" id=\"voice\" class=\"TextInput\">\n\t\t\t<div id=\"Suggests\" class=\"Suggests\"></div>\n\t\t</div>\n\n\t\t<div class=\"NativePanel__touch\">\n\t\t\t<div id=\"KeyboardTouch\" class=\"KeyboardTouch\"></div>\n\t\t\t<div id=\"VoiceTouch\" class=\"VoiceTouch\"></div>\n\t\t</div>\n\t</div>\n";

    var cl = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args
            .join(' ')
            .replace(/undefined|false|true/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    var render$1 = function (_a) {
        var refs = _a.refs, _b = _a.props, className = _b.className, suggestions = _b.suggestions, screenshotMode = _b.screenshotMode, bubbleText = _b.bubbleText, _c = _b.defaultText, defaultText = _c === void 0 ? 'Какая погода в Москве?' : _c, tabIndex = _b.tabIndex, sendText = _b.sendText, sendServerAction = _b.sendServerAction, onListen = _b.onListen, onSubscribeListenStatus = _b.onSubscribeListenStatus, onSubscribeHypotesis = _b.onSubscribeHypotesis, _d = _a.state, inputType = _d.inputType, bubble = _d.bubble, recording = _d.recording, value = _d.value, setState = _a.setState, effect = _a.effect;
        effect(function () {
            setState({
                value: defaultText,
                recording: false,
                bubble: bubbleText,
                inputType: 'voice-input',
            });
        }, []);
        effect(function () {
            setState({ bubble: bubbleText });
        }, [bubbleText]);
        effect(function () {
            var clearBubble = function () { return setState({ bubble: '' }); };
            refs.Bubble.addEventListener('click', clearBubble);
            return function () { return refs.Bubble.removeEventListener('click', clearBubble); };
        }, [refs.Bubble]);
        effect(function () {
            var listen = function () {
                onListen();
                setState({ value: '' });
            };
            refs.SphereButton.addEventListener('click', listen);
            return function () { return refs.SphereButton.removeEventListener('click', listen); };
        }, [refs.SphereButton, onListen]);
        effect(function () {
            var handleSubmit = function (event) {
                if (event.key === 'Enter') {
                    sendText(value);
                    setState({ value: '' });
                }
            };
            var handleInput = function () {
                setState({ value: refs.TextInput.value });
            };
            refs.TextInput.addEventListener('input', handleInput);
            refs.TextInput.addEventListener('keydown', handleSubmit);
            return function () {
                refs.TextInput.removeEventListener('input', handleInput);
                refs.TextInput.removeEventListener('keydown', handleSubmit);
            };
        }, [refs.TextInput, sendText, value]);
        effect(function () {
            var toggleInputType = function () {
                setState(function (state) { return ({
                    inputType: state.inputType === 'voice-input' ? 'text-input' : 'voice-input',
                }); });
            };
            refs.KeyboardTouch.addEventListener('click', toggleInputType);
            refs.VoiceTouch.addEventListener('click', toggleInputType);
            return function () {
                refs.KeyboardTouch.removeEventListener('click', toggleInputType);
                refs.VoiceTouch.removeEventListener('click', toggleInputType);
            };
        }, [refs.Bubble]);
        effect(function () {
            var offs = [];
            var handleAction = function (action) {
                if (typeof action.text !== 'undefined') {
                    sendText(action.text);
                }
                else if (action.type === 'deep_link') {
                    window.open(action.deep_link, '_blank');
                }
                else if (action.type === 'server_action') {
                    sendServerAction(action.server_action);
                }
                else {
                    // eslint-disable-next-line no-console
                    console.error('Unsupported action', action);
                }
            };
            var createSuggestionHandler = function (suggestion) { return function () {
                var action = suggestion.action, actions = suggestion.actions;
                if (action) {
                    handleAction(action);
                }
                if (actions) {
                    actions.forEach(handleAction);
                }
            }; };
            suggestions.forEach(function (suggestion) {
                var item = document.createElement('div');
                var handleClick = createSuggestionHandler(suggestion);
                item.classList.add('SuggestsSuggest');
                item.innerText = suggestion.title;
                item.addEventListener('click', handleClick);
                offs.push(function () { return item.removeEventListener('click', handleClick); });
                refs.Suggestions.append(item);
            });
            return function () {
                offs.forEach(function (off) { return off(); });
                refs.Suggestions.innerHTML = '';
            };
        }, [suggestions, sendText, sendServerAction]);
        effect(function () {
            var unsubscribeStatus = onSubscribeListenStatus(function (type) {
                setState({ recording: type === 'listen' });
            });
            var unsubscribeHypotesis = onSubscribeHypotesis(function (hypotesis, last) {
                setState({ value: last ? '' : hypotesis });
            });
            return function () {
                unsubscribeStatus();
                unsubscribeHypotesis();
            };
        }, [onSubscribeListenStatus, onSubscribeHypotesis]);
        return function () {
            refs.NativePanel.setAttribute('class', cl('NativePanel', inputType, !!suggestions.length && 'has-suggestions', screenshotMode && 'production-mode', className));
            refs.Bubble.innerText = bubble;
            refs.SphereButton.setAttribute('class', cl('SphereButton', recording && 'active'));
            refs.TextInput.value = value;
            refs.TextInput.tabIndex = typeof tabIndex === 'number' && Number.isInteger(tabIndex) ? tabIndex : -1;
            refs.TextInput.disabled = recording;
        };
    };
    var nativePanel = createComponent({
        baseHTMLTemplate: template$1,
        createRefs: function (root) { return ({
            NativePanel: root.querySelector('#NativePanel'),
            Bubble: root.querySelector('#Bubble'),
            CarouselTouch: root.querySelector('#CarouselTouch'),
            KeyboardTouch: root.querySelector('#KeyboardTouch'),
            SphereButton: root.querySelector('#SphereButton'),
            Suggestions: root.querySelector('#Suggests'),
            TextInput: root.querySelector('#voice'),
            VoiceTouch: root.querySelector('#VoiceTouch'),
        }); },
        render: render$1,
    });

    var root;
    var renderNativePanel = function (props) {
        if (!root) {
            root = document.createElement('div');
            document.body.appendChild(root);
        }
        if (!props.hideNativePanel && nativePanel.mounted) {
            nativePanel.update(props);
            return;
        }
        if (props.hideNativePanel) {
            nativePanel.unmount();
            root.remove();
        }
        else {
            nativePanel.mount(root, props);
        }
    };

    var styles = "\n    .recordPanel {\n        position: fixed;\n        z-index: 999;\n        top: 0;\n        right: 0;\n    }\n\n    .recordButton {\n        margin-right: 8px;\n        margin-top: 8px;\n    }\n";
    var template = "\n    <div id=\"RecordPanel\" className=\"recordPanel\">\n        <style>" + styles + "</style>\n        <button id=\"RecordButtonStart\" className=\"recordButton\" type=\"button\">start</button>\n        <button id=\"RecordButtonStop\" className=\"recordButton\" type=\"button\">stop</button>\n        <button id=\"RecordButtonSave\" className=\"recordButton\" type=\"button\">save</button>\n        <button id=\"RecordButtonCopy\" className=\"recordButton\" type=\"button\">copy</button>\n    </div>\n";
    var defaultState = {
        isRecording: true,
        record: null,
    };
    var render = function (_a) {
        var refs = _a.refs, _b = _a.props, recorder = _b.recorder, onSave = _b.onSave, _c = _a.state, isRecording = _c.isRecording, record = _c.record, setState = _a.setState, effect = _a.effect;
        effect(function () { return setState(__assign({}, defaultState)); }, []);
        effect(function () {
            var offs = [];
            var handleStart = function () {
                recorder === null || recorder === void 0 ? void 0 : recorder.start();
                setState(__assign({}, defaultState));
            };
            var handleStop = function () {
                recorder === null || recorder === void 0 ? void 0 : recorder.stop();
                setState({
                    isRecording: false,
                    record: (recorder === null || recorder === void 0 ? void 0 : recorder.getRecord()) || null,
                });
            };
            refs.ButtonStart.addEventListener('click', handleStart);
            offs.push(function () { return refs.ButtonStart.removeEventListener('click', handleStart); });
            refs.ButtonStop.addEventListener('click', handleStop);
            offs.push(function () { return refs.ButtonStop.removeEventListener('click', handleStop); });
            return function () { return offs.forEach(function (off) { return off(); }); };
        }, [recorder, refs.ButtonStart, refs.ButtonStop]);
        effect(function () {
            var offs = [];
            var handleSave = function () {
                if (record) {
                    onSave(record);
                }
            };
            var handleCopy = function () {
                // eslint-disable-next-line no-console
                console.log('record to copy', record);
                if (record) {
                    navigator.clipboard.writeText(JSON.stringify(record, null, 4));
                }
            };
            refs.ButtonSave.addEventListener('click', handleSave);
            offs.push(function () { return refs.ButtonSave.removeEventListener('click', handleSave); });
            refs.ButtonCopy.addEventListener('click', handleCopy);
            offs.push(function () { return refs.ButtonCopy.removeEventListener('click', handleCopy); });
            return function () { return offs.forEach(function (off) { return off(); }); };
        }, [record, onSave, refs.ButtonSave, refs.ButtonCopy]);
        return function () {
            refs.ButtonStart.disabled = isRecording;
            refs.ButtonStop.disabled = !isRecording;
            refs.ButtonSave.disabled = record == null;
            refs.ButtonCopy.disabled = record == null;
        };
    };
    var recordPanel = createComponent({
        baseHTMLTemplate: template,
        createRefs: function (root) { return ({
            RecordPanel: root.querySelector('#RecordPanel'),
            ButtonStart: root.querySelector('#RecordButtonStart'),
            ButtonStop: root.querySelector('#RecordButtonStop'),
            ButtonSave: root.querySelector('#RecordButtonSave'),
            ButtonCopy: root.querySelector('#RecordButtonCopy'),
        }); },
        render: render,
    });
    var renderAssistantRecordPanel = function (recorder, saver) {
        var div = document.createElement('div');
        document.body.appendChild(div);
        recordPanel.mount(div, { recorder: recorder, onSave: saver.save });
    };

    var createConsoleLogger = function (level) {
        if (level === void 0) { level = 'debug'; }
        return function (entry) {
            switch (entry.type) {
                case 'init': {
                    console[level]('Initialize', entry.params);
                    break;
                }
                case 'incoming': {
                    console[level]('Received message', entry.message);
                    break;
                }
                case 'outcoming': {
                    console[level]('Sended message', entry.message);
                    break;
                }
            }
        };
    };

    var CURRENT_VERSION = '0.1.0';
    var getDefaultRecord = function () { return ({ entries: [], version: CURRENT_VERSION }); };
    var createLogCallbackRecorder = function (defaultActive) {
        if (defaultActive === void 0) { defaultActive = true; }
        var _a = createBaseRecorder(defaultActive, getDefaultRecord), stop = _a.stop, start = _a.start, updateRecord = _a.updateRecord, getRecord = _a.getRecord, prepareHandler = _a.prepareHandler;
        var handler = prepareHandler(function (entry) {
            switch (entry.type) {
                case 'incoming':
                    updateRecord(function (record) {
                        var _a;
                        // ифак внутри функции для того чтобы TS не волновался
                        // если написать снаружи вызова, то он не увидит эту проверку
                        if ((_a = entry.message.systemMessage) === null || _a === void 0 ? void 0 : _a.data) {
                            record.entries.push({
                                type: entry.type,
                                message: {
                                    data: JSON.parse(entry.message.systemMessage.data),
                                    name: entry.message.messageName,
                                },
                            });
                        }
                    });
                    updateRecord(function (record) {
                        if (entry.message.text) {
                            record.entries.push({ type: entry.type, text: entry.message.text });
                        }
                    });
                    break;
                case 'outcoming':
                    updateRecord(function (record) {
                        var _a;
                        if ((_a = entry.message.systemMessage) === null || _a === void 0 ? void 0 : _a.data) {
                            record.entries.push({
                                type: entry.type,
                                message: {
                                    data: JSON.parse(entry.message.systemMessage.data),
                                    name: entry.message.messageName,
                                },
                            });
                        }
                    });
                    updateRecord(function (record) {
                        if (entry.message.text) {
                            record.entries.push({ type: entry.type, text: entry.message.text });
                        }
                    });
                    break;
                default:
                    updateRecord(function (record) {
                        record.parameters = entry.params;
                    });
                    break;
            }
        });
        return {
            handler: handler,
            getRecord: getRecord,
            start: start,
            stop: stop,
        };
    };

    var createRecordDownloader = function () {
        return {
            save: function (record) {
                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record));
                var anchor = document.createElement('a');
                anchor.setAttribute('href', dataStr);
                anchor.setAttribute('download', 'assistant-log.json');
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
            },
        };
    };

    var prefix = 'recovery_';
    var createRecoveryStateRepository = function () {
        var get = function (key) {
            var value = localStorage.getItem("" + prefix + key);
            return value ? JSON.parse(value) : null;
        };
        var set = function (key, state) {
            state && localStorage.setItem("" + prefix + key, JSON.stringify(state));
        };
        var remove = function (key) {
            localStorage.removeItem("" + prefix + key);
        };
        return { get: get, set: set, remove: remove };
    };

    /* eslint-disable camelcase, no-underscore-dangle */
    var SDK_VERSION = '20.09.1.3576';
    var APP_VERSION = '1.17.4';
    // eslint-disable-next-line no-useless-concat
    var HOST_APP_ID = 'ru.sb' + 'erb' + 'ank.sdakit.demo';
    var FEATURES = JSON.stringify({
        appTypes: ['DIALOG', 'WEB_APP', 'CHAT_APP'],
    });
    var legacyDevice = {
        clientType: 'simple',
        channel: 'Android_SB',
        channelVersion: '8.1.0.2932_RC',
        platformName: 'WEBDBG 1.0',
        platformVersion: '1.0',
    };
    var initializeNativeSDKEmulator = function (_a) {
        var _b;
        var initPhrase = _a.initPhrase, url = _a.url, userChannel = _a.userChannel, surface = _a.surface, _c = _a.userId, userId = _c === void 0 ? "webdbg_userid_" + (Math.random().toString(36).substring(2, 13) + Math.random().toString(36).substring(2, 13)) : _c, _d = _a.token, token = _d === void 0 ? "webdbg_eribtoken_" + (Math.random().toString(36).substring(2, 13) + Math.random().toString(36).substring(2, 13)) : _d, surfaceVersion = _a.surfaceVersion, deviceId = _a.deviceId, _e = _a.locale, locale = _e === void 0 ? 'ru' : _e, _f = _a.nativePanel, nativePanel = _f === void 0 ? {
            defaultText: 'Покажи что-нибудь',
            render: renderNativePanel,
            screenshotMode: false,
        } : _f, _g = _a.sdkVersion, sdkVersion = _g === void 0 ? SDK_VERSION : _g, enableRecord = _a.enableRecord, recordParams = _a.recordParams, fakeVps = _a.fakeVps, _h = _a.settings, settings = _h === void 0 ? {} : _h, _j = _a.vpsVersion, vpsVersion = _j === void 0 ? 5 : _j, features = _a.features, capabilities = _a.capabilities, getMeta = _a.getMeta;
        var device = {
            platformType: 'WEBDBG',
            platformVersion: '1.0',
            sdkVersion: sdkVersion,
            surface: surface,
            surfaceVersion: surfaceVersion || APP_VERSION,
            features: features !== null && features !== void 0 ? features : FEATURES,
            capabilities: capabilities !== null && capabilities !== void 0 ? capabilities : JSON.stringify({
                screen: { available: true, width: window === null || window === void 0 ? void 0 : window.innerWidth, height: window === null || window === void 0 ? void 0 : window.innerHeight },
                speak: { available: true },
            }),
            deviceId: deviceId,
            additionalInfo: JSON.stringify({
                host_app_id: HOST_APP_ID,
                sdk_version: sdkVersion,
            }),
        };
        var recoveryStateRepository = createRecoveryStateRepository();
        var defaultRecorder = createLogCallbackRecorder((recordParams === null || recordParams === void 0 ? void 0 : recordParams.defaultActive) != null ? recordParams.defaultActive : true);
        var recorder = (_b = recordParams === null || recordParams === void 0 ? void 0 : recordParams.recorder) !== null && _b !== void 0 ? _b : defaultRecorder;
        var logger = (function () {
            var _a;
            if (enableRecord && (recordParams === null || recordParams === void 0 ? void 0 : recordParams.logger) == null) {
                return recorder.handler;
            }
            return (_a = recordParams === null || recordParams === void 0 ? void 0 : recordParams.logger) !== null && _a !== void 0 ? _a : createConsoleLogger();
        })();
        var saver = createRecordDownloader();
        var assistant = createAssistant({
            url: url,
            userId: userId,
            userChannel: userChannel,
            locale: locale,
            device: device,
            legacyDevice: legacyDevice,
            settings: __assign(__assign({}, settings), { dubbing: settings.dubbing === false ? -1 : 1, echo: settings.echo || -1 }),
            fakeVps: fakeVps,
            version: vpsVersion,
            logger: logger,
            getMeta: getMeta,
            getToken: function () { return Promise.resolve(token); },
        });
        var appInfo;
        var initialSmartAppData = [];
        var clientReady = false; // флаг готовности клиента к приему onData
        var assistantReady = false; // флаг готовности контекста ассистента
        var character;
        var suggestions = [];
        var bubbleText = '';
        var sendText = function (messasge) {
            assistant.sendText(messasge);
        };
        var emitOnData = function (command) {
            var _a;
            if (clientReady && assistantReady && ((_a = window.AssistantClient) === null || _a === void 0 ? void 0 : _a.onData)) {
                window.AssistantClient.onData(command);
            }
        };
        var fn = function () { return __awaiter(void 0, void 0, void 0, function () {
            var res, _i, _a, item;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, assistant.start({ initPhrase: initPhrase, disableGreetings: true })];
                    case 1:
                        res = _e.sent();
                        if (initPhrase && res) {
                            initialSmartAppData.push({
                                type: 'insets',
                                insets: { left: 0, top: 0, right: 0, bottom: 144 },
                                sdk_meta: { mid: '-1' },
                            });
                            appInfo = res === null || res === void 0 ? void 0 : res.app_info;
                            if (res === null || res === void 0 ? void 0 : res.character) {
                                character = res === null || res === void 0 ? void 0 : res.character.id;
                                initialSmartAppData.push({ type: 'character', character: res.character, sdk_meta: { mid: '-1' } });
                            }
                            for (_i = 0, _a = (res === null || res === void 0 ? void 0 : res.items) || []; _i < _a.length; _i++) {
                                item = _a[_i];
                                if (item.command != null && item.command.type === 'smart_app_data') {
                                    initialSmartAppData.push(__assign(__assign({}, item.command), { sdk_meta: { mid: '-1' } }));
                                }
                            }
                            window.appInitialData = initialSmartAppData;
                            if (appInfo && appInfo.applicationId) {
                                assistant.setActiveApp(appInfo, function () { var _a, _b; return Promise.resolve((((_b = (_a = window.AssistantClient) === null || _a === void 0 ? void 0 : _a.onRequestState) === null || _b === void 0 ? void 0 : _b.call(_a)) || {})); });
                                window.appRecoveryState = recoveryStateRepository.get(appInfo.applicationId);
                            }
                            if (clientReady && ((_b = window.AssistantClient) === null || _b === void 0 ? void 0 : _b.onData)) {
                                initialSmartAppData.forEach(function (c) { var _a, _b; return (_b = (_a = window.AssistantClient) === null || _a === void 0 ? void 0 : _a.onData) === null || _b === void 0 ? void 0 : _b.call(_a, c); });
                                ((_c = window.AssistantClient) === null || _c === void 0 ? void 0 : _c.onStart) && ((_d = window.AssistantClient) === null || _d === void 0 ? void 0 : _d.onStart());
                            }
                            assistantReady = true;
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        var promise = fn();
        window.appInitialData = [];
        window.appRecoveryState = null;
        window.AssistantHost = {
            cancelTts: function () {
                assistant.stopTts();
            },
            close: function () {
                var _a;
                if (appInfo && appInfo.applicationId) {
                    recoveryStateRepository.remove(appInfo.applicationId);
                    if ((_a = window.AssistantClient) === null || _a === void 0 ? void 0 : _a.onRequestRecoveryState) {
                        recoveryStateRepository.set(appInfo.applicationId, window.AssistantClient.onRequestRecoveryState());
                    }
                }
                assistant.closeApp();
                initialSmartAppData.splice(0, initialSmartAppData.length);
                window.appRecoveryState = null;
            },
            ready: function () {
                var _a, _b, _c;
                if (assistantReady && ((_a = window.AssistantClient) === null || _a === void 0 ? void 0 : _a.onData)) {
                    ((_b = window.AssistantClient) === null || _b === void 0 ? void 0 : _b.onStart) && ((_c = window.AssistantClient) === null || _c === void 0 ? void 0 : _c.onStart());
                }
                clientReady = true;
            },
            sendData: function (payload, messageName) {
                if (messageName === void 0) { messageName = null; }
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, promise];
                            case 1:
                                _a.sent();
                                assistant.sendServerAction(JSON.parse(payload), messageName || undefined);
                                return [2 /*return*/];
                        }
                    });
                });
            },
            sendDataContainer: function (container) {
                return __awaiter(this, void 0, void 0, function () {
                    var _a, data, messageName, requestId;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, promise];
                            case 1:
                                _b.sent();
                                _a = JSON.parse(container), data = _a.data, messageName = _a.message_name, requestId = _a.requestId;
                                assistant.sendServerAction(data, messageName || 'SERVER_ACTION', requestId);
                                return [2 /*return*/];
                        }
                    });
                });
            },
            setSuggests: function () { },
            setHints: function () { },
            sendText: sendText,
            setHeaderButtons: function () { },
        };
        var subscribeToListenerStatus = function (cb) {
            return assistant.on('assistant', function (event) {
                if (event.emotion) {
                    cb(event.emotion === 'listen' ? 'listen' : 'stopped');
                }
            });
        };
        var subscribeToListenerHypotesis = function (cb) {
            return assistant.on('assistant', function (event) {
                if (event.asr) {
                    cb(event.asr.text, typeof event.asr.last === 'undefined' ? false : event.asr.last);
                }
            });
        };
        var updateDevUI = function (params) {
            if (params === void 0) { params = {}; }
            if (nativePanel) {
                var render = nativePanel.render, props = __rest(nativePanel, ["render"]);
                (render || renderNativePanel)(__assign(__assign(__assign({}, props), params), { sendText: sendText, sendServerAction: assistant.sendServerAction, onListen: assistant.listen, suggestions: suggestions, bubbleText: bubbleText, onSubscribeListenStatus: subscribeToListenerStatus, onSubscribeHypotesis: subscribeToListenerHypotesis }));
            }
        };
        var nativePanelApi = {
            hide: function () {
                updateDevUI({ hideNativePanel: true });
            },
            show: function () {
                updateDevUI({ hideNativePanel: false });
            },
        };
        assistant.on('app', function (event) {
            var _a;
            switch (event.type) {
                case 'close':
                    (_a = window.AssistantHost) === null || _a === void 0 ? void 0 : _a.close();
                    break;
                case 'command':
                    emitOnData(event.command);
                    break;
            }
        });
        assistant.on('command', function (command) {
            if (command.type === 'system' && command.system.command.toUpperCase() === 'BACK') {
                window.history.back();
            }
        });
        assistant.on('vps', function (event) {
            var _a, _b;
            if (event.type !== 'incoming') {
                return;
            }
            var systemMessage = event.systemMessage;
            for (var _i = 0, _c = systemMessage.items || []; _i < _c.length; _i++) {
                var item = _c[_i];
                if (item.bubble) {
                    bubbleText = item.bubble.text;
                }
            }
            if (systemMessage.character && systemMessage.character.id !== character) {
                character = systemMessage.character.id;
                emitOnData({ type: 'character', character: systemMessage.character, sdk_meta: { mid: '-1' } });
            }
            suggestions = (_b = (_a = systemMessage.suggestions) === null || _a === void 0 ? void 0 : _a.buttons) !== null && _b !== void 0 ? _b : [];
            updateDevUI();
        });
        assistant.on('tts', function (event) {
            emitOnData({
                type: 'tts_state_update',
                state: event.status,
                owner: event.appInfo.applicationId === (appInfo === null || appInfo === void 0 ? void 0 : appInfo.applicationId),
            });
        });
        updateDevUI();
        enableRecord && renderAssistantRecordPanel(recorder, saver);
        window.__dangerouslySendTextMessage = sendText;
        return {
            sendText: sendText,
            nativePanel: nativePanelApi,
        };
    };

    /* eslint-disable camelcase */
    // eslint-disable-next-line no-useless-concat
    var stand = 'wss://nlp2b2b.sberchat.sb' + 'erb' + 'ank.ru/vps/';
    var channelForSurface = {
        COMPANION: 'COMPANION_B2C',
        SBOL: 'SBOL',
    };
    if (typeof window !== 'undefined' && typeof process !== 'undefined' && "development" === 'production') {
        console.warn('Чтобы уменьшить размер бандла - используйте if ("development" === "development") createSmartAppDebugger()');
    }
    var createAssistantDev = function (_a) {
        var getState = _a.getState, getRecoveryState = _a.getRecoveryState, ready = _a.ready, _b = _a.surface, surface = _b === void 0 ? 'SBERBOX' : _b, userChannel = _a.userChannel, sdkParams = __rest(_a, ["getState", "getRecoveryState", "ready", "surface", "userChannel"]);
        var nativePanel = initializeNativeSDKEmulator(__assign(__assign({}, sdkParams), { surface: surface, userChannel: userChannel || channelForSurface[surface] || 'B2C' })).nativePanel;
        return __assign(__assign({}, createAssistant$1({ getState: getState, getRecoveryState: getRecoveryState, ready: ready })), { nativePanel: nativePanel });
    };
    var parseJwt = function (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64)
            .split('')
            .map(function (c) { return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2); })
            .join(''));
        return JSON.parse(jsonPayload);
    };
    // Публичный метод, использующий токен из SmartApp Studio
    var createSmartappDebugger = function (_a) {
        var token = _a.token, getState = _a.getState, getRecoveryState = _a.getRecoveryState, ready = _a.ready, _b = _a.settings, settings = _b === void 0 ? {} : _b, nativePanel = _a.nativePanel, sdkParams = __rest(_a, ["token", "getState", "getRecoveryState", "ready", "settings", "nativePanel"]);
        try {
            var exp = parseJwt(token).exp;
            if (exp * 1000 <= Date.now()) {
                // eslint-disable-next-line no-alert
                alert('Срок действия токена истек!');
                throw new Error('Token expired');
            }
        }
        catch (exc) {
            if (exc.message !== 'Token expired') {
                // eslint-disable-next-line no-alert
                alert('Указан невалидный токен!');
                throw new Error('Wrong token');
            }
            throw exc;
        }
        return createAssistantDev(__assign(__assign({}, sdkParams), { token: token, settings: __assign(__assign({}, settings), { authConnector: 'developer_portal_jwt' }), nativePanel: nativePanel, getState: getState, getRecoveryState: getRecoveryState, ready: ready, url: stand }));
    };

    // Generated by robots, do not change this manually!
    var darkSber = {
        ":root": {
            "--plasma-colors-white": "#FFFFFF",
            "--plasma-colors-whitePrimary": "#FFFFFF",
            "--plasma-colors-whiteSecondary": "rgba(255, 255, 255, 0.56)",
            "--plasma-colors-whiteTertiary": "rgba(255, 255, 255, 0.28)",
            "--plasma-colors-black": "#080808",
            "--plasma-colors-blackPrimary": "#080808",
            "--plasma-colors-blackSecondary": "rgba(8, 8, 8, 0.56)",
            "--plasma-colors-blackTertiary": "rgba(8, 8, 8, 0.28)",
            "--plasma-colors-dark01": "#171717",
            "--plasma-colors-dark02": "#232323",
            "--plasma-colors-dark03": "#363636",
            "--plasma-colors-transparent": "rgba(0, 0, 0, 0)",
            "--plasma-colors-buttonClear": "rgba(0, 0, 0, 0)",
            "--plasma-colors-buttonBlack": "#080808",
            "--plasma-colors-buttonBlackSecondary": "rgba(8, 8, 8, 0.12)",
            "--plasma-colors-buttonBlackTransparent": "rgba(8, 8, 8, 0.56)",
            "--plasma-colors-buttonWhite": "#FFFFFF",
            "--plasma-colors-buttonWhiteSecondary": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-text": "rgba(255, 255, 255, 0.96)",
            "--plasma-colors-primary": "rgba(255, 255, 255, 0.96)",
            "--plasma-colors-secondary": "rgba(255, 255, 255, 0.56)",
            "--plasma-colors-tertiary": "rgba(255, 255, 255, 0.28)",
            "--plasma-colors-paragraph": "rgba(255, 255, 255, 0.96)",
            "--plasma-colors-inverse": "#080808",
            "--plasma-colors-background": "#080808",
            "--plasma-colors-backgroundPrimary": "#171717",
            "--plasma-colors-backgroundSecondary": "#232323",
            "--plasma-colors-backgroundTertiary": "#363636",
            "--plasma-colors-success": "#24B23E",
            "--plasma-colors-warning": "#FA6D20",
            "--plasma-colors-critical": "#FF4D5F",
            "--plasma-colors-overlay": "rgba(0, 0, 0, 0.8)",
            "--plasma-colors-surfaceLiquid01": "rgba(255, 255, 255, 0.06)",
            "--plasma-colors-surfaceLiquid02": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-surfaceLiquid03": "rgba(255, 255, 255, 0.2)",
            "--plasma-colors-surfaceSolid01": "#171717",
            "--plasma-colors-surfaceSolid02": "#232323",
            "--plasma-colors-surfaceSolid03": "#363636",
            "--plasma-colors-surfaceCard": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-buttonPrimary": "#FFFFFF",
            "--plasma-colors-buttonSecondary": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-buttonSuccess": "#21A038",
            "--plasma-colors-buttonWarning": "#E35502",
            "--plasma-colors-buttonCritical": "#FF2E43",
            "--plasma-colors-buttonChecked": "#FFFFFF",
            "--plasma-colors-skeletonGradient": "linear-gradient( 90deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.08) 6.25%, rgba(255, 255, 255, 0.05) 12.5%, rgba(255, 255, 255, 0.01) 25%, rgba(255, 255, 255, 0.05) 37.5%, rgba(255, 255, 255, 0.08) 43.75%, rgba(255, 255, 255, 0.09) 50%, rgba(255, 255, 255, 0.08) 56.25%, rgba(255, 255, 255, 0.05) 62.5%, rgba(255, 255, 255, 0.01) 75%, rgba(255, 255, 255, 0.05) 87.5%, rgba(255, 255, 255, 0.08) 93.75%, rgba(255, 255, 255, 0.09) 100% )",
            "--plasma-colors-skeletonGradientLighter": "linear-gradient( 90deg, rgba(255, 255, 255, 0.36) 0%, rgba(255, 255, 255, 0.32) 6.25%, rgba(255, 255, 255, 0.20) 12.5%, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.20) 37.5%, rgba(255, 255, 255, 0.32) 43.75%, rgba(255, 255, 255, 0.36) 50%, rgba(255, 255, 255, 0.08) 56.25%, rgba(255, 255, 255, 0.20) 62.5%, rgba(255, 255, 255, 0.04) 75%, rgba(255, 255, 255, 0.20) 87.5%, rgba(255, 255, 255, 0.32) 93.75%, rgba(255, 255, 255, 0.36) 100% )",
            "--plasma-colors-speechBubbleSent": "rgba(0, 0, 0, 0.28)",
            "--plasma-colors-speechBubbleReceived": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-accent": "#24B23E",
            "--plasma-colors-buttonAccent": "#21A038",
            "--plasma-colors-buttonFocused": "#21A038",
            "--plasma-colors-gradient": "linear-gradient(336.84deg, rgba(20, 116, 70, 0.6) 0%, rgba(8, 8, 8, 0) 64.88%), radial-gradient(100% 100% at 75.89% 100%, rgba(0, 133, 255, 0.24) 0%, rgba(0, 71, 255, 0.03) 100%), linear-gradient(180deg, rgba(8, 8, 8, 0) 50%, rgba(7, 71, 33, 0.3) 100%), linear-gradient(270deg, #061621 0%, rgba(8, 8, 8, 0) 100%)",
            "--plasma-colors-gradientDevice": "linear-gradient(26.05deg, rgba(15, 153, 24, 0.28) 0%, rgba(8, 8, 8, 0) 72.24%), radial-gradient(100% 100% at 0% 100%, rgba(0, 170, 255, 0.24) 0%, rgba(8, 8, 8, 0) 99.69%), radial-gradient(74.68% 149.35% at 50% 149.35%, rgba(0, 102, 255, 0.6) 0%, rgba(8, 8, 8, 0) 99.69%)",
            "--plasma-colors-voicePhraseGradient": "linear-gradient(45deg, hsla(130, 75.63025210084032%, 46.666666666666664%, 1) 0%, hsla(189.78947368421052, 78.51239669421487%, 52.54901960784314%, 1) 100%)",
            "color": "rgba(255, 255, 255, 0.96)",
            "backgroundColor": "#080808"
        }
    };

    // Generated by robots, do not change this manually!
    var darkEva = {
        ":root": {
            "--plasma-colors-white": "#FFFFFF",
            "--plasma-colors-whitePrimary": "#FFFFFF",
            "--plasma-colors-whiteSecondary": "rgba(255, 255, 255, 0.56)",
            "--plasma-colors-whiteTertiary": "rgba(255, 255, 255, 0.28)",
            "--plasma-colors-black": "#080808",
            "--plasma-colors-blackPrimary": "#080808",
            "--plasma-colors-blackSecondary": "rgba(8, 8, 8, 0.56)",
            "--plasma-colors-blackTertiary": "rgba(8, 8, 8, 0.28)",
            "--plasma-colors-dark01": "#171717",
            "--plasma-colors-dark02": "#232323",
            "--plasma-colors-dark03": "#363636",
            "--plasma-colors-transparent": "rgba(0, 0, 0, 0)",
            "--plasma-colors-buttonClear": "rgba(0, 0, 0, 0)",
            "--plasma-colors-buttonBlack": "#080808",
            "--plasma-colors-buttonBlackSecondary": "rgba(8, 8, 8, 0.12)",
            "--plasma-colors-buttonBlackTransparent": "rgba(8, 8, 8, 0.56)",
            "--plasma-colors-buttonWhite": "#FFFFFF",
            "--plasma-colors-buttonWhiteSecondary": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-text": "rgba(255, 255, 255, 0.96)",
            "--plasma-colors-primary": "rgba(255, 255, 255, 0.96)",
            "--plasma-colors-secondary": "rgba(255, 255, 255, 0.56)",
            "--plasma-colors-tertiary": "rgba(255, 255, 255, 0.28)",
            "--plasma-colors-paragraph": "rgba(255, 255, 255, 0.96)",
            "--plasma-colors-inverse": "#080808",
            "--plasma-colors-background": "#080808",
            "--plasma-colors-backgroundPrimary": "#171717",
            "--plasma-colors-backgroundSecondary": "#232323",
            "--plasma-colors-backgroundTertiary": "#363636",
            "--plasma-colors-success": "#24B23E",
            "--plasma-colors-warning": "#FA6D20",
            "--plasma-colors-critical": "#FF4D5F",
            "--plasma-colors-overlay": "rgba(0, 0, 0, 0.8)",
            "--plasma-colors-surfaceLiquid01": "rgba(255, 255, 255, 0.06)",
            "--plasma-colors-surfaceLiquid02": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-surfaceLiquid03": "rgba(255, 255, 255, 0.2)",
            "--plasma-colors-surfaceSolid01": "#171717",
            "--plasma-colors-surfaceSolid02": "#232323",
            "--plasma-colors-surfaceSolid03": "#363636",
            "--plasma-colors-surfaceCard": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-buttonPrimary": "#FFFFFF",
            "--plasma-colors-buttonSecondary": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-buttonSuccess": "#21A038",
            "--plasma-colors-buttonWarning": "#E35502",
            "--plasma-colors-buttonCritical": "#FF2E43",
            "--plasma-colors-buttonChecked": "#FFFFFF",
            "--plasma-colors-skeletonGradient": "linear-gradient( 90deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.08) 6.25%, rgba(255, 255, 255, 0.05) 12.5%, rgba(255, 255, 255, 0.01) 25%, rgba(255, 255, 255, 0.05) 37.5%, rgba(255, 255, 255, 0.08) 43.75%, rgba(255, 255, 255, 0.09) 50%, rgba(255, 255, 255, 0.08) 56.25%, rgba(255, 255, 255, 0.05) 62.5%, rgba(255, 255, 255, 0.01) 75%, rgba(255, 255, 255, 0.05) 87.5%, rgba(255, 255, 255, 0.08) 93.75%, rgba(255, 255, 255, 0.09) 100% )",
            "--plasma-colors-skeletonGradientLighter": "linear-gradient( 90deg, rgba(255, 255, 255, 0.36) 0%, rgba(255, 255, 255, 0.32) 6.25%, rgba(255, 255, 255, 0.20) 12.5%, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.20) 37.5%, rgba(255, 255, 255, 0.32) 43.75%, rgba(255, 255, 255, 0.36) 50%, rgba(255, 255, 255, 0.08) 56.25%, rgba(255, 255, 255, 0.20) 62.5%, rgba(255, 255, 255, 0.04) 75%, rgba(255, 255, 255, 0.20) 87.5%, rgba(255, 255, 255, 0.32) 93.75%, rgba(255, 255, 255, 0.36) 100% )",
            "--plasma-colors-speechBubbleSent": "rgba(0, 0, 0, 0.28)",
            "--plasma-colors-speechBubbleReceived": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-accent": "#129DFA",
            "--plasma-colors-buttonAccent": "#078CE4",
            "--plasma-colors-buttonFocused": "#078CE4",
            "--plasma-colors-gradient": "linear-gradient(336.9deg, #143787 0%, rgba(8, 8, 8, 0) 64.95%), radial-gradient(66.53% 100% at 73.33% 100%, rgba(110, 5, 193, 0.44) 0%, rgba(53, 19, 149, 0.1) 99.69%), linear-gradient(180.03deg, rgba(8, 8, 8, 0) 50%, rgba(25, 63, 152, 0.41) 99.97%), linear-gradient(270deg, rgba(39, 15, 107, 0.3) 0%, rgba(8, 8, 8, 0) 100%)",
            "--plasma-colors-gradientDevice": "linear-gradient(26.05deg, rgba(26, 140, 255, 0.16) 0%, rgba(8, 8, 8, 0) 72.24%), radial-gradient(100% 100% at 0% 100%, rgba(0, 85, 255, 0.28) 0%, rgba(8, 8, 8, 0) 99.69%), radial-gradient(74.68% 149.35% at 50% 149.35%, rgba(128, 0, 255, 0.48) 0%, rgba(8, 8, 8, 0) 99.69%)",
            "--plasma-colors-voicePhraseGradient": "linear-gradient(45deg, hsla(200.11764705882354, 94.44444444444446%, 64.70588235294117%, 1) 0%, hsla(240, 100%, 83.92156862745098%, 1) 100%)",
            "color": "rgba(255, 255, 255, 0.96)",
            "backgroundColor": "#080808"
        }
    };

    // Generated by robots, do not change this manually!
    var darkJoy = {
        ":root": {
            "--plasma-colors-white": "#FFFFFF",
            "--plasma-colors-whitePrimary": "#FFFFFF",
            "--plasma-colors-whiteSecondary": "rgba(255, 255, 255, 0.56)",
            "--plasma-colors-whiteTertiary": "rgba(255, 255, 255, 0.28)",
            "--plasma-colors-black": "#080808",
            "--plasma-colors-blackPrimary": "#080808",
            "--plasma-colors-blackSecondary": "rgba(8, 8, 8, 0.56)",
            "--plasma-colors-blackTertiary": "rgba(8, 8, 8, 0.28)",
            "--plasma-colors-dark01": "#171717",
            "--plasma-colors-dark02": "#232323",
            "--plasma-colors-dark03": "#363636",
            "--plasma-colors-transparent": "rgba(0, 0, 0, 0)",
            "--plasma-colors-buttonClear": "rgba(0, 0, 0, 0)",
            "--plasma-colors-buttonBlack": "#080808",
            "--plasma-colors-buttonBlackSecondary": "rgba(8, 8, 8, 0.12)",
            "--plasma-colors-buttonBlackTransparent": "rgba(8, 8, 8, 0.56)",
            "--plasma-colors-buttonWhite": "#FFFFFF",
            "--plasma-colors-buttonWhiteSecondary": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-text": "rgba(255, 255, 255, 0.96)",
            "--plasma-colors-primary": "rgba(255, 255, 255, 0.96)",
            "--plasma-colors-secondary": "rgba(255, 255, 255, 0.56)",
            "--plasma-colors-tertiary": "rgba(255, 255, 255, 0.28)",
            "--plasma-colors-paragraph": "rgba(255, 255, 255, 0.96)",
            "--plasma-colors-inverse": "#080808",
            "--plasma-colors-background": "#080808",
            "--plasma-colors-backgroundPrimary": "#171717",
            "--plasma-colors-backgroundSecondary": "#232323",
            "--plasma-colors-backgroundTertiary": "#363636",
            "--plasma-colors-success": "#24B23E",
            "--plasma-colors-warning": "#FA6D20",
            "--plasma-colors-critical": "#FF4D5F",
            "--plasma-colors-overlay": "rgba(0, 0, 0, 0.8)",
            "--plasma-colors-surfaceLiquid01": "rgba(255, 255, 255, 0.06)",
            "--plasma-colors-surfaceLiquid02": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-surfaceLiquid03": "rgba(255, 255, 255, 0.2)",
            "--plasma-colors-surfaceSolid01": "#171717",
            "--plasma-colors-surfaceSolid02": "#232323",
            "--plasma-colors-surfaceSolid03": "#363636",
            "--plasma-colors-surfaceCard": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-buttonPrimary": "#FFFFFF",
            "--plasma-colors-buttonSecondary": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-buttonSuccess": "#21A038",
            "--plasma-colors-buttonWarning": "#E35502",
            "--plasma-colors-buttonCritical": "#FF2E43",
            "--plasma-colors-buttonChecked": "#FFFFFF",
            "--plasma-colors-skeletonGradient": "linear-gradient( 90deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.08) 6.25%, rgba(255, 255, 255, 0.05) 12.5%, rgba(255, 255, 255, 0.01) 25%, rgba(255, 255, 255, 0.05) 37.5%, rgba(255, 255, 255, 0.08) 43.75%, rgba(255, 255, 255, 0.09) 50%, rgba(255, 255, 255, 0.08) 56.25%, rgba(255, 255, 255, 0.05) 62.5%, rgba(255, 255, 255, 0.01) 75%, rgba(255, 255, 255, 0.05) 87.5%, rgba(255, 255, 255, 0.08) 93.75%, rgba(255, 255, 255, 0.09) 100% )",
            "--plasma-colors-skeletonGradientLighter": "linear-gradient( 90deg, rgba(255, 255, 255, 0.36) 0%, rgba(255, 255, 255, 0.32) 6.25%, rgba(255, 255, 255, 0.20) 12.5%, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.20) 37.5%, rgba(255, 255, 255, 0.32) 43.75%, rgba(255, 255, 255, 0.36) 50%, rgba(255, 255, 255, 0.08) 56.25%, rgba(255, 255, 255, 0.20) 62.5%, rgba(255, 255, 255, 0.04) 75%, rgba(255, 255, 255, 0.20) 87.5%, rgba(255, 255, 255, 0.32) 93.75%, rgba(255, 255, 255, 0.36) 100% )",
            "--plasma-colors-speechBubbleSent": "rgba(0, 0, 0, 0.28)",
            "--plasma-colors-speechBubbleReceived": "rgba(255, 255, 255, 0.12)",
            "--plasma-colors-accent": "#C370FA",
            "--plasma-colors-buttonAccent": "#B559F3",
            "--plasma-colors-buttonFocused": "#B559F3",
            "--plasma-colors-gradient": "linear-gradient(336.9deg, rgba(255, 156, 101, 0.24) 0%, rgba(8, 8, 8, 0) 64.95%), radial-gradient(66.53% 100% at 73.33% 100%, rgba(61, 19, 149, 0.34) 0%, rgba(19, 24, 149, 0.1) 99.69%), linear-gradient(180.03deg, rgba(8, 8, 8, 0) 50%, rgba(255, 215, 179, 0.15) 99.97%), linear-gradient(270deg, rgba(107, 15, 87, 0.2) 0%, rgba(8, 8, 8, 0) 100%)",
            "--plasma-colors-gradientDevice": "linear-gradient(26.05deg, rgba(26, 140, 255, 0.16) 0%, rgba(8, 8, 8, 0) 72.24%), radial-gradient(100% 100% at 0% 100%, rgba(0, 85, 255, 0.28) 0%, rgba(8, 8, 8, 0) 99.69%), radial-gradient(74.68% 149.35% at 50% 149.35%, rgba(128, 0, 255, 0.48) 0%, rgba(8, 8, 8, 0) 99.69%)",
            "--plasma-colors-voicePhraseGradient": "linear-gradient(45deg, hsla(19.862068965517242, 100%, 71.56862745098039%, 1) 0%, hsla(319.8058252427184, 94.49541284403672%, 78.62745098039217%, 1) 100%)",
            "color": "rgba(255, 255, 255, 0.96)",
            "backgroundColor": "#080808"
        }
    };

    class Css {
      static of (json) {
        const selectors = Object.keys(json);
        return selectors.map((selector) => {
          const definition = json[selector];
          const rules = Object.keys(definition);
          const result = rules.map((rule) => {
            return `${rule}:${definition[rule]}`
          }).join(';');
          return `${selector}{${result}}`
        }).join('\n')
      }
    }

    var css = Css;

    var jsonToCss = css;

    const themes = { eva: darkEva, joy: darkJoy, sber: darkSber };
    function getTheme(character) {
        return jsonToCss.of(themes[character]);
    }
    const sheetIndex = 1;
    function setTheme(character) {
        let sheet = document.styleSheets[sheetIndex];
        // @ts-ignore
        if (sheet.cssRules[0].selectorText === ':root') {
            sheet.deleteRule(0);
        }
        sheet.insertRule(getTheme(character), 0);
    }

    function noop() {
    }
    // @ts-ignore
    const logger = Object.keys(console).reduce((memo, key) => {
        if (typeof console[key] == "function") {
            //keep a copy just in case we need it
            memo[key] = console[key];
            //de-fang any functions
            console[key] = noop;
        }
        return memo;
    }, {});

    /* src\Help.svelte generated by Svelte v3.48.0 */
    const file$1 = "src\\Help.svelte";
    const get_rules_slot_changes = dirty => ({});
    const get_rules_slot_context = ctx => ({});
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    function create_fragment$1(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let hr0;
    	let t2;
    	let t3;
    	let hr1;
    	let t4;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const header_slot_template = /*#slots*/ ctx[4].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[3], get_header_slot_context);
    	const rules_slot_template = /*#slots*/ ctx[4].rules;
    	const rules_slot = create_slot(rules_slot_template, ctx, /*$$scope*/ ctx[3], get_rules_slot_context);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			if (header_slot) header_slot.c();
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			if (rules_slot) rules_slot.c();
    			t3 = space();
    			hr1 = element("hr");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Закрыть";
    			attr_dev(div0, "class", "help-background svelte-f9kz8c");
    			add_location(div0, file$1, 41, 0, 1100);
    			add_location(hr0, file$1, 45, 4, 1262);
    			add_location(hr1, file$1, 47, 4, 1304);
    			attr_dev(button, "class", "but svelte-f9kz8c");
    			add_location(button, file$1, 48, 4, 1314);
    			attr_dev(div1, "class", "help svelte-f9kz8c");
    			attr_dev(div1, "role", "dialog");
    			attr_dev(div1, "aria-modal", "true");
    			add_location(div1, file$1, 43, 0, 1156);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);

    			if (header_slot) {
    				header_slot.m(div1, null);
    			}

    			append_dev(div1, t1);
    			append_dev(div1, hr0);
    			append_dev(div1, t2);

    			if (rules_slot) {
    				rules_slot.m(div1, null);
    			}

    			append_dev(div1, t3);
    			append_dev(div1, hr1);
    			append_dev(div1, t4);
    			append_dev(div1, button);
    			/*div1_binding*/ ctx[5](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*handle_keydown*/ ctx[2], false, false, false),
    					listen_dev(div0, "click", /*close*/ ctx[1], false, false, false),
    					listen_dev(button, "click", /*close*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (header_slot) {
    				if (header_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						header_slot,
    						header_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[3], dirty, get_header_slot_changes),
    						get_header_slot_context
    					);
    				}
    			}

    			if (rules_slot) {
    				if (rules_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						rules_slot,
    						rules_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(rules_slot_template, /*$$scope*/ ctx[3], dirty, get_rules_slot_changes),
    						get_rules_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(rules_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(rules_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (header_slot) header_slot.d(detaching);
    			if (rules_slot) rules_slot.d(detaching);
    			/*div1_binding*/ ctx[5](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Help', slots, ['header','rules']);
    	const dispatch = createEventDispatcher();
    	const close = () => dispatch('close');
    	let help;

    	const handle_keydown = e => {
    		if (e.key === 'Escape') {
    			close();
    			return;
    		}

    		if (e.key === 'Tab') {
    			// trap focus
    			const nodes = help.querySelectorAll('*');

    			const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && e.shiftKey) index = 0;
    			index += tabbable.length + (e.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			e.preventDefault();
    		}
    	};

    	const previously_focused = typeof document !== 'undefined' && document.activeElement;

    	if (previously_focused) {
    		onDestroy(() => {
    			previously_focused.focus();
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Help> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			help = $$value;
    			$$invalidate(0, help);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		dispatch,
    		close,
    		help,
    		handle_keydown,
    		previously_focused
    	});

    	$$self.$inject_state = $$props => {
    		if ('help' in $$props) $$invalidate(0, help = $$props.help);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [help, close, handle_keydown, $$scope, slots, div1_binding];
    }

    class Help extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Help",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.48.0 */

    const { Error: Error_1 } = globals;
    const file = "src\\App.svelte";

    // (1204:8) {#if rand.length <= 10}
    function create_if_block_3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[3] && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*visible*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(1204:8) {#if rand.length <= 10}",
    		ctx
    	});

    	return block;
    }

    // (1205:12) {#if visible}
    function create_if_block_4(ctx) {
    	let p;
    	let t;
    	let p_transition;
    	let current;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*rand*/ ctx[1]);
    			attr_dev(p, "class", "answer svelte-632dpn");
    			add_location(p, file, 1205, 16, 24093);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*rand*/ 2) set_data_dev(t, /*rand*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!p_transition) p_transition = create_bidirectional_transition(p, /*typewriter*/ ctx[8], {}, true);
    				p_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!p_transition) p_transition = create_bidirectional_transition(p, /*typewriter*/ ctx[8], {}, false);
    			p_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching && p_transition) p_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(1205:12) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (1209:8) {#if rand.length > 10}
    function create_if_block_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[3] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*visible*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(1209:8) {#if rand.length > 10}",
    		ctx
    	});

    	return block;
    }

    // (1210:12) {#if visible}
    function create_if_block_2(ctx) {
    	let p;
    	let t;
    	let p_transition;
    	let current;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*rand*/ ctx[1]);
    			attr_dev(p, "class", "answer4 svelte-632dpn");
    			add_location(p, file, 1210, 16, 24256);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*rand*/ 2) set_data_dev(t, /*rand*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!p_transition) p_transition = create_bidirectional_transition(p, /*typewriter*/ ctx[8], {}, true);
    				p_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!p_transition) p_transition = create_bidirectional_transition(p, /*typewriter*/ ctx[8], {}, false);
    			p_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching && p_transition) p_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(1210:12) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (1223:8) {#if helpIsAsked}
    function create_if_block(ctx) {
    	let help;
    	let current;

    	help = new Help({
    			props: {
    				$$slots: {
    					rules: [create_rules_slot],
    					header: [create_header_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	help.$on("close", /*close_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(help.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(help, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const help_changes = {};

    			if (dirty & /*$$scope*/ 134217728) {
    				help_changes.$$scope = { dirty, ctx };
    			}

    			help.$set(help_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(help.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(help.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(help, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(1223:8) {#if helpIsAsked}",
    		ctx
    	});

    	return block;
    }

    // (1225:16) 
    function create_header_slot(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Правила игры «Английский крокодил»";
    			attr_dev(h2, "slot", "header");
    			attr_dev(h2, "class", "header svelte-632dpn");
    			add_location(h2, file, 1224, 16, 24853);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot.name,
    		type: "slot",
    		source: "(1225:16) ",
    		ctx
    	});

    	return block;
    }

    // (1228:16) 
    function create_rules_slot(ctx) {
    	let div;
    	let b0;
    	let t1;
    	let br0;
    	let t2;
    	let b1;
    	let t4;
    	let br1;
    	let t5;
    	let br2;
    	let t6;
    	let br3;
    	let t7;
    	let br4;
    	let t8;
    	let br5;
    	let t9;
    	let br6;
    	let t10;
    	let br7;
    	let t11;
    	let b2;
    	let t13;
    	let br8;
    	let t14;
    	let br9;
    	let t15;
    	let br10;
    	let t16;
    	let br11;

    	const block = {
    		c: function create() {
    			div = element("div");
    			b0 = element("b");
    			b0.textContent = "Английский крокодил";
    			t1 = text(" -  это игра на подражание, в которой один игрок пытается изобразить или объяснить слово на экране без использования речи или звуков.\r\n                    Задача других игроков состоит в том, чтобы угадать, что именно он пытается изобразить.");
    			br0 = element("br");
    			t2 = space();
    			b1 = element("b");
    			b1.textContent = "Правила игры:";
    			t4 = space();
    			br1 = element("br");
    			t5 = text("\r\n                    1. Определите, кто будет первым \"крокодилом\". Это может быть любой из игроков или же можно выбрать по очереди.");
    			br2 = element("br");
    			t6 = text("\r\n                    2. Крокодил изображает с экрана слово или фразу с помощью жестов, мимики и движений тела, не произнося ни звука. Нельзя произносить слово даже по буквам.");
    			br3 = element("br");
    			t7 = text("\r\n                    3. Остальные игроки наблюдают за крокодилом и пытаются угадать, что он изображает. Они могут предлагать свои варианты ответов вслух.");
    			br4 = element("br");
    			t8 = text("\r\n                    4. Если кто-то угадывает правильно, то этот игрок становится следующим \"крокодилом\" и описывает новое слово или фразу.");
    			br5 = element("br");
    			t9 = text("\r\n                    5. Слово считается разгаданным, если слово произнесено именно так, как оно было загадано.");
    			br6 = element("br");
    			t10 = text("\r\n                    Важно помнить, что во время игры \"крокодил\" не должен произносить слова, \r\n                    использовать какие-либо звуки или писать что-либо. \r\n                    Его задача - только изображать слово или фразу с помощью движений и жестов.\r\n                    Желаем вам увлекательной и занимательной игры!");
    			br7 = element("br");
    			t11 = space();
    			b2 = element("b");
    			b2.textContent = "Правила пользования приложением:";
    			t13 = space();
    			br8 = element("br");
    			t14 = text("\r\n                    Кнопка «Новое слово»  - показывает новое слово. ");
    			br9 = element("br");
    			t15 = text("\r\n                    Кнопка «Угадано» - увеличивает счетчик угаданных из всех слов. ");
    			br10 = element("br");
    			t16 = text("\r\n                    Кнопка «Не угадано» - увеличивает счетчик всех слов. ");
    			br11 = element("br");
    			add_location(b0, file, 1228, 20, 25057);
    			add_location(br0, file, 1229, 106, 25324);
    			add_location(b1, file, 1230, 20, 25352);
    			add_location(br1, file, 1230, 42, 25374);
    			add_location(br2, file, 1231, 130, 25512);
    			add_location(br3, file, 1232, 173, 25693);
    			add_location(br4, file, 1233, 152, 25853);
    			add_location(br5, file, 1234, 138, 25999);
    			add_location(br6, file, 1235, 109, 26116);
    			add_location(br7, file, 1239, 66, 26455);
    			add_location(b2, file, 1240, 20, 26483);
    			add_location(br8, file, 1240, 61, 26524);
    			add_location(br9, file, 1241, 68, 26599);
    			add_location(br10, file, 1242, 83, 26689);
    			add_location(br11, file, 1243, 73, 26769);
    			attr_dev(div, "slot", "rules");
    			attr_dev(div, "class", "rules svelte-632dpn");
    			set_style(div, "color", "black");
    			add_location(div, file, 1227, 16, 24983);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, b0);
    			append_dev(div, t1);
    			append_dev(div, br0);
    			append_dev(div, t2);
    			append_dev(div, b1);
    			append_dev(div, t4);
    			append_dev(div, br1);
    			append_dev(div, t5);
    			append_dev(div, br2);
    			append_dev(div, t6);
    			append_dev(div, br3);
    			append_dev(div, t7);
    			append_dev(div, br4);
    			append_dev(div, t8);
    			append_dev(div, br5);
    			append_dev(div, t9);
    			append_dev(div, br6);
    			append_dev(div, t10);
    			append_dev(div, br7);
    			append_dev(div, t11);
    			append_dev(div, b2);
    			append_dev(div, t13);
    			append_dev(div, br8);
    			append_dev(div, t14);
    			append_dev(div, br9);
    			append_dev(div, t15);
    			append_dev(div, br10);
    			append_dev(div, t16);
    			append_dev(div, br11);
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_rules_slot.name,
    		type: "slot",
    		source: "(1228:16) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div11;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let button0;
    	let t4;
    	let div3;
    	let div1;
    	let p0;
    	let t5_value = /*game*/ ctx[2].score + "";
    	let t5;
    	let t6;
    	let div2;
    	let p1;
    	let t7_value = /*game*/ ctx[2].best + "";
    	let t7;
    	let t8;
    	let div6;
    	let div4;
    	let p2;
    	let t10;
    	let div5;
    	let p3;
    	let t12;
    	let div8;
    	let t13;
    	let t14;
    	let div7;
    	let t15;
    	let div10;
    	let button1;
    	let t17;
    	let div9;
    	let button2;
    	let t19;
    	let button3;
    	let t21;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*rand*/ ctx[1].length <= 10 && create_if_block_3(ctx);
    	let if_block1 = /*rand*/ ctx[1].length > 10 && create_if_block_1(ctx);
    	let if_block2 = /*helpIsAsked*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Английский крокодил";
    			t2 = space();
    			button0 = element("button");
    			button0.textContent = "Помощь";
    			t4 = space();
    			div3 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			div2 = element("div");
    			p1 = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			div6 = element("div");
    			div4 = element("div");
    			p2 = element("p");
    			p2.textContent = "Угадано";
    			t10 = space();
    			div5 = element("div");
    			p3 = element("p");
    			p3.textContent = "Всего";
    			t12 = space();
    			div8 = element("div");
    			if (if_block0) if_block0.c();
    			t13 = space();
    			if (if_block1) if_block1.c();
    			t14 = space();
    			div7 = element("div");
    			t15 = space();
    			div10 = element("div");
    			button1 = element("button");
    			button1.textContent = "Новое слово";
    			t17 = space();
    			div9 = element("div");
    			button2 = element("button");
    			button2.textContent = "Угадано";
    			t19 = space();
    			button3 = element("button");
    			button3.textContent = "Не угадано";
    			t21 = space();
    			if (if_block2) if_block2.c();
    			if (!src_url_equal(img.src, img_src_value = "https://i.ibb.co/Z1P7JCp/crocodile.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", " ");
    			attr_dev(img, "width", "100");
    			attr_dev(img, "height", "100");
    			attr_dev(img, "class", "svelte-632dpn");
    			add_location(img, file, 1187, 8, 23290);
    			attr_dev(h1, "class", "title svelte-632dpn");
    			add_location(h1, file, 1188, 8, 23383);
    			attr_dev(button0, "class", "help-button svelte-632dpn");
    			add_location(button0, file, 1189, 8, 23435);
    			attr_dev(div0, "class", "heading svelte-632dpn");
    			add_location(div0, file, 1186, 4, 23259);
    			attr_dev(p0, "class", "svelte-632dpn");
    			add_location(p0, file, 1192, 36, 23594);
    			attr_dev(div1, "class", "best-container svelte-632dpn");
    			add_location(div1, file, 1192, 8, 23566);
    			attr_dev(p1, "class", "svelte-632dpn");
    			add_location(p1, file, 1193, 37, 23658);
    			attr_dev(div2, "class", "score-container svelte-632dpn");
    			add_location(div2, file, 1193, 8, 23629);
    			attr_dev(div3, "class", "scores-container svelte-632dpn");
    			add_location(div3, file, 1191, 4, 23526);
    			attr_dev(p2, "class", "svelte-632dpn");
    			add_location(p2, file, 1196, 36, 23762);
    			attr_dev(div4, "class", "best-container svelte-632dpn");
    			add_location(div4, file, 1196, 8, 23734);
    			attr_dev(p3, "class", "svelte-632dpn");
    			add_location(p3, file, 1197, 37, 23821);
    			attr_dev(div5, "class", "score-container svelte-632dpn");
    			add_location(div5, file, 1197, 8, 23792);
    			attr_dev(div6, "class", "text-score svelte-632dpn");
    			add_location(div6, file, 1195, 4, 23700);
    			attr_dev(div7, "class", "game-messages");
    			add_location(div7, file, 1213, 8, 24353);
    			attr_dev(div8, "class", "game-container svelte-632dpn");
    			add_location(div8, file, 1202, 4, 23987);
    			attr_dev(button1, "class", "NewWord svelte-632dpn");
    			add_location(button1, file, 1217, 8, 24444);
    			attr_dev(button2, "class", "Good svelte-632dpn");
    			add_location(button2, file, 1219, 12, 24570);
    			attr_dev(button3, "class", "Bad svelte-632dpn");
    			add_location(button3, file, 1220, 12, 24657);
    			attr_dev(div9, "class", "goodbad");
    			add_location(div9, file, 1218, 8, 24533);
    			attr_dev(div10, "class", "word");
    			add_location(div10, file, 1216, 4, 24414);
    			attr_dev(div11, "class", "container");
    			add_location(div11, file, 1185, 0, 23230);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);
    			append_dev(div0, button0);
    			append_dev(div11, t4);
    			append_dev(div11, div3);
    			append_dev(div3, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t5);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(p1, t7);
    			append_dev(div11, t8);
    			append_dev(div11, div6);
    			append_dev(div6, div4);
    			append_dev(div4, p2);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div5, p3);
    			append_dev(div11, t12);
    			append_dev(div11, div8);
    			if (if_block0) if_block0.m(div8, null);
    			append_dev(div8, t13);
    			if (if_block1) if_block1.m(div8, null);
    			append_dev(div8, t14);
    			append_dev(div8, div7);
    			append_dev(div11, t15);
    			append_dev(div11, div10);
    			append_dev(div10, button1);
    			append_dev(div10, t17);
    			append_dev(div10, div9);
    			append_dev(div9, button2);
    			append_dev(div9, t19);
    			append_dev(div9, button3);
    			append_dev(div10, t21);
    			if (if_block2) if_block2.m(div10, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[10], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[11], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*game*/ 4) && t5_value !== (t5_value = /*game*/ ctx[2].score + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*game*/ 4) && t7_value !== (t7_value = /*game*/ ctx[2].best + "")) set_data_dev(t7, t7_value);

    			if (/*rand*/ ctx[1].length <= 10) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*rand*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div8, t13);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*rand*/ ctx[1].length > 10) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*rand*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div8, t14);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*helpIsAsked*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*helpIsAsked*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div10, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const dictionary = [
    		"Apple",
    		"Banana",
    		"Cake",
    		"Cheese",
    		"Chocolate",
    		"Cookie",
    		"Egg",
    		"Fish",
    		"Meat",
    		"Pasta",
    		"Pizza",
    		"Salad",
    		"Sandwich",
    		"Soup",
    		"Tea",
    		"Coffee",
    		"Water",
    		"Juice",
    		"Wine",
    		"Beer",
    		"Bread",
    		"Butter",
    		"Honey",
    		"Ice cream",
    		"Milk",
    		"Soda",
    		"Spice",
    		"Sugar",
    		"Salt",
    		"Pepper",
    		"Onion",
    		"Garlic",
    		"Tomato",
    		"Potato",
    		"Carrot",
    		"Cucumber",
    		"Lettuce",
    		"Mushroom",
    		"Corn",
    		"Peas",
    		"Beans",
    		"Broccoli",
    		"Cabbage",
    		"Pumpkin",
    		"Radish",
    		"Spinach",
    		"Yogurt",
    		"Mango",
    		"Pineapple",
    		"Orange",
    		"Grape",
    		"Kiwi",
    		"Pear",
    		"Strawberry",
    		"Blueberry",
    		"Raspberry",
    		"Cherry",
    		"Blackberry",
    		"Lemon",
    		"Lime",
    		"Ginger",
    		"Cinnamon",
    		"Vanilla",
    		"Coconut",
    		"Almond",
    		"Peanut",
    		"Walnut",
    		"Cashew",
    		"Hazelnut",
    		"Chocolate chip",
    		"Popcorn",
    		"Sushi",
    		"Curry",
    		"Sausage",
    		"Burger",
    		"Fries",
    		"Ketchup",
    		"Mustard",
    		"Mayonnaise",
    		"Hamburger",
    		"Cheeseburger",
    		"Taco",
    		"Burrito",
    		"Nachos",
    		"Salsa",
    		"Guacamole",
    		"Quesadilla",
    		"Enchiladas",
    		"Churros",
    		"Cannoli",
    		"Macarons",
    		"Croissant",
    		"Bagel",
    		"Waffle",
    		"Pancake",
    		"Donut",
    		"Croquette",
    		"Risotto",
    		"Lasagna",
    		"Spaghetti",
    		"Ravioli",
    		"Sushi roll",
    		"Soup dumpling",
    		"Dim sum",
    		"Pad Thai",
    		"Phone",
    		"Spring roll",
    		"Gyoza",
    		"Biriyani",
    		"Naan",
    		"Roti",
    		"Tandoori",
    		"Falafel",
    		"Hummus",
    		"Gyro",
    		"Shawarma",
    		"Tabbouleh",
    		"Spanakopita",
    		"Moussaka",
    		"Baklava",
    		"Kebab",
    		"Pierogi",
    		"Borscht",
    		"Vareniki",
    		"Kasha",
    		"Pelmeni",
    		"Egg roll",
    		"General Tso's chicken",
    		"Sweet and sour pork",
    		"Egg foo young",
    		"Pizza slice",
    		"Scone",
    		"Cupcake",
    		"Brownie",
    		"Macaroni and cheese",
    		"Pop tart",
    		"French toast",
    		"Grilled cheese",
    		"Biscuit",
    		"Cinnamon roll",
    		"Omelette",
    		"Bacon",
    		"Sausage roll",
    		"Jelly doughnut",
    		"Sticky bun",
    		"Pumpernickel",
    		"Cornbread",
    		"Baguette",
    		"Ciabatta",
    		"Focaccia",
    		"Rye bread",
    		"Sourdough",
    		"English muffin",
    		"Matzo",
    		"Fork",
    		"Pita",
    		"Bagel with cream cheese",
    		"University",
    		"Beignet",
    		"Clam chowder",
    		"Crab cake",
    		"Chicken noodle soup",
    		"Gazpacho",
    		"Miso soup",
    		"Lobster bisque",
    		"Tomato soup",
    		"Minestrone",
    		"Goulash",
    		"Potato soup",
    		"Vegetable soup",
    		"Fish and chips",
    		"Chicken alfredo",
    		"Ham and cheese sandwich",
    		"Beef stroganoff",
    		"Jambalaya",
    		"Chicken cordon bleu",
    		"Ratatouille",
    		"Beef Wellington",
    		"Fish taco",
    		"Chili con carne",
    		"Dormitory",
    		"Pho bo",
    		"Biryani",
    		"Korma",
    		"Saag paneer",
    		"Chana masala",
    		"Butter chicken",
    		"Tikka masala",
    		"Samosa",
    		"Nan bread",
    		"Tandoori chicken",
    		"Dosa",
    		"Idli",
    		"Olivier",
    		"Mouse",
    		"Bun",
    		"Bread",
    		"Milk",
    		"Sour cream",
    		"Kefir",
    		"Ice cream",
    		"Meat",
    		"Shish kebab",
    		"Cake",
    		"Marshmallow",
    		"Tomato",
    		"Cucumber",
    		"Onion",
    		"Banana",
    		"Watermelon",
    		"Zucchini",
    		"Eggplant",
    		"Caviar",
    		"Coffee",
    		"Tea",
    		"Champagne",
    		"Sugar",
    		"Cookies",
    		"Dill",
    		"Parsley",
    		"Sprats",
    		"Croissant",
    		"Cracker",
    		"Chocolate",
    		"Candy",
    		"Apple",
    		"Melon",
    		"Salt",
    		"Pepper",
    		"Garlic",
    		"Fried potatoes",
    		"Pickles",
    		"Solyanka",
    		"Jelly",
    		"Honey",
    		"Jam",
    		"Nuts",
    		"Chips",
    		"Beer",
    		"Dried fish",
    		"Sunflower seeds",
    		"Corn",
    		"Corn sticks",
    		"Chewing gum",
    		"Butter",
    		"Pelmeni",
    		"Vareniki",
    		"Placenta",
    		"Waffles",
    		"Pasta",
    		"Rice",
    		"Buckwheat",
    		"Mayonnaise",
    		"Ketchup",
    		"Sauce",
    		"Popcorn",
    		"Halva",
    		"Pistachios",
    		"Walnuts",
    		"Almonds",
    		"Beans",
    		"Roll",
    		"Plum",
    		"Prunes",
    		"Apricot",
    		"Dried apricot",
    		"Fig",
    		"Peach",
    		"Mango",
    		"Kiwi",
    		"Blueberry",
    		"Strawberry",
    		"Blackberry",
    		"Raspberry",
    		"Gooseberry",
    		"Lemon",
    		"Orange",
    		"Currant",
    		"Tangerines",
    		"Cornelian cherry",
    		"Pepper",
    		"Cottage cheese",
    		"Tiramisu",
    		"Vinegar",
    		"Baking soda",
    		"Sausage",
    		"Cheese",
    		"Sandwich",
    		"Pâté",
    		"Egg",
    		"Pancakes",
    		"Fritters",
    		"Carrots",
    		"Croissant",
    		"Stuffed pepper",
    		"Cinnamon",
    		"Lentils",
    		"Lavash",
    		"Sausages",
    		"Pizza",
    		"Hot dog",
    		"Cola",
    		"Cottage cheese pancakes",
    		"Peas",
    		"Stew",
    		"Mashed potatoes",
    		"Olivier salad",
    		"Semolina",
    		"Omelette",
    		"Fried eggs",
    		"Poached egg",
    		"Cake",
    		"Donuts",
    		"Meringue",
    		"Bagels",
    		"Pomegranate",
    		"Oysters",
    		"Mushrooms",
    		"Strudel",
    		"Juice",
    		"Feta cheese",
    		"Polenta",
    		"Mititei",
    		"Chicken wings",
    		"Kebab",
    		"Kalach",
    		"Chocolate spread",
    		"Sugar substitute",
    		"Pilaf",
    		"Pastry",
    		"Cabbage soup",
    		"Zama",
    		"Manti",
    		"Chebureki",
    		"Complex",
    		"Otolaryngologist",
    		"Cryptocurrency",
    		"Bitcoin",
    		"Substance",
    		"Canoe",
    		"Panel",
    		"Atelier",
    		"Cistern",
    		"Alpha male",
    		"Narcissus",
    		"Narcissism",
    		"Grass",
    		"Cigarette",
    		"Cider",
    		"World Wide Web",
    		"Strictness",
    		"Unemployment",
    		"Cheburashka",
    		"Logic",
    		"Psychology",
    		"Depression",
    		"Contract",
    		"Implant",
    		"Operation",
    		"Gallbladder",
    		"Osteopath",
    		"Osteochondrosis",
    		"Infertility",
    		"Cat",
    		"Orangutan",
    		"Constipation",
    		"Responsibility",
    		"Task",
    		"Convoy",
    		"Police",
    		"Success",
    		"Million",
    		"Complexity",
    		"Chickenpox",
    		"Helicopter",
    		"Major",
    		"Tip",
    		"Milk foam",
    		"Illness",
    		"Moth",
    		"Mold",
    		"Corns",
    		"Varicose veins",
    		"Mosquito",
    		"Sandpaper",
    		"Nail file",
    		"Massage chair",
    		"Mosquito net",
    		"Gelatin",
    		"Sand",
    		"Plastic surgery",
    		"GTA game",
    		"Trap",
    		"Syrup",
    		"Beekeeper",
    		"Allergic person",
    		"Ragweed",
    		"Check",
    		"Creak",
    		"Catch",
    		"Engine",
    		"Fake",
    		"Turpentine",
    		"Bleach",
    		"Tsunami",
    		"Poseidon",
    		"Horror",
    		"Pregnancy test",
    		"Ammonium",
    		"Saber",
    		"Loose",
    		"Grapevine",
    		"Smell",
    		"Instruction",
    		"Food",
    		"Shock",
    		"Trace",
    		"Invisible person",
    		"Investigation",
    		"Cigarette butt",
    		"Trigger",
    		"Pasture",
    		"Shepherd",
    		"White shirt",
    		"Advertisement",
    		"Garden",
    		"Cloud",
    		"Cobweb",
    		"Tamagotchi",
    		"Bubbles",
    		"Shadow",
    		"Laziness",
    		"Update",
    		"Gadget",
    		"Device",
    		"Suction",
    		"Construction",
    		"Arrogance",
    		"Edge",
    		"Octopus",
    		"Psychopath",
    		"Ferrari",
    		"Speed",
    		"Oyster",
    		"Delicacy",
    		"Defective product",
    		"Volume",
    		"Double bass",
    		"Counterfeit",
    		"VAT",
    		"Sound",
    		"Albino",
    		"Freckle",
    		"Herpes",
    		"Noise",
    		"Echo",
    		"Sciatic nerve",
    		"IVF",
    		"Note",
    		"Allergy",
    		"Forest",
    		"Tachycardia",
    		"Trichologist",
    		"Pregnancy test",
    		"Splinter",
    		"Ambush",
    		"Trick",
    		"Blackmail",
    		"Escalator",
    		"Bumblebee",
    		"Mousetrap",
    		"Poison",
    		"Color",
    		"Ultrasound",
    		"Quote",
    		"Silicone",
    		"Whale",
    		"Caterpillar",
    		"Expiration date",
    		"Performance",
    		"Corporate party",
    		"Illumination",
    		"Space",
    		"Speed",
    		"Star",
    		"Disorder",
    		"Suicide",
    		"Penthouse",
    		"Radius",
    		"Centimeter",
    		"Sanitary",
    		"Educator",
    		"Turnaround",
    		"Film",
    		"Glue",
    		"Pattern",
    		"Neighbor",
    		"Puzzle",
    		"Mold",
    		"Stagnation",
    		"Icicle",
    		"Frost",
    		"Shine",
    		"Diamond",
    		"Azure",
    		"Sugar",
    		"Mixture",
    		"Ceiling",
    		"Platypus",
    		"Air conditioner",
    		"Cashier",
    		"Cash desk",
    		"Dower",
    		"Fermentation",
    		"Budget",
    		"Loading ramp",
    		"Luxury",
    		"Sensation",
    		"Safety",
    		"Avatar",
    		"Esotericism",
    		"Peel",
    		"Seed",
    		"Trend",
    		"Fake",
    		"Coronavirus",
    		"Fireplace",
    		"Scar",
    		"Suture",
    		"Container",
    		"Funny",
    		"friends",
    		"Hippopotamus",
    		"Clown",
    		"Mop",
    		"Glasses",
    		"Teeth",
    		"Straw hat",
    		"Runny nose",
    		"Arrow on tights",
    		"Hole in clothes",
    		"Glass",
    		"Aristocrat",
    		"Toilet",
    		"Joke",
    		"Bicycle",
    		"Chimpanzee",
    		"Wick",
    		"Joke",
    		"Laughter",
    		"Whisper",
    		"Dance",
    		"Jellyfish",
    		"Goosebumps",
    		"Diving",
    		"Fleas",
    		"Robbery",
    		"Dinosaur",
    		"Clownfish",
    		"Bow",
    		"Chewing gum",
    		"Camel",
    		"Rhinoceros",
    		"Skunk",
    		"Circus",
    		"Bell",
    		"Bride",
    		"Groom",
    		"Wedding",
    		"Last bell",
    		"KVN",
    		"Guitar",
    		"Strip tease",
    		"Statue",
    		"Binoculars",
    		"Fish",
    		"Bank",
    		"Money",
    		"Mafia",
    		"Disorder",
    		"Naked",
    		"Smile",
    		"Kolobok",
    		"Dog",
    		"Amphitheater",
    		"Capital",
    		"Joy",
    		"Tights",
    		"Non - traditional person",
    		"Late",
    		"Drunk person",
    		"Karaoke",
    		"Splinter",
    		"Sloth",
    		"Snoring",
    		"Farting",
    		"Jelly",
    		"Sour cream",
    		"Sunburned",
    		"Ate bad food",
    		"Comedy",
    		"High heels",
    		"Tall height",
    		"Puddle",
    		"Age difference",
    		"Girlfriends",
    		"Chicken",
    		"Gold",
    		"Swordfish",
    		"Kangaroo",
    		"Sea",
    		"Diet",
    		"Hunger",
    		"Chocolate",
    		"Teletubbies",
    		"Ostrich",
    		"Hidden SMS",
    		"Mistress",
    		"Children",
    		"Cold",
    		"Cactus",
    		"Pink hippopotamus",
    		"Spots",
    		"Disinfection",
    		"Clavichord",
    		"Valenki",
    		"Hello",
    		"Candy",
    		"Steering wheel",
    		"Garlic",
    		"Ladies' man",
    		"Pony",
    		"Pink flamingo",
    		"Pink panther",
    		"Harry Potter",
    		"Peppa Pig",
    		"Winnie the Pooh",
    		"Kar Karych",
    		"Aladdin",
    		"Song",
    		"Verka Serduchka",
    		"Pamela Anderson",
    		"Kim Kardashian",
    		"Neposeda",
    		"Ivanushka Durachok",
    		"Petrushka",
    		"Vanka - vstanka",
    		"Baba Yaga",
    		"Koschei the Immortal",
    		"Bat",
    		"Penguin",
    		"Spiral",
    		"Weeble",
    		"Plumber",
    		"Nag",
    		"Strip tease",
    		"Belly dance",
    		"Tub",
    		"Diarrhea",
    		"Thong",
    		"Swimsuit",
    		"Aphrodisiac",
    		"Femininity",
    		"Cheating husband",
    		"Nudist",
    		"Twerk",
    		"Bra",
    		"Bachelor",
    		"Habit",
    		"Pistol",
    		"Parody",
    		"Horse",
    		"Gynecologist",
    		"Dentist",
    		"Scabies",
    		"Late for school",
    		"Love",
    		"Fish",
    		"Lichen",
    		"Memory loss",
    		"Pole",
    		"Denture",
    		"Tooth Fairy",
    		"Unicorn",
    		"Minion",
    		"Donkey from Shrek",
    		"Fiona",
    		"Shrek",
    		"Gorilla",
    		"Stink",
    		"Little things",
    		"Suction",
    		"Crab",
    		"Shame",
    		"Glue",
    		"Slob",
    		"Fight",
    		"Impudence",
    		"Escort",
    		"Scrooge",
    		"Mini skirt",
    		"Chameleon",
    		"Hysteria",
    		"Bank robbery",
    		"Mother -in -law",
    		"Loser",
    		"Picnic",
    		"Knockout",
    		"Boxing",
    		"Ingrowing toenail",
    		"Ground squirrel",
    		"Hemorrhoids",
    		"Charisma",
    		"Atom",
    		"Microbe",
    		"Telescope",
    		"Botanist",
    		"Confident person",
    		"Masochist",
    		"Bedroom",
    		"Curse word",
    		"Gnome",
    		"Jester",
    		"Diaper",
    		"Mermaid",
    		"Snowman",
    		"Leggings",
    		"Stockings",
    		"Thinker",
    		"Stone",
    		"Student",
    		"Strong",
    		"Yacht",
    		"Elephant ear",
    		"Hockey",
    		"Motorcycle",
    		"Pencil case",
    		"Apple",
    		"Starfish",
    		"Turtle neck",
    		"Volleyball net",
    		"Wolf",
    		"Balloon",
    		"Ship",
    		"Firewood",
    		"Iguana",
    		"Ketchup",
    		"Microscope",
    		"Pepper",
    		"Crown",
    		"Whirlpool",
    		"X-ray vision",
    		"Yellow jacket",
    		"Zebra crossing",
    		"Bird",
    		"Moon",
    		"Dog food",
    		"Grape juice",
    		"Hot dog",
    		"Igloo building",
    		"Kite surfing",
    		"Lava lamp",
    		"Mushroom",
    		"Notebook cover",
    		"Opossum",
    		"Snowman",
    		"Turtle soup",
    		"Underwear set",
    		"Volleyball",
    		"Waffle maker",
    		"Zombie",
    		"Accordion",
    		"Baseball glove",
    		"Chocolate",
    		"Drum set",
    		"Fireworks",
    		"Grapefruit juice",
    		"Jellyfish lamp",
    		"Keyhole",
    		"Lime",
    		"Onion",
    		"Rhino horn",
    		"Snowflake",
    		"Unicorn tail",
    		"Wheelbarrow",
    		"Yellow taxi",
    		"Zombie apocalypse",
    		"Alligator skin",
    		"Basketball court",
    		"Christmas tree",
    		"Dolphin",
    		"Hair",
    		"Half",
    		"Hall",
    		"Hand",
    		"Hang",
    		"Harm",
    		"Hatch",
    		"Have",
    		"Head",
    		"Heal",
    		"Heat",
    		"Hell",
    		"Help",
    		"Hide",
    		"High",
    		"Race",
    		"Sunflower",
    		"Tangerine",
    		"Umbrella",
    		"Volleyball",
    		"Wig",
    		"X-ray",
    		"Yellow",
    		"Zany",
    		"Art",
    		"Basketball",
    		"Cruise",
    		"Diamond",
    		"Earthquake",
    		"Firefly",
    		"Guitar",
    		"Hammer",
    		"Ink",
    		"Jukebox",
    		"Kangaroo",
    		"Liberty",
    		"Mountains",
    		"Nightingale",
    		"Ocean",
    		"Popcorn",
    		"Queen",
    		"Rainbow",
    		"Saxophone",
    		"Turtle",
    		"Umbrella",
    		"Violin",
    		"Waterfall",
    		"Xenon",
    		"Yogurt",
    		"Zebra",
    		"Airplane",
    		"Boat",
    		"Camera",
    		"Dance",
    		"Eggplant",
    		"Fireplace",
    		"Guitar",
    		"Hammerhead",
    		"Island",
    		"Juice",
    		"King",
    		"Lighthouse",
    		"Monkey",
    		"Nectarine",
    		"Baking",
    		"Gardening",
    		"Cruise",
    		"Diamond",
    		"Earthquake",
    		"Firefly",
    		"Guitar",
    		"Hammer",
    		"Ink",
    		"Jukebox",
    		"Kangaroo",
    		"Liberty",
    		"Mountains",
    		"Nightingale",
    		"Ocean",
    		"Popcorn",
    		"Queen",
    		"Rainbow",
    		"Saxophone",
    		"Turtle",
    		"Umbrella",
    		"Violin",
    		"Waterfall",
    		"Xenon",
    		"Yogurt",
    		"Earth",
    		"Frog",
    		"Guitar",
    		"Hotel",
    		"India",
    		"Joker",
    		"Kite",
    		"Lighthouse",
    		"Mountain",
    		"Night",
    		"Octopus",
    		"Piano",
    		"Quilt",
    		"Restaurant",
    		"Snow",
    		"Tiger",
    		"Unicorn",
    		"Van",
    		"Wallet",
    		"Angel",
    		"Bicycle",
    		"Chocolate",
    		"Dinner",
    		"Unavailable",
    		"Unaware",
    		"Unbroken",
    		"Uncanny",
    		"Uncharitable",
    		"Unclear",
    		"Uncommon",
    		"Under",
    		"Uneven",
    		"Unfair",
    		"Unfold",
    		"Ungrateful",
    		"Unhappy",
    		"Unified",
    		"Unique",
    		"Universal",
    		"Unkempt",
    		"Unknown",
    		"Unlearn",
    		"Line",
    		"List",
    		"Live",
    		"Load",
    		"Loan",
    		"Lock",
    		"Long",
    		"Look",
    		"Loose",
    		"Lost",
    		"Love",
    		"Luck",
    		"Make",
    		"Male",
    		"Math",
    		"Meat",
    		"Meet",
    		"Menu",
    		"Mess",
    		"Mile",
    		"Milk",
    		"Mind",
    		"Mine",
    		"Crafting",
    		"Painting",
    		"Drawing",
    		"Sculpture",
    		"Design",
    		"Architecture",
    		"Engineering",
    		"Philosophy",
    		"Religion",
    		"Spirituality",
    		"Psychology",
    		"Sociology",
    		"Anthropology",
    		"Biology",
    		"Chemistry",
    		"Physics",
    		"Astronomy",
    		"Literature",
    		"Language",
    		"Communication",
    		"Transportation",
    		"Environment",
    		"Nature",
    		"Wildlife",
    		"Conservation",
    		"Recycling",
    		"Energy",
    		"Climate",
    		"Pollution",
    		"Technology",
    		"Innovation",
    		"Invention",
    		"Discovery",
    		"Research",
    		"Development",
    		"Experiment",
    		"Investigation",
    		"Theory",
    		"Principle",
    		"Concept",
    		"Idea",
    		"Knowledge",
    		"Intelligence",
    		"Wisdom",
    		"Creativity",
    		"Imagination",
    		"Innovation",
    		"Curiosity",
    		"Ambition",
    		"Initiative",
    		"Dedication",
    		"Integrity",
    		"Honesty",
    		"Loyalty",
    		"Respect",
    		"Kindness",
    		"Generosity",
    		"Compassion",
    		"Empathy",
    		"Patience",
    		"Perseverance",
    		"Courage",
    		"Bravery"
    	];

    	let helpIsAsked = false;
    	let assistant;
    	let dict = dictionary;
    	let rand = dict[Math.floor(Math.random() * dict.length)];
    	let com = "Простой";
    	let token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJkNDE0Y2I1MC00NmFkLTQxYTEtYmMzNy1lNzI1NzgzMDkwMmUiLCJzdWIiOiI4NjNlZDFmOGI0ZDk0YTBiZDU1MmI4ZGE0ZDcyZjE5OGEwZDdjZDQ4MTY1YmExMGYxYTM1NjI5M2JlYjQxMzIyNTM5YmU5MjcwMDQyNjI5OCIsImlzcyI6IktFWU1BU1RFUiIsImV4cCI6MTY4NTg3NjkyNiwiYXVkIjoiVlBTIiwiaWF0IjoxNjg1NzkwNTE2LCJ0eXBlIjoiQmVhcmVyIiwic2lkIjoiYjliMjNhZDctN2U1OS00OWRjLTgzNjItNGM3ZDU1NDZkN2MwIn0.HsmPe1d2xCY8VQWWlWwAWaoGBY8xRnUrMIlYJzbiAG5F3IriYjeHbL1_gLknUz1NwtMkDrViX4sNHAFfrNoGrmCtsF8BzHfF_6skyS07G0XuCQM5cKBY2g7MGS9EJ1jvjdAcQ9bgBqITahO17auClS0Uijp6i0mafVFM4NsGD3kDeQPHI0DSLG987j4NaIUn3g5yC3FxUDcek9ETW_S_CjbywrbPEWeuUREK3ycXkHY70-XGNbaIXntbLoJPIvDnxBUh8X8-Qm1rqzpTur7qd42oyr7ho-8d7oQAIGECOW4HTRhp1aN-pm65TVPp94Ojz31ngli-RkeNnnHaAOekLOXmRSkxnUhC3WZLSc52N2BQgyZIIrAs6VDkqXsiGB4ATx4eXMQCBxj3_iAUXopMEhasyTzmTxSHUyOOPOXnDI5f93jRBsXbp-zh9NAlVnCtUPSzQNqaS8LzPuL6_4tVyL-_p1BCmUOLGel8FgNF8oh29E7pX9UM6OLb1bHzrqbokFHqLV3PFry-C3GhI9OLKZmve_6YKssZ7M2EGdwQNoz5fL4rpAPhbZHQentBeD1DMtR0DIP4CdRA8vhqd4LkfKOlOAPmQNNTq87xUG7a9P5FYWRrS4gfHyUDs5X6FlPaSge0SAbu5rKak_JnqQzwtKRjsnuSMFSyrhWo4sa9uig";

    	// Set the name of your SmartApp for activation
    	let initPhrase = 'запусти Английский крокодил';

    	let character = 'eva'; // default, before sber client gets state

    	//$: setTheme(character);
    	onMount(() => {
    		function getState() {
    			return {};
    		}

    		const init = () => {

    			return createSmartappDebugger({ token, initPhrase, getState });
    		};

    		assistant = init();

    		assistant.on('start', () => {
    			logger.log('SmartApp started');
    		});

    		assistant.on('data', event => {
    			// Set your action or data hooks
    			if (!event.type) {
    				// Use invariants to prevent errors on Sber Portal
    				return;
    			}

    			// FIXME Add event handler for closing the app and use "assistant.close()" inside it;
    			if (event.type === 'character') {
    				character = event.character.id;

    				if (character === 'joy' || character === 'eva') {
    					setTheme('sber');
    				}
    			}

    			if (event.type === 'smart_app_data') {
    				logger.log(event.smart_app_data.type);

    				if (event.smart_app_data.type === 'close_app') {
    					assistant.close();
    				}

    				if (event.smart_app_data.type === 'smartapp') {
    					reset();
    					$$invalidate(1, rand = dict[Math.floor(Math.random() * dict.length)]);
    				} else if (event.smart_app_data.type === 'changeword') {
    					news();
    				} else if (event.smart_app_data.type === 'guessedwrong') {
    					badcount();
    					news();
    				} else if (event.smart_app_data.type === 'guessedright') {
    					gcount();
    					news();
    				} else if (event.smart_app_data.type === 'close') {
    					if (helpIsAsked) $$invalidate(0, helpIsAsked = false); else close();
    				} else if (event.smart_app_data.type === 'help') {
    					$$invalidate(0, helpIsAsked = true);
    				} else if (event.smart_app_data.type === 'restart') {
    					reset();
    				}

    				if (event.type === 'navigation') {
    					event.navigation.command;
    				}

    				logger.log(event);
    			}
    		});
    	});

    	const call_help = () => {
    		assistant.sendData({ action: { action_id: 'help' } });
    	};

    	const changeword = () => {
    		assistant.sendData({ action: { action_id: 'changeword' } });
    	};

    	const restart = () => {
    		assistant.sendData({ action: { action_id: 'restart' } });
    	};

    	const guessedright = () => {
    		if (visible && pressed_only_once) {
    			assistant.sendData({ action: { action_id: 'guessedright' } });
    		}
    	};

    	const guessedwrong = () => {
    		if (visible && pressed_only_once) {
    			assistant.sendData({ action: { action_id: 'guessedwrong' } });
    		}
    	};

    	let game = { score: 0, best: 0 };

    	const reset = () => {
    		$$invalidate(2, game.score = 0, game);
    		$$invalidate(2, game.best = 0, game);

    		if (visible) {
    			$$invalidate(3, visible = false);

    			setTimeout(
    				function () {
    					$$invalidate(1, rand = dict[Math.floor(Math.random() * dict.length)]);
    				},
    				500
    			);
    		}
    	};

    	let pressed_only_once = true;

    	function news() {
    		if (com == "Простой") {
    			dict = dictionary;
    			$$invalidate(1, rand = dict[Math.floor(Math.random() * dict.length)]);
    		}

    		if (visible && pressed_only_once) {
    			$$invalidate(3, visible = false);
    			pressed_only_once = false;

    			setTimeout(
    				function () {
    					$$invalidate(3, visible = true);
    				},
    				1000
    			);

    			setTimeout(
    				function () {
    					pressed_only_once = true;
    				},
    				3000
    			);
    		} else {
    			setTimeout(
    				function () {
    					$$invalidate(3, visible = true);
    				},
    				500
    			);
    		}
    	}

    	function gcount() {
    		if (pressed_only_once) {
    			$$invalidate(2, game.best += 1, game);
    			$$invalidate(2, game.score += 1, game);
    		}
    	}

    	function badcount() {
    		if (pressed_only_once) $$invalidate(2, game.best += 1, game);
    	}

    	let visible = false;

    	function typewriter(node, { speed = 1 }) {
    		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

    		if (!valid) {
    			throw new Error(`This transition only works on elements with a single text node child`);
    		}

    		const text = node.textContent;
    		logger.log(text);
    		const duration = text.length / (speed * 0.05);

    		return {
    			duration,
    			tick: t => {
    				const i = ~~(text.length * t);
    				node.textContent = text.slice(0, i);
    			}
    		};
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => call_help();
    	const click_handler_1 = () => changeword();
    	const click_handler_2 = () => guessedright();
    	const click_handler_3 = () => guessedwrong();
    	const close_handler = () => $$invalidate(0, helpIsAsked = false);

    	$$self.$capture_state = () => ({
    		onMount,
    		createSmartappDebugger,
    		createAssistant: createAssistant$1,
    		setTheme,
    		logger,
    		Help,
    		dictionary,
    		helpIsAsked,
    		assistant,
    		dict,
    		rand,
    		com,
    		token,
    		initPhrase,
    		character,
    		call_help,
    		changeword,
    		restart,
    		guessedright,
    		guessedwrong,
    		game,
    		reset,
    		pressed_only_once,
    		news,
    		gcount,
    		badcount,
    		visible,
    		typewriter
    	});

    	$$self.$inject_state = $$props => {
    		if ('helpIsAsked' in $$props) $$invalidate(0, helpIsAsked = $$props.helpIsAsked);
    		if ('assistant' in $$props) assistant = $$props.assistant;
    		if ('dict' in $$props) dict = $$props.dict;
    		if ('rand' in $$props) $$invalidate(1, rand = $$props.rand);
    		if ('com' in $$props) com = $$props.com;
    		if ('token' in $$props) token = $$props.token;
    		if ('initPhrase' in $$props) initPhrase = $$props.initPhrase;
    		if ('character' in $$props) character = $$props.character;
    		if ('game' in $$props) $$invalidate(2, game = $$props.game);
    		if ('pressed_only_once' in $$props) pressed_only_once = $$props.pressed_only_once;
    		if ('visible' in $$props) $$invalidate(3, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		helpIsAsked,
    		rand,
    		game,
    		visible,
    		call_help,
    		changeword,
    		guessedright,
    		guessedwrong,
    		typewriter,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		close_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {},
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map

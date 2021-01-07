
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function (interactiveShaderFormat) {
    'use strict';

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor);
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
            this.$destroy = noop;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
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
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    /* src/Source.svelte generated by Svelte v3.31.2 */

    const file = "src/Source.svelte";

    function create_fragment(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Open webcam";
    			add_location(button, file, 17, 0, 268);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*openWebcam*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
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
    	validate_slots("Source", slots, []);
    	let { ref } = $$props;

    	function openWebcam() {
    		video = document.createElement("video");
    		video.autoplay = true;

    		navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
    			video.srcObject = stream;
    			$$invalidate(1, ref = video);
    		});
    	}

    	const writable_props = ["ref"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Source> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("ref" in $$props) $$invalidate(1, ref = $$props.ref);
    	};

    	$$self.$capture_state = () => ({ ref, openWebcam });

    	$$self.$inject_state = $$props => {
    		if ("ref" in $$props) $$invalidate(1, ref = $$props.ref);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [openWebcam, ref];
    }

    class Source extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { ref: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Source",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*ref*/ ctx[1] === undefined && !("ref" in props)) {
    			console.warn("<Source> was created without expected prop 'ref'");
    		}
    	}

    	get ref() {
    		throw new Error("<Source>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<Source>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ISF.svelte generated by Svelte v3.31.2 */

    const { Object: Object_1, console: console_1 } = globals;

    const file$1 = "src/ISF.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i][0];
    	child_ctx[12] = list[i][1];
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (91:4) {#if sys.indexOf(k) == -1 && name.indexOf('inputImage') == -1 }
    function create_if_block(ctx) {
    	let div;
    	let t0_value = /*name*/ ctx[11] + "";
    	let t0;
    	let t1;
    	let input_1;
    	let mounted;
    	let dispose;

    	function input_1_input_handler() {
    		/*input_1_input_handler*/ ctx[5].call(input_1, /*each_value_1*/ ctx[13], /*each_index*/ ctx[14]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			input_1 = element("input");
    			attr_dev(input_1, "type", "text");
    			add_location(input_1, file$1, 93, 6, 1979);
    			add_location(div, file$1, 91, 5, 1954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, input_1);
    			set_input_value(input_1, /*u*/ ctx[12].value);

    			if (!mounted) {
    				dispose = listen_dev(input_1, "input", input_1_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*renderers*/ 1 && t0_value !== (t0_value = /*name*/ ctx[11] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*Object, renderers*/ 1 && input_1.value !== /*u*/ ctx[12].value) {
    				set_input_value(input_1, /*u*/ ctx[12].value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(91:4) {#if sys.indexOf(k) == -1 && name.indexOf('inputImage') == -1 }",
    		ctx
    	});

    	return block;
    }

    // (90:3) {#each Object.entries(o.renderer.uniforms) as [name, u] (k) }
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let show_if = /*sys*/ ctx[1].indexOf(k) == -1 && /*name*/ ctx[11].indexOf("inputImage") == -1;
    	let if_block_anchor;
    	let if_block = show_if && create_if_block(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*renderers*/ 1) show_if = /*sys*/ ctx[1].indexOf(k) == -1 && /*name*/ ctx[11].indexOf("inputImage") == -1;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(90:3) {#each Object.entries(o.renderer.uniforms) as [name, u] (k) }",
    		ctx
    	});

    	return block;
    }

    // (87:1) {#each renderers as o, i }
    function create_each_block(ctx) {
    	let div0;
    	let t0_value = /*o*/ ctx[8].name + "";
    	let t0;
    	let t1;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let each_value_1 = Object.entries(/*o*/ ctx[8].renderer.uniforms);
    	validate_each_argument(each_value_1);
    	const get_key = ctx => k;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key();
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			add_location(div0, file$1, 87, 2, 1771);
    			attr_dev(div1, "class", "uniforms");
    			add_location(div1, file$1, 88, 2, 1793);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*renderers*/ 1 && t0_value !== (t0_value = /*o*/ ctx[8].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*Object, renderers, sys, k*/ 3) {
    				each_value_1 = Object.entries(/*o*/ ctx[8].renderer.uniforms);
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div1, destroy_block, create_each_block_1, t2, get_each_context_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(87:1) {#each renderers as o, i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let h1;
    	let t0_value = /*renderers*/ ctx[0].length + "";
    	let t0;
    	let t1;
    	let each_value = /*renderers*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$1, 85, 1, 1713);
    			add_location(div, file$1, 84, 0, 1706);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*renderers*/ 1 && t0_value !== (t0_value = /*renderers*/ ctx[0].length + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*Object, renderers, sys, k*/ 3) {
    				each_value = /*renderers*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots("ISF", slots, []);
    	let { chain } = $$props, { input } = $$props, { output } = $$props;
    	let renderers = [];

    	function onFrame() {
    		// tapestryfract doesn't have inputImage so we'll need to check
    		// renderer.draw( output )
    		for (let i = 0; i < renderers.length; i++) {
    			const o = renderers[i];
    			const r = o.renderer;
    			if ("inputImage" in r.uniforms) r.setValue("inputImage", i == 0 ? input : output);
    			r.draw(output);
    		}

    		requestAnimationFrame(onFrame);
    	}

    	onMount(async () => {
    		console.log("requesting first frame...");
    		requestAnimationFrame(onFrame);
    		load();
    	});

    	async function load() {
    		console.log(`[ISF] status triggered...`);

    		for (let i = 0; i < chain.length; i++) {
    			const name = chain[i];
    			let fsSrc, vsSrc;

    			// fs...
    			try {
    				let url = `${name}.fs`;
    				fsSrc = await (await fetch(url)).text();
    				console.log(`[ISF] loaded ${url}...`);
    			} catch(err) {
    				console.log(`[ISF] no fs path to load...`);
    			}

    			// vs...
    			try {
    				let url = `viz/${name}.vs`;
    				if (vsPath) vsSrc = await (await fetch(url)).text();
    				console.log(`[ISF] loaded ${url}...`);
    			} catch(err) {
    				console.log(`[ISF] no vs path to load...`);
    			}

    			const renderer = new interactiveShaderFormat.Renderer(output.getContext("webgl2"));
    			renderer.loadSource(fsSrc, vsSrc);
    			renderers.push({ name, renderer });
    			console.log(`[ISF] created renderer: "${name}"`, renderer, renderers.length);
    		}
    	}

    	let sys = ["PASSINDEX", "RENDERSIZE", "TIME", "TIMEDELTA", "FRAMEINDEX", "DATE"];
    	const writable_props = ["chain", "input", "output"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<ISF> was created with unknown prop '${key}'`);
    	});

    	function input_1_input_handler(each_value_1, each_index) {
    		each_value_1[each_index][1].value = this.value;
    		$$invalidate(0, renderers);
    	}

    	$$self.$$set = $$props => {
    		if ("chain" in $$props) $$invalidate(2, chain = $$props.chain);
    		if ("input" in $$props) $$invalidate(3, input = $$props.input);
    		if ("output" in $$props) $$invalidate(4, output = $$props.output);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Renderer: interactiveShaderFormat.Renderer,
    		Parser: interactiveShaderFormat.Parser,
    		Upgrader: interactiveShaderFormat.Upgrader,
    		MetadataExtractor: interactiveShaderFormat.MetadataExtractor,
    		chain,
    		input,
    		output,
    		renderers,
    		onFrame,
    		load,
    		sys
    	});

    	$$self.$inject_state = $$props => {
    		if ("chain" in $$props) $$invalidate(2, chain = $$props.chain);
    		if ("input" in $$props) $$invalidate(3, input = $$props.input);
    		if ("output" in $$props) $$invalidate(4, output = $$props.output);
    		if ("renderers" in $$props) $$invalidate(0, renderers = $$props.renderers);
    		if ("sys" in $$props) $$invalidate(1, sys = $$props.sys);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [renderers, sys, chain, input, output, input_1_input_handler];
    }

    class ISF extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { chain: 2, input: 3, output: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ISF",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*chain*/ ctx[2] === undefined && !("chain" in props)) {
    			console_1.warn("<ISF> was created without expected prop 'chain'");
    		}

    		if (/*input*/ ctx[3] === undefined && !("input" in props)) {
    			console_1.warn("<ISF> was created without expected prop 'input'");
    		}

    		if (/*output*/ ctx[4] === undefined && !("output" in props)) {
    			console_1.warn("<ISF> was created without expected prop 'output'");
    		}
    	}

    	get chain() {
    		throw new Error("<ISF>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chain(value) {
    		throw new Error("<ISF>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get input() {
    		throw new Error("<ISF>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set input(value) {
    		throw new Error("<ISF>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get output() {
    		throw new Error("<ISF>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set output(value) {
    		throw new Error("<ISF>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/App.svelte";

    // (41:1) {#if ctx }
    function create_if_block$1(ctx) {
    	let isf;
    	let updating_input;
    	let updating_output;
    	let current;

    	function isf_input_binding(value) {
    		/*isf_input_binding*/ ctx[6].call(null, value);
    	}

    	function isf_output_binding(value) {
    		/*isf_output_binding*/ ctx[7].call(null, value);
    	}

    	let isf_props = { chain: /*chain*/ ctx[3] };

    	if (/*video*/ ctx[0] !== void 0) {
    		isf_props.input = /*video*/ ctx[0];
    	}

    	if (/*canvas*/ ctx[1] !== void 0) {
    		isf_props.output = /*canvas*/ ctx[1];
    	}

    	isf = new ISF({ props: isf_props, $$inline: true });
    	binding_callbacks.push(() => bind(isf, "input", isf_input_binding));
    	binding_callbacks.push(() => bind(isf, "output", isf_output_binding));

    	const block = {
    		c: function create() {
    			create_component(isf.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(isf, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const isf_changes = {};

    			if (!updating_input && dirty & /*video*/ 1) {
    				updating_input = true;
    				isf_changes.input = /*video*/ ctx[0];
    				add_flush_callback(() => updating_input = false);
    			}

    			if (!updating_output && dirty & /*canvas*/ 2) {
    				updating_output = true;
    				isf_changes.output = /*canvas*/ ctx[1];
    				add_flush_callback(() => updating_output = false);
    			}

    			isf.$set(isf_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(isf.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(isf.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(isf, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(41:1) {#if ctx }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let canvas_1;
    	let t0;
    	let source;
    	let updating_ref;
    	let t1;
    	let current;

    	function source_ref_binding(value) {
    		/*source_ref_binding*/ ctx[5].call(null, value);
    	}

    	let source_props = {};

    	if (/*video*/ ctx[0] !== void 0) {
    		source_props.ref = /*video*/ ctx[0];
    	}

    	source = new Source({ props: source_props, $$inline: true });
    	binding_callbacks.push(() => bind(source, "ref", source_ref_binding));
    	let if_block = /*ctx*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			canvas_1 = element("canvas");
    			t0 = space();
    			create_component(source.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(canvas_1, "id", "canvas");
    			add_location(canvas_1, file$2, 38, 1, 753);
    			add_location(main, file$2, 37, 0, 745);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, canvas_1);
    			/*canvas_1_binding*/ ctx[4](canvas_1);
    			append_dev(main, t0);
    			mount_component(source, main, null);
    			append_dev(main, t1);
    			if (if_block) if_block.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const source_changes = {};

    			if (!updating_ref && dirty & /*video*/ 1) {
    				updating_ref = true;
    				source_changes.ref = /*video*/ ctx[0];
    				add_flush_callback(() => updating_ref = false);
    			}

    			source.$set(source_changes);

    			if (/*ctx*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*ctx*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
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
    			transition_in(source.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(source.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*canvas_1_binding*/ ctx[4](null);
    			destroy_component(source);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let video, canvas, ctx;

    	onMount(async () => {
    		window.video = video;
    		$$invalidate(1, canvas.width = 720, canvas);
    		$$invalidate(1, canvas.height = 576, canvas);

    		// Using webgl2 for non-power-of-two textures
    		$$invalidate(2, ctx = canvas.getContext("webgl2"));

    		console.log(canvas, ctx);
    	}); // const target = new WebGLTexture()
    	// createRendering('invertinator.isf')
    	// createRendering('pixelshifter.isf')

    	let chain = ["private/invertinator", "private/pixelshifter"];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			canvas = $$value;
    			$$invalidate(1, canvas);
    		});
    	}

    	function source_ref_binding(value) {
    		video = value;
    		$$invalidate(0, video);
    	}

    	function isf_input_binding(value) {
    		video = value;
    		$$invalidate(0, video);
    	}

    	function isf_output_binding(value) {
    		canvas = value;
    		$$invalidate(1, canvas);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Source,
    		ISF,
    		video,
    		canvas,
    		ctx,
    		chain
    	});

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    		if ("canvas" in $$props) $$invalidate(1, canvas = $$props.canvas);
    		if ("ctx" in $$props) $$invalidate(2, ctx = $$props.ctx);
    		if ("chain" in $$props) $$invalidate(3, chain = $$props.chain);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		video,
    		canvas,
    		ctx,
    		chain,
    		canvas_1_binding,
    		source_ref_binding,
    		isf_input_binding,
    		isf_output_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {  }
    });

    return app;

}(interactiveShaderFormat));
//# sourceMappingURL=index.js.map

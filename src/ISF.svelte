<script>

	// https://discourse.threejs.org/t/how-to-get-canvas-as-a-texture-to-chain-together-shaders/16056

	import { onMount } from 'svelte'
	import { Renderer, Parser, Upgrader, MetadataExtractor } from 'interactive-shader-format'

	export let chain, input, output;
	let renderers = []

	function onFrame() {

		// tapestryfract doesn't have inputImage so we'll need to check



		// renderer.draw( output )

		for (let i = 0; i < renderers.length; i++) {
			const o = renderers[i]
			const r = o.renderer

			if ('inputImage' in r.uniforms) r.setValue('inputImage', (i == 0) ? input : output )
			r.draw( output )

		}

		requestAnimationFrame( onFrame )

	}

	onMount(async () => {


		console.log('requesting first frame...')
		requestAnimationFrame( onFrame )
		load()

	})

	async function load() {

		console.log(`[ISF] status triggered...`)
		for (let i = 0; i < chain.length; i++) {


			const name = chain[i]
			let fsSrc, vsSrc

			// fs...

			try {
				let url = `${name}.fs`
				fsSrc = await (await fetch(url)).text()
				console.log(`[ISF] loaded ${url}...`)
			} catch(err) {
				console.log(`[ISF] no fs path to load...`)
			}

			// vs...

			try {
				let url = `viz/${name}.vs`
				if (vsPath) vsSrc = await (await fetch(url)).text()
				console.log(`[ISF] loaded ${url}...`)
			} catch(err) {
				console.log(`[ISF] no vs path to load...`)
			}

			const renderer = new Renderer( output.getContext('webgl2') )
			renderer.loadSource( fsSrc, vsSrc )
			renderers.push({
				name,
				renderer
			})
			console.log(`[ISF] created renderer: "${name}"`, renderer, renderers.length)
		}

	}

	let sys = ['PASSINDEX', 'RENDERSIZE', 'TIME', 'TIMEDELTA', 'FRAMEINDEX', 'DATE']

</script>

<div>
	<h1>{renderers.length}</h1>
	{#each renderers as o, i }
		<div>{o.name}</div>
		<div class="uniforms">
			{#each Object.entries(o.renderer.uniforms) as [name, u] (k) }
				{#if sys.indexOf(k) == -1 && name.indexOf('inputImage') == -1 }
					<div>
						{name}
						<input type="text" bind:value={u.value} />
					</div>
				{/if}
			{/each}
		</div>
	{/each}
</div>
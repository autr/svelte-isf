<script>

	// https://discourse.threejs.org/t/how-to-get-canvas-as-a-texture-to-chain-together-shaders/16056

	// ADD NEW INVERTINATOR!

	import { onMount } from 'svelte'
	// import { Renderer, Parser, Upgrader, MetadataExtractor } from 'interactive-shader-format'
	import Source from './Source.svelte'
	import ISF from './ISF.svelte'

	let video, canvas

	onMount(async () => {

		window.video = video

		canvas.width = 720
		canvas.height = 576


	})

	let chain = ['private/invertinator']
</script>

<main>
	<canvas bind:this={canvas} id="canvas" />
	<Source bind:ref={video} />
	<ISF bind:input={video} bind:output={canvas} {chain} />
</main>



		
<script>

	// https://discourse.threejs.org/t/how-to-get-canvas-as-a-texture-to-chain-together-shaders/16056

	import { onMount } from 'svelte'
	// import { Renderer, Parser, Upgrader, MetadataExtractor } from 'interactive-shader-format'
	import Source from './Source.svelte'
	import ISF from './ISF.svelte'

	let video, canvas, ctx


	onMount(async () => {

		window.video = video

		canvas.width = 720
		canvas.height = 576

		// Using webgl2 for non-power-of-two textures

		ctx = canvas.getContext('webgl2')

		console.log(canvas, ctx);

		// const target = new WebGLTexture()



		// createRendering('invertinator.isf')
		// createRendering('pixelshifter.isf')

	})

	let chain = ['private/invertinator', 'private/pixelshifter']
</script>

<main>
	<canvas bind:this={canvas} id="canvas" />
	<Source bind:ref={video} />
	{#if ctx }
		<ISF bind:input={video} bind:output={canvas} {chain} />
	{/if}
</main>



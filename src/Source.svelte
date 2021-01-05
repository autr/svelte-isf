<script>

	export let ref;
	function openWebcam() {

		video = document.createElement('video')
		video.autoplay = true
		navigator.mediaDevices.getUserMedia({
			video: true
		}).then(function(stream){
			video.srcObject = stream
			ref = video   
		})
	}

</script>

<button on:click={openWebcam}>Open webcam</button>
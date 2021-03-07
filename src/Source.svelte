<script>

	export let ref;
	function openWebcam() {

		video = document.createElement('video')
		video.autoplay = true
		navigator.mediaDevices.getUserMedia({
			video: true
		}).then( stream => {
			video.srcObject = stream
			ref = video   
		}).catch( err => {
			alert('ERROR OPENING DEVICE')
			console.log(err)
			console.log(err.message)
		})
	}

</script>

<button on:click={openWebcam}>Open webcam</button>
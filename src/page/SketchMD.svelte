<script>
	import Controller from "src/component/Controller.svelte";
	import DrawingCanvas from "src/component/DrawingCanvas.svelte";
	import { onDestroy } from "svelte";

	export let app;
	export let width;
	export let height = 100;

	onDestroy(() => {
		console.log("destroy");
	});
</script>

<div class="container">
	<DrawingCanvas {width} {height} />
	<Controller {app} />
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

// import init from "./bg_rs.js";

function main() {
	// init().then(() => console.log("WASM Loaded"));
}

window.onload = function () {
	if (!navigator.gpu) {
		console.log("WebGPU is not supported on your browser. Please enable it or check http://webgpu.io");
		// Display warning and hide the FPS counter
		// document.getElementById("webgpu-missing").style.display = "block";
		// document.getElementById("fps").style.display = "none";
		return;
	}
	console.log("loaded")
	// main();
};

// export function update_fps(new_fps) {
// 	let text = document.getElementById("fps");
// 	text.innerHTML = new_fps.toFixed(4) + " FPS"
// }
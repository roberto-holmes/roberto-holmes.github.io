const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
	throw new Error("No appropriate GPUAdapter found");
}
const device = await adapter.requestDevice();

const canvas_element = document.getElementById("bg");
if (!canvas_element) {
	throw new Error("No canvas found");
}

let canvas = canvas_element;
canvas.width = canvas.clientWidth * window.devicePixelRatio;
canvas.height = canvas.clientHeight * window.devicePixelRatio;

const context = canvas.getContext("webgpu");
if (!context) {
	throw new Error("Failed to get webgpu context");
}
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
	device: device,
	format: canvasFormat,
});

const canvasAspectRatio = canvas.width / canvas.height;

// Create the shader that will render the cells.
const shaderModule = device.createShaderModule({
	label: "Triangle Shader",
	code: /* wgsl */ `
// ----------------------- Vertex shader ----------------------- 
// Cover the viewport with a quad
alias TriangleVertices = array<vec2f, 6>;
var<private> vertices: TriangleVertices = TriangleVertices(
    vec2f(-1.0,  1.0),
    vec2f(-1.0, -1.0),
    vec2f( 1.0,  1.0),
    vec2f( 1.0,  1.0),
    vec2f(-1.0, -1.0),
    vec2f( 1.0, -1.0),
);

@vertex
fn vertexMain(
     @builtin(vertex_index) index: u32,
) -> @builtin(position) vec4f {
    return vec4f(vertices[index], 0.0, 1.0);
}

// ----------------------- Fragment shader ----------------------- 

struct Uniforms {
    frame_num: u32,
    width: u32,
    height: u32,
    _padding: u32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@fragment
fn fragmentMain(@builtin(position) pos: vec4f) -> @location(0) vec4<f32> {
    // Coordinates from 0.0 to 1.0 (origin at top left)
    let uv = pos.xy / vec2f(f32(uniforms.width), f32(uniforms.height));
    // Time varying pixel colour
    var colour = .5 + .5 * cos(f32(uniforms.frame_num)/240.0 + uv.xyx + vec3f(0.,2.,4.));
    // let colour = vec4f(pos.xy/vec2f(f32(uniforms.width), f32(uniforms.height)), f32(uniforms.frame_num)/100.0, 1.0);
    if uniforms.frame_num < 240 {
        // Fade in from black
        colour *= f32(uniforms.frame_num) / 240.0;
    }
    // Convert from gamma-encoded to linear colour space
    colour = pow(colour, vec3f(2.2));
    return vec4f(colour, 1.0);
}
		       `,
});

const pipelineLayout = device.createPipelineLayout({
	label: "Pipeline Layout",
	bindGroupLayouts: [
		device.createBindGroupLayout({
			label: "Bind Group Layout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						type: "uniform",
					},
				},
			],
		}),
	],
});

// Create a pipeline that renders the cell.
const pipeline = device.createRenderPipeline({
	label: "Pipeline",
	layout: pipelineLayout,
	vertex: {
		module: shaderModule,
		entryPoint: "vertexMain",
		buffers: [],
	},
	fragment: {
		module: shaderModule,
		entryPoint: "fragmentMain",
		targets: [
			{
				format: canvasFormat,
			},
		],
	},
});

const uniformArray = new Uint32Array([0, canvas.width, canvas.height, 0]);
const uniformBuffer = device.createBuffer({
	label: "Uniforms",
	size: uniformArray.byteLength,
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const bindGroup = device.createBindGroup({
	label: "Ray Bind group",
	layout: pipeline.getBindGroupLayout(0),
	entries: [
		{
			binding: 0,
			resource: { buffer: uniformBuffer },
		},
	],
});

function render(timestamp) {
	canvas.width = canvas.clientWidth * window.devicePixelRatio;
	canvas.height = canvas.clientHeight * window.devicePixelRatio;

	uniformArray[0] += 1;
	uniformArray[1] = canvas.width;
	uniformArray[2] = canvas.height;

	const encoder = device.createCommandEncoder();

	const pass = encoder.beginRenderPass({
		colorAttachments: [
			{
				view: context.getCurrentTexture().createView(),
				loadOp: "clear",
				clearValue: { r: 0.0, g: 0.0, b: 1.0, a: 1.0 },
				storeOp: "store",
			},
		],
	});

	device.queue.writeBuffer(uniformBuffer, 0, uniformArray.buffer);

	// Draw the square.
	pass.setPipeline(pipeline);
	pass.setBindGroup(0, bindGroup);
	pass.draw(6);
	pass.end();
	// Finish the command buffer and immediately submit it.
	device.queue.submit([encoder.finish()]);

	requestAnimationFrame(render);
}
render(0);

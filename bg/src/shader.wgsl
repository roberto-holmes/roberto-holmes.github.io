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
fn vs_main(
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
fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4<f32> {
    // Coordinates from 0.0 to 1.0 (origin at top left)
    let uv = pos.xy / vec2f(f32(uniforms.width), f32(uniforms.height));

    // Time varying pixel colour
    var colour = .5 + .5 * cos(f32(uniforms.frame_num)/240.0 + uv.xyx + vec3f(0.,2.,4.));

    // let colour = vec4f(pos.xy/vec2f(f32(uniforms.width), f32(uniforms.height)), f32(uniforms.frame_num)/100.0, 1.0);
    if uniforms.frame_num < 240{
        // Fade in from black
        colour *= f32(uniforms.frame_num) / 240.0;
    }
    // Convert from gamma-encoded to linear colour space
    colour = pow(colour, vec3f(2.2));

    return vec4f(colour, 1.0);
}
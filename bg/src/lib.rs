use std::iter;

use winit::{
    dpi::LogicalSize,
    event::*,
    event_loop::EventLoop,
    keyboard::{KeyCode, PhysicalKey},
    window::{Window, WindowBuilder},
};

use wgpu::{Limits, util::DeviceExt};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
const LIMITS: Limits = wgpu::Limits::downlevel_webgl2_defaults();
#[cfg(not(target_arch = "wasm32"))]
const LIMITS: Limits = wgpu::Limits::downlevel_defaults();

#[repr(C)]
#[derive(Copy, Clone, Debug, bytemuck::Pod, bytemuck::Zeroable)]
struct Vertex {
    position: [f32; 3],
    color: [f32; 3],
}

impl Vertex {
    fn desc() -> wgpu::VertexBufferLayout<'static> {
        wgpu::VertexBufferLayout {
            array_stride: std::mem::size_of::<Vertex>() as wgpu::BufferAddress,
            step_mode: wgpu::VertexStepMode::Vertex,
            attributes: &[
                wgpu::VertexAttribute {
                    offset: 0,
                    shader_location: 0,
                    format: wgpu::VertexFormat::Float32x3,
                },
                wgpu::VertexAttribute {
                    offset: std::mem::size_of::<[f32; 3]>() as wgpu::BufferAddress,
                    shader_location: 1,
                    format: wgpu::VertexFormat::Float32x3,
                },
            ],
        }
    }
}

#[rustfmt::skip]
const VERTICES_RAW: &[Vertex] = &[
Vertex { position: [0.0, 0.0, 0.0], 	color: [0.1, 0.0, 0.1] }, // 0
Vertex { position: [0.5, 0.0, 0.0], 	color: [0.1, 0.0, 0.1] }, // 1
Vertex { position: [0.25, 0.433, 0.0],	color: [0.1, 0.0, 0.1] }, // 2

Vertex { position: [0.0, 0.0, 0.0], 	color: [0.5, 0.0, 0.5] }, // 0
Vertex { position: [0.25, 0.433, 0.0],	color: [0.5, 0.0, 0.5] }, // 2
Vertex { position: [-0.25, 0.433, 0.0],	color: [0.5, 0.0, 0.5] }, // 3

Vertex { position: [0.0, 0.0, 0.0], 	color: [0.5, 0.0, 0.5] }, // 0
Vertex { position: [-0.25, 0.433, 0.0],	color: [0.5, 0.0, 0.5] }, // 3
Vertex { position: [-0.5, 0.0, 0.0],	color: [0.5, 0.0, 0.5] }, // 4

Vertex { position: [0.0, 0.0, 0.0], 	color: [1.0, 0.0, 1.0] }, // 0
Vertex { position: [-0.5, 0.0, 0.0],	color: [1.0, 0.0, 1.0] }, // 4
Vertex { position: [-0.25, -0.433, 0.0],color: [1.0, 0.0, 1.0] }, // 5

Vertex { position: [0.0, 0.0, 0.0], 	color: [1.0, 0.0, 1.0] }, // 0
Vertex { position: [-0.25, -0.433, 0.0],color: [1.0, 0.0, 1.0] }, // 5
Vertex { position: [0.25, -0.433, 0.0],	color: [1.0, 0.0, 1.0] }, // 6

Vertex { position: [0.0, 0.0, 0.0], 	color: [0.1, 0.0, 0.1] }, // 0
Vertex { position: [0.25, -0.433, 0.0],	color: [0.1, 0.0, 0.1] }, // 6
Vertex { position: [0.5, 0.0, 0.0], 	color: [0.1, 0.0, 0.1] }, // 1
];

#[rustfmt::skip]
const VERTICES: &[Vertex] = &[
    Vertex { position: [0.0, 0.0, 0.0], 	color: [0.5, 1.0, 0.5] }, 
	Vertex { position: [0.5, 0.0, 0.0], 	color: [0.5, 0.0, 0.5] }, 
    Vertex { position: [0.25, 0.433, 0.0],	color: [0.5, 0.0, 0.5] }, 
    Vertex { position: [-0.25, 0.433, 0.0],	color: [0.5, 0.0, 0.5] }, 
    Vertex { position: [-0.5, 0.0, 0.0],	color: [1.0, 0.0, 0.5] }, 
    Vertex { position: [-0.25, -0.433, 0.0],color: [0.5, 0.0, 0.5] }, 
    Vertex { position: [0.25, -0.433, 0.0],	color: [0.5, 0.0, 0.5] }, 
    ];

#[rustfmt::skip]
const INDICES: &[u16] = &[
    0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 5,
    0, 5, 6,
    0, 6, 1,
];

struct State<'a> {
    surface: wgpu::Surface<'a>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    size: winit::dpi::PhysicalSize<u32>,
    render_pipeline: wgpu::RenderPipeline,
    vertex_buffer: wgpu::Buffer,
    raw_vertex_buffer: wgpu::Buffer,
    num_vertices: u32,
    index_buffer: wgpu::Buffer,
    num_indices: u32,
    // The window must be declared after the surface so
    // it gets dropped after it as the surface contains
    // unsafe references to the window's resources.
    window: &'a Window,
    clear_colour: wgpu::Color,
}

impl<'a> State<'a> {
    async fn new(window: &'a Window) -> State<'a> {
        let size = window.inner_size();

        // The instance is a handle to our GPU
        // BackendBit::PRIMARY => Vulkan + Metal + DX12 + Browser WebGPU
        let instance = wgpu::Instance::new(&wgpu::InstanceDescriptor {
            #[cfg(not(target_arch = "wasm32"))]
            backends: wgpu::Backends::PRIMARY,
            #[cfg(target_arch = "wasm32")]
            backends: wgpu::Backends::GL,
            ..Default::default()
        });

        let surface = instance.create_surface(window).unwrap();

        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::default(),
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
            })
            .await
            .unwrap();

        let (device, queue) = adapter
            .request_device(&wgpu::DeviceDescriptor {
                label: None,
                required_features: wgpu::Features::empty(),
                // WebGL doesn't support all of wgpu's features, so if
                // we're building for the web we'll have to disable some.
                required_limits: LIMITS,
                memory_hints: Default::default(),
                trace: wgpu::Trace::Off,
            })
            .await
            .unwrap();

        let surface_caps = surface.get_capabilities(&adapter);
        // Shader code in this tutorial assumes an Srgb surface texture. Using a different
        // one will result all the colors comming out darker. If you want to support non
        // Srgb surfaces, you'll need to account for that when drawing to the frame.
        let surface_format = surface_caps
            .formats
            .iter()
            .copied()
            .find(|f| f.is_srgb())
            .unwrap_or(surface_caps.formats[0]);
        let config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            format: surface_format,
            width: size.width,
            height: size.height,
            present_mode: surface_caps.present_modes[0],
            alpha_mode: surface_caps.alpha_modes[0],
            desired_maximum_frame_latency: 2,
            view_formats: vec![],
        };

        let vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Vertex Buffer"),
            contents: bytemuck::cast_slice(VERTICES),
            usage: wgpu::BufferUsages::VERTEX,
        });

        let raw_vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Vertex Buffer"),
            contents: bytemuck::cast_slice(VERTICES_RAW),
            usage: wgpu::BufferUsages::VERTEX,
        });
        let num_vertices = VERTICES_RAW.len() as u32;

        let index_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Index Buffer"),
            contents: bytemuck::cast_slice(INDICES),
            usage: wgpu::BufferUsages::INDEX,
        });
        let num_indices = INDICES.len() as u32;

        let shader = device.create_shader_module(wgpu::include_wgsl!("shader.wgsl"));

        let render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("Render Pipeline Layout"),
                bind_group_layouts: &[],
                push_constant_ranges: &[],
            });

        let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("Render Pipeline"),
            layout: Some(&render_pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: Some("vs_main"),
                buffers: &[Vertex::desc()],
                compilation_options: wgpu::PipelineCompilationOptions::default(),
            },
            fragment: Some(wgpu::FragmentState {
                module: &shader,
                entry_point: Some("fs_main"),
                targets: &[Some(wgpu::ColorTargetState {
                    format: config.format,
                    blend: Some(wgpu::BlendState::REPLACE),
                    write_mask: wgpu::ColorWrites::ALL,
                })],
                compilation_options: wgpu::PipelineCompilationOptions::default(),
            }),
            primitive: wgpu::PrimitiveState {
                topology: wgpu::PrimitiveTopology::TriangleList,
                strip_index_format: None,
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: Some(wgpu::Face::Back),
                polygon_mode: wgpu::PolygonMode::Fill, // Setting this to anything other than Fill requires Features::NON_FILL_POLYGON_MODE
                unclipped_depth: false,                // Requires Features::DEPTH_CLIP_CONTROL
                conservative: false, // Requires Features::CONSERVATIVE_RASTERIZATION
            },
            depth_stencil: None,
            multisample: wgpu::MultisampleState {
                count: 1,
                mask: !0,
                alpha_to_coverage_enabled: false,
            },
            multiview: None,
            cache: None,
        });

        Self {
            surface,
            device,
            queue,
            config,
            size,
            render_pipeline,
            vertex_buffer,
            raw_vertex_buffer,
            num_vertices,
            index_buffer,
            num_indices,
            window,
            clear_colour: wgpu::Color::BLACK,
        }
    }

    fn window(&self) -> &Window {
        &self.window
    }

    pub fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
        if new_size.width > 0 && new_size.height > 0 {
            self.size = new_size;
            self.config.width = new_size.width;
            self.config.height = new_size.height;
            self.surface.configure(&self.device, &self.config);
        }
    }

    fn input(&mut self, event: &WindowEvent) -> bool {
        match event {
            WindowEvent::CursorMoved { position, .. } => {
                self.clear_colour = wgpu::Color {
                    r: position.x as f64 / self.size.width as f64,
                    g: position.y as f64 / self.size.height as f64,
                    b: 1.0,
                    a: 1.0,
                };
                true
            }
            _ => false,
        }
    }

    fn update(&mut self) {}

    fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        let output = self.surface.get_current_texture()?;
        let view = output
            .texture
            .create_view(&wgpu::TextureViewDescriptor::default());

        let mut encoder = self
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                label: Some("Render Encoder"),
            });

        {
            let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Render Pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(self.clear_colour),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: None,
                occlusion_query_set: None,
                timestamp_writes: None,
            });

            render_pass.set_pipeline(&self.render_pipeline);
            render_pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));

            render_pass.set_index_buffer(self.index_buffer.slice(..), wgpu::IndexFormat::Uint16);
            render_pass.draw_indexed(0..self.num_indices, 0, 0..1);
        }

        self.queue.submit(iter::once(encoder.finish()));
        output.present();

        Ok(())
    }
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen(start))]
pub async fn run() {
    cfg_if::cfg_if! {
        if #[cfg(target_arch = "wasm32")] {
            std::panic::set_hook(Box::new(console_error_panic_hook::hook));
            console_log::init_with_level(log::Level::Warn).expect("Couldn't initialize logger");
        } else {
            env_logger::init();
        }
    }

    let event_loop = EventLoop::new().unwrap();
    let window = WindowBuilder::new().build(&event_loop).unwrap();

    #[cfg(target_arch = "wasm32")]
    {
        // Winit prevents sizing with CSS, so we have to set
        // the size manually when on web.
        use winit::dpi::PhysicalSize;

        use winit::platform::web::WindowExtWebSys;
        web_sys::window()
            .and_then(|win| {
                let width = win.inner_width().unwrap().as_f64().unwrap() as u32;
                let height = win.inner_height().unwrap().as_f64().unwrap() as u32;
                let factor = window.scale_factor();
                let logical = LogicalSize { width, height };
                let PhysicalSize { width, height }: PhysicalSize<u32> = logical.to_physical(factor);
                let _ = window.request_inner_size(PhysicalSize::new(
                    width.min(LIMITS.max_texture_dimension_2d),
                    height.min(LIMITS.max_texture_dimension_2d),
                ));
                win.document()
            })
            .and_then(|doc| {
                let dst = doc.get_element_by_id("bg")?;
                let canvas = web_sys::Element::from(window.canvas()?);
                dst.append_child(&canvas).ok()?;
                Some(())
            })
            .expect("Couldn't append canvas to document body.");
    }

    // State::new uses async code, so we're going to wait for it to finish
    let mut state = State::new(&window).await;
    let mut surface_configured = false;

    event_loop
        .run(move |event, control_flow| {
            match event {
                Event::WindowEvent {
                    ref event,
                    window_id,
                } if window_id == state.window().id() => {
                    if !state.input(event) {
                        // UPDATED!
                        match event {
                            WindowEvent::CloseRequested
                            | WindowEvent::KeyboardInput {
                                event:
                                    KeyEvent {
                                        state: ElementState::Pressed,
                                        physical_key: PhysicalKey::Code(KeyCode::Escape),
                                        ..
                                    },
                                ..
                            } =>
                            {
                                #[cfg(not(target_arch = "wasm32"))]
                                control_flow.exit()
                            }
                            WindowEvent::Resized(physical_size) => {
                                log::info!("physical_size: {physical_size:?}");
                                surface_configured = true;
                                if physical_size.width <= LIMITS.max_texture_dimension_2d
                                    && physical_size.width <= LIMITS.max_texture_dimension_2d
                                {
                                    state.resize(*physical_size);
                                }
                            }
                            WindowEvent::RedrawRequested => {
                                // This tells winit that we want another frame after this one
                                state.window().request_redraw();

                                if !surface_configured {
                                    return;
                                }

                                state.update();
                                match state.render() {
                                    Ok(_) => {}
                                    // Reconfigure the surface if it's lost or outdated
                                    Err(
                                        wgpu::SurfaceError::Lost | wgpu::SurfaceError::Outdated,
                                    ) => state.resize(state.size),
                                    Err(wgpu::SurfaceError::OutOfMemory) => {
                                        // The system is out of memory, we should probably quit
                                        log::error!("OutOfMemory");
                                        control_flow.exit();
                                    }
                                    Err(wgpu::SurfaceError::Timeout) => {
                                        // This happens when the a frame takes too long to present
                                        log::warn!("Surface timeout")
                                    }
                                    Err(wgpu::SurfaceError::Other) => {
                                        log::warn!("Other surface error")
                                    }
                                }
                            }
                            _ => {}
                        }
                    }
                }
                _ => {}
            }
        })
        .unwrap();
}

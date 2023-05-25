export const shaders = () => {
  const vertex = `
  struct TransformData {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
  };

    
  struct Output{
    @builtin(position) Position : vec4<f32>,
    @location(0) color : vec2<f32>,
  }

    @vertex
    fn main(
      @location(0) pos : vec4<f32>,
      @location(1) color : vec2<f32>,
    ) -> Output{
      var output: Output;
      output.Position = pos;
      output.color = color;
      return output;
    }
  `

  const fragment = `
  @group(0) @binding(0) var mySampler: sampler;
  @group(0) @binding(1) var myTexture: texture_2d<f32>;

  @fragment
  fn main(
    @location(0) color: vec2<f32>,
  ) -> @location(0) vec4<f32> {
    return textureSample(myTexture, mySampler, color);
  }
  `

  const compute = `
  
  struct Node{
    x: f32,
    y: f32,
    weight: f32,
  }
  @binding(0) @group(0) var<storage, read_write> data: array<f32>;
  @binding(1) @group(0) var<storage, read_write> x: array<f32>;
  @binding(2) @group(0) var<storage, read_write> y: array<f32>;
  @binding(3) @group(0) var<storage, read_write> weight: array<f32>;
  @binding(4) @group(0) var<storage, read_write> colors:array<f32>;

  fn getColor(value: f32)->vec3<f32>{
    var size=f32(arrayLength(&colors)/3-1);
    var per=i32(floor(value*size));
    var r=vec3<f32>(colors[per],colors[per+1],colors[per+2]);
    return r;
  }
  @compute @workgroup_size(4)
  fn main(@builtin(global_invocation_id) id: vec3<u32>){

    var k = id.x;
    k=4*k;

    var n = arrayLength(&x);
    var m = arrayLength(&y);
    var value:f32=0;
    var i:u32=0;
    var xIndex=f32(k/(256*4));
    var yIndex=f32((k/4)%(256));
    xIndex = xIndex/256;
    yIndex = yIndex/256;
    var sigma: f32 = 10000;
    for(i=0;i<n;i=i+1){
      var square_dist = (x[i]-xIndex)*(x[i]-xIndex)+(y[i]-yIndex)*(y[i]-yIndex);
      square_dist = square_dist*sigma;
      value=value+(weight[i]/(square_dist+1));
    }
    //value=(value*100+64)%256;
    // var min=-0.77;
    // var max=0.33;
    var min=-0.86;
    var max=0.98;
    value = (value-min)/(max-min);
    //value = value*255+0;
    var color = getColor(value);
    data[k]=color[0]*255;
    data[k+1]=color[1]*255;
    data[k+2]=color[2]*255;
    data[k+3]=1;
  }
  
  `
  return {vertex, fragment, compute}
};

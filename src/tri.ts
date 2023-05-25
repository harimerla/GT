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
  
    @compute @workgroup_size(5)
    fn main(@builtin(global_invocation_id) id: vec3<u32>){
  
      var k = id.x;
      if(k%4==3){
        data[k]=1;
        return;
      }
      if(k%4==1){
        data[k]=237;
        return;
      }
  
      if(k%4==2){
        data[k]=110;
        return;
      }
  
      var n = arrayLength(&x);
      var m = arrayLength(&y);
      var value:f32=0;
      var i:u32=0;
      var xIndex=f32(k/(256*4));
      var yIndex=f32((k/4)%(256));
      xIndex = xIndex/256;
      yIndex = yIndex/256;
      var sigma: f32 = 30000;
      for(i=0;i<n;i=i+1){
        var square_dist = (x[i]-xIndex)*(x[i]-xIndex)+(y[i]-yIndex)*(y[i]-yIndex);
        square_dist = square_dist*sigma;
        value=value+(weight[i]/(square_dist+1));
      }
      //value=(value*100+64)%256;
      var min=-0.86;
      var max=0.98;
      value = (value-min)/(max-min);
      value = value*256+0;
      data[k] = value;
    }
    
    `
    return {vertex, fragment, compute}
  };
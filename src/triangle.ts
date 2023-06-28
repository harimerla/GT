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
  @binding(5) @group(0) var myTexture: texture_2d<f32>;
  @binding(6) @group(0) var<storage, read_write> params: array<f32>;
  @binding(7) @group(0) var<storage, read_write> dataOnly: array<f32>;
  

  fn getColor(value: f32)->vec4<f32>{
    var size=f32(arrayLength(&colors)/4-1);
    var index=i32(round(4*value));
    var r=vec4<f32>(colors[index],colors[index+1],colors[index+2],colors[index+3]);
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
    var sigma: f32 = params[0];
    for(i=0;i<n;i=i+1){
      var square_dist = (x[i]-xIndex)*(x[i]-xIndex)+(y[i]-yIndex)*(y[i]-yIndex);
      square_dist = square_dist*sigma;
      value=value+weight[i]/(square_dist+1);
    }
    data[k]=value;
    data[k+1]=value;
    data[k+2]=value;
    data[k+3]=value;

    // var minRange=0.0;
    // var maxRange=0.3;
    // if(value<minRange){
    //   value=0;
    // }
    // else if(value>maxRange){
    //   value=1;
    // }
    // else{
    //   value=(value-minRange)/(maxRange-minRange);
    // }
    dataOnly[k/4]=dataOnly[k/4]+value;
  }

  @compute @workgroup_size(1)
  fn normalize(@builtin(global_invocation_id) id: vec3<u32>){
    if(params[0]==0){
      return;
    }
    var k=id.x;
    var min=255.0;
    var max=-255.0;
    var minRange=f32(params[1]);
    var maxRange=f32(params[2]);
    minRange=(minRange+10.0)/20.0;
    maxRange=(maxRange+10.0)/20.0;
    var len = arrayLength(&dataOnly);
    for(var i:u32=0;i<len;i++){
      if(min>dataOnly[i]){
        min=dataOnly[i];
      }
      if(max<dataOnly[i]){
        max=dataOnly[i];
      }
    }
    var v:i32;
    for(var i:u32=0;i<len;i+=4){
      data[i]=(data[i]-min)/(max-min);
      if(data[i]<minRange){
        data[i]=0;
      }
      else if(data[i]>maxRange){
        data[i]=1;
      }
      else{
        data[i]=(data[i]-minRange)/(maxRange-minRange);
      }
      data[i]=data[i]*f32(arrayLength(&colors)/4-1)+0;
      v=16*i32(data[i]/4);
      data[i]=colors[v];
      data[i+1]=colors[v+1];
      data[i+2]=colors[v+2];
      data[i+3]=255;
    }
    for(var i:u32=0;i<arrayLength(&dataOnly);i++){
      var sampleSize=params[3];
      if(params[4]==1){
        dataOnly[i]=dataOnly[i]/sampleSize;
      }
    }
  }
  
  `
  return {vertex, fragment, compute}
};

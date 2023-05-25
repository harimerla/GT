import {vec3,mat4} from 'gl-matrix'
import { CubeData } from './cubeData'
import {shaders} from './triangle'
import {CubeDataGene, ColormapData} from './gene_list'
import * as fs from 'fs';
//const fs = require('fs'); 
//import fs from 'fs-extra';
//import * as Deno from 'deno';

async function saveImageBitmapToPNG(imageBitmap: ImageBitmap, fileName: string) {
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  const context = canvas.getContext('2d');
  context.drawImage(imageBitmap, 0, 0);

  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        resolve();
      } else {
        reject(new Error('Failed to create blob.'));
      }
    }, 'image/png');
  });
}

function convertFloat32ArrayToHTMLImageElement(floatArray, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const imageData = new ImageData(Uint8ClampedArray.from(floatArray), width, height);
  canvas.getContext('2d').putImageData(imageData, 0, 0);
  console.log(canvas.dataset)

  const img = new Image();
  img.src = canvas.toDataURL();
  img.width=width;
  img.height=height;

  return img;
}


function pixelsToCanvas(pixels, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  imgData.data.set(pixels);
  ctx.putImageData(imgData, 0, 1);

  // flip the image
  ctx.scale(1, -1);
  ctx.globalCompositeOperation = 'copy';
  ctx.drawImage(canvas, 0, -height, width, height);

  return canvas;
}

(async() => {
  var adapter = await navigator.gpu.requestAdapter();
  var device = await adapter.requestDevice();

  var canvas = document.getElementById("webgpu-canvas") as HTMLCanvasElement;
  var context = canvas.getContext("webgpu");

  var square = CubeDataGene().square;
  var cubeBuff = device.createBuffer({
    size: square.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true 
  });

  new Float32Array(cubeBuff.getMappedRange()).set(square);
  cubeBuff.unmap();

  var depthTexture = device.createTexture({
    size: {width: canvas.width, height: canvas.height},
    format: "depth24plus-stencil8",
    usage: GPUTextureUsage.RENDER_ATTACHMENT
  });

  context.configure(
    {device: device, format: "bgra8unorm", usage: GPUTextureUsage.RENDER_ATTACHMENT});
  
    var sampler = device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
      mipmapFilter: 'nearest',
      maxAnisotropy: 1
    } as GPUSamplerDescriptor);
  var width=256, height=256;
  var imageee;
  let cubeTexture: GPUTexture;
    {
      const img = document.createElement('img');
      const response: Response = await fetch('dog.webp');
      const blob: Blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);
      //saveImageBitmapToPNG(imageBitmap, 'dog');

      console.log('image: '+imageBitmap.height+" "+imageBitmap.width);
      console.log('canvas'+canvas.height+" "+canvas.width);
  
      cubeTexture = device.createTexture({
        size: [width,height, 1],
        //size: [64,64,1],
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT,
      });
      console.log('dimension'+cubeTexture.width);
      imageee=imageBitmap;
      // console.log(zeroimg.length);
      // var image = pixelsToCanvas(zeroimg, width, height);
      // console.log('blob'+blob.size);
      // device.queue.copyExternalImageToTexture(
      //   { source: imageBitmap },
      //   { texture: cubeTexture },
      //   [imageBitmap.width,imageBitmap.height]
      // );
    }
  
    var bindingGroupLayout = device.createBindGroupLayout({
      entries:[{
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {}
      } as GPUBindGroupLayoutEntry,{
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture:{}
      } as GPUBindGroupLayoutEntry]
    });
  
    var uniformBindGroup = device.createBindGroup({
      layout: bindingGroupLayout,
      entries: [
        {
          binding: 0,
          resource: sampler
        },
        {
          binding: 1,
          resource: cubeTexture.createView()
        }
      ]
    });
  
  var computeBindGroupLayouts = device.createBindGroupLayout({
    label: 'Compute Binding Group Layout',
    entries: [{
      binding: 0,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {type: 'storage'}
    },{
      binding: 1,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {type: 'storage'}
    },{
      binding: 2,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {type: 'storage'}
    },{
      binding: 3,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {type: 'storage'}
    },{
      binding: 4,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {type: 'storage'}
    }]
  })

  var zeroimg = new Float32Array(256*256*4);
  var texBuff = device.createBuffer({
    label: 'textbuff buffer',
    size: zeroimg.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
  });
  var x = CubeDataGene().x;
  var y = CubeDataGene().y;
  var weight = CubeDataGene().weight;

  var xBuff = device.createBuffer({
    label: 'x buffer',
    size: x.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
  });

  var yBuff = device.createBuffer({
    label: 'y buffer',
    size: y.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
  });

  var weightBuff = device.createBuffer({
    label: 'textbuff buffer',
    size: weight.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
  });

  var resultBuff = device.createBuffer({
    label: 'result buffer',
    size: zeroimg.byteLength,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  var flatColor = new Float32Array(ColormapData('jet').flat());
  var colomapBuff = device.createBuffer({
    label: 'color map buffer',
    size: flatColor.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
  })

  device.queue.writeBuffer(texBuff, 0, zeroimg);
  device.queue.writeBuffer(xBuff,0,x);
  device.queue.writeBuffer(yBuff,0,y);
  device.queue.writeBuffer(weightBuff,0,weight);
  device.queue.writeBuffer(colomapBuff,0,flatColor);

  var computeUniformBindGroup = device.createBindGroup({
    label: 'Compute Binding Group',
    layout: computeBindGroupLayouts,
    entries: [{
      binding: 0,
      resource: {buffer: texBuff}
    },{
      binding: 1,
      resource: {buffer: xBuff}
    },{
      binding: 2,
      resource: {buffer: yBuff}
    },{
      binding: 3,
      resource: {buffer: weightBuff}
    },{
      binding: 4,
      resource: {buffer: colomapBuff}
    }]
  })
  
  var computePipeline = device.createComputePipeline({
    label: 'Compute Pipeline',
    layout: device.createPipelineLayout({bindGroupLayouts: [computeBindGroupLayouts]}),
    compute: {
      module: device.createShaderModule({code: shaders().compute}),
      entryPoint: 'main'
    }
  })
  
  var renderPipeline = device.createRenderPipeline({
    layout : device.createPipelineLayout({bindGroupLayouts: [bindingGroupLayout]}),
    vertex: {
      module: device.createShaderModule({code: shaders().vertex}),
      entryPoint: 'main',
      buffers: [{
        arrayStride: 6*4,
        attributes:[
          {format: 'float32x4', offset:0, shaderLocation: 0},
          {format: 'float32x2', offset:16, shaderLocation: 1}]
      }]
    } as GPUVertexState,
    fragment:{
      module: device.createShaderModule({code: shaders().fragment}),
      entryPoint: 'main',
      targets: [{format: 'bgra8unorm'}]
    } as GPUFragmentState,
    depthStencil: {format: "depth24plus-stencil8", depthWriteEnabled: true, depthCompare: "less"},
    primitive:{topology:"triangle-strip"},
  });

  var renderPassDesc = {
    colorAttachments: [{    
        view: undefined,
        loadOp: "clear",
        clearValue: [0.5, 0.5, 0.5, 1],
        storeOp: "store"
    }],
    depthStencilAttachment: {
        view: depthTexture.createView(),
        depthLoadOp: "clear",
        depthClearValue: 1.0,
        depthStoreOp: "store",
        stencilLoadOp: "clear",
        stencilClearValue: 0,
        stencilStoreOp: "store"
    }
} as GPURenderPassDescriptor;


var animationFrame = function() {
  var resolve = null;
  var promise = new Promise(r => resolve = r);
  window.requestAnimationFrame(resolve);
  return promise
};
requestAnimationFrame(animationFrame);

const encoder = device.createCommandEncoder({
  label: 'doubling encoder',
});
const pass = encoder.beginComputePass({
  label: 'doubling compute pass',
});
pass.setPipeline(computePipeline);
pass.setBindGroup(0, computeUniformBindGroup);
//pass.dispatchWorkgroups(zeroimg.length);
pass.dispatchWorkgroups(width*height-1);
// pass.dispatchWorkgroups(zeroimg.length/6);
// pass.dispatchWorkgroups(zeroimg.length/6);
// pass.dispatchWorkgroups(zeroimg.length/6);
// pass.dispatchWorkgroups(zeroimg.length/6);
// pass.dispatchWorkgroups(zeroimg.length/6);

// device.queue.copyExternalImageToTexture(
//   { source: zeroimg },
//   { texture: cubeTexture },
//   [width, height]
// );

pass.end();
encoder.copyBufferToBuffer(texBuff,0,resultBuff, 0, resultBuff.size);
device.queue.submit([encoder.finish()]);

await resultBuff.mapAsync(GPUMapMode.READ);
const result = new Float32Array(resultBuff.getMappedRange().slice(0,resultBuff.size));
resultBuff.unmap();


// const file = new Blob([result.toString()], {type: 'text/plain;charset=utf-8'});
// const url = URL.createObjectURL(file);
// const link = document.createElement('a');
// link.href = url;
// link.download = 'filename.txt';
// document.body.appendChild(link);
// link.click();
// console.log('output'+result[result.length-1]);
var min=10000, max=-100000;
for(var i=0;i<result.length;i++){
  if(min>result[i])
    min=result[i];
  if(max<result[i])
    max=result[i];
}
console.log('min: '+min+' max: '+max);

while(true){
  await animationFrame();

  renderPassDesc.colorAttachments[0].view = context.getCurrentTexture().createView();
  var commandEncoder = device.createCommandEncoder();
  var renderPass = commandEncoder.beginRenderPass(renderPassDesc);

  renderPass.setPipeline(renderPipeline);
  renderPass.setVertexBuffer(0,cubeBuff);
  renderPass.setBindGroup(0,uniformBindGroup);
  var interpolateArrays = require('interpolate-arrays')

  // for(var i=0;i<result.length;i+=4){
  //   var red   = [255, 0, 0]
  //   var green = [0, 255, 0]
  //   var blue  = [0, 0, 255]
  //   var res = interpolateArrays([red, green, blue], Math.abs(result[i]/255));
  //   result[i]=res[0];
  //   result[i+1]=res[1];
  //   result[i+2]=res[2];
  // }
      console.log('result'+result);
      const htmlImage = convertFloat32ArrayToHTMLImageElement(result,width,height);
      console.log('htmlimage'+htmlImage.width+" : "+htmlImage.height);
      console.log('canvas dimension'+cubeTexture.width+" : "+cubeTexture.height);
      const imageBitmap = await createImageBitmap(htmlImage);
      //saveImageBitmapToPNG(imageBitmap, 'temp');
      console.log('generated :'+imageBitmap.width+' '+imageBitmap.height);
      console.log('texture: '+cubeTexture.width+" "+cubeTexture.height);
      device.queue.copyExternalImageToTexture(
        {source:  imageBitmap},
        { texture: cubeTexture},
        [imageBitmap.width, imageBitmap.height,1]
      );
      //encoder.copyBufferToTexture({buffer:resultBuff, offset:0, bytesPerRow:width, rowsPerImage:height},{texture:cubeTexture, mipLevel:0, origin:{ x: 0, y: 0, z: 0 }},[width,height,1]);

  renderPass.draw(6);
  renderPass.end();
  device.queue.submit([commandEncoder.finish()]);
  break;
}

})();
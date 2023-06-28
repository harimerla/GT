import {vec3,mat4} from 'gl-matrix'
import { CubeData } from './cubeData'
import {shaders} from './triangle'
import {CubeDataGene, ColormapData} from './gene_list'
import csv from 'csv-parser';
import * as fs from 'fs';
import * as pandas from "pandas";
import { DataFrame } from "pandas-js";
import {drawPlot} from './plot'
import {exportToHtml, getExpData,getExpData1, getAGPLOT, preProcessExpData, getSelection} from './preProcessing'
//import * as csvtojson from 'csvtojson';
const csvtojson=require("csvtojson");
var Plotly = require('plotly.js/lib/core');
Plotly.register([
  require('plotly.js/lib/pie'),
  require('plotly.js/lib/choropleth'),
  require('plotly.js/lib/heatmap'),
  require('plotly.js/lib/scatter'),
  require('plotly.js/lib/contour'),
]);

module.exports = Plotly;

async function convertPromiseToFloat32Array(outcome) {
  try {
    const result = await outcome;
    if (result instanceof Float32Array) {
      return result;
    } else {
      throw new Error('Promise did not resolve to a Float32Array');
    }
  } catch (error) {
    console.error('Error converting promise to Float32Array:', error);
    return null;
  }
}

function rotate90DegreesCounterClockwise(array) {
  const rows = array.length;
  const cols = array[0].length;
  const rotatedArray = [];

  for (let col = cols - 1; col >= 0; col--) {
    const newRow = [];
    for (let row = 0; row < rows; row++) {
      newRow.push(array[row][col]);
    }
    rotatedArray.push(newRow);
  }

  return rotatedArray;
}


function getImageDataFromImage(image: HTMLImageElement): Uint8ClampedArray {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context not supported.');
  }

  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, image.width, image.height);

  return imageData.data;
}


function imageBitmapToArray(imageBitmap: ImageBitmap): Promise<Uint8ClampedArray> {
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not supported.');
  }

  ctx.drawImage(imageBitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);

  return Promise.resolve(imageData.data);
}


function blobToArray(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      resolve(uint8Array);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read blob as array.'));
    };

    reader.readAsArrayBuffer(blob);
  });
}

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
  //console.log('imagedata: '+imageData.data);
  canvas.getContext('2d').putImageData(imageData, 0, 0);
  //console.log('canvas get data: '+canvas.getContext('2d').getImageData(0,0,width,height).data);

  const img = new Image();
  img.src = canvas.toDataURL();
  img.width=width;
  img.height=height;
  //console.log(img.src)

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

function convert1DArrayTo2D(float32Array, rows, columns) {
  if (rows * columns !== float32Array.length) {
    throw new Error('Dimensions do not match');
  }

  const result = [];
  let index = 0;

  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      row.push(float32Array[index]);
      index++;
    }
    result.push(row);
  }

  return result;
}

function normalize(arr: Float32Array){
  var min = 256, max=-256;
  var temp = new Float32Array(arr.length)
  for(var i=0;i<arr.length;i++){
    if(min>arr[i])
      min=arr[i];
    if(max<arr[i])
      max=arr[i];
  }
  for(var i=0;i<arr.length;i++){
    //temp[i]=(arr[i]-min)/(max-min);
    temp[i]=arr[i]*255;
  }
  return temp;
}

async function main(expressionData: Float32Array, layoutDataX: Float32Array, layoutDataY: Float32Array, geneName: Float32Array, sigmaa=1, showGene: boolean, scaleMin: number, scaleMax: number, sampleSize: number, lastIternation:number,  data: Float32Array) {
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
    }
  
    // Load the default colormap and upload it
  var colormapImage = new Image();
  colormapImage.src = "/dog.webp";
  colormapImage.id = 'image';
  await colormapImage.decode();
  const imageBitmap = await createImageBitmap(colormapImage);
  document.getElementById("no-webgpu").appendChild(colormapImage);
  var colorTexture = device.createTexture({
    size: [imageBitmap.width, imageBitmap.height, 1],
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
  });
  

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
    },{
      binding: 5,
      visibility: GPUShaderStage.COMPUTE,
      texture: {}
    },{
      binding: 6,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {type: 'storage'}
    },{
      binding: 7,
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

  // var dataValues = new Float32Array(256*256);
  var dataValues = data;
  console.log('just checking : '+data[0])
  var dataValuesBuff = device.createBuffer({
    label: 'data values only buffer',
    size: dataValues.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
  });

  var x = layoutDataX;
  var y = layoutDataY;
  var weight = expressionData;
  console.log('Checking lengths of x,y,weight');
  console.log(x.length+' '+x[0]);
  console.log(y.length+' '+y[0]);
  console.log(weight.length+' '+weight[0]);
  var sigmaMap = {0:0, 0.1:9000, 0.2:8000,0.3:7000,0.4:6000, 0.5:5000,0.6:2000, 0.7:1000, 0.8:500, 0.9:100,1:50}
  var params = new Float32Array([sigmaMap[sigmaa],scaleMin,scaleMax, sampleSize, lastIternation]);
  //var params = new Float32Array([sigmaa,scaleMin,scaleMax]);
  //sigma.fill([sigmaa,scaleMin,scaleMax],0,3);
  // var x = CubeDataGene().x;
  // var y = CubeDataGene().y;
  // var weight = CubeDataGene().weight;

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

  var dataOnlyResultBuff = device.createBuffer({
    label: 'result buffer',
    size: dataValues.byteLength,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  var colormap = require('colormap');
  var color = colormap({
    colormap: 'jet',
    nshades: 200,
    format: 'rgba',
    alpha: 1
  });
  var flatColor = new Float32Array(color.flat());
  var colomapBuff = device.createBuffer({
    label: 'color map buffer',
    size: flatColor.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE,
  })

  var paramsBuff = device.createBuffer({
    label: 'params buffer',
    size: params.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  })

  device.queue.writeBuffer(texBuff, 0, zeroimg);
  device.queue.writeBuffer(xBuff,0,x);
  device.queue.writeBuffer(yBuff,0,y);
  device.queue.writeBuffer(weightBuff,0,weight);
  device.queue.writeBuffer(colomapBuff,0,flatColor);
  device.queue.writeBuffer(paramsBuff, 0, params);
  device.queue.writeBuffer(dataValuesBuff, 0, dataValues);

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
    },{
      binding: 5,
      resource: colorTexture.createView(),
    },{
      binding: 6,
      resource: {buffer: paramsBuff}
    },{
      binding: 7,
      resource: {buffer: dataValuesBuff}
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

  var computePipelineNormalize = device.createComputePipeline({
    label: 'Compute Pipeline for Normalization',
    layout: device.createPipelineLayout({bindGroupLayouts: [computeBindGroupLayouts]}),
    compute: {
      module: device.createShaderModule({code: shaders().compute}),
      entryPoint: 'normalize'
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

var encoder = device.createCommandEncoder({
  label: 'doubling encoder',
});
var pass = encoder.beginComputePass({
  label: 'doubling compute pass',
});
pass.setPipeline(computePipeline);
pass.setBindGroup(0, computeUniformBindGroup);
pass.dispatchWorkgroups(width*height-1);

pass.end();
console.log('height: '+height+" width+"+width+" image bytelength: "+zeroimg.byteLength)
device.queue.submit([encoder.finish()]);

encoder = device.createCommandEncoder({label: 'Normalization Encoder'});
pass = encoder.beginComputePass({label: 'Compute Pass for Normalization'});
pass.setPipeline(computePipelineNormalize);
pass.setBindGroup(0, computeUniformBindGroup);
pass.dispatchWorkgroups(1);
pass.end();

encoder.copyBufferToBuffer(texBuff,0,resultBuff, 0, resultBuff.size);
encoder.copyBufferToBuffer(dataValuesBuff,0,dataOnlyResultBuff, 0, dataOnlyResultBuff.size);
console.log('height: '+height+" width+"+width+" image bytelength: "+zeroimg.byteLength)
device.queue.submit([encoder.finish()]);


await resultBuff.mapAsync(GPUMapMode.READ);
await dataOnlyResultBuff.mapAsync(GPUMapMode.READ);
const result = new Float32Array(resultBuff.getMappedRange().slice(0,resultBuff.size));
const dataOnlyResult = new Float32Array(dataOnlyResultBuff.getMappedRange().slice(0,resultBuff.size));
console.log('data only result: '+dataOnlyResult);
//console.log('reslut: '+result);
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

  const htmlImage = await convertFloat32ArrayToHTMLImageElement(result,width,height);
  const imageBitmap = await createImageBitmap(htmlImage, {resizeWidth:width, resizeHeight:height});

  // document.getElementById('canvas-div').on('plotly_selected', function(eventData) {
  //   var selectedPoints = eventData.points;
  
  //   // Do something with the selected points
  //   console.log('Selected Points:', selectedPoints);
  // });
  // device.queue.copyExternalImageToTexture(
  //   {source:  imageBitmap},
  //   { texture: cubeTexture},
  //   [imageBitmap.width, imageBitmap.height,1]
  // );
  var converted2DData = convert1DArrayTo2D(dataOnlyResult,256,256);
    console.log('inside draw plot')
  // console.log('normalize: '+x);
  // console.log('normalize: '+y);
  //console.log('2d array'+convert1DArrayTo2D(dataOnlyResult,256,256))
  var heatMapdata = [{
    z: rotate90DegreesCounterClockwise(converted2DData).reverse(),
    //z: converted2DData,
    colorscale: 'Jet',
    type: 'heatmap',
    hoverinfo: 'none',
    zmin: scaleMin,
    zmax: scaleMax

  },{
    x: normalize(x),
    y: normalize(y),
    z: expressionData,
    mode: 'markers+text',
    type: 'scatter',
    text: geneName,
    colorscale: 'Jet',
    hoverinfo:true,
    visible: 'true',
    name: 'point'
  }]

  var contourData = [{
    z: rotate90DegreesCounterClockwise(converted2DData).reverse(),
    type: 'contour',
    colorscale: 'Jet',
    zmin: scaleMin,
    zmax: scaleMax
  },{
    x: normalize(x),
    y: normalize(y),
    z: expressionData,
    mode: 'markers+text',
    type: 'scatter',
    text: expressionData,
    colorscale: 'Jet',
    hoverinfo:true,
    visible: 'true',
    name: 'point'
  }]

  if(!showGene){
    heatMapdata[1].visible='legendonly';
    contourData[1].visible='legendonly';
  }
  else{
    heatMapdata[1].visible='true';
    contourData[1].visible='true';
  }

  var layout = {
    width:768,
    height:768,
  }
  if(lastIternation==1){
    Plotly.newPlot('canvas-div', heatMapdata, layout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
      var img = document.getElementById('a1') as HTMLAnchorElement;
      img.href=url;
    })});
    Plotly.newPlot('canvas-contour-div', contourData, layout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
      var img = document.getElementById('a2') as HTMLAnchorElement;
      img.href=url;
    })});
  }
  renderPass.draw(6);
  renderPass.end();
  //device.queue.submit([commandEncoder.finish()]);
  break;
}
return dataOnlyResult;
};

var expression = document.getElementById('expression') as HTMLInputElement;
var layout = document.getElementById('layout') as HTMLInputElement;
var expData, expressionData, layoutDataX, layoutDataY, geneName, layoutDataName,layoutData,flag=0,params={};
var layoutDataMap = new Map<string, any>();
var f=false;
expression.addEventListener('change', ()=>{
  sleep(2000);
  var file = expression.files[0];
  var reader = new FileReader();
  var name = file.name;
  console.log('Inside expression addeventlistener');
  reader.onload = function(e){
    var data = e.target.result;
    csvtojson({noheader:true}).fromString(data).then((jsonObjectArray) => {
      console.log(typeof(jsonObjectArray));
      expData = jsonObjectArray;
    })
    .catch((error) => {
      console.error(error);
    });
    // var lines = data.toString().split('\n');
    // for(var i=0;i<lines.length;i++){
    //   var row = lines[i].split('\t');
    //   console.log('flaffffff: '+flag);
    //   if(layoutDataMap.has(row[0])){
    //     var temp = layoutDataMap.get(row[0]);
    //     layoutDataMap.set(row[0], [temp[0],temp[1],temp[2],+row[1]]);
    //   }
    //   else{
    //     layoutDataMap.set(row[0], [row[1]]);
    //   }
    // }
  }
  reader.readAsText(file);
  console.log('flag'+flag);
  flag++;
  f=true;
})

layout.addEventListener('change', ()=>{
  sleep(2000);
  var file = layout.files[0];
  var reader = new FileReader();
  var name = file.name;
  console.log('Inside Layout addeventlistener');
  reader.onload = function(e){
    var data = e.target.result;
    var output;
    csvtojson({noheader:true}).fromString(data).then((jsonObjectArray) => {
      //console.log(jsonObjectArray);
      // console.log(Object.keys(jsonObjectArray));
      layoutData = jsonObjectArray;
      console.log(layoutData[0]);
    })
    .catch((error) => {
      console.error(error);
    });
    // var lines = data.toString().split('\n');
    // layoutDataName = new Float32Array(lines.length);
    // for(var i=0;i<lines.length;i++){
    //   var row = lines[i].split('\t');
    //   if(layoutDataMap.has(row[0])){
    //     var expVal=layoutDataMap.get(row[0])[0];
    //     layoutDataMap.set(row[0], [row[0],+row[1],+row[2],expVal]);
    //   } else{
    //     layoutDataMap.set(row[0], [row[0],+row[1],+row[2]]);
    //   }
    // }
  }
  reader.readAsText(file);
  console.log('layoutmap'+layoutData);
  flag++;
})

var selection:string[]=[];
getAGPLOT(selection)
// var selectDiv = document.getElementById('patient') as HTMLSelectElement;
// selectDiv.addEventListener('change', ()=>{
//   console.log(selectDiv.value);
//   selection = +selectDiv.value;
// })

console.log('flag'+flag);
var xIndex=0,yIndex=0,nameIndex=0,expIndex=0;
// function checkFlag() {
//   if(flag != 2) {
//     console.log('flag'+flag);
//     window.setTimeout(checkFlag, 2000); /* this checks the flag every 100 milliseconds*/
//   } else {
//     /* do something*/
//     // var len=0;
//     // for(var key of layoutDataMap.keys()){
//     //   if(layoutDataMap.get(key).length!=4)
//     //     continue;
//     //   len++;
//     // }
//     // geneName = new Array(len);
//     // layoutDataX = new Float32Array(len);
//     // layoutDataY = new Float32Array(len);
//     // expressionData = new Float32Array(len);
//     // for(var key of layoutDataMap.keys()){
//     //   var row = layoutDataMap.get(key);
//     //   console.log('row: '+row);
//     //   if(row.length!=4)
//     //     continue;
//     //   geneName[nameIndex++]=row[0];
//     //   layoutDataX[xIndex++]=row[1];
//     //   layoutDataY[yIndex++]=row[2];
//     //   expressionData[expIndex++]=row[3];
//     // }
//     //console.log('layoutDataMap'+layoutDataX);
//   }
// }
var sigmaInput = document.getElementById('sigma_range') as HTMLInputElement;
var sigma=1;
sigmaInput.addEventListener('change', ()=>{
  sigma=+sigmaInput.value;
  params['sigma']=sigma;
})

var scaleInputMin = document.getElementById('scale-min') as HTMLInputElement;
var scaleInputMax = document.getElementById('scale-max') as HTMLInputElement;
var scaleMin=-10, scaleMax=10;
scaleInputMin.addEventListener('change', ()=>{
  scaleMin=+scaleInputMin.value;
  params['scaleMin']=scaleMin;
})
scaleInputMax.addEventListener('change',()=>{
  scaleMax=+scaleInputMax.value;
  params['scaleMax']=scaleMax;
})
var showGeneInput = document.getElementById('show gene') as HTMLInputElement;
var showGene=false;
showGeneInput.addEventListener('click', ()=>{
  showGene=showGeneInput.checked;
  params['showGene']=showGene;
  console.log('show gene'+showGeneInput.checked);
})

var image;
var downloadDiv1 = document.getElementById('download-image1') as HTMLInputElement;
downloadDiv1.addEventListener('click',()=>{
  var img = document.getElementById("a1") as HTMLAnchorElement;
  exportToHtml(img);
})

var downloadDiv2 = document.getElementById('download-image2') as HTMLInputElement;
downloadDiv2.addEventListener('click',()=>{
  var img = document.getElementById("a2") as HTMLAnchorElement;
  exportToHtml(img);
})

var len=0;
var generate = document.getElementById('Generate');
var result=0, lastIternation=0;

generate.addEventListener('click', async ()=>{
  // console.log('x: '+layoutDataX.length+' y: '+layoutDataY.length+' exp: '+expressionData.length+' gene: '+geneName.length)
  // console.log('layoutx: '+layoutDataX)
  // console.log('layouty: '+layoutDataY)
  // console.log('expression data: '+expressionData)
  // console.log('gene names: '+geneName);
  // console.log('params: '+Object.keys(params));
  //console.log('expData: '+expData);
  // console.log('dsfgsdg+'+Object.keys(expData));
  // console.log('dsfgsdg+'+Object.keys(expData).length);
  // console.log('dsfgsdg+'+Object.keys(expData[0]).length);
  // console.log('dsfgsdg+'+expData[0].size);
  // console.log('layoutData: '+Object.keys(layoutData[0]));
  // console.log('layoutData: '+layoutData[0]['field1']);
  // console.log('layoutData: '+layoutData[0][0]);
  // console.log('layoutData: '+typeof(layoutData));
  var data=new Float32Array(256*256);
  selection = getSelection();
  selection = Array.from(new Set(selection));
  console.log('selection'+selection.length)
  if(f==true)
    expData = preProcessExpData(expData)
    for (const select of selection) {
    if(selection[selection.length-1]==select){
      console.log('selection: '+select);
      lastIternation=1;
    }
    console.log('select '+ select)
    layoutDataMap = getExpData1(expData,layoutData,select);
    console.log('size: '+layoutDataMap['SULT4A1'])
    var keys = Object.keys(layoutDataMap);
    len=keys.length;
      geneName = new Array(len);
      layoutDataX = new Float32Array(len);
      layoutDataY = new Float32Array(len);
      expressionData = new Float32Array(len);
      nameIndex=0,xIndex=0,yIndex=0,expIndex=0;
      for(var i=0;i<keys.length;i++){
        var row = layoutDataMap[keys[i]];
        //console.log('row: '+row);
        geneName[nameIndex++]=row[0];
        layoutDataX[xIndex++]=0.9*row[1]+0.05;
        layoutDataY[yIndex++]=1-(0.9*row[2]+0.05);
        expressionData[expIndex++]=row[3];
      }
    console.log('x: '+layoutDataX.length+' y: '+layoutDataY.length+' exp: '+expressionData.length+' gene: '+geneName.length)
    console.log('layoutx: '+layoutDataX.length)
    console.log('layouty: '+layoutDataY.length)
    console.log('expression data: '+expressionData.length)
    var outcome=await main(expressionData, layoutDataX, layoutDataY, geneName, sigma, showGene, scaleMin, scaleMax, selection.length, lastIternation, data) as unknown as Float32Array;
    await convertPromiseToFloat32Array(outcome).then((d)=>{
      data=d;
      console.log('final data: '+data[0]);
    })
    downloadDiv1.style.display='block';
    downloadDiv2.style.display='block';
    f=false;
    lastIternation=0;
}
console.log('im gere')
//drawPlot(data,layoutDataX,layoutDataY,expressionData,geneName,scaleMin,scaleMax,showGene)
})

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// checkFlag();
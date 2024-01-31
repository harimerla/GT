import { Hmac } from 'crypto';
import * as Plotly from 'plotly.js-dist';
import { DomLayoutType, Grid, GridOptions } from 'ag-grid-community';
import { do_plotly_selected } from '../dist/js/plotly_events'

var specificLayout,allSigmaLayout, tab1Layout, tab2Layout,tab1HeatMapData,tab2HeatMapdataa01,tab2HeatMapdataa02;
var heatMapdata,contourData;
export async function drawSpecificPlot(hMdata, cData, layout){
    heatMapdata=hMdata;
    contourData=cData;
    specificLayout = JSON.parse(JSON.stringify(layout));
    // specificLayout['title']={
    //     text:'<br>Plot Title',
    //     font: {
    //       size: 24,
    //       color: '#7f7f7f'
    //     },
    //     xref: 'paper',
    //   }
    Plotly.newPlot('canvas-div', heatMapdata, specificLayout,{scrollZoom: true}).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
        var img = document.getElementById('a1') as HTMLAnchorElement;
        img.href=url;
      })});
    Plotly.newPlot('canvas-contour-div', contourData, specificLayout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
        var img = document.getElementById('a2') as HTMLAnchorElement;
        img.href=url;
      })});
}

export async function drawAllSigmaPlot(hMdata, layout){
    heatMapdata=hMdata;
    allSigmaLayout = JSON.parse(JSON.stringify(layout));
    // allSigmaLayout['title']={
    //     text:'<br>',
    //     font: {
    //       size: 24,
    //       color: '#7f7f7f'
    //     },
    //     xref: 'paper',
    //   }
    Plotly.newPlot('canvas-div1', heatMapdata, allSigmaLayout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
        var img = document.getElementById('a3') as HTMLAnchorElement;
        img.href=url;
      })});
}

export async function drawTab1Plot(hMdata, layout){
    // tab1HeatMapData = JSON.parse(JSON.stringify(hMdata));
    tab1HeatMapData=hMdata;
    //console.log(tab1HeatMapData);
    //console.log(typeof(tab1HeatMapData))
    tab1HeatMapData[1]['visible']='true';
    tab1Layout=JSON.parse(JSON.stringify(layout));
    tab1Layout['dragmode']='lasso'
    Plotly.newPlot('canvas-div01', tab1HeatMapData, tab1Layout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
        var img = document.getElementById('a2') as HTMLAnchorElement;
        img.href=url;
      })});
}

export async function drawTab2Plot01(tab2HeatMapdata01,layout){
  console.log('inside drawTab2Plot01')
  tab2HeatMapdata01[0]['selected']=false
  tab2HeatMapdata01[1]['visible']=true;
  tab2HeatMapdata01[1]['opacity']=0;
  tab2Layout = JSON.parse(JSON.stringify(layout));
  tab2Layout['margin']={
    l: 50,
    r: 50,
    b: 50,
    t: 50,
    pad: 2
  }
  tab2Layout['dragmode']='lasso';
  delete tab2Layout['width'];
  delete tab2Layout['height'];
  // tab2Layout['width']='100%'
  // tab2Layout['width']='30%'
  // tab2Layout['height']='50%'
  Plotly.newPlot('canvas-tab2-01', tab2HeatMapdata01, tab2Layout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
    var img = document.getElementById('a1') as HTMLAnchorElement;
    var compareImage1 = document.getElementById("compareImage1") as HTMLImageElement; 
    img.href=url;
    compareImage1.src=url;
  })});
  
}
export async function drawTab2Plot02(tab2HeatMapdata02,layout){
  console.log('inside drawTab2Plot02')
  tab2HeatMapdata02[1]['visible']=true;
  tab2HeatMapdata02[1]['opacity']=0;
  tab2Layout = JSON.parse(JSON.stringify(layout));
  tab2Layout['margin']={
    l: 50,
    r: 50,
    b: 50,
    t: 50,
    pad: 2
  }
  tab2Layout['dragmode']='lasso';
  delete tab2Layout['width'];
  delete tab2Layout['height'];
  // tab2Layout['width']='100%'
  Plotly.newPlot('canvas-tab2-02', tab2HeatMapdata02, tab2Layout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
    var img = document.getElementById('a1') as HTMLAnchorElement;
    var compareImage2 = document.getElementById("compareImage2") as HTMLImageElement;
    var imageCompContainer = document.getElementById("img-comp-container-id") as HTMLDivElement;
    img.href=url;
    compareImage2.src=url;
    imageCompContainer.style.display="block"
  })})
  // .then(()=>{
  //   do_plotly_selected()
  // });
}
export async function updateExpDataInPlot(tab2HeatMapdata01,tab2HeatMapdata02,tab2FinalData01,tab2FinalData02,tab2WeightsArrayMap01,tab2WeightsArrayMap02,tab2Exp01,tab2Exp02,selectionLen1, selectionLen2){
  // console.log('updateExpDataInPlot'+tab2FinalData01)
  // console.log('updateExpDataInPlot'+tab2FinalData01)
  console.log(tab2Exp01)
  console.log(tab2Exp02)
  tab2HeatMapdata01[1]['args']={z1:tab2FinalData01, z2:tab2FinalData02,expGeneMap1:tab2WeightsArrayMap01,expGeneMap2:tab2WeightsArrayMap02,exp1:tab2Exp01,exp2:tab2Exp02,selectionLen1:selectionLen1,selectionLen2:selectionLen2}
  tab2HeatMapdata02[1]['args']={z1:tab2FinalData01, z2:tab2FinalData02,expGeneMap1:tab2WeightsArrayMap01,expGeneMap2:tab2WeightsArrayMap02,exp1:tab2Exp01,exp2:tab2Exp02,selectionLen1:selectionLen1,selectionLen2:selectionLen2}
  Plotly.update('canvas-tab2-01',tab2HeatMapdata01,tab2Layout,1)
  Plotly.update('canvas-tab2-02',tab2HeatMapdata02,tab2Layout,1)
}
export function changeSigma(element, data, sigmaIndexMap, sigma, resolution){
    sigma=+element.value;
    if(sigma==1)
      sigma=0.95;
    if((heatMapdata!=null || heatMapdata!=undefined) && (contourData!=null || contourData!=undefined)){
      console.log('changing sigma')
      var sliceIndeces = [resolution*resolution*sigmaIndexMap[sigma],(resolution*resolution*sigmaIndexMap[sigma]+resolution*resolution)];
      console.log('slice indeces: '+sliceIndeces)
      console.log('value: '+data.slice(sliceIndeces[0], sliceIndeces[0]+5))
      var converted2DData = convert1DArrayTo2D(data.slice(sliceIndeces[0],sliceIndeces[1]),resolution,resolution);
      var finalData = rotate90DegreesCounterClockwise(converted2DData).reverse();
      heatMapdata[0].z=finalData;
      contourData[0].z=finalData;
      Plotly.newPlot('canvas-div', heatMapdata, specificLayout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
        var img = document.getElementById('a1') as HTMLAnchorElement;
        img.href=url;
      })});
      Plotly.newPlot('canvas-contour-div', contourData, specificLayout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
        var img = document.getElementById('a2') as HTMLAnchorElement;
        img.href=url;
      })});
      Plotly.newPlot('canvas-div1', heatMapdata, allSigmaLayout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
        var img = document.getElementById('a2') as HTMLAnchorElement;
        img.href=url;
      })});
      Plotly.newPlot('canvas-div01', tab1HeatMapData, tab1Layout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
        var img = document.getElementById('a2') as HTMLAnchorElement;
        img.href=url;
      })});
    }
}

export async function purgeDivs(){
    Plotly.purge('canvas-div');
    Plotly.purge('canvas-contour-div')
    Plotly.purge('canvas-div1')
    Plotly.purge('canvas-div01')
    // Plotly.purge('canvas-tab2-01')
    // Plotly.purge('canvas-tab2-02')
}

export function convert1DArrayTo2D(float32Array, rows, columns) {
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
export function rotate90DegreesCounterClockwise(array) {
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
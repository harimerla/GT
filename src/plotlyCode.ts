import * as Plotly from 'plotly.js-dist';

var specificLayout,allSigmaLayout, tab1Layout,tab1HeatMapData;
export async function drawSpecificPlot(heatMapdata, contourData, layout){
    specificLayout = layout;
    // specificLayout['title']={
    //     text:'<br>Plot Title',
    //     font: {
    //       size: 24,
    //       color: '#7f7f7f'
    //     },
    //     xref: 'paper',
    //   }
    Plotly.newPlot('canvas-div', heatMapdata, specificLayout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
        var img = document.getElementById('a1') as HTMLAnchorElement;
        img.href=url;
      })});
    Plotly.newPlot('canvas-contour-div', contourData, specificLayout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
        var img = document.getElementById('a2') as HTMLAnchorElement;
        img.href=url;
      })});
}

export async function drawAllSigmaPlot(heatMapdata, layout){
    allSigmaLayout = layout;
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

export async function drawTab1Plot(heatMapdata, layout){
    tab1HeatMapData = heatMapdata;
    tab1HeatMapData[1]['visible']='true';
    tab1Layout=layout
    tab1Layout['dragmode']='lasso'
    Plotly.newPlot('canvas-div01', tab1HeatMapData, tab1Layout).then((gd)=>{Plotly.toImage(gd,{width:768,height:768}).then((url)=>{
        var img = document.getElementById('a2') as HTMLAnchorElement;
        img.href=url;
      })});
}

export function changeSigma(element, heatMapdata, contourData, data, sigmaIndexMap, sigma, resolution){
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
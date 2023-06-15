async function getPlotlyScript() {
    // fetch
    const plotlyRes = await fetch('https://cdn.plot.ly/plotly-latest.js')
    // get response as text
    return await plotlyRes.text() 
  } 

function getChartState (data, layout) {
    const el = document.getElementById('canvas-div')
    return {
      data: data, // current data
      layout: layout // current layout
    }
  }

  async function getHtml(anchor) {
  
    return `
        <head>
          <meta charset="utf-8" />
        </head>
        <img src=${anchor}></img>
    `
    // <div id="plotly-output"><img src=""></div>
  }

  export async function exportToHtml (anchor) {
    // Create URL
    const blob = new Blob([await getHtml(anchor)], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
  
    // Create downloader
    // const downloader = document.getElementById(id) as HTMLAnchorElement;
    const downloader = document.createElement('a')
    downloader.href = url
    downloader.download = 'export.html'
    console.log('a tag: '+url);
  
    // Trigger click
    downloader.click()

  
    // Clean up
    URL.revokeObjectURL(url)
  }
  
export function getExpData(expData, layoutData, selection){
  var expMap = new Map<string, any>();
  var fields = Object.keys(expData[0]);
  for(var i=1;i<Object.keys(expData[0]).length;i++){
    // console.log('each row: '+expData[0][fields[i]])
    expMap[expData[0][fields[i]]]=expData[selection+1][fields[i]];
  }
  // console.log(Object.keys(expMap));
  // console.log(expMap['SULT4A1']);
  // console.log('SULT4A1' in expMap);
  var map=new Map<string,any>();
  fields = Object.keys(layoutData[0]);
  for(var i=1;i<Object.keys(layoutData).length;i++){
    //console.log(expMap.has('SULT4A1'));
    if((layoutData[i][fields[0]]) in expMap){
        var row=layoutData[i];
        //console.log(row[fields[0]])
        map[row[fields[0]]]=[row[fields[0]],+row[fields[1]],+row[fields[2]],expMap[row[fields[0]]]];
      }
    }
    return map;
}

export function getData(map, index){

}
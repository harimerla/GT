import exp from "constants";
import { stringify } from "querystring";
const csvtojson=require("csvtojson");

interface myObject {id:number;sampleId: string; overal_survival__days_:number; overal_survival_status:number; gbm_subtype:string; age_at_gbm_diagnosis:number }
var output=[];
var layoutOutput=[];
var expOutput=[];
var genes=[];
var geneRelationMapName= new Map<string, any>();
var geneRelationMapScore= new Map<string, any>();
export async function loadAllExpData(){

    const url = 'https://discovery.informatics.uab.edu/apex/gtkb/gene_exp/all?offset='
    // const url = 'https://discovery.informatics.uab.edu/apex/gtkb/gene_exp/GBM?offset='
    // const url = 'https://discovery.informatics.uab.edu/apex/gtkb/gene_exp/cleaned_gbm?offset='
    var i=0,limit=10000;
    while(true){
        var updatedURL=url+(i++*limit).toString();
        var jsonData;
        const plotData = async ()=>{
            const response = await fetch(updatedURL,{method:'GET'});
            jsonData = await response.json();
            // console.log('exp data: '+jsonData)
        }
        await plotData().then(()=>{
            console.log(jsonData['items'])
            setAllExpData(jsonData['items'])
        })
        if(jsonData==undefined || jsonData['count']==0){
            // console.log('reason :'+jsonData);
            break;
        }
    }
    //setGenes();
    return [];
}

export async function loadExpData(sampleIDS: string[]){
    console.log('rest.ts || loadExpData || Start');
    const startTime = new Date().getTime();
    const urls = [];
    const urll = 'https://discovery.informatics.uab.edu/apex/gtkb/gene_exp/cleaned_gbm/';
    for(var sample of sampleIDS){
        urls.push(urll+sample)
        // urls.push(urll+sample+'?offset=10000')
        //urls.push(urll+sample+'?offset=20000')
    }
    let requests = urls.map(url =>    fetch(url, {
        method: 'GET',
    }).then(response => response.json()).then(response => {expOutput=expOutput.concat(response['items']);console.log(expOutput.length)})
    );
    await Promise.all(requests)
    .then(responses => {
        // responses is an array of responses        // responses[0] is the response for the first request        // responses[1] is the response for the second request, etc.        
        // console.log(responses);
    })
    .catch(error => {
        console.error(error);
    });
    const endTime = new Date().getTime();
    console.log('load exp time taken: '+(endTime-startTime));
    console.log('rest.ts || loadExpData || End');
}
export async function loadExpData1(sampleIDS: string[]){
    const startTime = new Date().getTime();
    expOutput=[];
    // const url = 'https://discovery.informatics.uab.edu/apex/gtkb/gene_exp/all?offset='
    // const url = 'https://discovery.informatics.uab.edu/apex/gtkb/gene_exp/GBM?offset='
    const url = 'https://discovery.informatics.uab.edu/apex/gtkb/gene_exp/'
    var i=0,limit=10000;
    for(var sample of sampleIDS){
        while(true){
        var updatedURL = url+sample+"?offset="+(i++*limit).toString();
        var jsonData;
        const plotData = async ()=>{
            const response = await fetch(updatedURL,{method:'GET'});
            jsonData = await response.json();
            // console.log('exp data: '+jsonData)
        }
        await plotData().then(()=>{
            // console.log(jsonData['items'])
            console.log('exp json data loaded')
            setAllExpData(jsonData['items'])
        })
        if(jsonData==undefined || jsonData['count']==0){
            // console.log('reason :'+jsonData);
            break;
        }
    }
    }
    // setGenes();
    const endTime = new Date().getTime();
    console.log(endTime-startTime);
    return [];
}

export async function loadLayoutData(){

    const url = 'https://discovery.informatics.uab.edu/apex/gtkb/layout/all?offset='
    var i=0,limit=100;
    while(true){
        var updatedURL=url+(i++*limit).toString();
        var jsonData;
        const plotData = async ()=>{
            const response = await fetch(updatedURL,{method:'GET'});
            jsonData = await response.json();
        }
        await plotData().then(()=>{
            setLayoutData(jsonData['items'])
            //console.log(jsonData['items'])
        })
        if(jsonData==undefined || jsonData['count']==0){
            // console.log('reason :'+jsonData);
            break;
        }
    }
    setGenes();
    return [];
}

export async function loadPlotData(){

    var url = 'https://discovery.informatics.uab.edu/apex/gtkb/sample/all?offset='
    var i=0,limit=100;
    while(true){
        var updatedURL=url+(i++*limit).toString();
        var jsonData;
        const plotData = async ()=>{
            const response = await fetch(updatedURL,{method:'GET'});
            jsonData = await response.json();
        }
        await plotData().then(()=>{
            setPlotData(jsonData['items'])
            // console.log((i++*limit).toString())
            // console.log(jsonData['items'])
        })
        if(jsonData==undefined || jsonData['count']==0){
            // console.log('reason :'+jsonData);
            break;
        }
    }
    return [];
}

export async function loadGeneRelation(){
  console.log('rest.ts || loadGeneRelation || start')
  var path = './csv/BEERE_PPI_GBM.csv';
  var data, fileContent;
  var reader = new FileReader();
  const response: Response = await fetch(path);
  await response.text().then(d=>{
    // console.log('response '+d);
    fileContent=d;
  })
  await csvtojson({noheader:true}).fromString(fileContent).then((jsonObjectArray) => {
    data = jsonObjectArray;
  })
  .catch((error) => {
    console.error(error);
  });
  var rowData = data;
    //   console.log(data.length);
    //   console.log(data[0].size);
    //   console.log(data[0]['field1'])
  for(var i=1;i<data.length;i++){
    geneRelationMapName[data[i]['field1'].toUpperCase()]=[];
    geneRelationMapScore[data[i]['field1'].toUpperCase()]=[];
  }
  for(var i=1;i<data.length;i++){
    geneRelationMapName[data[i]['field1'].toUpperCase()].push(data[i]['field1'].toUpperCase());
    geneRelationMapName[data[i]['field1'].toUpperCase()].push(data[i]['field2'].toUpperCase());
    geneRelationMapScore[data[i]['field1'].toUpperCase()].push([data[i]['field2'].toUpperCase(),data[i]['field3']]);
  }
  console.log('rest.ts || loadGeneRelation || end')
    // console.log(geneRelationMapName);
}


// loadGeneRelation()
// loadLayoutData()
// loadPlotData()
// loadExpData()



function setPlotData(jsonData){
    output=output.concat(jsonData);
}
function setLayoutData(jsonData){
    layoutOutput=layoutOutput.concat(jsonData);
    // console.log('layout output length: '+layoutOutput.length);
}
function setAllExpData(jsonData){
    expOutput=expOutput.concat(jsonData);
    // console.log('exp output length: '+expOutput.length);
}
function setGenes(){
    console.log('rest.ts || setGenes || start')
    // console.log('layout output: '+layoutOutput)
    if(layoutOutput==undefined){
        genes=[];
        return;
    }
    for(var i=0;i<layoutOutput.length;i++){
        genes.push(layoutOutput[i].gene.toUpperCase());
    }
    console.log('rest.ts || setGenes || end')
}



export function getPlotData(){
    return output;
}
export function getLayoutData(){
    return layoutOutput;
}
export function getExpData(){
    return expOutput;
}
export function getGenes(){
    // console.log('gene names: '+genes)
    return genes;
}
export function getXandY(){
    // console.log('layout in rest.ts '+layoutOutput);
    var layoutMap = new Map<string, any>();
    for(var i=0;i<layoutOutput.length;i++){
        layoutMap[layoutOutput[i].gene.toUpperCase()]=[layoutOutput[i].gene.toUpperCase(), layoutOutput[i].x, layoutOutput[i].y]
    }
    console.log('getXandY completed');
    return layoutMap;
}
export function getAllExp(){
    var expMap = new Map<string, any>();
    for(var i=0;i<expOutput.length;i++){
        expMap[expOutput[i].sampleid]=expOutput[i];
    }
    return expMap;
}
export function getExp(){
    var expMap = new Map<string, any>();
    // console.log(expOutput);
    console.log('start getExp');
    for(var i=0;i<expOutput.length;i++){
        expMap[expOutput[i].sampleid]={'sampleid': expOutput[i].sampleid};
    }
    for(var i=0;i<expOutput.length;i++){
        var map = new Map();
        // map[expOutput[i]['gene_symbol']]= expOutput[i]['value'];
        // expMap[expOutput[i].sampleid]=Object.assign({},expMap[expOutput[i].sampleid],map);
        expMap[expOutput[i].sampleid][expOutput[i]['gene_symbol'].toUpperCase()]=expOutput[i]['value'];
    }
    console.log('getExp completed');
    return expMap;
}
export function getGeneReationMapName(){
    return geneRelationMapName;
}

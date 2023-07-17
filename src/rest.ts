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
export async function loadExpData(){

    const url = 'https://discovery.informatics.uab.edu/apex/gtkb/gene_exp/all?offset='
    var i=0,limit=100;
    while(true){
        var updatedURL=url+(i++*limit).toString();
        var jsonData;
        const plotData = async ()=>{
            const response = await fetch(updatedURL,{method:'GET'});
            jsonData = await response.json();
            // console.log('exp data: '+jsonData)
        }
        await plotData().then(()=>{
            setExpData(jsonData['items'])
        })
        if(jsonData==undefined || jsonData['count']==0){
            // console.log('reason :'+jsonData);
            break;
        }
    }
    setGenes();
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
    geneRelationMapName[data[i]['field1'].toLowerCase()]=[];
    geneRelationMapScore[data[i]['field1'].toLowerCase()]=[];
  }
  for(var i=1;i<data.length;i++){
    geneRelationMapName[data[i]['field1'].toLowerCase()].push(data[i]['field1'].toLowerCase());
    geneRelationMapName[data[i]['field1'].toLowerCase()].push(data[i]['field2'].toLowerCase());
    geneRelationMapScore[data[i]['field1'].toLowerCase()].push([data[i]['field2'].toLowerCase(),data[i]['field3']]);
  }
    console.log(geneRelationMapName);
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
function setExpData(jsonData){
    expOutput=expOutput.concat(jsonData);
    // console.log('exp output length: '+expOutput.length);
}
function setGenes(){
    // console.log('exp output: '+expOutput)
    var keys = Object.keys(expOutput[0]);
    genes = keys.slice(2);
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
    var layoutMap = new Map<string, any>();
    for(var i=0;i<layoutOutput.length;i++){
        layoutMap[layoutOutput[i].gene.toLowerCase()]=[layoutOutput[i].gene.toLowerCase(), layoutOutput[i].x, layoutOutput[i].y]
    }
    return layoutMap;
}
export function getExp(){
    var expMap = new Map<string, any>();
    for(var i=0;i<expOutput.length;i++){
        expMap[expOutput[i].sampleid]=expOutput[i];
    }
    return expMap;
}
export function getGeneReationMapName(){
    return geneRelationMapName;
}


var resultSelection=[]
var pathwayTableSelection = []
var graphDiv = document.getElementById('canvas-div01');
function calculateStandardDeviation(data) {
    const n = data.length;
    const mean = data.reduce((sum, value) => sum + value, 0) / n;
  
    const squaredDifferences = data.map(value => Math.pow(value - mean, 2));
    const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / (n - 1);
  
    const standardDeviation = Math.sqrt(variance);
  
    return standardDeviation*0.05;
  }

  
  function normalize(arr){
    var min = 1000, max=-1000;
    var temp = new Float32Array(arr.length)
    for(var i=0;i<arr.length;i++){
      if(min>arr[i])
        min=arr[i];
      if(max<arr[i])
        max=arr[i];
    }
    for(var i=0;i<arr.length;i++){
      //temp[i]=(arr[i]-min)/(max-min);
      temp[i]=arr[i];
    }
    return temp;
  }
  
graphDiv.addEventListener('mouseenter', ()=>{
// if (graphDiv.classList.contains('js-plotly-plot') || graphDiv.id.startsWith('myPlotlyGraph_')) {
    graphDiv.on('plotly_selected',function(eventData){
    console.log(eventData);
    // console.log(eventData.currentTarget.data[1].selectedpoints)
    // console.log(eventData.currentTarget.data[1].selectedpoints[0].x)
    var pt=[]
    var ptx=[], pty=[], pttext=[], ptout=[], ptexp=[], ptbase=[], ptcolorexp=[], ptcolorGT=[], ptoutText=[], ptexpText=[]
    eventData.points.forEach(function(pt) {
        ptx.push(pt.x);
        pty.push(pt.y);
        var currOut = pt.data.args.z[~~(pt.y)][~~(pt.x)]
        var currExp = pt.data.args.exp[pt.text]
        ptout.push(currOut)
        ptoutText.push(Number(currOut).toFixed(2))
        pttext.push(pt.text);
        ptexp.push(currExp)
        ptexpText.push(Number(currExp).toFixed(2))
        // ptbase.push(currOut<0?currOut:0)
        ptcolorexp.push(currExp<0?'blue':'red')
        ptcolorGT.push(currOut<0?'blue':'red')
        console.log(pt.x);
        console.log(pt.y);
        console.log(pt.text);
    });
    var barTraceOuput = [{
        x: pttext,
        y: ptout,
        type: 'bar',
        base: 0,
        text: ptoutText.map(String),
        textposition: 'auto',
        hoverinfo: 'none',
        width: 0.5,
        // text: pttext,
        marker: {color: ptcolorGT}
    }];
    var barTraceExp = [{
        x: pttext,
        y: ptexp,
        type: 'bar',
        base: 0,
        text: ptexpText.map(String),
        textposition: 'auto',
        hoverinfo: 'none',
        width: 0.5,
        // text: pttext,
        marker: {color: ptcolorexp}
    }];
    var plotLayout = {
        width:768,
        height:768,
        showlegend: true,
        legend: {
            x: 0.8,
            // xanchor: 'right',
            y: 1.05,
            bgcolor: 'E2E2E2'
        },
        font:{
            color:"black",
            size:12,
        }
        }
    var barsLayout1 = JSON.parse(JSON.stringify(plotLayout));
    barsLayout1['title']={
        text:'<br>Gene vs Exp',
        font: {
        size: 24,
        color: '#7f7f7f'
        },
        xref: 'paper',
    }
    var barsLayout2 = JSON.parse(JSON.stringify(plotLayout));
    barsLayout2['title']={
        text:'<br>Gene vs GT',
            font: {
            size: 24,
            color: '#7f7f7f'
            },
            xref: 'paper',
    }
    barsLayout1['showlegend']=false
    barsLayout2['showlegend']=false
    
    Plotly.newPlot('bar-chart-exp',barTraceExp, barsLayout1);
    Plotly.newPlot('bar-chart-output',barTraceOuput, barsLayout2);
    })
})
var tab2div01 = document.getElementById('canvas-tab2-01');
var tab2div02 = document.getElementById('canvas-tab2-02');
var barTraceOuput,plotLayout,barTraceExp;
tab2div01.addEventListener('mouseenter',()=>{
    var flag='inside'
    tab2div01.addEventListener('mouseout',()=>{
        flag='left'
        return
    })
    tab2div01.on('plotly_legendclick',async function(eventData){
        console.log('plotly click')
        console.log(eventData)
        var op=0
        if(eventData.data[1]['opacity']==0)
            op=1
        else
            op=0
        console.log(eventData.data[1]['opacity'])
        console.log(op)
        await Plotly.restyle(tab2div01,{opacity:op},[1]);
    })
    tab2div01.on('plotly_selected',async function(eventData){
        console.log('insde tab2div01 plotly selected')
        console.log(eventData)
        
        var selectedPointsIndices=[];
        var ptGene=[], ptx=[], pty=[], pt01Out=[], pt02Out=[],pt01OutText=[],pt02OutText=[]
        var ptSTD1=[],ptSTD2=[],ptExp01=[], ptExp02=[],ptExp01Text=[],ptExp02Text=[],ptPvalue=[]
        var tab2Table = document.getElementById('tab2-table');
        var tab2BarPlot = document.getElementById('tab2-barplot');
        var tab2BarPlot02 = document.getElementById('tab2-barplot02')
        eventData.points.forEach(function(pt) {
            ptGene.push(pt.text);
            ptx.push(pt.x);
            pty.push(pt.y);
            var currPt01out = pt.data.args.z1[~~(pt.y)][~~(pt.x)]
            var currPt02out = pt.data.args.z2[~~(pt.y)][~~(pt.x)]
            var expGeneMap1 = pt.data.args.expGeneMap1;
            var expGeneMap2 = pt.data.args.expGeneMap2;
            var currExp1 = pt.data.args.exp1[pt.text]/pt.data.args.selectionLen1;
            var currExp2 = pt.data.args.exp2[pt.text]/pt.data.args.selectionLen2;
            ptExp01.push(currExp1)
            ptExp02.push(currExp2)
            ptExp01Text.push(Number(currExp1).toFixed(2))
            ptExp02Text.push(Number(currExp2).toFixed(2))
            ptSTD1.push(calculateStandardDeviation(expGeneMap1[pt.text]))
            ptSTD2.push(calculateStandardDeviation(expGeneMap2[pt.text]))
            ptPvalue.push(calculatePValue(expGeneMap1[pt.text], expGeneMap2[pt.text]))
            pt01Out.push(currPt01out);
            pt02Out.push(currPt02out);
            pt01OutText.push(Number(currPt01out).toFixed(2))
            pt02OutText.push(Number(currPt02out).toFixed(2))
            selectedPointsIndices.push(pt.pointIndex)
        });
        
        // ptSTD1=normalize(ptSTD1)
        // ptSTD2=normalize(ptSTD2)
        console.log(ptExp01)
        console.log(ptExp02)
        barTraceOuput = [{
                x: ptGene,
                y: pt01Out,
                type: 'bar',
                marker:{color:'#131313'},
                error_y:{
                    type:'data',
                    array: ptSTD1,
                    visible:true
                },
                name: 'GeneTerrain 1',
                base: 0,
                text: pt01OutText,
                textposition: 'auto',
                hoverinfo: 'none',
                width: 0.5,
                // text: pttext,
            },
            {
                x: ptGene,
                y: pt02Out,
                type: 'bar',
                marker:{color:'gray'},
                error_y:{
                    type:'data',
                    array: ptSTD2,
                    visible:true
                },
                name: 'GeneTerrain 2',
                base: 0,
                text: pt02OutText,
                textposition: 'auto',
                hoverinfo: 'none',
                width: 0.5,
                // text: pttext,
            }];
        barTraceExp = [{
                x: ptGene,
                y: ptExp01,
                error_y:{
                    type:'data',
                    array: ptSTD1,
                    visible:true
                },
                type: 'bar',
                marker:{color:'#131313'},
                name: 'GeneTerrain 1',
                base: 0,
                text: ptExp01Text,
                textposition: 'auto',
                hoverinfo: 'none',
                width: 0.5,
                // text: pttext,
            },
            {
                x: ptGene,
                y: ptExp02,
                type: 'bar',
                error_y:{
                    type:'data',
                    array: ptSTD2,
                    visible:true
                },
                name: 'GeneTerrain 2',
                base: 0,
                marker:{color:'gray'},
                text: ptExp02Text,
                textposition: 'auto',
                hoverinfo: 'none',
                width: 0.5,
                // text: pttext,
            }];
        plotLayout = {
                barmode: 'group',
                width:768,
                height:768,
                showlegend: true,
                legend: {
                    x: 0.8,
                    // xanchor: 'right',
                    y: 1.05,
                    bgcolor: 'E2E2E2'
                },
                font:{
                    color:"black",
                    size:12,
                }
            }
        var layout1 = JSON.parse(JSON.stringify(plotLayout));
        layout1['title']={
            text:'<br>Gene vs GT',
            font: {
            size: 24,
            color: '#7f7f7f'
            },
            xref: 'paper',
        }
        var layout2 = JSON.parse(JSON.stringify(plotLayout));
        layout2['title']={
            text:'<br>Gene vs Exp',
            font: {
            size: 24,
            color: '#7f7f7f'
            },
            xref: 'paper',
        }
        layout2['updatemenus']= [{
            x: 0,
            y: 1.1,
            yanchor: 'top',
            buttons: [{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', '#131313',[0]],
                label: 'Black'
            },{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'red',[0]],
                label: 'Red'
            }, {
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'blue',[0]],
                label: 'Blue'
            }, {
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'green',[0]],
                label: 'Green'
            },{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'pink',[0]],
                label: 'Pink'
            },{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'yellow',[0]],
                label: 'Yellow'
            }]
        },{
            x: 0.15,
            y: 1.1,
            yanchor: 'top',
            buttons: [{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'gray',[1]],
                label: 'Gray'
            },{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'red',[1]],
                label: 'Red'
            }, {
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'blue',[1]],
                label: 'Blue'
            }, {
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'green',[1]],
                label: 'Green'
            },{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'pink',[1]],
                label: 'Pink'
            },{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'yellow',[1]],
                label: 'Yellow'
            }]
        }]
        layout1['updatemenus']= [{
            x: 0,
            y: 1.1,
            yanchor: 'top',
            buttons: [{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', '#131313',[0]],
                label: 'Black'
            },{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'red',[0]],
                label: 'Red'
            }, {
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'blue',[0]],
                label: 'Blue'
            }, {
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'green',[0]],
                label: 'Green'
            }]
        },{
            x: 0.15,
            y: 1.1,
            yanchor: 'top',
            buttons: [{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'gray',[1]],
                label: 'Gray'
            },{
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'red',[1]],
                label: 'Red'
            }, {
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'blue',[1]],
                label: 'Blue'
            }, {
                name: 'GeneTerrain 1',
                method: 'restyle',
                args: ['marker.color', 'green',[1]],
                label: 'Green'
            }]
        }]
        await Plotly.newPlot(tab2BarPlot02, barTraceExp, layout2);
        await Plotly.newPlot(tab2BarPlot, barTraceOuput, layout1);
        await Plotly.restyle(tab2div02, {'selectedpoints': [selectedPointsIndices], opacity:1},[1]);
        await Plotly.restyle(tab2div01, {'selectedpoints': [selectedPointsIndices], opacity:1},[1]);
        // saveDataToProperties(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText);
        agGridd(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText,ptPvalue);
        //tempGrid();
        var generatePathway = document.getElementById('Generate_Pathway');
        generatePathway.style.display="block"
        generatePathway.addEventListener('click',()=>{
            pathway(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText)
        })
    })
})
async function saveDataToProperties(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText){
fs.writeFile('sdf.txt','sdfsf')
}

async function agGridd(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText,ptPvalue){
    console.log(ptPvalue)
    var pathwayTable=document.querySelector("#gene-pathway-table")
    pathwayTable.innerHTML="";
    const columnDefs = [
        { field: 'GeneName',checkboxSelection: true,filter: 'agSetColumnFilter'},
        { field: 'Group1_Score', filter: 'agNumberColumnFilter'},
        { field: 'Group2_Score', filter:'agNumberColumnFilter'},
        { field: 'P_value', filter:'agNumberColumnFilter'},
      ];
    const rowData = []
    for(var i=0;i<ptGene.length;i++){
        rowData.push({GeneName:ptGene[i],Group1_Score:pt01OutText[i],Group2_Score:pt02OutText[i],P_value:ptPvalue[i]})
    }
    const gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        rowSelection: 'multiple',
        autoGroupColumnDef: {
          minWidth: 200,
          filter: 'agGroupColumnFilter',
        },
        animateRows: true,
        // sideBar: {id:'filters',hiddenByDefault:true},
        sideBar: {
          toolPanels: [
              {
                  id: 'columns',
                  labelDefault: 'Columns',
                  labelKey: 'columns',
                  iconKey: 'columns',
                  toolPanel: 'agColumnsToolPanel',
              },
              {
                  id: 'filters',
                  labelDefault: 'Filters',
                  labelKey: 'filters',
                  iconKey: 'filter',
                  toolPanel: 'agFiltersToolPanel',
              }
          ],
          defaultToolPanel: 'columns',
          hiddenByDefault:true
        },
        groupSelectsChildren: true,
        suppressHorizontalScroll: true,
        defaultColDef: {
          enableRowGroup: true,
          enablePivot: true,
          enableValue: true,
          width: 100,
          sortable: true,
          resizable: true,
          filter: true,
          flex: 1,
          minWidth: 100,
          editable: true,
        },
        pagination: true,
        paginationPageSize: 5,
        // paginationAutoPageSize:true,
        domLayout: 'autoHeight',
        //suppressHorizontalScroll: true
        // getRowId: (params) => params.data.id,
        columnTypes: {
            nonEditableColumn: { editable: false },
        },
      };
    new agGrid.Grid(pathwayTable, gridOptions);
    pathwayTable.addEventListener('click',()=>{
        console.log('inside grid div click event')
        const selectedRows = gridOptions.api.getSelectedRows();
        console.log(selectedRows)
        pathwayTableSelection=[]
        for(var row of selectedRows){
            console.log(row)
            pathwayTableSelection.push(row['GeneName'])
        }
        console.log(pathwayTableSelection)
    })
}
function convertToPowerOf10(decimalValue) {
    // Handle special cases
    if (decimalValue === 0) {
      return "0 * 10^0";
    }
  
    // Calculate the exponent
    const exponent = Math.floor(Math.log10(Math.abs(decimalValue)));
  
    // Calculate the significand
    const significand = Number(decimalValue / Math.pow(10, exponent)).toFixed(2);
  
    return `${significand} x 10^${exponent}`;
  }
var colorIndex = 0
function generateRandomColorName() {
    const adjectives = ['red', 'blue', 'green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Gray', 'Cyan'];
    // // const adjectives = ['red', 'blue', 'green','yellow','purple','orange','pink']
    // var res=[];
    // var map = {};
    // var k=0;
    // for(var i=0;i<arr.length;i++){
    //     // res.push(adjectives[Math.floor(Math.random() * adjectives.length)])
    //     if(map[arr[i]]==undefined){
    //         res.push(adjectives[k%adjectives.length])
    //         map[arr[i]]=adjectives[k%adjectives.length]
    //         k++;
    //     }
    //     else
    //         res.push(map[arr[i]])
    //     // res.push('Red')
    // }
    // console.log(arr.length+" "+res.length);
    // console.log(res);
    return adjectives[colorIndex++%adjectives.length]
    // return res;
  }

// await pathway([],[],[],[],[])   
async function pathway(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText){
    // var pValue = await calculatePValue(pt01Out, pt02Out);
    var pValue = 0;
    document.getElementById("");
    var geneSize1 = document.getElementById("gene-size1");
    var geneSize2 = document.getElementById("gene-size2");
    var similarityScore = document.getElementById("");
    var overlapGenes = document.getElementById("overlap-genes");
    var cohesion = document.getElementById("cohesion")
    var pValueFilter = document.getElementById("p-value");
    var fDR = document.getElementById("FDR");
    var dataSource = document.getElementById("data-source");
    var params = {
        geneSize1:geneSize1, geneSize2:geneSize2,
        similarityScore: similarityScore, overlapGenes:overlapGenes,
        cohesion:cohesion, pValueFilter:pValueFilter,
        fDR:fDR, dataSource:dataSource,
    }
    // var params = {
    //     "genes": "MYC",
    //     "source": "WikiPathway_2021_HUMAN%20Reactome_2021%20KEGG_2021%20Spike%20BioCarta%20NCI-Nature Curated",
    //     "type": "All",
    //     "sim": 0,
    //     "olap": 1,
    //     "organism": "Homo sapiens",
    //     "cohesion": "0",
    //     "pvalue": 0.05,
    //     "FDR": 0.05,
    //     "ge": 1,
    //     "le": 2000
    // }
    // var url = 'http://discovery.informatics.uab.edu/PAGER/index.php/geneset/pagerapi';
    // var headers = {'Access-Control-Allow-Origin':'http://127.0.0.1:5500'}
    // var headers = {}

    //pager api
    //     var myHeaders = new Headers();
    //     myHeaders.append("Cookie", "PHPSESSID=7bp6d6h1gbsfp0aliqko136114");
    //     var formdata = new FormData();
    //     formdata.append("genes", "ACTB%20ACTG1");
    //     formdata.append("type", "ALL");
    //     formdata.append("ge", "2");
    //     formdata.append("le", "5000");
    //     formdata.append("sim", "0");
    //     formdata.append("olap", "1");
    //     formdata.append("organism", "All");
    //     formdata.append("source", "KEGG_2021%20WikiPathway_2021_HUMAN");
    //     formdata.append("cohesion", "0");
    //     formdata.append("pvalue", ".05");
    //     formdata.append("FDR", "1");

    //     var requestOptions = {
    //     method: 'POST',
    //     headers: myHeaders,
    //     body: formdata,
    //     redirect: 'follow'
    //     };

    // var response = await fetch("http://discovery.informatics.uab.edu/PAGER/index.php/geneset/pagerapi", requestOptions)
    // G-profile api
    var url = 'https://biit.cs.ut.ee/gprofiler/api/gost/profile/'
    var body = {
        organism:"hsapiens",
        // query:pathwayTableSelection
        query:["ENSG00000078900",
            "ENSG00000117614",
            "ENSG00000117748",
            "ENSG00000092853",
            "ENSG00000143155",
            "ENSG00000162889",
            "ENSG00000143493",
            "ENSG00000143476",
            "ENSG00000095002",
            "ENSG00000115966",
            "ENSG00000204120",
            "ENSG00000154767",
            "ENSG00000164053",
            "ENSG00000114670",
            "ENSG00000182923",
            "ENSG00000175054",
            "ENSG00000073282",
            "ENSG00000134852",
            "ENSG00000137601",
            "ENSG00000113456",
            "ENSG00000151876",
            "ENSG00000152942",
            "ENSG00000188996",
            "ENSG00000124766",
            "ENSG00000198563",
            "ENSG00000112062",
            "ENSG00000124762",
            "ENSG00000096401",
            "ENSG00000136273",
            "ENSG00000135249",
            "ENSG00000106144",
            "ENSG00000158941",
            "ENSG00000253729",
            "ENSG00000104320",
            "ENSG00000081377",
            "ENSG00000095787",
            "ENSG00000170312",
            "ENSG00000177595",
            "ENSG00000110107",
            "ENSG00000172613",
            "ENSG00000110092",
            "ENSG00000149311",
            "ENSG00000048028",
            "ENSG00000172273",
            "ENSG00000149554",
            "ENSG00000171792",
            "ENSG00000060982",
            "ENSG00000135679",
            "ENSG00000169372",
            "ENSG00000008405",
            "ENSG00000151164",
            "ENSG00000179295",
            "ENSG00000135090",
            "ENSG00000136104",
            "ENSG00000139842",
            "ENSG00000053254",
            "ENSG00000185088",
            "ENSG00000075131",
            "ENSG00000169018",
            "ENSG00000140464",
            "ENSG00000140525",
            "ENSG00000197299",
            "ENSG00000166851",
            "ENSG00000149930",
            "ENSG00000168411",
            "ENSG00000103264",
            "ENSG00000141510",
            "ENSG00000160551",
            "ENSG00000012048",
            "ENSG00000108465",
            "ENSG00000079134",
            "ENSG00000101773",
            "ENSG00000185988",
            "ENSG00000105325",
            "ENSG00000105393",
            "ENSG00000160469",
            "ENSG00000101412",
            "ENSG00000183765",
            "ENSG00000100296",
            "ENSG00000184481",
            "ENSG00000185515"]
    }
    var response = await fetch(url, {body:JSON.stringify(body), method:'POST'})
    var responseJson = await response.json()
    console.log(responseJson)
    var geneCountMap = new Map();
    var genePValueMap = new Map();
    var s=[],p=[]
    const rowData = []
    var k=1;
    var lineColor = []
    var sources = []
    console.log(Object.keys(responseJson['result'][0]))
    for(var i=0;i<responseJson['result'].length;i++){
        var obj = responseJson['result'][i];
        var source = responseJson['result'][i]['source'];
        var pvaluee = -1*Math.log10(responseJson['result'][i]['p_value'])
        rowData.push({Id:k++,Source:obj['source'],Term_Id:obj['native'],Term_Name:obj['name'],P_value:convertToPowerOf10(obj['p_value']),hiddenPvalue:pvaluee})
        s.push(source)
        lineColor.push('rgba(255,255,255,0)')
        p.push(pvaluee)
        if(genePValueMap[source]!=undefined){
            genePValueMap[source][0].push(source)
            genePValueMap[source][1].push(pvaluee)
            genePValueMap[source][2]++;
        }
        else{
            genePValueMap[source]=[[source],[pvaluee],1]
            sources.push(source);
        }
    }
    var apiOutputLen = s.length
    console.log(genePValueMap)
    var traces = []
    for(var key in genePValueMap){
        var width = 0.2+genePValueMap[key][2]/apiOutputLen;
        var randomColor = generateRandomColorName();
        var trace = {
            // x: genePValueMap[key][0],
            y: genePValueMap[key][1],
            name: genePValueMap[key][0][0]+"("+genePValueMap[key][2]+")",
            mode: 'markers+bar',
            // marker:{size:20},
            // orientation:'h',
            type: 'box',
            boxpoints: 'all',
            jitter: 1,
            pointpos:0,
            width:width,
            line: {color: 'rgba(255,255,255,0)', opacity:0.8},
            // line: {color: 'rgba(255,255,255,0)'},
            // marker: {color: markerColor},
            // box:{color:'white'},
            marker: {color: randomColor,
            size:10},
            // colorscale: 'Jet',
            hoverinfo:true,
            // visible: 'true',
            // name: 'Gene_Name',
        }
        var scatter = {
            x: [genePValueMap[key][0][0]+"("+genePValueMap[key][2]+")"],
            y: [0.2],
            width: [width],
            type:'bar',
            marker:{color:[randomColor]},
        }
        traces.push(trace)
        traces.push(scatter)
    }
    console.log(s)
    console.log(p)
    var layout = {
        // width:568,
        // height:568,
        showlegend: false,
        yaxis:{
            title:{text:'-log(Pvalue)'},
            showgrid:false,
            autotick: true,
            showticklabels: true,
            zeroline: true,
        },
        xaxis:{
            tickangle:45,
            autotick: true,
            zeroline: true,
            showticklabels: true,
        },
        boxmode: 'group',
        bargap: 0.4,
        margin: {
          l: 70,
          r: 70,
          b: 70,
          t: 70,
          pad: 4
        },
        legend: {
          x: 0.8,
          // xanchor: 'right',
          y: 1.05,
          bgcolor: 'E2E2E2'
        },
        font:{
          color:"black",
          size:12,
        },
      }
    var heatmap = [{
        x: s,
        y: p,
        name: s,
        // mode: 'markers+bar',
        // marker:{size:20},
        orientation:'h',
        type: 'box',
        boxpoints: 'all',
        jitter: 9,
        pointpos:0,
        line: {color: 'rgba(255,255,255,0'},
        // line: {color: 'rgba(255,255,255,0)'},
        // marker: {color: markerColor},
        // box:{color:'white'},
        // marker: {color: 'red'},
        // colorscale: 'Jet',
        hoverinfo:true,
        visible: 'true',
        name: 'Gene_Name',
    }]
    Plotly.newPlot('pathway-scatter',traces,layout)
    const colData = [{ field: 'Id',filter: 'agSetColumnFilter',checkboxSelection: true},
    { field: 'Source', filter: 'agNumberColumnFilter'},
    { field: 'Term_Id', filter:'agNumberColumnFilter'},
    { field: 'Term_Name', filter:'agNumberColumnFilter'},
    { field: 'P_value', filter:'agNumberColumnFilter'},
    { field: 'hiddenPvalue', filter:'agNumberColumnFilter', hide:true}]
    const gridOptions = {
        columnDefs: colData,
        rowData: rowData,
        rowSelection: 'multiple',
        autoGroupColumnDef: {
          minWidth: 200,
          filter: 'agGroupColumnFilter',
        },
        animateRows: true,
        // sideBar: {id:'filters',hiddenByDefault:true},
        sideBar: {
          toolPanels: [
              {
                  id: 'columns',
                  labelDefault: 'Columns',
                  labelKey: 'columns',
                  iconKey: 'columns',
                  toolPanel: 'agColumnsToolPanel',
              },
              {
                  id: 'filters',
                  labelDefault: 'Filters',
                  labelKey: 'filters',
                  iconKey: 'filter',
                  toolPanel: 'agFiltersToolPanel',
              }
          ],
          defaultToolPanel: 'columns',
          hiddenByDefault:true
        },
        groupSelectsChildren: true,
        suppressHorizontalScroll: true,
        defaultColDef: {
          enableRowGroup: true,
          enablePivot: true,
          enableValue: true,
          width: 100,
          sortable: true,
          resizable: true,
          filter: true,
          flex: 1,
          minWidth: 100,
          editable: true,
        },
        pagination: true,
        paginationPageSize: 5,
        // paginationAutoPageSize:true,
        domLayout: 'autoHeight',
        //suppressHorizontalScroll: true
        // getRowId: (params) => params.data.id,
        columnTypes: {
            nonEditableColumn: { editable: false },
        },
      };
    var table = document.querySelector('#pathwayResultInfo')
    table.innerHTML='';
    new agGrid.Grid(table, gridOptions);
    table.addEventListener('click',()=>{
        console.log('inside grid div click event')
        const selectedRows = gridOptions.api.getSelectedRows();
        console.log(selectedRows)
        resultSelection=[]
        var selectedSource = [], selectedPvalue = []
        for(var row of selectedRows){
            resultSelection.push(row)
            selectedSource.push(row['Source'])
            selectedPvalue.push(row['hiddenPvalue'])
        }
        console.log(selectedSource)
        console.log(selectedPvalue)
        console.log(resultSelection)
        var tracee = [{
            y:selectedSource,
            x:selectedPvalue,
            type:'bar',
            orientation:'h',
            width: 0.1,
        }]
        var layout = {
            barmode:'relative',
            yaxis:{
                showgrid:false,
                autotick: true,
                showticklabels: true,
                zeroline: true,
            },
            xaxis:{
                showgrid:false,
                autotick: true,
                zeroline: true,
                showticklabels: true,
            },
        }
        Plotly.react('selectedResultBarPlot',tracee,layout)
        if(selectedSource.length==0){
            Plotly.purge('selectedResultBarPlot');
        }
      })
    
}

// Function to calculate the p-value for a two-sample t-test without using libraries
const calculatePValue = (array1, array2) => {
    "use strict";
    const length = Math.max(array1.length, array2.length);
    const mean1 = array1.reduce((a, b) => a + b, 0) / array1.length;
    const mean2 = array2.reduce((a, b) => a + b, 0) / array2.length;
    const variance1 = array1.map((a) => a - mean1).reduce((a, b) => a + b * b, 0) / array1.length;
    const variance2 = array2.map((a) => a - mean2).reduce((a, b) => a + b * b, 0) / array2.length;
    const t = (mean1 - mean2) / Math.sqrt(variance1 / array1.length + variance2 / array2.length);
    const p = 2 * Math.min(1, Math.exp(-t * t / 2));
    return p;
  };
  
  // Function to calculate the cumulative distribution function (CDF) of the t-distribution
  async function tCDF(x, df) {
    const beta = Math.atan2(x, Math.sqrt(df));
    const alpha = df / 2;
    const incompleteBeta = (z, a, b) => {
      const betainc = (t, x, d) => {
        const betacf = (z, a, b) => {
          const maxIterations = 100;
          const epsilon = 1e-8;
  
          let m = 1;
          let qab = a + b;
          let qap = a + 1;
          let qam = a - 1;
          let c = 1;
          let d = 1 - qab * x / qap;
  
          while (Math.abs(d) > epsilon && m < maxIterations) {
            const m2 = 2 * m;
            const aa = m * (b - m) * x / ((qam + m2) * (a + m2));
            d = 1 + aa * d;
            c = 1 + aa / c;
            d = 1 / d;
            const del = d * c;
            const h = del * Math.exp(m2 * Math.log(x) + (qam - 1) * Math.log(1 - x));
            d = -h;
            m++;
          }
  
          return d;
        };
  
        return t < (a + 1) / (a + b + 2) ? 1 - betacf(z, a, b) : betacf(z, b, a);
      };
  
      return (Math.pow(Math.sin(beta), 2 * alpha) * Math.exp(-alpha * Math.log(1 + Math.pow(Math.tan(beta), 2) / df))) / (Math.PI * df * betainc(Math.tan(beta), alpha, 0.5));
    };
  
    return 0.5 + (x > 0 ? 1 - 0.5 * incompleteBeta(x * x / (x * x + df), df / 2, 0.5) : 0.5 * incompleteBeta(x * x / (x * x + df), df / 2, 0.5));
  }
  

  var myHeaders = new Headers();
  myHeaders.append("Cookie", "PHPSESSID=9he1k1idc849k6j6gki3jlbn23");
  myHeaders.append('Access-Control-Allow-Origin','http://127.0.0.1:5500/')
//   myHeaders.append("Access-Control-Allow-Origin", "*");
//   myHeaders.append('Accept','*/*');
//   myHeaders.append('Connection','keep-alive')
//   myHeaders.append('Accept-Encoding','gzip, deflate, br')
//   myHeaders.append('User-Agent','PostmanRuntime/7.32.3')
//   myHeaders.append('Content-Length','');
//   myHeaders.append('Content-Type','multipart/form-data;boundary=141');
//   myHeaders.append('Content-Type','');
//   myHeaders.append('Host','');
//   myHeaders.append('Content-Length',200)
  
  var formdata = new FormData();
  formdata.append("genes", "BRCA1%20BRCA2");
  formdata.append("type", "All");
  formdata.append("ge", "2");
  formdata.append("le", "5000");
  formdata.append("sim", "0");
  formdata.append("olap", "1");
  formdata.append("organism", "All");
  formdata.append("source", "KEGG_2021_HUMAN%20WikiPathway_2021");
  formdata.append("cohesion", "0");
  formdata.append("pvalue", ".05");
  formdata.append("FDR", "0.05");
  
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow',
  };
  var response = await fetch("http://discovery.informatics.uab.edu/PAGER/index.php/geneset/pagerapi", requestOptions).catch(error=>console.log('error : '+error));
  console.log(response)
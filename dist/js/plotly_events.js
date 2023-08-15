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
    tab2div01.on('plotly_selected',async function(eventData){
        console.log('insde tab2div01 plotly selected')
        console.log(eventData)
        
        var selectedPointsIndices=[];
        var ptGene=[], ptx=[], pty=[], pt01Out=[], pt02Out=[],pt01OutText=[],pt02OutText=[]
        var ptSTD1=[],ptSTD2=[],ptExp01=[], ptExp02=[],ptExp01Text=[],ptExp02Text=[]
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
            pt01Out.push(currPt01out);
            pt02Out.push(currPt02out);
            pt01OutText.push(Number(currPt01out).toFixed(2))
            pt02OutText.push(Number(currPt02out).toFixed(2))
            selectedPointsIndices.push(pt.pointIndex)
        });
        // alert(Object.keys(Plotly));
        // alert(Plotly.Plots);
        // alert(Object.keys(Plotly.Plots))
        console.log(Plotly.data)
        console.log(Plotly.d3.select('#canvas-div01'))
        console.log(Object.keys(Plotly.d3))
        console.log(Plotly.Plots.graphJson)
        console.log(Object.keys(Plotly.Plots))
        console.log()
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
                name: 'Texture 1',
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
                name: 'Texture 2',
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
                name: 'Texture 1',
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
                name: 'Texture 2',
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
        await Plotly.newPlot(tab2BarPlot02, barTraceExp, layout2);
        await Plotly.newPlot(tab2BarPlot, barTraceOuput, layout1);
        await Plotly.restyle(tab2div02, 'selectedpoints', [selectedPointsIndices]);
        // saveDataToProperties(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText);
        agGridd(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText)
        //tempGrid();
        //pathway(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText)
    })
})
async function saveDataToProperties(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText){
fs.writeFile('sdf.txt','sdfsf')
}

async function agGridd(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText){
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
        rowData.push({GeneName:ptGene[i],Group1_Score:pt01OutText[i],Group2_Score:pt02OutText[i],P_value:1})
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
        paginationPageSize: 10,
        // paginationAutoPageSize:true,
        domLayout: 'autoHeight',
        //suppressHorizontalScroll: true
        // getRowId: (params) => params.data.id,
        columnTypes: {
            nonEditableColumn: { editable: false },
        },
      };
    new agGrid.Grid(pathwayTable, gridOptions);
}
pathway([],[],[],[],[])
async function pathway(ptGene, pt01Out, pt02Out, pt01OutText, pt02OutText){
    // var pValue = await calculatePValue(pt01Out, pt02Out);
    var params = {
        "genes": "MYC",
        "source": "WikiPathway_2021_HUMAN%20Reactome_2021%20KEGG_2021%20Spike%20BioCarta%20NCI-Nature Curated",
        "type": "All",
        "sim": 0,
        "olap": 1,
        "organism": "Homo sapiens",
        "cohesion": "0",
        "pvalue": 0.05,
        "FDR": 0.05,
        "ge": 1,
        "le": 2000
    }
    var url = 'http://discovery.informatics.uab.edu/PAGER/index.php/geneset/pagerapi';
    var headers = {'Access-Control-Allow-Origin':'http://127.0.0.1:5500'}
    // var headers = {}
    var response = fetch(url, {body:params, method:'POST',headers:headers})
    console.log(response)
}

// Function to calculate the p-value for a two-sample t-test without using libraries
async function calculatePValue(group1, group2) {
    const mean1 = group1.reduce((sum, value) => sum + value, 0) / group1.length;
    const mean2 = group2.reduce((sum, value) => sum + value, 0) / group2.length;
  
    const variance1 = group1.reduce((sum, value) => sum + Math.pow(value - mean1, 2), 0) / (group1.length - 1);
    const variance2 = group2.reduce((sum, value) => sum + Math.pow(value - mean2, 2), 0) / (group2.length - 1);
  
    const pooledVariance = ((group1.length - 1) * variance1 + (group2.length - 1) * variance2) / (group1.length + group2.length - 2);
  
    const tStatistic = Math.abs(mean1 - mean2) / Math.sqrt(pooledVariance * (1 / group1.length + 1 / group2.length));
  
    const degreesOfFreedom = group1.length + group2.length - 2;
    
    // Calculate the p-value using t-distribution
    const pValue = 2 * (1 - tCDF(tStatistic, degreesOfFreedom)); // Multiply by 2 for a two-tailed test
  
    return pValue;
  }
  
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
  
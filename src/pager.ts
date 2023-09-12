const axios = require('axios')
async function runPager(genes, sources, olap, sim, fdr, organism) {
    const params = {};
    
    if (genes.length !== 0) {
      params['genes'] = genes.join('%20');
    } else {
      params['genes'] = '';
    }
    
    params['source'] = sources.join('%20');
    params['type'] = 'All';
    params['sim'] = sim;
    params['olap'] = olap;
    params['organism'] = organism;
    params['cohesion'] = '0';
    params['pvalue'] = 0.05;
    params['FDR'] = parseFloat(fdr);
    params['ge'] = 1;
    params['le'] = 5000;
    
    console.log(params);
    
    try {
      const response = await axios.post('http://discovery.informatics.uab.edu/PAGER/index.php/geneset/pagerapi', null, {
        params: params,
        method: 'POST',
        headers: {'Access-Control-Allow-Origin':'*'}
      });
      
      console.log(response.data.length);
      
      return response.data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

export async function callPagerAPI(){
console.log('insider callpager')
const sources = ["WikiPathway_2021_HUMAN", "Reactome_2021", "KEGG_2021", "Spike", "BioCarta", "NCI-Nature Curated"];
const olap = 1;
const sim = 0;
const fdr = 0.05;

(async () => {
  const pagerOutput = await runPager(['MYC'], sources, olap, sim, fdr, 'Homo sapiens');
  console.log(pagerOutput);
})();

}
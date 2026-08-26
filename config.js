/* PUFF HUB storefront configuration */
window.VAPORIX_CONFIG={
  SUPABASE_URL:'https://kjwfkqexwemztakagihl.supabase.co',
  SUPABASE_ANON_KEY:'sb_publishable_RLAGN9MDHIaVo708txjldQ_b87BYhIV',
  BUILD:'2026.08.26.7'
};
(function(){
  'use strict';
  let tries=0;
  function getProducts(){
    try{
      if(Array.isArray(window.products))return window.products;
      if(typeof products!=='undefined' && Array.isArray(products))return products;
      if(Array.isArray(window.VAPORIX_PRODUCTS))return window.VAPORIX_PRODUCTS;
    }catch(e){}
    return null;
  }
  async function enrich(){
    try{
      const list=getProducts();
      if(!list||!list.length){if(tries++<80)setTimeout(enrich,250);return;}
      if(list.__puffHubFlavorEnriched)return;
      const db=window.supabase?.createClient?.(window.VAPORIX_CONFIG.SUPABASE_URL,window.VAPORIX_CONFIG.SUPABASE_ANON_KEY);
      if(!db){if(tries++<80)setTimeout(enrich,250);return;}
      const {data,error}=await db.from('product_flavors').select('product_id,name,stock').order('id');
      if(error){console.warn('PUFF HUB flavor stock sync:',error.message);return;}
      const byId={};
      (data||[]).forEach(row=>{const raw=String(row.name||'').trim();const m=raw.match(/^(.*?)\s*📦\s*(?:80\+|\d+)\s*$/);const name=(m?m[1]:raw).trim();if(!name)return;const id=String(row.product_id);(byId[id]||(byId[id]=[])).push({name,stock:Math.max(0,Number(row.stock)||0)})});
      list.forEach(p=>{const rows=byId[String(p.id)]||[];if(rows.length){p.flavors=rows.map(x=>x.name);p.flavorStocks={};rows.forEach(x=>p.flavorStocks[x.name]=x.stock);p.stock=rows.reduce((s,x)=>s+x.stock,0)}else if(!Array.isArray(p.flavors))p.flavors=[]});
      list.__puffHubFlavorEnriched=true;if(typeof window.render==='function')window.render();
    }catch(e){console.warn('PUFF HUB flavor stock sync failed:',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enrich,{once:true});else enrich();
})();
(function(){
  function loadFixes(){if(document.getElementById('vaporix-runtime-fixes-script'))return;const s=document.createElement('script');s.id='vaporix-runtime-fixes-script';s.src='runtime_fixes.js?v=2026.08.26.7';s.defer=true;(document.head||document.documentElement).appendChild(s)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadFixes,{once:true});else loadFixes();
})();

/* PUFF HUB storefront configuration */
window.VAPORIX_CONFIG={
  SUPABASE_URL:'https://kjwfkqexwemztakagihl.supabase.co',
  SUPABASE_ANON_KEY:'sb_publishable_RLAGN9MDHIaVo708txjldQ_b87BYhIV',
  BUILD:'2026.08.26.4'
};

/*
 * Enriches the public catalog with authoritative per-flavor stock.
 * The large legacy index already creates the `products` array; this small
 * compatibility layer waits for that array, loads product_flavors once,
 * strips display stock suffixes and exposes clean `flavors` + `flavorStocks`
 * to the checkout runtime without requiring a rewrite of the 1.8 MB index.
 */
(function(){
  'use strict';
  let tries=0;
  async function enrich(){
    try{
      const list=Array.isArray(window.products)?window.products:null;
      if(!list||!list.length){if(tries++<40)setTimeout(enrich,250);return;}
      if(list.__puffHubFlavorEnriched)return;
      const db=window.supabase?.createClient?.(window.VAPORIX_CONFIG.SUPABASE_URL,window.VAPORIX_CONFIG.SUPABASE_ANON_KEY);
      if(!db)return;
      const {data,error}=await db.from('product_flavors').select('product_id,name,stock').order('id');
      if(error){console.warn('PUFF HUB flavor stock sync:',error.message);return;}
      const byId={};
      (data||[]).forEach(row=>{
        const raw=String(row.name||'').trim();
        const m=raw.match(/^(.*?)\s*📦\s*(?:80\+|\d+)\s*$/);
        const name=(m?m[1]:raw).trim();
        if(!name)return;
        const id=String(row.product_id);
        (byId[id]||(byId[id]=[])).push({name,stock:Math.max(0,Number(row.stock)||0)});
      });
      list.forEach(p=>{
        const rows=byId[String(p.id)]||[];
        if(rows.length){
          p.flavors=rows.map(x=>x.name);
          p.flavorStocks={};
          rows.forEach(x=>p.flavorStocks[x.name]=x.stock);
          p.stock=rows.reduce((s,x)=>s+x.stock,0);
        }else if(!Array.isArray(p.flavors))p.flavors=[];
      });
      list.__puffHubFlavorEnriched=true;
      if(typeof window.render==='function')window.render();
    }catch(e){console.warn('PUFF HUB flavor stock sync failed:',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enrich,{once:true});else enrich();
})();

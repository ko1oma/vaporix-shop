window.VAPORIX_CONFIG={
  SUPABASE_URL:'https://kjwfkqexwemztakagihl.supabase.co',
  SUPABASE_ANON_KEY:'sb_publishable_RLAGN9MDHIaVo708txjldQ_b87BYhIV'
};

document.addEventListener('DOMContentLoaded',()=>{
  const s=document.createElement('style');
  s.textContent=`
    .logo .vapo-part,.brand .vapo-part{color:var(--text)!important}
    .logo .rix-part,.brand .rix-part{color:var(--pink)!important}
    #pTiersEditor{grid-column:1/-1;background:var(--panel2,#0f0f14);border:1px solid var(--line,#30303a);border-radius:14px;padding:14px}
    #pTiersEditor .tierHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;font-weight:800}
    #pTiersEditor .tierHint{font-size:12px;color:var(--muted,#8f9098);font-weight:500;margin-top:3px}
    #pTiersEditor .tierRow{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin:8px 0;align-items:center}
    #pTiersEditor input{width:100%}.tierRemove{width:38px;height:38px;border-radius:10px;background:transparent;border:1px solid var(--line,#30303a);color:var(--muted,#8f9098)}
    .dynamic-cat .circle{position:relative}.dynamic-cat .circle img{width:100%;height:100%;object-fit:contain;border-radius:50%;background:var(--panel,#16161a);position:relative;z-index:1}
  `;document.head.appendChild(s);

  document.querySelectorAll('.logo,.brand').forEach(x=>{
    if(!x.querySelector('.vapo-part')) x.innerHTML='<span class="vapo-part">VAPO</span><span class="rix-part">RIX</span>';
  });

  if(document.getElementById('productForm')){
    const w=document.getElementById('pWholesale')?.closest('label');
    if(w&&!document.getElementById('pTiersEditor')){
      const box=document.createElement('div');box.id='pTiersEditor';
      box.innerHTML='<div class="tierHead"><div>Оптовые цены по количеству<div class="tierHint">Количество → цена за 1 шт. Для каждого порога задаётся своя цена.</div></div><button type="button" class="secondary" id="addTierBtn">+ Добавить порог</button></div><div id="tierRows"></div>';
      w.parentElement.insertBefore(box,w.nextElementSibling);
      document.getElementById('addTierBtn').onclick=()=>window.addTierRow();
    }
    window.addTierRow=(t={qty:'',price:''})=>{const r=document.getElementById('tierRows');if(!r)return;const x=document.createElement('div');x.className='tierRow';x.innerHTML=`<input class="tierQty" type="number" min="1" step="1" placeholder="Количество, например 20" value="${t.qty??''}"><input class="tierPrice" type="number" min="0" step="0.01" placeholder="Цена за 1 шт., €" value="${t.price??''}"><button type="button" class="tierRemove">×</button>`;x.querySelector('.tierRemove').onclick=()=>x.remove();r.appendChild(x)};
    window.renderTierRows=(tiers)=>{const r=document.getElementById('tierRows');if(!r)return;r.innerHTML='';(Array.isArray(tiers)?tiers:[]).forEach(window.addTierRow)};
  }

  const loadDynamicCategories=async()=>{
    const wrap=document.getElementById('categories')||document.querySelector('.categories');
    if(!wrap||!window.supabase)return;
    const db=supabase.createClient(window.VAPORIX_CONFIG.SUPABASE_URL,window.VAPORIX_CONFIG.SUPABASE_ANON_KEY);
    const {data,error}=await db.from('categories').select('*').eq('is_active',true).order('sort_order').order('name');
    if(error||!Array.isArray(data))return;
    data.filter(c=>c.slug!=='all').forEach(c=>{
      let b=[...wrap.querySelectorAll('.cat')].find(x=>x.dataset.cat===c.name||x.dataset.slug===c.slug);
      if(!b){b=document.createElement('button');b.className='cat dynamic-cat';b.dataset.cat=c.name;b.dataset.slug=c.slug;wrap.appendChild(b)}
      let cir=b.querySelector('.circle');if(!cir){cir=document.createElement('div');cir.className='circle';b.prepend(cir)}
      if(c.image_url)cir.innerHTML=`<img src="${String(c.image_url).replace(/"/g,'&quot;')}" alt="${String(c.name).replace(/"/g,'&quot;')}">`;
      let lab=b.querySelector('b');if(!lab){lab=document.createElement('b');b.appendChild(lab)}lab.textContent=c.name;
      b.onclick=()=>window.setCat?.(c.name);
    });
  };
  loadDynamicCategories();
  setTimeout(loadDynamicCategories,1000);

  if(document.getElementById('grid')){
    const db=supabase.createClient(window.VAPORIX_CONFIG.SUPABASE_URL,window.VAPORIX_CONFIG.SUPABASE_ANON_KEY);
    let tiersByName={};
    const loadTiers=async()=>{const {data}=await db.from('products').select('name,tiers').eq('active',true);if(Array.isArray(data))tiersByName=Object.fromEntries(data.map(p=>[String(p.name),Array.isArray(p.tiers)?p.tiers:[]]));paint()};
    const paint=()=>document.querySelectorAll('#grid .card').forEach(card=>{const n=card.querySelector('.name'),g=card.querySelector('.tiers-grid');if(!n||!g)return;const t=tiersByName[String(n.textContent)]||[];if(!t.length)return;g.innerHTML=t.map(x=>`<span><b>${Number(x.qty)} шт</b><b>${Number(x.price).toFixed(2)}</b></span>`).join('')});
    new MutationObserver(()=>requestAnimationFrame(paint)).observe(document.getElementById('grid'),{childList:true,subtree:true});
    loadTiers();
  }
});

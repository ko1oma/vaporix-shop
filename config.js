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
    .dynamic-cat .circle{position:relative;overflow:hidden;padding:0!important}.dynamic-cat .circle:before{display:none}.dynamic-cat .circle img{display:block;width:100%;height:100%;object-fit:cover;border-radius:50%;background:var(--panel,#16161a);position:relative;z-index:1}

    /* VAPORIX mobile-first navigation: icons by default, label opens only for the active item. */
    @media (max-width:700px){
      html,body{width:100%;max-width:100%;overflow-x:hidden}
      body{padding-bottom:calc(88px + env(safe-area-inset-bottom))}
      .app{width:100%;max-width:none;margin:0;padding:12px 12px calc(96px + env(safe-area-inset-bottom))}
      .top{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:14px}
      .logo{font-size:24px;justify-self:start;padding:4px 6px;margin:-4px -6px}
      .account{display:none!important}
      .search-wrap{width:100%;max-width:none;margin:0}
      .search{width:100%;min-height:50px;border-radius:17px;padding:12px 44px 12px 15px;font-size:16px}
      .section-title{font-size:21px;margin:14px 0 11px}
      .categories{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 6px;padding:2px 0 12px;width:100%}
      .cat{min-width:0;width:100%;padding:2px 0;border-radius:14px}
      .cat .circle{width:72px;height:72px;margin-bottom:7px}
      .cat .circle::after{width:52px;height:52px}
      .cat .circle svg{width:46px;height:46px}
      .cat b{font-size:12px;line-height:1.15;white-space:normal;overflow-wrap:anywhere}
      .grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
      .card{border-radius:14px;min-width:0}
      .pic{height:150px;padding:6px}
      .card-body{padding:8px 9px}
      .name{font-size:13px;min-height:30px}
      .price{font-size:17px;margin:3px 0}
      .stock,.smart,.tiers{font-size:11px}
      .card-actions{grid-template-columns:88px minmax(0,1fr);gap:6px;margin-top:7px}
      .card-qty{height:36px}
      .add-cart{height:36px;font-size:13px;padding:0 6px}
      .bottom{left:8px;right:8px;bottom:calc(7px + env(safe-area-inset-bottom));transform:none;width:auto;min-height:58px;padding:5px;gap:4px;border-radius:31px;box-shadow:0 14px 40px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.07)}
      .bottom .nav{height:48px;min-width:0;flex:0 1 auto;width:auto;padding:0 13px;border-radius:25px;gap:7px;font-size:0;overflow:hidden;white-space:nowrap;transition:flex-basis .28s cubic-bezier(.22,1,.36,1),padding .28s cubic-bezier(.22,1,.36,1),background .24s ease,color .24s ease,border-color .24s ease,box-shadow .24s ease,transform .24s ease}
      .bottom .nav svg{width:22px;height:22px;flex:0 0 22px;transition:transform .28s cubic-bezier(.22,1,.36,1)}
      .bottom .nav .nav-label{display:inline-block;max-width:0;opacity:0;overflow:hidden;transform:translateX(-5px);font-size:13px;font-weight:850;transition:max-width .28s cubic-bezier(.22,1,.36,1),opacity .2s ease,transform .28s cubic-bezier(.22,1,.36,1)}
      .bottom .nav.active{flex:1 1 auto;padding:0 15px;font-size:13px}
      .bottom .nav.active .nav-label{max-width:72px;opacity:1;transform:translateX(0)}
      .bottom .nav:active svg{transform:scale(.92)}
      .bottom .nav:nth-child(1){order:1}.bottom .nav:nth-child(3){order:2}.bottom .nav:nth-child(2){order:3}.bottom .nav:nth-child(4){order:4}
      .drawer{display:block!important;visibility:hidden;opacity:0;pointer-events:none;transition:opacity .28s ease,visibility 0s linear .28s}
      .drawer.show{visibility:visible;opacity:1;pointer-events:auto;transition:opacity .28s ease,visibility 0s linear 0s}
      .drawer-panel{transform:translateX(100%);transition:transform .34s cubic-bezier(.22,1,.36,1);will-change:transform;width:min(100%,430px);padding:18px 14px calc(24px + env(safe-area-inset-bottom))}
      .drawer.show .drawer-panel{transform:translateX(0)}
      .cart-item{grid-template-columns:58px minmax(0,1fr) auto;gap:9px;padding:12px 0}
      .thumb{width:58px;height:68px}
      .info-modal{visibility:hidden;opacity:0;display:grid!important;pointer-events:none;transition:opacity .28s ease,visibility 0s linear .28s}
      .info-modal.show{visibility:visible;opacity:1;pointer-events:auto;transition:opacity .28s ease,visibility 0s linear 0s}
      .info-box{width:100%;max-height:calc(100vh - 28px);overflow:auto;border-radius:22px;padding:22px}
      .profile{padding-bottom:20px}
      .footer{margin:35px auto 10px;padding:0 8px}
    }

    @media (max-width:370px){
      .app{padding-left:9px;padding-right:9px}
      .cat .circle{width:66px;height:66px}.cat .circle::after{width:48px;height:48px}.cat .circle svg{width:42px;height:42px}
      .bottom{left:6px;right:6px}.bottom .nav{padding-left:10px;padding-right:10px}.bottom .nav.active{padding-left:12px;padding-right:12px}
      .grid{gap:7px}.pic{height:138px}.card-body{padding-left:8px;padding-right:8px}.card-actions{grid-template-columns:82px minmax(0,1fr)}
    }
  `;
  document.head.appendChild(s);

  document.querySelectorAll('.logo,.brand').forEach(x=>{
    if(!x.querySelector('.vapo-part')) x.innerHTML='<span class="vapo-part">VAPO</span><span class="rix-part">RIX</span>';
  });

  const initTierEditor=()=>{
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
  };
  initTierEditor();

  const enhanceMobileNav=()=>{
    const bar=document.querySelector('.bottom');
    if(!bar)return;
    const buttons=[...bar.querySelectorAll('.nav')];
    const labels=buttons.map(b=>String(b.textContent||'').replace(/\s+/g,' ').trim());
    const orderFor=(label)=>{const x=label.toLowerCase();if(x.includes('каталог'))return 1;if(x.includes('инфо')||x.includes('info'))return 2;if(x.includes('корзин')||x.includes('cart'))return 3;if(x.includes('профил')||x.includes('profile'))return 4;return 9};
    buttons.forEach((b,i)=>{
      const label=labels[i]||'';
      if(!b.querySelector('.nav-label')){
        const textNodes=[...b.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());
        if(textNodes.length){const span=document.createElement('span');span.className='nav-label';span.textContent=textNodes.map(n=>n.textContent).join(' ').replace(/\s+/g,' ').trim();textNodes.forEach(n=>n.remove());b.appendChild(span)}
      }
      b.style.order=String(orderFor(label));
      b.setAttribute('aria-label',label);
      b.setAttribute('title',label);
      b.addEventListener('click',()=>{buttons.forEach(x=>x.classList.remove('active'));b.classList.add('active')},{passive:true});
    });
  };
  enhanceMobileNav();
  setTimeout(enhanceMobileNav,250);

  const loadDynamicCategories=async()=>{
    const wrap=document.querySelector('.categories');
    if(!wrap)return;
    if(!window.supabase||!window.VAPORIX_CONFIG?.SUPABASE_URL)return;
    const db=supabase.createClient(window.VAPORIX_CONFIG.SUPABASE_URL,window.VAPORIX_CONFIG.SUPABASE_ANON_KEY);
    let result=await db.from('categories').select('*').order('sort_order').order('name');
    if(result.error){result=await db.from('categories').select('*').order('name')}
    const data=result.data;
    if(!Array.isArray(data))return;
    const normalize=v=>String(v||'').toLowerCase().replace(/\s+/g,' ').trim();
    data.filter(c=>c.is_active!==false&&c.slug!=='all').forEach(c=>{
      let b=[...wrap.querySelectorAll('.cat')].find(x=>x.dataset.cat===c.name||x.dataset.slug===c.slug||normalize(x.querySelector('b')?.textContent)===normalize(c.name));
      if(!b){b=document.createElement('button');b.className='cat';wrap.appendChild(b)}
      b.classList.add('dynamic-cat');b.dataset.cat=c.name;b.dataset.slug=c.slug;
      let cir=b.querySelector('.circle');if(!cir){cir=document.createElement('div');cir.className='circle';b.prepend(cir)}
      if(c.image_url)cir.innerHTML=`<img src="${String(c.image_url).replace(/"/g,'&quot;')}" alt="${String(c.name).replace(/"/g,'&quot;')}">`;
      let lab=b.querySelector('b');if(!lab){lab=document.createElement('b');b.appendChild(lab)}lab.textContent=c.name;
      b.onclick=()=>window.setCat?.(c.name);
    });
    const byOrder=new Map(data.map((c,i)=>[c.slug,i]));
    [...wrap.querySelectorAll('.cat')].sort((a,b)=>(byOrder.get(a.dataset.slug)??999)-(byOrder.get(b.dataset.slug)??999)).forEach(x=>wrap.appendChild(x));
  };
  loadDynamicCategories();
  setTimeout(loadDynamicCategories,500);
  setTimeout(loadDynamicCategories,1500);

  if(document.getElementById('grid')){
    const db=supabase.createClient(window.VAPORIX_CONFIG.SUPABASE_URL,window.VAPORIX_CONFIG.SUPABASE_ANON_KEY);
    let tiersByName={};
    const loadTiers=async()=>{const {data}=await db.from('products').select('name,tiers').eq('active',true);if(Array.isArray(data))tiersByName=Object.fromEntries(data.map(p=>[String(p.name),Array.isArray(p.tiers)?p.tiers:[]]));paint()};
    const paint=()=>document.querySelectorAll('#grid .card').forEach(card=>{const n=card.querySelector('.name'),g=card.querySelector('.tiers-grid');if(!n||!g)return;const t=tiersByName[String(n.textContent)]||[];if(!t.length)return;g.innerHTML=t.map(x=>`<span><b>${Number(x.qty)} шт</b><b>${Number(x.price).toFixed(2)}</b></span>`).join('')});
    new MutationObserver(()=>requestAnimationFrame(paint)).observe(document.getElementById('grid'),{childList:true,subtree:true});
    loadTiers();
  }
});

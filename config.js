window.VAPORIX_CONFIG={
  SUPABASE_URL:'https://kjwfkqexwemztakagihl.supabase.co',
  SUPABASE_ANON_KEY:'sb_publishable_RLAGN9MDHIaVo708txjldQ_b87BYhIV'
};

document.addEventListener('DOMContentLoaded',()=>{
  if(document.getElementById('appView')) return;
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
      .categories{display:flex!important;flex-wrap:nowrap!important;align-items:flex-start;gap:8px;padding:2px 0 12px;width:100%;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;touch-action:pan-x}
      .categories::-webkit-scrollbar{display:none}
      .cat{flex:0 0 70px;min-width:70px;width:70px;padding:2px 0;border-radius:14px}
      .cat .circle{width:64px;height:64px;margin:0 auto 7px}
      .cat .circle::after{width:48px;height:48px}
      .cat .circle svg{width:42px;height:42px}
      .cat b{display:block;font-size:11px;line-height:1.12;white-space:normal;overflow-wrap:anywhere;text-align:center}
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
      .cat{flex-basis:66px;min-width:66px;width:66px}
      .cat .circle{width:60px;height:60px}.cat .circle::after{width:46px;height:46px}.cat .circle svg{width:40px;height:40px}
      .bottom{left:6px;right:6px}.bottom .nav{padding-left:10px;padding-right:10px}.bottom .nav.active{padding-left:12px;padding-right:12px}
      .grid{gap:7px}.pic{height:138px}.card-body{padding-left:8px;padding-right:8px}.card-actions{grid-template-columns:82px minmax(0,1fr)}
    }
  `;
  document.head.appendChild(s);

  document.querySelectorAll('.logo,.brand').forEach(x=>{
    if(!x.querySelector('.vapo-part')) x.innerHTML='<span class="vapo-part">VAPO</span><span class="rix-part">RIX</span>';
  });

  const initTierEditor=()=>{
    if(!document.getElementById('productForm'))return;
    const w=document.getElementById('pWholesale')?.closest('label');
    if(w&&!document.getElementById('pTiersEditor')){
      const box=document.createElement('div');box.id='pTiersEditor';
      box.innerHTML='<div class="tierHead"><div>Оптовые цены по количеству<div class="tierHint">Количество → цена за 1 шт. Для каждого порога задаётся своя цена.</div></div><button type="button" class="secondary" id="addTierBtn">+ Добавить порог</button></div><div id="tierRows"></div>';
      w.parentElement.insertBefore(box,w.nextElementSibling);
      document.getElementById('addTierBtn').onclick=()=>window.addTierRow();
    }
    window.addTierRow=(t={qty:'',price:''})=>{const r=document.getElementById('tierRows');if(!r)return;const x=document.createElement('div');x.className='tierRow';x.innerHTML=`<input class="tierQty" type="number" min="1" step="1" placeholder="Количество, например 20" value="${t.qty??''}"><input class="tierPrice" type="number" min="0" step="0.01" placeholder="Цена за 1 шт., €" value="${t.price??''}"><button type="button" class="tierRemove">×</button>`;x.querySelector('.tierRemove').onclick=()=>x.remove();r.appendChild(x)};
    window.renderTierRows=(tiers)=>{const r=document.getElementById('tierRows');if(!r)return;r.innerHTML='';(Array.isArray(tiers)?tiers:[]).forEach(window.addTierRow)};
  };
  initTierEditor();

  const enhanceMobileNav=()=>{
    const bar=document.querySelector('.bottom');if(!bar)return;
    [...bar.querySelectorAll('.nav')].forEach(b=>{
      if(!b.querySelector('.nav-label')){
        const text=[...b.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());
        if(text.length){const span=document.createElement('span');span.className='nav-label';span.textContent=text.map(n=>n.textContent).join(' ').replace(/\s+/g,' ').trim();text.forEach(n=>n.remove());b.appendChild(span)}
      }
    });
  };
  enhanceMobileNav();setTimeout(enhanceMobileNav,250);

  function numericTiers(raw,base){
    if(Array.isArray(raw)&&raw.length&&raw.every(x=>typeof x==='number'))return raw.map(Number);
    const byQty=new Map();
    if(Array.isArray(raw))raw.forEach(x=>{if(x&&Number.isFinite(Number(x.qty))&&Number.isFinite(Number(x.price)))byQty.set(Number(x.qty),Number(x.price))});
    return [20,30,50,70,100].map(q=>byQty.has(q)?byQty.get(q):Number(base||0));
  }

  async function syncCatalog(){
    if(!window.supabase||!window.VAPORIX_CONFIG?.SUPABASE_URL||typeof products==='undefined')return;
    try{
      const db=supabase.createClient(window.VAPORIX_CONFIG.SUPABASE_URL,window.VAPORIX_CONFIG.SUPABASE_ANON_KEY);
      const [cr,pr,fr]=await Promise.all([
        db.from('categories').select('id,name,slug,image_url,is_active,sort_order').eq('is_active',true).order('sort_order').order('name'),
        db.from('products').select('id,name,slug,category_id,price,stock,image_url,description,brand,active,tiers,flavors,categories(name)').eq('active',true).order('created_at',{ascending:false}),
        db.from('product_flavors').select('product_id,name,stock').order('name')
      ]);
      if(pr.error)throw pr.error;
      const dbProducts=Array.isArray(pr.data)?pr.data:[];
      const flavorStockMap=new Map();
      if(!fr.error&&Array.isArray(fr.data)) fr.data.forEach(f=>{
        const pid=Number(f.product_id);
        if(!flavorStockMap.has(pid)) flavorStockMap.set(pid,{});
        flavorStockMap.get(pid)[String(f.name)]=Math.max(0,Number(f.stock)||0);
      });
      const oldProducts=products.map(p=>({...p}));
      const fallbackBySlug=new Map(oldProducts.map(p=>[String(p.slug||''),p]));
      const fallbackByName=new Map(oldProducts.map(p=>[String(p.name||''),p]));
      if(dbProducts.length){
        products.splice(0,products.length,...dbProducts.map(p=>{
          const fallback=fallbackBySlug.get(String(p.slug||''))||fallbackByName.get(String(p.name||''));
          return {id:p.id,dbId:p.id,name:p.name||'',slug:p.slug||'',price:Number(p.price||0),stock:Number(p.stock||0)>80?'80+':String(Number(p.stock||0)),cat:p.categories?.name||'',category_id:p.category_id??null,brand:p.brand||p.categories?.name||'',img:p.image_url||fallback?.img||'',description:p.description||'',tiers:numericTiers(p.tiers,p.price),flavors:Array.isArray(p.flavors)?p.flavors.filter(Boolean).map(String):[],flavorStocks:flavorStockMap.get(Number(p.id))||{}};
        }));
      }
      const wrap=document.getElementById('categories');
      if(wrap&&Array.isArray(cr.data)){
        const cats=cr.data.filter(c=>c.is_active!==false);
        const all=cats.find(c=>c.slug==='all');
        const normal=cats.filter(c=>c.slug!=='all');
        const current=(typeof category!=='undefined'&&category)||'Все';
        wrap.innerHTML='';
        const make=(c,isAll)=>{
          const b=document.createElement('button');b.type='button';b.className='cat dynamic-cat'+((isAll?current==='Все':current===c.name)?' active':'');b.dataset.cat=isAll?'Все':c.name;b.dataset.slug=c.slug||'';
          const circle=document.createElement('div');circle.className='circle';
          if(c.image_url){const img=document.createElement('img');img.src=c.image_url;img.alt=c.name||'';img.loading='lazy';circle.appendChild(img)}
          const label=document.createElement('b');label.textContent=isAll?((typeof lang!=='undefined'&&lang==='en')?'All products':(typeof lang!=='undefined'&&lang==='uk')?'Всі товари':(typeof lang!=='undefined'&&lang==='es')?'Todos los productos':(typeof lang!=='undefined'&&lang==='de')?'Alle Produkte':'Все товары'):c.name;
          b.append(circle,label);b.onclick=()=>window.setCat?.(isAll?'Все':c.name);return b;
        };
        if(all)wrap.appendChild(make(all,true));normal.forEach(c=>wrap.appendChild(make(c,false)));
      }
      if(typeof window.render==='function')window.render();
      if(typeof window.renderCart==='function')window.renderCart();
    }catch(e){console.warn('VAPORIX catalog sync:',e)}
  }

  syncCatalog();
  setTimeout(syncCatalog,1000);
  window.addEventListener('focus',syncCatalog);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')syncCatalog()});

  // Independent age-gate fallback for Telegram/iOS WebViews.
  const bindAgeGate=()=>{
    const gate=document.getElementById('age');
    const button=document.getElementById('ageEnter');
    if(!gate||!button||button.dataset.ageBound==='1')return;
    button.dataset.ageBound='1';
    const accept=()=>{
      try{localStorage.setItem('age18','1')}catch(e){}
      gate.classList.remove('age-hide');
      gate.style.pointerEvents='none';
      gate.style.opacity='0';
      setTimeout(()=>{gate.style.display='none';gate.style.pointerEvents='none'},220);
      document.body.style.overflow='auto';
    };
    button.addEventListener('click',accept);
    button.addEventListener('touchend',e=>{e.preventDefault();accept()},{passive:false});
    button.addEventListener('pointerup',e=>{if(e.pointerType==='touch')accept()});
    button.onclick=accept;
  };
  bindAgeGate();
  setTimeout(bindAgeGate,300);
  setTimeout(bindAgeGate,1000);

  // MULTI_FLAVOR_CHOOSER_V2
  // FLAVOR_STOCK_SYNC_V1
  const initAddToCartChooser=()=>{
    if(document.getElementById('vpxChooser')) return;
    const style=document.createElement('style');
    style.id='vpxChooserStyle';
    style.textContent=`
      #vpxChooser{position:fixed;inset:0;z-index:99999;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.68);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:12px}
      #vpxChooser.show{display:flex}
      #vpxChooser .vpx-box{width:min(520px,100%);max-height:min(92vh,760px);overflow:auto;background:#15151a;border:1px solid #34343d;border-radius:24px;padding:18px;box-shadow:0 24px 80px rgba(0,0,0,.55)}
      #vpxChooser .vpx-head{display:flex;gap:14px;align-items:center}
      #vpxChooser .vpx-img{width:82px;height:96px;flex:0 0 82px;border-radius:14px;background:#101014;object-fit:contain}
      #vpxChooser .vpx-title{font-size:20px;font-weight:900;color:#fff}
      #vpxChooser .vpx-stock{margin-top:5px;color:#7dff00;font-weight:800}
      #vpxChooser .vpx-label{font-size:13px;color:#9b9ca5;font-weight:800;margin:18px 0 9px}
      #vpxChooser .vpx-flavors{display:flex;flex-wrap:wrap;gap:8px}
      #vpxChooser .vpx-flavor{border:1px solid #3a3a45;background:#202026;color:#b9bac2;border-radius:999px;padding:9px 12px;font-size:13px;font-weight:750;cursor:pointer;transition:.16s ease}
      #vpxChooser .vpx-flavor.active{border-color:#c43cff;background:linear-gradient(90deg,#f21b9b,#813cff);color:#fff;box-shadow:0 0 18px rgba(194,42,255,.22)}
      #vpxChooser .vpx-step{width:46px;height:42px;border:0;border-radius:12px;background:#24242b;color:#fff;font-size:25px;font-weight:700;cursor:pointer}
      #vpxChooser .vpx-step:disabled{opacity:.35;cursor:not-allowed}
      #vpxChooser .vpx-count{min-width:60px;text-align:center;font-size:20px;font-weight:900;color:#fff}
      #vpxChooser .vpx-selected{margin-top:10px;color:#b9bac2;font-size:12px;font-weight:700}
      #vpxChooser .vpx-qty{display:flex;align-items:center;justify-content:space-between;background:#101014;border:1px solid #30303a;border-radius:15px;padding:8px 10px}
      #vpxChooser .vpx-price{margin-top:12px;display:flex;justify-content:space-between;align-items:end}
      #vpxChooser .vpx-unit{font-size:13px;color:#9b9ca5}.vpx-unit strong{display:block;font-size:24px;color:#fff}
      #vpxChooser .vpx-total{text-align:right;font-size:13px;color:#9b9ca5}.vpx-total strong{display:block;font-size:24px;color:#fff}
      #vpxChooser .vpx-add{width:100%;height:52px;border:0;border-radius:16px;margin-top:16px;background:linear-gradient(90deg,#f21b9b,#813cff);color:#fff;font-size:16px;font-weight:900;cursor:pointer}
      #vpxChooser .vpx-add:disabled{opacity:.45;cursor:not-allowed}
      #vpxChooser .vpx-close{width:100%;height:42px;border:0;background:transparent;color:#9b9ca5;font-weight:800;cursor:pointer;margin-top:3px}
      @media(max-width:700px){#vpxChooser{padding:8px}.vpx-box{border-radius:24px 24px 18px 18px!important;padding:16px!important}.vpx-title{font-size:18px!important}}
    `;
    document.head.appendChild(style);
    const root=document.createElement('div');
    root.id='vpxChooser';
    root.innerHTML=`<div class="vpx-box" role="dialog" aria-modal="true">
      <div class="vpx-head"><img class="vpx-img" alt=""><div><div class="vpx-title"></div><div class="vpx-stock"></div></div></div>
      <div class="vpx-label vpx-flavor-label" style="display:none">Выберите вкус</div>
      <div class="vpx-flavors"></div>
      <div class="vpx-selected" style="display:none"></div>
      <div class="vpx-label">Количество каждого выбранного вкуса</div>
      <div class="vpx-qty"><button class="vpx-step" data-step="-1" type="button">−</button><div class="vpx-count">1</div><button class="vpx-step" data-step="1" type="button">+</button></div>
      <div class="vpx-price"><div class="vpx-unit">Цена за 1 шт.<strong class="vpx-unit-val">0.00 EUR</strong></div><div class="vpx-total">Итого<strong class="vpx-total-val">0.00 EUR</strong></div></div>
      <button class="vpx-add" type="button">Добавить в корзину</button><button class="vpx-close" type="button">Отмена</button>
    </div>`;
    document.body.appendChild(root);

    let current=null, qty=1, selected=[];
    const els={img:root.querySelector('.vpx-img'),title:root.querySelector('.vpx-title'),stock:root.querySelector('.vpx-stock'),flavorLabel:root.querySelector('.vpx-flavor-label'),flavors:root.querySelector('.vpx-flavors'),selected:root.querySelector('.vpx-selected'),count:root.querySelector('.vpx-count'),unit:root.querySelector('.vpx-unit-val'),total:root.querySelector('.vpx-total-val'),add:root.querySelector('.vpx-add'),steps:[...root.querySelectorAll('.vpx-step')]};
    const flavorList=()=>Array.isArray(current?.flavors)?current.flavors.filter(Boolean).map(String):[];
    const getFlavorStockMap=()=>current?.flavorStocks||current?.flavor_stock||{};
    const getMax=()=>{
      const fs=flavorList();
      if(fs.length&&selected.length){
        const map=getFlavorStockMap();
        const stocks=selected.map(f=>{const n=Number(map[f]);return Number.isFinite(n)&&n>=0?n:0});
        return Math.max(0,Math.min(...stocks));
      }
      const n=Number(current?.stock);return Number.isFinite(n)&&n>0?n:9999;
    };
    const getTierPrice=q=>{
      const base=Number(current?.price||0),tiers=Array.isArray(current?.tiers)?current.tiers:[];
      if(tiers.length&&typeof tiers[0]==='object'){
        const sorted=tiers.filter(x=>Number(x.qty)>0&&Number(x.price)>=0).sort((a,b)=>Number(a.qty)-Number(b.qty));
        let p=base;sorted.forEach(x=>{if(q>=Number(x.qty))p=Number(x.price)});return p;
      }
      if(tiers.length===5){const qs=[20,30,50,70,100];let p=base;qs.forEach((t,i)=>{if(q>=t)p=Number(tiers[i])});return p}
      return base;
    };
    const render=()=>{
      const p=getTierPrice(qty),totalQty=(flavorList().length?selected.length:1)*qty;
      els.count.textContent=qty;els.unit.textContent=p.toFixed(2)+' EUR';els.total.textContent=(p*totalQty).toFixed(2)+' EUR';
      els.selected.style.display=selected.length?'block':'none';els.selected.textContent=selected.length?`Выбрано вкусов: ${selected.length}. Всего штук: ${totalQty}.`:'';
      els.add.disabled=flavorList().length>0&&!selected.length;
      const max=getMax();els.steps.forEach(b=>b.disabled=(Number(b.dataset.step)>0&&qty>=max)||(Number(b.dataset.step)<0&&qty<=1));
    };
    const refreshButtons=()=>root.querySelectorAll('.vpx-flavor').forEach(b=>b.classList.toggle('active',selected.includes(b.dataset.flavor)));
    const close=()=>{root.classList.remove('show');document.body.style.overflow='auto';current=null;selected=[]};
    const findProduct=card=>{
      const name=card?.querySelector('.name')?.textContent?.trim()||'';
      return (Array.isArray(window.products)?window.products:[]).find(p=>String(p.name||'').trim()===name)||(Array.isArray(products)?products:[]).find(p=>String(p.name||'').trim()===name);
    };
    const open=card=>{
      const p=findProduct(card);if(!p)return;
      current=p;qty=1;selected=[];els.img.src=p.img||card?.querySelector('.pic img')?.src||'';els.title.textContent=p.name||'Товар';els.stock.textContent='В наличии: '+(p.stock??'');
      const fs=flavorList();els.flavors.innerHTML='';els.flavorLabel.style.display=fs.length?'block':'none';
      fs.forEach(f=>{const b=document.createElement('button');b.type='button';b.className='vpx-flavor';b.dataset.flavor=f;b.textContent=f;b.onclick=()=>{selected=selected.includes(f)?selected.filter(x=>x!==f):[...selected,f];const max=getMax();if(qty>max)qty=Math.max(1,max);refreshButtons();render()};els.flavors.appendChild(b)});
      if(!fs.length)selected=[''];
      refreshButtons();render();root.classList.add('show');document.body.style.overflow='hidden';
    };
    root.addEventListener('click',e=>{if(e.target===root)e.preventDefault(),close()});
    root.querySelector('.vpx-close').onclick=close;
    els.steps.forEach(b=>b.onclick=()=>{const max=getMax();qty=Math.max(1,Math.min(max,qty+Number(b.dataset.step)));render()});
    els.add.onclick=()=>{
      if(!current||(!selected.length&&flavorList().length))return;
      const flavors=flavorList().length?selected:[''];
      if(flavorList().length&&qty>getMax())return;
      try{
        for(const f of flavors){
          const item={...current,quantity:qty,qty,flavor:f||null};
          if(typeof window.addToCart==='function')window.addToCart(item);
          else if(typeof window.addCart==='function')window.addCart(item);
          else{
            const key='vaporix_cart';const cart=JSON.parse(localStorage.getItem(key)||'[]');
            const k=String(current.id||current.dbId||current.slug||current.name)+'|'+String(f||'');
            const old=cart.find(x=>String(x.id||x.dbId||x.slug||x.name)+'|'+String(x.flavor||'')===k);
            if(old)old.quantity=(Number(old.quantity||old.qty)||0)+qty;else cart.push(item);
            localStorage.setItem(key,JSON.stringify(cart));
          }
        }
      }catch(e){console.warn('VAPORIX cart:',e)}
      close();if(typeof window.renderCart==='function')window.renderCart();
      const cartNav=document.querySelector('.bottom .nav:nth-child(3)');if(cartNav&&typeof cartNav.click==='function')setTimeout(()=>cartNav.click(),80);
    };
    document.addEventListener('click',e=>{const btn=e.target.closest?.('.add-cart');if(!btn)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open(btn.closest('.card'))},{capture:true});
    document.addEventListener('touchend',e=>{const btn=e.target.closest?.('.add-cart');if(!btn)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open(btn.closest('.card'))},{capture:true,passive:false});
  };
  initAddToCartChooser();
});


// VAPORIX stability patch
document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{const s=document.createElement('script');s.src='vpx-stability-patch.js?v=5';document.body.appendChild(s)},100)}, {once:true});

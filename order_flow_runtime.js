(function(){
  'use strict';

  const ORDERS_KEY='puffhubOrdersV1';
  const CUSTOMER_KEY='puffhubCustomerV1';
  const DELIVERY_FEE=15;
  const CARD_FEE_RATE=0.05;
  let detailIndex=-1;
  let checkoutStep=1;
  let checkoutData={name:'',surname:'',country:'Germany',phone:'',email:'',delivery:'DPD',city:'',postcode:'',street:'',house:'',payment:'card'};

  const $=id=>document.getElementById(id);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(v):String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money2=v=>Number(v||0).toFixed(2);

  function loadOrders(){try{return JSON.parse(localStorage.getItem(ORDERS_KEY)||'[]')||[]}catch(e){return []}}
  function saveOrders(v){localStorage.setItem(ORDERS_KEY,JSON.stringify(v))}
  function loadCustomer(){try{return Object.assign(checkoutData,JSON.parse(localStorage.getItem(CUSTOMER_KEY)||'{}')||{})}catch(e){return checkoutData}}
  function saveCustomer(){localStorage.setItem(CUSTOMER_KEY,JSON.stringify(checkoutData))}
  function subtotal(){return cart.reduce((s,x)=>s+Number(currentUnitPrice(x.product,Number(x.qty||0))||0)*Number(x.qty||0),0)}
  function cardFee(){return checkoutData.payment==='card'?(subtotal()+DELIVERY_FEE)*CARD_FEE_RATE:0}
  function orderTotal(){return subtotal()+DELIVERY_FEE+cardFee()}
  function orderDate(){return new Date().toLocaleString('ru-RU',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
  function orderId(){const d=new Date(),pad=n=>String(n).padStart(2,'0');return 'ORD-PH-'+d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'-'+Math.random().toString(36).slice(2,8).toUpperCase()}

  const css=`
  .ph-detail-modal,.ph-order-detail{position:fixed;inset:0;z-index:700;background:rgba(0,0,0,.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);opacity:0;pointer-events:none;transition:opacity .22s ease}
  .ph-detail-modal.show,.ph-order-detail.show{opacity:1;pointer-events:auto}
  .ph-detail-box,.ph-order-detail-box{position:absolute;left:50%;bottom:0;transform:translate(-50%,105%);width:min(560px,100%);max-height:min(92vh,900px);overflow:auto;background:var(--panel);color:var(--text);border:1px solid var(--line2);border-bottom:0;border-radius:26px 26px 0 0;padding:12px 15px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -24px 80px rgba(0,0,0,.45);transition:transform .34s cubic-bezier(.22,.8,.25,1)}
  .ph-detail-modal.show .ph-detail-box,.ph-order-detail.show .ph-order-detail-box{transform:translate(-50%,0)}
  .ph-detail-head,.ph-order-detail-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.ph-detail-head h2,.ph-order-detail-head h2{margin:0;font-size:20px}.ph-detail-product{font-size:12px;color:var(--muted);margin-top:3px}.ph-detail-close{width:34px;height:34px;border-radius:11px;background:var(--panel2);border:1px solid var(--line);color:var(--text);display:grid;place-items:center}
  .ph-detail-image{height:245px;border-radius:18px;background:radial-gradient(circle at 50% 40%,#39393e,#171718 62%);display:grid;place-items:center;overflow:hidden;margin-bottom:12px}.ph-detail-image img{max-width:94%;max-height:94%;object-fit:contain}
  .ph-detail-status{color:var(--green);font-weight:850;font-size:13px;margin:5px 0 8px}.ph-flavor-title{font-size:12px;color:var(--muted);font-weight:800;margin:10px 0 7px}.ph-flavors{display:flex;flex-wrap:wrap;gap:7px}.ph-flavor{border:1px solid var(--line2);background:var(--panel2);color:var(--text);border-radius:999px;padding:9px 12px;font-size:12px;font-weight:750}.ph-flavor.active{background:linear-gradient(100deg,var(--pink),var(--purple));border-color:transparent;color:#fff;box-shadow:0 5px 18px rgba(124,66,255,.24)}
  .ph-price-box{margin-top:13px;background:#090909;border-radius:17px;padding:15px}.ph-price-main{display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:900}.ph-tiers{margin-top:12px;border:1px solid var(--line2);border-radius:14px;padding:5px 11px}.ph-tier{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line)}.ph-tier:last-child{border-bottom:0}.ph-detail-add{width:100%;height:52px;margin-top:13px;border-radius:15px;background:linear-gradient(100deg,var(--pink),var(--purple));color:#fff;font-weight:900;font-size:15px;box-shadow:0 10px 28px rgba(124,66,255,.25)}.ph-detail-add:disabled{opacity:.45;box-shadow:none;cursor:not-allowed}
  .ph-cart-flavor{color:var(--muted);font-size:11px;margin-top:3px}.ph-cart-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-top:8px}.ph-checkout-disabled{opacity:.45;pointer-events:none}
  .ph-progress{display:flex;align-items:center;gap:7px;margin:7px 0 15px}.ph-progress-item{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#151515;color:var(--muted);border:1px solid var(--line);font-weight:900;font-size:12px}.ph-progress-item.active{color:#fff;background:#3b1785;border:2px solid #9a68ff}.ph-progress-item.done{color:#fff;background:#5517b5;border-color:#7c42ff}.ph-progress-line{height:2px;flex:1;background:var(--line2)}
  .ph-form-card,.ph-review-card{background:var(--panel2);border:1px solid var(--line2);border-radius:18px;padding:15px;margin-bottom:12px}.ph-form-card h3,.ph-review-card h3{margin:0 0 12px;font-size:16px}.ph-field{margin-bottom:11px}.ph-field:last-child{margin-bottom:0}.ph-field label{display:block;font-size:11px;color:var(--muted);font-weight:800;margin:0 0 6px}.ph-field input,.ph-field select{width:100%;height:46px;border-radius:13px;border:1px solid var(--line2);background:#111;color:var(--text);padding:0 13px;outline:none}.ph-field input:focus,.ph-field select:focus{border-color:#8d6bff;box-shadow:0 0 0 3px #8d6bff18}.ph-fields-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ph-next{width:100%;height:48px;border-radius:14px;background:linear-gradient(100deg,var(--pink),var(--purple));color:#fff;font-weight:900}.ph-back{width:100%;height:44px;margin-top:8px;border-radius:13px;background:var(--panel2);border:1px solid var(--line2);color:var(--text);font-weight:800}.ph-review-line{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);font-size:12px}.ph-review-line:last-child{border-bottom:0}.ph-review-total{font-size:17px;font-weight:950}.ph-success{text-align:center;padding:20px 4px 8px}.ph-success-icon{width:100px;height:100px;margin:0 auto 18px;border-radius:30px;background:linear-gradient(135deg,#9b2cff,#ff299f);display:grid;place-items:center;box-shadow:0 15px 45px rgba(124,66,255,.3);font-size:55px}.ph-success h2{font-size:25px;margin:0 0 8px}.ph-success p{color:var(--muted);line-height:1.45;margin:0 0 16px}.ph-order-code{background:var(--panel2);border:1px solid var(--line);border-radius:16px;padding:14px;text-align:left}.ph-order-code-row{display:flex;justify-content:space-between;gap:12px;padding:7px 0}.ph-order-code-row span:first-child{color:var(--muted)}
  .ph-orders-section{margin:0 0 18px}.ph-orders-title{font-size:13px;color:var(--muted);font-weight:800;margin:0 4px 8px}.ph-order-card{width:100%;background:var(--panel);border:1px solid var(--line);border-radius:17px;padding:13px;text-align:left;color:var(--text);margin-bottom:8px}.ph-order-card:hover{border-color:var(--line2);background:var(--panel2)}.ph-order-top{display:flex;justify-content:space-between;gap:10px;align-items:center}.ph-order-id{font-size:13px;font-weight:900}.ph-order-total{font-size:15px;font-weight:950;color:#9a68ff}.ph-order-meta{display:flex;justify-content:space-between;gap:8px;color:var(--muted);font-size:10px;margin-top:8px}.ph-order-status{display:inline-flex;margin-top:8px;padding:5px 9px;border-radius:999px;background:#351077;color:#b98cff;border:1px solid #6437a2;font-size:10px;font-weight:850}.ph-no-orders{padding:16px;border:1px dashed var(--line2);border-radius:15px;color:var(--muted);font-size:12px;text-align:center}
  .ph-detail-section{background:var(--panel2);border:1px solid var(--line);border-radius:16px;padding:13px;margin-bottom:10px}.ph-detail-section h3{font-size:14px;margin:0 0 9px}.ph-order-product{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)}.ph-order-product:last-child{border-bottom:0}.ph-order-product img{width:48px;height:56px;object-fit:contain;border-radius:9px;background:#111}.ph-order-product-main{flex:1;min-width:0}.ph-order-product-name{font-size:12px;font-weight:850}.ph-order-product-sub{font-size:10px;color:var(--muted);margin-top:3px}.ph-detail-kv{display:flex;justify-content:space-between;gap:10px;padding:7px 0;font-size:11px}.ph-detail-kv span:first-child{color:var(--muted)}
  @media(min-width:701px){.ph-detail-box,.ph-order-detail-box{bottom:auto;top:50%;transform:translate(-50%,-46%);border-bottom:1px solid var(--line2);border-radius:26px;max-height:88vh}.ph-detail-modal.show .ph-detail-box,.ph-order-detail.show .ph-order-detail-box{transform:translate(-50%,-50%)}}
  @media(max-width:520px){.ph-detail-image{height:210px}.ph-fields-2{grid-template-columns:1fr}.ph-detail-box,.ph-order-detail-box{padding-left:13px;padding-right:13px}}
  /* Checkout reference layout: full-screen 4-step mobile flow. */
  .checkout-modal{z-index:1000;background:var(--bg);backdrop-filter:none;-webkit-backdrop-filter:none}
  .checkout-modal .checkout-box{position:absolute;inset:0;left:50%;top:0;bottom:0;width:min(820px,100%);max-width:820px;max-height:none;transform:translate(-50%,0)!important;border:0;border-radius:0;background:var(--bg);padding:26px 34px calc(34px + env(safe-area-inset-bottom));box-shadow:none;overflow:auto}
  .checkout-modal.show .checkout-box{transform:translate(-50%,0)!important}
  .checkout-modal .sheet-handle,.checkout-modal .sheet-head{display:none!important}
  .checkout-modal.show ~ .bottom{display:none}
  .ph-checkout-title{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 15px}
  .ph-checkout-title h1{margin:0;font-size:30px;line-height:1.05;font-weight:950;letter-spacing:-.5px}
  .ph-step-count{flex:none;min-width:66px;height:44px;padding:0 15px;border-radius:24px;background:#202024;border:1px solid #484850;color:#a9a9b5;display:grid;place-items:center;font-size:16px;font-weight:800}
  .ph-progress{gap:8px;margin:0 0 22px}
  .ph-progress-item{width:48px;height:48px;font-size:16px;background:#171719;border-color:#26262c}
  .ph-progress-item.active{background:#31156f;border:3px solid #8f5cff;color:#a978ff}
  .ph-progress-item.done{background:#4c16a5;border-color:#6f35dc}
  .ph-progress-line{height:3px;background:#3b3941}
  .ph-form-card,.ph-review-card{background:#29292b;border:1px solid #4a4a4f;border-radius:24px;padding:24px 26px;margin-bottom:14px;box-shadow:0 8px 30px rgba(0,0,0,.12)}
  .ph-form-card h3,.ph-review-card h3{font-size:21px;margin:0 0 20px;font-weight:900}
  .ph-card-heading{display:flex;align-items:center;gap:14px}
  .ph-card-icon{width:40px;height:40px;display:grid;place-items:center;color:#aaaab5;flex:none}
  .ph-card-icon svg{width:35px;height:35px}
  .ph-field{margin-bottom:17px}
  .ph-field label{font-size:17px;color:#a9a9b4;margin:0 0 8px;font-weight:650}
  .ph-field input,.ph-field select{height:64px;border-radius:18px;border:1px solid #4b4b50;background:#171719;color:#f2f2f4;padding:0 18px;font-size:18px}
  .ph-field input::placeholder{color:#7f7f88}
  .ph-fields-2{gap:14px}
  .ph-next{height:62px;border-radius:18px;font-size:20px;background:linear-gradient(100deg,#6f31d7,#8b4dff);box-shadow:0 10px 30px rgba(124,66,255,.2)}
  .ph-back{height:54px;border-radius:17px;font-size:17px;background:#202023;border-color:#45454c}
  .ph-review-card{padding:20px 26px}
  .ph-review-card h3{font-size:18px;margin-bottom:9px}
  .ph-review-line{font-size:15px;padding:13px 0}
  .ph-review-total{font-size:20px}
  .ph-success{padding:55px 4px 18px}
  .ph-success-icon{width:142px;height:142px;border-radius:42px;font-size:74px;margin-bottom:25px;background:linear-gradient(135deg,#a62dff,#ff2aa0);box-shadow:0 18px 55px rgba(124,66,255,.32)}
  .ph-success h2{font-size:31px}
  .ph-success p{font-size:17px}
  .ph-order-code{padding:18px;border-radius:20px;background:#171719;border-color:#3d3d43}
  .ph-order-code-row{font-size:15px;padding:10px 0}
  .ph-orders-section{margin:0 0 22px}
  .ph-orders-title{font-size:18px;color:var(--text);font-weight:850;margin:0 0 12px}
  .ph-order-card{padding:18px;border-radius:20px;margin-bottom:10px}
  .ph-order-top{align-items:flex-start}
  .ph-order-id{font-size:16px}
  .ph-order-total{font-size:18px}
  .ph-order-meta{font-size:12px}
  .ph-order-status{font-size:12px;padding:6px 11px}
  .ph-order-products-preview{display:flex;gap:8px;margin-top:14px}
  .ph-order-thumb{width:70px;height:78px;border-radius:14px;background:#111;border:1px solid #38383e;object-fit:contain}
  @media(max-width:560px){
    .checkout-modal .checkout-box{padding:26px 34px calc(30px + env(safe-area-inset-bottom))}
    .ph-checkout-title h1{font-size:30px}
    .ph-step-count{min-width:66px}
    .ph-progress-item{width:48px;height:48px}
    .ph-form-card,.ph-review-card{padding:24px 28px}
    .ph-field input,.ph-field select{height:64px}
    .ph-card-heading h3{font-size:20px}
  }
  .ph-flavor-chooser{position:fixed;inset:0;z-index:1200;background:rgba(0,0,0,.7);backdrop-filter:blur(10px);display:grid;place-items:center;padding:20px}
  .ph-flavor-box{width:min(560px,100%);max-height:88vh;overflow:auto;background:#29292b;border:1px solid #4a4a50;border-radius:25px;padding:25px;color:var(--text);box-shadow:0 25px 80px rgba(0,0,0,.55)}
  .ph-flavor-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.ph-flavor-head h2{margin:3px 0 0;font-size:22px}.ph-flavor-kicker,.ph-flavor-label{color:var(--muted);font-size:13px;font-weight:800}.ph-flavor-label{margin:18px 0 9px}
  .ph-flavor-close{width:38px;height:38px;border-radius:12px;background:#1a1a1c;border:1px solid #3d3d43;color:#fff;font-size:18px}
  .ph-flavor-list{display:grid;grid-template-columns:1fr 1fr;gap:9px}.ph-flavor-option{min-height:58px;border-radius:15px;border:1px solid #4a4a52;background:#19191b;color:#fff;padding:11px 13px;text-align:left;font-weight:850}.ph-flavor-option span,.ph-flavor-option small{display:block}.ph-flavor-option small{margin-top:4px;color:#8cff00;font-size:11px}.ph-flavor-option.active{border-color:#965dff;background:#351579;box-shadow:0 0 0 2px #8e51ff33}.ph-flavor-option:disabled{opacity:.45}
  .ph-choose-qty{height:54px;display:grid;grid-template-columns:54px 1fr 54px;align-items:center;text-align:center;border:1px solid #4a4a50;border-radius:15px;background:#19191b;overflow:hidden}.ph-choose-qty button{height:100%;background:transparent;color:#fff;font-size:25px}.ph-choose-qty strong{font-size:18px}
  .ph-flavor-add{width:100%;height:56px;margin-top:18px;border-radius:16px;background:linear-gradient(100deg,#ff299e,#7c42ff);color:#fff;font-weight:900;font-size:16px}.ph-flavor-add:disabled{opacity:.45}
  @media(max-width:430px){
    .checkout-modal .checkout-box{padding-left:16px;padding-right:16px}
    .ph-checkout-title h1{font-size:27px}
    .ph-progress-item{width:40px;height:40px;font-size:14px}
    .ph-progress{gap:5px}
    .ph-form-card,.ph-review-card{padding:20px 18px;border-radius:22px}
    .ph-field input,.ph-field select{height:58px;font-size:16px}
    .ph-field label{font-size:15px}
  }
  `;
  const st=document.createElement('style');st.id='puffhub-order-flow-css';st.textContent=css;document.head.appendChild(st);

  function ensureModals(){
    if(!$('productDetailModal')){
      const m=document.createElement('div');m.id='productDetailModal';m.className='ph-detail-modal';m.onclick=e=>{if(e.target===m)closeProductDetail()};
      m.innerHTML='<div class="ph-detail-box"><div class="sheet-handle"></div><div id="productDetailContent"></div></div>';
      document.body.appendChild(m);
    }
    if(!$('orderDetailModal')){
      const m=document.createElement('div');m.id='orderDetailModal';m.className='ph-order-detail';m.onclick=e=>{if(e.target===m)closeOrderDetail()};
      m.innerHTML='<div class="ph-order-detail-box"><div class="sheet-handle"></div><div id="orderDetailContent"></div></div>';
      document.body.appendChild(m);
    }
  }

  function productTiers(p){
    const t=Array.isArray(p?.tiers)?p.tiers:[];
    if(!t.length)return [];
    if(typeof t[0]==='object')return t.map(x=>({qty:Number(x.qty||0),price:Number(x.price||0)})).filter(x=>x.qty>0).sort((a,b)=>a.qty-b.qty);
    const qs=[20,30,50,70,100];return t.map((price,i)=>({qty:qs[i],price:Number(price||0)})).filter(x=>x.price>0);
  }
  function currentUnitPrice(p,qty){let u=Number(p?.price||0);productTiers(p).forEach(t=>{if(qty>=t.qty)u=t.price});return u}

  function openProductDetail(index){
    const p=products()[index];if(!p)return;ensureModals();let flavor=null,qty=1;const rows=Array.isArray(p.flavors)?p.flavors.map(String).filter(Boolean):[];
    const fs=p.flavorStocks||{};
    const stockFor=f=>Object.prototype.hasOwnProperty.call(fs,f)?Number(fs[f]||0):Number(p.stock||0);
    const flavorHtml=rows.length?`<div class="ph-flavor-title">Выберите вкус</div><div class="ph-flavors">${rows.map(f=>`<button class="ph-flavor" type="button" data-flavor="${esc(f)}">${esc(f)} <span style="color:var(--green)">📦 ${stockFor(f)>=80?'80+':stockFor(f)}</span></button>`).join('')}</div>`:'';
    const tiers=productTiers(p);const tierHtml=tiers.length?`<div class="ph-tiers">${tiers.map(t=>`<div class="ph-tier"><span>${t.qty}+ шт</span><b>${money2(t.price)} EUR</b></div>`).join('')}</div>`:'';
    $('productDetailContent').innerHTML=`<div class="ph-detail-head"><div><h2>${esc(p.name)}</h2><div class="ph-detail-product">${esc(p.brand||'')}</div></div><button class="ph-detail-close" onclick="closeProductDetail()">✕</button></div><div class="ph-detail-image"><img src="${esc(p.img||'')}" alt="${esc(p.name)}"></div><div class="ph-detail-status">В наличии</div>${flavorHtml}<div class="ph-price-box"><div class="ph-price-main"><span>Цена</span><b id="phUnitPrice">${money2(p.price)} EUR</b></div>${tierHtml}<div class="ph-cart-actions" style="justify-content:space-between;margin-top:12px"><div class="qty"><button id="phMinus">−</button><span id="phQty">1</span><button id="phPlus">+</button></div><span id="phTotal" style="font-weight:900;font-size:16px">${money2(p.price)} EUR</span></div><button id="phDetailAdd" class="ph-detail-add">Добавить в корзину</button></div>`;
    const maxStock=()=>flavor?stockFor(flavor):(Number(p.stock||0)>=80?999999:Number(p.stock||0));
    const update=()=>{const u=currentUnitPrice(p,qty);$('phUnitPrice').textContent=money2(u)+' EUR';$('phTotal').textContent=money2(u*qty)+' EUR';$('phQty').textContent=qty;$('phPlus').disabled=qty>=maxStock();};
    document.querySelectorAll('[data-flavor]').forEach(b=>b.onclick=()=>{flavor=b.dataset.flavor;document.querySelectorAll('.ph-flavor').forEach(x=>x.classList.remove('active'));b.classList.add('active');qty=1;update()});
    $('phMinus').onclick=()=>{qty=Math.max(1,qty-1);update()};$('phPlus').onclick=()=>{qty=Math.min(maxStock(),qty+1);update()};
    $('phDetailAdd').onclick=()=>{if(rows.length&&!flavor){alert('Выберите вкус.');return}const item={id:p.id,product:p,qty,flavor:flavor||null};const existing=cart.find(x=>String(x.id)===String(item.id)&&String(x.flavor||'')===String(item.flavor||''));if(existing)existing.qty+=qty;else cart.push(item);renderCart2();$('productDetailModal').classList.remove('show');document.body.style.overflow='auto';if(typeof window.showCart==='function')window.showCart();};
    $('productDetailModal').classList.add('show');document.body.style.overflow='hidden';update();
  }
  function closeProductDetail(){$('productDetailModal')?.classList.remove('show');document.body.style.overflow='auto'}
  window.openProductDetail=openProductDetail;window.closeProductDetail=closeProductDetail;

  function renderCart2(){if(typeof renderCart==='function')renderCart();const drawer=document.querySelector('#cartDrawer .drawer-panel')||document.querySelector('.drawer-panel');if(!drawer)return;let box=document.getElementById('phCartExtra');if(!box){box=document.createElement('div');box.id='phCartExtra';drawer.appendChild(box)}box.innerHTML='';if(!cart.length)return;const frag=document.createElement('div');cart.forEach((x,i)=>{const p=x.product||{};const row=document.createElement('div');row.className='ph-cart-actions';row.innerHTML=`<span class="ph-cart-flavor">${x.flavor?`Вкус: ${esc(x.flavor)}`:''}</span><button type="button" class="qty" style="margin:0"><button data-ci="${i}" data-d="-">−</button><span>${x.qty}</span><button data-ci="${i}" data-d="+">+</button></button>`;frag.appendChild(row)});box.appendChild(frag);frag.querySelectorAll('[data-ci]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.ci);cart[i].qty=Math.max(1,Number(cart[i].qty||1)+(b.dataset.d==='+'?1:-1));renderCart2()})}

  function iconSvg(type){
    const common='viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
    if(type==='user') return `<svg ${common}><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6"/></svg>`;
    if(type==='truck') return `<svg ${common}><path d="M3 6h11v10H3z"/><path d="M14 10h4l3 3v3h-3"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>`;
    if(type==='box') return `<svg ${common}><path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z"/><path d="M4 7.5V17l8 4 8-4V7.5M12 12v9"/></svg>`;
    return '';
  }

  function checkoutShell(title,body,action,back){
    const m=$('checkoutModal');if(!m)return;
    let box=m.querySelector('.checkout-box');
    if(!box){box=document.createElement('div');box.className='checkout-box';m.appendChild(box)}
    const titleHtml=title?`<div class="ph-checkout-title"><h1>${title}</h1><span class="ph-step-count">${checkoutStep} / 4</span></div>`:'';
    const progress=`<div class="ph-progress">${[1,2,3,4].map(n=>`<span class="ph-progress-item ${checkoutStep===n?'active':checkoutStep>n?'done':''}">${checkoutStep>n?'✓':n}</span>${n<4?'<span class="ph-progress-line"></span>':''}`).join('')}</div>`;
    box.innerHTML=`${titleHtml}${progress}<div id="checkoutSummary">${body}</div>${back?`<button class="ph-back" onclick="${back}">Назад</button>`:''}${action?`<button id="phCheckoutAction" class="ph-next" onclick="${action.fn}">${action.text}</button>`:''}`;
    m.classList.add('show');
    document.body.classList.add('sheet-open');
    document.body.style.overflow='hidden';
  }

  function showCheckoutFlow(){checkoutStep=1;loadCustomer();renderCheckoutFlow()}
  window.showCheckout=showCheckoutFlow;

  function renderCheckoutFlow(){
    if(checkoutStep===1){
      checkoutShell('Контактные данные',
        `<div class="ph-form-card">
          <div class="ph-card-heading"><span class="ph-card-icon">${iconSvg('user')}</span><h3>Введите данные</h3></div>
          <div class="ph-field"><label>Имя *</label><input id="coName" value="${esc(checkoutData.name)}" placeholder="Ваше имя" autocomplete="given-name"></div>
          <div class="ph-field"><label>Фамилия *</label><input id="coSurname" value="${esc(checkoutData.surname)}" placeholder="Ваша фамилия" autocomplete="family-name"></div>
          <div class="ph-field"><label>Страна *</label><select id="coCountry"><option value="Germany">Германия</option><option value="Poland">Польша</option><option value="Czechia">Чехия</option><option value="Austria">Австрия</option><option value="Slovakia">Словакия</option><option value="Other">Другая</option></select></div>
          <div class="ph-field"><label>Телефон *</label><input id="coPhone" value="${esc(checkoutData.phone)}" placeholder="+49..." autocomplete="tel"></div>
          <div class="ph-field"><label>Email *</label><input id="coEmail" type="email" value="${esc(checkoutData.email)}" placeholder="your@email.com" autocomplete="email"></div>
        </div>`,
        {fn:'nextCheckoutStep()',text:'Далее'});
      setTimeout(()=>{if($('coCountry'))$('coCountry').value=checkoutData.country||'Germany'},0);
      return;
    }

    if(checkoutStep===2){
      checkoutShell('Доставка',
        `<div class="ph-form-card">
          <div class="ph-card-heading"><span class="ph-card-icon">${iconSvg('truck')}</span><h3>Доставка</h3></div>
          <div class="ph-field"><label>Способ доставки *</label><select id="coDelivery"><option value="DPD">DPD</option><option value="Самовывоз">Самовывоз</option></select></div>
          <div class="ph-fields-2"><div class="ph-field"><label>Город *</label><input id="coCity" value="${esc(checkoutData.city)}" placeholder="Город" autocomplete="address-level2"></div><div class="ph-field"><label>Почтовый индекс *</label><input id="coPostcode" value="${esc(checkoutData.postcode)}" placeholder="Индекс" autocomplete="postal-code"></div></div>
          <div class="ph-field"><label>Улица *</label><input id="coStreet" value="${esc(checkoutData.street)}" placeholder="Улица" autocomplete="street-address"></div>
          <div class="ph-field"><label>Номер дома *</label><input id="coHouse" value="${esc(checkoutData.house)}" placeholder="Номер дома"></div>
        </div>`,
        {fn:'nextCheckoutStep()',text:'Далее'},'prevCheckoutStep()');
      setTimeout(()=>{if($('coDelivery'))$('coDelivery').value=checkoutData.delivery||'DPD'},0);
      return;
    }

    if(checkoutStep===3){
      const productsHtml=cart.map(x=>`<div class="ph-review-line"><span>${esc(x.product.name)}${x.flavor?' · '+esc(x.flavor):''} × ${x.qty}</span><b>${money2(currentUnitPrice(x.product,x.qty)*x.qty)} EUR</b></div>`).join('');
      checkoutShell('Проверка заказа',
        `<div class="ph-review-card">
          <div class="ph-card-heading"><span class="ph-card-icon">${iconSvg('box')}</span><h3>Ваш заказ</h3></div>
          ${productsHtml}
        </div>
        <div class="ph-review-card">
          <h3>Контакты</h3>
          <div class="ph-review-line"><span>Имя</span><b>${esc(checkoutData.name)} ${esc(checkoutData.surname)}</b></div>
          <div class="ph-review-line"><span>Телефон</span><b>${esc(checkoutData.phone)}</b></div>
          <div class="ph-review-line"><span>Email</span><b>${esc(checkoutData.email)}</b></div>
        </div>
        <div class="ph-review-card">
          <h3>Доставка и оплата</h3>
          <div class="ph-review-line"><span>Способ доставки</span><b>${esc(checkoutData.delivery)}</b></div>
          <div class="ph-review-line"><span>Адрес</span><b>${esc(checkoutData.postcode)} ${esc(checkoutData.city)}, ${esc(checkoutData.street)} ${esc(checkoutData.house)}</b></div>
          <div class="ph-review-line"><span>Оплата</span><select id="coPayment" style="background:#111;color:var(--text);border:1px solid var(--line2);border-radius:12px;padding:8px 10px"><option value="card">Карта</option><option value="cash">Банковский перевод</option></select></div>
          <div class="ph-review-line"><span>Комиссия карты 5%</span><b>${money2(cardFee())} EUR</b></div>
          <div class="ph-review-line"><span>Доставка</span><b>${money2(DELIVERY_FEE)} EUR</b></div>
          <div class="ph-review-line ph-review-total"><span>К оплате</span><b>${money2(orderTotal())} EUR</b></div>
        </div>`,
        {fn:'submitCheckoutOrder()',text:'Оформить заказ'},'prevCheckoutStep()');
      setTimeout(()=>{if($('coPayment')){$('coPayment').value=checkoutData.payment||'card';$('coPayment').onchange=()=>{checkoutData.payment=$('coPayment').value;renderCheckoutFlow()}}},0);
      return;
    }

    const order=checkoutData.lastOrder;
    checkoutShell('Статус заказа',
      `<div class="ph-success">
        <div class="ph-success-icon">✓</div>
        <h2>Заказ успешно оформлен</h2>
        <p>Ваш заказ зарегистрирован и передан в обработку.</p>
        <div class="ph-order-code">
          <div class="ph-order-code-row"><span>Номер заказа</span><b>${esc(order.id)}</b></div>
          <div class="ph-order-code-row"><span>Дата оформления</span><b>${esc(order.date)}</b></div>
        </div>
      </div>`,
      {fn:'openOrderDetailById('+JSON.stringify(order.id)+')',text:'Информация о заказе'});
    const wrap=$('checkoutSummary');
    const extra=document.createElement('button');extra.className='ph-back';extra.textContent='Вернуться на Главную';extra.onclick=()=>{hideCheckout();showCatalog()};wrap.appendChild(extra);
  }

  function fieldVal(id){return ($(id)?.value||'').trim()}
  window.nextCheckoutStep=function(){if(checkoutStep===1){checkoutData.name=fieldVal('coName');checkoutData.surname=fieldVal('coSurname');checkoutData.country=fieldVal('coCountry');checkoutData.phone=fieldVal('coPhone');checkoutData.email=fieldVal('coEmail');if(!checkoutData.name||!checkoutData.surname||!checkoutData.phone||!checkoutData.email){alert('Заполните все обязательные поля.');return}}if(checkoutStep===2){checkoutData.delivery=fieldVal('coDelivery');checkoutData.city=fieldVal('coCity');checkoutData.postcode=fieldVal('coPostcode');checkoutData.street=fieldVal('coStreet');checkoutData.house=fieldVal('coHouse');if(!checkoutData.city||!checkoutData.postcode||!checkoutData.street||!checkoutData.house){alert('Заполните адрес доставки.');return}}saveCustomer();checkoutStep++;renderCheckoutFlow()};
  window.prevCheckoutStep=function(){checkoutStep=Math.max(1,checkoutStep-1);renderCheckoutFlow()};
  window.submitCheckoutOrder=async function(){
    if(!cart.length)return;
    const action=$('phCheckoutAction');
    if(action){action.disabled=true;action.textContent='Оформляем…'}
    try{
      const payload={
        name:checkoutData.name,
        surname:checkoutData.surname,
        email:checkoutData.email,
        phone:checkoutData.phone,
        country:checkoutData.country,
        city:checkoutData.city,
        postal_code:checkoutData.postcode,
        street:checkoutData.street,
        house:checkoutData.house,
        delivery_method:checkoutData.delivery==='Самовывоз'?'pickup':'dpd',
        payment_method:checkoutData.payment==='cash'?'bank':'card',
        items:cart.map(x=>({product_id:x.product.id,quantity:Number(x.qty||1),flavor:x.flavor||null}))
      };

      let serverResult=null;
      if(window.supabase && window.VAPORIX_CONFIG?.SUPABASE_URL){
        const db=window.__puffhubDb||(window.__puffhubDb=window.supabase.createClient(window.VAPORIX_CONFIG.SUPABASE_URL,window.VAPORIX_CONFIG.SUPABASE_ANON_KEY));
        const res=await db.rpc('create_public_order',{p_payload:payload});
        if(res.error)throw res.error;
        serverResult=res.data;
      }

      const orderIdValue=serverResult?.order_number||orderId();
      const serverTotal=serverResult?.total!=null?Number(serverResult.total):orderTotal();
      const orders=loadOrders();
      const order={
        id:orderIdValue,
        serverId:serverResult?.order_id||null,
        date:orderDate(),
        status:'Создан',
        statusKey:'created',
        customer:{name:checkoutData.name,surname:checkoutData.surname,country:checkoutData.country,phone:checkoutData.phone,email:checkoutData.email},
        delivery:{method:checkoutData.delivery,city:checkoutData.city,postcode:checkoutData.postcode,street:checkoutData.street,house:checkoutData.house},
        payment:{method:checkoutData.payment,fee:serverResult?.payment_fee!=null?Number(serverResult.payment_fee):cardFee()},
        items:cart.map(x=>({id:x.product.id,name:x.product.name,flavor:x.flavor||'',qty:Number(x.qty||1),price:Number(currentUnitPrice(x.product,x.qty)||0),img:x.product.img})),
        subtotal:serverResult?.subtotal!=null?Number(serverResult.subtotal):subtotal(),
        deliveryFee:serverResult?.delivery!=null?Number(serverResult.delivery):DELIVERY_FEE,
        total:serverTotal
      };
      orders.unshift(order);saveOrders(orders);
      checkoutData.lastOrder=order;saveCustomer();
      cart=[];
      if(typeof renderCart2==='function')renderCart2();else if(typeof renderCart==='function')renderCart();
      checkoutStep=4;
      renderCheckoutFlow();
    }catch(error){
      console.error('PUFF HUB order creation failed:',error);
      alert(error?.message||'Не удалось оформить заказ. Проверьте данные и попробуйте ещё раз.');
      if(action){action.disabled=false;action.textContent='Оформить заказ'}
    }
  };
  function ensureProfileOrders(){const profile=$('profile');if(!profile||$('phOrdersSection'))return;const sec=document.createElement('div');sec.id='phOrdersSection';sec.className='ph-orders-section';sec.innerHTML='<div class="ph-orders-title">Активные заказы</div><div id="phOrdersList"></div>';const settings=profile.querySelector('.profile-section-title');profile.insertBefore(sec,settings||profile.firstChild);renderOrders()}
  function renderOrders(){
    const list=$('phOrdersList');if(!list)return;
    const orders=loadOrders();
    list.innerHTML=orders.length?orders.map(o=>{
      const thumbs=(o.items||[]).slice(0,4).map(x=>`<img class="ph-order-thumb" src="${esc(x.img||'')}" alt="">`).join('');
      return `<button class="ph-order-card" onclick="openOrderDetailById('${esc(o.id)}')">
        <div class="ph-order-top"><span class="ph-order-id">${esc(o.id)}</span><span class="ph-order-total">${money2(o.total)} EUR</span></div>
        <div class="ph-order-meta"><span>${esc(o.date)}</span><span>${(o.items||[]).length} ${(o.items||[]).length===1?'товар':'товара'}</span></div>
        <span class="ph-order-status">${esc(o.status||'Создан')}</span>
        <div class="ph-order-products-preview">${thumbs}</div>
      </button>`;
    }).join(''):'<div class="ph-no-orders">У вас пока нет заказов.</div>';
  }
  function openOrderDetailById(id){const o=loadOrders().find(x=>x.id===id);if(!o)return;ensureModals();$('orderDetailContent').innerHTML=`<div class="ph-order-detail-head"><div><h2>Информация о заказе</h2><div class="sheet-sub">${esc(o.id)}</div></div><button class="ph-detail-close" onclick="closeOrderDetail()">✕</button></div><div class="ph-detail-section"><h3>Статус заказа</h3><span class="ph-order-status">${esc(o.status||'Создан')}</span></div><div class="ph-detail-section"><h3>Товары</h3>${o.items.map(x=>`<div class="ph-order-product"><img src="${x.img}" alt="${esc(x.name)}"><div class="ph-order-product-main"><div class="ph-order-product-name">${esc(x.name)}</div>${x.flavor?`<div class="ph-order-product-sub">Вкус: ${esc(x.flavor)}</div>`:''}<div class="ph-order-product-sub">${x.qty} × ${money2(x.price)} EUR</div></div><b>${money2(x.qty*x.price)} EUR</b></div>`).join('')}</div><div class="ph-detail-section"><h3>Контактные данные</h3><div class="ph-detail-kv"><span>Имя</span><b>${esc(o.customer.name)} ${esc(o.customer.surname)}</b></div><div class="ph-detail-kv"><span>Телефон</span><b>${esc(o.customer.phone)}</b></div><div class="ph-detail-kv"><span>Email</span><b>${esc(o.customer.email)}</b></div></div><div class="ph-detail-section"><h3>Доставка</h3><div class="ph-detail-kv"><span>Способ</span><b>${esc(o.delivery.method)}</b></div><div class="ph-detail-kv"><span>Адрес</span><b>${esc(o.delivery.postcode)} ${esc(o.delivery.city)}, ${esc(o.delivery.street)} ${esc(o.delivery.house)}</b></div></div><div class="ph-detail-section"><h3>Оплата</h3><div class="ph-detail-kv"><span>Способ</span><b>${o.payment.method==='card'?'Карта':'При получении'}</b></div><div class="ph-detail-kv"><span>Товары</span><b>${money2(o.subtotal)} EUR</b></div><div class="ph-detail-kv"><span>Доставка</span><b>${money2(o.deliveryFee)} EUR</b></div><div class="ph-detail-kv"><span>Комиссия</span><b>${money2(o.payment.fee)} EUR</b></div><div class="ph-detail-kv" style="font-size:15px"><span>Итого</span><b style="color:#9a68ff">${money2(o.total)} EUR</b></div></div>`;$('orderDetailModal').classList.add('show');document.body.style.overflow='hidden'}
  function closeOrderDetail(){$('orderDetailModal')?.classList.remove('show');document.body.style.overflow='auto'}
  window.openOrderDetailById=openOrderDetailById;window.closeOrderDetail=closeOrderDetail;

  const oldShowProfile=window.showProfile;window.showProfile=function(){oldShowProfile();ensureProfileOrders();renderOrders()};
  const oldHideCheckout=window.hideCheckout;window.hideCheckout=function(){$('checkoutModal').classList.remove('show');syncSheetState()};
  function openFlavorChooser(index){
    const list=typeof products==='function'?products():products;
    const p=list?.[index];
    if(!p)return;
    const flavors=Array.isArray(p.flavors)?p.flavors.map(String).filter(Boolean):Object.keys(p.flavorStocks||{});
    const stockMap=p.flavorStocks||{};
    const stockFor=f=>Object.prototype.hasOwnProperty.call(stockMap,f)?Number(stockMap[f]||0):999999;

    if(!flavors.length){
      const item={id:p.id,product:p,qty:1,flavor:null};
      const existing=cart.find(x=>String(x.id)===String(item.id)&&!x.flavor);
      if(existing)existing.qty+=1;else cart.push(item);
      if(typeof renderCart2==='function')renderCart2();else if(typeof renderCart==='function')renderCart();
      if(typeof window.showCart==='function')window.showCart();
      return;
    }

    let modal=document.getElementById('phFlavorChooser');
    if(!modal){modal=document.createElement('div');modal.id='phFlavorChooser';modal.className='ph-flavor-chooser';document.body.appendChild(modal)}
    modal.innerHTML=`<div class="ph-flavor-box" role="dialog" aria-modal="true">
      <div class="ph-flavor-head"><div><div class="ph-flavor-kicker">Добавить в корзину</div><h2>${esc(p.name)}</h2></div><button type="button" class="ph-flavor-close">✕</button></div>
      <div class="ph-flavor-label">Выберите вкус</div>
      <div class="ph-flavor-list">${flavors.map((f,n)=>{const st=stockFor(f);return `<button type="button" class="ph-flavor-option" data-flavor-index="${n}" ${st<=0?'disabled':''}><span>${esc(f)}</span><small>${st<=0?'Нет в наличии':'В наличии'}</small></button>`}).join('')}</div>
      <div class="ph-flavor-label">Количество</div>
      <div class="ph-choose-qty"><button type="button" data-qty="-">−</button><strong id="phChooseQty">1</strong><button type="button" data-qty="+">+</button></div>
      <button type="button" class="ph-flavor-add" disabled>Добавить в корзину</button>
    </div>`;
    modal.classList.add('show');document.body.style.overflow='hidden';

    let selected=null,selectedQty=1;
    const close=()=>{modal.classList.remove('show');document.body.style.overflow='auto'};
    modal.querySelector('.ph-flavor-close').onclick=close;
    modal.onclick=e=>{if(e.target===modal)close()};
    const qtyEl=modal.querySelector('#phChooseQty');
    modal.querySelectorAll('[data-qty]').forEach(b=>b.onclick=()=>{
      selectedQty=Math.max(1,selectedQty+(b.dataset.qty==='+'?1:-1));
      qtyEl.textContent=String(selectedQty);
    });
    const add=modal.querySelector('.ph-flavor-add');
    modal.querySelectorAll('.ph-flavor-option').forEach(b=>b.onclick=()=>{
      modal.querySelectorAll('.ph-flavor-option').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      selected=flavors[Number(b.dataset.flavorIndex)];
      add.disabled=false;
    });
    add.onclick=()=>{
      if(!selected)return;
      const item={id:p.id,product:p,qty:selectedQty,flavor:selected};
      const existing=cart.find(x=>String(x.id)===String(item.id)&&String(x.flavor||'')===String(item.flavor));
      if(existing)existing.qty+=selectedQty;else cart.push(item);
      if(typeof renderCart2==='function')renderCart2();else if(typeof renderCart==='function')renderCart();
      close();
      if(typeof window.showCart==='function')window.showCart();
    };
  }


  // Single authoritative catalog Add-to-cart handler.
  // The old card inline handler is stopped here before it can navigate anywhere.
  const openCatalogProduct=(e)=>{
    const btn=e.target.closest?.('.grid .card .add-cart');
    if(!btn)return;
    const card=btn.closest('.card');
    if(!card)return;
    const src=btn.getAttribute('onclick')||'';
    const m=src.match(/addWithQty\s*\(\s*(\d+)\s*\)/);
    let i=m?Number(m[1]):[...document.querySelectorAll('.grid .card')].indexOf(card);
    if(!Number.isInteger(i)||i<0)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    openFlavorChooser(i);
  };
  document.addEventListener('click',openCatalogProduct,true);
  document.addEventListener('touchend',openCatalogProduct,{capture:true,passive:false});

  loadCustomer();ensureModals();ensureProfileOrders();renderCart2();
  const staticCheckoutHead=document.querySelector('#checkoutModal .sheet-head');if(staticCheckoutHead)staticCheckoutHead.remove();
  const staticCheckoutButton=document.querySelector('#checkoutModal > .checkout-box > .checkout');if(staticCheckoutButton)staticCheckoutButton.remove();
  window.addEventListener('load',()=>{ensureProfileOrders();renderOrders();renderCart2()});
})();

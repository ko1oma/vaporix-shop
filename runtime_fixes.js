/* VAPORIX authoritative runtime fix V21 */
(function(){
  'use strict';
  if(window.__VAPORIX_RUNTIME_V21)return;
  window.__VAPORIX_RUNTIME_V21=true;

  const $=id=>document.getElementById(id);
  let checkoutSession=false;
  let closing=false;
  const handledAdd=new WeakSet();
  let lastTouch=0;

  function expandTelegram(){
    try{const tg=window.Telegram&&window.Telegram.WebApp;if(tg&&typeof tg.expand==='function')tg.expand()}catch(e){}
  }
  function modal(){return $('checkoutModal')}
  function checkoutVisible(){const m=modal();return !!(m&&m.classList.contains('show')&&m.style.visibility!=='hidden'&&m.style.pointerEvents!=='none')}

  function installStyle(){
    let s=$('vaporix-runtime-v21-style');
    if(!s){s=document.createElement('style');s.id='vaporix-runtime-v21-style';document.head.appendChild(s)}
    s.textContent=`
      html,body{min-height:100%!important;background:#08080a!important;}
      #checkoutModal{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;min-height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important;transform:none!important;background:var(--bg,#08080a)!important;z-index:1000!important;overscroll-behavior:contain!important}
      #checkoutModal:not(.show){visibility:hidden!important;pointer-events:none!important}
      #checkoutModal.show{visibility:visible!important;pointer-events:auto!important}
      #checkoutModal .checkout-box{position:absolute!important;inset:0!important;width:100%!important;max-width:none!important;height:100%!important;min-height:100%!important;max-height:none!important;margin:0!important;padding:22px 16px calc(42px + env(safe-area-inset-bottom))!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;transform:none!important;border-radius:0!important;transition:none!important;scroll-behavior:auto!important}
      #checkoutModal .checkout-box>*{touch-action:pan-y!important}
      #checkoutModal input,#checkoutModal select,#checkoutModal textarea,#checkoutModal button{touch-action:manipulation!important}
      #checkoutModal .ph-back,#checkoutModal .ph-cancel-checkout{display:block!important;width:100%!important;box-sizing:border-box!important}
      #checkoutModal .ph-cancel-checkout{margin-top:12px!important}
      #checkoutModal .ph-next{display:block!important;width:100%!important;margin-top:12px!important;position:relative!important;z-index:20!important}
      .grid .card-actions,.grid .add-cart{position:relative!important;z-index:20!important;pointer-events:auto!important;touch-action:manipulation!important}
      .grid .add-cart{cursor:pointer!important;-webkit-tap-highlight-color:transparent!important}
      .ph-orders-section{display:block!important;width:100%!important;margin:0 0 22px!important;padding:16px!important;border:1px solid #4a4a52!important;border-radius:20px!important;background:var(--panel,#171719)!important;box-sizing:border-box!important}
      .ph-orders-title{display:block!important;margin:0 0 12px!important;font-size:20px!important;font-weight:900!important}
      #phOrdersList{display:block!important;width:100%!important}
    `;
  }

  function closeCheckout(){
    if(closing)return;
    closing=true;checkoutSession=false;
    const m=modal();
    try{if(typeof window.hideCheckout==='function')window.hideCheckout()}catch(e){}
    if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true');m.style.pointerEvents='none';m.style.visibility='hidden'}
    document.body.classList.remove('sheet-open','modal-open');
    document.body.style.overflow='auto';
    try{if(typeof window.syncSheetState==='function')window.syncSheetState()}catch(e){}
    try{if(typeof window.showCart==='function')window.showCart()}catch(e){}
    setTimeout(()=>{closing=false},50);
  }

  function bindBack(){
    const m=modal();
    if(!m||m.__v21Back)return;
    m.__v21Back=true;
    m.addEventListener('click',function(e){
      const b=e.target&&e.target.closest&&e.target.closest('.ph-cancel-checkout');
      if(!b)return;
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();closeCheckout();
    },true);
  }

  function bindBottomNav(){
    if(document.__v21Nav)return;
    document.__v21Nav=true;
    document.addEventListener('click',function(e){
      const n=e.target&&e.target.closest&&e.target.closest('#homeNav,#cartNav,#infoNav,#profileNav,[data-nav],.bottom-nav button,.bottom-nav a,nav button,nav a');
      if(!n)return;
      checkoutSession=false;closing=false;
      const m=modal();if(m&&m.classList.contains('show')){m.classList.remove('show');m.style.visibility='hidden';m.style.pointerEvents='none'}
    },true);
  }

  function addFromButton(btn){
    if(!btn||handledAdd.has(btn))return;
    const m=(btn.getAttribute('onclick')||'').match(/addWithQty\((\d+)\)/);
    if(!m||typeof window.addWithQty!=='function')return;
    handledAdd.add(btn);
    try{window.addWithQty(Number(m[1]))}catch(e){console.error('VAPORIX add-to-cart failed',e)}
    setTimeout(()=>handledAdd.delete(btn),450);
  }

  function bindAddToCart(){
    if(document.__v21Add)return;
    document.__v21Add=true;
    document.addEventListener('touchend',function(e){
      const b=e.target&&e.target.closest&&e.target.closest('.grid .add-cart');if(!b)return;
      lastTouch=Date.now();addFromButton(b);e.preventDefault();e.stopImmediatePropagation();
    },{capture:true,passive:false});
    document.addEventListener('pointerup',function(e){
      const b=e.target&&e.target.closest&&e.target.closest('.grid .add-cart');if(!b)return;
      if(Date.now()-lastTouch<500)return;
      addFromButton(b);e.preventDefault();e.stopImmediatePropagation();
    },{capture:true,passive:false});
    document.addEventListener('click',function(e){
      const b=e.target&&e.target.closest&&e.target.closest('.grid .add-cart');if(!b)return;
      if(handledAdd.has(b)){e.preventDefault();e.stopImmediatePropagation()}
    },true);
  }

  function patchApis(){
    if(typeof window.showCheckout==='function'&&!window.showCheckout.__v21){
      const fn=window.showCheckout;
      const wrapped=function(){
        checkoutSession=true;closing=false;expandTelegram();
        const r=fn.apply(this,arguments);
        checkoutSession=true;
        setTimeout(()=>{installStyle();bindBack();const m=modal();if(m){m.classList.add('show');m.style.visibility='visible';m.style.pointerEvents='auto'}},0);
        return r;
      };
      wrapped.__v21=true;window.showCheckout=wrapped;window.showCartCheckout=wrapped;
    }
    if(typeof window.hideCheckout==='function'&&!window.hideCheckout.__v21){
      const fn=window.hideCheckout;
      const wrapped=function(){checkoutSession=false;closing=false;try{fn.apply(this,arguments)}catch(e){}const m=modal();if(m){m.classList.remove('show');m.style.visibility='hidden';m.style.pointerEvents='none'}document.body.classList.remove('sheet-open','modal-open');document.body.style.overflow='auto';return false};
      wrapped.__v21=true;window.hideCheckout=wrapped;
    }
  }

  function guardCheckout(){
    if(typeof window.nextCheckoutStep==='function'&&!window.nextCheckoutStep.__v21){
      const fn=window.nextCheckoutStep;const wrapped=function(){if(!checkoutVisible()||!checkoutSession)return false;return fn.apply(this,arguments)};wrapped.__v21=true;window.nextCheckoutStep=wrapped;
    }
    if(typeof window.submitCheckoutOrder==='function'&&!window.submitCheckoutOrder.__v21){
      const fn=window.submitCheckoutOrder;const wrapped=function(){if(!checkoutVisible()||!checkoutSession)return false;return fn.apply(this,arguments)};wrapped.__v21=true;window.submitCheckoutOrder=wrapped;
    }
  }

  function guardAlert(){
    if(window.__VAPORIX_ALERT_V21)return;
    window.__VAPORIX_ALERT_V21=true;
    const native=window.alert;
    window.alert=function(message){
      const text=String(message||'');
      if(!checkoutVisible()&&/заполните все обязательные поля|заполните адрес доставки/i.test(text))return;
      return native.call(window,message);
    };
  }

  function profileOrders(){
    const p=$('profile');if(!p)return;
    let s=$('phOrdersSection');
    if(!s){s=document.createElement('section');s.id='phOrdersSection';s.className='ph-orders-section';s.innerHTML='<div class="ph-orders-title">Заказы</div><div id="phOrdersList"></div>';const a=p.querySelector('.profile-section-title');p.insertBefore(s,a||p.firstChild)}
    try{if(typeof window.PUFFHUB_REFRESH_ORDERS==='function')window.PUFFHUB_REFRESH_ORDERS();else if(typeof window.renderOrders==='function')window.renderOrders()}catch(e){}
  }

  function boot(){
    expandTelegram();installStyle();bindBack();bindBottomNav();bindAddToCart();patchApis();guardCheckout();guardAlert();if($('profile'))profileOrders();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('load',boot);
  [50,150,400,800,1500,3000].forEach(t=>setTimeout(boot,t));
  setInterval(()=>{installStyle();bindBack();patchApis();guardCheckout();if($('profile'))profileOrders()},1500);
})();

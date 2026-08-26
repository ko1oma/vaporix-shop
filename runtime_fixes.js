/* VAPORIX runtime hard fix V15 */
(function(){
  'use strict';
  if(window.__VAPORIX_RUNTIME_V15)return;
  window.__VAPORIX_RUNTIME_V15=true;

  const $=id=>document.getElementById(id);
  let checkoutSession=false;
  let closing=false;

  function modal(){return $('checkoutModal')}
  function isCheckoutVisible(){
    const m=modal();
    return !!(m&&m.classList.contains('show')&&!m.hasAttribute('hidden')&&m.style.visibility!=='hidden'&&m.style.pointerEvents!=='none');
  }

  function closeCheckoutHard(){
    checkoutSession=false;
    closing=false;
    const m=modal();
    if(m){
      m.classList.remove('show');
      m.setAttribute('aria-hidden','true');
      m.style.pointerEvents='none';
      m.style.visibility='hidden';
    }
    document.body.classList.remove('sheet-open','modal-open');
    document.body.style.overflow='auto';
    try{if(typeof window.syncSheetState==='function')window.syncSheetState()}catch(e){}
  }

  function cancelToCart(){
    if(closing)return;
    closing=true;
    checkoutSession=false;
    try{if(typeof window.hideCheckout==='function')window.hideCheckout()}catch(e){}
    closeCheckoutHard();
    try{if(typeof window.showCart==='function')window.showCart()}catch(e){}
    closeCheckoutHard();
  }

  document.addEventListener('click',function(e){
    const b=e.target&&e.target.closest&&e.target.closest('#checkoutModal .ph-cancel-checkout');
    if(!b)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    cancelToCart();
  },true);

  function guardApi(){
    if(typeof window.nextCheckoutStep==='function'&&!window.nextCheckoutStep.__v15){
      const fn=window.nextCheckoutStep;
      const wrapped=function(){
        if(!isCheckoutVisible()||!checkoutSession)return false;
        return fn.apply(this,arguments);
      };
      wrapped.__v15=true;
      window.nextCheckoutStep=wrapped;
    }
    if(typeof window.submitCheckoutOrder==='function'&&!window.submitCheckoutOrder.__v15){
      const fn=window.submitCheckoutOrder;
      const wrapped=function(){
        if(!isCheckoutVisible()||!checkoutSession)return false;
        return fn.apply(this,arguments);
      };
      wrapped.__v15=true;
      window.submitCheckoutOrder=wrapped;
    }
  }

  function patchShowHide(){
    if(typeof window.showCheckout==='function'&&!window.showCheckout.__v15){
      const fn=window.showCheckout;
      const wrapped=function(){
        checkoutSession=true;
        closing=false;
        const r=fn.apply(this,arguments);
        checkoutSession=true;
        const m=modal();
        if(m){
          m.removeAttribute('aria-hidden');
          m.style.pointerEvents='auto';
          m.style.visibility='visible';
        }
        guardApi();
        return r;
      };
      wrapped.__v15=true;
      window.showCheckout=wrapped;
      window.showCartCheckout=wrapped;
    }
    if(typeof window.hideCheckout==='function'&&!window.hideCheckout.__v15){
      const fn=window.hideCheckout;
      const wrapped=function(){
        checkoutSession=false;
        closing=false;
        try{fn.apply(this,arguments)}catch(e){}
        closeCheckoutHard();
        return false;
      };
      wrapped.__v15=true;
      window.hideCheckout=wrapped;
    }
    guardApi();
  }

  /* Any bottom navigation action means checkout is no longer active. */
  document.addEventListener('click',function(e){
    const nav=e.target&&e.target.closest&&e.target.closest(
      '#homeNav,#cartNav,#infoNav,#profileNav,'+
      '[data-nav],.bottom-nav button,.bottom-nav a,.bottom-navigation button,.bottom-navigation a,'+
      'nav button,nav a'
    );
    if(!nav)return;
    checkoutSession=false;
    closing=false;
    const m=modal();
    if(m&&m.classList.contains('show'))closeCheckoutHard();
  },true);

  /* A validation alert is valid only while checkout is visibly open.
     This is intentionally unconditional: another checkout script can close
     the modal without knowing this runtime's local session flag. */
  const nativeAlert=window.alert;
  if(!window.__VAPORIX_ALERT_V15){
    window.__VAPORIX_ALERT_V15=true;
    window.alert=function(message){
      const text=String(message||'');
      if(!isCheckoutVisible()&&/заполните все обязательные поля|заполните адрес доставки/i.test(text))return;
      return nativeAlert.call(window,message);
    };
  }

  function profileOrders(){
    const p=$('profile');
    if(!p)return;
    let s=$('phOrdersSection');
    if(!s){
      s=document.createElement('section');
      s.id='phOrdersSection';
      s.className='ph-orders-section';
      s.innerHTML='<div class="ph-orders-title">Заказы</div><div id="phOrdersList"></div>';
      const anchor=p.querySelector('.profile-section-title');
      p.insertBefore(s,anchor||p.firstChild);
    }
    try{
      if(typeof window.PUFFHUB_REFRESH_ORDERS==='function')window.PUFFHUB_REFRESH_ORDERS();
      else if(typeof window.renderOrders==='function')window.renderOrders();
    }catch(e){}
  }

  function installCheckoutScroll(){
    const m=modal();
    if(!m)return;
    const box=m.querySelector('.checkout-box');
    if(!box)return;
    box.style.overflowX='hidden';
    box.style.overflowY='scroll';
    box.style.webkitOverflowScrolling='touch';
    box.style.touchAction='pan-y';
    box.style.overscrollBehaviorY='contain';
    box.style.maxHeight='100dvh';
    box.style.height='100dvh';
  }

  const st=document.createElement('style');
  st.id='vaporix-runtime-v15-style';
  st.textContent=`
    #checkoutModal:not(.show){pointer-events:none!important;visibility:hidden!important}
    #checkoutModal .checkout-box{overflow-x:hidden!important;overflow-y:scroll!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important;overscroll-behavior-y:contain!important}
    #checkoutModal .ph-cancel-checkout{position:relative!important;z-index:9999!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important}
    .ph-orders-section{display:block!important;width:100%!important;margin:0 0 22px!important;padding:16px!important;border:1px solid #4a4a52!important;border-radius:20px!important;background:var(--panel,#171719)!important;box-sizing:border-box!important}
    .ph-orders-title{display:block!important;margin:0 0 12px!important;font-size:20px!important;font-weight:900!important}
    #phOrdersList{display:block!important;width:100%!important}
  `;
  document.head.appendChild(st);

  function boot(){
    patchShowHide();
    profileOrders();
    installCheckoutScroll();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  window.addEventListener('load',boot);
  [100,500,1000,2000,4000].forEach(t=>setTimeout(boot,t));
  setInterval(()=>{patchShowHide();installCheckoutScroll();if($('profile'))profileOrders()},1500);
})();

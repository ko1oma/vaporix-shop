/* VAPORIX critical UI fix — one authoritative interaction layer */
(function(){
  'use strict';
  if(window.__VAPORIX_CRITICAL_UI_V1)return;
  window.__VAPORIX_CRITICAL_UI_V1=true;

  function expandTelegram(){
    try{
      const tg=window.Telegram&&window.Telegram.WebApp;
      if(tg&&typeof tg.expand==='function')tg.expand();
    }catch(e){}
  }

  function installStyle(){
    let s=document.getElementById('vaporix-critical-ui-style');
    if(!s){s=document.createElement('style');s.id='vaporix-critical-ui-style';document.head.appendChild(s)}
    s.textContent=`
      html,body{min-height:100%!important;background:#08080a!important;}

      /* CHECKOUT: one real scroll surface. No competing sheet-drag CSS. */
      #checkoutModal{
        position:fixed!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
        min-height:100%!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
        transform:none!important;
        background:var(--bg,#08080a)!important;
        z-index:1000!important;
        overscroll-behavior:contain!important;
      }
      #checkoutModal:not(.show){visibility:hidden!important;pointer-events:none!important;}
      #checkoutModal.show{visibility:visible!important;pointer-events:auto!important;}
      #checkoutModal .checkout-box{
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        max-width:none!important;
        height:100%!important;
        min-height:100%!important;
        max-height:none!important;
        margin:0!important;
        padding:22px 16px calc(42px + env(safe-area-inset-bottom))!important;
        box-sizing:border-box!important;
        overflow-x:hidden!important;
        overflow-y:auto!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior-y:contain!important;
        touch-action:pan-y!important;
        transform:none!important;
        border-radius:0!important;
        transition:none!important;
        scroll-behavior:auto!important;
      }
      #checkoutModal .checkout-box>*{touch-action:pan-y;}
      #checkoutModal input,#checkoutModal select,#checkoutModal textarea,#checkoutModal button{touch-action:manipulation!important;}

      /* Never glue the two bottom actions together. */
      #checkoutModal .ph-cancel-checkout,
      #checkoutModal .ph-back{display:block!important;width:100%!important;box-sizing:border-box!important;}
      #checkoutModal .ph-cancel-checkout{margin-top:12px!important;}
      #checkoutModal .ph-next{margin-top:12px!important;display:block!important;position:relative!important;z-index:20!important;}

      /* Product action must be a real hit target on iOS. */
      .grid .card-actions,.grid .add-cart{
        position:relative!important;
        z-index:20!important;
        pointer-events:auto!important;
        touch-action:manipulation!important;
      }
      .grid .add-cart{cursor:pointer!important;-webkit-tap-highlight-color:transparent!important;}
    `;
  }

  function hardCloseCheckout(){
    const m=document.getElementById('checkoutModal');
    if(!m)return;
    m.classList.remove('show');
    m.setAttribute('aria-hidden','true');
    m.style.pointerEvents='none';
    m.style.visibility='hidden';
    document.body.classList.remove('sheet-open','modal-open');
    document.body.style.overflow='auto';
    try{if(typeof window.syncSheetState==='function')window.syncSheetState()}catch(e){}
    try{if(typeof window.showCart==='function')window.showCart()}catch(e){}
  }

  function bindCheckoutBack(){
    const m=document.getElementById('checkoutModal');
    if(!m||m.__criticalBack)return;
    m.__criticalBack=true;
    m.addEventListener('click',function(e){
      const b=e.target&&e.target.closest&&e.target.closest('.ph-cancel-checkout');
      if(!b)return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      hardCloseCheckout();
    },true);
  }

  function bindAddButtons(){
    if(document.__criticalAddButtons)return;
    document.__criticalAddButtons=true;
    let lastTouchTime=0;
    const handled=new WeakSet();

    function run(btn){
      if(!btn||handled.has(btn))return;
      handled.add(btn);
      const inline=btn.getAttribute('onclick')||'';
      const m=inline.match(/addWithQty\((\d+)\)/);
      if(!m)return;
      const i=Number(m[1]);
      if(typeof window.addWithQty!=='function')return;
      try{window.addWithQty(i)}catch(e){console.error('VAPORIX add-to-cart failed',e)}
      setTimeout(()=>handled.delete(btn),450);
    }

    document.addEventListener('touchend',function(e){
      const btn=e.target&&e.target.closest&&e.target.closest('.grid .add-cart');
      if(!btn)return;
      lastTouchTime=Date.now();
      run(btn);
      e.preventDefault();
      e.stopImmediatePropagation();
    },{capture:true,passive:false});

    document.addEventListener('pointerup',function(e){
      const btn=e.target&&e.target.closest&&e.target.closest('.grid .add-cart');
      if(!btn)return;
      if(Date.now()-lastTouchTime<500)return;
      run(btn);
      e.preventDefault();
      e.stopImmediatePropagation();
    },{capture:true,passive:false});

    document.addEventListener('click',function(e){
      const btn=e.target&&e.target.closest&&e.target.closest('.grid .add-cart');
      if(!btn)return;
      if(handled.has(btn)){
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },true);
  }

  function patchCheckoutApi(){
    if(typeof window.showCheckout==='function'&&!window.showCheckout.__critical){
      const original=window.showCheckout;
      const wrapped=function(){
        try{expandTelegram()}catch(e){}
        const r=original.apply(this,arguments);
        setTimeout(()=>{installStyle();bindCheckoutBack();const m=document.getElementById('checkoutModal');if(m){m.classList.add('show');m.style.visibility='visible';m.style.pointerEvents='auto'}} ,0);
        return r;
      };
      wrapped.__critical=true;
      window.showCheckout=wrapped;
      window.showCartCheckout=wrapped;
    }
  }

  function boot(){
    expandTelegram();
    installStyle();
    bindCheckoutBack();
    bindAddButtons();
    patchCheckoutApi();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('load',boot);
  [50,150,400,800,1500,3000].forEach(t=>setTimeout(boot,t));
  setInterval(()=>{installStyle();bindCheckoutBack();patchCheckoutApi()},1000);
})();

/* VAPORIX checkout controls fix V2
   The checkout renderer installs a capture listener directly on .ph-back that
   stops the event before its inline onclick can run. This file intentionally
   handles the back action at document-capture level, before the button target.
*/
(function(){
  'use strict';
  if(window.__VAPORIX_CHECKOUT_BACK_V2)return;
  window.__VAPORIX_CHECKOUT_BACK_V2=true;

  let handledButton=null;

  function isBack(el){
    return !!el?.closest?.('.checkout-modal .ph-back');
  }

  function runBack(button){
    if(!button)return false;
    const text=String(button.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    try{
      if(button.classList.contains('ph-cancel-checkout') || text.includes('вернуться к покупкам')){
        if(typeof window.cancelCheckout==='function')window.cancelCheckout();
        else if(typeof window.hideCheckout==='function')window.hideCheckout();
        return true;
      }
      if(text.includes('назад') && typeof window.prevCheckoutStep==='function'){
        window.prevCheckoutStep();
        return true;
      }
    }catch(err){console.error('VAPORIX checkout back:',err)}
    return false;
  }

  document.addEventListener('pointerup',function(e){
    const button=e.target?.closest?.('.checkout-modal .ph-back');
    if(!button)return;
    if(runBack(button)){
      handledButton=button;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  },{capture:true,passive:false});

  document.addEventListener('click',function(e){
    const button=e.target?.closest?.('.checkout-modal .ph-back');
    if(!button)return;
    if(button===handledButton){
      handledButton=null;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }
    if(runBack(button)){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  },{capture:true,passive:false});

  const style=document.createElement('style');
  style.id='vaporix-checkout-back-v2';
  style.textContent=`
    .checkout-modal .ph-back{position:relative;z-index:20;pointer-events:auto!important;cursor:pointer!important;}
    .checkout-modal .ph-back + .ph-next{position:relative;z-index:20;pointer-events:auto!important;}
  `;
  document.head.appendChild(style);
})();

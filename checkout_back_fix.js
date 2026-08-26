/* VAPORIX checkout back fix V3
   One click/tap must close checkout immediately and exactly once.
   No pointerup double handling: the old version could consume the first tap.
*/
(function(){
  'use strict';
  if(window.__VAPORIX_CHECKOUT_BACK_V3)return;
  window.__VAPORIX_CHECKOUT_BACK_V3=true;

  function closeCheckoutNow(){
    const m=document.getElementById('checkoutModal');
    if(m){
      m.classList.remove('show');
      m.setAttribute('aria-hidden','true');
      m.style.pointerEvents='none';
    }
    document.body.classList.remove('modal-open');
    document.body.style.overflow='auto';
    try{if(typeof window.syncSheetState==='function')window.syncSheetState()}catch(e){}
    try{if(typeof window.showCart==='function')window.showCart()}catch(e){}
  }

  document.addEventListener('click',function(e){
    const b=e.target?.closest?.('#checkoutModal .ph-cancel-checkout');
    if(!b)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    closeCheckoutNow();
  },{capture:true,passive:false});

  const style=document.createElement('style');
  style.id='vaporix-checkout-back-v3';
  style.textContent=`
    #checkoutModal .ph-cancel-checkout{
      position:relative!important;
      z-index:100!important;
      pointer-events:auto!important;
      touch-action:manipulation!important;
      cursor:pointer!important;
    }
  `;
  document.head.appendChild(style);
})();

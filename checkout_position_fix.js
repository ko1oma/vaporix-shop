/* VAPORIX checkout position hotfix V1
   Keep the checkout surface attached to the top of the Mini App viewport.
   The order-flow sheet was inheriting a bottom-sheet offset, leaving a large
   black area above the form on iPhone/Telegram Mini App.
*/
(function(){
  'use strict';
  if(window.__VAPORIX_CHECKOUT_POSITION_V1)return;
  window.__VAPORIX_CHECKOUT_POSITION_V1=true;

  function apply(){
    let style=document.getElementById('vaporix-checkout-position-v1');
    if(!style){
      style=document.createElement('style');
      style.id='vaporix-checkout-position-v1';
      document.head.appendChild(style);
    }
    style.textContent=`
      .checkout-modal{
        position:fixed!important;
        inset:0!important;
        top:0!important;
        right:0!important;
        bottom:0!important;
        left:0!important;
        width:100%!important;
        height:100%!important;
        margin:0!important;
        padding:0!important;
        transform:none!important;
        border-radius:0!important;
        overflow:hidden!important;
      }
      .checkout-modal .checkout-box{
        position:absolute!important;
        inset:0!important;
        top:0!important;
        left:0!important;
        right:0!important;
        bottom:0!important;
        width:100%!important;
        max-width:none!important;
        height:100%!important;
        margin:0!important;
        transform:none!important;
        border-radius:0!important;
      }
    `;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();

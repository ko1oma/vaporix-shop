/* VAPORIX checkout position hotfix V2
   The checkout must occupy the whole Mini App viewport from its very top.
   Do not inherit the cart bottom-sheet position/transform.
*/
(function(){
  'use strict';
  if(window.__VAPORIX_CHECKOUT_POSITION_V2)return;
  window.__VAPORIX_CHECKOUT_POSITION_V2=true;

  function apply(){
    let style=document.getElementById('vaporix-checkout-position-v2');
    if(!style){
      style=document.createElement('style');
      style.id='vaporix-checkout-position-v2';
      document.head.appendChild(style);
    }
    style.textContent=`
      /* The checkout is a full-screen surface, never a bottom sheet. */
      #checkoutModal,
      .checkout-modal{
        position:fixed!important;
        inset:0!important;
        top:0!important;
        right:0!important;
        bottom:0!important;
        left:0!important;
        width:100%!important;
        height:100%!important;
        min-height:100%!important;
        margin:0!important;
        padding:0!important;
        transform:none!important;
        border-radius:0!important;
        overflow:hidden!important;
        z-index:1000!important;
      }
      #checkoutModal .checkout-box,
      .checkout-modal .checkout-box{
        position:absolute!important;
        inset:0!important;
        top:0!important;
        right:0!important;
        bottom:0!important;
        left:0!important;
        width:100%!important;
        max-width:none!important;
        height:100%!important;
        min-height:100%!important;
        margin:0!important;
        transform:none!important;
        border-radius:0!important;
        box-sizing:border-box!important;
      }
    `;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();

/* VAPORIX checkout position + scroll fix V3
   Checkout is a real full-screen surface, while the inner checkout box is
   the ONLY scrolling container. This is required for iOS/Telegram Mini App.
*/
(function(){
  'use strict';
  if(window.__VAPORIX_CHECKOUT_POSITION_V3)return;
  window.__VAPORIX_CHECKOUT_POSITION_V3=true;

  function apply(){
    let style=document.getElementById('vaporix-checkout-position-v3');
    if(!style){
      style=document.createElement('style');
      style.id='vaporix-checkout-position-v3';
      document.head.appendChild(style);
    }
    style.textContent=`
      html,body{overscroll-behavior-x:none;}

      /* Full-screen checkout layer. It must not itself scroll. */
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
        height:100dvh!important;
        min-height:100%!important;
        margin:0!important;
        padding:0!important;
        transform:none!important;
        border-radius:0!important;
        overflow:hidden!important;
        z-index:1000!important;
        overscroll-behavior:contain!important;
      }

      /* The form itself is the scroll container. */
      #checkoutModal .checkout-box,
      .checkout-modal .checkout-box{
        position:absolute!important;
        top:0!important;
        right:0!important;
        bottom:0!important;
        left:0!important;
        width:100%!important;
        max-width:none!important;
        height:100%!important;
        height:100dvh!important;
        min-height:0!important;
        margin:0!important;
        transform:none!important;
        border-radius:0!important;
        box-sizing:border-box!important;
        overflow-x:hidden!important;
        overflow-y:auto!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior-y:contain!important;
        touch-action:pan-y!important;
        padding-bottom:calc(34px + env(safe-area-inset-bottom) + 24px)!important;
      }

      /* Do not let hidden checkout intercept taps. */
      #checkoutModal:not(.show){
        pointer-events:none!important;
        visibility:hidden!important;
      }
      #checkoutModal.show{
        pointer-events:auto!important;
        visibility:visible!important;
      }

      /* Inputs must remain native-touch friendly on iOS. */
      #checkoutModal input,
      #checkoutModal select,
      #checkoutModal textarea,
      #checkoutModal button{
        touch-action:manipulation;
      }
    `;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  window.addEventListener('load',apply);
})();

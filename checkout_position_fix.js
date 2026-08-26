/* VAPORIX checkout position + scroll fix V4
   The checkout is a real full-screen surface. On iOS/Telegram we use a
   dedicated scroll container plus a small touch fallback so the form can
   always be dragged vertically even when the Mini App host captures gestures.
*/
(function(){
  'use strict';
  if(window.__VAPORIX_CHECKOUT_POSITION_V4)return;
  window.__VAPORIX_CHECKOUT_POSITION_V4=true;

  function apply(){
    let style=document.getElementById('vaporix-checkout-position-v4');
    if(!style){
      style=document.createElement('style');
      style.id='vaporix-checkout-position-v4';
      document.head.appendChild(style);
    }
    style.textContent=`
      html,body{overscroll-behavior-x:none;}

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
        min-height:0!important;
        margin:0!important;
        padding:0!important;
        transform:none!important;
        border-radius:0!important;
        overflow:hidden!important;
        z-index:1000!important;
        overscroll-behavior:contain!important;
      }

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
        overflow-y:scroll!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior-y:contain!important;
        touch-action:pan-y!important;
        padding-bottom:calc(34px + env(safe-area-inset-bottom) + 36px)!important;
        scrollbar-width:none!important;
      }
      #checkoutModal .checkout-box::-webkit-scrollbar{display:none!important;}

      #checkoutModal:not(.show){
        pointer-events:none!important;
        visibility:hidden!important;
      }
      #checkoutModal.show{
        pointer-events:auto!important;
        visibility:visible!important;
      }

      #checkoutModal input,
      #checkoutModal select,
      #checkoutModal textarea,
      #checkoutModal button{
        touch-action:manipulation;
      }
    `;
  }

  function installTouchScroll(){
    const box=document.querySelector('#checkoutModal.show .checkout-box');
    if(!box||box.__v4TouchScroll)return;
    box.__v4TouchScroll=true;

    let startY=0;
    let startScroll=0;
    let dragging=false;
    let moved=false;

    const interactive=el=>!!(el&&el.closest&&el.closest('input,select,textarea,button,a,[contenteditable="true"]'));

    box.addEventListener('touchstart',e=>{
      if(!e.touches||e.touches.length!==1||interactive(e.target)){dragging=false;return;}
      startY=e.touches[0].clientY;
      startScroll=box.scrollTop;
      dragging=true;
      moved=false;
    },{capture:true,passive:true});

    box.addEventListener('touchmove',e=>{
      if(!dragging||!e.touches||e.touches.length!==1)return;
      const y=e.touches[0].clientY;
      const dy=startY-y;
      if(Math.abs(dy)<4)return;
      moved=true;
      box.scrollTop=startScroll+dy;
      if(e.cancelable)e.preventDefault();
    },{capture:true,passive:false});

    box.addEventListener('touchend',()=>{dragging=false;}, {capture:true,passive:true});
    box.addEventListener('touchcancel',()=>{dragging=false;}, {capture:true,passive:true});

    box.addEventListener('click',e=>{
      if(moved){
        e.preventDefault();
        e.stopPropagation();
        moved=false;
      }
    },true);
  }

  function boot(){
    apply();
    installTouchScroll();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  window.addEventListener('load',boot);
  [50,150,400,800,1500,3000].forEach(t=>setTimeout(boot,t));
  setInterval(installTouchScroll,1000);
})();

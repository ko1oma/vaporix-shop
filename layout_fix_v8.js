(function(){
'use strict';
/* VAPORIX V8: fixed checkout overlay must live directly under body.
   A transformed/narrow app wrapper can otherwise trap position:fixed and make
   the checkout sheet render only on the left half of the Telegram viewport. */
if(window.__VAPORIX_LAYOUT_FIX_V8)return;
window.__VAPORIX_LAYOUT_FIX_V8=true;

function moveOverlayToBody(id){
  const el=document.getElementById(id);
  if(!el||!document.body)return;
  if(el.parentElement!==document.body)document.body.appendChild(el);
}

function repair(){
  moveOverlayToBody('checkoutModal');
  moveOverlayToBody('orderDetailModal');
  moveOverlayToBody('vaporixEmptyCartNotice');
  const m=document.getElementById('checkoutModal');
  if(m){
    m.style.setProperty('position','fixed','important');
    m.style.setProperty('left','0','important');
    m.style.setProperty('right','0','important');
    m.style.setProperty('top','0','important');
    m.style.setProperty('bottom','0','important');
    m.style.setProperty('width','100vw','important');
    m.style.setProperty('min-width','100vw','important');
    m.style.setProperty('max-width','100vw','important');
    m.style.setProperty('height','100dvh','important');
    m.style.setProperty('transform','none','important');
    m.style.setProperty('margin','0','important');
    m.style.setProperty('overflow','hidden','important');
    const box=m.querySelector('.checkout-box');
    if(box){
      box.style.setProperty('position','absolute','important');
      box.style.setProperty('left','0','important');
      box.style.setProperty('right','0','important');
      box.style.setProperty('top','0','important');
      box.style.setProperty('bottom','0','important');
      box.style.setProperty('width','100%','important');
      box.style.setProperty('min-width','0','important');
      box.style.setProperty('max-width','none','important');
      box.style.setProperty('height','100%','important');
      box.style.setProperty('max-height','none','important');
      box.style.setProperty('transform','none','important');
      box.style.setProperty('margin','0','important');
      box.style.setProperty('box-sizing','border-box','important');
      box.style.setProperty('overflow-x','hidden','important');
      box.style.setProperty('overflow-y','auto','important');
      box.style.setProperty('-webkit-overflow-scrolling','touch','important');
    }
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',repair,{once:true});else repair();
window.addEventListener('load',repair);
let queued=false;
new MutationObserver(function(){
  if(queued)return;
  queued=true;
  setTimeout(function(){queued=false;repair()},0);
}).observe(document.documentElement,{childList:true,subtree:true});
})();

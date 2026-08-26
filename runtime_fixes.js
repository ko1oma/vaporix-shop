(function(){
'use strict';
/* VAPORIX interaction hotfix V7
   - A real tap on "Добавить в корзину" works on the FIRST tap.
   - A swipe/scroll NEVER becomes a click.
   - The synthetic iOS/Telegram click after a handled pointer tap is ignored.
   - Checkout buttons keep a real visual gap.
*/
if(window.__VAPORIX_INTERACTION_V7)return;
window.__VAPORIX_INTERACTION_V7=true;

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const isAdd=el=>{
  const t=norm(el?.textContent);
  return t.includes('добавить в корзину')||t.includes('add to cart')||t.includes('додати в кошик')||t.includes('añadir al carrito')||t.includes('in den warenkorb');
};

let gesture=null;
let suppressClicksUntil=0;
let handledPointerId=null;
const MOVE_THRESHOLD=10;

function productIndexFromButton(button){
  if(!button)return -1;
  const src=button.getAttribute('onclick')||'';
  let m=src.match(/addWithQty\s*\(\s*(\d+)\s*\)/i);
  if(m)return Number(m[1]);
  const card=button.closest('.grid .card');
  if(card){
    const cards=[...document.querySelectorAll('.grid .card')];
    return cards.indexOf(card);
  }
  return -1;
}

function activateAdd(button){
  const idx=productIndexFromButton(button);
  if(idx<0)return false;
  if(typeof window.addWithQty==='function'){
    window.addWithQty(idx);
    return true;
  }
  return false;
}

document.addEventListener('pointerdown',e=>{
  const target=e.target?.closest?.('button,a,[role="button"]');
  gesture={x:e.clientX,y:e.clientY,pointerId:e.pointerId,addButton:isAdd(target)?target:null,moved:false};
},{capture:true,passive:true});

document.addEventListener('pointermove',e=>{
  if(!gesture||gesture.pointerId!==e.pointerId)return;
  if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>MOVE_THRESHOLD){
    gesture.moved=true;
    suppressClicksUntil=Date.now()+700;
  }
},{capture:true,passive:true});

document.addEventListener('pointercancel',e=>{
  if(gesture&&gesture.pointerId===e.pointerId){
    if(gesture.moved)suppressClicksUntil=Date.now()+700;
    gesture=null;
  }
},{capture:true,passive:true});

document.addEventListener('pointerup',e=>{
  if(!gesture||gesture.pointerId!==e.pointerId)return;
  const g=gesture;
  const isTap=!g.moved&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<=MOVE_THRESHOLD;
  gesture=null;
  if(!g.addButton)return;
  if(!isTap){suppressClicksUntil=Date.now()+700;return;}
  if(activateAdd(g.addButton)){
    handledPointerId=e.pointerId;
    suppressClicksUntil=Date.now()+700;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
},{capture:true,passive:false});

document.addEventListener('click',e=>{
  if(Date.now()<suppressClicksUntil){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return;
  }
  if(handledPointerId!==null){
    handledPointerId=null;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
},{capture:true,passive:false});

const style=document.createElement('style');
style.id='vaporix-interaction-v7';
style.textContent=`
  .checkout-modal .checkout-box{
    overflow-y:auto!important;
    overflow-x:hidden!important;
    -webkit-overflow-scrolling:touch!important;
    touch-action:pan-y!important;
    overscroll-behavior:contain!important;
    padding-bottom:34px!important;
  }
  .checkout-modal .ph-back{display:block!important;width:100%!important;margin:10px 0 0!important;}
  .checkout-modal .ph-back + .ph-next{display:block!important;width:100%!important;margin:14px 0 0!important;}
  .checkout-modal .ph-cancel-checkout + .ph-next{margin-top:14px!important;}
`;
document.head.appendChild(style);
})();

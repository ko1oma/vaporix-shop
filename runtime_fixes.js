(function(){
'use strict';
/* VAPORIX interaction hotfix V9
   Product taps, cart controls and checkout controls must respond to the
   first tap on iOS/Telegram Mini App. We only synthesize a click for the
   exact control that received the pointerup, then suppress that control's
   following native click so it cannot execute twice.
*/
if(window.__VAPORIX_INTERACTION_V9)return;
window.__VAPORIX_INTERACTION_V9=true;

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const isAdd=el=>{
  const t=norm(el?.textContent);
  return t.includes('добавить в корзину')||t.includes('add to cart')||t.includes('додати в кошик')||t.includes('añadir al carrito')||t.includes('in den warenkorb');
};
const isCheckoutControl=el=>!!el?.closest?.('#checkoutModal,.checkout-modal');
const isCartControl=el=>{
  if(!el?.matches?.('button,a,[role="button"]'))return false;
  if(isCheckoutControl(el))return false;
  const t=norm(el.textContent);
  const src=norm(el.getAttribute('onclick'));
  const cart=el.closest?.('[id*="cart" i],[class*="cart" i]');
  if(!cart)return false;
  return t==='×'||t==='x'||t==='✕'||t.includes('оформление заказа')||
         src.includes('cart')||src.includes('remove')||src.includes('delete')||src.includes('hide');
};

const MOVE_THRESHOLD=10;
let gesture=null;
let suppressClickButton=null;

function productIndexFromButton(button){
  if(!button)return -1;
  const src=button.getAttribute('onclick')||'';
  const m=src.match(/addWithQty\s*\(\s*(\d+)\s*\)/i);
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

function activateNativeControl(button){
  if(!button)return false;
  try{
    /* Calling the element's native click invokes its existing inline/onClick
       handler without requiring a second physical tap. */
    button.click();
    return true;
  }catch(err){
    console.error('VAPORIX control tap:',err);
    return false;
  }
}

document.addEventListener('pointerdown',e=>{
  const target=e.target?.closest?.('button,a,[role="button"]');
  gesture={
    x:e.clientX,
    y:e.clientY,
    pointerId:e.pointerId,
    addButton:isAdd(target)?target:null,
    cartButton:isCartControl(target)?target:null,
    moved:false
  };
},{capture:true,passive:true});

document.addEventListener('pointermove',e=>{
  if(!gesture||gesture.pointerId!==e.pointerId)return;
  if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>MOVE_THRESHOLD){
    gesture.moved=true;
    if(gesture.addButton||gesture.cartButton)suppressClickButton=gesture.addButton||gesture.cartButton;
  }
},{capture:true,passive:true});

document.addEventListener('pointercancel',e=>{
  if(!gesture||gesture.pointerId!==e.pointerId)return;
  if(gesture.moved)suppressClickButton=gesture.addButton||gesture.cartButton;
  gesture=null;
},{capture:true,passive:true});

document.addEventListener('pointerup',e=>{
  if(!gesture||gesture.pointerId!==e.pointerId)return;
  const g=gesture;
  gesture=null;
  if(g.moved){
    suppressClickButton=g.addButton||g.cartButton;
    return;
  }

  const target=e.target?.closest?.('button,a,[role="button"]');
  /* Prefer the control actually under the finger at pointerup. */
  const addButton=g.addButton&&target===g.addButton?g.addButton:null;
  const cartButton=g.cartButton&&target===g.cartButton?g.cartButton:null;

  if(addButton){
    if(activateAdd(addButton)){
      suppressClickButton=addButton;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }

  if(cartButton){
    if(activateNativeControl(cartButton)){
      suppressClickButton=cartButton;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
},{capture:true,passive:false});

/* Suppress only the synthetic/native click for the exact control already
   activated on pointerup. Nothing else on the page is blocked. */
document.addEventListener('click',e=>{
  if(!suppressClickButton)return;
  const target=e.target?.closest?.('button,a,[role="button"]');
  if(target!==suppressClickButton)return;
  suppressClickButton=null;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
},{capture:true,passive:false});

const style=document.createElement('style');
style.id='vaporix-interaction-v9';
style.textContent=`
  /* Checkout is a full-height page, not a bottom sheet. */
  #checkoutModal,
  .checkout-modal{
    position:fixed!important;
    inset:0!important;
    top:0!important;
    right:0!important;
    bottom:0!important;
    left:0!important;
    transform:none!important;
    margin:0!important;
    padding:0!important;
    width:100%!important;
    height:100%!important;
    overflow:hidden!important;
  }
  #checkoutModal .checkout-box,
  .checkout-modal .checkout-box{
    position:absolute!important;
    inset:0!important;
    top:0!important;
    left:0!important;
    right:0!important;
    bottom:0!important;
    transform:none!important;
    margin:0!important;
    width:100%!important;
    max-width:none!important;
    height:100%!important;
    overflow-y:auto!important;
    overflow-x:hidden!important;
    -webkit-overflow-scrolling:touch!important;
    touch-action:pan-y!important;
    overscroll-behavior:contain!important;
    box-sizing:border-box!important;
    padding-bottom:34px!important;
  }
  .checkout-modal .ph-back{display:block!important;width:100%!important;margin:10px 0 0!important;position:relative!important;z-index:30!important;pointer-events:auto!important;cursor:pointer!important;}
  .checkout-modal .ph-back + .ph-next{display:block!important;width:100%!important;margin:14px 0 0!important;position:relative!important;z-index:30!important;pointer-events:auto!important;}
  .checkout-modal .ph-cancel-checkout + .ph-next{margin-top:14px!important;}
`;
document.head.appendChild(style);
})();

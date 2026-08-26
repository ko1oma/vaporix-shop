(function(){
'use strict';
/* VAPORIX interaction hotfix V11
   Never allow a cancelled/hidden checkout flow to receive clicks from the catalog
   or bottom navigation. A stale checkout validation handler must be inert unless
   the checkout modal is actually visible.
*/
if(window.__VAPORIX_INTERACTION_V11)return;
window.__VAPORIX_INTERACTION_V11=true;

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const isAdd=el=>{
  const t=norm(el?.textContent);
  return t.includes('добавить в корзину')||t.includes('add to cart')||t.includes('додати в кошик')||t.includes('añadir al carrito')||t.includes('in den warenkorb');
};
const MOVE_THRESHOLD=10;
let gesture=null;
let suppressAddClickButton=null;

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

document.addEventListener('pointerdown',e=>{
  const target=e.target?.closest?.('button,a,[role="button"]');
  gesture={x:e.clientX,y:e.clientY,pointerId:e.pointerId,addButton:isAdd(target)?target:null,moved:false};
},{capture:true,passive:true});

document.addEventListener('pointermove',e=>{
  if(!gesture||gesture.pointerId!==e.pointerId)return;
  if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>MOVE_THRESHOLD){
    gesture.moved=true;
    if(gesture.addButton)suppressAddClickButton=gesture.addButton;
  }
},{capture:true,passive:true});

document.addEventListener('pointercancel',e=>{
  if(!gesture||gesture.pointerId!==e.pointerId)return;
  if(gesture.moved&&gesture.addButton)suppressAddClickButton=gesture.addButton;
  gesture=null;
},{capture:true,passive:true});

document.addEventListener('pointerup',e=>{
  if(!gesture||gesture.pointerId!==e.pointerId)return;
  const g=gesture;gesture=null;
  if(!g.addButton)return;
  const isTap=!g.moved&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<=MOVE_THRESHOLD;
  if(!isTap){suppressAddClickButton=g.addButton;return;}
  if(activateAdd(g.addButton)){
    suppressAddClickButton=g.addButton;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  }
},{capture:true,passive:false});

document.addEventListener('click',e=>{
  if(!suppressAddClickButton)return;
  const target=e.target?.closest?.('button,a,[role="button"]');
  if(target!==suppressAddClickButton)return;
  suppressAddClickButton=null;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
},{capture:true,passive:false});

/* Critical checkout-session guard.
   After "Вернуться к покупкам", old inline handlers must never validate the
   hidden checkout form. Only allow checkout navigation while the modal is shown. */
function checkoutIsOpen(){
  const m=document.getElementById('checkoutModal');
  return !!(m && (m.classList.contains('show') || getComputedStyle(m).display!=='none'));
}
function guardCheckoutFunctions(){
  if(typeof window.nextCheckoutStep==='function'&&!window.nextCheckoutStep.__v11guard){
    const original=window.nextCheckoutStep;
    const wrapped=function(){
      if(!checkoutIsOpen())return false;
      return original.apply(this,arguments);
    };
    wrapped.__v11guard=true;
    window.nextCheckoutStep=wrapped;
  }
  if(typeof window.submitCheckoutOrder==='function'&&!window.submitCheckoutOrder.__v11guard){
    const original=window.submitCheckoutOrder;
    const wrapped=function(){
      if(!checkoutIsOpen())return false;
      return original.apply(this,arguments);
    };
    wrapped.__v11guard=true;
    window.submitCheckoutOrder=wrapped;
  }
}
guardCheckoutFunctions();
window.addEventListener('load',guardCheckoutFunctions,{once:false});

/* Suppress only the stale validation alert outside checkout. Real validation
   messages remain untouched while the checkout modal is open. */
const nativeAlert=window.alert;
window.alert=function(message){
  const text=String(message??'');
  if(!checkoutIsOpen() && /заполните все обязательные поля/i.test(text))return;
  return nativeAlert.call(window,message);
};

/* If any legacy code calls cancelCheckout/hideCheckout, explicitly terminate
   the checkout session before returning to the storefront. */
function hardCloseCheckout(){
  const m=document.getElementById('checkoutModal');
  if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true');}
  document.body.style.overflow='auto';
  document.body.classList.remove('modal-open');
}
const previousCancel=window.cancelCheckout;
window.cancelCheckout=function(){
  hardCloseCheckout();
  try{if(typeof window.hideCheckout==='function')window.hideCheckout()}catch(e){}
  hardCloseCheckout();
  try{if(typeof window.showCart==='function')window.showCart()}catch(e){}
  guardCheckoutFunctions();
};

const style=document.createElement('style');
style.id='vaporix-interaction-v11';
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
  .ph-orders-section{display:block!important;width:100%!important;margin:0 0 22px!important;padding:0!important;}
  .ph-orders-title{display:block!important;margin:0 0 12px!important;font-weight:850!important;}
  #phOrdersList{display:block!important;width:100%!important;}
  .ph-order-card{display:block!important;position:relative!important;pointer-events:auto!important;}
`;
document.head.appendChild(style);
})();

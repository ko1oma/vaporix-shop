(function(){
'use strict';
/* VAPORIX interaction hotfix V6
   - A swipe/scroll must never activate a product button.
   - A genuine tap/click on "Добавить в корзину" is handled immediately on pointerup.
   - This takes precedence over the older delegated click handlers.
   - Checkout buttons get a real visual gap on mobile.
*/
if(window.__VAPORIX_INTERACTION_V6)return;
window.__VAPORIX_INTERACTION_V6=true;

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const isAdd=el=>{const t=norm(el?.textContent);return t.includes('добавить в корзину')||t.includes('add to cart')||t.includes('додати в кошик')||t.includes('añadir al carrito')||t.includes('in den warenkorb')};
let down=null,moved=false;
const THRESHOLD=14;

document.addEventListener('pointerdown',e=>{
  const b=e.target?.closest?.('button,a,[role="button"]');
  down={x:e.clientX,y:e.clientY,button:isAdd(b)?b:null,pointerId:e.pointerId};
  moved=false;
},{capture:true,passive:true});

document.addEventListener('pointermove',e=>{
  if(!down)return;
  if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>THRESHOLD)moved=true;
},{capture:true,passive:true});

document.addEventListener('pointercancel',()=>{down=null;moved=true},{capture:true,passive:true});

document.addEventListener('pointerup',e=>{
  if(!down)return;
  const b=down.button;
  const wasTap=!moved && Math.hypot(e.clientX-down.x,e.clientY-down.y)<=THRESHOLD;
  down=null;
  if(!b||!wasTap)return;
  const fn=window.openFlavorChooser;
  if(typeof fn!=='function')return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  window.__VAPORIX_ADD_POINTER_HANDLED=true;
  let idx=-1;
  const card=b.closest('.grid .card');
  const src=b.getAttribute('onclick')||'';
  const m=src.match(/addWithQty\s*\(\s*(\d+)\s*\)/);
  if(m)idx=Number(m[1]);
  else if(card)idx=[...document.querySelectorAll('.grid .card')].indexOf(card);
  if(idx>=0)fn(idx);
},{capture:true,passive:false});

document.addEventListener('click',e=>{
  if(window.__VAPORIX_ADD_POINTER_HANDLED){
    window.__VAPORIX_ADD_POINTER_HANDLED=false;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  }
},{capture:true});

const style=document.createElement('style');
style.id='vaporix-interaction-v6';
style.textContent=`
  .checkout-modal .ph-back + .ph-next{margin-top:14px!important;}
  .checkout-modal .ph-back{margin-bottom:0!important;}
  .ph-cancel-checkout + .ph-next{margin-top:14px!important;}
`;
document.head.appendChild(style);
})();

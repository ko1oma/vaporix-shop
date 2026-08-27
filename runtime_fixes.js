(function(){
'use strict';

if(window.__VAPORIX_RUNTIME_REPAIR_V9)return;
window.__VAPORIX_RUNTIME_REPAIR_V9=true;

const $=id=>document.getElementById(id);
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

function liveCart(){
  try{if(typeof cart!=='undefined' && Array.isArray(cart)) return cart}catch(e){}
  return Array.isArray(window.cart)?window.cart:[];
}
function syncCartBridge(){
  try{if(typeof cart!=='undefined' && Array.isArray(cart)) window.cart=cart}catch(e){}
  return liveCart();
}
function cartHasItems(){return syncCartBridge().some(x=>x&&Number(x.qty||0)>0&&x.product)}

function checkoutModal(){return $('checkoutModal')}
function hardHideCheckout(){
  const m=checkoutModal();
  if(!m)return;
  m.classList.remove('show');
  m.setAttribute('aria-hidden','true');
  m.style.removeProperty('display');
  m.style.removeProperty('visibility');
  document.body.classList.remove('modal-open','vaporix-checkout-open');
  document.body.style.removeProperty('overflow');
}
function hardShowCheckout(){
  const m=checkoutModal();
  if(!m)return;
  m.hidden=false;
  m.removeAttribute('aria-hidden');
  m.classList.add('show');
  m.style.removeProperty('display');
  m.style.removeProperty('visibility');
  document.body.classList.add('vaporix-checkout-open');
  document.body.style.overflow='hidden';
}

function installCSS(){
  if($('vaporix-runtime-repair-v9'))return;
  const s=document.createElement('style');s.id='vaporix-runtime-repair-v9';
  s.textContent=`
#checkoutModal{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;transform:none!important;margin:0!important;overflow:hidden!important}
#checkoutModal:not(.show){display:none!important;visibility:hidden!important;pointer-events:none!important}
#checkoutModal.show{display:block!important;visibility:visible!important;pointer-events:auto!important}
#checkoutModal .checkout-box{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-width:0!important;max-width:none!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;padding:22px 16px calc(34px + env(safe-area-inset-bottom))!important}
#checkoutModal .ph-form-card,#checkoutModal .ph-review-card{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;overflow:visible!important}
#checkoutModal .ph-checkout-actions{display:flex!important;flex-direction:column!important;gap:12px!important;width:100%!important;margin:16px 0 4px!important;padding:0!important;box-sizing:border-box!important;position:static!important}
#checkoutModal .ph-checkout-actions>*{position:static!important;display:block!important;float:none!important;clear:both!important;width:100%!important;min-width:0!important;max-width:100%!important;margin:0!important;transform:none!important;box-sizing:border-box!important}
#checkoutModal .ph-back,#checkoutModal .ph-next{position:static!important;display:block!important;float:none!important;width:100%!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;pointer-events:auto!important;touch-action:manipulation!important}
#checkoutModal .ph-back{background:#21172d!important;border:1px solid #7045a5!important;color:#d3b6ff!important}
#checkoutModal .ph-next{height:60px!important}
#checkoutModal #phCheckoutAction:disabled{opacity:.55!important;pointer-events:auto!important}
#checkoutModal input,#checkoutModal select{max-width:100%!important;box-sizing:border-box!important}
#orderDetailModal .ph-order-detail-box{width:min(620px,94vw)!important;height:min(90dvh,760px)!important;max-height:90dvh!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;box-sizing:border-box!important;padding:17px!important}
#orderDetailModal #orderDetailContent{min-height:0!important;flex:1 1 auto!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;padding-bottom:4px!important}
#orderDetailModal .ph-detail-back{flex:0 0 auto!important;width:100%!important;height:54px!important;margin:12px 0 0!important;border-radius:16px!important;background:linear-gradient(100deg,#3b1a67,#5d2a9d)!important;border:1px solid #8d5ad2!important;color:#eadbff!important;font-size:17px!important;font-weight:900!important;position:static!important;box-sizing:border-box!important;touch-action:manipulation!important}
#phOrdersSection{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;margin:28px 0 24px!important;clear:both!important}
#phOrdersSection .ph-orders-title{display:block!important;margin:0 0 12px!important}
#phOrdersSection .ph-order-card{display:grid!important;grid-template-columns:52px minmax(0,1fr) auto!important;grid-template-rows:auto auto!important;column-gap:10px!important;row-gap:6px!important;width:100%!important;min-width:0!important;max-width:100%!important;min-height:82px!important;box-sizing:border-box!important;margin:0 0 10px!important;padding:11px!important;overflow:hidden!important;text-align:left!important;background:var(--panel,#151517)!important;border:1px solid var(--line,#3b3b43)!important;border-radius:18px!important;color:var(--text,#fff)!important}
#phOrdersSection .ph-order-top{display:contents!important}
#phOrdersSection .ph-order-id{grid-column:2!important;grid-row:1!important;min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;font-size:12px!important;line-height:1.25!important;font-weight:900!important}
#phOrdersSection .ph-order-total{grid-column:3!important;grid-row:1!important;white-space:nowrap!important;font-size:14px!important;line-height:1.25!important;font-weight:950!important;color:#9d68ff!important}
#phOrdersSection .ph-order-meta{grid-column:2!important;grid-row:2!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;justify-content:flex-start!important;gap:3px 8px!important;min-width:0!important;margin:0!important;font-size:10px!important;line-height:1.2!important;color:var(--muted,#999)!important}
#phOrdersSection .ph-order-meta span{min-width:0!important;max-width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#phOrdersSection .ph-order-status{grid-column:3!important;grid-row:2!important;justify-self:end!important;align-self:end!important;margin:0!important;padding:5px 8px!important;font-size:9px!important;line-height:1!important;white-space:nowrap!important}
#phOrdersSection .ph-order-sync{display:none!important}
#phOrdersSection .ph-order-products-preview{grid-column:1!important;grid-row:1 / span 2!important;display:flex!important;align-items:center!important;justify-content:center!important;width:52px!important;height:56px!important;margin:0!important;min-width:0!important;overflow:hidden!important}
#phOrdersSection .ph-order-thumb{width:46px!important;height:54px!important;max-width:46px!important;max-height:54px!important;flex:0 0 auto!important;border-radius:9px!important;object-fit:contain!important}
@media(max-width:520px){#phOrdersSection .ph-order-card{grid-template-columns:50px minmax(0,1fr) auto!important;column-gap:9px!important;padding:10px!important}#phOrdersSection .ph-order-products-preview{width:50px!important;height:54px!important}#phOrdersSection .ph-order-thumb{width:44px!important;height:52px!important}}
`;
  document.head.appendChild(s);
}

function moveOrdersBelowSettings(){
  const p=$('profile'),orders=$('phOrdersSection');
  if(!p||!orders)return;
  const title=q('.profile-section-title',p);
  if(!title)return;
  title.insertAdjacentElement('afterend',orders);
}

function normalizeCheckout(){
  const m=checkoutModal();
  if(!m||!m.classList.contains('show'))return;
  syncCartBridge();
  const box=q('.checkout-box',m);if(!box)return;
  let wrap=q(':scope > .ph-checkout-actions',box);
  const buttons=qa(':scope > .ph-back, :scope > .ph-next',box);
  if(buttons.length){
    if(!wrap){wrap=document.createElement('div');wrap.className='ph-checkout-actions';box.appendChild(wrap)}
    buttons.forEach(b=>wrap.appendChild(b));
  }
  const action=$('phCheckoutAction');
  if(action){
    const canOrder=cartHasItems();
    action.disabled=!canOrder;
    if(canOrder){action.removeAttribute('aria-disabled');action.title=''}
    else{action.setAttribute('aria-disabled','true');action.title='Добавьте товар в корзину'}
  }
}

function addOrderDetailBack(){
  const box=q('#orderDetailModal .ph-order-detail-box'),content=$('orderDetailContent');
  if(!box||!content)return;
  let b=q('.ph-detail-back',box);
  if(!b){
    b=document.createElement('button');b.type='button';b.className='ph-detail-back';b.textContent='Назад';
    b.onclick=e=>{e.preventDefault();e.stopPropagation();if(typeof window.closeOrderDetail==='function')window.closeOrderDetail()};
    box.appendChild(b);
  }
}

function wrapOnce(name,marker,fn){
  const old=window[name];
  if(typeof old!=='function'||old[marker])return false;
  const wrapped=fn(old);wrapped[marker]=true;window[name]=wrapped;return true;
}

function installFunctionGuards(){
  wrapOnce('showCheckout','__vaporixShowCheckoutV9',old=>function(){
    syncCartBridge();
    if(!cartHasItems())return false;
    hardShowCheckout();
    return old.apply(this,arguments);
  });
  wrapOnce('nextCheckoutStep','__vaporixNextCheckoutV9',old=>function(){
    syncCartBridge();
    if(!cartHasItems())return false;
    return old.apply(this,arguments);
  });
  wrapOnce('submitCheckoutOrder','__vaporixSubmitCheckoutV9',old=>async function(){
    const c=syncCartBridge();
    if(!c.some(x=>x&&Number(x.qty||0)>0&&x.product))return false;
    const btn=$('phCheckoutAction');
    if(btn){btn.disabled=true;btn.setAttribute('aria-busy','true')}
    try{return await old.apply(this,arguments)}
    finally{if(btn){btn.removeAttribute('aria-busy');if(cartHasItems())btn.disabled=false}}
  });
  wrapOnce('showProfile','__vaporixShowProfileV9',old=>function(){
    hardHideCheckout();
    const r=old.apply(this,arguments);
    setTimeout(()=>{hardHideCheckout();moveOrdersBelowSettings()},0);
    setTimeout(()=>{hardHideCheckout();moveOrdersBelowSettings()},100);
    setTimeout(()=>{hardHideCheckout();moveOrdersBelowSettings()},350);
    return r;
  });
  wrapOnce('openOrderDetailById','__vaporixDetailV9',old=>function(){
    hardHideCheckout();
    const r=old.apply(this,arguments);
    setTimeout(addOrderDetailBack,0);
    return r;
  });
  wrapOnce('hideCheckout','__vaporixHideCheckoutV9',old=>function(){
    const r=old.apply(this,arguments);
    hardHideCheckout();
    return r;
  });
}

function installNavigationSafety(){
  document.addEventListener('click',function(e){
    const t=e.target.closest&&e.target.closest('[onclick]');
    if(!t)return;
    const code=t.getAttribute('onclick')||'';
    if(/\bshowProfile\s*\(/.test(code))hardHideCheckout();
  },true);
}

function installButtonSafety(){
  if(window.__VAPORIX_BUTTON_SAFETY_V9)return;
  window.__VAPORIX_BUTTON_SAFETY_V9=true;
  document.addEventListener('click',function(e){
    const t=e.target.closest&&e.target.closest('#phCheckoutAction');
    if(!t)return;
    syncCartBridge();
    if(!cartHasItems()){
      e.preventDefault();e.stopImmediatePropagation();
      t.disabled=true;
      return;
    }
    t.disabled=false;
  },true);
}

function boot(){
  syncCartBridge();
  installCSS();
  installFunctionGuards();
  installNavigationSafety();
  installButtonSafety();
  moveOrdersBelowSettings();
  normalizeCheckout();
  if($('orderDetailModal')?.classList.contains('show'))addOrderDetailBack();
  if(!checkoutModal()?.classList.contains('show'))hardHideCheckout();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',boot);
let scheduled=false;
const observer=new MutationObserver(()=>{
  if(scheduled)return;scheduled=true;
  setTimeout(()=>{scheduled=false;boot()},40);
});
observer.observe(document.documentElement,{childList:true,subtree:true});
})();

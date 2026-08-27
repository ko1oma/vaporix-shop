(function(){
'use strict';

/* VAPORIX UI repair layer V7. Keep the legacy storefront/order engine intact and repair only its runtime UI. */
if(window.__VAPORIX_RUNTIME_REPAIR_V7)return;
window.__VAPORIX_RUNTIME_REPAIR_V7=true;

const $=id=>document.getElementById(id);
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

function liveCart(){
  try{if(typeof cart!=='undefined'&&Array.isArray(cart))return cart}catch(e){}
  try{if(Array.isArray(window.cart))return window.cart}catch(e){}
  return [];
}
function cartHasItems(){return liveCart().some(x=>x&&Number(x.qty||0)>0)}
function checkoutOpen(){
  const m=$('checkoutModal');
  if(!m)return false;
  const cs=getComputedStyle(m);
  return m.classList.contains('show')&&cs.display!=='none'&&cs.visibility!=='hidden';
}
function hideEmptyNotice(){const n=$('vaporixEmptyCartNotice');if(n)n.classList.remove('show');document.body.classList.remove('vaporix-empty-notice-open')}
function emptyNotice(){
  let n=$('vaporixEmptyCartNotice');
  if(!n){
    n=document.createElement('div');n.id='vaporixEmptyCartNotice';
    n.innerHTML='<div class="vaporix-empty-box"><div class="vaporix-empty-icon">🛒</div><div class="vaporix-empty-text">Сначала добавьте товар в корзину</div><button type="button">OK</button></div>';
    document.body.appendChild(n);
    q('button',n).addEventListener('click',function(e){e.preventDefault();e.stopPropagation();hideEmptyNotice()},{passive:false});
  }
  n.classList.add('show');document.body.classList.add('vaporix-empty-notice-open');
}

function installCSS(){
  if($('vaporix-runtime-repair-v7'))return;
  const s=document.createElement('style');s.id='vaporix-runtime-repair-v7';
  s.textContent=`
#checkoutModal,.checkout-modal{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;transform:none!important;margin:0!important;box-sizing:border-box!important;overflow:hidden!important}
#checkoutModal .checkout-box,.checkout-modal .checkout-box{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;max-width:none!important;max-height:none!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;padding:24px 16px calc(36px + env(safe-area-inset-bottom))!important}
#checkoutModal #checkoutSummary,.checkout-modal #checkoutSummary{width:100%!important;min-width:0!important;box-sizing:border-box!important}
#checkoutModal .ph-form-card,#checkoutModal .ph-review-card,.checkout-modal .ph-form-card,.checkout-modal .ph-review-card{width:100%!important;max-width:100%!important;box-sizing:border-box!important;overflow:visible!important}
#checkoutModal .ph-checkout-actions,.checkout-modal .ph-checkout-actions{display:flex!important;flex-direction:column!important;gap:12px!important;width:100%!important;margin:16px 0 0!important;padding:0 0 4px!important;box-sizing:border-box!important;position:static!important}
#checkoutModal .ph-checkout-actions>*{flex:0 0 auto!important;position:static!important;width:100%!important;min-width:0!important;max-width:100%!important;margin:0!important;transform:none!important}
#checkoutModal .ph-back,#checkoutModal .ph-next,.checkout-modal .ph-back,.checkout-modal .ph-next{position:static!important;display:block!important;width:100%!important;min-width:0!important;max-width:100%!important;margin:0!important;transform:none!important;box-sizing:border-box!important;pointer-events:auto!important;touch-action:manipulation!important}
#checkoutModal .ph-back,#checkoutModal .ph-cancel-checkout{background:#21172d!important;border:1px solid #7045a5!important;color:#d3b6ff!important}
#checkoutModal .ph-next{height:60px!important}
#checkoutModal input,#checkoutModal select,.checkout-modal input,.checkout-modal select{max-width:100%!important;box-sizing:border-box!important}
#orderDetailModal .ph-order-detail-box{width:min(620px,94vw)!important;height:min(90dvh,760px)!important;max-height:90dvh!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;box-sizing:border-box!important;padding:17px!important}
#orderDetailModal #orderDetailContent{min-height:0!important;flex:1 1 auto!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;padding-bottom:4px!important}
#orderDetailModal .ph-detail-back{flex:0 0 auto!important;width:100%!important;height:54px!important;margin:12px 0 0!important;border-radius:16px!important;background:linear-gradient(100deg,#3b1a67,#5d2a9d)!important;border:1px solid #8d5ad2!important;color:#eadbff!important;font-size:17px!important;font-weight:900!important;position:static!important;box-sizing:border-box!important;touch-action:manipulation!important}
#profile{padding-bottom:calc(118px + env(safe-area-inset-bottom))!important;box-sizing:border-box!important;overflow-x:hidden!important}
#phOrdersSection{display:block!important;width:100%!important;box-sizing:border-box!important;margin:28px 0 24px!important;clear:both!important}
#phOrdersSection .ph-orders-title{display:block!important;margin:0 0 12px!important}
#phOrdersSection .ph-order-card{display:grid!important;grid-template-columns:56px minmax(0,1fr) auto!important;grid-template-rows:auto auto!important;column-gap:12px!important;row-gap:7px!important;width:100%!important;min-width:0!important;max-width:100%!important;min-height:84px!important;box-sizing:border-box!important;margin:0 0 10px!important;padding:12px!important;overflow:hidden!important;text-align:left!important;background:var(--panel,#151517)!important;border:1px solid var(--line,#3b3b43)!important;border-radius:18px!important;color:var(--text,#fff)!important}
#phOrdersSection .ph-order-top{display:contents!important}
#phOrdersSection .ph-order-id{grid-column:2!important;grid-row:1!important;min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;font-size:13px!important;line-height:1.25!important;font-weight:900!important}
#phOrdersSection .ph-order-total{grid-column:3!important;grid-row:1!important;white-space:nowrap!important;font-size:15px!important;line-height:1.25!important;font-weight:950!important;color:#9d68ff!important}
#phOrdersSection .ph-order-meta{grid-column:2!important;grid-row:2!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;justify-content:flex-start!important;gap:3px 10px!important;min-width:0!important;margin:0!important;font-size:10px!important;line-height:1.25!important;color:var(--muted,#999)!important}
#phOrdersSection .ph-order-meta span{min-width:0!important;max-width:100%!important;white-space:nowrap!important}
#phOrdersSection .ph-order-status{grid-column:3!important;grid-row:2!important;justify-self:end!important;align-self:end!important;margin:0!important;padding:5px 9px!important;font-size:10px!important;line-height:1!important;white-space:nowrap!important}
#phOrdersSection .ph-order-sync{display:none!important}
#phOrdersSection .ph-order-products-preview{grid-column:1!important;grid-row:1 / span 2!important;display:flex!important;align-items:center!important;justify-content:center!important;width:56px!important;height:60px!important;margin:0!important;min-width:0!important;overflow:hidden!important}
#phOrdersSection .ph-order-thumb{width:50px!important;height:58px!important;max-width:50px!important;max-height:58px!important;flex:0 0 auto!important;border-radius:10px!important;object-fit:contain!important}
@media(max-width:520px){#phOrdersSection .ph-order-card{grid-template-columns:54px minmax(0,1fr) auto!important;column-gap:10px!important;padding:11px!important}#phOrdersSection .ph-order-products-preview{width:54px!important;height:58px!important}#phOrdersSection .ph-order-thumb{width:48px!important;height:56px!important}#phOrdersSection .ph-order-id{font-size:12px!important}#phOrdersSection .ph-order-total{font-size:14px!important}}
#vaporixEmptyCartNotice{position:fixed!important;inset:0!important;z-index:5000!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;background:rgba(0,0,0,.55)!important;opacity:0!important;pointer-events:none!important;transition:opacity .12s ease!important}
#vaporixEmptyCartNotice.show{opacity:1!important;pointer-events:auto!important}
.vaporix-empty-box{width:min(390px,calc(100vw - 40px));padding:24px;border-radius:24px;background:#242428;border:1px solid #55515f;box-shadow:0 25px 80px rgba(0,0,0,.65);text-align:center;color:#fff;box-sizing:border-box}
.vaporix-empty-icon{font-size:28px;margin-bottom:8px}.vaporix-empty-text{font-size:18px;font-weight:900;margin-bottom:17px}.vaporix-empty-box button{width:100%;height:48px;border:1px solid #4a4850;border-radius:15px;background:#38383e;color:#fff;font-weight:900;font-size:16px}
body.vaporix-empty-notice-open{overflow:hidden!important}
`;
  document.head.appendChild(s);
}

function moveOrdersBelowSettings(){
  const p=$('profile'),orders=$('phOrdersSection');
  if(!p||!orders)return;
  const title=q('.profile-section-title',p);
  if(!title)return;
  let last=title;
  while(last.nextElementSibling&&last.nextElementSibling!==orders)last=last.nextElementSibling;
  if(last!==orders)last.insertAdjacentElement('afterend',orders);
}

function normalizeCheckout(){
  if(!checkoutOpen())return;
  const box=q('#checkoutModal .checkout-box');if(!box)return;
  const buttons=qa(':scope > .ph-back, :scope > .ph-next',box);
  if(buttons.length){
    let wrap=q(':scope > .ph-checkout-actions',box);
    if(!wrap){wrap=document.createElement('div');wrap.className='ph-checkout-actions';box.appendChild(wrap)}
    buttons.forEach(b=>wrap.appendChild(b));
  }
  const action=$('phCheckoutAction');
  if(action&&!cartHasItems()){
    action.disabled=true;action.setAttribute('aria-disabled','true');action.title='Добавьте товар в корзину';
  }else if(action){action.disabled=false;action.removeAttribute('aria-disabled');action.removeAttribute('title')}
}

function addOrderDetailBack(){
  const box=q('#orderDetailModal .ph-order-detail-box'),content=$('orderDetailContent');
  if(!box||!content)return;
  let b=q('.ph-detail-back',box);
  if(!b){b=document.createElement('button');b.type='button';b.className='ph-detail-back';b.textContent='Назад';b.onclick=function(){if(typeof window.closeOrderDetail==='function')window.closeOrderDetail()};box.appendChild(b)}
}

function wrapOnce(name,marker,fn){
  const old=window[name];
  if(typeof old!=='function'||old[marker])return false;
  const wrapped=fn(old);wrapped[marker]=true;window[name]=wrapped;return true;
}

function installFunctionGuards(){
  wrapOnce('showCheckout','__vaporixCheckoutGuardV7',old=>function(){
    if(!cartHasItems()){hideEmptyNotice();emptyNotice();return false}
    hideEmptyNotice();return old.apply(this,arguments);
  });
  window.showCartCheckout=window.showCheckout;

  wrapOnce('nextCheckoutStep','__vaporixNextGuardV7',old=>function(){
    if(!cartHasItems()){hideEmptyNotice();emptyNotice();return false}
    return old.apply(this,arguments);
  });
  wrapOnce('submitCheckoutOrder','__vaporixSubmitGuardV7',old=>async function(){
    if(!cartHasItems()){hideEmptyNotice();emptyNotice();return false}
    return old.apply(this,arguments);
  });

  wrapOnce('showProfile','__vaporixProfileRepairV7',old=>function(){
    const r=old.apply(this,arguments);
    const repair=()=>{const p=$('profile');if(p){p.hidden=false;p.style.removeProperty('display')}moveOrdersBelowSettings()};
    repair();setTimeout(repair,0);setTimeout(repair,150);setTimeout(repair,500);
    return r;
  });

  wrapOnce('openOrderDetailById','__vaporixDetailRepairV7',old=>function(){
    const r=old.apply(this,arguments);setTimeout(addOrderDetailBack,0);return r;
  });
}

function installButtonSafety(){
  if(window.__VAPORIX_BUTTON_SAFETY_V7)return;
  window.__VAPORIX_BUTTON_SAFETY_V7=true;
  document.addEventListener('click',function(e){
    const t=e.target.closest&&e.target.closest('#phCheckoutAction');
    if(!t||cartHasItems())return;
    e.preventDefault();e.stopImmediatePropagation();hideEmptyNotice();emptyNotice();
  },true);
}

function boot(){
  installCSS();
  installFunctionGuards();
  installButtonSafety();
  moveOrdersBelowSettings();
  normalizeCheckout();
  if($('orderDetailModal')?.classList.contains('show'))addOrderDetailBack();
  if(!checkoutOpen())hideEmptyNotice();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',boot);
let scheduled=false;
const observer=new MutationObserver(()=>{
  if(scheduled)return;scheduled=true;
  setTimeout(()=>{scheduled=false;boot()},30);
});
observer.observe(document.body,{childList:true,subtree:true});
})();

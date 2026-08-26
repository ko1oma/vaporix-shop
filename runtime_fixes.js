(function(){
'use strict';

/* VAPORIX runtime stabilization V12
   - A cancelled checkout is a dead session.
   - Legacy checkout validation cannot fire from catalog/cart/profile navigation.
   - "Вернуться к покупкам" is handled exactly once.
   - Profile keeps a visible orders section.
   - Existing product/flavor logic is left alone.
*/
if(window.__VAPORIX_RUNTIME_V12)return;
window.__VAPORIX_RUNTIME_V12=true;

let checkoutActive=false;
let closingCheckout=false;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const checkoutModal=()=>document.getElementById('checkoutModal');

function forceCheckoutClosed(){
  checkoutActive=false;
  closingCheckout=false;
  const m=checkoutModal();
  if(m){
    m.classList.remove('show');
    m.setAttribute('aria-hidden','true');
    m.style.pointerEvents='none';
  }
  document.body.classList.remove('modal-open');
  document.body.style.overflow='auto';
  try{if(typeof window.syncSheetState==='function')window.syncSheetState()}catch(e){}
}

function checkoutIsOpen(){
  const m=checkoutModal();
  return !!(checkoutActive&&m&&m.classList.contains('show')&&m.getAttribute('aria-hidden')!=='true');
}

function installCheckoutGuards(){
  if(typeof window.nextCheckoutStep==='function'&&!window.nextCheckoutStep.__v12guard){
    const original=window.nextCheckoutStep;
    const wrapped=function(){
      if(!checkoutIsOpen())return false;
      return original.apply(this,arguments);
    };
    wrapped.__v12guard=true;
    window.nextCheckoutStep=wrapped;
  }
  if(typeof window.submitCheckoutOrder==='function'&&!window.submitCheckoutOrder.__v12guard){
    const original=window.submitCheckoutOrder;
    const wrapped=function(){
      if(!checkoutIsOpen())return false;
      return original.apply(this,arguments);
    };
    wrapped.__v12guard=true;
    window.submitCheckoutOrder=wrapped;
  }
}

function patchCheckoutAPI(){
  if(typeof window.showCheckout==='function'&&!window.showCheckout.__v12wrapped){
    const originalShow=window.showCheckout;
    const wrappedShow=function(){
      checkoutActive=true;
      const m=checkoutModal();
      if(m){m.removeAttribute('aria-hidden');m.style.pointerEvents='';}
      const result=originalShow.apply(this,arguments);
      checkoutActive=true;
      installCheckoutGuards();
      return result;
    };
    wrappedShow.__v12wrapped=true;
    window.showCheckout=wrappedShow;
    if(typeof window.showCartCheckout==='function')window.showCartCheckout=wrappedShow;
  }

  if(typeof window.cancelCheckout==='function'&&!window.cancelCheckout.__v12wrapped){
    const originalCancel=window.cancelCheckout;
    const wrappedCancel=function(){
      if(closingCheckout)return false;
      closingCheckout=true;
      checkoutActive=false;
      try{originalCancel.apply(this,arguments)}catch(e){console.error(e)}
      forceCheckoutClosed();
      try{if(typeof window.showCart==='function')window.showCart()}catch(e){}
      forceCheckoutClosed();
      return false;
    };
    wrappedCancel.__v12wrapped=true;
    window.cancelCheckout=wrappedCancel;
  }

  if(typeof window.hideCheckout==='function'&&!window.hideCheckout.__v12wrapped){
    const originalHide=window.hideCheckout;
    const wrappedHide=function(){
      checkoutActive=false;
      try{originalHide.apply(this,arguments)}catch(e){}
      forceCheckoutClosed();
      return false;
    };
    wrappedHide.__v12wrapped=true;
    window.hideCheckout=wrappedHide;
  }
  installCheckoutGuards();
}

/* Only suppress the exact stale checkout validation message outside checkout. */
if(!window.__VAPORIX_ALERT_V12){
  window.__VAPORIX_ALERT_V12=true;
  const nativeAlert=window.alert;
  window.alert=function(message){
    const text=String(message??'');
    if(!checkoutIsOpen()&&/заполните все обязательные поля/i.test(text))return;
    return nativeAlert.call(window,message);
  };
}

/* One tap on the first checkout back button = one checkout close. */
document.addEventListener('click',function(e){
  const b=e.target?.closest?.('#checkoutModal .ph-cancel-checkout, #checkoutModal .ph-back');
  if(!b)return;
  const text=norm(b.textContent);
  if(!b.classList.contains('ph-cancel-checkout')&&!text.includes('вернуться к покупкам'))return;
  if(closingCheckout)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(typeof window.cancelCheckout==='function')window.cancelCheckout();
},{capture:true,passive:false});

const stateObserver=new MutationObserver(()=>{
  const m=checkoutModal();
  if(!m)return;
  if(!m.classList.contains('show')&&checkoutActive){
    checkoutActive=false;
    m.setAttribute('aria-hidden','true');
    m.style.pointerEvents='none';
    document.body.style.overflow='auto';
  }
});
function observeCheckout(){
  const m=checkoutModal();
  if(m&&!m.__v12observed){
    m.__v12observed=true;
    stateObserver.observe(m,{attributes:true,attributeFilter:['class','style','aria-hidden']});
  }
  patchCheckoutAPI();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeCheckout,{once:true});
else observeCheckout();
window.addEventListener('load',observeCheckout);
setTimeout(observeCheckout,500);
setTimeout(observeCheckout,1500);

/* Orders block in profile: keep the section visible and bordered. */
function ensureProfileOrders(){
  const p=document.getElementById('profile');
  if(!p)return;
  let s=document.getElementById('phOrdersSection');
  if(!s){
    s=document.createElement('section');
    s.id='phOrdersSection';
    s.className='ph-orders-section';
    s.innerHTML='<div class="ph-orders-title">Заказы</div><div id="phOrdersList"></div>';
    const anchor=p.querySelector('.profile-section-title');
    p.insertBefore(s,anchor||p.firstChild);
  }
  try{if(typeof window.PUFFHUB_REFRESH_ORDERS==='function')window.PUFFHUB_REFRESH_ORDERS()}catch(e){}
}
function observeProfile(){ensureProfileOrders()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeProfile,{once:true});
else observeProfile();
window.addEventListener('load',observeProfile);
setInterval(observeProfile,1500);

const style=document.createElement('style');
style.id='vaporix-runtime-v12-style';
style.textContent=`
#checkoutModal:not(.show){pointer-events:none!important}
.checkout-modal .ph-back,.checkout-modal .ph-cancel-checkout{position:relative!important;z-index:50!important;pointer-events:auto!important;touch-action:manipulation!important}
.ph-orders-section{display:block!important;width:calc(100% - 4px)!important;margin:0 2px 22px!important;padding:16px!important;border:1px solid #4a4a52!important;border-radius:20px!important;background:var(--panel,#171719)!important;box-sizing:border-box!important}
.ph-orders-title{display:block!important;margin:0 0 12px!important;font-size:20px!important;font-weight:900!important}
#phOrdersList{display:block!important;width:100%!important}
.ph-order-card{display:block!important;width:100%!important;box-sizing:border-box!important;pointer-events:auto!important}
`;
document.head.appendChild(style);

})();

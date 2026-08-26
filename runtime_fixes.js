(function(){
'use strict';
/* VAPORIX runtime fix V8. One source of truth for checkout entry; no checkout validation outside the form. */
if(window.__VAPORIX_RUNTIME_CLEAN_V8)return;
window.__VAPORIX_RUNTIME_CLEAN_V8=true;

var $=function(id){return document.getElementById(id)};
function modalOpen(id){var m=$(id);if(!m)return false;var s=getComputedStyle(m);return m.classList.contains('show')&&s.display!=='none'&&s.visibility!=='hidden'}
function checkoutOpen(){return modalOpen('checkoutModal')}
function checkoutFormOpen(){return checkoutOpen()&&!!document.querySelector('#checkoutModal .ph-form-card')}

function liveCart(){
  try{if(typeof cart!=='undefined'&&Array.isArray(cart))return cart}catch(e){}
  try{if(Array.isArray(window.cart))return window.cart}catch(e){}
  return []
}
function cartHasItems(){
  var c=liveCart();
  for(var i=0;i<c.length;i++){if(c[i]&&Number(c[i].qty||0)>0)return true}
  var rows=document.querySelectorAll('#cartItems .cart-item');
  return rows.length>0;
}

function hideEmptyNotice(){var n=$('vaporixEmptyCartNotice');if(n)n.classList.remove('show');document.body.classList.remove('vaporix-empty-notice-open')}
function showEmptyNotice(){
  var n=$('vaporixEmptyCartNotice');
  if(!n){
    n=document.createElement('div');n.id='vaporixEmptyCartNotice';
    n.innerHTML='<div class="vaporix-empty-box"><div class="vaporix-empty-icon">🛒</div><div class="vaporix-empty-text">Сначала выберите товар</div><button type="button">OK</button></div>';
    document.body.appendChild(n);
    n.querySelector('button').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();hideEmptyNotice()},{passive:false});
  }
  n.classList.add('show');document.body.classList.add('vaporix-empty-notice-open');
}

/* The old required-fields alert is legal only while the four-step checkout form is visible. */
if(!window.__VAPORIX_ALERT_SCOPE_V8){
  window.__VAPORIX_ALERT_SCOPE_V8=true;
  var nativeAlert=window.alert;
  window.alert=function(message){
    var text=String(message);
    if(text==='Заполните все обязательные поля.'&&!checkoutFormOpen())return;
    return nativeAlert.call(window,message);
  };
}

/* Also block the actual validator outside checkout, so even a stale/accidental handler cannot show it. */
function guardNextStep(){
  var fn=window.__VAPORIX_NEXT_STEP_ORIGINAL_V8||window.nextCheckoutStep;
  if(typeof fn!=='function'||fn.__vaporixNextV8)return;
  window.__VAPORIX_NEXT_STEP_ORIGINAL_V8=fn;
  function guardedNext(){
    if(!checkoutFormOpen())return false;
    return fn.apply(this,arguments);
  }
  guardedNext.__vaporixNextV8=true;
  window.nextCheckoutStep=guardedNext;
}

function guardShowCheckout(){
  var fn=window.__VAPORIX_SHOW_CHECKOUT_ORIGINAL_V8||window.showCheckout;
  if(typeof fn!=='function'||fn.__vaporixShowV8)return;
  window.__VAPORIX_SHOW_CHECKOUT_ORIGINAL_V8=fn;
  function guardedShow(){
    if(!cartHasItems()){showEmptyNotice();return false}
    hideEmptyNotice();
    return fn.apply(this,arguments);
  }
  guardedShow.__vaporixShowV8=true;
  window.showCheckout=guardedShow;
  window.showCartCheckout=guardedShow;
}

function closeCheckoutImmediately(){
  try{if(typeof window.hideCheckout==='function')window.hideCheckout()}catch(e){}
  var m=$('checkoutModal');if(m)m.classList.remove('show');
  document.body.classList.remove('sheet-open');
  document.body.style.overflow='auto';
}

/* One capture listener handles the controls that previously needed 2–3 taps on iOS. */
function installTapController(){
  if(window.__VAPORIX_TAP_CONTROLLER_V8)return;
  window.__VAPORIX_TAP_CONTROLLER_V8=true;
  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('button,a'):null;
    if(!t)return;

    /* Empty-cart notice button. */
    if(t.closest('#vaporixEmptyCartNotice'))return;

    /* ONLY the cart drawer's checkout button may run the empty-cart rule. */
    if(t.matches('#drawer .checkout')){
      e.preventDefault();e.stopImmediatePropagation();
      if(!cartHasItems()){showEmptyNotice();return false}
      hideEmptyNotice();
      guardShowCheckout();
      if(typeof window.showCheckout==='function')window.showCheckout();
      return false;
    }

    /* Never allow the checkout-form action to be confused with the cart button. */
    if(t.matches('#checkoutModal .ph-next')){
      if(!checkoutFormOpen()){
        e.preventDefault();e.stopImmediatePropagation();
        return false;
      }
      return;
    }

    /* Back to shopping: execute once and consume the inline onclick. */
    if(t.matches('#checkoutModal .ph-cancel-checkout')){
      e.preventDefault();e.stopImmediatePropagation();
      hideEmptyNotice();closeCheckoutImmediately();
      if(typeof window.showCart==='function')window.showCart();
      return false;
    }

    /* Cart X: execute once and consume the inline onclick. */
    if(t.matches('#drawer .remove')){
      e.preventDefault();e.stopImmediatePropagation();
      var row=t.closest('.cart-item');
      var rows=document.querySelectorAll('#cartItems .cart-item');
      var idx=-1;for(var i=0;i<rows.length;i++){if(rows[i]===row){idx=i;break}}
      if(idx>=0&&typeof window.removeCart==='function')window.removeCart(idx);
      return false;
    }

    /* Cart quantity buttons: consume the inline handler once, avoiding iOS hover/click double activation. */
    if(t.matches('#drawer .qty button')){
      e.preventDefault();e.stopImmediatePropagation();
      var qrow=t.closest('.cart-item'),qrows=document.querySelectorAll('#cartItems .cart-item'),qi=-1;
      for(var j=0;j<qrows.length;j++){if(qrows[j]===qrow){qi=j;break}}
      if(qi>=0&&typeof window.changeQty==='function')window.changeQty(qi,t.textContent.trim()==='+'?1:-1);
      return false;
    }
  },true);
}

function cleanNavigation(){
  ['showCatalog','showCart','showInfo','showProfile'].forEach(function(name){
    var fn=window[name];
    if(typeof fn!=='function'||fn.__vaporixNavV8)return;
    function wrap(){hideEmptyNotice();return fn.apply(this,arguments)}
    wrap.__vaporixNavV8=true;window[name]=wrap;
  });
}

function layoutFix(){
  if($('vaporix-runtime-v8-style'))return;
  var s=document.createElement('style');s.id='vaporix-runtime-v8-style';
  s.textContent=`
/* Checkout is a full-height sheet, but its content—not the page—owns vertical scrolling. */
#checkoutModal.checkout-modal{position:fixed!important;left:0!important;right:0!important;top:0!important;bottom:0!important;width:100%!important;height:100dvh!important;max-width:none!important;max-height:none!important;margin:0!important;transform:none!important;overflow:hidden!important}
#checkoutModal .checkout-box{position:absolute!important;left:0!important;right:0!important;top:0!important;bottom:0!important;width:100%!important;height:100%!important;min-width:0!important;max-width:none!important;max-height:none!important;margin:0!important;transform:none!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;box-sizing:border-box!important;padding-bottom:calc(32px + env(safe-area-inset-bottom))!important}
#checkoutModal .ph-form-card,#checkoutModal .ph-review-card{flex-shrink:0!important}
#checkoutModal .ph-cancel-checkout,#checkoutModal .ph-next,#checkoutModal .ph-back{pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
/* No hover-only state on touch devices: it was making the first tap look like a hover and the second tap perform the action. */
@media (hover:none){#drawer .remove:hover,#drawer .qty button:hover,#checkoutModal button:hover{background:inherit!important;color:inherit!important;border-color:inherit!important;transform:none!important}}
/* Keep order cards visibly outlined, including the empty-orders section. */
#phOrdersSection,.ph-orders-section{box-sizing:border-box!important;border:1px solid var(--line,#3b3b43)!important;border-radius:20px!important;background:var(--panel,#151518)!important;padding:16px!important;margin:0 0 18px!important}
#phOrdersSection .ph-order-card,.ph-orders-section .ph-order-card{display:block!important;width:100%!important;box-sizing:border-box!important;border:1px solid var(--line,#3b3b43)!important;border-radius:20px!important;background:var(--panel2,#171719)!important;padding:17px!important;margin:0 0 10px!important;text-align:left!important}
#vaporixEmptyCartNotice{position:fixed!important;inset:0!important;z-index:99999!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;background:rgba(0,0,0,.55)!important;opacity:0!important;pointer-events:none!important}
#vaporixEmptyCartNotice.show{opacity:1!important;pointer-events:auto!important}
.vaporix-empty-box{width:min(390px,calc(100vw - 40px));padding:24px;border-radius:24px;background:#242428;border:1px solid #55515f;box-shadow:0 25px 80px rgba(0,0,0,.65);text-align:center;color:#fff}
.vaporix-empty-icon{font-size:28px;margin-bottom:8px}.vaporix-empty-text{font-size:19px;font-weight:900;margin-bottom:17px}.vaporix-empty-box button{width:100%;height:48px;border:1px solid #4a4850;border-radius:15px;background:#38383e;color:#fff;font-weight:900;font-size:16px;touch-action:manipulation}
body.vaporix-empty-notice-open{overflow:hidden!important}
`;
  document.head.appendChild(s);
}

function boot(){layoutFix();installTapController();guardShowCheckout();guardNextStep();cleanNavigation();if(!checkoutOpen())hideEmptyNotice()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',boot);
[100,500,1200,2500].forEach(function(t){setTimeout(boot,t)});
setInterval(boot,1000);
})();

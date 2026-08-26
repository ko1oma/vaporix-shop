(function(){
'use strict';
/* VAPORIX runtime fix V7 — checkout validation is isolated to the checkout button/form. */
if(window.__VAPORIX_RUNTIME_CLEAN_V7)return;
window.__VAPORIX_RUNTIME_CLEAN_V7=true;

function el(id){return document.getElementById(id)}
function checkoutOpen(){
  var m=el('checkoutModal');
  if(!m)return false;
  var s=getComputedStyle(m);
  return m.classList.contains('show')&&s.display!=='none'&&s.visibility!=='hidden';
}
function checkoutFormOpen(){return checkoutOpen()&&!!document.querySelector('#checkoutModal .ph-form-card')}

/* The original app may keep cart as a lexical variable, window.cart, or render it into the cart drawer. */
function getLiveCart(){
  try{if(typeof cart!=='undefined'&&Array.isArray(cart))return cart}catch(e){}
  try{if(Array.isArray(window.cart))return window.cart}catch(e){}
  var keys=['cart','puffhubCartV1','vaporixCartV1'];
  for(var i=0;i<keys.length;i++){
    try{var v=JSON.parse(localStorage.getItem(keys[i])||'null');if(Array.isArray(v))return v}catch(e){}
  }
  return [];
}
function cartHasItems(){
  var c=getLiveCart();
  if(c.some(function(x){return x&&Number(x.qty||0)>0}))return true;
  /* At the exact moment the user presses checkout, the cart drawer contains .cart-item. */
  var items=document.querySelectorAll('.cart-item');
  for(var i=0;i<items.length;i++){
    var q=items[i].querySelector('.qty span');
    if(!q||Number((q.textContent||'').trim())>0)return true;
  }
  return false;
}

function hideEmptyNotice(){
  var n=el('vaporixEmptyCartNotice');
  if(n)n.classList.remove('show');
  document.body.classList.remove('vaporix-empty-notice-open');
}
function showEmptyNotice(){
  var n=el('vaporixEmptyCartNotice');
  if(!n){
    n=document.createElement('div');n.id='vaporixEmptyCartNotice';
    n.innerHTML='<div class="vaporix-empty-box"><div class="vaporix-empty-icon">🛒</div><div class="vaporix-empty-text">Сначала выберите товар</div><button type="button">OK</button></div>';
    document.body.appendChild(n);
    n.querySelector('button').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();hideEmptyNotice()},{passive:false});
  }
  n.classList.add('show');document.body.classList.add('vaporix-empty-notice-open');
}

/* The required-fields alert must never escape the checkout form. */
if(!window.__VAPORIX_ALERT_SCOPE_V7){
  window.__VAPORIX_ALERT_SCOPE_V7=true;
  var nativeAlert=window.alert;
  window.alert=function(message){
    if(String(message)==='Заполните все обязательные поля.'&&!checkoutFormOpen())return;
    return nativeAlert.call(window,message);
  };
}

/* Replace the checkout entry point with one authoritative rule. */
function installCheckoutGuard(){
  var fn=window.showCheckout;
  if(typeof fn!=='function')return;
  if(fn.__vaporixGuardV7)return;
  function guarded(){
    if(!cartHasItems()){showEmptyNotice();return false;}
    hideEmptyNotice();
    return fn.apply(this,arguments);
  }
  guarded.__vaporixGuardV7=true;
  window.showCheckout=guarded;
  window.showCartCheckout=guarded;
}

/* Capture the actual cart checkout button. This prevents any old inline handler from firing before the guard. */
function installCheckoutButtonGuard(){
  document.querySelectorAll('.checkout').forEach(function(btn){
    if(btn.__vaporixCheckoutButtonV7)return;
    btn.__vaporixCheckoutButtonV7=true;
    btn.addEventListener('click',function(e){
      if(cartHasItems()){hideEmptyNotice();return;}
      e.preventDefault();e.stopImmediatePropagation();showEmptyNotice();
    },true);
  });
}

function cleanNavigation(){
  ['showCatalog','showCart','showInfo','showProfile','hideCheckout','hideCart','cancelCheckout'].forEach(function(name){
    var fn=window[name];
    if(typeof fn!=='function'||fn.__vaporixNavV7)return;
    function wrap(){hideEmptyNotice();return fn.apply(this,arguments)}
    wrap.__vaporixNavV7=true;window[name]=wrap;
  });
}

function layoutFix(){
  if(el('vaporix-runtime-v7-style'))return;
  var s=document.createElement('style');s.id='vaporix-runtime-v7-style';
  s.textContent=`
#checkoutModal,.checkout-modal{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;transform:none!important;overflow:hidden!important}
#checkoutModal .checkout-box,.checkout-modal .checkout-box{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important;box-sizing:border-box!important}
#checkoutModal .ph-cancel-checkout,#checkoutModal .ph-back,#checkoutModal .ph-next{position:relative!important;z-index:30!important;pointer-events:auto!important;touch-action:manipulation!important}
/* Never let generic styles remove order outlines. */
.ph-orders-section{box-sizing:border-box!important}
.ph-orders-section .ph-order-card{display:block!important;box-sizing:border-box!important;width:100%!important;border:1px solid var(--line,#3b3b43)!important;border-radius:20px!important;background:var(--panel,#151518)!important;padding:17px!important;margin:0 0 10px!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.025)!important}
#vaporixEmptyCartNotice{position:fixed!important;inset:0!important;z-index:99999!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;background:rgba(0,0,0,.52)!important;opacity:0!important;pointer-events:none!important;transition:opacity .12s ease!important}
#vaporixEmptyCartNotice.show{opacity:1!important;pointer-events:auto!important}
.vaporix-empty-box{width:min(390px,calc(100vw - 40px));padding:24px;border-radius:24px;background:#242428;border:1px solid #55515f;box-shadow:0 25px 80px rgba(0,0,0,.65);text-align:center;color:#fff}
.vaporix-empty-icon{font-size:28px;margin-bottom:8px}.vaporix-empty-text{font-size:19px;font-weight:900;margin-bottom:17px}.vaporix-empty-box button{width:100%;height:48px;border:1px solid #4a4850;border-radius:15px;background:#38383e;color:#fff;font-weight:900;font-size:16px}
body.vaporix-empty-notice-open{overflow:hidden!important}
`;
  document.head.appendChild(s);
}

function boot(){layoutFix();installCheckoutGuard();installCheckoutButtonGuard();cleanNavigation();if(!checkoutOpen())hideEmptyNotice()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',boot);
[100,500,1200,2500].forEach(function(t){setTimeout(boot,t)});
setInterval(boot,1500);
})();

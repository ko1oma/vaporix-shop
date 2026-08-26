(function(){
'use strict';

/*
 VAPORIX runtime cleanup V4.
 Rules:
 1) Checkout validation belongs ONLY to checkout.
 2) Navigation/buttons are never blocked by checkout validation.
 3) Empty cart => "Сначала выберите товар" only from "Оформление заказа".
 4) A checkout notice is removed as soon as checkout is left.
 5) Do not alter the checkout layout/scroll model; only add minimal interaction fixes.
*/

if(window.__VAPORIX_RUNTIME_CLEAN_V4)return;
window.__VAPORIX_RUNTIME_CLEAN_V4=true;

function el(id){return document.getElementById(id)}

function checkoutIsOpen(){
  const m=el('checkoutModal');
  if(!m)return false;
  const cs=getComputedStyle(m);
  return m.classList.contains('show') && cs.display!=='none' && cs.visibility!=='hidden';
}

function cartHasItems(){
  try{
    const c=Array.isArray(window.cart)?window.cart:[];
    return c.some(x=>x && Number(x.qty||0)>0);
  }catch(e){return false}
}

function hideNotice(){
  const n=el('vaporixEmptyCartNotice');
  if(n)n.classList.remove('show');
  document.body.classList.remove('vaporix-empty-notice-open');
}

function showNotice(text){
  let n=el('vaporixEmptyCartNotice');
  if(!n){
    n=document.createElement('div');
    n.id='vaporixEmptyCartNotice';
    n.innerHTML='<div class="vaporix-empty-box"><div class="vaporix-empty-icon">🛒</div><div class="vaporix-empty-text"></div><button type="button" id="vaporixEmptyCartOk">OK</button></div>';
    document.body.appendChild(n);
    const b=el('vaporixEmptyCartOk');
    if(b)b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();hideNotice();},{passive:false});
  }
  const t=n.querySelector('.vaporix-empty-text');
  if(t)t.textContent=text;
  n.classList.add('show');
  document.body.classList.add('vaporix-empty-notice-open');
}

/*
 IMPORTANT:
 The old implementation could call alert("Заполните все обязательные поля.")
 from an unrelated navigation/product click.
 Do NOT allow that message outside an actually open checkout.
 We preserve native alert for every other message.
*/
(function installAlertScope(){
  if(window.__VAPORIX_ALERT_SCOPE_V4)return;
  window.__VAPORIX_ALERT_SCOPE_V4=true;
  const nativeAlert=window.alert;
  window.alert=function(message){
    const text=String(message==null?'':message);
    if(text==='Заполните все обязательные поля.' && !checkoutIsOpen())return;
    return nativeAlert.call(window,message);
  };
})();

/*
 Empty-cart guard is installed around the real showCheckout API.
 No form validation is performed here: only cart presence is checked.
*/
function installCheckoutGuard(){
  const fn=window.showCheckout;
  if(typeof fn!=='function')return false;
  if(fn.__vaporixEmptyCartGuardV4)return true;

  function guardedShowCheckout(){
    if(!cartHasItems()){
      hideNotice();
      showNotice('Сначала выберите товар');
      return false;
    }
    hideNotice();
    return fn.apply(this,arguments);
  }

  guardedShowCheckout.__vaporixEmptyCartGuardV4=true;
  window.showCheckout=guardedShowCheckout;
  window.showCartCheckout=guardedShowCheckout;
  return true;
}

/*
 Navigation is independent from checkout.
 We only close our empty-cart notice here; we do not validate anything.
*/
function wrapNavigation(name){
  const fn=window[name];
  if(typeof fn!=='function')return false;
  if(fn.__vaporixNavigationCleanV4)return true;

  const wrapped=function(){
    hideNotice();
    return fn.apply(this,arguments);
  };
  wrapped.__vaporixNavigationCleanV4=true;
  window[name]=wrapped;
  return true;
}

function installNavigationCleanup(){
  ['showCatalog','showCart','showInfo','showProfile','hideCheckout','hideCart','cancelCheckout'].forEach(wrapNavigation);
}

/*
 Make checkout buttons deterministic on touch devices.
 We do NOT synthesize a second click and we do NOT prevent the normal click.
 The handlers only stop accidental propagation to an outer navigation layer.
*/
function installCheckoutButtonInteraction(){
  if(!checkoutIsOpen())return;

  ['.ph-cancel-checkout','.ph-back','.ph-next'].forEach(function(sel){
    document.querySelectorAll('#checkoutModal '+sel).forEach(function(btn){
      if(btn.__vaporixTouchV4)return;
      btn.__vaporixTouchV4=true;
      btn.addEventListener('pointerdown',function(e){
        e.stopPropagation();
      },{capture:true});
    });
  });
}

/*
 Product add/remove controls: stop propagation at the control itself so an
 unrelated checkout/navigation listener cannot consume the same gesture.
 We intentionally leave click handlers untouched.
*/
function installProductButtonInteraction(){
  document.querySelectorAll('.grid .add-cart,.grid .remove,.grid .card-actions button').forEach(function(btn){
    if(btn.__vaporixProductTouchV4)return;
    btn.__vaporixProductTouchV4=true;
    btn.addEventListener('pointerdown',function(e){e.stopPropagation();},{capture:true});
  });
}

/*
 Do not force overflow:hidden on body. The checkout box owns its own scroll.
 This avoids breaking iOS/Telegram scrolling.
*/
function installMinimalLayoutFix(){
  let s=el('vaporix-clean-runtime-style-v4');
  if(s)return;
  s=document.createElement('style');
  s.id='vaporix-clean-runtime-style-v4';
  s.textContent=`
#checkoutModal,
.checkout-modal{
  position:fixed!important;
  inset:0!important;
  width:100vw!important;
  height:100dvh!important;
  max-width:none!important;
  max-height:none!important;
  transform:none!important;
  box-sizing:border-box!important;
}
#checkoutModal .checkout-box,
.checkout-modal .checkout-box{
  position:absolute!important;
  inset:0!important;
  width:100%!important;
  height:100%!important;
  max-width:none!important;
  max-height:none!important;
  transform:none!important;
  box-sizing:border-box!important;
  overflow-x:hidden!important;
  overflow-y:auto!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior-y:contain!important;
  touch-action:pan-y!important;
}
#checkoutModal .ph-cancel-checkout,
#checkoutModal .ph-back,
#checkoutModal .ph-next,
.checkout-modal .ph-cancel-checkout,
.checkout-modal .ph-back,
.checkout-modal .ph-next{
  position:relative!important;
  z-index:30!important;
  pointer-events:auto!important;
  touch-action:manipulation!important;
}
.grid .add-cart,
.grid .remove,
.grid .card-actions button{
  position:relative!important;
  z-index:20!important;
  pointer-events:auto!important;
  touch-action:manipulation!important;
}
#vaporixEmptyCartNotice{
  position:fixed!important;
  inset:0!important;
  z-index:5000!important;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  background:rgba(0,0,0,.52);
  opacity:0;
  pointer-events:none;
  transition:opacity .12s ease;
}
#vaporixEmptyCartNotice.show{
  opacity:1;
  pointer-events:auto;
}
.vaporix-empty-box{
  width:min(390px,calc(100vw - 40px));
  padding:24px;
  border-radius:24px;
  background:linear-gradient(145deg,#242428,#1c1c20);
  border:1px solid #55515f;
  box-shadow:0 25px 80px rgba(0,0,0,.65);
  text-align:center;
}
.vaporix-empty-icon{font-size:28px;margin-bottom:8px}
.vaporix-empty-text{font-size:19px;font-weight:900;margin-bottom:17px;color:#fff}
.vaporix-empty-box button{
  width:100%;
  height:48px;
  border:1px solid #4a4850;
  border-radius:15px;
  background:#38383e;
  color:#fff;
  font-weight:900;
  font-size:16px;
  touch-action:manipulation;
}
body.vaporix-empty-notice-open{overflow:hidden!important}
`;
  document.head.appendChild(s);
}

function boot(){
  installMinimalLayoutFix();
  installCheckoutGuard();
  installNavigationCleanup();
  installCheckoutButtonInteraction();
  installProductButtonInteraction();

  /* If checkout was abandoned, no notice may survive elsewhere. */
  if(!checkoutIsOpen())hideNotice();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}
window.addEventListener('load',boot);
[50,150,400,800,1500,3000].forEach(function(t){setTimeout(boot,t)});
setInterval(boot,1200);
})();

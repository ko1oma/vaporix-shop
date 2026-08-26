(function(){
'use strict';
/* VAPORIX runtime cleanup V2.
   This file intentionally does NOT intercept global clicks/touches.
   It only neutralizes the broken checkout geometry and the empty-cart guard. */
if(window.__VAPORIX_RUNTIME_CLEAN_V2)return;
window.__VAPORIX_RUNTIME_CLEAN_V2=true;

function el(id){return document.getElementById(id)}

function installCheckoutLayout(){
  let s=el('vaporix-clean-runtime-style-v2');
  if(!s){
    s=document.createElement('style');
    s.id='vaporix-clean-runtime-style-v2';
    document.head.appendChild(s);
  }
  s.textContent=`
/* The checkout was being shifted by order_flow_runtime.js with left:50%
   and translateX(-50%). Override the source geometry for BOTH possible
   modal selectors so the actual checkout occupies the complete viewport. */
#checkoutModal,
.checkout-modal{
  position:fixed!important;
  top:0!important;
  right:0!important;
  bottom:0!important;
  left:0!important;
  inset:0!important;
  width:100vw!important;
  min-width:100vw!important;
  max-width:none!important;
  height:100dvh!important;
  min-height:100dvh!important;
  max-height:none!important;
  margin:0!important;
  transform:none!important;
  box-sizing:border-box!important;
  overflow:hidden!important;
}
#checkoutModal .checkout-box,
.checkout-modal .checkout-box{
  position:absolute!important;
  top:0!important;
  right:0!important;
  bottom:0!important;
  left:0!important;
  inset:0!important;
  width:100%!important;
  min-width:0!important;
  max-width:none!important;
  height:100%!important;
  min-height:100%!important;
  max-height:none!important;
  margin:0!important;
  transform:none!important;
  box-sizing:border-box!important;
  overflow-x:hidden!important;
  overflow-y:auto!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior-y:contain!important;
  touch-action:pan-y!important;
  padding:22px 16px calc(28px + env(safe-area-inset-bottom))!important;
}
#checkoutModal .ph-form-card,
#checkoutModal .ph-review-card,
.checkout-modal .ph-form-card,
.checkout-modal .ph-review-card{
  flex:none!important;
  overflow:visible!important;
  box-sizing:border-box!important;
}
#checkoutModal .ph-back,
#checkoutModal .ph-next,
.checkout-modal .ph-back,
.checkout-modal .ph-next{
  position:relative!important;
  z-index:30!important;
  display:block!important;
  width:100%!important;
  box-sizing:border-box!important;
  pointer-events:auto!important;
  touch-action:manipulation!important;
}
#checkoutModal .ph-cancel-checkout,
.checkout-modal .ph-cancel-checkout{
  position:relative!important;
  z-index:31!important;
  display:block!important;
  width:100%!important;
  margin-top:10px!important;
  margin-bottom:10px!important;
  pointer-events:auto!important;
  touch-action:manipulation!important;
}
#checkoutModal .ph-next,
.checkout-modal .ph-next{margin-top:10px!important}

/* Product controls remain directly tappable. */
.grid .add-cart,
.grid .card-actions,
.grid button,
.remove{
  position:relative!important;
  z-index:20!important;
  pointer-events:auto!important;
  touch-action:manipulation!important;
}

/* Empty cart notice. */
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
#vaporixEmptyCartNotice.show{opacity:1;pointer-events:auto}
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
  width:100%;height:48px;border:1px solid #4a4850;border-radius:15px;
  background:#38383e;color:#fff;font-weight:900;font-size:16px;
  touch-action:manipulation;
}

/* Restore the visible orders container in the profile. */
.ph-orders-section{
  position:relative!important;
  margin:0 0 24px!important;
  padding:17px!important;
  border-radius:24px!important;
  background:linear-gradient(145deg,rgba(42,28,58,.96),rgba(24,24,29,.98)) padding-box,
             linear-gradient(135deg,#8e4dff,#d42da8,#4e2a91) border-box!important;
  border:1px solid transparent!important;
  box-shadow:0 12px 34px rgba(93,45,170,.16),inset 0 1px 0 rgba(255,255,255,.06)!important;
  overflow:hidden!important;
}
.ph-orders-title{position:relative!important;font-size:20px!important;font-weight:950!important;margin:0 0 13px!important;color:#fff!important}
.ph-order-card{position:relative!important;border-radius:18px!important;border:1px solid #4a4357!important;background:linear-gradient(145deg,#252329,#1c1c20)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.045)!important}
`;
}

function showNotice(text){
  let n=el('vaporixEmptyCartNotice');
  if(!n){
    n=document.createElement('div');
    n.id='vaporixEmptyCartNotice';
    n.innerHTML='<div class="vaporix-empty-box"><div class="vaporix-empty-icon">🛒</div><div class="vaporix-empty-text"></div><button type="button" id="vaporixEmptyCartOk">OK</button></div>';
    document.body.appendChild(n);
    const b=el('vaporixEmptyCartOk');
    if(b)b.addEventListener('click',function(){n.classList.remove('show')});
  }
  n.querySelector('.vaporix-empty-text').textContent=text;
  n.classList.add('show');
}

function cartHasItems(){
  try{
    if(Array.isArray(window.cart)&&window.cart.length>0)return true;
    if(window.cart&&typeof window.cart==='object'&&!Array.isArray(window.cart)&&Object.keys(window.cart).length>0)return true;
    if(typeof cart!=='undefined'&&Array.isArray(cart)&&cart.length>0)return true;
  }catch(e){}
  const keys=['puffhubCartV1','vaporixCartV1','vaporixCart','puffhubCart','cart'];
  for(const k of keys){
    try{
      const v=JSON.parse(localStorage.getItem(k)||'null');
      if(Array.isArray(v)&&v.length>0)return true;
      if(v&&typeof v==='object'&&Object.keys(v).length>0)return true;
    }catch(e){}
  }
  return false;
}

function installCheckoutGuard(){
  if(typeof window.showCheckout!=='function')return false;
  if(window.showCheckout.__vaporixCleanGuardV2)return true;
  const originalShowCheckout=window.showCheckout;
  function guardedShowCheckout(){
    if(!cartHasItems()){
      showNotice('Сначала выберите товар');
      return false;
    }
    return originalShowCheckout.apply(this,arguments);
  }
  guardedShowCheckout.__vaporixCleanGuardV2=true;
  window.showCheckout=guardedShowCheckout;
  window.showCartCheckout=guardedShowCheckout;
  return true;
}

function boot(){
  installCheckoutLayout();
  installCheckoutGuard();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',boot);
[50,150,400,800,1500,3000].forEach(t=>setTimeout(boot,t));
setInterval(boot,1200);
})();

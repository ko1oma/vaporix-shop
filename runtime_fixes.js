(function(){
'use strict';
/* VAPORIX runtime fixes: CSS/layout + empty-cart guard only. No global touch/click interception. */
if(window.__VAPORIX_RUNTIME_CLEAN_V1)return;
window.__VAPORIX_RUNTIME_CLEAN_V1=true;
function el(id){return document.getElementById(id)}
function install(){let s=el('vaporix-clean-runtime-style');if(!s){s=document.createElement('style');s.id='vaporix-clean-runtime-style';document.head.appendChild(s)}s.textContent=`
#checkoutModal{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;min-width:0!important;max-width:none!important;overflow:hidden!important;z-index:1000!important}
#checkoutModal:not(.show){visibility:hidden!important;pointer-events:none!important}
#checkoutModal.show{visibility:visible!important;pointer-events:auto!important}
#checkoutModal .checkout-box{position:absolute!important;top:0!important;right:0!important;bottom:0!important;left:0!important;width:100%!important;min-width:0!important;max-width:none!important;height:100%!important;max-height:none!important;margin:0!important;transform:none!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;padding:22px 16px calc(28px + env(safe-area-inset-bottom))!important}
#checkoutModal .ph-form-card,#checkoutModal .ph-review-card{flex:none!important;overflow:visible!important}
#checkoutModal .ph-back,#checkoutModal .ph-cancel-checkout,#checkoutModal .ph-next{position:relative!important;z-index:20!important;display:block!important;width:100%!important;box-sizing:border-box!important;pointer-events:auto!important;touch-action:manipulation!important;flex:none!important}
#checkoutModal .ph-cancel-checkout{margin-top:10px!important;margin-bottom:10px!important}
#checkoutModal .ph-next{margin-top:10px!important}
.grid .add-cart,.grid .card-actions,.remove{position:relative!important;z-index:20!important;pointer-events:auto!important;touch-action:manipulation!important}
#vaporixEmptyCartNotice{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.52);opacity:0;pointer-events:none;transition:opacity .12s ease}
#vaporixEmptyCartNotice.show{opacity:1;pointer-events:auto}
.vaporix-empty-box{width:min(390px,calc(100vw - 40px));padding:24px;border-radius:24px;background:linear-gradient(145deg,#242428,#1c1c20);border:1px solid #55515f;box-shadow:0 25px 80px rgba(0,0,0,.65);text-align:center}
.vaporix-empty-icon{font-size:28px;margin-bottom:8px}.vaporix-empty-text{font-size:19px;font-weight:900;margin-bottom:17px;color:#fff}.vaporix-empty-box button{width:100%;height:48px;border:1px solid #4a4850;border-radius:15px;background:#38383e;color:#fff;font-weight:900;font-size:16px;touch-action:manipulation}
.ph-orders-section{position:relative!important;margin:0 0 24px!important;padding:17px!important;border-radius:24px!important;background:linear-gradient(145deg,rgba(42,28,58,.96),rgba(24,24,29,.98)) padding-box,linear-gradient(135deg,#8e4dff,#d42da8,#4e2a91) border-box!important;border:1px solid transparent!important;box-shadow:0 12px 34px rgba(93,45,170,.16),inset 0 1px 0 rgba(255,255,255,.06)!important;overflow:hidden!important}
.ph-orders-title{position:relative!important;font-size:20px!important;font-weight:950!important;margin:0 0 13px!important;color:#fff!important}
.ph-order-card{position:relative!important;border-radius:18px!important;border:1px solid #4a4357!important;background:linear-gradient(145deg,#252329,#1c1c20)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.045)!important}
`}
function showNotice(text){let n=el('vaporixEmptyCartNotice');if(!n){n=document.createElement('div');n.id='vaporixEmptyCartNotice';n.innerHTML='<div class="vaporix-empty-box"><div class="vaporix-empty-icon">🛒</div><div class="vaporix-empty-text"></div><button type="button" id="vaporixEmptyCartOk">OK</button></div>';document.body.appendChild(n);const b=el('vaporixEmptyCartOk');if(b)b.addEventListener('click',function(){n.classList.remove('show')})}n.querySelector('.vaporix-empty-text').textContent=text;n.classList.add('show')}
function cartHasItems(){try{if(Array.isArray(window.cart)&&window.cart.length>0)return true;if(window.cart&&typeof window.cart==='object'&&!Array.isArray(window.cart)&&Object.keys(window.cart).length>0)return true;if(typeof cart!=='undefined'&&Array.isArray(cart)&&cart.length>0)return true}catch(e){}const keys=['puffhubCartV1','vaporixCartV1','vaporixCart','puffhubCart','cart'];for(const k of keys){try{const v=JSON.parse(localStorage.getItem(k)||'null');if(Array.isArray(v)&&v.length>0)return true;if(v&&typeof v==='object'&&Object.keys(v).length>0)return true}catch(e){}}return false}
let originalShowCheckout=null;
function installCheckoutGuard(){if(typeof window.showCheckout!=='function')return false;if(window.showCheckout.__vaporixCleanGuard)return true;originalShowCheckout=window.showCheckout;function guardedShowCheckout(){if(!cartHasItems()){showNotice('Сначала выберите товар');return false}return originalShowCheckout.apply(this,arguments)}guardedShowCheckout.__vaporixCleanGuard=true;window.showCheckout=guardedShowCheckout;if(typeof window.showCartCheckout==='function')window.showCartCheckout=guardedShowCheckout;return true}
function boot(){install();installCheckoutGuard()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.addEventListener('load',boot);[100,300,700,1500,3000].forEach(function(t){setTimeout(boot,t)});setInterval(boot,2000)
})();

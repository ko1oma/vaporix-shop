(function(){
'use strict';
if(window.__VAPORIX_LIVE_RUNTIME_V23)return;
window.__VAPORIX_LIVE_RUNTIME_V23=true;
const $=id=>document.getElementById(id);
let originalShowCheckout=null,originalHideCheckout=null,checkoutOpen=false,lastButton=null,lastTime=0;
function modal(){return $('checkoutModal')}
function visible(){const m=modal();return !!(m&&m.classList.contains('show')&&m.style.visibility!=='hidden')}
function sync(){const m=modal();if(m){m.style.visibility=m.classList.contains('show')?'visible':'hidden';m.style.pointerEvents=m.classList.contains('show')?'auto':'none'}if(typeof window.syncSheetState==='function')try{window.syncSheetState()}catch(e){}}
function getGlobalCart(){try{if(Array.isArray(window.cart))return window.cart;if(window.cart&&typeof window.cart==='object')return window.cart;return Function('try{return typeof cart!=="undefined"?cart:null}catch(e){return null}')()}catch(e){return null}}
function hasItems(v){if(Array.isArray(v))return v.length>0;if(v&&typeof v==='object')return Object.keys(v).length>0;return false}
function cartHasItems(){
 const c=getGlobalCart();if(hasItems(c))return true;
 const keys=['puffhubCartV1','vaporixCartV1','vaporixCart','puffhubCart','cart'];
 for(const k of keys){try{const v=JSON.parse(localStorage.getItem(k)||'null');if(hasItems(v))return true}catch(e){}}
 const selectors=['#cartModal','.cart-modal','#cartSheet','.cart-sheet','[data-cart-modal]','.cart-drawer'];
 for(const s of selectors){const el=document.querySelector(s);if(!el||getComputedStyle(el).display==='none'||getComputedStyle(el).visibility==='hidden')continue;if(el.querySelector('.cart-item,.cart-product,[data-cart-item],[data-cart-product],.cart-row'))return true}
 return false;
}
function notice(text){let n=$('vaporixEmptyCartNotice');if(!n){n=document.createElement('div');n.id='vaporixEmptyCartNotice';n.innerHTML='<div class="vaporix-empty-box"><div class="vaporix-empty-icon">🛒</div><div class="vaporix-empty-text"></div><button type="button" data-vx-action="notice-close">OK</button></div>';document.body.appendChild(n)}n.querySelector('.vaporix-empty-text').textContent=text;n.classList.add('show')}
function closeNotice(){const n=$('vaporixEmptyCartNotice');if(n)n.classList.remove('show')}
function closeToCatalog(){checkoutOpen=false;const m=modal();try{if(originalHideCheckout)originalHideCheckout()}catch(e){}if(m){m.classList.remove('show');m.style.visibility='hidden';m.style.pointerEvents='none';m.setAttribute('aria-hidden','true')}document.body.classList.remove('sheet-open','modal-open');document.body.style.overflow='auto';try{if(typeof window.showCatalog==='function')window.showCatalog();else if(typeof window.showCart==='function')window.showCart()}catch(e){}setTimeout(sync,0)}
function openCheckout(){
 if(!cartHasItems()){notice('Сначала выберите товар');return false}
 checkoutOpen=true;
 try{return originalShowCheckout?originalShowCheckout():true}catch(e){return false}
}
function ensureReturnButton(){const m=modal();if(!m||!m.classList.contains('show'))return;const host=m.querySelector('#checkoutSummary')||m.querySelector('.checkout-box');if(!host||host.querySelector('#returnToShoppingBtn'))return;const next=host.querySelector('.ph-next,#phCheckoutAction');if(!next)return;const b=document.createElement('button');b.type='button';b.id='returnToShoppingBtn';b.className='ph-cancel-checkout ph-back';b.dataset.vxAction='return-shopping';b.textContent='← Вернуться к покупкам';next.parentNode.insertBefore(b,next)}
function wrapApis(){
 if(typeof window.showCheckout==='function'&&!window.showCheckout.__vx23){originalShowCheckout=window.showCheckout;const w=function(){return openCheckout()};w.__vx23=true;window.showCheckout=w;window.showCartCheckout=w}
 if(typeof window.hideCheckout==='function'&&!window.hideCheckout.__vx23){originalHideCheckout=window.hideCheckout;const w=function(){checkoutOpen=false;const r=originalHideCheckout.apply(this,arguments);sync();return r};w.__vx23=true;window.hideCheckout=w}
}
function actionFor(b){const a=b.dataset.vxAction;if(a==='return-shopping')return closeToCatalog;if(a==='notice-close')return closeNotice;if(a==='remove-cart'){const i=Number(b.dataset.cartIndex);if(Number.isInteger(i)&&typeof window.removeCart==='function')return()=>window.removeCart(i)}if(a==='checkout-next')return()=>{if(visible()&&checkoutOpen&&typeof window.nextCheckoutStep==='function')window.nextCheckoutStep()};if(a==='checkout-prev')return()=>{if(visible()&&checkoutOpen&&typeof window.prevCheckoutStep==='function')window.prevCheckoutStep()};if(a==='checkout-submit')return()=>{if(visible()&&checkoutOpen&&typeof window.submitCheckoutOrder==='function')window.submitCheckoutOrder()};if(a==='add-cart'){const i=Number(b.dataset.productIndex);if(Number.isInteger(i)&&typeof window.addWithQty==='function')return()=>window.addWithQty(i)}return null}
function buttonAction(b){
 let fn=actionFor(b);if(fn)return fn;
 if(b.matches('.remove')){const i=Number(b.dataset.cartIndex);if(Number.isInteger(i)&&typeof window.removeCart==='function')return()=>window.removeCart(i)}
 if(b.matches('.add-cart')){const m=(b.getAttribute('onclick')||'').match(/addWithQty\((\d+)\)/);if(m&&typeof window.addWithQty==='function')return()=>window.addWithQty(Number(m[1]))}
 if(b.matches('.ph-cancel-checkout'))return closeToCatalog;
 if(b.matches('.ph-next')){const oc=b.getAttribute('onclick')||'';if(/submitCheckoutOrder\s*\(/.test(oc))return()=>{if(visible()&&checkoutOpen)window.submitCheckoutOrder()};if(/nextCheckoutStep\s*\(/.test(oc))return()=>{if(visible()&&checkoutOpen)window.nextCheckoutStep()}}
 if(b.matches('.ph-back')&&/prevCheckoutStep/.test(b.getAttribute('onclick')||''))return()=>{if(visible()&&checkoutOpen)window.prevCheckoutStep()};return null;
}
function critical(e){const b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b)return null;if(b.matches('.add-cart,.remove,.ph-cancel-checkout,.ph-next,.ph-back,#returnToShoppingBtn,#vaporixEmptyCartNotice button'))return b;return null}
function dispatchOnce(e){const b=critical(e);if(!b)return;if(b.closest('#checkoutModal')&&!visible())return;const fn=buttonAction(b);if(!fn)return;const now=Date.now();if(lastButton===b&&now-lastTime<800){e.preventDefault();e.stopImmediatePropagation();return}lastButton=b;lastTime=now;e.preventDefault();e.stopImmediatePropagation();try{fn()}catch(err){console.error('VAPORIX button action',err)}setTimeout(sync,0)}
function bind(){if(document.__vx23Bound)return;document.__vx23Bound=true;window.addEventListener('touchend',dispatchOnce,{capture:true,passive:false});window.addEventListener('pointerup',dispatchOnce,{capture:true,passive:false});window.addEventListener('click',dispatchOnce,{capture:true,passive:false});window.addEventListener('click',function(e){const n=e.target&&e.target.closest?e.target.closest('#homeNav,#cartNav,#infoNav,#profileNav,[data-nav],.bottom-nav button,.bottom-nav a,nav button,nav a'):null;if(!n)return;checkoutOpen=false;const m=modal();if(m&&m.classList.contains('show')){try{if(originalHideCheckout)originalHideCheckout()}catch(err){}m.classList.remove('show');m.style.visibility='hidden';m.style.pointerEvents='none';m.setAttribute('aria-hidden','true');document.body.classList.remove('sheet-open','modal-open');document.body.style.overflow='auto'}},true)}
function installStyle(){let s=$('vaporix-live-v23-style');if(!s){s=document.createElement('style');s.id='vaporix-live-v23-style';document.head.appendChild(s)}s.textContent=`
#checkoutModal{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;overflow:hidden!important;z-index:1000!important}
#checkoutModal:not(.show){visibility:hidden!important;pointer-events:none!important}
#checkoutModal.show{visibility:visible!important;pointer-events:auto!important}
#checkoutModal .checkout-box{position:absolute!important;inset:0!important;width:100%!important;max-width:none!important;height:100%!important;max-height:100%!important;min-height:0!important;margin:0!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;padding:22px 16px calc(28px + env(safe-area-inset-bottom))!important}
#checkoutModal .checkout-summary,#checkoutModal .ph-form-card,#checkoutModal .ph-review-card{flex:none!important;overflow:visible!important}
#checkoutModal .ph-cancel-checkout,#checkoutModal .ph-back,#checkoutModal .ph-next{position:relative!important;z-index:50!important;display:block!important;width:100%!important;box-sizing:border-box!important;pointer-events:auto!important;touch-action:manipulation!important;flex:none!important}
#checkoutModal .ph-cancel-checkout{margin:10px 0!important}
#checkoutModal .ph-next{margin:10px 0!important}
#vaporixEmptyCartNotice{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.52);opacity:0;pointer-events:none;transition:opacity .12s ease}
#vaporixEmptyCartNotice.show{opacity:1;pointer-events:auto}
.vaporix-empty-box{width:min(390px,calc(100vw - 40px));padding:24px;border-radius:24px;background:linear-gradient(145deg,#242428,#1c1c20);border:1px solid #55515f;box-shadow:0 25px 80px rgba(0,0,0,.65);text-align:center}
.vaporix-empty-icon{font-size:28px;margin-bottom:8px}.vaporix-empty-text{font-size:19px;font-weight:900;margin-bottom:17px;color:#fff}.vaporix-empty-box button{width:100%;height:48px;border:1px solid #4a4850;border-radius:15px;background:#38383e;color:#fff;font-weight:900;font-size:16px;touch-action:manipulation}
.grid .add-cart,.grid .card-actions,.remove{position:relative!important;z-index:50!important;pointer-events:auto!important;touch-action:manipulation!important}
.ph-orders-section{position:relative!important;margin:0 0 24px!important;padding:17px!important;border-radius:24px!important;background:linear-gradient(145deg,rgba(42,28,58,.96),rgba(24,24,29,.98)) padding-box,linear-gradient(135deg,#8e4dff,#d42da8,#4e2a91) border-box!important;border:1px solid transparent!important;box-shadow:0 12px 34px rgba(93,45,170,.16),inset 0 1px 0 rgba(255,255,255,.06)!important;overflow:hidden!important}
.ph-orders-section:before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 90% 0,rgba(160,86,255,.12),transparent 38%)!important}
.ph-orders-title{position:relative!important;font-size:20px!important;font-weight:950!important;margin:0 0 13px!important;color:#fff!important}
.ph-order-card{position:relative!important;border-radius:18px!important;border:1px solid #4a4357!important;background:linear-gradient(145deg,#252329,#1c1c20)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.045)!important}
.ph-order-card:active{transform:scale(.995)!important}
.ph-order-status{box-shadow:0 0 0 1px rgba(154,104,255,.08),0 4px 14px rgba(111,49,215,.12)!important}
.ph-orders-empty{position:relative!important;padding:18px!important;border:1px dashed #5a5366!important;border-radius:18px!important;background:rgba(19,18,23,.58)!important;color:#a9a4b0!important;text-align:center!important}
`}
function boot(){installStyle();wrapApis();bind();sync();if(visible())ensureReturnButton()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.addEventListener('load',boot);[50,150,400,800,1500,3000].forEach(t=>setTimeout(boot,t));setInterval(()=>{installStyle();wrapApis();sync();if(visible())ensureReturnButton()},1200)
})();

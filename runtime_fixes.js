(function(){
'use strict';
if(window.__VAPORIX_LIVE_RUNTIME_V22)return;
window.__VAPORIX_LIVE_RUNTIME_V22=true;
const $=id=>document.getElementById(id);
let originalShowCheckout=null, originalHideCheckout=null, checkoutOpen=false;
let lastHandledButton=null,lastHandledAt=0;
function modal(){return $('checkoutModal')}
function visible(){const m=modal();return !!(m&&m.classList.contains('show')&&m.style.visibility!=='hidden')}
function sync(){const m=modal();if(m){m.style.visibility=m.classList.contains('show')?'visible':'hidden';m.style.pointerEvents=m.classList.contains('show')?'auto':'none'}if(typeof window.syncSheetState==='function')try{window.syncSheetState()}catch(e){}}
function notice(text){
 let n=$('vaporixEmptyCartNotice');
 if(!n){n=document.createElement('div');n.id='vaporixEmptyCartNotice';n.innerHTML='<div class="vaporix-empty-box"><div class="vaporix-empty-text"></div><button type="button" data-vx-action="notice-close">OK</button></div>';document.body.appendChild(n)}
 n.querySelector('.vaporix-empty-text').textContent=text;n.classList.add('show');
}
function closeNotice(){const n=$('vaporixEmptyCartNotice');if(n)n.classList.remove('show')}
window.showVaporixNotice=notice;
function closeToCatalog(){
 checkoutOpen=false;
 const m=modal();
 if(originalHideCheckout){try{originalHideCheckout()}catch(e){}}
 if(m){m.classList.remove('show');m.style.visibility='hidden';m.style.pointerEvents='none';m.setAttribute('aria-hidden','true')}
 document.body.classList.remove('sheet-open','modal-open');
 document.body.style.overflow='auto';
 try{if(typeof window.showCatalog==='function')window.showCatalog()}catch(e){}
 setTimeout(sync,0);
}
function openCheckout(){
 if(!Array.isArray(window.cart)||window.cart.length===0){notice('Сначала выберите товар');return false}
 checkoutOpen=true;
 const r=originalShowCheckout?originalShowCheckout():undefined;
 setTimeout(()=>{sync();ensureReturnButton()},0);
 return r===undefined?true:r;
}
function ensureReturnButton(){
 const m=modal();if(!m||!m.classList.contains('show'))return;
 const host=m.querySelector('#checkoutSummary')||m.querySelector('.checkout-box');
 if(!host||host.querySelector('#returnToShoppingBtn'))return;
 const next=host.querySelector('.ph-next,#phCheckoutAction');
 if(!next)return;
 const b=document.createElement('button');b.type='button';b.id='returnToShoppingBtn';b.className='ph-cancel-checkout ph-back';b.dataset.vxAction='return-shopping';b.textContent='← Вернуться к покупкам';
 next.parentNode.insertBefore(b,next);
}
function wrapApis(){
 if(typeof window.showCheckout==='function'&&!window.showCheckout.__vx22){
   originalShowCheckout=window.showCheckout;
   const w=function(){return openCheckout()};w.__vx22=true;window.showCheckout=w;window.showCartCheckout=w;
 }
 if(typeof window.hideCheckout==='function'&&!window.hideCheckout.__vx22){
   originalHideCheckout=window.hideCheckout;
   const w=function(){checkoutOpen=false;const r=originalHideCheckout.apply(this,arguments);sync();return r};w.__vx22=true;window.hideCheckout=w;
 }
}
function actionFor(b){
 const a=b.dataset.vxAction;
 if(a==='return-shopping')return closeToCatalog;
 if(a==='notice-close')return closeNotice;
 if(a==='remove-cart'){
   const i=Number(b.dataset.cartIndex);if(Number.isInteger(i))return()=>{if(typeof window.removeCart==='function')window.removeCart(i)};
 }
 if(a==='checkout-next')return()=>{if(visible()&&checkoutOpen&&typeof window.nextCheckoutStep==='function')window.nextCheckoutStep()};
 if(a==='checkout-prev')return()=>{if(visible()&&checkoutOpen&&typeof window.prevCheckoutStep==='function')window.prevCheckoutStep()};
 if(a==='checkout-submit')return()=>{if(visible()&&checkoutOpen&&typeof window.submitCheckoutOrder==='function')window.submitCheckoutOrder()};
 if(a==='add-cart'){
   const i=Number(b.dataset.productIndex);if(Number.isInteger(i)&&typeof window.addWithQty==='function')return()=>window.addWithQty(i);
 }
 return null;
}
function buttonAction(b){
 if(!b)return null;
 let fn=actionFor(b);if(fn)return fn;
 if(b.matches('.remove')){const i=Number(b.dataset.cartIndex);if(Number.isInteger(i)&&typeof window.removeCart==='function')return()=>window.removeCart(i)}
 if(b.matches('.add-cart')){const m=(b.getAttribute('onclick')||'').match(/addWithQty\((\d+)\)/);if(m&&typeof window.addWithQty==='function')return()=>window.addWithQty(Number(m[1]))}
 if(b.matches('.ph-cancel-checkout'))return closeToCatalog;
 if(b.matches('.ph-next')){
   const oc=b.getAttribute('onclick')||'';
   if(/submitCheckoutOrder\s*\(/.test(oc))return()=>{if(visible()&&checkoutOpen)window.submitCheckoutOrder()};
   if(/nextCheckoutStep\s*\(/.test(oc))return()=>{if(visible()&&checkoutOpen)window.nextCheckoutStep()};
 }
 if(b.matches('.ph-back')&&/prevCheckoutStep/.test(b.getAttribute('onclick')||''))return()=>{if(visible()&&checkoutOpen)window.prevCheckoutStep()};
 return null;
}
function critical(e){const b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b)return null;if(b.matches('.add-cart,.remove,.ph-cancel-checkout,.ph-next,.ph-back,#returnToShoppingBtn,#vaporixEmptyCartNotice button'))return b;return null}
function handlePointer(e){
 const b=critical(e);if(!b)return;
 if(b.closest('#checkoutModal')&&!visible())return;
 const fn=buttonAction(b);if(!fn)return;
 const now=Date.now();
 if(lastHandledButton===b&&now-lastHandledAt<700){e.preventDefault();e.stopImmediatePropagation();return}
 lastHandledButton=b;lastHandledAt=now;
 e.preventDefault();e.stopImmediatePropagation();fn();
 setTimeout(sync,0);
}
function handleClickFallback(e){
 const b=critical(e);if(!b)return;
 if(b.closest('#checkoutModal')&&!visible())return;
 const fn=buttonAction(b);if(!fn)return;
 const now=Date.now();
 if(lastHandledButton===b&&now-lastHandledAt<700){e.preventDefault();e.stopImmediatePropagation();return}
 lastHandledButton=b;lastHandledAt=now;e.preventDefault();e.stopImmediatePropagation();fn();setTimeout(sync,0);
}
function bind(){
 if(document.__vx22Bound)return;document.__vx22Bound=true;
 document.addEventListener('pointerup',handlePointer,true);
 document.addEventListener('click',handleClickFallback,true);
 document.addEventListener('click',function(e){
   const n=e.target&&e.target.closest?e.target.closest('#homeNav,#cartNav,#infoNav,#profileNav,[data-nav],.bottom-nav button,.bottom-nav a,nav button,nav a'):null;
   if(!n)return;
   checkoutOpen=false;const m=modal();if(m&&m.classList.contains('show')){if(originalHideCheckout)try{originalHideCheckout()}catch(err){}m.classList.remove('show');m.style.visibility='hidden';m.style.pointerEvents='none';m.setAttribute('aria-hidden','true');document.body.classList.remove('sheet-open','modal-open');document.body.style.overflow='auto'}
 },true);
}
function installStyle(){
 let s=$('vaporix-live-v22-style');if(!s){s=document.createElement('style');s.id='vaporix-live-v22-style';document.head.appendChild(s)}
 s.textContent=`
#checkoutModal{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;overflow:hidden!important;z-index:1000!important}
#checkoutModal:not(.show){visibility:hidden!important;pointer-events:none!important}
#checkoutModal.show{visibility:visible!important;pointer-events:auto!important}
#checkoutModal .checkout-box{position:absolute!important;inset:0!important;width:100%!important;max-width:none!important;height:100%!important;max-height:100%!important;min-height:0!important;margin:0!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;padding:22px 16px calc(28px + env(safe-area-inset-bottom))!important}
#checkoutModal .checkout-summary,#checkoutModal .ph-form-card,#checkoutModal .ph-review-card{flex:none!important;overflow:visible!important}
#checkoutModal .ph-cancel-checkout,#checkoutModal .ph-back,#checkoutModal .ph-next{position:relative!important;z-index:50!important;display:block!important;width:100%!important;box-sizing:border-box!important;pointer-events:auto!important;touch-action:manipulation!important;flex:none!important}
#checkoutModal .ph-cancel-checkout{margin:10px 0!important}
#checkoutModal .ph-next{margin:10px 0!important}
#vaporixEmptyCartNotice{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.48);opacity:0;pointer-events:none;transition:opacity .12s ease}
#vaporixEmptyCartNotice.show{opacity:1;pointer-events:auto}
.vaporix-empty-box{width:min(360px,calc(100vw - 40px));padding:20px;border-radius:20px;background:#202023;border:1px solid #45454c;box-shadow:0 20px 70px rgba(0,0,0,.5);text-align:center}
.vaporix-empty-text{font-size:18px;font-weight:850;margin-bottom:16px;color:#fff}
.vaporix-empty-box button{width:100%;height:44px;border:0;border-radius:13px;background:#37373c;color:#fff;font-weight:850}
.grid .add-cart,.grid .card-actions,.remove{position:relative!important;z-index:50!important;pointer-events:auto!important;touch-action:manipulation!important}
`;
}
function boot(){installStyle();wrapApis();bind();sync();if(visible())ensureReturnButton()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',boot);
[50,150,400,800,1500,3000].forEach(t=>setTimeout(boot,t));
setInterval(()=>{installStyle();wrapApis();sync();if(visible())ensureReturnButton()},1500);
})();

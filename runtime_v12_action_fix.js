(function(){
'use strict';
/* VAPORIX V12: hard-wire the checkout action tap. The review button must either submit or show the persistent empty-cart notice. */
if(window.__VAPORIX_RUNTIME_V12_ACTION_FIX)return;
window.__VAPORIX_RUNTIME_V12_ACTION_FIX=true;
function hasCartItems(){
  try{
    if(Array.isArray(window.cart)) return window.cart.some(function(x){return x&&Number(x.qty||0)>0});
  }catch(e){}
  try{
    if(typeof cart!=='undefined'&&Array.isArray(cart)) return cart.some(function(x){return x&&Number(x.qty||0)>0});
  }catch(e){}
  return false;
}
function emptyNotice(){
  var n=document.getElementById('vaporixEmptyCartNotice');
  if(n){n.classList.add('show');document.body.classList.add('vaporix-empty-notice-open');return;}
  if(typeof window.showEmptyNotice==='function'){window.showEmptyNotice();return;}
  n=document.createElement('div');
  n.id='vaporixEmptyCartNotice';
  n.innerHTML='<div class="vaporix-empty-box"><div class="vaporix-empty-icon">🛒</div><div class="vaporix-empty-text">Сначала выберите товар</div><button type="button">OK</button></div>';
  document.body.appendChild(n);
  n.classList.add('show');
  document.body.classList.add('vaporix-empty-notice-open');
  n.querySelector('button').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();n.classList.remove('show');document.body.classList.remove('vaporix-empty-notice-open');});
}
function install(){
  if(window.__VAPORIX_V12_HANDLER)return;
  window.__VAPORIX_V12_HANDLER=true;
  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('#checkoutModal .ph-next'):null;
    if(!t)return;
    var label=(t.textContent||'').trim();
    if(label!=='Оформить заказ')return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(!hasCartItems()){
      emptyNotice();
      return false;
    }
    if(typeof window.submitCheckoutOrder==='function'){
      Promise.resolve(window.submitCheckoutOrder()).catch(function(err){console.error(err);});
    }else{
      console.error('VAPORIX V12: submitCheckoutOrder is unavailable');
    }
    return false;
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('load',install);
setTimeout(install,250);setTimeout(install,1000);
})();

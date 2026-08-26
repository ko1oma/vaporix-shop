(function(){
'use strict';
/* VAPORIX V13: reliable Step-3 -> Step-4 checkout action. */
if(window.__VAPORIX_RUNTIME_V13_CHECKOUT_ACTION)return;
window.__VAPORIX_RUNTIME_V13_CHECKOUT_ACTION=true;

function getCart(){
  try{
    if(Array.isArray(window.cart)&&window.cart.some(function(x){return x&&Number(x.qty||0)>0})) return window.cart;
  }catch(e){}
  try{
    if(typeof cart!=='undefined'&&Array.isArray(cart)&&cart.some(function(x){return x&&Number(x.qty||0)>0})) return cart;
  }catch(e){}
  return [];
}

function showEmpty(){
  var n=document.getElementById('vaporixEmptyCartNotice');
  if(n){n.classList.add('show');document.body.classList.add('vaporix-empty-notice-open');return;}
  n=document.createElement('div');
  n.id='vaporixEmptyCartNotice';
  n.innerHTML='<div class="vaporix-empty-box"><div class="vaporix-empty-icon">🛒</div><div class="vaporix-empty-text">Сначала выберите товар</div><button type="button">OK</button></div>';
  document.body.appendChild(n);
  n.classList.add('show');
  document.body.classList.add('vaporix-empty-notice-open');
  n.querySelector('button').addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    n.classList.remove('show');document.body.classList.remove('vaporix-empty-notice-open');
  });
}

function patchSubmit(){
  var fn=window.submitCheckoutOrder;
  if(typeof fn!=='function'||fn.__vaporixV13)return false;
  if(window.__VAPORIX_SUBMIT_V13_ORIGINAL===fn)return true;
  window.__VAPORIX_SUBMIT_V13_ORIGINAL=fn;
  async function reliableSubmit(){
    var c=getCart();
    if(!c.length){showEmpty();return false;}
    /* The original checkout code reads window.cart before doing anything. */
    try{window.cart=c;}catch(e){}
    try{
      var result=await fn.apply(this,arguments);
      return result;
    }catch(e){
      console.error('VAPORIX checkout:',e);
      try{window.alert(String(e&&e.message||'Не удалось оформить заказ.').replace(/^Error:\s*/i,''));}catch(_e){}
      var b=document.getElementById('phCheckoutAction');
      if(b){b.disabled=false;b.textContent='Оформить заказ';}
      return false;
    }
  }
  reliableSubmit.__vaporixV13=true;
  window.submitCheckoutOrder=reliableSubmit;
  return true;
}

function install(){
  patchSubmit();
  if(window.__VAPORIX_V13_CLICK_HANDLER)return;
  window.__VAPORIX_V13_CLICK_HANDLER=true;
  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('#checkoutModal .ph-next'):null;
    if(!t)return;
    if((t.textContent||'').trim()!=='Оформить заказ')return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var c=getCart();
    if(!c.length){showEmpty();return false;}
    try{window.cart=c;}catch(_e){}
    patchSubmit();
    if(typeof window.submitCheckoutOrder==='function'){
      Promise.resolve(window.submitCheckoutOrder()).catch(function(err){console.error('VAPORIX checkout:',err);});
    }else{
      console.error('VAPORIX: submitCheckoutOrder is unavailable');
    }
    return false;
  },true);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
window.addEventListener('load',install);
[100,300,700,1200,2000].forEach(function(t){setTimeout(install,t)});
})();

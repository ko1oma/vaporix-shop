(function(){
  'use strict';
  if(window.__VAPORIX_CHECKOUT_BACK_FIX_V1)return;
  window.__VAPORIX_CHECKOUT_BACK_FIX_V1=true;

  function closeCheckoutAndReturn(){
    const modal=document.getElementById('checkoutModal');
    try{ if(typeof window.hideCheckout==='function'){ window.hideCheckout(); return; } }catch(e){}
    if(modal){
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden','true');
    }
    try{ document.documentElement.style.overflow=''; document.body.style.overflow=''; }catch(e){}
    try{ if(typeof window.showCart==='function'){ window.showCart(); return; } }catch(e){}
    try{ if(typeof window.showCatalog==='function')window.showCatalog(); }catch(e){}
  }

  function inject(){
    const modal=document.getElementById('checkoutModal');
    if(!modal || !modal.classList.contains('show'))return;
    const box=modal.querySelector('.checkout-box');
    if(!box)return;

    const count=box.querySelector('.ph-step-count');
    const title=box.querySelector('.ph-checkout-title h1');
    const isStep1=(count && /^\s*1\s*\/\s*4\s*$/.test(count.textContent||'')) || (title && /контактные\s+данные/i.test(title.textContent||''));
    if(!isStep1)return;

    let back=box.querySelector('#vaporixCheckoutBack');
    if(back)return;

    back=document.createElement('button');
    back.id='vaporixCheckoutBack';
    back.type='button';
    back.className='vaporix-checkout-back';
    back.textContent='← Вернуться к покупкам';
    back.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeCheckoutAndReturn();
    },true);

    const action=box.querySelector('#phCheckoutAction');
    if(action)box.insertBefore(back,action);
    else box.appendChild(back);
  }

  const style=document.createElement('style');
  style.textContent=`
    #vaporixCheckoutBack.vaporix-checkout-back{
      display:block!important;
      width:100%!important;
      min-height:54px!important;
      margin:10px 0 10px!important;
      padding:0 18px!important;
      box-sizing:border-box!important;
      border-radius:17px!important;
      border:1px solid #60408f!important;
      background:#21152f!important;
      color:#c4a0ff!important;
      font-size:16px!important;
      font-weight:850!important;
      line-height:1!important;
      text-align:center!important;
      cursor:pointer!important;
      pointer-events:auto!important;
      -webkit-tap-highlight-color:transparent!important;
      touch-action:manipulation!important;
    }
    #vaporixCheckoutBack.vaporix-checkout-back:active{
      transform:scale(.99)!important;
      background:#32164f!important;
      color:#fff!important;
    }
  `;
  document.head.appendChild(style);

  const observer=new MutationObserver(inject);
  function run(){
    inject();
    if(document.body && !observer.__started){
      observer.observe(document.body,{childList:true,subtree:true});
      observer.__started=true;
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  window.addEventListener('load',run);
  setTimeout(run,200);
  setTimeout(run,700);
  setTimeout(run,1500);
  setInterval(inject,400);
})();

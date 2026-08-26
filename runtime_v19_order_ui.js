(function(){
'use strict';
/* VAPORIX V19 — compact static order cards + reliable order-info action. */
if(window.__VAPORIX_ORDER_UI_V19)return;
window.__VAPORIX_ORDER_UI_V19=true;

function compactStyles(){
 if(document.getElementById('v19-order-ui-style'))return;
 var s=document.createElement('style');
 s.id='v19-order-ui-style';
 s.textContent=`
 /* Compact, stable profile order cards. No transforms/animations/layout jumps. */
 #phOrdersSection,#phOrdersList{animation:none!important;transition:none!important;contain:layout paint!important}
 #phOrdersList{display:block!important;width:100%!important}
 #phOrdersList .ph-order-card{
   display:block!important;
   width:100%!important;
   height:auto!important;
   min-height:0!important;
   max-height:none!important;
   box-sizing:border-box!important;
   margin:0 0 10px!important;
   padding:54px 14px 12px!important;
   border-radius:18px!important;
   overflow:hidden!important;
   position:relative!important;
   text-align:left!important;
   line-height:1.2!important;
   vertical-align:top!important;
   transform:none!important;
   animation:none!important;
   transition:none!important;
   will-change:auto!important;
 }
 #phOrdersList .ph-order-top{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:8px!important;margin:0!important}
 #phOrdersList .ph-order-id{display:block!important;flex:1 1 auto!important;min-width:0!important;font-size:16px!important;line-height:1.18!important;word-break:break-word!important}
 #phOrdersList .ph-order-total{display:block!important;flex:0 0 auto!important;font-size:16px!important;line-height:1.15!important;white-space:nowrap!important}
 #phOrdersList .ph-order-meta{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;margin:7px 0 0!important;font-size:10px!important;line-height:1.2!important}
 #phOrdersList .ph-order-status{display:inline-flex!important;align-items:center!important;height:28px!important;box-sizing:border-box!important;margin:7px 0 0!important;padding:5px 10px!important;font-size:10px!important;line-height:1!important}
 #phOrdersList .ph-order-sync{margin:5px 0 0!important;font-size:9px!important;line-height:1.15!important}
 #phOrdersList .ph-order-products-preview{display:flex!important;align-items:center!important;gap:7px!important;height:54px!important;margin:9px 0 0!important;overflow:hidden!important}
 #phOrdersList .ph-order-thumb{display:block!important;flex:0 0 48px!important;width:48px!important;height:54px!important;box-sizing:border-box!important;border-radius:10px!important;object-fit:contain!important}
 #phOrdersList .v18-order-delivery{position:absolute!important;left:14px!important;right:14px!important;top:10px!important;width:auto!important;height:32px!important;box-sizing:border-box!important;margin:0!important;padding:8px 11px!important;border-radius:10px!important;font-size:11px!important;line-height:16px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;animation:none!important;transition:none!important;transform:none!important}
 /* The success-screen info action is a real button, not decorative text. */
 #checkoutModal .v19-order-info,
 #checkoutModal .v19-order-info.ph-next{
   display:block!important;
   width:100%!important;
   min-height:56px!important;
   margin-top:12px!important;
   pointer-events:auto!important;
   touch-action:manipulation!important;
   position:relative!important;
   z-index:20010!important;
   cursor:pointer!important;
 }
 `;
 document.head.appendChild(s);
}

function orderInfoId(){
 try{
   var customer=JSON.parse(localStorage.getItem('puffhubCustomerV1')||'{}');
   if(customer&&customer.lastOrder&&customer.lastOrder.id)return customer.lastOrder.id;
 }catch(e){}
 try{
   var a=JSON.parse(localStorage.getItem('puffhubOrdersV1')||'[]');
   if(a&&a[0]&&a[0].id)return a[0].id;
 }catch(e){}
 return '';
}

function installInfoAction(){
 document.querySelectorAll('#checkoutModal .ph-next').forEach(function(btn){
   var text=(btn.textContent||'').trim();
   if(text!=='Информация о заказе')return;
   btn.classList.add('v19-order-info');
   if(btn.dataset.v19Bound==='1')return;
   btn.dataset.v19Bound='1';
   btn.onclick=function(e){
     e.preventDefault();
     e.stopPropagation();
     var id=orderInfoId();
     if(!id)return;
     if(typeof window.openOrderDetailById==='function')window.openOrderDetailById(id);
   };
 });
}

function installDelegatedOrderClick(){
 if(window.__VAPORIX_V19_ORDER_CLICK)return;
 window.__VAPORIX_V19_ORDER_CLICK=true;
 document.addEventListener('click',function(e){
   var card=e.target&&e.target.closest?e.target.closest('#phOrdersList .ph-order-card'):null;
   if(!card)return;
   e.preventDefault();
   e.stopImmediatePropagation();
   var idEl=card.querySelector('.ph-order-id');
   var id=idEl?(idEl.textContent||'').trim():'';
   if(id&&typeof window.openOrderDetailById==='function')window.openOrderDetailById(id);
 },true);
}

function boot(){
 compactStyles();
 installInfoAction();
 installDelegatedOrderClick();
 setTimeout(installInfoAction,100);
 setTimeout(installInfoAction,500);
 setTimeout(installInfoAction,1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

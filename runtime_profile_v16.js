(function(){
'use strict';
/* VAPORIX V18 — stable order cards + hard overlay/nav recovery. */
if(window.__VAPORIX_PROFILE_V18)return;
window.__VAPORIX_PROFILE_V18=true;
var ORDERS='puffhubOrdersV1';
function orders(){try{return JSON.parse(localStorage.getItem(ORDERS)||'[]')||[]}catch(e){return[]}}
function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]})}
function forceUiUnlocked(){
 var checkout=document.getElementById('checkoutModal'),detail=document.getElementById('orderDetailModal'),flavor=document.getElementById('phFlavorChooser');
 if(checkout&&!checkout.classList.contains('show')){checkout.style.pointerEvents='none';checkout.style.visibility='hidden'}
 if(detail&&!detail.classList.contains('show')){detail.style.pointerEvents='none';detail.style.visibility='hidden'}
 if(flavor&&!flavor.classList.contains('show')){flavor.style.pointerEvents='none';flavor.style.visibility='hidden'}
 var open=!!((checkout&&checkout.classList.contains('show'))||(detail&&detail.classList.contains('show'))||(flavor&&flavor.classList.contains('show')));
 if(!open){document.body.style.overflow='auto';document.body.style.touchAction='auto'}
 document.querySelectorAll('[onclick*="showProfile"],[onclick*="showCart"],[onclick*="showCatalog"],[onclick*="showInfo"]').forEach(function(el){el.style.pointerEvents='auto';el.style.touchAction='manipulation';el.style.position='relative';el.style.zIndex='20000'});
}
function closeDetailAndReturn(){
 var m=document.getElementById('orderDetailModal');if(m){m.classList.remove('show');m.style.pointerEvents='none';m.style.visibility='hidden'}
 var checkout=document.getElementById('checkoutModal');if(checkout){checkout.classList.remove('show');checkout.style.pointerEvents='none';checkout.style.visibility='hidden'}
 try{if(typeof window.hideCheckout==='function')window.hideCheckout()}catch(e){}
 try{if(typeof window.showCatalog==='function')window.showCatalog()}catch(e){}
 document.body.style.overflow='auto';document.body.style.touchAction='auto';
 setTimeout(forceUiUnlocked,0);setTimeout(forceUiUnlocked,100);setTimeout(forceUiUnlocked,400);
}
function decorateProfile(){
 var list=document.getElementById('phOrdersList');if(!list)return;var stored=orders();
 list.querySelectorAll('.ph-order-card').forEach(function(card){
  card.style.position='relative';card.style.boxSizing='border-box';card.style.paddingTop='60px';card.style.minHeight='238px';
  var idEl=card.querySelector('.ph-order-id');if(!idEl)return;var id=idEl.textContent.trim();
  if(card.querySelector('.v18-order-delivery'))return;var o=stored.find(function(x){return String(x.id)===id});if(!o)return;
  var d=o.delivery||{},method=d.method||'DPD',address=[d.postcode,d.city,d.street,d.house].filter(Boolean).join(' ');
  var row=document.createElement('div');row.className='v18-order-delivery';row.textContent=method+(address?' · '+address:'');card.appendChild(row);
 });
}
function addDetailControls(){
 var modal=document.getElementById('orderDetailModal');if(!modal)return;var content=document.getElementById('orderDetailContent');if(!content)return;
 var head=content.querySelector('.ph-detail-head');
 if(head){var idText='',oldSub=head.querySelector('div > div');if(oldSub)idText=oldSub.textContent.trim();head.innerHTML='<div><h2 style="margin:0">Информация о заказе</h2>'+(idText?'<div style="color:#999;font-size:11px">'+esc(idText)+'</div>':'')+'</div>';head.className='v18-detail-head'}
 content.querySelectorAll('.v16-detail-head,.v17-detail-head').forEach(function(x){if(x!==head)x.remove()});content.querySelectorAll('.v16-detail-close,.v17-detail-close').forEach(function(x){x.remove()});
 var refresh=content.querySelector('.ph-order-refresh');
 if(refresh){var oc=refresh.getAttribute('onclick')||'',m=oc.match(/refreshSingleOrder\((?:'|\")([^'\"]+)(?:'|\")\)/);if(m)refresh.setAttribute('data-order-id',m[1]);refresh.disabled=false;refresh.style.pointerEvents='auto';refresh.style.touchAction='manipulation';refresh.style.position='relative';refresh.style.zIndex='20001'}
 var bottom=content.querySelector('.v18-detail-bottom-close');
 if(!bottom){bottom=document.createElement('button');bottom.type='button';bottom.className='v18-detail-bottom-close';bottom.textContent='Закрыть';content.appendChild(bottom)}
 bottom.onclick=function(e){e.preventDefault();e.stopPropagation();closeDetailAndReturn()};
}
function wrapOpenDetail(){
 if(typeof window.openOrderDetailById!=='function'||window.openOrderDetailById.__v18)return;var original=window.openOrderDetailById;
 function wrapped(id){var checkout=document.getElementById('checkoutModal');if(checkout)checkout.style.pointerEvents='none';var r=original.apply(this,arguments);setTimeout(function(){var d=document.getElementById('orderDetailModal');if(d){d.style.visibility='visible';d.style.pointerEvents='auto'}addDetailControls()},0);return r}
 wrapped.__v18=true;window.openOrderDetailById=wrapped;
}
function wrapProfile(){
 if(typeof window.showProfile!=='function'||window.showProfile.__v18)return;var original=window.showProfile;
 async function wrapped(){var r=await original.apply(this,arguments);setTimeout(function(){decorateProfile();forceUiUnlocked()},0);return r}
 wrapped.__v18=true;window.showProfile=wrapped;
}
function installRefresh(){
 if(window.__VAPORIX_REFRESH_V18)return;window.__VAPORIX_REFRESH_V18=true;
 document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('.ph-order-refresh'):null;if(!t)return;e.preventDefault();e.stopImmediatePropagation();var id=t.getAttribute('data-order-id');if(!id){var oc=t.getAttribute('onclick')||'',m=oc.match(/refreshSingleOrder\((?:'|\")([^'\"]+)(?:'|\")\)/);id=m&&m[1]}if(!id||t.dataset.loading==='1')return;t.dataset.loading='1';t.disabled=true;t.textContent='Обновляем…';Promise.resolve().then(function(){if(typeof window.refreshSingleOrder!=='function')throw new Error('refresh unavailable');return window.refreshSingleOrder(id)}).catch(function(err){console.error(err)}).finally(function(){t.dataset.loading='0';t.disabled=false;t.textContent='Обновить статус';setTimeout(addDetailControls,0)})},true);
}
function styles(){
 if(document.getElementById('v18-profile-order-style'))return;var s=document.createElement('style');s.id='v18-profile-order-style';s.textContent=`
#checkoutModal:not(.show),#orderDetailModal:not(.show),#phFlavorChooser:not(.show){pointer-events:none!important;visibility:hidden!important;opacity:0!important}
#checkoutModal.show{visibility:visible!important;pointer-events:auto!important;opacity:1!important}
#orderDetailModal.show{visibility:visible!important;pointer-events:auto!important;opacity:1!important}
#phFlavorChooser.show{visibility:visible!important;pointer-events:auto!important;opacity:1!important}
#phOrdersSection,#phOrdersList{contain:layout paint;animation:none!important;transition:none!important}
#phOrdersList .ph-order-card{position:relative!important;box-sizing:border-box!important;padding-top:60px!important;min-height:238px!important;animation:none!important;transition:none!important;transform:none!important;will-change:auto!important}
#phOrdersList .v18-order-delivery{position:absolute!important;left:17px!important;right:17px!important;top:10px!important;height:38px!important;box-sizing:border-box!important;margin:0!important;padding:10px 13px!important;border-radius:12px!important;background:#351077!important;color:#b98cff!important;font-size:13px!important;font-weight:850!important;text-align:left!important;overflow:hidden!important;white-space:nowrap!important;text-overflow:ellipsis!important;animation:none!important;transition:none!important;transform:none!important}
.v18-detail-head{display:block!important;margin:0 0 12px!important}.v18-detail-head h2{margin:0!important;font-size:24px!important;line-height:1.1!important}
.v18-detail-bottom-close{display:block!important;width:100%!important;height:52px!important;margin:16px 0 0!important;border-radius:14px!important;background:#321070!important;border:1px solid #6437a2!important;color:#b98cff!important;font-weight:900!important;font-size:16px!important;pointer-events:auto!important;touch-action:manipulation!important;position:relative!important;z-index:20001!important}
.ph-order-refresh{pointer-events:auto!important;touch-action:manipulation!important;position:relative!important;z-index:20001!important}
`;
document.head.appendChild(s);
}
function boot(){styles();wrapOpenDetail();wrapProfile();installRefresh();decorateProfile();forceUiUnlocked()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
setTimeout(boot,300);setTimeout(boot,1000);setInterval(forceUiUnlocked,500);
})();

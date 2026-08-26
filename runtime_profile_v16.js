(function(){
'use strict';
/* VAPORIX profile/order detail fix V17: one header, bottom-only close, stable cards, working refresh and navigation. */
if(window.__VAPORIX_PROFILE_V17)return;
window.__VAPORIX_PROFILE_V17=true;
var ORDERS='puffhubOrdersV1';
function orders(){try{return JSON.parse(localStorage.getItem(ORDERS)||'[]')||[]}catch(e){return[]}}
function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]})}
function closeDetailAndReturn(){
  try{if(typeof window.closeOrderDetail==='function')window.closeOrderDetail()}catch(e){var m=document.getElementById('orderDetailModal');if(m)m.classList.remove('show')}
  document.body.style.overflow='auto';
  var checkout=document.getElementById('checkoutModal');
  if(checkout&&checkout.classList.contains('show')){
    try{if(typeof window.hideCheckout==='function')window.hideCheckout();else checkout.classList.remove('show')}catch(e){checkout.classList.remove('show')}
    document.body.style.overflow='auto';
    try{if(typeof window.showCatalog==='function')window.showCatalog()}catch(e){}
  }
}
function decorateProfile(){
  var list=document.getElementById('phOrdersList');
  if(!list)return;
  var stored=orders();
  list.querySelectorAll('.ph-order-card').forEach(function(card){
    var idEl=card.querySelector('.ph-order-id');
    if(!idEl)return;
    var id=idEl.textContent.trim();
    if(card.querySelector('.v17-order-delivery'))return;
    var o=stored.find(function(x){return String(x.id)===id});
    if(!o)return;
    var d=o.delivery||{};
    var method=d.method||'DPD';
    var address=[d.postcode,d.city,d.street,d.house].filter(Boolean).join(' ');
    var row=document.createElement('div');
    row.className='v17-order-delivery';
    row.textContent=method+(address?' · '+address:'');
    var meta=card.querySelector('.ph-order-meta');
    if(meta)meta.insertAdjacentElement('afterend',row);else card.insertBefore(row,card.firstChild.nextSibling);
  });
}
function addDetailControls(){
  var modal=document.getElementById('orderDetailModal');
  if(!modal)return;
  var box=modal.querySelector('.ph-order-detail-box');
  var content=document.getElementById('orderDetailContent');
  if(!box||!content)return;

  /* Keep exactly one title and remove the original top close button. */
  var head=content.querySelector('.ph-detail-head');
  if(head){
    var idText='';
    var oldSub=head.querySelector('div > div');
    if(oldSub)idText=oldSub.textContent.trim();
    head.innerHTML='<div><h2 style="margin:0">Информация о заказе</h2>'+(idText?'<div style="color:#999;font-size:11px">'+esc(idText)+'</div>':'')+'</div>';
    head.className='v17-detail-head';
  }
  /* Remove any header accidentally injected by older V16 code. */
  content.querySelectorAll('.v16-detail-head').forEach(function(x){if(x!==head)x.remove()});
  content.querySelectorAll('.v16-detail-close').forEach(function(x){x.remove()});

  var refresh=content.querySelector('.ph-order-refresh');
  if(refresh){
    var oc=refresh.getAttribute('onclick')||'';
    var m=oc.match(/refreshSingleOrder\((?:'|\")([^'\"]+)(?:'|\")\)/);
    if(m)refresh.setAttribute('data-order-id',m[1]);
    refresh.disabled=false;
    refresh.style.pointerEvents='auto';
    refresh.style.touchAction='manipulation';
  }
  var bottom=content.querySelector('.v17-detail-bottom-close');
  if(!bottom){
    bottom=document.createElement('button');
    bottom.type='button';
    bottom.className='v17-detail-bottom-close';
    bottom.textContent='Закрыть';
    content.appendChild(bottom);
  }
  bottom.onclick=function(e){e.preventDefault();e.stopPropagation();closeDetailAndReturn()};
}
function wrapOpenDetail(){
  if(typeof window.openOrderDetailById!=='function'||window.openOrderDetailById.__v17)return;
  var original=window.openOrderDetailById;
  function wrapped(id){var r=original.apply(this,arguments);setTimeout(addDetailControls,0);return r}
  wrapped.__v17=true;
  window.openOrderDetailById=wrapped;
}
function wrapProfile(){
  if(typeof window.showProfile!=='function'||window.showProfile.__v17)return;
  var original=window.showProfile;
  async function wrapped(){
    var r=await original.apply(this,arguments);
    /* One post-render decoration only. No MutationObserver and no innerHTML replacement. */
    setTimeout(decorateProfile,0);
    return r;
  }
  wrapped.__v17=true;
  window.showProfile=wrapped;
}
function installRefresh(){
  if(window.__VAPORIX_REFRESH_V17)return;
  window.__VAPORIX_REFRESH_V17=true;
  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('.ph-order-refresh'):null;
    if(!t)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var id=t.getAttribute('data-order-id');
    if(!id){
      var oc=t.getAttribute('onclick')||'';
      var m=oc.match(/refreshSingleOrder\((?:'|\")([^'\"]+)(?:'|\")\)/);
      id=m&&m[1];
    }
    if(!id||t.dataset.loading==='1')return;
    t.dataset.loading='1';t.disabled=true;t.textContent='Обновляем…';
    Promise.resolve().then(function(){
      if(typeof window.refreshSingleOrder!=='function')throw new Error('refresh unavailable');
      return window.refreshSingleOrder(id);
    }).catch(function(err){console.error(err)}).finally(function(){
      t.dataset.loading='0';
      t.disabled=false;
      t.textContent='Обновить статус';
      setTimeout(addDetailControls,0);
    });
  },true);
}
function styles(){
  if(document.getElementById('v17-profile-order-style'))return;
  var s=document.createElement('style');
  s.id='v17-profile-order-style';
  s.textContent=`
.v17-order-delivery{margin-top:10px;padding:10px 13px;border-radius:12px;background:#351077;color:#b98cff;font-size:13px;font-weight:850;text-align:left}
.v17-detail-head{display:block!important;margin:0 0 12px!important}
.v17-detail-head h2{margin:0!important;font-size:24px!important;line-height:1.1!important}
.ph-order-detail{z-index:50000!important;pointer-events:none}
.ph-order-detail.show{pointer-events:auto!important}
.ph-order-detail-box{z-index:50001!important;pointer-events:auto!important;touch-action:pan-y!important}
.ph-order-refresh{position:relative!important;z-index:50010!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important}
.ph-order-refresh:disabled{opacity:.65!important}
.v17-detail-bottom-close{display:block!important;width:100%!important;height:52px!important;margin:16px 0 0!important;border-radius:14px!important;background:#321070!important;border:1px solid #6437a2!important;color:#b98cff!important;font-weight:900!important;font-size:16px!important;pointer-events:auto!important;touch-action:manipulation!important;position:relative!important;z-index:50010!important}
`;
  document.head.appendChild(s);
}
function boot(){styles();wrapOpenDetail();wrapProfile();installRefresh();addDetailControls()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
setTimeout(boot,300);
setTimeout(boot,1000);
})();

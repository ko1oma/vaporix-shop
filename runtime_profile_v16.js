(function(){
'use strict';
/* VAPORIX V16 profile/order detail fix: stable profile cards, working refresh, explicit close controls. */
if(window.__VAPORIX_PROFILE_V16)return;
window.__VAPORIX_PROFILE_V16=true;
var ORDERS='puffhubOrdersV1';
function orders(){try{return JSON.parse(localStorage.getItem(ORDERS)||'[]')||[]}catch(e){return[]}}
function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]})}
function enhanceProfile(){
  var list=document.getElementById('phOrdersList');
  if(!list)return;
  var stored=orders();
  list.querySelectorAll('.ph-order-card').forEach(function(card){
    if(card.dataset.v16Done==='1')return;
    var idEl=card.querySelector('.ph-order-id');
    if(!idEl)return;
    var id=idEl.textContent.trim();
    var o=stored.find(function(x){return String(x.id)===id});
    if(!o)return;
    var totalEl=card.querySelector('.ph-order-total');
    var status=card.querySelector('.ph-order-status');
    var thumbs=card.querySelector('.ph-order-products-preview');
    var date=o.date||'';
    var method=o.delivery&&o.delivery.method?o.delivery.method:'DPD';
    var address=o.delivery?[o.delivery.postcode,o.delivery.street,o.delivery.house].filter(Boolean).join(' '):'';
    var statusText=status?status.textContent.trim():'Создан';
    var statusClass=status?status.className:'ph-order-status status-new';
    card.innerHTML='<div class="ph-order-top"><span class="ph-order-id">'+esc(id)+'</span><span class="ph-order-total">'+(totalEl?esc(totalEl.textContent):Number(o.total||0).toFixed(2)+' EUR')+'</span></div>'+
      '<div class="v16-order-delivery">'+esc(method)+(address?' · '+esc(address):'')+'</div>'+
      '<div class="v16-order-date">'+esc(date)+'</div>'+
      '<div class="v16-order-status-row"><span>Статус заказа:</span><span class="'+esc(statusClass)+' v16-status">'+esc(statusText)+'</span></div>'+
      (thumbs?thumbs.outerHTML:'');
    card.classList.add('v16-order-card');
    card.dataset.v16Done='1';
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.onclick=function(e){if(e.target&&e.target.closest&&e.target.closest('button,a'))return;if(typeof window.openOrderDetailById==='function')window.openOrderDetailById(id)};
    card.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();if(typeof window.openOrderDetailById==='function')window.openOrderDetailById(id)}};
  });
}
function installProfileObserver(){
  if(window.__VAPORIX_PROFILE_OBSERVER_V16)return;
  window.__VAPORIX_PROFILE_OBSERVER_V16=true;
  var obs=new MutationObserver(function(){enhanceProfile()});
  var start=function(){var list=document.getElementById('phOrdersList');if(list)obs.observe(list,{childList:true,subtree:true});enhanceProfile()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
}
function addDetailControls(){
  var modal=document.getElementById('orderDetailModal');
  if(!modal)return;
  var box=modal.querySelector('.ph-order-detail-box');
  var content=document.getElementById('orderDetailContent');
  if(!box||!content)return;
  var head=content.querySelector('.ph-detail-head');
  if(!head){
    head=document.createElement('div');head.className='v16-detail-head';
    var title=document.createElement('div');title.innerHTML='<h2>Информация о заказе</h2><div class="v16-detail-sub">Заказ</div>';
    var top=document.createElement('button');top.type='button';top.className='v16-detail-close';top.textContent='✕ Закрыть';
    top.onclick=function(e){e.preventDefault();e.stopPropagation();if(typeof window.closeOrderDetail==='function')window.closeOrderDetail()};
    head.appendChild(title);head.appendChild(top);content.insertBefore(head,content.firstChild);
    var old=content.querySelector('.ph-detail-head');if(old)old.remove();
  }else{
    head.className='v16-detail-head';
    var oldClose=head.querySelector('.ph-detail-close');if(oldClose)oldClose.style.display='none';
    var title=head.querySelector('h2');if(title)title.textContent='Информация о заказе';
    var top=head.querySelector('.v16-detail-close');
    if(!top){top=document.createElement('button');top.type='button';top.className='v16-detail-close';top.textContent='✕ Закрыть';head.appendChild(top)}
    top.onclick=function(e){e.preventDefault();e.stopPropagation();if(typeof window.closeOrderDetail==='function')window.closeOrderDetail()};
  }
  var refresh=content.querySelector('.ph-order-refresh');
  if(refresh){
    var m=(refresh.getAttribute('onclick')||'').match(/refreshSingleOrder\((?:'|\")([^'\"]+)(?:'|\")\)/);
    if(m)refresh.setAttribute('data-order-id',m[1]);
    refresh.disabled=false;refresh.style.pointerEvents='auto';refresh.style.touchAction='manipulation';
  }
  var bottom=content.querySelector('.v16-detail-bottom-close');
  if(!bottom){bottom=document.createElement('button');bottom.type='button';bottom.className='v16-detail-bottom-close';bottom.textContent='Закрыть';bottom.onclick=function(e){e.preventDefault();e.stopPropagation();if(typeof window.closeOrderDetail==='function')window.closeOrderDetail()};content.appendChild(bottom)}
}
function wrapOrderDetail(){
  if(typeof window.openOrderDetailById!=='function')return;
  if(window.openOrderDetailById.__v16)return;
  var original=window.openOrderDetailById;
  function wrapped(id){var r=original.apply(this,arguments);setTimeout(addDetailControls,0);setTimeout(addDetailControls,80);return r}
  wrapped.__v16=true;window.openOrderDetailById=wrapped;
  if(typeof window.closeOrderDetail==='function'&&!window.closeOrderDetail.__v16){
    var close=window.closeOrderDetail;
    var cw=function(){var m=document.getElementById('orderDetailModal');if(m)m.classList.remove('show');document.body.style.overflow='auto';try{close.apply(this,arguments)}catch(e){}};
    cw.__v16=true;window.closeOrderDetail=cw;
  }
}
function installRefreshController(){
  if(window.__VAPORIX_REFRESH_CONTROLLER_V16)return;
  window.__VAPORIX_REFRESH_CONTROLLER_V16=true;
  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('.ph-order-refresh'):null;if(!t)return;
    e.preventDefault();e.stopImmediatePropagation();
    var id=t.getAttribute('data-order-id');
    if(!id){var oc=t.getAttribute('onclick')||'';var m=oc.match(/refreshSingleOrder\((?:'|\")([^'\"]+)(?:'|\")\)/);id=m&&m[1]}
    if(!id||t.dataset.loading==='1')return;
    t.dataset.loading='1';t.disabled=true;t.textContent='Обновляем…';
    var done=function(){t.dataset.loading='0';t.disabled=false;t.textContent='Обновить статус';setTimeout(addDetailControls,0)};
    try{var r=typeof window.refreshSingleOrder==='function'?window.refreshSingleOrder(id):null;if(r&&typeof r.then==='function')r.then(done).catch(done);else done()}catch(err){done()}
  },true);
}
function wrapShowProfile(){
  if(typeof window.showProfile!=='function'||window.showProfile.__v16)return;
  var original=window.showProfile;
  async function wrapped(){var r=await original.apply(this,arguments);setTimeout(enhanceProfile,0);setTimeout(enhanceProfile,120);return r}
  wrapped.__v16=true;window.showProfile=wrapped;
}
function styles(){
  if(document.getElementById('v16-profile-order-style'))return;
  var s=document.createElement('style');s.id='v16-profile-order-style';s.textContent=`
.v16-order-card{cursor:pointer!important;touch-action:manipulation!important}
.v16-order-delivery{margin-top:12px;padding:10px 13px;border-radius:12px;background:#351077;color:#b98cff;font-size:13px;font-weight:850;text-align:left}
.v16-order-date{margin-top:13px;color:#aaa;font-size:12px;text-align:left}
.v16-order-status-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:15px;color:#aaa;font-size:12px;text-align:left}
.v16-status{margin-top:0!important}
.ph-order-detail{z-index:50000!important;pointer-events:none}
.ph-order-detail.show{pointer-events:auto!important}
.ph-order-detail-box{z-index:50001!important;pointer-events:auto!important;touch-action:pan-y!important}
.v16-detail-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
.v16-detail-head h2{margin:0!important;font-size:24px!important;line-height:1.1}
.v16-detail-sub{color:#999;font-size:11px;margin-top:4px}
.v16-detail-close{flex:0 0 auto;min-height:42px;padding:0 14px;border-radius:13px;background:#202023!important;border:1px solid #55545c!important;color:#fff!important;font-weight:900;font-size:14px;pointer-events:auto!important;touch-action:manipulation!important;position:relative;z-index:50010}
.ph-order-refresh{position:relative!important;z-index:50010!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important}
.ph-order-refresh:disabled{opacity:.65!important}
.v16-detail-bottom-close{width:100%;height:48px;margin-top:12px;border-radius:14px;background:#321070!important;border:1px solid #6437a2!important;color:#b98cff!important;font-weight:900;font-size:15px;pointer-events:auto!important;touch-action:manipulation!important}
`;
  document.head.appendChild(s)
}
function boot(){styles();wrapOrderDetail();wrapShowProfile();installRefreshController();installProfileObserver();addDetailControls()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
setTimeout(boot,300);setTimeout(boot,1000);setTimeout(boot,2000);
})();

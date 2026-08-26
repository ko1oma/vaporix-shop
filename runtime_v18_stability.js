(function(){
'use strict';
/* VAPORIX V18 stability patch: stop order-list DOM churn and release navigation overlays. */
if(window.__VAPORIX_STABILITY_V18)return;
window.__VAPORIX_STABILITY_V18=true;
function unlock(){
 var ids=['checkoutModal','orderDetailModal','phFlavorChooser'];
 ids.forEach(function(id){var el=document.getElementById(id);if(el&&!el.classList.contains('show')){el.style.pointerEvents='none';el.style.visibility='hidden';el.style.opacity='0'}});
 var open=ids.some(function(id){var el=document.getElementById(id);return el&&el.classList.contains('show')});
 if(!open){document.body.style.overflow='auto';document.body.style.touchAction='auto'}
 document.querySelectorAll('[onclick*="showProfile"],[onclick*="showCart"],[onclick*="showCatalog"],[onclick*="showInfo"]').forEach(function(el){el.style.pointerEvents='auto';el.style.touchAction='manipulation';el.style.position='relative';el.style.zIndex='20000'});
}
function stabilize(){
 var list=document.getElementById('phOrdersList');
 if(!list||list.__v18Stable)return;
 var d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');if(!d||!d.get||!d.set)return;
 list.__v18Stable=true;list.__v18NativeInnerHTML=d;list.__v18LastBase='';
 Object.defineProperty(list,'innerHTML',{configurable:true,get:function(){return d.get.call(this)},set:function(v){
   var next=String(v==null?'':v);
   if(this.__v18LastBase===next)return;
   this.__v18LastBase=next;d.set.call(this,next);
   setTimeout(function(){if(typeof window.__vaporixDecorateProfile==='function')window.__vaporixDecorateProfile()},0);
 }});
}
function boot(){unlock();stabilize()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
setTimeout(boot,100);setTimeout(boot,500);setTimeout(boot,1200);setInterval(unlock,500);setInterval(stabilize,500);
})();

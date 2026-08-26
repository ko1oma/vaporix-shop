(function(){
'use strict';
/* Checkout runtime loader — cache-busted after V7 validation fix. */
var base=document.createElement('script');
base.src='order_flow_runtime_original.js?v=20260826-7';
base.onload=function(){
  var fix=document.createElement('script');
  fix.src='runtime_fixes.js?v=20260826-7';
  document.body.appendChild(fix);
};
document.body.appendChild(base);
})();

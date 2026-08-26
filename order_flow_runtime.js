(function(){
'use strict';
/* Checkout runtime loader — V8 cache bust. */
var base=document.createElement('script');
base.src='order_flow_runtime_original.js?v=20260826-8';
base.onload=function(){
  var fix=document.createElement('script');
  fix.src='runtime_fixes.js?v=20260826-8';
  document.body.appendChild(fix);
};
document.body.appendChild(base);
})();

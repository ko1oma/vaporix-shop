(function(){
'use strict';
/* Checkout runtime loader — V11 cache bust. */
var base=document.createElement('script');
base.src='order_flow_runtime_original.js?v=20260826-11';
base.onload=function(){
  var fix=document.createElement('script');
  fix.src='runtime_fixes.js?v=20260826-11';
  document.body.appendChild(fix);
};
document.body.appendChild(base);
})();

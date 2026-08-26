(function(){
'use strict';
/* Loader: keep the proven order-flow implementation intact, then load the
   cleanup layer after it so the cleanup can wrap the final navigation API. */
var base=document.createElement('script');
base.src='order_flow_runtime_original.js?v=20260826-3';
base.onload=function(){
  var fix=document.createElement('script');
  fix.src='runtime_fixes.js?v=20260826-3';
  document.body.appendChild(fix);
};
document.body.appendChild(base);
})();

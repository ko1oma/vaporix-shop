(function(){
'use strict';
/* Load checkout first, then the cleanup layer. Cache version is bumped with each runtime fix. */
var base=document.createElement('script');
base.src='order_flow_runtime_original.js?v=20260826-4';
base.onload=function(){
  var fix=document.createElement('script');
  fix.src='runtime_fixes.js?v=20260826-6';
  document.body.appendChild(fix);
};
document.body.appendChild(base);
})();

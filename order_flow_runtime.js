(function(){
'use strict';
/* Load the checkout implementation first, then the cleanup layer.
   Version query is bumped whenever the cleanup layer changes so Telegram/iOS
   cannot keep serving an older cached runtime fix. */
var base=document.createElement('script');
base.src='order_flow_runtime_original.js?v=20260826-3';
base.onload=function(){
  var fix=document.createElement('script');
  fix.src='runtime_fixes.js?v=20260826-4';
  document.body.appendChild(fix);
};
document.body.appendChild(base);
})();

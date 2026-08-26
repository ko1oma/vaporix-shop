(function(){
'use strict';
/* Checkout runtime loader — V12 cache bust. */
var base=document.createElement('script');
base.src='order_flow_runtime_original.js?v=20260826-12';
base.onload=function(){
  var fix=document.createElement('script');
  fix.src='runtime_fixes.js?v=20260826-12';
  fix.onload=function(){
    var actionFix=document.createElement('script');
    actionFix.src='runtime_v12_action_fix.js?v=20260826-12';
    document.body.appendChild(actionFix);
  };
  document.body.appendChild(fix);
};
document.body.appendChild(base);
})();

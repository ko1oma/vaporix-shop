(function(){
'use strict';
/* Checkout runtime loader — V15 cache bust. */
var base=document.createElement('script');
base.src='order_flow_runtime_original.js?v=20260827-15';
base.onload=function(){
  var fix=document.createElement('script');
  fix.src='runtime_fixes.js?v=20260827-15';
  fix.onload=function(){
    var actionFix=document.createElement('script');
    actionFix.src='runtime_v13_checkout_action.js?v=20260827-15';
    document.body.appendChild(actionFix);
  };
  document.body.appendChild(fix);
};
document.body.appendChild(base);
})();

(function(){
'use strict';
/* Checkout runtime loader — V17 stable order/profile flow. */
var base=document.createElement('script');
base.src='order_flow_runtime_original.js?v=20260827-17';
base.onload=function(){
  var actionFix=document.createElement('script');
  actionFix.src='runtime_v13_checkout_action.js?v=20260827-17';
  actionFix.onload=function(){
    var profileFix=document.createElement('script');
    profileFix.src='runtime_profile_v16.js?v=20260827-17';
    document.body.appendChild(profileFix);
  };
  document.body.appendChild(actionFix);
};
document.body.appendChild(base);
})();

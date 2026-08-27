(function(){
'use strict';
/* Load the legacy checkout engine first, then the single V7 repair layer. */
var base=document.createElement('script');
base.src='order_flow_runtime_original.js?v=20260827-1';
base.onload=function(){
  var fix=document.createElement('script');
  fix.src='runtime_fixes.js?v=20260827-1';
  document.body.appendChild(fix);
};
base.onerror=function(e){console.error('VAPORIX checkout engine failed to load',e)};
document.body.appendChild(base);
})();

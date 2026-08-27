(function(){
'use strict';
/* Load the legacy checkout engine first, then the UI repair layers. */
var base=document.createElement('script');
base.src='order_flow_runtime_original.js?v=20260827-1';
base.onload=function(){
  var fix=document.createElement('script');
  fix.src='runtime_fixes.js?v=20260827-2';
  fix.onload=function(){
    var layout=document.createElement('script');
    layout.src='layout_fix_v8.js?v=20260827-1';
    document.body.appendChild(layout);
  };
  document.body.appendChild(fix);
};
base.onerror=function(e){console.error('VAPORIX checkout engine failed to load',e)};
document.body.appendChild(base);
})();

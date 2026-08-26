(function(){
  'use strict';

  function apply(){
    // Product card: use the freed quantity area for one full-width button.
    var style=document.getElementById('vpx-final-layout-fix');
    if(!style){
      style=document.createElement('style');
      style.id='vpx-final-layout-fix';
      style.textContent=''
        +'.card-actions{grid-template-columns:1fr!important;display:grid!important;width:100%!important;gap:0!important;}'
        +'.card-qty{display:none!important;}'
        +'.add-cart{grid-column:1/-1!important;width:100%!important;min-width:0!important;height:48px!important;margin:0!important;display:flex!important;align-items:center!important;justify-content:center!important;}'
        +'.card-actions .add-cart{border-radius:14px!important;}'
        +'.logo,.brand{font-size:inherit!important;}'
        +'.logo .vapo-part,.logo .rix-part,.brand .vapo-part,.brand .rix-part{color:inherit!important;}'
        +'#vpxChooser .vpx-add{width:100%!important;}';
      document.head.appendChild(style);
    }

    // Replace the visible brand. The existing config script was forcing VAPORIX.
    document.querySelectorAll('.logo,.brand').forEach(function(el){
      if(el.dataset.vpxBrandFixed==='1') return;
      el.dataset.vpxBrandFixed='1';
      el.textContent='PUFF HUB';
    });

    // The existing chooser incorrectly clicks nav item #3 after adding.
    // On this layout #3 is Info; the cart is #2. Redirect that automatic click to Cart.
    if(!document.documentElement.dataset.vpxRedirectFix){
      document.documentElement.dataset.vpxRedirectFix='1';
      var redirectUntil=0;
      document.addEventListener('click',function(e){
        var add=e.target&&e.target.closest?e.target.closest('#vpxChooser .vpx-add'):null;
        if(add){ redirectUntil=Date.now()+700; return; }
        if(Date.now()<redirectUntil){
          var bad=e.target&&e.target.closest?e.target.closest('.bottom .nav:nth-child(3)'):null;
          if(bad){
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            redirectUntil=0;
            var cart=document.querySelector('.bottom .nav:nth-child(2)');
            if(cart) setTimeout(function(){cart.click()},0);
          }
        }
      },true);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  setTimeout(apply,300);
  setTimeout(apply,1000);
})();

/* PUFF HUB storefront compatibility + direct add-to-cart fix */
window.VAPORIX_CONFIG={
  SUPABASE_URL:'https://kjwfkqexwemztakagihl.supabase.co',
  SUPABASE_ANON_KEY:'sb_publishable_RLAGN9MDHIaVo708txjldQ_b87BYhIV'
};

/* Keep the existing admin/catalog configuration intact. */
document.write('<scr'+'ipt src="https://raw.githubusercontent.com/ko1oma/vaporix-shop/fe04eb945fdbfc3f84e7cfbbda16efd146117e20/config.js"></scr'+'ipt>');

(function(){
  'use strict';

  function productsList(){
    try{ if(typeof products==='function') return products()||[]; }catch(e){}
    try{ if(Array.isArray(window.products)) return window.products; }catch(e){}
    return [];
  }

  function cartRef(){
    try{ if(Array.isArray(cart)) return cart; }catch(e){}
    try{ if(Array.isArray(window.cart)) return window.cart; }catch(e){}
    return null;
  }

  function findProductFromButton(btn){
    var list=productsList();
    var card=btn.closest('.card');
    if(!card) return {index:-1,product:null};
    var id=card.getAttribute('data-product-id')||card.dataset&&card.dataset.productId||'';
    if(id){
      var byId=list.findIndex(function(p){return String(p.id)===String(id)});
      if(byId>=0) return {index:byId,product:list[byId]};
    }
    var nameEl=card.querySelector('.name');
    var name=nameEl?nameEl.textContent.trim():'';
    if(name){
      var byName=list.findIndex(function(p){return String(p.name||'').trim()===name});
      if(byName>=0) return {index:byName,product:list[byName]};
    }
    var cards=Array.prototype.slice.call(document.querySelectorAll('.card'));
    var pos=cards.indexOf(card);
    return {index:pos,product:pos>=0?list[pos]:null};
  }

  function stockFor(p,flavor){
    var fs=p&&p.flavorStocks||{};
    if(flavor && Object.prototype.hasOwnProperty.call(fs,flavor)) return Number(fs[flavor]||0);
    return Number(p&&p.stock||0);
  }

  function addToCartDirect(p,flavor,qty){
    var c=cartRef();
    if(!c || !p) return false;
    var item={id:p.id,product:p,qty:Number(qty||1)};
    if(flavor) item.flavor=flavor;
    var existing=c.find(function(x){
      return String(x.id)===String(item.id) && String(x.flavor||'')===String(item.flavor||'');
    });
    if(existing) existing.qty=Number(existing.qty||0)+item.qty;
    else c.push(item);
    try{ if(typeof window.renderCart==='function') window.renderCart(); }catch(e){}
    try{ if(typeof window.showCart==='function') window.showCart(); }catch(e){}
    return true;
  }

  function closeChooser(){
    var old=document.getElementById('puffhubAddChooser');
    if(old) old.remove();
    document.body.style.overflow='auto';
  }

  function openChooser(p){
    if(!p) return;
    var flavors=Array.isArray(p.flavors)?p.flavors.map(String).filter(Boolean):Object.keys(p.flavorStocks||{});
    if(!flavors.length){
      addToCartDirect(p,null,1);
      return;
    }

    closeChooser();
    var m=document.createElement('div');
    m.id='puffhubAddChooser';
    m.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.68);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;pointer-events:auto;';

    var box=document.createElement('div');
    box.style.cssText='width:min(520px,100%);max-height:85vh;overflow:auto;background:#151518;color:#fff;border:1px solid #4a4a55;border-radius:22px;padding:22px;box-shadow:0 25px 80px rgba(0,0,0,.55);pointer-events:auto;';

    box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px"><div><div style="font-size:20px;font-weight:900">Выберите вкус</div><div style="font-size:12px;color:#a0a0aa;margin-top:4px">'+String(p.name||'').replace(/[&<>]/g,'')+'</div></div><button id="phcClose" type="button" style="width:36px;height:36px;border-radius:11px;background:#1c1c21;color:#fff;border:1px solid #34343c;font-size:18px;cursor:pointer">×</button></div>';

    var grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;';
    flavors.forEach(function(flavor){
      var stock=stockFor(p,flavor);
      var b=document.createElement('button');
      b.type='button';
      b.style.cssText='min-height:52px;border-radius:14px;border:1px solid #4a4a55;background:#1c1c21;color:#fff;text-align:left;padding:10px 12px;font-weight:800;cursor:pointer;pointer-events:auto;';
      b.innerHTML='<span style="display:block">'+String(flavor).replace(/[&<>]/g,'')+'</span><span style="display:block;color:#8cff00;font-size:11px;margin-top:3px">В наличии: '+(stock>=80?'80+':stock)+'</span>';
      b.onclick=function(e){
        e.preventDefault();
        e.stopPropagation();
        if(addToCartDirect(p,flavor,1)) closeChooser();
      };
      grid.appendChild(b);
    });
    box.appendChild(grid);
    m.appendChild(box);
    document.body.appendChild(m);
    document.body.style.overflow='hidden';
    document.getElementById('phcClose').onclick=closeChooser;
    m.addEventListener('click',function(e){if(e.target===m)closeChooser();});
  }

  function setBrand(){
    document.title='PUFF HUB — каталог';
    document.querySelectorAll('.logo,.brand').forEach(function(el){
      el.textContent='PUFF HUB';
      el.style.color='#ff299e';
    });
  }

  function installAddHandler(){
    if(document.documentElement.dataset.puffhubAddFix==='1') return;
    document.documentElement.dataset.puffhubAddFix='1';

    /* Capture phase is intentional: it stops the card's Info/navigation handler
       before it can see the Add-to-cart click. */
    document.addEventListener('click',function(e){
      var btn=e.target&&e.target.closest?e.target.closest('.add-cart'):null;
      if(!btn) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      var found=findProductFromButton(btn);
      if(found.product) openChooser(found.product);
    },true);

    /* Hard guarantee that the visible button accepts pointer input. */
    var style=document.createElement('style');
    style.id='puffhub-add-button-fix';
    style.textContent='.card-actions{grid-template-columns:minmax(0,1fr)!important;width:100%!important;display:grid!important;gap:0!important}.card-qty{display:none!important}.add-cart,.card-actions .add-cart{display:flex!important;width:100%!important;min-width:0!important;height:48px!important;margin:0!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;pointer-events:auto!important;position:relative!important;z-index:5!important}.logo,.brand{font-size:inherit!important;}';
    document.head.appendChild(style);
  }

  function apply(){
    setBrand();
    installAddHandler();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
  setTimeout(apply,300);
  setTimeout(apply,1000);
})();
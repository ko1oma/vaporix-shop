/* VAPORIX config compatibility loader + authoritative storefront fixes */
window.VAPORIX_CONFIG={
  SUPABASE_URL:'https://kjwfkqexwemztakagihl.supabase.co',
  SUPABASE_ANON_KEY:'sb_publishable_RLAGN9MDHIaVo708txjldQ_b87BYhIV'
};

/* Load the exact previous config unchanged, then apply the storefront fixes below. */
document.write('<scr'+'ipt src="https://raw.githubusercontent.com/ko1oma/vaporix-shop/fe04eb945fdbfc3f84e7cfbbda16efd146117e20/config.js"></scr'+'ipt>');

(function(){
  'use strict';
  document.title='PUFF HUB — каталог';

  function setBrand(){
    document.title='PUFF HUB — каталог';
    document.querySelectorAll('.logo,.brand').forEach(function(el){
      el.textContent='';
      var a=document.createElement('span');a.textContent='PUFF';a.style.color='#fff';
      var b=document.createElement('span');b.textContent=' HUB';b.style.color='#ff299e';
      el.append(a,b);
    });
  }

  function productList(){try{return typeof products==='function'?products():products}catch(e){return []}}

  function addDirect(index,flavor){
    var list=productList(),p=list&&list[index];if(!p)return;
    var item={id:p.id,product:p,qty:1};if(flavor)item.flavor=flavor;
    if(Array.isArray(window.cart)){
      var existing=window.cart.find(function(x){return String(x.id)===String(item.id)&&String(x.flavor||'')===String(item.flavor||'')});
      if(existing)existing.qty+=1;else window.cart.push(item);
    }
    if(typeof window.renderCart==='function')window.renderCart();
    if(typeof window.renderCart2==='function')window.renderCart2();
    if(typeof window.showCart==='function')window.showCart();
  }

  function closeChooser(){var old=document.getElementById('puffhubAddChooser');if(old)old.remove();document.body.style.overflow='auto'}

  function openChooser(index){
    var list=productList(),p=list&&list[index];if(!p)return;
    var flavors=Array.isArray(p.flavors)?p.flavors.map(String).filter(Boolean):Object.keys(p.flavorStocks||{});
    if(!flavors.length){addDirect(index);return}
    closeChooser();
    var stockMap=p.flavorStocks||{};
    var m=document.createElement('div');m.id='puffhubAddChooser';m.style.cssText='position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.65);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px';
    var box=document.createElement('div');box.style.cssText='width:min(520px,100%);max-height:85vh;overflow:auto;background:#151518;color:#f7f7fa;border:1px solid #4a4a55;border-radius:22px;padding:22px;box-shadow:0 25px 80px rgba(0,0,0,.55)';
    box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px"><div><div style="font-size:20px;font-weight:900">Выберите вкус</div><div style="font-size:12px;color:#a0a0aa;margin-top:4px">'+String(p.name||'').replace(/[&<>]/g,'')+'</div></div><button id="phcClose" type="button" style="width:36px;height:36px;border-radius:11px;background:#1c1c21;color:#fff;border:1px solid #34343c;font-size:18px">×</button></div>';
    var grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px';
    flavors.forEach(function(flavor){
      var stock=Object.prototype.hasOwnProperty.call(stockMap,flavor)?Number(stockMap[flavor]||0):Number(p.stock||0);
      var b=document.createElement('button');b.type='button';b.style.cssText='min-height:52px;border-radius:14px;border:1px solid #4a4a55;background:#1c1c21;color:#fff;text-align:left;padding:10px 12px;font-weight:800;cursor:pointer';
      b.innerHTML='<span style="display:block">'+String(flavor).replace(/[&<>]/g,'')+'</span><span style="display:block;color:#8cff00;font-size:11px;margin-top:3px">В наличии: '+(stock>=80?'80+':stock)+'</span>';
      b.onclick=function(){addDirect(index,flavor);closeChooser()};grid.appendChild(b);
    });
    box.appendChild(grid);m.appendChild(box);document.body.appendChild(m);document.body.style.overflow='hidden';
    document.getElementById('phcClose').onclick=closeChooser;m.addEventListener('click',function(e){if(e.target===m)closeChooser()});
  }

  /* index.html calls this exact function from every Add-to-cart button. */
  window.addWithQty=function(index){openChooser(Number(index))};

  document.addEventListener('DOMContentLoaded',function(){setBrand();setTimeout(setBrand,300);setTimeout(setBrand,1200)});
})();

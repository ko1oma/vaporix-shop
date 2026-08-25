from pathlib import Path

p = Path('config.js')
s = p.read_text(encoding='utf-8')
if 'MULTI_FLAVOR_CHOOSER_V2' in s:
    print('already patched')
    raise SystemExit(0)

start = s.find('  const initAddToCartChooser=()=>{')
end = s.find('  initAddToCartChooser();', start)
if start < 0 or end < 0:
    raise SystemExit('chooser block not found')
end += len('  initAddToCartChooser();')

new = r'''  // MULTI_FLAVOR_CHOOSER_V2
  const initAddToCartChooser=()=>{
    if(document.getElementById('vpxChooser')) return;
    const style=document.createElement('style');
    style.id='vpxChooserStyle';
    style.textContent=`
      #vpxChooser{position:fixed;inset:0;z-index:99999;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.68);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:12px}
      #vpxChooser.show{display:flex}
      #vpxChooser .vpx-box{width:min(520px,100%);max-height:min(92vh,760px);overflow:auto;background:#15151a;border:1px solid #34343d;border-radius:24px;padding:18px;box-shadow:0 24px 80px rgba(0,0,0,.55)}
      #vpxChooser .vpx-head{display:flex;gap:14px;align-items:center}
      #vpxChooser .vpx-img{width:82px;height:96px;flex:0 0 82px;border-radius:14px;background:#101014;object-fit:contain}
      #vpxChooser .vpx-title{font-size:20px;font-weight:900;color:#fff}
      #vpxChooser .vpx-stock{margin-top:5px;color:#7dff00;font-weight:800}
      #vpxChooser .vpx-label{font-size:13px;color:#9b9ca5;font-weight:800;margin:18px 0 9px}
      #vpxChooser .vpx-flavors{display:flex;flex-wrap:wrap;gap:8px}
      #vpxChooser .vpx-flavor{border:1px solid #3a3a45;background:#202026;color:#b9bac2;border-radius:999px;padding:9px 12px;font-size:13px;font-weight:750;cursor:pointer;transition:.16s ease}
      #vpxChooser .vpx-flavor.active{border-color:#c43cff;background:linear-gradient(90deg,#f21b9b,#813cff);color:#fff;box-shadow:0 0 18px rgba(194,42,255,.22)}
      #vpxChooser .vpx-step{width:46px;height:42px;border:0;border-radius:12px;background:#24242b;color:#fff;font-size:25px;font-weight:700;cursor:pointer}
      #vpxChooser .vpx-step:disabled{opacity:.35;cursor:not-allowed}
      #vpxChooser .vpx-count{min-width:60px;text-align:center;font-size:20px;font-weight:900;color:#fff}
      #vpxChooser .vpx-selected{margin-top:10px;color:#b9bac2;font-size:12px;font-weight:700}
      #vpxChooser .vpx-qty{display:flex;align-items:center;justify-content:space-between;background:#101014;border:1px solid #30303a;border-radius:15px;padding:8px 10px}
      #vpxChooser .vpx-price{margin-top:12px;display:flex;justify-content:space-between;align-items:end}
      #vpxChooser .vpx-unit{font-size:13px;color:#9b9ca5}.vpx-unit strong{display:block;font-size:24px;color:#fff}
      #vpxChooser .vpx-total{text-align:right;font-size:13px;color:#9b9ca5}.vpx-total strong{display:block;font-size:24px;color:#fff}
      #vpxChooser .vpx-add{width:100%;height:52px;border:0;border-radius:16px;margin-top:16px;background:linear-gradient(90deg,#f21b9b,#813cff);color:#fff;font-size:16px;font-weight:900;cursor:pointer}
      #vpxChooser .vpx-add:disabled{opacity:.45;cursor:not-allowed}
      #vpxChooser .vpx-close{width:100%;height:42px;border:0;background:transparent;color:#9b9ca5;font-weight:800;cursor:pointer;margin-top:3px}
      @media(max-width:700px){#vpxChooser{padding:8px}.vpx-box{border-radius:24px 24px 18px 18px!important;padding:16px!important}.vpx-title{font-size:18px!important}}
    `;
    document.head.appendChild(style);
    const root=document.createElement('div');
    root.id='vpxChooser';
    root.innerHTML=`<div class="vpx-box" role="dialog" aria-modal="true">
      <div class="vpx-head"><img class="vpx-img" alt=""><div><div class="vpx-title"></div><div class="vpx-stock"></div></div></div>
      <div class="vpx-label vpx-flavor-label" style="display:none">Выберите вкус</div>
      <div class="vpx-flavors"></div>
      <div class="vpx-selected" style="display:none"></div>
      <div class="vpx-label">Количество каждого выбранного вкуса</div>
      <div class="vpx-qty"><button class="vpx-step" data-step="-1" type="button">−</button><div class="vpx-count">1</div><button class="vpx-step" data-step="1" type="button">+</button></div>
      <div class="vpx-price"><div class="vpx-unit">Цена за 1 шт.<strong class="vpx-unit-val">0.00 EUR</strong></div><div class="vpx-total">Итого<strong class="vpx-total-val">0.00 EUR</strong></div></div>
      <button class="vpx-add" type="button">Добавить в корзину</button><button class="vpx-close" type="button">Отмена</button>
    </div>`;
    document.body.appendChild(root);

    let current=null, qty=1, selected=[];
    const els={img:root.querySelector('.vpx-img'),title:root.querySelector('.vpx-title'),stock:root.querySelector('.vpx-stock'),flavorLabel:root.querySelector('.vpx-flavor-label'),flavors:root.querySelector('.vpx-flavors'),selected:root.querySelector('.vpx-selected'),count:root.querySelector('.vpx-count'),unit:root.querySelector('.vpx-unit-val'),total:root.querySelector('.vpx-total-val'),add:root.querySelector('.vpx-add'),steps:[...root.querySelectorAll('.vpx-step')]};
    const flavorList=()=>Array.isArray(current?.flavors)?current.flavors.filter(Boolean).map(String):[];
    const getFlavorStockMap=()=>current?.flavorStocks||current?.flavor_stock||{};
    const getMax=()=>{
      const fs=flavorList();
      if(fs.length&&selected.length){
        const map=getFlavorStockMap();
        const stocks=selected.map(f=>{const n=Number(map[f]);return Number.isFinite(n)&&n>=0?n:0});
        return Math.max(0,Math.min(...stocks));
      }
      const n=Number(current?.stock);return Number.isFinite(n)&&n>0?n:9999;
    };
    const getTierPrice=q=>{
      const base=Number(current?.price||0),tiers=Array.isArray(current?.tiers)?current.tiers:[];
      if(tiers.length&&typeof tiers[0]==='object'){
        const sorted=tiers.filter(x=>Number(x.qty)>0&&Number(x.price)>=0).sort((a,b)=>Number(a.qty)-Number(b.qty));
        let p=base;sorted.forEach(x=>{if(q>=Number(x.qty))p=Number(x.price)});return p;
      }
      if(tiers.length===5){const qs=[20,30,50,70,100];let p=base;qs.forEach((t,i)=>{if(q>=t)p=Number(tiers[i])});return p}
      return base;
    };
    const render=()=>{
      const p=getTierPrice(qty),totalQty=(flavorList().length?selected.length:1)*qty;
      els.count.textContent=qty;els.unit.textContent=p.toFixed(2)+' EUR';els.total.textContent=(p*totalQty).toFixed(2)+' EUR';
      els.selected.style.display=selected.length?'block':'none';els.selected.textContent=selected.length?`Выбрано вкусов: ${selected.length}. Всего штук: ${totalQty}.`:'';
      els.add.disabled=flavorList().length>0&&!selected.length;
      const max=getMax();els.steps.forEach(b=>b.disabled=(Number(b.dataset.step)>0&&qty>=max)||(Number(b.dataset.step)<0&&qty<=1));
    };
    const refreshButtons=()=>root.querySelectorAll('.vpx-flavor').forEach(b=>b.classList.toggle('active',selected.includes(b.dataset.flavor)));
    const close=()=>{root.classList.remove('show');document.body.style.overflow='auto';current=null;selected=[]};
    const findProduct=card=>{
      const name=card?.querySelector('.name')?.textContent?.trim()||'';
      return (Array.isArray(window.products)?window.products:[]).find(p=>String(p.name||'').trim()===name)||(Array.isArray(products)?products:[]).find(p=>String(p.name||'').trim()===name);
    };
    const open=card=>{
      const p=findProduct(card);if(!p)return;
      current=p;qty=1;selected=[];els.img.src=p.img||card?.querySelector('.pic img')?.src||'';els.title.textContent=p.name||'Товар';els.stock.textContent='В наличии: '+(p.stock??'');
      const fs=flavorList();els.flavors.innerHTML='';els.flavorLabel.style.display=fs.length?'block':'none';
      fs.forEach(f=>{const b=document.createElement('button');b.type='button';b.className='vpx-flavor';b.dataset.flavor=f;b.textContent=f;b.onclick=()=>{selected=selected.includes(f)?selected.filter(x=>x!==f):[...selected,f];const max=getMax();if(qty>max)qty=Math.max(1,max);refreshButtons();render()};els.flavors.appendChild(b)});
      if(!fs.length)selected=[''];
      refreshButtons();render();root.classList.add('show');document.body.style.overflow='hidden';
    };
    root.addEventListener('click',e=>{if(e.target===root)e.preventDefault(),close()});
    root.querySelector('.vpx-close').onclick=close;
    els.steps.forEach(b=>b.onclick=()=>{const max=getMax();qty=Math.max(1,Math.min(max,qty+Number(b.dataset.step)));render()});
    els.add.onclick=()=>{
      if(!current||(!selected.length&&flavorList().length))return;
      const flavors=flavorList().length?selected:[''];
      if(flavorList().length&&qty>getMax())return;
      try{
        for(const f of flavors){
          const item={...current,quantity:qty,qty,flavor:f||null};
          if(typeof window.addToCart==='function')window.addToCart(item);
          else if(typeof window.addCart==='function')window.addCart(item);
          else{
            const key='vaporix_cart';const cart=JSON.parse(localStorage.getItem(key)||'[]');
            const k=String(current.id||current.dbId||current.slug||current.name)+'|'+String(f||'');
            const old=cart.find(x=>String(x.id||x.dbId||x.slug||x.name)+'|'+String(x.flavor||'')===k);
            if(old)old.quantity=(Number(old.quantity||old.qty)||0)+qty;else cart.push(item);
            localStorage.setItem(key,JSON.stringify(cart));
          }
        }
      }catch(e){console.warn('VAPORIX cart:',e)}
      close();if(typeof window.renderCart==='function')window.renderCart();
      const cartNav=document.querySelector('.bottom .nav:nth-child(3)');if(cartNav&&typeof cartNav.click==='function')setTimeout(()=>cartNav.click(),80);
    };
    document.addEventListener('click',e=>{const btn=e.target.closest?.('.add-cart');if(!btn)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open(btn.closest('.card'))},{capture:true});
    document.addEventListener('touchend',e=>{const btn=e.target.closest?.('.add-cart');if(!btn)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open(btn.closest('.card'))},{capture:true,passive:false});
  };
  initAddToCartChooser();'''

s = s[:start] + new + s[end:]
p.write_text(s, encoding='utf-8')
print('patched')

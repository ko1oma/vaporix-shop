from pathlib import Path
import re

p = Path('order_flow_runtime.js')
s = p.read_text(encoding='utf-8')
marker = "  // Single authoritative catalog Add-to-cart handler.\n"
if 'function openFlavorChooser(index)' not in s:
    inject = r'''  function openFlavorChooser(index){
    const list=typeof products==='function'?products():products;
    const p=list?.[index];
    if(!p)return;
    const flavors=Array.isArray(p.flavors)?p.flavors.map(String).filter(Boolean):Object.keys(p.flavorStocks||{});
    const stockMap=p.flavorStocks||{};
    const stockFor=f=>Object.prototype.hasOwnProperty.call(stockMap,f)?Number(stockMap[f]||0):1;
    if(!flavors.length){
      const item={id:p.id,product:p,qty:1,flavor:null};
      const existing=cart.find(x=>String(x.id)===String(item.id)&&!x.flavor);
      if(existing)existing.qty+=1;else cart.push(item);
      if(typeof renderCart2==='function')renderCart2();else if(typeof renderCart==='function')renderCart();
      if(typeof window.showCart==='function')window.showCart();
      return;
    }
    let modal=document.getElementById('phFlavorChooser');
    if(!modal){modal=document.createElement('div');modal.id='phFlavorChooser';modal.className='ph-flavor-chooser';document.body.appendChild(modal)}
    modal.innerHTML=`<div class="ph-flavor-box" role="dialog" aria-modal="true"><div class="ph-flavor-head"><div><div class="ph-flavor-kicker">Добавить в корзину</div><h2>${esc(p.name)}</h2></div><button type="button" class="ph-flavor-close">✕</button></div><div class="ph-flavor-label">Выберите вкус</div><div class="ph-flavor-list">${flavors.map((f,n)=>{const st=stockFor(f);return `<button type="button" class="ph-flavor-option" data-flavor-index="${n}" ${st<=0?'disabled':''}><span>${esc(f)}</span><small>${st<=0?'Нет в наличии':'В наличии'}</small></button>`}).join('')}</div><button type="button" class="ph-flavor-add" disabled>Добавить в корзину</button></div>`;
    modal.classList.add('show');document.body.style.overflow='hidden';
    let selected=null;
    const close=()=>{modal.classList.remove('show');document.body.style.overflow='auto'};
    modal.querySelector('.ph-flavor-close').onclick=close;
    modal.onclick=e=>{if(e.target===modal)close()};
    const add=modal.querySelector('.ph-flavor-add');
    modal.querySelectorAll('.ph-flavor-option').forEach(b=>b.onclick=()=>{modal.querySelectorAll('.ph-flavor-option').forEach(x=>x.classList.remove('active'));b.classList.add('active');selected=flavors[Number(b.dataset.flavorIndex)];add.disabled=false});
    add.onclick=()=>{if(!selected)return;const item={id:p.id,product:p,qty:1,flavor:selected};const existing=cart.find(x=>String(x.id)===String(item.id)&&String(x.flavor||'')===String(item.flavor));if(existing)existing.qty+=1;else cart.push(item);if(typeof renderCart2==='function')renderCart2();else if(typeof renderCart==='function')renderCart();close();if(typeof window.showCart==='function')window.showCart()};
  }

'''
    s=s.replace(marker,inject+marker,1)
s=s.replace('    openProductDetail(i);\n','    openFlavorChooser(i);\n',1)
p.write_text(s,encoding='utf-8')

p=Path('config.js')
s=p.read_text(encoding='utf-8')
if '/* PUFF HUB FINAL FIX */' not in s:
    s += r'''

/* PUFF HUB FINAL FIX */
document.addEventListener('DOMContentLoaded',()=>{
  document.title='PUFF HUB — каталог';
  const style=document.createElement('style');style.id='puffhub-final-fix-css';style.textContent=`
    .card-actions{grid-template-columns:1fr!important;width:100%!important}
    .card-actions .card-qty{display:none!important}
    .card-actions .add-cart{grid-column:1/-1!important;width:100%!important;min-width:0!important;height:42px!important;margin:0!important}
    .ph-flavor-chooser{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.62);backdrop-filter:blur(9px);display:grid;place-items:center;padding:18px;opacity:0;pointer-events:none;transition:opacity .18s ease}
    .ph-flavor-chooser.show{opacity:1;pointer-events:auto}
    .ph-flavor-box{width:min(430px,100%);background:var(--panel,#151518);color:var(--text,#fff);border:1px solid var(--line2,#33333b);border-radius:22px;padding:18px;box-shadow:0 25px 90px rgba(0,0,0,.55)}
    .ph-flavor-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px}.ph-flavor-kicker{font-size:11px;color:var(--muted,#96969e);font-weight:800;margin-bottom:4px}.ph-flavor-head h2{margin:0;font-size:20px}
    .ph-flavor-close{width:36px;height:36px;border-radius:11px;background:var(--panel2,#202025);border:1px solid var(--line,#303039);color:var(--text,#fff);font-size:16px}.ph-flavor-label{font-size:12px;color:var(--muted,#96969e);font-weight:800;margin-bottom:8px}.ph-flavor-list{display:grid;gap:8px;max-height:48vh;overflow:auto}
    .ph-flavor-option{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;padding:13px 14px;border-radius:14px;background:var(--panel2,#202025);border:1px solid var(--line2,#38383f);color:var(--text,#fff);font-weight:850}.ph-flavor-option small{font-size:10px;color:var(--green,#55e06f);font-weight:800}.ph-flavor-option.active{border-color:transparent;background:linear-gradient(100deg,var(--pink,#ff299f),var(--purple,#7c42ff));color:#fff}.ph-flavor-option.active small{color:#fff}.ph-flavor-option:disabled{opacity:.38}.ph-flavor-add{width:100%;height:50px;margin-top:13px;border:0;border-radius:14px;background:linear-gradient(100deg,var(--pink,#ff299f),var(--purple,#7c42ff));color:#fff;font-weight:900;font-size:14px}.ph-flavor-add:disabled{opacity:.4}
  `;document.head.appendChild(style);
  document.querySelectorAll('.logo,.brand').forEach(el=>{el.textContent='PUFF HUB'});
});
'''
    p.write_text(s,encoding='utf-8')

p=Path('index.html')
s=p.read_text(encoding='utf-8')
s2=re.sub(r'<title>.*?</title>','<title>PUFF HUB — каталог</title>',s,count=1,flags=re.I|re.S)
if s2!=s:p.write_text(s2,encoding='utf-8')

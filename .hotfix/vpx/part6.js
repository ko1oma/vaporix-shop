(()=>{
'use strict';

const clean=s=>String(s||'').replace(/\s+/g,' ').trim();

const style=document.createElement('style');
style.id='vpx-real-add-button-fix';
style.textContent=`
  /* Catalog cards: no quantity control; Add button uses the whole row. */
  .grid .card-actions{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;gap:0!important;margin-top:12px!important;padding-top:0!important;transform:none!important}
  .grid .card-actions .card-qty{display:none!important}
  .grid .card-actions .add-cart{display:flex!important;width:100%!important;min-width:0!important;height:44px!important;box-sizing:border-box!important;align-items:center;justify-content:center;gap:8px}
`;
document.head.appendChild(style);

function productIndexFromButton(btn){
  const card=btn.closest('.card');
  const source=btn.getAttribute('onclick')||card?.querySelector('.add-cart')?.getAttribute('onclick')||'';
  const m=source.match(/(?:addWithQty|add|openProductDetail)\s*\(\s*(\d+)\s*\)/);
  if(m)return Number(m[1]);
  const name=card?.querySelector('.name')?.textContent?.trim();
  const list=Array.isArray(window.products)?window.products:[];
  return name?list.findIndex(p=>clean(p?.name)===clean(name)):-1;
}

function handle(e){
  const btn=e.target.closest?.('.grid .card .add-cart');
  if(!btn)return;
  const i=productIndexFromButton(btn);
  if(!Number.isInteger(i)||i<0)return;
  if(typeof window.openProductDetail!=='function')return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  window.openProductDetail(i);
}

document.addEventListener('click',handle,true);

function cleanup(){
  document.querySelectorAll('.grid .card-actions').forEach(row=>{
    const qty=row.querySelector('.card-qty');
    if(qty)qty.remove();
    const btn=row.querySelector('.add-cart');
    if(btn){btn.type='button';btn.style.width='100%';}
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup,{once:true});
else cleanup();
new MutationObserver(cleanup).observe(document.body,{childList:true,subtree:true});
})();

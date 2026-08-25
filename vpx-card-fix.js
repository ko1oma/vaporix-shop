(function(){
'use strict';

function getProducts(){return Array.isArray(window.products)?window.products:[]}
function clean(s){return String(s||'').replace(/\s+/g,' ').trim()}
function esc(s){return String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]))}

function productFromButton(btn){
  const products=getProducts();
  const el=btn.closest('[data-index],[data-product-index],[data-product-id],[data-id],.product-card,.product-item,.product,.card');
  const candidates=[btn.getAttribute('onclick')||'',el?.getAttribute('onclick')||'',btn.dataset.index||'',btn.dataset.productIndex||'',el?.dataset.index||'',el?.dataset.productIndex||''];
  for(const s of candidates){const m=String(s).match(/(?:addWithQty|add|openProductDetail)\s*\(\s*(\d+)/);if(m&&products[Number(m[1])])return products[Number(m[1])];}
  const name=el?.querySelector('.product-name,.product-title,.name,[data-product-name],h3,h4')?.textContent;
  if(name){const n=clean(name);const p=products.find(x=>clean(x.name)===n);if(p)return p;const p2=products.find(x=>n.includes(clean(x.name))||clean(x.name).includes(n));if(p2)return p2}
  return null;
}

function openForButton(btn){
  const p=productFromButton(btn);
  if(!p)return false;
  const ov=document.getElementById('vpxShopOverlay');
  if(!ov)return false;
  if(typeof window.vpxOpenChooser==='function')window.vpxOpenChooser(p);
  else if(typeof window.__vpxChooser==='function')window.__vpxChooser(p);
  else return false;
  return true;
}

function stripCardQty(){
  document.querySelectorAll('.qty,.quantity,.quantity-control,.qty-control,.vpx-card-qty,.product-qty').forEach(q=>{
    if(q.closest('#vpxShopOverlay,.drawer-panel,.checkout-box,.checkout-modal'))return;
    const host=q.closest('[data-index],[data-product-index],.product-card,.product-item,.product,.card');
    if(!host)return;
    const addBtn=Array.from(host.querySelectorAll('button,a')).find(b=>/добавить в корзину|в корзину|add to cart/i.test(clean(b.textContent)));
    if(addBtn){q.style.setProperty('display','none','important');}
  });
  document.querySelectorAll('[data-add-to-cart],button').forEach(btn=>{
    if(!/добавить в корзину|add to cart/i.test(clean(btn.textContent)))return;
    if(btn.closest('#vpxShopOverlay,.drawer-panel,.checkout-box,.checkout-modal'))return;
    btn.style.setProperty('width','100%','important');
    btn.style.setProperty('min-width','0','important');
    btn.style.setProperty('display','block','important');
    btn.style.setProperty('box-sizing','border-box','important');
  });
}

function patch(){
  const style=document.createElement('style');
  style.id='vpx-card-fix-css';
  style.textContent=`
    .product-card .qty,.product-card .quantity,.product-card .quantity-control,.product-card .qty-control,.product-item .qty,.product-item .quantity,.product-item .quantity-control,.product-item .qty-control,.product .qty,.product .quantity,.card .qty,.card .quantity{display:none!important}
    .product-card [data-add-to-cart],.product-card .add-to-cart,.product-card .add-btn,.product-item [data-add-to-cart],.product-item .add-to-cart,.product-item .add-btn{width:100%!important;box-sizing:border-box!important}
  `;
  document.head.appendChild(style);
  stripCardQty();

  document.addEventListener('click',function(e){
    if(e.target.closest('#vpxShopOverlay,.drawer-panel,.checkout-box,.checkout-modal'))return;
    const btn=e.target.closest('button,a,[role="button"]');
    if(!btn)return;
    if(!/добавить в корзину|add to cart/i.test(clean(btn.textContent)))return;
    const ok=openForButton(btn);
    if(ok){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();}
  },true);

  new MutationObserver(stripCardQty).observe(document.body,{childList:true,subtree:true});
}

window.vpxOpenChooser=function(p){
  const ov=document.getElementById('vpxShopOverlay');
  if(!ov)return;
  // Reuse the chooser from vpx-stability-patch without exposing the original card click path.
  if(typeof window.__vpxStableChooser==='function'){window.__vpxStableChooser(p);return;}
  // Fallback: invoke the stable add function by locating the product index.
  const i=getProducts().indexOf(p);
  if(i>=0&&typeof window.addWithQty==='function')window.addWithQty(i);
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(patch,100),{once:true});else setTimeout(patch,100);
})();

(function(){
'use strict';
if(window.__VAPORIX_FIXES_V3)return;window.__VAPORIX_FIXES_V3=true;
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

/* The legacy 1.8MB index can expose products/cart as global lexical variables
   (`const/let`) rather than window.products/window.cart. Both are supported. */
function getProducts(){
  try{
    if(Array.isArray(window.products))return window.products;
    if(typeof products!=='undefined'&&Array.isArray(products))return products;
    if(Array.isArray(window.VAPORIX_PRODUCTS))return window.VAPORIX_PRODUCTS;
  }catch(e){}
  return [];
}
function getLegacyCart(){
  try{if(typeof cart!=='undefined'&&Array.isArray(cart))return cart}catch(e){}
  if(Array.isArray(window.cart))return window.cart;
  return null;
}
function getCart(){
  const legacy=getLegacyCart();
  if(legacy)return legacy;
  if(!Array.isArray(window.cart))window.cart=[];
  return window.cart;
}
function norm(s){return String(s||'').replace(/\s+/g,' ').trim().toLowerCase()}
function isAddButton(el){if(!el)return false;return norm(el.textContent).includes('добавить в корзину')||norm(el.textContent).includes('add to cart')}
function findCard(el){
  return el?.closest?.('[data-id],[data-product-id],.card,article,[class*="product-card"],[class*="productCard"],.product')||null;
}
function productFromElement(el){
  const ps=getProducts();
  const card=findCard(el);
  const ids=[
    el?.getAttribute?.('data-product-id'),el?.getAttribute?.('data-id'),
    card?.getAttribute?.('data-product-id'),card?.getAttribute?.('data-id'),
    el?.closest?.('[data-id]')?.getAttribute?.('data-id')
  ].filter(x=>x!=null&&String(x)!=='');
  for(const id of ids){
    const p=ps.find(x=>String(x?.id)===String(id));
    if(p)return p;
  }
  const attrs=[el?.getAttribute?.('onclick'),card?.getAttribute?.('onclick'),el?.dataset?.action].filter(Boolean).join(' ');
  const m=attrs.match(/(?:addWithQty|addToCart|addProduct|addToCartWithQty|cartAdd)\s*\(\s*['"]?([^,'")\s]+)/i);
  if(m){
    const key=String(m[1]);
    const p=ps.find(x=>String(x?.id)===key);
    if(p)return p;
    const n=Number(key);if(Number.isInteger(n)&&ps[n])return ps[n];
  }
  if(card){
    const text=norm(card.textContent);
    let best=null,bestLen=0;
    for(const p of ps){const n=norm(p?.name);if(n&&text.includes(n)&&n.length>bestLen){best=p;bestLen=n.length}}
    if(best)return best;
    const cards=[...document.querySelectorAll('[data-id],[data-product-id],.card,article,[class*="product-card"],[class*="productCard"]')];
    const i=cards.indexOf(card);if(i>=0&&ps[i])return ps[i];
  }
  /* Last-resort product object. This is enough to open the flavor chooser and
     allows the Supabase flavor table to supply the missing flavor list. */
  if(card){
    const id=ids[0]||card.getAttribute('data-id')||card.getAttribute('data-product-id');
    const name=(card.querySelector('h1,h2,h3,h4,.product-name,[class*="name"]')?.textContent||'Товар').trim();
    const priceText=(card.querySelector('[class*="price"]')?.textContent||'').replace(',','.');
    const price=Number((priceText.match(/\d+(?:\.\d+)?/)||['0'])[0]);
    if(id)return {id,name,price,stock:999,flavors:[]};
  }
  return null;
}
async function loadFlavors(p){
  if(Array.isArray(p.flavors)&&p.flavors.length)return;
  if(!p?.id)return;
  try{
    const db=window.supabase?.createClient?.(window.VAPORIX_CONFIG?.SUPABASE_URL,window.VAPORIX_CONFIG?.SUPABASE_ANON_KEY);
    if(!db)return;
    const {data,error}=await db.from('product_flavors').select('name,stock').eq('product_id',p.id).order('id');
    if(error||!data)return;
    p.flavors=[];p.flavorStocks={};
    data.forEach(row=>{
      const raw=String(row.name||'').trim();
      const m=raw.match(/^(.*?)\s*📦\s*(?:80\+|\d+)\s*$/);
      const name=(m?m[1]:raw).trim();
      if(name){p.flavors.push(name);p.flavorStocks[name]=Math.max(0,Number(row.stock)||0)}
    });
    p.stock=p.flavors.reduce((s,f)=>s+(p.flavorStocks[f]||0),0);
  }catch(e){console.warn('VAPORIX flavor lookup failed',e)}
}
function persistCart(c){
  try{localStorage.setItem('vaporixCart',JSON.stringify(c))}catch(e){}
  try{localStorage.setItem('cart',JSON.stringify(c))}catch(e){}
  try{if(typeof window.renderCart==='function')window.renderCart()}catch(e){}
  try{if(typeof window.updateCartCount==='function')window.updateCartCount()}catch(e){}
  try{if(typeof window.render==='function')window.render()}catch(e){}
}
function add(p,qty,flavor){
  const c=getCart();
  const x=c.find(i=>String(i?.id)===String(p.id)&&String(i?.flavor||'')===String(flavor||''));
  if(x)x.qty=Number(x.qty||0)+qty;
  else c.push({id:p.id,product:p,qty,flavor:flavor||null});
  window.cart=c;
  persistCart(c);
}
async function chooser(p){
  if(!p)return;
  await loadFlavors(p);
  const flavors=Array.isArray(p.flavors)?p.flavors.map(String).filter(Boolean):Object.keys(p.flavorStocks||{});
  if(!flavors.length){add(p,1,null);if(typeof window.showCart==='function')window.showCart();return}
  let m=$('vaporixFlavorFix');
  if(!m){m=document.createElement('div');m.id='vaporixFlavorFix';document.body.appendChild(m)}
  const stocks=p.flavorStocks||{};
  const stock=f=>Object.prototype.hasOwnProperty.call(stocks,f)?Number(stocks[f]||0):Number(p.stock||0);
  let selected=null,qty=1;
  m.innerHTML='<div class="vfx-box"><div class="vfx-head"><div><small>Добавить в корзину</small><h2>'+esc(p.name||'Товар')+'</h2></div><button type="button" class="vfx-close">✕</button></div><div class="vfx-label">Выберите вкус</div><div class="vfx-list">'+flavors.map((f,i)=>'<button type="button" class="vfx-option" data-i="'+i+'" '+(stock(f)<=0?'disabled':'')+'><b>'+esc(f)+'</b><small>'+(stock(f)<=0?'Нет в наличии':'В наличии: '+(stock(f)>=80?'80+':stock(f)))+'</small></button>').join('')+'</div><div class="vfx-label">Количество</div><div class="vfx-qty"><button type="button" data-q="-">−</button><strong id="vfxQty">1</strong><button type="button" data-q="+">+</button></div><button type="button" class="vfx-add" disabled>Добавить в корзину</button></div>';
  m.classList.add('show');document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';
  const close=()=>{m.classList.remove('show');document.documentElement.style.overflow='';document.body.style.overflow=''};
  m.querySelector('.vfx-close').onclick=close;m.onclick=e=>{if(e.target===m)close()};
  m.querySelectorAll('.vfx-option').forEach(b=>b.onclick=()=>{m.querySelectorAll('.vfx-option').forEach(x=>x.classList.remove('active'));b.classList.add('active');selected=flavors[Number(b.dataset.i)];qty=1;$('#vfxQty').textContent='1';m.querySelector('.vfx-add').disabled=false});
  m.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const max=selected?Math.max(1,stock(selected)):999;qty=Math.max(1,Math.min(max,qty+(b.dataset.q==='+'?1:-1)));$('#vfxQty').textContent=qty});
  m.querySelector('.vfx-add').onclick=()=>{if(!selected)return;add(p,Math.min(qty,Math.max(1,stock(selected))),selected);close();if(typeof window.showCart==='function')window.showCart()};
}
let lastOpen=0;
function locateAddButton(target){
  let b=target?.closest?.('button,a,[role="button"]');
  if(isAddButton(b))return b;
  const card=findCard(target);
  if(card){const buttons=[...card.querySelectorAll('button,a,[role="button"]')];const x=buttons.find(isAddButton);if(x)return x}
  return null;
}
function handleAdd(e){
  const b=locateAddButton(e.target);if(!b)return;
  const now=Date.now();if(now-lastOpen<700)return;
  const p=productFromElement(b);if(!p){console.warn('VAPORIX: add button found, but product could not be resolved',b);return}
  lastOpen=now;
  try{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}catch(x){}
  chooser(p);
}
function armButtons(){
  document.querySelectorAll('button,a,[role="button"]').forEach(el=>{if(isAddButton(el)){el.removeAttribute('disabled');el.disabled=false;el.style.pointerEvents='auto';el.style.cursor='pointer';el.setAttribute('aria-disabled','false')}})
}
function fixScroll(){
  const m=$('checkoutModal');if(!m)return;m.style.height='100dvh';m.style.overflow='hidden';
  const b=m.querySelector('.checkout-box');if(b){b.style.height='100dvh';b.style.maxHeight='100dvh';b.style.overflowY='auto';b.style.overflowX='hidden';b.style.webkitOverflowScrolling='touch';b.style.touchAction='pan-y';b.style.paddingBottom='130px'}
}
function profileOrdersFallback(){
  const p=$('profile');if(!p)return;
  let s=$('phOrdersSection');if(!s){s=document.createElement('section');s.id='phOrdersSection';s.innerHTML='<div class="ph-orders-title">Заказы</div><div id="phOrdersList"></div>';const anchor=p.querySelector('.profile-section-title');p.insertBefore(s,anchor||p.firstChild)}
  const listEl=$('phOrdersList');if(!listEl)return;let a=[];try{a=JSON.parse(localStorage.getItem('puffhubOrdersV1')||'[]')||[]}catch(e){}
  const title=s.querySelector('.ph-orders-title');if(title)title.innerHTML='Заказы <span style="display:inline-grid;place-items:center;min-width:30px;height:30px;padding:0 8px;border-radius:999px;background:#3a1777;border:1px solid #7044b8;color:#c6a5ff;font-size:13px">'+a.length+'</span>';
  if(a.length)return;listEl.innerHTML='<div class="ph-no-orders">У вас пока нет заказов.<br><small>После оформления заказа он появится здесь.</small></div>';
}
const style=document.createElement('style');style.id='vaporix-fixes-css-v3';style.textContent=`
button[disabled],button:disabled{cursor:pointer!important}.vaporix-add-to-cart,.add-to-cart,.add-cart{pointer-events:auto!important}
.checkout-modal{overflow:hidden!important;height:100dvh!important;max-height:100dvh!important}.checkout-modal .checkout-box{position:absolute!important;inset:0!important;left:50%!important;transform:translateX(-50%)!important;width:min(820px,100%)!important;height:100dvh!important;max-height:100dvh!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important;overscroll-behavior:contain!important;padding-bottom:130px!important}.checkout-modal .checkout-box input,.checkout-modal .checkout-box select{font-size:16px!important}
#vaporixFlavorFix{position:fixed;inset:0;z-index:30000;display:grid;place-items:center;padding:18px;box-sizing:border-box;background:rgba(0,0,0,.74);backdrop-filter:blur(10px);touch-action:none}.vfx-box{width:min(560px,100%);max-height:90dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;background:#29292b;border:1px solid #4a4a50;border-radius:25px;padding:22px;color:#fff;touch-action:pan-y}.vfx-head{display:flex;justify-content:space-between;gap:12px}.vfx-head small,.vfx-label{color:#999;font-size:13px;font-weight:800}.vfx-head h2{margin:3px 0 0;font-size:23px}.vfx-close{width:40px;height:40px;border-radius:12px;background:#1a1a1c;border:1px solid #3d3d43;color:#fff;font-size:18px}.vfx-label{margin:18px 0 9px}.vfx-list{display:grid;grid-template-columns:1fr 1fr;gap:9px}.vfx-option{min-height:58px;border-radius:15px;border:1px solid #4a4a52;background:#19191b;color:#fff;padding:11px 13px;text-align:left}.vfx-option b,.vfx-option small{display:block}.vfx-option small{margin-top:4px;color:#8cff00;font-size:11px}.vfx-option.active{border-color:#965dff;background:#351579}.vfx-option:disabled{opacity:.4}.vfx-qty{height:54px;display:grid;grid-template-columns:54px 1fr 54px;align-items:center;text-align:center;border:1px solid #4a4a50;border-radius:15px;background:#19191b;overflow:hidden}.vfx-qty button{height:100%;background:transparent;color:#fff;font-size:25px;border:0}.vfx-add{width:100%;height:56px;margin-top:18px;border-radius:16px;background:linear-gradient(100deg,#ff299e,#7c42ff);color:#fff;font-weight:900;font-size:16px;border:0}.vfx-add:disabled{opacity:.45}
#phOrdersSection{display:block!important;margin:18px 0 24px!important;padding:16px!important;border:1.5px solid #7044b8!important;border-radius:22px!important;background:linear-gradient(180deg,rgba(54,25,93,.38),rgba(25,25,29,.82))!important;box-shadow:0 0 0 1px rgba(160,100,255,.08),0 12px 35px rgba(0,0,0,.22)!important}#phOrdersSection .ph-orders-title{font-size:20px!important;font-weight:900!important;margin:0 0 14px!important;color:#fff!important}#phOrdersList{display:grid;gap:10px}.ph-no-orders{padding:18px 14px;border:1px dashed #5a5963;border-radius:16px;background:#171719;color:#aaa;text-align:center}.ph-order-card{border:1.5px solid #3f3d49!important;border-radius:18px!important;background:#171719!important}.ph-order-card:hover,.ph-order-card:active{border-color:#8d5cff!important}
@media(max-width:520px){.checkout-modal .checkout-box{padding-left:16px!important;padding-right:16px!important}.vfx-list{grid-template-columns:1fr}}
`;document.head.appendChild(style);

document.addEventListener('pointerdown',handleAdd,true);
document.addEventListener('click',handleAdd,true);
document.addEventListener('touchstart',handleAdd,{capture:true,passive:false});
const observer=new MutationObserver(()=>armButtons());
function run(){armButtons();profileOrdersFallback();fixScroll();if(!observer.__started){observer.observe(document.body,{childList:true,subtree:true});observer.__started=true}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('load',run);setTimeout(run,400);setTimeout(run,1500);
})();

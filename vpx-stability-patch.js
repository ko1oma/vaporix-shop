(function(){
'use strict';
const CART_KEY='vaporix_cart';
const css=`
#vpxShopOverlay{display:flex!important;align-items:flex-end!important;justify-content:center!important;padding:0!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;background:rgba(0,0,0,.68)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;transition:opacity .28s ease,visibility 0s linear .28s!important}
#vpxShopOverlay.show{opacity:1!important;visibility:visible!important;pointer-events:auto!important;transition:opacity .28s ease,visibility 0s linear 0s!important}
#vpxShopOverlay .vpx-panel{box-sizing:border-box!important;width:min(560px,100%)!important;max-height:min(92dvh,820px)!important;margin:0!important;padding:18px 18px calc(20px + env(safe-area-inset-bottom))!important;overflow:auto!important;border-radius:28px 28px 0 0!important;border-bottom:0!important;transform:translateY(105%)!important;transition:transform .38s cubic-bezier(.22,1,.36,1)!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important}
#vpxShopOverlay.show .vpx-panel{transform:translateY(0)!important}
.vpx-qbtn{display:grid!important;place-items:center!important;align-items:center!important;justify-content:center!important;line-height:1!important;padding:0!important;flex:none!important}
.vpx-cart-controls{align-items:center!important}.vpx-qnum{text-align:center!important;line-height:1!important}.vpx-cart-line{box-sizing:border-box!important}
@media(max-width:560px){#vpxShopOverlay .vpx-panel{width:100%!important;max-height:calc(100dvh - 4px)!important;padding:16px 14px calc(18px + env(safe-area-inset-bottom))!important;border-radius:27px 27px 0 0!important}}
.drawer,.info-modal,.checkout-modal{transition:opacity .28s ease!important}.drawer-panel,.info-box,.checkout-box{transition:transform .38s cubic-bezier(.22,1,.36,1)!important}
`;
function read(){try{const a=JSON.parse(localStorage.getItem(CART_KEY)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function write(a){localStorage.setItem(CART_KEY,JSON.stringify(a))}
function products(){return Array.isArray(window.products)?window.products:[]}
function pof(x){return products().find(p=>String(p.id??p.dbId??p.slug??p.name)===String(x.product_id??x.id??x.dbId??x.slug??x.name))||products().find(p=>String(p.name||'')===String(x.product_name||x.name||''))}
function flavors(p){const m=p?.flavorStocks||p?.flavor_stock||{};const ks=Object.keys(m);if(ks.length)return ks.map(n=>({name:n,stock:Math.max(0,Number(m[n])||0)}));return(Array.isArray(p?.flavors)?p.flavors:[]).map(v=>{const s=String(v),z=s.match(/^(.*?)\s*📦\s*(80\+|\d+)\s*$/);return{name:(z?z[1]:s).trim(),stock:z?(z[2]==='80+'?999999:Number(z[2])||0):Number(p?.stock)||0}})}
function norm(s){return String(s||'').replace(/\s*📦\s*(?:80\+|\d+)\s*$/,'').trim()}
function add(p,flavor,q){const c=read(),id=p.id??p.dbId??p.slug??p.name,f=flavor?norm(flavor):null;const old=c.find(x=>String(x.product_id??x.id??x.dbId??x.slug??x.name)===String(id)&&norm(x.flavor||'')===norm(f||''));if(old)old.quantity=(Number(old.quantity||1)+q);else c.push({id,product_id:id,dbId:id,name:p.name,product_name:p.name,slug:p.slug||'',img:p.img||p.image_url||'',price:Number(p.price||0),quantity:q,qty:q,flavor:f});write(c);try{if(Array.isArray(window.cart)){window.cart.length=0;c.forEach(x=>{const pp=pof(x)||x;window.cart.push({id:pp.id??pp.dbId,product:pp,qty:Number(x.quantity||1),flavor:x.flavor||null})});if(typeof window.updateCartBadge==='function')window.updateCartBadge()}}catch(e){}}
function ensure(){if(document.getElementById('vpxStablePatch'))return;const s=document.createElement('style');s.id='vpxStablePatch';s.textContent=css;document.head.appendChild(s)}
function chooser(p){
 ensure();const rows=flavors(p);let flavor=null,qty=1;const ov=document.getElementById('vpxShopOverlay');if(!ov)return;const panel=ov.querySelector('.vpx-panel');if(!panel)return;
 const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));const name=esc(p.name),img=esc(p.img||p.image_url||'');
 panel.innerHTML=`<div class="vpx-h"><h2>Добавить в корзину</h2><button class="vpx-x" type="button" id="stableClose">×</button></div><div class="vpx-product-head"><img class="vpx-product-img" src="${img}" alt=""><div><div class="vpx-product-name">${name}</div><div class="vpx-stock">${rows.length?'Выберите вкус':'В наличии: '+(Number(p.stock)>80?'80+':(p.stock??0))}</div></div></div>${rows.length?`<div class="vpx-label">Выберите вкус</div><div class="vpx-flavors">${rows.map((r,i)=>`<button type="button" class="vpx-flavor" data-st="${i}" ${r.stock<=0?'disabled':''}>${esc(r.name)} <span>📦 ${r.stock>=999999?'80+':r.stock}</span></button>`).join('')}</div>`:''}<div class="vpx-label">Количество</div><div class="vpx-qty"><button type="button" class="vpx-qbtn" id="stableMinus">−</button><div class="vpx-qnum" id="stableNum">1</div><button type="button" class="vpx-qbtn" id="stablePlus">+</button></div><div class="vpx-price-row"><div><div class="vpx-price-label">Цена за 1 шт.</div><div class="vpx-price" id="stableUnit">${Number(p.price||0).toFixed(2)} EUR</div></div><div style="text-align:right"><div class="vpx-price-label">Итого</div><div class="vpx-price" id="stableTotal">${Number(p.price||0).toFixed(2)} EUR</div></div></div><button type="button" class="vpx-primary" id="stableAdd">Добавить в корзину</button><button type="button" class="vpx-secondary" id="stableCancel">Отмена</button>`;
 function max(){return flavor?((rows.find(x=>x.name===flavor)||{}).stock||0):(Number(p.stock)||999999)}
 function price(){let u=Number(p.price||0);const t=Array.isArray(p.tiers)?p.tiers:[];if(t.length&&typeof t[0]==='object')t.forEach(x=>{if(qty>=Number(x.qty))u=Number(x.price)});else if(t.length===5)[20,30,50,70,100].forEach((n,i)=>{if(qty>=n)u=Number(t[i])});return u}
 function update(){panel.querySelector('#stableNum').textContent=qty;const u=price();panel.querySelector('#stableUnit').textContent=u.toFixed(2)+' EUR';panel.querySelector('#stableTotal').textContent=(u*qty).toFixed(2)+' EUR';panel.querySelector('#stablePlus').disabled=qty>=max()}
 panel.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{flavor=rows[Number(b.dataset.st)].name;panel.querySelectorAll('.vpx-flavor').forEach(x=>x.classList.remove('on'));b.classList.add('on');qty=1;update()});
 panel.querySelector('#stableMinus').onclick=()=>{qty=Math.max(1,qty-1);update()};panel.querySelector('#stablePlus').onclick=()=>{qty=Math.min(max(),qty+1);update()};
 panel.querySelector('#stableAdd').onclick=()=>{if(rows.length&&!flavor){alert('Выберите вкус.');return}if(qty>max()){alert('Недостаточно остатка.');return}add(p,flavor,qty);ov.classList.remove('show');};
 panel.querySelector('#stableClose').onclick=()=>ov.classList.remove('show');panel.querySelector('#stableCancel').onclick=()=>ov.classList.remove('show');update();ov.classList.add('show');
}
function patch(){
 ensure();const original=window.addWithQty;
 window.addWithQty=function(i){const p=products()[i];if(p){const ov=document.getElementById('vpxShopOverlay');if(ov){try{ov.style.display='flex'}catch(e){}chooser(p)}else if(original)original(i)}};
 window.add=function(i){const p=products()[i];if(p)window.addWithQty(i)};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-vpx-close]');if(b){e.preventDefault();e.stopImmediatePropagation();const ov=document.getElementById('vpxShopOverlay');if(ov)ov.classList.remove('show')}},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(patch,50),{once:true});else setTimeout(patch,50);
})();

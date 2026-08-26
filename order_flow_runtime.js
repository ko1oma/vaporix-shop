(function(){
  'use strict';
  if(window.__VAPORIX_RUNTIME_PATCH__) return;
  window.__VAPORIX_RUNTIME_PATCH__=true;

  function loadLegacy(done){
    var s=document.createElement('script');
    s.src='order_flow_legacy.js?v=20260826fix1';
    s.onload=done;
    s.onerror=done;
    document.head.appendChild(s);
  }

  loadLegacy(function(){
    function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
    function getProducts(){try{if(typeof products==='function')return products()||[]}catch(e){}return Array.isArray(window.products)?window.products:[]}
    function getCart(){try{return cart}catch(e){}return Array.isArray(window.cart)?window.cart:null}
    function money(n){return Number(n||0).toFixed(2)}
    function tiers(p){try{if(typeof productTiers==='function')return productTiers(p)||[]}catch(e){}var t=p&&p.tiers;if(!Array.isArray(t))return[];if(t.length&&typeof t[0]==='object')return t;var qs=[20,30,50,70,100];return t.map(function(price,i){return{qty:qs[i],price:Number(price||0)}}).filter(function(x){return x.price>0})}
    function unitPrice(p,q){var u=Number(p&&p.price||0);tiers(p).forEach(function(t){if(q>=Number(t.qty||0))u=Number(t.price||u)});return u}
    function stockFor(p,flavor){var fs=p&&p.flavorStocks||{};if(flavor&&Object.prototype.hasOwnProperty.call(fs,flavor))return Math.max(0,Number(fs[flavor]||0));return Number(p&&p.stock||0)}
    function productIndexForButton(btn){var arr=getProducts(),card=btn.closest('.card'),name=card&&card.querySelector('.name')?card.querySelector('.name').textContent.trim():'',id=card&&card.dataset?card.dataset.productId:'';if(id){var byId=arr.findIndex(function(p){return String(p.id)===String(id)});if(byId>=0)return byId}if(name){var byName=arr.findIndex(function(p){return String(p.name||'').trim()===name});if(byName>=0)return byName}var cards=[].slice.call(document.querySelectorAll('.card')),pos=cards.indexOf(card);return pos>=0&&arr[pos]?pos:-1}
    var css=document.createElement('style');css.id='vaporix-add-cart-fix-css';css.textContent=`
      .card-actions{grid-template-columns:1fr!important}.card-qty{display:none!important}.add-cart{width:100%!important;height:38px!important}
      #vpxAddModal{position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(8px)}
      #vpxAddModal.show{display:flex}#vpxAddModal .vpx-add-box{width:min(520px,100%);max-height:min(88vh,760px);overflow:auto;background:var(--panel,#151518);border:1px solid var(--line2,#4a4a55);border-radius:26px;padding:22px;box-shadow:0 25px 80px rgba(0,0,0,.55)}
      #vpxAddModal .vpx-add-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}#vpxAddModal h2{margin:0;font-size:22px;line-height:1.15}#vpxAddModal .vpx-muted{color:var(--muted,#a0a0aa);font-size:13px;margin-top:5px}#vpxAddModal .vpx-close{width:38px;height:38px;border-radius:11px;background:var(--panel2,#1c1c21);border:1px solid var(--line,#34343c);color:var(--text,#fff);font-size:20px}
      #vpxAddModal .vpx-img{height:150px;margin:12px 0;border-radius:18px;background:var(--panel2,#1c1c21);display:grid;place-items:center;overflow:hidden}#vpxAddModal .vpx-img img{max-width:100%;max-height:100%;object-fit:contain}
      #vpxAddModal .vpx-title{font-weight:850;font-size:16px;margin:14px 0 9px}#vpxAddModal .vpx-flavors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}#vpxAddModal .vpx-flavor{min-height:48px;padding:10px 12px;border-radius:13px;background:var(--panel2,#1c1c21);border:1px solid var(--line,#34343c);color:var(--text,#fff);text-align:left;font-weight:800}#vpxAddModal .vpx-flavor.active{border-color:#8d5cff;box-shadow:0 0 0 2px #8d5cff33;background:#4b287e}#vpxAddModal .vpx-flavor small{display:block;color:var(--muted,#a0a0aa);font-weight:700;margin-top:3px}
      #vpxAddModal .vpx-qty{display:flex;align-items:center;justify-content:center;gap:20px;margin:17px 0}#vpxAddModal .vpx-qbtn{width:42px;height:42px;border-radius:12px;background:var(--panel2,#1c1c21);border:1px solid var(--line,#34343c);font-size:23px}#vpxAddModal .vpx-qnum{min-width:35px;text-align:center;font-size:21px;font-weight:900}#vpxAddModal .vpx-total{display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-top:1px solid var(--line,#34343c);margin-top:6px;font-weight:850}#vpxAddModal .vpx-total b{font-size:20px;color:#9a68ff}#vpxAddModal .vpx-add-btn{width:100%;margin-top:10px;height:48px;border-radius:15px;background:linear-gradient(100deg,var(--pink,#ff299e),var(--purple,#7c42ff));color:#fff;font-weight:900;font-size:16px}
      @media(max-width:520px){#vpxAddModal .vpx-flavors{grid-template-columns:1fr}}
    `;document.head.appendChild(css);
    var modal=document.getElementById('vpxAddModal');if(!modal){modal=document.createElement('div');modal.id='vpxAddModal';modal.innerHTML='<div class="vpx-add-box" role="dialog" aria-modal="true"><div id="vpxAddContent"></div></div>';document.body.appendChild(modal);modal.addEventListener('click',function(e){if(e.target===modal)closeAddModal()})}
    function closeAddModal(){modal.classList.remove('show');document.body.style.overflow='auto'}window.closeVaporixAddModal=closeAddModal;
    function openAddModal(index){
      var arr=getProducts(),p=arr[index];if(!p)return;var flavors=Array.isArray(p.flavors)?p.flavors.map(String).filter(Boolean):[],selected=null,qty=1,max=function(){var s=stockFor(p,selected);return s>=80?999999:s},c=document.getElementById('vpxAddContent');
      c.innerHTML=`<div class="vpx-add-head"><div><h2>Добавить в корзину</h2><div class="vpx-muted">${esc(p.name)}</div></div><button class="vpx-close" type="button" id="vpxAddClose">✕</button></div><div class="vpx-img"><img src="${esc(p.img||'')}" alt="${esc(p.name)}"></div>${flavors.length?`<div class="vpx-title">Выберите вкус</div><div class="vpx-flavors">${flavors.map(function(f){var s=stockFor(p,f);return `<button type="button" class="vpx-flavor" data-vpx-flavor="${esc(f)}">${esc(f)}<small>Остаток: ${s>=80?'80+':s}</small></button>`}).join('')}</div>`:''}<div class="vpx-title">Количество</div><div class="vpx-qty"><button type="button" class="vpx-qbtn" id="vpxMinus">−</button><span class="vpx-qnum" id="vpxQty">1</span><button type="button" class="vpx-qbtn" id="vpxPlus">+</button></div><div class="vpx-total"><span>Итого</span><b id="vpxTotal">${money(unitPrice(p,1))} EUR</b></div><button type="button" class="vpx-add-btn" id="vpxConfirmAdd">Добавить в корзину</button>`;
      modal.classList.add('show');document.body.style.overflow='hidden';
      function update(){var lim=max();if(lim>0)qty=Math.min(qty,lim);document.getElementById('vpxQty').textContent=qty;document.getElementById('vpxTotal').textContent=money(unitPrice(p,qty)*qty)+' EUR';document.getElementById('vpxPlus').disabled=lim>0&&qty>=lim}
      document.getElementById('vpxAddClose').onclick=closeAddModal;document.getElementById('vpxMinus').onclick=function(){qty=Math.max(1,qty-1);update()};document.getElementById('vpxPlus').onclick=function(){var lim=max();if(lim<=0)return;qty=Math.min(lim,qty+1);update()};c.querySelectorAll('[data-vpx-flavor]').forEach(function(b){b.onclick=function(){selected=b.dataset.vpxFlavor;c.querySelectorAll('.vpx-flavor').forEach(function(x){x.classList.remove('active')});b.classList.add('active');qty=1;update()}});
      document.getElementById('vpxConfirmAdd').onclick=function(){if(flavors.length&&!selected){alert('Выберите вкус.');return}var cartRef=getCart();if(!cartRef){alert('Корзина временно недоступна.');return}var item={id:p.id,product:p,qty:qty,flavor:selected||null},existing=cartRef.find(function(x){return String(x.id)===String(item.id)&&String(x.flavor||'')===String(item.flavor||'')});if(existing)existing.qty=Number(existing.qty||0)+qty;else cartRef.push(item);try{if(typeof renderCart2==='function')renderCart2();else if(typeof renderCart==='function')renderCart()}catch(e){}closeAddModal()};update();
    }
    document.addEventListener('click',function(e){var btn=e.target.closest&&e.target.closest('.add-cart');if(!btn)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();var index=productIndexForButton(btn);if(index>=0)openAddModal(index)},true);
    function fixBrand(){document.title='VAPORIX — каталог';document.querySelectorAll('body *').forEach(function(el){if(el.children.length===0&&el.textContent.trim()==='PUFF HUB')el.textContent='VAPORIX'})}fixBrand();new MutationObserver(fixBrand).observe(document.body,{childList:true,subtree:true});
  });
})();

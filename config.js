window.VAPORIX_CONFIG = {
  SUPABASE_URL: 'https://kjwfkqexwemztakagihl.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_RLAGN9MDHIaVo708txjldQ_b87BYhIV'
};

/* VAPORIX UI/data enhancements */
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .logo .vapo-part{color:var(--text)!important}
    .logo .rix-part{color:var(--pink)!important}
    #pTiersEditor{grid-column:1/-1;background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:14px}
    #pTiersEditor .tierHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;font-weight:800}
    #pTiersEditor .tierHint{font-size:12px;color:var(--muted);font-weight:500;margin-top:3px}
    #pTiersEditor .tierRow{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin:8px 0;align-items:center}
    #pTiersEditor input{width:100%}
    #pTiersEditor .tierRemove{width:38px;height:38px;border-radius:10px;background:transparent;border:1px solid var(--line);color:var(--muted)}
    #pTiersEditor .tierRemove:hover{color:#ff4f70;border-color:#ff4f70}
    #pTiersEditor .tierAdd{margin-top:8px}
    .dynamic-cat .circle img{width:100%;height:100%;object-fit:contain;border-radius:50%;background:var(--panel);position:relative;z-index:1}
    .dynamic-cat .circle{position:relative}
  `;
  document.head.appendChild(style);

  // Storefront: make VAPO react to the current theme while RIX stays pink.
  document.querySelectorAll('.logo').forEach(logo => {
    if (logo.dataset.vaporixSplit === '1') return;
    logo.dataset.vaporixSplit = '1';
    logo.innerHTML = '<span class="vapo-part">VAPO</span><span class="rix-part">RIX</span>';
  });

  // Admin: add arbitrary wholesale quantity/price rows without changing the existing HTML.
  if (document.getElementById('productForm')) {
    const wholesale = document.getElementById('pWholesale')?.closest('label');
    if (wholesale && !document.getElementById('pTiersEditor')) {
      const box = document.createElement('div');
      box.id = 'pTiersEditor';
      box.innerHTML = `
        <div class="tierHead"><div>Оптовые цены по количеству<div class="tierHint">Для каждого порога укажи своё количество и цену за 1 единицу.</div></div><button type="button" class="secondary tierAdd" id="addTierBtn">+ Добавить порог</button></div>
        <div id="tierRows"></div>
      `;
      wholesale.parentElement.insertBefore(box, wholesale.nextElementSibling);
      document.getElementById('addTierBtn').addEventListener('click', () => addTierRow());
    }

    const getTiers = () => Array.from(document.querySelectorAll('#tierRows .tierRow')).map(row => ({
      qty: Number(row.querySelector('.tierQty').value),
      price: Number(row.querySelector('.tierPrice').value)
    })).filter(x => Number.isFinite(x.qty) && x.qty > 0 && Number.isFinite(x.price) && x.price >= 0).sort((a,b) => a.qty-b.qty);

    window.addTierRow = function(tier={qty:'',price:''}) {
      const rows = document.getElementById('tierRows');
      if (!rows) return;
      const row = document.createElement('div');
      row.className = 'tierRow';
      row.innerHTML = `<input class="tierQty" type="number" min="1" step="1" placeholder="Количество, например 20" value="${tier.qty ?? ''}"><input class="tierPrice" type="number" min="0" step="0.01" placeholder="Цена за 1 шт., €" value="${tier.price ?? ''}"><button type="button" class="tierRemove" aria-label="Удалить">×</button>`;
      row.querySelector('.tierRemove').addEventListener('click', () => row.remove());
      rows.appendChild(row);
    };

    window.renderTierRows = function(tiers) {
      const rows = document.getElementById('tierRows');
      if (!rows) return;
      rows.innerHTML = '';
      (Array.isArray(tiers) ? tiers : []).forEach(addTierRow);
    };

    const originalOpenProduct = window.openProduct;
    window.openProduct = function(id=null) {
      originalOpenProduct(id);
      const p = id ? products.find(x => x.id === id) : null;
      renderTierRows(p?.tiers || []);
    };

    window.saveProduct = async function(e) {
      e.preventDefault();
      $('productError').textContent='';
      const id=$('productId').value;
      let imageUrl=$('pImage').value.trim()||null;
      const file=$('pImageFile').files?.[0];
      if(file){try{imageUrl=await uploadImage(file,'products')}catch(err){$('productError').textContent=err.message||String(err);return}}
      const tiers=getTiers();
      const payload={name:$('pName').value.trim(),slug:$('pSlug').value.trim(),category_id:$('pCategory').value?Number($('pCategory').value):null,price:Number($('pPrice').value),wholesale_price:$('pWholesale').value?Number($('pWholesale').value):null,stock:Number($('pStock').value),image_url:imageUrl,description:$('pDescription').value.trim()||null,active:$('pActive').checked,tiers};
      const res=id?await sb.from('products').update(payload).eq('id',Number(id)):await sb.from('products').insert(payload).select().single();
      if(res.error){$('productError').textContent=res.error.message;return}
      $('productDialog').close();
      await loadAll();
      showSection('products');
    };
  }

  // Storefront: render every active DB category, including categories created from admin.
  if (document.getElementById('categories') && window.supabase && window.VAPORIX_CONFIG) {
    const storeSb = supabase.createClient(window.VAPORIX_CONFIG.SUPABASE_URL, window.VAPORIX_CONFIG.SUPABASE_ANON_KEY);
    const loadDynamicCategories = async () => {
      const {data,error} = await storeSb.from('categories').select('*').eq('is_active',true).order('sort_order').order('name');
      if (error || !Array.isArray(data)) return;
      const wrap = document.getElementById('categories');
      if (!wrap) return;
      data.filter(c => c.slug !== 'all').forEach(c => {
        let btn = Array.from(wrap.querySelectorAll('.cat')).find(x => x.dataset.cat === c.name);
        if (!btn) {
          btn = document.createElement('button');
          btn.className = 'cat dynamic-cat';
          btn.dataset.cat = c.name;
          btn.addEventListener('click', () => window.setCat(c.name));
          wrap.appendChild(btn);
        }
        btn.dataset.cat = c.name;
        let circle = btn.querySelector('.circle');
        if (!circle) {
          circle = document.createElement('div');
          circle.className = 'circle';
          btn.prepend(circle);
        }
        circle.dataset.categoryImage = c.name;
        if (c.image_url) {
          circle.classList.add('has-image');
          circle.innerHTML = `<img src="${String(c.image_url).replace(/"/g,'&quot;')}" alt="${String(c.name).replace(/"/g,'&quot;')}">`;
        }
        let label = btn.querySelector('b');
        if (!label) { label = document.createElement('b'); btn.appendChild(label); }
        label.textContent = c.name;
      });
    };
    loadDynamicCategories();
  }

  // Storefront: the database now stores arbitrary wholesale tiers. Replace the old fixed 20/30/50/70/100 rows after render.
  if (document.getElementById('grid')) {
    const paintTiers = () => {
      const grid = document.getElementById('grid');
      if (!grid || !Array.isArray(window.products || products)) return;
      grid.querySelectorAll('.card').forEach(card => {
        const nameEl = card.querySelector('.name');
        const tierGrid = card.querySelector('.tiers-grid');
        if (!nameEl || !tierGrid) return;
        const p = (window.products || products).find(x => String(x.name) === String(nameEl.textContent));
        if (!p || !Array.isArray(p.tiers) || !p.tiers.length) return;
        tierGrid.innerHTML = p.tiers.map(t => `<span><b>${Number(t.qty)} ${typeof window.t === 'function' ? window.t('units') : 'шт'}</b><b>${Number(t.price).toFixed(2)}</b></span>`).join('');
      });
    };
    const observer = new MutationObserver(() => requestAnimationFrame(paintTiers));
    observer.observe(document.getElementById('grid'), {childList:true,subtree:true});
    setTimeout(paintTiers, 0);
  }
});
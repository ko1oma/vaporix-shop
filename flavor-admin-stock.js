(function(){
  const wait=()=>document.getElementById('productForm')&&(typeof sb!=='undefined');
  const start=()=>{
    if(!wait()) return setTimeout(start,200);
    const $id=id=>document.getElementById(id);
    let flavorDraft=[];
    const cleanFlavor=v=>String(v??'').replace(/\s*📦\s*(?:80\+|\d+)\s*$/,'').trim();
    const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
    const render=()=>{
      const list=$id('flavorAdminList'); if(!list)return;
      list.innerHTML=flavorDraft.length ? flavorDraft.map((f,i)=>`<div class="flavor-admin-row"><input class="flavor-name" maxlength="80" value="${esc(f.name)}" data-i="${i}" placeholder="Вкус"><input class="flavor-stock" type="number" min="0" step="1" value="${Number.isFinite(Number(f.stock))?Number(f.stock):0}" data-i="${i}" placeholder="Количество"><button type="button" class="flavor-remove" data-i="${i}" aria-label="Удалить вкус">×</button></div>`).join('') : '<span class="flavor-admin-empty">Вкусов пока нет. Добавь первый вкус ниже.</span>';
      const status=$id('flavorAdminStatus'); if(status)status.textContent=`Вкусов: ${flavorDraft.length}. Количество каждого вкуса сохраняется отдельно.`;
      list.querySelectorAll('.flavor-name').forEach(x=>x.oninput=e=>{flavorDraft[Number(e.target.dataset.i)].name=e.target.value});
      list.querySelectorAll('.flavor-stock').forEach(x=>x.oninput=e=>{flavorDraft[Number(e.target.dataset.i)].stock=Math.max(0,Number(e.target.value)||0)});
      list.querySelectorAll('.flavor-remove').forEach(x=>x.onclick=e=>{flavorDraft.splice(Number(e.currentTarget.dataset.i),1);render()});
    };
    const originalOpen=window.openProduct;
    window.openProduct=async function(id=null){
      originalOpen(id);
      flavorDraft=[];
      if(id){
        const {data,error}=await sb.from('product_flavors').select('name,stock').eq('product_id',Number(id)).order('id');
        if(error)console.warn('product_flavors:',error);
        flavorDraft=(data||[]).map(x=>({name:cleanFlavor(x.name),stock:Number(x.stock)||0}));
      }
      render();
    };
    const addBtn=$id('addFlavorBtn');
    if(addBtn)addBtn.onclick=()=>{const input=$id('pFlavorInput');const name=input.value.trim();if(!name)return;if(flavorDraft.some(x=>x.name.toLowerCase()===name.toLowerCase()))return;flavorDraft.push({name,stock:0});input.value='';render();input.focus()};
    const input=$id('pFlavorInput');
    if(input)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();addBtn?.click()}};
    const form=$id('productForm');
    form.addEventListener('submit',async function(e){
      e.preventDefault();e.stopImmediatePropagation();$id('productError').textContent='';
      try{
        const id=$id('productId').value;let imageUrl=$id('pImage').value.trim()||null;const file=$id('pImageFile').files?.[0];if(file)imageUrl=await uploadImage(file,'products');
        const tiers=Array.from(document.querySelectorAll('#tierRows .tierRow')).map(row=>({qty:Number(row.querySelector('.tierQty').value),price:Number(row.querySelector('.tierPrice').value)})).filter(x=>Number.isFinite(x.qty)&&x.qty>0&&Number.isFinite(x.price)&&x.price>=0).sort((a,b)=>a.qty-b.qty);
        const cleaned=[];const seen=new Set();flavorDraft.forEach(f=>{const name=cleanFlavor(f.name);if(!name)return;const key=name.toLowerCase();if(seen.has(key))return;seen.add(key);cleaned.push({name,stock:Math.max(0,Math.floor(Number(f.stock)||0))})});
        const payload={name:$id('pName').value.trim(),slug:$id('pSlug').value.trim(),category_id:$id('pCategory').value?Number($id('pCategory').value):null,price:Number($id('pPrice').value),wholesale_price:$id('pWholesale').value?Number($id('pWholesale').value):null,stock:Number($id('pStock').value),image_url:imageUrl,description:$id('pDescription').value.trim()||null,active:$id('pActive').checked,tiers,flavors:cleaned.map(x=>x.name)};
        let res=id?await sb.from('products').update(payload).eq('id',Number(id)).select('id').single():await sb.from('products').insert(payload).select('id').single();
        if(res.error)throw res.error;const productId=Number(res.data.id);
        const del=await sb.from('product_flavors').delete().eq('product_id',productId);if(del.error)throw del.error;
        if(cleaned.length){const ins=await sb.from('product_flavors').insert(cleaned.map(x=>({product_id:productId,name:x.name,stock:x.stock})));if(ins.error)throw ins.error}
        $id('productDialog').close();await loadAll();showSection('products');
      }catch(err){$id('productError').textContent=err?.message||String(err)}
    },true);
  };start();
})();

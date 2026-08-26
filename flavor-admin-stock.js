(function(){
  'use strict';
  const wait=()=>document.getElementById('productForm')&&typeof sb!=='undefined';
  const start=()=>{
    if(!wait())return setTimeout(start,200);
    const $=id=>document.getElementById(id);let draft=[];
    const clean=v=>String(v??'').replace(/\s*📦\s*(?:80\+|\d+)\s*$/,'').trim();
    const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
    const total=()=>draft.reduce((s,x)=>s+Math.max(0,Math.floor(Number(x.stock)||0)),0);
    function status(){const el=$('flavorAdminStatus');if(el)el.textContent=draft.length?`Вкусов: ${draft.length}. Общий остаток: ${total()} шт.`:'Вкусов нет. Используется общий остаток товара.'}
    function render(){
      const list=$('flavorAdminList');if(!list)return;
      list.innerHTML=draft.length?draft.map((f,i)=>`<div class="flavor-admin-row"><input class="flavor-name" maxlength="80" value="${esc(f.name)}" data-i="${i}" placeholder="Название вкуса"><input class="flavor-stock" type="number" min="0" step="1" value="${Math.max(0,Math.floor(Number(f.stock)||0))}" data-i="${i}" placeholder="Остаток"><button type="button" class="flavor-remove" data-i="${i}" aria-label="Удалить вкус">×</button></div>`).join(''):'<span class="flavor-admin-empty">Вкусов пока нет. Добавь первый вкус ниже.</span>';
      status();list.querySelectorAll('.flavor-name').forEach(el=>el.addEventListener('input',e=>{draft[Number(e.target.dataset.i)].name=e.target.value;status()}));list.querySelectorAll('.flavor-stock').forEach(el=>el.addEventListener('input',e=>{draft[Number(e.target.dataset.i)].stock=Math.max(0,Math.floor(Number(e.target.value)||0));status()}));list.querySelectorAll('.flavor-remove').forEach(el=>el.addEventListener('click',e=>{draft.splice(Number(e.currentTarget.dataset.i),1);render()}));
    }
    async function load(id){draft=[];render();if(!id)return;const {data,error}=await sb.rpc('admin_get_product_flavors',{p_product_id:Number(id)});if(error){console.warn('admin_get_product_flavors:',error);return}draft=(data||[]).map(x=>({name:clean(x.name),stock:Math.max(0,Math.floor(Number(x.stock)||0))})).filter(x=>x.name);render()}
    const originalOpen=window.openProduct;window.openProduct=async function(id=null){originalOpen(id);await load(id)};
    const add=()=>{const input=$('pFlavorInput'),name=clean(input?.value);if(!name)return;if(draft.some(x=>x.name.toLowerCase()===name.toLowerCase())){alert('Такой вкус уже добавлен.');return}draft.push({name,stock:0});input.value='';render();input.focus()};
    $('addFlavorBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();add()},true);$('pFlavorInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();add()}},true);
    $('productForm')?.addEventListener('submit',async e=>{
      e.preventDefault();e.stopImmediatePropagation();const err=$('productError');if(err)err.textContent='';const submit=e.submitter||$('productForm').querySelector('button[type="submit"]');if(submit){submit.disabled=true;submit.textContent='Сохраняю…'}
      try{
        const id=$('productId').value;let imageUrl=$('pImage').value.trim()||null;const file=$('pImageFile').files?.[0];if(file)imageUrl=await uploadImage(file,'products');
        const names=[];const seen=new Set();const cleaned=[];draft.forEach(x=>{const name=clean(x.name),key=name.toLowerCase();if(!name||seen.has(key))return;seen.add(key);const stock=Math.max(0,Math.floor(Number(x.stock)||0));names.push(name);cleaned.push({name,stock})});
        const manualStock=Math.max(0,Math.floor(Number($('pStock').value)||0));const tiers=Array.from(document.querySelectorAll('#tierRows .tierRow')).map(row=>({qty:Number(row.querySelector('.tierQty')?.value),price:Number(row.querySelector('.tierPrice')?.value)})).filter(x=>x.qty>0&&Number.isFinite(x.price)).sort((a,b)=>a.qty-b.qty);
        const payload={name:$('pName').value.trim(),slug:$('pSlug').value.trim(),category_id:$('pCategory').value?Number($('pCategory').value):null,price:Number($('pPrice').value),wholesale_price:$('pWholesale').value?Number($('pWholesale').value):null,stock:cleaned.length?cleaned.reduce((s,x)=>s+x.stock,0):manualStock,image_url:imageUrl,description:$('pDescription').value.trim()||null,active:$('pActive').checked,tiers,flavors:names};
        if(!payload.name||!payload.slug||!Number.isFinite(payload.price))throw new Error('Заполните название, slug и корректную цену.');
        const res=id?await sb.from('products').update(payload).eq('id',Number(id)).select('id').single():await sb.from('products').insert(payload).select('id').single();if(res.error)throw res.error;
        const productId=Number(id||res.data.id);const flavorRes=await sb.rpc('admin_set_product_flavors',{p_product_id:productId,p_flavors:cleaned});if(flavorRes.error)throw flavorRes.error;
        $('productDialog').close();await loadAll();showSection('products');
      }catch(error){if(err)err.textContent=error?.message||String(error)}finally{if(submit){submit.disabled=false;submit.textContent='Сохранить'}}
    },true);
    window.__vaporixFlavorEditor={getDraft:()=>draft,render};
  };start();
})();

from pathlib import Path

p = Path('config.js')
s = p.read_text(encoding='utf-8')
if 'FLAVOR_STOCK_SYNC_V1' in s:
    print('already patched')
    raise SystemExit(0)

old_query = """      const [cr,pr]=await Promise.all([\n        db.from('categories').select('id,name,slug,image_url,is_active,sort_order').eq('is_active',true).order('sort_order').order('name'),\n        db.from('products').select('id,name,slug,category_id,price,stock,image_url,description,brand,active,tiers,flavors,categories(name)').eq('active',true).order('created_at',{ascending:false})\n      ]);\n      if(pr.error)throw pr.error;\n      const dbProducts=Array.isArray(pr.data)?pr.data:[];"""
new_query = """      const [cr,pr,fr]=await Promise.all([\n        db.from('categories').select('id,name,slug,image_url,is_active,sort_order').eq('is_active',true).order('sort_order').order('name'),\n        db.from('products').select('id,name,slug,category_id,price,stock,image_url,description,brand,active,tiers,flavors,categories(name)').eq('active',true).order('created_at',{ascending:false}),\n        db.from('product_flavors').select('product_id,name,stock').order('name')\n      ]);\n      if(pr.error)throw pr.error;\n      const dbProducts=Array.isArray(pr.data)?pr.data:[];\n      const flavorStockMap=new Map();\n      if(!fr.error&&Array.isArray(fr.data)) fr.data.forEach(f=>{\n        const pid=Number(f.product_id);\n        if(!flavorStockMap.has(pid)) flavorStockMap.set(pid,{});\n        flavorStockMap.get(pid)[String(f.name)]=Math.max(0,Number(f.stock)||0);\n      });"""
if old_query not in s:
    raise SystemExit('catalog query block not found')
s = s.replace(old_query, new_query, 1)
old_return = """return {id:p.id,dbId:p.id,name:p.name||'',slug:p.slug||'',price:Number(p.price||0),stock:Number(p.stock||0)>80?'80+':String(Number(p.stock||0)),cat:p.categories?.name||'',category_id:p.category_id??null,brand:p.brand||p.categories?.name||'',img:p.image_url||fallback?.img||'',description:p.description||'',tiers:numericTiers(p.tiers,p.price),flavors:Array.isArray(p.flavors)?p.flavors.filter(Boolean).map(String):[]};"""
new_return = """return {id:p.id,dbId:p.id,name:p.name||'',slug:p.slug||'',price:Number(p.price||0),stock:Number(p.stock||0)>80?'80+':String(Number(p.stock||0)),cat:p.categories?.name||'',category_id:p.category_id??null,brand:p.brand||p.categories?.name||'',img:p.image_url||fallback?.img||'',description:p.description||'',tiers:numericTiers(p.tiers,p.price),flavors:Array.isArray(p.flavors)?p.flavors.filter(Boolean).map(String):[],flavorStocks:flavorStockMap.get(Number(p.id))||{}};"""
if old_return not in s:
    raise SystemExit('product mapping block not found')
s = s.replace(old_return, new_return, 1)
s = s.replace("  // MULTI_FLAVOR_CHOOSER_V2", "  // MULTI_FLAVOR_CHOOSER_V2\n  // FLAVOR_STOCK_SYNC_V1", 1)
p.write_text(s, encoding='utf-8')
print('patched')

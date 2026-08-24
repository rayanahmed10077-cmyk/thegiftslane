export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 try{
  const {customer,items}=req.body||{};
  if(!customer?.name||!customer?.phone||!customer?.email||!customer?.address||!items?.length) return res.status(400).json({error:'Missing order details'});
  const catalog={'01':799,'02':1299,'03':999,'04':299,'05':1499,'06':499,'07':899,'08':699,'09':1099,'10':1799,'11':1599,'12':599};
  const cleanItems=items.map(i=>({id:String(i.id),name:String(i.name),price:Number(catalog[String(i.id)]),qty:Math.max(1,Math.floor(Number(i.qty)))}));
  if(cleanItems.some(i=>!catalog[i.id]||!Number.isFinite(i.qty))) return res.status(400).json({error:'Invalid product'});
  const subtotal=cleanItems.reduce((s,i)=>s+i.price*i.qty,0), shipping=subtotal>0&&subtotal<999?79:0, total=subtotal+shipping;
  if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({error:'Supabase server credentials are not configured'});
  const orderNumber=`TGL-${Date.now().toString().slice(-8)}`;
  const row={order_number:orderNumber,customer_name:customer.name,phone:customer.phone,email:customer.email,address:customer.address,items:cleanItems,subtotal,shipping,total,payment_status:'pending',order_status:'new'};
  const r=await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders`,{method:'POST',headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(row)});
  const data = await r.json();

if (!r.ok) {
  console.error("SUPABASE ERROR:", data);
  throw new Error(JSON.stringify(data));
}
  return res.status(200).json({ok:true,orderId:data[0].id,orderNumber,total});
 }catch(e){
  console.error("CREATE ORDER ERROR:", e);
  return res.status(500).json({
    error:"CREATE_ORDER_FAILED",
    details:e.message
  });
}
}

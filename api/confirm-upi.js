export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 try{
  const {orderId,transactionId}=req.body||{};
  if(!orderId||!transactionId) return res.status(400).json({error:'Order ID and transaction ID are required'});
  if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({error:'Supabase server credentials are not configured'});
  const base=`${process.env.SUPABASE_URL}/rest/v1/orders`;
  const headers={apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',Prefer:'return=representation'};
  const r=await fetch(`${base}?id=eq.${encodeURIComponent(orderId)}`,{method:'PATCH',headers,body:JSON.stringify({payment_id:transactionId,payment_status:'pending',order_status:'new'})});
  const data=await r.json(); if(!r.ok||!data.length)return res.status(404).json({error:'Order not found'});
  return res.status(200).json({ok:true,orderNumber:data[0].order_number});
 }catch(e){return res.status(500).json({error:e.message});}
}
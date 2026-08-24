const UPI_ID = '7019445211@ybl';
const UPI_NAME = 'The Gifts Lane';

const PRODUCTS = [
['01','Forever Flower Bouquet','Bouquets',799,'images/gift_01.jpg','Handmade flower bouquet with a soft pink finish.'],
['02','Balloon & Chocolate Hamper','Gift Boxes',1299,'images/gift_02.jpg','A romantic balloon arrangement with chocolates and flowers.'],
['03','Rose & Lily Bouquet','Bouquets',999,'images/gift_03.jpg','A bold bouquet featuring roses, lilies and elegant wrapping.'],
['04','Handmade Flower Keychain','Custom Gifts',299,'images/gift_04.jpg','A cute handmade flower keepsake, perfect for a little surprise.'],
['05','Birthday Gift Set','Gift Boxes',1499,'images/gift_05.jpg','A personalised birthday arrangement with balloons, flowers and treats.'],
['06','Flower Keychain Pair','Custom Gifts',499,'images/gift_06.jpg','Handmade floral keychains created for gifting and keepsakes.'],
['07','Sunflower Bouquet','Bouquets',899,'images/gift_07.jpg','A cheerful handmade sunflower bouquet with a statement centre.'],
['08','Handmade Tiara','Custom Gifts',699,'images/gift_08.jpg','A pearl-and-flower handmade tiara for celebrations and special days.'],
['09','Kinder Joy Bouquet','Bouquets',1099,'images/gift_09.jpg','A playful chocolate bouquet wrapped in signature pink and gold.'],
['10','Celebration Hamper','Wedding Hampers',1799,'images/gift_10.jpg','A curated hamper filled with treats, essentials and decorative details.'],
['11','Personalised Gift Basket','Gift Boxes',1599,'images/gift_11.jpg','A customised gift basket with photos, chocolates and keepsakes.'],
['12','Mystery Jar','Custom Gifts',599,'images/gift_12.jpg','A creative mini hamper idea that can be customised for your person.']
].map(([id,name,category,price,image,description])=>({id,name,category,price,image,description}));

const CART_KEY='tgl_cart_v2';
let cart=JSON.parse(localStorage.getItem(CART_KEY)||'{}');
const money=n=>`₹${Number(n).toLocaleString('en-IN')}`;
const items=()=>Object.values(cart);
const subtotal=()=>items().reduce((s,i)=>s+i.price*i.qty,0);
const shipping=()=>subtotal()===0?0:(subtotal()<999?79:0);
const total=()=>subtotal()+shipping();
const save=()=>{localStorage.setItem(CART_KEY,JSON.stringify(cart));renderCart();};

function toast(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
function renderProducts(filter='All', query=''){
 const grid=document.getElementById('productGrid');
 const q=query.trim().toLowerCase();
 const filtered=PRODUCTS.filter(p=>(filter==='All'||p.category===filter)&&(!q||`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)));
 grid.innerHTML=filtered.map(p=>`<article class="product-card"><div class="product-media"><img src="${p.image}" alt="${p.name}" loading="lazy"><button class="quick-add" data-add="${p.id}" aria-label="Add ${p.name} to cart">+</button></div><div class="product-info"><span>${p.category}</span><h3>${p.name}</h3><p>${p.description}</p><div class="product-buy"><strong>${money(p.price)}</strong><button class="add-button" data-add="${p.id}">Add to cart</button></div></div></article>`).join('') || '<div class="no-results">No gifts found. Try another search.</div>';
 document.getElementById('resultCount').textContent=`${filtered.length} ${filtered.length===1?'gift':'gifts'}`;
}
function renderCart(){
 const count=items().reduce((s,i)=>s+i.qty,0);
 document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=count);
 document.getElementById('cartItems').innerHTML=items().length?items().map(i=>`<div class="cart-row"><img src="${i.image}" alt="${i.name}"><div class="cart-row-main"><strong>${i.name}</strong><small>${money(i.price)} each</small><div class="qty"><button data-minus="${i.id}">−</button><span>${i.qty}</span><button data-plus="${i.id}">+</button><button class="remove" data-remove="${i.id}">Remove</button></div></div><b>${money(i.price*i.qty)}</b></div>`).join(''):'<div class="empty-cart"><div>♡</div><h3>Your cart is empty</h3><p>Add something beautiful and it will appear here.</p></div>';
 document.getElementById('cartSubtotal').textContent=money(subtotal());
 document.getElementById('cartShipping').textContent=shipping()?money(shipping()):'FREE';
 document.getElementById('cartTotal').textContent=money(total());
 document.querySelector('[data-checkout]').disabled=!items().length;
}
function addToCart(id){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;cart[id]=cart[id]||{...p,qty:0};cart[id].qty++;save();toast(`${p.name} added to cart`);openCart();}
function change(id,delta){if(!cart[id])return;cart[id].qty+=delta;if(cart[id].qty<=0)delete cart[id];save();}
function openCart(){document.getElementById('cartDrawer').classList.add('open');document.getElementById('overlay').classList.add('show');document.body.classList.add('locked')}
function closeCart(){document.getElementById('cartDrawer').classList.remove('open');document.getElementById('overlay').classList.remove('show');document.body.classList.remove('locked')}
function openCheckout(){if(!items().length){toast('Your cart is empty');return}closeCart();const m=document.getElementById('checkoutModal');m.classList.add('show');m.querySelector('#checkoutSummary').innerHTML=items().map(i=>`<div><span>${i.name} × ${i.qty}</span><b>${money(i.price*i.qty)}</b></div>`).join('');m.querySelector('#checkoutTotal').textContent=money(total());}
function closeCheckout(){document.getElementById('checkoutModal').classList.remove('show')}
function closeSuccess(){document.getElementById('successModal').classList.remove('show')}

async function payNow(e){
 e.preventDefault();const form=e.target;if(!form.checkValidity()){form.reportValidity();return}
 const data=Object.fromEntries(new FormData(form).entries());const btn=form.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Preparing payment…';
 try{
  const order={customer:data,items:items().map(({id,name,price,qty})=>({id,name,price,qty})),subtotal:subtotal(),shipping:shipping(),total:total()};
  const r=await fetch('/api/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)});if(!r.ok)throw new Error(await r.text());const result=await r.json();
  document.getElementById('upiPayment').hidden=false;document.getElementById('checkoutSummary').closest('.checkout-side').classList.add('dimmed');
  document.getElementById('upiIdText').textContent=UPI_ID;document.getElementById('upiAmount').textContent=money(result.total);document.getElementById('orderNumberText').textContent=result.orderNumber;
  const upiUrl=`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${encodeURIComponent(Number(result.total).toFixed(2))}&cu=INR&tn=${encodeURIComponent(result.orderNumber)}`;
  document.getElementById('upiPayLink').href=upiUrl;const qr=document.getElementById('upiQr');qr.innerHTML='';new QRCode(qr,{text:upiUrl,width:210,height:210,colorDark:'#3b2430',colorLight:'#ffffff'});
  const confirm=document.getElementById('confirmUpi');confirm.dataset.orderId=result.orderId;confirm.dataset.orderNumber=result.orderNumber;form.classList.add('submitted');btn.textContent='Payment step ready';toast('Order created. Complete the UPI payment.');
 }catch(err){console.error(err);toast('Could not create the order. Please try again.');btn.disabled=false;btn.textContent='Continue to UPI payment'}
}
async function confirmUpi(){
 const btn=document.getElementById('confirmUpi'),txn=document.getElementById('upiTxnId').value.trim();if(!txn){document.getElementById('upiTxnId').focus();toast('Enter your UPI transaction ID / UTR');return}
 btn.disabled=true;btn.textContent='Submitting order…';
 try{const r=await fetch('/api/confirm-upi',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:btn.dataset.orderId,transactionId:txn})});if(!r.ok)throw new Error(await r.text());const out=await r.json();localStorage.removeItem(CART_KEY);cart={};renderCart();closeCheckout();document.getElementById('successModal').classList.add('show');document.getElementById('successText').textContent=`Order ${out.orderNumber} has been received. We’ll verify your UPI payment and contact you shortly.`;document.getElementById('upiTxnId').value='';
 }catch(err){console.error(err);toast('Could not submit the order. Please try again.');btn.disabled=false;btn.textContent='I have paid — place order'}
}

document.addEventListener('click',e=>{
 if(e.target.matches('[data-add]'))addToCart(e.target.dataset.add);
 if(e.target.matches('[data-plus]'))change(e.target.dataset.plus,1);
 if(e.target.matches('[data-minus]'))change(e.target.dataset.minus,-1);
 if(e.target.matches('[data-remove]')){delete cart[e.target.dataset.remove];save();}
 if(e.target.matches('[data-open-cart]'))openCart();
 if(e.target.matches('[data-close-cart]')||e.target.id==='overlay')closeCart();
 if(e.target.matches('[data-checkout]'))openCheckout();
 if(e.target.matches('[data-close-checkout]'))closeCheckout();
 if(e.target.matches('[data-close-success]'))closeSuccess();
 if(e.target.id==='confirmUpi')confirmUpi();
 if(e.target.id==='copyUpi'){navigator.clipboard?.writeText(UPI_ID);toast('UPI ID copied');}
 if(e.target.matches('[data-filter]')){document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));e.target.classList.add('active');renderProducts(e.target.dataset.filter,document.getElementById('productSearch').value)}
});
document.addEventListener('DOMContentLoaded',()=>{renderProducts();renderCart();document.getElementById('checkoutForm').addEventListener('submit',payNow);document.querySelectorAll('[data-filter-link]').forEach(a=>a.addEventListener('click',()=>{setTimeout(()=>{const f=a.dataset.filterLink;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===f));renderProducts(f,document.getElementById('productSearch').value)},50)}));document.getElementById('productSearch').addEventListener('input',e=>{const active=document.querySelector('[data-filter].active');renderProducts(active?.dataset.filter||'All',e.target.value)});document.querySelectorAll('[data-scroll]').forEach(a=>a.addEventListener('click',()=>document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:'smooth'})));});

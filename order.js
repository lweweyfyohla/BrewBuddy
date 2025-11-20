// this order.js is for Start Ordering, cart and profile modal

const PRODUCTS = [
  { id: 1, name: 'Espresso', price: 2.5, img: 'img/espresso.jpg' },
  { id: 2, name: 'Cappuccino', price: 3.5, img: 'img/cappuccino.jpg' },
  { id: 3, name: 'Latte', price: 3.75, img: 'img/latte.jpg' },
  { id: 4, name: 'Iced Coffee', price: 3.0, img: 'img/icedcoffee.jpg' }
];

function formatPrice(v){ return '$' + v.toFixed(2); }

function getCart(){ try{ return JSON.parse(localStorage.getItem('bb_cart')||'[]'); }catch(e){return[]} }
function saveCart(c){ localStorage.setItem('bb_cart', JSON.stringify(c)); }

function addToCart(productId){
  const cart = getCart();
  const existing = cart.find(i=>i.id===productId);
  if(existing) existing.qty += 1;
  else cart.push({ id: productId, qty: 1 });
  saveCart(cart);
  refreshAllCartViews();
}

function removeFromCart(productId){
  let cart = getCart();
  cart = cart.filter(i=>i.id!==productId);
  saveCart(cart);
  refreshAllCartViews();
}

function refreshAllCartViews(){
  if(document.getElementById('cart-items')) renderCart('cart-items','cart-total');
  if(document.getElementById('modal-cart-items')) renderCart('modal-cart-items','modal-cart-total');
}

function renderCatalogInto(container){
  if(!container) return;
  const heading = container.querySelector('h3');
  container.innerHTML = '';
  if(heading) container.appendChild(heading);
  PRODUCTS.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `\n      <img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">\n      <div class=\"meta\"> <strong>${p.name}</strong><div style=\"color:#777\">${formatPrice(p.price)}</div></div>\n      <div><button data-id="${p.id}">Add</button></div>\n    `;
    container.appendChild(div);
  });
  if(!container.dataset.initialized){
    container.addEventListener('click', (e)=>{
      const btn = e.target.closest('button[data-id]');
      if(!btn) return;
      const id = Number(btn.dataset.id);
      addToCart(id);
    });
    container.dataset.initialized = '1';
  }
}

function renderCart(cartItemsId='cart-items', totalElId='cart-total'){
  const container = document.getElementById(cartItemsId);
  const totalEl = document.getElementById(totalElId);
  if(!container || !totalEl) return;
  const cart = getCart();
  container.innerHTML = '';
  if(cart.length===0){ container.innerHTML = '<div class="empty">Your cart is empty.</div>'; totalEl.textContent = formatPrice(0); return; }
  let total = 0;
  cart.forEach(item=>{
    const p = PRODUCTS.find(x=>x.id===item.id);
    if(!p) return;
    const lineTotal = p.price * item.qty;
    total += lineTotal;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `\n      <div>${p.name} x ${item.qty}</div>\n      <div style=\"display:flex;gap:8px;align-items:center\">${formatPrice(lineTotal)} <button data-remove="${p.id}" style=\"background:none;border:none;color:var(--primary-orange);cursor:pointer\">Remove</button></div>\n    `;
    container.appendChild(div);
  });
  if(!container.dataset.initialized){
    container.addEventListener('click', (e)=>{
      const btn = e.target.closest('button[data-remove]');
      if(!btn) return;
      const id = Number(btn.dataset.remove);
      removeFromCart(id);
    });
    container.dataset.initialized = '1';
  }
  totalEl.textContent = formatPrice(total);
}

function openOrderModal(){
  const modal = document.getElementById('order-modal');
  if(!modal) return false;
  modal.setAttribute('aria-hidden','false');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCatalogInto(document.getElementById('modal-catalog'));
  renderCart('modal-cart-items','modal-cart-total');
  return true;
}
function closeOrderModal(){
  const modal = document.getElementById('order-modal');
  if(!modal) return;
  modal.setAttribute('aria-hidden','true');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function openProfileModal(){
  const modal = document.getElementById('profile-modal');
  if(!modal) return false;

  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const stored = JSON.parse(localStorage.getItem('bb_user')||'null');
  if(stored){ if(nameEl) nameEl.textContent = stored.name||'Guest'; if(emailEl) emailEl.textContent = stored.email||''; }
  modal.setAttribute('aria-hidden','false');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  return true;
}
function closeProfileModal(){
  const modal = document.getElementById('profile-modal');
  if(!modal) return;
  modal.setAttribute('aria-hidden','true');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', ()=>{
  const start = document.getElementById('start-order');
  const profileBtn = document.getElementById('profile-btn');
  const orderModal = document.getElementById('order-modal');
  const profileModal = document.getElementById('profile-modal');

  if(start){
    start.addEventListener('click', (e)=>{
      if(orderModal) openOrderModal(); else window.location.href='order.html';
    });
  }

  if(profileBtn){
    profileBtn.addEventListener('click', (e)=>{
      if(profileModal) openProfileModal(); else window.location.href='membership.html';
    });
  }

  const pageCatalog = document.getElementById('catalog');
  if(pageCatalog){
    renderCatalogInto(pageCatalog);
    renderCart('cart-items','cart-total');
    const checkout = document.getElementById('checkout-btn');
    if(checkout) checkout.addEventListener('click', (e)=>{ e.preventDefault(); alert('This is a demo checkout.'); });
  }

  const orderClose = document.getElementById('order-close');
  if(orderClose) orderClose.addEventListener('click', closeOrderModal);
  if(orderModal){
    orderModal.addEventListener('click', (e)=>{ if(e.target===orderModal) closeOrderModal(); });
  }

  const profileClose = document.getElementById('profile-close');
  if(profileClose) profileClose.addEventListener('click', closeProfileModal);
  if(profileModal){
    profileModal.addEventListener('click', (e)=>{ if(e.target===profileModal) closeProfileModal(); });
  }

  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeOrderModal(); closeProfileModal(); } });

  const logout = document.getElementById('profile-logout');
  if(logout){
    logout.addEventListener('click', (e)=>{
      e.preventDefault();
      localStorage.removeItem('bb_user');
      localStorage.removeItem('bb_cart');
      alert('You have been logged out (demo).');
      closeProfileModal();
    });
  }
});

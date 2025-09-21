(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const utils = window.KI.utils;
    const products = window.KI.products || [];
    const container = document.getElementById('detail-card');
    if (!container) return;

    // Clear container
    utils.clearChildren(container);

    const id = utils.getQueryParam('id') || null;
    const product = products.find(p => p.id === id);
    if (!product) {
      const p = document.createElement('div');
      p.className = 'error';
      p.textContent = 'Product not found.';
      container.appendChild(p);
      return;
    }

    // Build lyaout
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '20px';
    wrapper.style.flexWrap = 'wrap';

    const left = document.createElement('div');
    left.style.flex = '1';
    left.style.minWidth = '280px';
    const img = document.createElement('img');
    img.setAttribute('src', product.img);
    img.setAttribute('alt', product.title);
    img.style.width = '100%';
    img.style.borderRadius = '8px';
    left.appendChild(img);

    const right = document.createElement('div');
    right.style.flex = '1';
    right.style.minWidth = '280px';

    const h = document.createElement('h2');
    h.textContent = product.title;
    right.appendChild(h);

    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.textContent = product.category;
    right.appendChild(badge);

    const desc = document.createElement('p');
    desc.className = 'small-muted';
    desc.textContent = product.desc;
    right.appendChild(desc);

    const price = document.createElement('p');
    price.style.marginTop = '12px';
    const strong = document.createElement('strong');
    strong.textContent = 'Base price: ' + utils.formatIDR(product.price);
    price.appendChild(strong);
    right.appendChild(price);

    const actionWrap = document.createElement('div');
    actionWrap.className = 'mt';

    const backA = document.createElement('a');
    backA.className = 'btn ghost';
    backA.setAttribute('href', 'index.html');
    backA.textContent = 'Back';

    const buyA = document.createElement('a');
    buyA.className = 'btn primary';
    buyA.setAttribute('href', 'purchase.html?id=' + encodeURIComponent(product.id));
    buyA.textContent = 'Buy Now';

    actionWrap.appendChild(backA);
    actionWrap.appendChild(buyA);

    right.appendChild(actionWrap);

    wrapper.appendChild(left);
    wrapper.appendChild(right);
    container.appendChild(wrapper);
  });
})();

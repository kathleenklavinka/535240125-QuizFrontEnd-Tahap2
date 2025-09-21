// Display specific products with prices for selected category
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const utils = window.KI.utils;
    const categories = window.KI.categories || [];
    const grid = document.getElementById('products-grid');
    const categoryInfo = document.getElementById('category-info');
    const categoryTitle = document.getElementById('category-title');

    if (!grid) return;

    // Get category ID from URL parameter
    const categoryId = utils.getQueryParam('id');
    console.log('Category ID:', categoryId);

    if (!categoryId) {
      showError('Category not specified.');
      return;
    }

    // Find category details
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
      showError('Category not found.');
      return;
    }

    // Update page title and header
    if (categoryTitle) {
      categoryTitle.textContent = category.title;
    }
    if (categoryInfo) {
      categoryInfo.innerHTML = `
        <h1>${category.title}</h1>
        <p class="small-muted">${category.desc}</p>
      `;
    }

    // Get products for this category
    const products = utils.getProductsByCategory(categoryId);
    console.log('Products for category:', products);

    if (products.length === 0) {
      showError('No products available for this category.');
      return;
    }

    // Build product card with prices
    function buildProductCard(product) {
      const card = document.createElement('div');
      card.className = 'card product';

      const img = document.createElement('img');
      img.className = 'preview-img';
      img.setAttribute('alt', product.title);
      img.setAttribute('src', product.img);
      card.appendChild(img);

      const body = document.createElement('div');
      body.className = 'body';

      const top = document.createElement('div');
      top.className = 'top';
      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = product.category;
      top.appendChild(badge);
      body.appendChild(top);

      const h3 = document.createElement('h3');
      h3.textContent = product.title;
      body.appendChild(h3);

      const desc = document.createElement('div');
      desc.className = 'small-muted';
      desc.textContent = product.desc;
      body.appendChild(desc);

      const meta = document.createElement('div');
      meta.className = 'product-meta';

      const priceDiv = document.createElement('div');
      priceDiv.className = 'product-price';
      const strong = document.createElement('strong');
      strong.textContent = utils.formatIDR(product.price);
      strong.style.color = '#2c3e50';
      strong.style.fontSize = '1.2em';
      priceDiv.appendChild(strong);

      const priceNote = document.createElement('div');
      priceNote.className = 'small-muted';
      priceNote.textContent = 'Starting from';
      priceDiv.appendChild(priceNote);

      const actions = document.createElement('div');
      actions.className = 'product-actions';

      const detailBtn = document.createElement('a');
      detailBtn.className = 'btn';
      detailBtn.setAttribute('href', 'detail.html?id=' + encodeURIComponent(product.id));
      detailBtn.textContent = 'View Details';

      const buyBtn = document.createElement('a');
      buyBtn.className = 'btn primary';
      buyBtn.setAttribute('href', 'purchase.html?id=' + encodeURIComponent(product.id));
      buyBtn.textContent = 'Get Quote';

      actions.appendChild(detailBtn);
      actions.appendChild(buyBtn);

      meta.appendChild(priceDiv);
      meta.appendChild(actions);

      body.appendChild(meta);
      card.appendChild(body);
      return card;
    }

    function renderProducts(productList) {
      utils.clearChildren(grid);
      productList.forEach(product => {
        grid.appendChild(buildProductCard(product));
      });
    }

    function showError(message) {
      utils.clearChildren(grid);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error';
      errorDiv.style.textAlign = 'center';
      errorDiv.style.padding = '40px';
      errorDiv.innerHTML = `
        <h3>Oops!</h3>
        <p>${message}</p>
        <a href="index.html" class="btn primary">Back to Home</a>
      `;
      grid.appendChild(errorDiv);
    }

    // Render all products for this category
    renderProducts(products);

    // Newsletter functionality
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const val = (emailInput.value || '').trim();
        if (!utils.validateEmail(val)) {
          alert('Please provide a valid email for newsletter.');
          return;
        }
        alert('Thanks for subscribing, ' + val);
        emailInput.value = '';
      });
    }
  });
})();
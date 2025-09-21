// Renders category cards (no prices) and handles search + newsletter
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const categories = window.KI.categories || [];
    const utils = window.KI.utils;

    const grid = document.getElementById('product-grid');
    if (!grid) return;

    // Build category card DOM using createElement (no prices shown)
    function buildCategoryCard(category) {
      const card = document.createElement('div');
      card.className = 'card category';

      const img = document.createElement('img');
      img.className = 'preview-img';
      img.setAttribute('alt', category.title);
      img.setAttribute('src', category.img);
      card.appendChild(img);

      const body = document.createElement('div');
      body.className = 'body';

      const h3 = document.createElement('h3');
      h3.textContent = category.title;
      body.appendChild(h3);

      const desc = document.createElement('div');
      desc.className = 'small-muted';
      desc.textContent = category.desc;
      body.appendChild(desc);

      const actions = document.createElement('div');
      actions.className = 'category-actions mt';

      const exploreBtn = document.createElement('a');
      exploreBtn.className = 'btn primary';
      exploreBtn.setAttribute('href', 'category.html?id=' + encodeURIComponent(category.id));
      exploreBtn.textContent = 'Explore Products';

      actions.appendChild(exploreBtn);
      body.appendChild(actions);
      card.appendChild(body);
      return card;
    }

    function renderAll(list) {
      utils.clearChildren(grid);
      list.forEach(category => {
        grid.appendChild(buildCategoryCard(category));
      });
    }

    renderAll(categories);

    // Search categories
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', function () {
        const q = (searchInput.value || '').trim().toLowerCase();
        if (!q) {
          renderAll(categories);
          return;
        }
        const filtered = categories.filter(category => {
          return category.title.toLowerCase().includes(q) ||
                 category.desc.toLowerCase().includes(q);
        });
        renderAll(filtered);
      });
    }

    // Newsletter subscribe (simple)
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

// Hero slider functionality
// For the homepage part
const slides = document.querySelectorAll('.hero-slider .slide');
const prevBtn = document.querySelector('.hero-slider .prev');
const nextBtn = document.querySelector('.hero-slider .next');
let current = 0;

function showSlide(index) {
  slides.forEach((s, i) => {
    s.classList.toggle('active', i === index);
  });
}

if (slides.length > 0) {
  showSlide(current);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      current = (current - 1 + slides.length) % slides.length;
      showSlide(current);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      current = (current + 1) % slides.length;
      showSlide(current);
    });
  }

  // Auto-slide every 5 seconds
  setInterval(() => {
    current = (current + 1) % slides.length;
    showSlide(current);
  }, 5000);
}

// Shared utilities, products, storage, navbar rendering, and validation.
(function () {
  // Storage keys
  const LS_USERS = 'ins_users_v1';
  const LS_CURRENT = 'ins_current_v1';
  const LS_PURCHASES = 'ins_purchases_v1';
  const LS_TEMP_PURCHASE = 'ins_temp_purchase';
  const LS_LAST_CHECKOUT = 'ins_last_checkout';

  // Product categories (without prices - for homepage display)
  const CATEGORIES = [
    {
      id: 'car',
      title: 'Car Insurance',
      img: '/pics/car.jpg',
      desc: 'Protect your vehicle from accidents and theft.'
    },
    {
      id: 'health',
      title: 'Health Insurance', 
      img: '/pics/health.jpg',
      desc: 'Coverage for medical expenses and emergencies.'
    },
    {
      id: 'life',
      title: 'Life Insurance',
      img: '/pics/life.jpg',
      desc: 'Secure your family\'s future with life protection.'
    }
  ];

  // Specific products with prices and individual images
  const PRODUCTS = [
    // Car Insurance Products
    {
      id: 'car1',
      categoryId: 'car',
      category: 'Car',
      title: 'Comprehensive Car Protection',
      price: 1200000,
      img: '/pics/car1.jpg',
      desc: 'Complete cover for private cars — 12 months coverage with comprehensive benefits.'
    },
    {
      id: 'car2',
      categoryId: 'car',
      category: 'Car',
      title: 'Basic Car Insurance',
      price: 800000,
      img: '/pics/car2.jpg',
      desc: 'Essential coverage for your vehicle — 12 months basic protection.'
    },
    {
      id: 'car3',
      categoryId: 'car',
      category: 'Car',
      title: 'Premium Car Coverage',
      price: 1800000,
      img: '/pics/car3.jpg',
      desc: 'Ultimate protection with extended benefits — 12 months premium coverage.'
    },

    // Health Insurance Products
    {
      id: 'health1',
      categoryId: 'health',
      category: 'Health',
      title: 'Basic Health Plan',
      price: 1500000,
      img: '/pics/health1.jpg',
      desc: 'Essential health coverage for individuals and families.'
    },
    {
      id: 'health2',
      categoryId: 'health',
      category: 'Health',
      title: 'Premium Health Plan',
      price: 2000000,
      img: '/pics/health2.jpg',
      desc: 'Comprehensive inpatient and outpatient coverage with additional benefits.'
    },
    {
      id: 'health3',
      categoryId: 'health',
      category: 'Health',
      title: 'Family Health Package',
      price: 3500000,
      img: '/pics/health3.jpg',
      desc: 'Complete family health protection with dental and optical coverage.'
    },

    // Life Insurance Products
    {
      id: 'life1',
      categoryId: 'life',
      category: 'Life',
      title: 'Basic Life Protection',
      price: 600000,
      img: '/pics/life1.jpg',
      desc: 'Essential life insurance with basic death benefit coverage.'
    },
    {
      id: 'life2',
      categoryId: 'life',
      category: 'Life',
      title: 'Life Secure Plan',
      price: 850000,
      img: '/pics/life2.jpg',
      desc: 'Comprehensive life protection with death benefit and additional riders.'
    },
    {
      id: 'life3',
      categoryId: 'life',
      category: 'Life',
      title: 'Premium Life Coverage',
      price: 1200000,
      img: '/pics/life3.jpg',
      desc: 'Ultimate life protection with investment benefits and comprehensive riders.'
    }
  ];

  // Expose to global scope for page scripts
  window.KI = window.KI || {};
  window.KI.constants = {
    LS_USERS, LS_CURRENT, LS_PURCHASES, LS_TEMP_PURCHASE, LS_LAST_CHECKOUT
  };
  window.KI.categories = CATEGORIES; // For homepage
  window.KI.products = PRODUCTS; // For detail pages

  // Storage helpers 
  function loadJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveJSON(key, obj) {
    try {
      localStorage.setItem(key, JSON.stringify(obj));
    } catch (e) {
      console.error('saveJSON error', e);
    }
  }

  function loadUsers() {
    return loadJSON(LS_USERS) || [];
  }
  function saveUsers(users) {
    saveJSON(LS_USERS, users);
  }
  function getCurrent() {
    return loadJSON(LS_CURRENT);
  }
  function setCurrent(userObj) {
    saveJSON(LS_CURRENT, userObj);
  }
  function clearCurrent() {
    localStorage.removeItem(LS_CURRENT);
  }
  function loadPurchases() {
    return loadJSON(LS_PURCHASES) || [];
  }
  function savePurchases(arr) {
    saveJSON(LS_PURCHASES, arr);
  }
  function saveTempPurchase(obj) {
    saveJSON(LS_TEMP_PURCHASE, obj);
  }
  function loadTempPurchase() {
    return loadJSON(LS_TEMP_PURCHASE);
  }
  function removeTempPurchase() {
    localStorage.removeItem(LS_TEMP_PURCHASE);
  }

  // Format helpers 
  function formatIDR(number) {
    const n = Number(number) || 0;
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  function getQueryParam(name) {
    try {
      const u = new URL(window.location.href);
      return u.searchParams.get(name);
    } catch (e) {
      return null;
    }
  }

  // Navigation helper - determines the back URL based on current page
  function getBackUrl() {
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];
    
    switch (currentPage) {
      case 'category':
        return 'index.html';
      case 'detail':
        // Check if we came from a category page
        const productId = getQueryParam('id');
        if (productId) {
          const product = PRODUCTS.find(p => p.id === productId);
          if (product) {
            return `category.html?id=${product.categoryId}`;
          }
        }
        return 'index.html';
      case 'purchase':
        // Go back to product detail
        const purchaseProductId = getQueryParam('id');
        if (purchaseProductId) {
          return `detail.html?id=${purchaseProductId}`;
        }
        return 'index.html';
      case 'checkout':
        return 'index.html';
      case 'history':
        return 'index.html';
      case 'login':
        return 'index.html';
      case 'signup':
        return 'login.html';
      default:
        return 'index.html';
    }
  }

  // Validation rules
  function validateName(name) {
    if (typeof name !== 'string') return false;
    const t = name.trim();
    if (t.length < 3 || t.length > 32) return false;
    if (/\d/.test(t)) return false;
    return true;
  }
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }
  function validatePassword(p) {
    return typeof p === 'string' && p.length >= 8;
  }
  function validatePhone(phone) {
    if (!/^\d+$/.test(String(phone || ''))) return false;
    if (!String(phone).startsWith('08')) return false;
    if (String(phone).length < 10 || String(phone).length > 16) return false;
    return true;
  }

  // Navbar rendering 
  function clearChildren(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function createButton(text, className) {
    const btn = document.createElement('button');
    btn.type = 'button';
    if (className) btn.className = className;
    btn.textContent = text;
    return btn;
  }

  function renderTopbarAndNav() {
    // places: #nav-auth and multiple #topbar-right* placeholders
    const cur = getCurrent();

    // Add back button to navbar if not on home page
    const navBackPlace = document.getElementById('nav-back');
    if (navBackPlace) {
      clearChildren(navBackPlace);
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage !== 'index.html' && currentPage !== '') {
        const backUrl = getBackUrl();
        const backLink = document.createElement('a');
        backLink.href = backUrl;
        backLink.className = 'nav-link back-btn';
        backLink.innerHTML = '← Back';
        navBackPlace.appendChild(backLink);
      }
    }

    const navAuthPlace = document.getElementById('nav-auth');
    if (navAuthPlace) {
      clearChildren(navAuthPlace);
      if (cur) {
        const span = document.createElement('span');
        span.className = 'nav-link';
        span.textContent = `Hi, ${cur.name}`;
        navAuthPlace.appendChild(span);

        const btn = createButton('Logout', 'btn ghost');
        btn.addEventListener('click', function () {
          clearCurrent();
          window.location.href = 'index.html';
        });
        navAuthPlace.appendChild(btn);
      } else {
        const a = document.createElement('a');
        a.href = 'login.html';
        a.className = 'btn ghost';
        a.textContent = 'Login';
        navAuthPlace.appendChild(a);
      }
    }

    // also set small topbar placeholders if exist
    const topbarIds = [
      'topbar-right','topbar-right-login','topbar-right-signup',
      'topbar-right-detail','topbar-right-purchase','topbar-right-checkout','topbar-right-history'
    ];
    topbarIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      clearChildren(el);
      if (cur) {
        const s = document.createElement('span');
        s.className = 'small';
        s.textContent = `Signed in: ${cur.name}`;
        el.appendChild(s);

        const btnOut = createButton('Logout', 'btn ghost');
        btnOut.addEventListener('click', function () {
          clearCurrent();
          window.location.href = 'index.html';
        });
        el.appendChild(btnOut);
      } else {
        const a = document.createElement('a');
        a.href = 'login.html';
        a.className = 'btn ghost';
        a.textContent = 'Sign In';
        el.appendChild(a);
      }
    });
  }

  // Auth helpers (signup/login) 
  function signupUser(payload) {
    const users = loadUsers();
    const exists = users.some(u => u.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) return { ok: false, reason: 'Email already registered.' };
    const newUser = {
      id: 'u' + Date.now(),
      name: payload.name.trim(),
      email: payload.email.toLowerCase().trim(),
      phone: payload.phone.trim(),
      pass: payload.password
    };
    users.push(newUser);
    saveUsers(users);
    setCurrent({ id: newUser.id, name: newUser.name, email: newUser.email });
    return { ok: true, user: newUser };
  }

  function loginUser(email, password) {
    const users = loadUsers();
    const u = users.find(x => x.email.toLowerCase() === String(email).toLowerCase() && x.pass === password);
    if (!u) return { ok: false, reason: 'Invalid email or password.' };
    setCurrent({ id: u.id, name: u.name, email: u.email });
    return { ok: true, user: u };
  }

  // Helper function to get products by category
  function getProductsByCategory(categoryId) {
    return PRODUCTS.filter(product => product.categoryId === categoryId);
  }

  // Expose utilities
  window.KI.utils = {
    loadUsers, saveUsers, getCurrent, setCurrent, clearCurrent,
    loadPurchases, savePurchases, saveTempPurchase, loadTempPurchase, removeTempPurchase,
    formatIDR, getQueryParam, getBackUrl, validateName, validateEmail, validatePassword, validatePhone,
    renderTopbarAndNav, clearChildren, createButton, loadJSON, saveJSON, getProductsByCategory
  };

  // Auto-run: render navbar when DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    try { renderTopbarAndNav(); } catch (e) { /* ignore */ }
  });

})();
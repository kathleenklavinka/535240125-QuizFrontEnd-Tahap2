(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const utils = window.KI.utils;
    const cur = utils.getCurrent();
    const listEl = document.getElementById('history-list');

    if (!listEl) return;

    if (!cur) {
      utils.clearChildren(listEl);
      const p = document.createElement('div');
      p.className = 'note';
      p.textContent = 'Please login to view your purchase history.';
      listEl.appendChild(p);
      return;
    }

    const purchases = utils.loadPurchases()
      .filter(p => p.userId === cur.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    utils.clearChildren(listEl);
    if (purchases.length === 0) {
      const p = document.createElement('div');
      p.className = 'note';
      p.textContent = 'No purchases yet.';
      listEl.appendChild(p);
      return;
    }

    purchases.forEach(p => {
      const premi = p.data?.premi || p.premi || 0;

      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '12px';

      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.justifyContent = 'space-between';
      wrap.style.alignItems = 'center';

      // LEFT SIDE
      const left = document.createElement('div');

      // Product name
      const h = document.createElement('h4');
      h.textContent = p.productTitle;
      left.appendChild(h);

      // Product type
      const type = document.createElement('div');
      type.className = 'small';
      type.textContent = 'Type: ' + (p.productType || '-');
      left.appendChild(type);

      // Purchase date
      const time = document.createElement('div');
      time.className = 'small-muted';
      time.textContent = new Date(p.createdAt).toLocaleString('id-ID');
      left.appendChild(time);

      // Payment status (Paid / Unpaid)
      const stat = document.createElement('div');
      stat.className = 'small';
      const isPaid = !!p.paidAt;
      stat.textContent = 'Status: ' + (isPaid ? 'Paid' : 'Unpaid');
      if (isPaid) {
        stat.textContent += ' — Paid: ' + new Date(p.paidAt).toLocaleString('id-ID');
      }
      left.appendChild(stat);

      // RIGHT SIDE
      const right = document.createElement('div');
      right.style.textAlign = 'right';

      // Price
      const price = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = utils.formatIDR(premi);
      price.appendChild(strong);
      right.appendChild(price);

      // View button
      const btnWrap = document.createElement('div');
      btnWrap.style.marginTop = '10px';
      const btnView = document.createElement('button');
      btnView.className = 'btn ghost';
      btnView.type = 'button';
      btnView.textContent = 'View';
      btnView.addEventListener('click', function () {
        let details =
          `Order ID: ${p.id}` +
          `\nProduct: ${p.productTitle}` +
          `\nType: ${p.productType || '-'}` +
          `\nPremium: ${utils.formatIDR(premi)}` +
          `\nStatus: ${isPaid ? 'Paid' : 'Unpaid'}` +
          `\nCreated: ${new Date(p.createdAt).toLocaleString('id-ID')}`;
        if (isPaid) {
          details += `\nPaid at: ${new Date(p.paidAt).toLocaleString('id-ID')}`;
          details += `\nPayment method: ${p.paymentMethod || '-'}`;
        }
        alert(details);
      });
      btnWrap.appendChild(btnView);
      right.appendChild(btnWrap);

      wrap.appendChild(left);
      wrap.appendChild(right);
      card.appendChild(wrap);
      listEl.appendChild(card);
    });
  });
})();

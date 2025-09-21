(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const utils = window.KI.utils;
    const checkoutInfo = document.getElementById('checkout-info');
    const checkoutMsg = document.getElementById('checkout-msg');

    function showMessage(container, text, type) {
      if (!container) return;
      utils.clearChildren(container);
      const d = document.createElement('div');
      d.className = type === 'error' ? 'error' : (type === 'success' ? 'success' : 'note');
      d.textContent = text;
      container.appendChild(d);
    }

    if (!checkoutInfo) return;

    // Find order data from LocalStorage (JSON)
    const lastOrderJson = window.localStorage.getItem(window.KI.constants.LS_LAST_CHECKOUT);
    if (!lastOrderJson) {
      showMessage(checkoutInfo, 'No recent transaction to checkout.', 'error');
      return;
    }

    let lastOrder;
    try {
      lastOrder = JSON.parse(lastOrderJson);
    } catch (e) {
      showMessage(checkoutInfo, 'Invalid order data.', 'error');
      return;
    }

    // Find order from purchases (fallback if needed)
    const purchases = utils.loadPurchases();
    const order = purchases.find(x => x.id === lastOrder.id) || lastOrder;

    if (!order) {
      showMessage(checkoutInfo, 'Order not found.', 'error');
      return;
    }

    // Render info
    utils.clearChildren(checkoutInfo);

    const prodNode = document.createElement('p');
    const strongProd = document.createElement('strong');
    strongProd.textContent = 'Product: ';
    prodNode.appendChild(strongProd);
    const prodText = document.createElement('span');
    prodText.textContent = order.productTitle;
    prodNode.appendChild(prodText);

    const premiNode = document.createElement('p');
    const strongPrice = document.createElement('strong');
    strongPrice.textContent = 'Estimated premium: ';
    premiNode.appendChild(strongPrice);
    premiNode.appendChild(document.createTextNode(utils.formatIDR(order.data?.premi || order.premi)));

    const nameNode = document.createElement('p');
    nameNode.textContent = 'Insured: ' + (order.data?.namaPemilik || order.insuredName || '-');

    const dateNode = document.createElement('p');
    dateNode.textContent = 'Created: ' + new Date(order.createdAt).toLocaleString('id-ID');

    checkoutInfo.appendChild(prodNode);
    checkoutInfo.appendChild(premiNode);
    checkoutInfo.appendChild(nameNode);
    checkoutInfo.appendChild(dateNode);

    // Payment
    const btnPay = document.getElementById('btn-pay');
    const payMethod = document.getElementById('pay-method');

    if (btnPay) {
      btnPay.addEventListener('click', function () {
        const purchasesAll = utils.loadPurchases();
        const idx = purchasesAll.findIndex(x => x.id === order.id);
        if (idx === -1) {
          showMessage(checkoutMsg, 'Order no longer exists.', 'error');
          return;
        }
        purchasesAll[idx].status = 'paid';
        purchasesAll[idx].paidAt = new Date().toISOString();
        purchasesAll[idx].paymentMethod = (payMethod && payMethod.value) ? payMethod.value : 'unknown';
        utils.savePurchases(purchasesAll);

        // cleanup
        utils.removeTempPurchase();
        localStorage.removeItem(window.KI.constants.LS_LAST_CHECKOUT);

        showMessage(checkoutMsg, 'Payment successful. Thank you!', 'success');
        setTimeout(function () {
          window.location.href = 'history.html';
        }, 900);
      });
    }
  });
})();

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const utils = window.KI.utils;
    const msgHolder = document.getElementById('login-msg');

    function showMessage(container, text, type) {
      // so it will show 'error' or 'success' or 'note'
      if (!container) return;
      utils.clearChildren(container);
      const div = document.createElement('div');
      if (type === 'error') div.className = 'error';
      else if (type === 'success') div.className = 'success';
      else div.className = 'note';
      div.textContent = text;
      container.appendChild(div);
    }

    const btn = document.getElementById('btn-login');
    if (!btn) return;

    btn.addEventListener('click', function () {
      const email = document.getElementById('login-email')?.value || '';
      const pass = document.getElementById('login-pass')?.value || '';
      if (!utils.validateEmail(email)) {
        showMessage(msgHolder, 'Invalid email format.', 'error');
        return;
      }
      if (!utils.validatePassword(pass)) {
        showMessage(msgHolder, 'Password must be at least 8 characters.', 'error');
        return;
      }

      const res = window.KI.utils.loadUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.pass === pass);
      if (!res) {
        showMessage(msgHolder, 'Email or password is incorrect.', 'error');
        return;
      }
      // set current
      window.KI.utils.setCurrent({ id: res.id, name: res.name, email: res.email });
      showMessage(msgHolder, 'Login successful. Redirecting...', 'success');
      setTimeout(function () {
        window.location.href = 'index.html';
      }, 700);
    });
  });
})();

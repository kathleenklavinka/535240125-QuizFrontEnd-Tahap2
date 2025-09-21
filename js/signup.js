
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const utils = window.KI.utils;
    const msgHolder = document.getElementById('signup-msg');

    function showMessage(container, text, type) {
      if (!container) return;
      utils.clearChildren(container);
      const div = document.createElement('div');
      div.className = type === 'error' ? 'error' : (type === 'success' ? 'success' : 'note');
      div.textContent = text;
      container.appendChild(div);
    }

    const btn = document.getElementById('btn-signup');
    if (!btn) return;

    btn.addEventListener('click', function () {
      const name = document.getElementById('su-name')?.value || '';
      const email = document.getElementById('su-email')?.value || '';
      const phone = document.getElementById('su-phone')?.value || '';
      const pass = document.getElementById('su-pass')?.value || '';
      const pass2 = document.getElementById('su-pass2')?.value || '';

      if (!utils.validateName(name)) {
        showMessage(msgHolder, 'Name must be 3-32 characters and must not contain numbers.', 'error');
        return;
      }
      if (!utils.validateEmail(email)) {
        showMessage(msgHolder, 'Email format is invalid.', 'error');
        return;
      }
      if (!utils.validatePhone(phone)) {
        showMessage(msgHolder, 'Phone must start with 08 and be 10-16 digits.', 'error');
        return;
      }
      if (!utils.validatePassword(pass)) {
        showMessage(msgHolder, 'Password must be at least 8 characters.', 'error');
        return;
      }
      if (pass !== pass2) {
        showMessage(msgHolder, 'Password confirmation does not match.', 'error');
        return;
      }

      // Check email uniqueness
      // Email duplicates are not allowed!
      const existing = window.KI.utils.loadUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        showMessage(msgHolder, 'Email already registered.', 'error');
        return;
      }

      // create user
      const users = window.KI.utils.loadUsers();
      const newUser = {
        id: 'u' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        pass: pass
      };
      users.push(newUser);
      window.KI.utils.saveUsers(users);
      window.KI.utils.setCurrent({ id: newUser.id, name: newUser.name, email: newUser.email });
      showMessage(msgHolder, 'Account created. Redirecting...', 'success');
      setTimeout(function () {
        window.location.href = 'index.html';
      }, 800);
    });
  });
})();

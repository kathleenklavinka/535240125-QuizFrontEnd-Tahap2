// Flow: You can only checkout after you press the calculate button.
// So the system will calculate first based on the formula on the PDF.
// Note, you can't press the buy button without calculating the price first!
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const utils = window.KI.utils;
    const products = window.KI.products || [];
    const formHolder = document.getElementById('form-purchase');
    const msgHolder = document.getElementById('purchase-msg');

    const currentUser = utils.getCurrent();
    if (!currentUser) {
      if (formHolder) {
        utils.clearChildren(formHolder);
        const loginRequired = document.createElement('div');
        loginRequired.className = 'error';
        loginRequired.innerHTML = `
          <h3>Login Required</h3>
          <p>You must be logged in to purchase insurance products.</p>
          <p><a href="login.html" style="color: red; text-decoration: underline;">Click here to login</a></p>
        `;
        formHolder.appendChild(loginRequired);
      }
      return;
    }

    function showMessage(container, text, type) {
      if (!container) return;
      utils.clearChildren(container);
      const d = document.createElement('div');
      d.className = type === 'error' ? 'error' : (type === 'success' ? 'success' : 'note');
      d.textContent = text;
      container.appendChild(d);
    }

    function createInput(id, labelText, placeholder, type = 'text') {
      const label = document.createElement('label');
      label.className = 'mt';
      label.setAttribute('for', id);
      label.textContent = labelText;
      const inp = document.createElement('input');
      inp.id = id;
      inp.className = 'input';
      inp.type = type;
      if (placeholder) inp.placeholder = placeholder;
      formHolder.appendChild(label);
      formHolder.appendChild(inp);
      return inp;
    }

    // get product by ?id=...
    const id = utils.getQueryParam('id') || null;
    const product = products.find(p => p.id === id);
    if (!product) {
      showMessage(formHolder, 'Product not found.', 'error');
      return;
    }

    // title & description
    const title = document.createElement('h3');
    title.textContent = product.title;
    formHolder.appendChild(title);
    const desc = document.createElement('p');
    desc.className = 'small-muted';
    desc.textContent = product.desc || '';
    formHolder.appendChild(desc);

    const resWrap = document.createElement('div');
    resWrap.id = 'pu-result';
    formHolder.appendChild(resWrap);

    if (product.category && product.category.toLowerCase() === 'car') {
      /* CAR INSURANCE FORM */
      const merk = createInput('pu-merk', 'Car Brand', 'Example: Toyota');
      const jenis = createInput('pu-jenis', 'Car Model', 'Example: Avanza');
      const tahun = createInput('pu-tahun', 'Manufacture Year', 'Example: 2019', 'number');
      const harga = createInput('pu-harga', 'Car Price (IDR)', 'Example: 150000000', 'number');
      const plat = createInput('pu-plat', 'License Plate Number', 'Example: B 1234 CD');
      const mesin = createInput('pu-mesin', 'Engine Number', '');
      const rangka = createInput('pu-rangka', 'Chassis Number', '');
      const owner = createInput('pu-owner', 'Owner Name', '');

      const photosLabel = document.createElement('label');
      photosLabel.className = 'mt';
      photosLabel.textContent = 'Upload Photos (Front, Back, Left, Right, Dashboard, Engine)';
      formHolder.appendChild(photosLabel);
      const photoInputs = {};
      ['front', 'back', 'left', 'right', 'dashboard', 'engine'].forEach(k => {
        const pLabel = document.createElement('label');
        pLabel.className = 'mt small-muted';
        pLabel.textContent = k.charAt(0).toUpperCase() + k.slice(1);
        const pInp = document.createElement('input');
        pInp.type = 'file';
        pInp.accept = 'image/*';
        pInp.id = 'pu-photo-' + k;
        pInp.className = 'input';
        formHolder.appendChild(pLabel);
        formHolder.appendChild(pInp);
        photoInputs[k] = pInp;
      });

      function validateCarForm() {
        const errors = [];
        if (!merk.value) errors.push('Car brand is required.');
        if (!jenis.value) errors.push('Car model is required.');
        if (!tahun.value) errors.push('Manufacture year is required.');
        if (!harga.value) errors.push('Car price is required.');
        if (!plat.value) errors.push('License plate is required.');
        if (!mesin.value) errors.push('Engine number is required.');
        if (!rangka.value) errors.push('Chassis number is required.');
        if (!owner.value) errors.push('Owner name is required.');
        Object.keys(photoInputs).forEach(k => {
          if (!photoInputs[k].files || photoInputs[k].files.length === 0) {
            errors.push(`Photo ${k} is required.`);
          }
        });
        return errors;
      }

      function calcPremium(price, tahunPembuatan) {
        const curYear = new Date().getFullYear();
        const umur = curYear - Number(tahunPembuatan);
        const x = Number(price);
        let premi = 0;
        
        if (umur >= 0 && umur <= 3) {
          premi = 0.025 * x;
        } else if (umur > 3 && umur <= 5) {
          premi = x < 200_000_000 ? 0.04 * x : 0.03 * x;
        } else if (umur > 5) {
          premi = 0.05 * x;
        } else {
          premi = 0.03 * x;
        }
        return { premi, umur };
      }

      const btnCalc = document.getElementById('btn-calc');
      if (btnCalc) {
        btnCalc.addEventListener('click', function (ev) {
          ev.preventDefault();
          utils.clearChildren(resWrap);
          const errs = validateCarForm();
          if (errs.length) {
            showMessage(resWrap, errs.join(' '), 'error');
            return;
          }
          const priceVal = Number(harga.value);
          const tahunVal = Number(tahun.value);
          const { premi, umur } = calcPremium(priceVal, tahunVal);
          resWrap.innerHTML = `
            <p><strong>Premium Calculation Result</strong></p>
            <p>Car Age: ${umur} years</p>
            <p>Annual Premium: ${utils.formatIDR(Math.round(premi))}</p>
          `;
          window.KI.utils.saveTempPurchase({
            id: 'tmp' + Date.now(),
            productId: product.id,
            productTitle: product.title,
            productType: product.category,
            priceBase: priceVal,
            merk: merk.value,
            jenis: jenis.value,
            tahun: tahunVal,
            plat: plat.value,
            mesin: mesin.value,
            rangka: rangka.value,
            owner: owner.value,
            photos: Object.keys(photoInputs).reduce((acc, k) => {
              acc[k] = photoInputs[k].files[0]?.name || null;
              return acc;
            }, {}),
            premi: Math.round(premi)
          });
          showMessage(resWrap, 'Calculation complete. Press "Buy & Checkout" to continue.', 'success');
        });
      }

    } else if (product.category && product.category.toLowerCase() === 'health') {
      /* HEALTH INSURANCE FORM  */
      const fullName = createInput('pu-fullname', 'Full Name (as per ID card)');
      const birthDate = createInput('pu-birthdate', 'Date of Birth', '', 'date');
      const job = createInput('pu-job', 'Occupation');
      
      // Yes/No questions
      const smokeLabel = document.createElement('label');
      smokeLabel.className = 'mt';
      smokeLabel.textContent = 'Do you smoke?';
      const smokeSel = document.createElement('select');
      smokeSel.className = 'input';
      smokeSel.id = 'pu-smoke';
      ['No', 'Yes'].forEach(optVal => {
        const opt = document.createElement('option');
        opt.value = optVal;
        opt.textContent = optVal;
        smokeSel.appendChild(opt);
      });
      formHolder.appendChild(smokeLabel);
      formHolder.appendChild(smokeSel);

      const hyperLabel = document.createElement('label');
      hyperLabel.className = 'mt';
      hyperLabel.textContent = 'Do you have hypertension history?';
      const hyperSel = document.createElement('select');
      hyperSel.className = 'input';
      hyperSel.id = 'pu-hyper';
      ['No', 'Yes'].forEach(optVal => {
        const opt = document.createElement('option');
        opt.value = optVal;
        opt.textContent = optVal;
        hyperSel.appendChild(opt);
      });
      formHolder.appendChild(hyperLabel);
      formHolder.appendChild(hyperSel);

      const diabLabel = document.createElement('label');
      diabLabel.className = 'mt';
      diabLabel.textContent = 'Do you have diabetes history?';
      const diabSel = document.createElement('select');
      diabSel.className = 'input';
      diabSel.id = 'pu-diab';
      ['No', 'Yes'].forEach(optVal => {
        const opt = document.createElement('option');
        opt.value = optVal;
        opt.textContent = optVal;
        diabSel.appendChild(opt);
      });
      formHolder.appendChild(diabLabel);
      formHolder.appendChild(diabSel);

      // Health Insurance Premium Calculation
      function calcHealthPremium(age, k1, k2, k3) {
        const P = 2_000_000; // base premium per year
        let m = 0;
        if (age <= 20) m = 0.1;
        else if (age <= 35) m = 0.2;
        else if (age <= 50) m = 0.25;
        else m = 0.4;

        // Formula from the PDF: k3 * 0.5 * P (not k3 + 0.5 * P)
        return P + (m * P) + (k1 * 0.5 * P) + (k2 * 0.4 * P) + (k3 * 0.5 * P);
      }

      const btnCalc = document.getElementById('btn-calc');
      if (btnCalc) {
        btnCalc.addEventListener('click', function (ev) {
          ev.preventDefault();
          utils.clearChildren(resWrap);

          if (!fullName.value || !birthDate.value || !job.value) {
            showMessage(resWrap, 'All fields are required.', 'error');
            return;
          }

          // Calculate age from birthdate
          const dob = new Date(birthDate.value);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const mDiff = today.getMonth() - dob.getMonth();
          if (mDiff < 0 || (mDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }

          // Convert Yes/No to 1/0
          const k1 = smokeSel.value === 'Yes' ? 1 : 0;
          const k2 = hyperSel.value === 'Yes' ? 1 : 0;
          const k3 = diabSel.value === 'Yes' ? 1 : 0;

          // Calculate premium
          const premi = calcHealthPremium(age, k1, k2, k3);

          // Show result
          resWrap.innerHTML = `
            <p><strong>Premium Calculation Result</strong></p>
            <p>Age: ${age} years</p>
            <p>Annual Premium: ${utils.formatIDR(Math.round(premi))}</p>
          `;

          window.KI.utils.saveTempPurchase({
            id: 'tmp' + Date.now(),
            productId: product.id,
            productTitle: product.title,
            productType: product.category,
            fullname: fullName.value,
            birthDate: birthDate.value,
            job: job.value,
            smoke: smokeSel.value,
            hypertension: hyperSel.value,
            diabetes: diabSel.value,
            age: age,
            premi: Math.round(premi)
          });
          
          showMessage(resWrap, 'Calculation complete. Press "Buy & Checkout" to continue.', 'success');
        });
      }

    } else if (product.category && product.category.toLowerCase() === 'life') {
      /* LIFE INSURANCE FORM */
      const nama = createInput('pu-nama', 'Full Name (as per ID card)');
      const birthDate = createInput('pu-birthdate', 'Date of Birth', '', 'date');

      // Use predefined coverage amounts as required
      const coverageLabel = document.createElement('label');
      coverageLabel.className = 'mt';
      coverageLabel.textContent = 'Coverage Amount';
      const coverageSel = document.createElement('select');
      coverageSel.className = 'input';
      coverageSel.id = 'pu-coverage';
      
      const coverageAmounts = [
        { value: 1000000000, text: 'Rp 1.000.000.000' },
        { value: 2000000000, text: 'Rp 2.000.000.000' },
        { value: 3500000000, text: 'Rp 3.500.000.000' },
        { value: 5000000000, text: 'Rp 5.000.000.000' },
        { value: 10000000000, text: 'Rp 10.000.000.000' }
      ];
      
      coverageAmounts.forEach(amount => {
        const opt = document.createElement('option');
        opt.value = amount.value;
        opt.textContent = amount.text;
        coverageSel.appendChild(opt);
      });
      
      formHolder.appendChild(coverageLabel);
      formHolder.appendChild(coverageSel);

      // Life Insurance Premium Calculation
      function calcLifePremium(age, sumInsured) {
        let tariffRate = 0;
        
        if (age <= 30) {
          tariffRate = 0.002; // 0.2%
        } else if (age > 30 && age <= 50) {
          tariffRate = 0.004; // 0.4%
        } else { // age > 50
          tariffRate = 0.01;  // 1%
        }
        
        // Monthly premium = tariff rate x sum 
        return tariffRate * sumInsured;
      }

      const btnCalc = document.getElementById('btn-calc');
      if (btnCalc) {
        btnCalc.addEventListener('click', function (ev) {
          ev.preventDefault();
          utils.clearChildren(resWrap);

          if (!nama.value || !birthDate.value || !coverageSel.value) {
            showMessage(resWrap, 'All fields are required (Name, Date of Birth, Coverage Amount).', 'error');
            return;
          }

          // Calculate age from birthdate
          const dob = new Date(birthDate.value);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const mDiff = today.getMonth() - dob.getMonth();
          if (mDiff < 0 || (mDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }

          const sumInsured = Number(coverageSel.value);
          const monthlyPremium = calcLifePremium(age, sumInsured);
          
          resWrap.innerHTML = `
            <p><strong>Premium Calculation Result</strong></p>
            <p>Age: ${age} years</p>
            <p>Sum Insured: ${utils.formatIDR(sumInsured)}</p>
            <p><strong>Monthly Premium: ${utils.formatIDR(Math.round(monthlyPremium))}</strong></p>
          `;

          window.KI.utils.saveTempPurchase({
            id: 'tmp' + Date.now(),
            productId: product.id,
            productTitle: product.title,
            productType: product.category,
            nama: nama.value,
            birthDate: birthDate.value,
            age: age,
            sumInsured: sumInsured,
            premi: Math.round(monthlyPremium) // Monthly premium, not YEARLY
          });
          
          showMessage(resWrap, 'Calculation complete. Press "Buy & Checkout" to continue.', 'success');
        });
      }

    } else {
      // Default form for other products
      const nameLabel = document.createElement('label');
      nameLabel.className = 'mt';
      nameLabel.textContent = 'Policy Holder Name';
      const nameInp = document.createElement('input');
      nameInp.id = 'pu-name';
      nameInp.className = 'input';
      formHolder.appendChild(nameLabel);
      formHolder.appendChild(nameInp);

      const btnCalc = document.getElementById('btn-calc');
      if (btnCalc) {
        btnCalc.addEventListener('click', function (ev) {
          ev.preventDefault();
          if (!nameInp.value) {
            showMessage(resWrap, 'Policy holder name is required.', 'error');
            return;
          }
          resWrap.innerHTML = '<p>Premium is calculated manually.</p>';
          
          window.KI.utils.saveTempPurchase({
            id: 'tmp' + Date.now(),
            productId: product.id,
            productTitle: product.title,
            productType: product.category || 'Other',
            holderName: nameInp.value,
            premi: product.price || 1000000
          });
          
          showMessage(resWrap, 'Calculation complete. Press "Buy & Checkout" to continue.', 'success');
        });
      }
    }

    /* Buy Button - VALIDATION FOR ALL CATEGORIES */
    const btnBuy = document.getElementById('btn-buy');
    if (btnBuy) {
      btnBuy.addEventListener('click', function (ev) {
        ev.preventDefault();
        
        const tmp = window.KI.utils.loadTempPurchase();
        if (!tmp) {
          showMessage(msgHolder, 'Please calculate the premium first before purchasing.', 'error');
          return;
        }
        
        // Validation based on category
        let validationErrors = [];
        
        if (product.category && product.category.toLowerCase() === 'car') {
          const merk = document.getElementById('pu-merk');
          const jenis = document.getElementById('pu-jenis');
          const tahun = document.getElementById('pu-tahun');
          const harga = document.getElementById('pu-harga');
          const plat = document.getElementById('pu-plat');
          const mesin = document.getElementById('pu-mesin');
          const rangka = document.getElementById('pu-rangka');
          const owner = document.getElementById('pu-owner');
          
          if (!merk?.value) validationErrors.push('Car brand is required.');
          if (!jenis?.value) validationErrors.push('Car model is required.');
          if (!tahun?.value) validationErrors.push('Manufacture year is required.');
          if (!harga?.value) validationErrors.push('Car price is required.');
          if (!plat?.value) validationErrors.push('License plate is required.');
          if (!mesin?.value) validationErrors.push('Engine number is required.');
          if (!rangka?.value) validationErrors.push('Chassis number is required.');
          if (!owner?.value) validationErrors.push('Owner name is required.');
          
          const photoTypes = ['front', 'back', 'left', 'right', 'dashboard', 'engine'];
          photoTypes.forEach(type => {
            const photoInput = document.getElementById(`pu-photo-${type}`);
            if (!photoInput?.files || photoInput.files.length === 0) {
              validationErrors.push(`Photo ${type} is required.`);
            }
          });
          
        } else if (product.category && product.category.toLowerCase() === 'health') {
          const fullName = document.getElementById('pu-fullname');
          const birthDate = document.getElementById('pu-birthdate');
          const job = document.getElementById('pu-job');
          
          if (!fullName?.value) validationErrors.push('Full name is required.');
          if (!birthDate?.value) validationErrors.push('Date of birth is required.');
          if (!job?.value) validationErrors.push('Occupation is required.');
          
        } else if (product.category && product.category.toLowerCase() === 'life') {
          const nama = document.getElementById('pu-nama');
          const birthDate = document.getElementById('pu-birthdate');
          const coverage = document.getElementById('pu-coverage');
          
          if (!nama?.value) validationErrors.push('Full name is required.');
          if (!birthDate?.value) validationErrors.push('Date of birth is required.');
          if (!coverage?.value) validationErrors.push('Coverage amount is required.');
          
        } else {
          const nameInp = document.getElementById('pu-name');
          if (!nameInp?.value) validationErrors.push('Policy holder name is required.');
        }
        
        if (validationErrors.length > 0) {
          showMessage(msgHolder, 'Please complete all required fields: ' + validationErrors.join(' '), 'error');
          return;
        }
        
        const cur = window.KI.utils.getCurrent();
        
        if (!cur) {
          showMessage(msgHolder, 'Session expired. Please login to continue.', 'error');
          setTimeout(() => window.location.href = 'login.html', 2000);
          return;
        }
        
        showMessage(msgHolder, 'All data validated successfully! Processing purchase...', 'success');
        processPurchase(cur);
      });
    }

    function processPurchase(user) {
      const tmp = window.KI.utils.loadTempPurchase();
      
      if (!tmp) {
        showMessage(msgHolder, 'Please calculate the premium before purchasing.', 'error');
        return;
      }
      
      const purchases = window.KI.utils.loadPurchases();
      const order = {
        id: 'ord' + Date.now(),
        userId: user.id,
        productId: tmp.productId,
        productTitle: tmp.productTitle,
        productType: tmp.productType || product.category,
        data: tmp,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      purchases.push(order);
      window.KI.utils.savePurchases(purchases);

      window.localStorage.setItem(
        window.KI.constants.LS_LAST_CHECKOUT,
        JSON.stringify(order)
      );

      showMessage(msgHolder, 'Order created successfully! Redirecting to checkout...', 'success');
      
      setTimeout(function() {
        window.location.href = 'checkout.html';
      }, 1500);
    }

  });
})();

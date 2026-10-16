/* TEAMART LIMITED — shared script */
const SITE = {
  email: 'teamartke@gmail.com',
  whatsapp: '249900904853',
  whatsappLabel: '+249 900 904 853',
  phones: ['0725 255 463', '0768 115 976'],
  address: 'P.O. Box 86168 - 80100, Mombasa, Kenya',
  // Optional: paste a Formspree (or similar) endpoint to receive enquiries by email
  // without the visitor's mail app opening, e.g. 'https://formspree.io/f/xxxxxxx'
  formEndpoint: ''
};

const page = location.pathname.split('/').pop() || 'index.html';
const links = [['index.html', 'Home'], ['about.html', 'About'], ['products.html', 'Products'], ['contact.html', 'Contact']];

document.querySelector('#site-header').outerHTML = `
<header class="site"><div class="wrap">
  <a href="index.html" aria-label="TEAMART LIMITED home"><img src="assets/logo.png" alt="TEAMART LIMITED, passion for tea"></a>
  <button class="menu" aria-expanded="false" aria-controls="nav">Menu</button>
  <nav id="nav" aria-label="Main">
    ${links.map(([h, t]) => `<a href="${h}"${h === page ? ' aria-current="page"' : ''}>${t}</a>`).join('')}
    <a class="btn" href="contact.html#enquiry">Make an enquiry</a>
  </nav>
</div></header>`;

document.querySelector('#site-footer').outerHTML = `
<footer class="site"><div class="wrap">
  <div class="grid">
    <div><img src="assets/logo.png" alt="TEAMART LIMITED">
      <p>Licensed Kenyan tea buyer and exporter. Black CTC and Orthodox teas, FOB Mombasa.</p></div>
    <div><h3>Pages</h3>${links.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>
    <div><h3>Reach us</h3>
      <a href="mailto:${SITE.email}">${SITE.email}</a>
      <a href="https://wa.me/${SITE.whatsapp}">WhatsApp ${SITE.whatsappLabel}</a>
      ${SITE.phones.map(p => `<a href="tel:${p.replace(/\s/g, '')}">${p}</a>`).join('')}
      <span>${SITE.address}</span></div>
  </div>
  <p class="fine">© ${new Date().getFullYear()} TEAMART LIMITED. Registered in Kenya, supervised by the Tea Board of Kenya.</p>
</div></footer>`;

const menu = document.querySelector('.menu'), nav = document.querySelector('#nav');
menu.addEventListener('click', () => menu.setAttribute('aria-expanded', nav.classList.toggle('open')));

/* Enquiry form */
const form = document.querySelector('#enquiry-form');
if (form) {
  const grade = new URLSearchParams(location.search).get('grade');
  if (grade) [...form.grade.options].forEach(o => { if (o.value.startsWith(grade + ' ')) o.selected = true; });

  const rules = {
    name: v => v.trim() ? '' : 'Enter your name.',
    company: v => v.trim() ? '' : 'Enter your company name.',
    country: v => v.trim() ? '' : 'Enter your country.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.',
    grade: v => v ? '' : 'Choose a grade, or "Not sure yet".',
    message: v => v.trim().length >= 10 ? '' : 'Tell us a little about what you need (10+ characters).'
  };
  const check = el => {
    const msg = rules[el.name] ? rules[el.name](el.value) : '';
    el.setAttribute('aria-invalid', !!msg);
    el.closest('label').querySelector('.err').textContent = msg;
    return !msg;
  };
  Object.keys(rules).forEach(n => form[n].addEventListener('blur', () => check(form[n])));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const bad = Object.keys(rules).filter(n => !check(form[n]));
    if (bad.length) return form[bad[0]].focus();
    if (form.website.value) return; // honeypot
    const d = Object.fromEntries(new FormData(form));
    const ok = document.querySelector('.ok'), btn = form.querySelector('button');
    const body = `Name: ${d.name}\nCompany: ${d.company}\nCountry: ${d.country}\nEmail: ${d.email}\nPhone/WhatsApp: ${d.phone || '-'}\nGrade: ${d.grade}\nQuantity: ${d.qty || '-'}\nDestination port: ${d.port || '-'}\n\n${d.message}`;
    const subject = `Tea enquiry: ${d.grade} from ${d.company}`;
    if (SITE.formEndpoint) {
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const r = await fetch(SITE.formEndpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
        if (!r.ok) throw 0;
        ok.innerHTML = '<b>Enquiry sent.</b> Thank you, we will reply to ' + d.email.replace(/</g, '&lt;') + ' within one business day.';
        ok.classList.add('show'); form.reset();
      } catch {
        ok.innerHTML = `<b>We could not send that.</b> Please email <a href="mailto:${SITE.email}">${SITE.email}</a> or message us on WhatsApp.`;
        ok.classList.add('show');
      }
      btn.disabled = false; btn.textContent = 'Send enquiry';
    } else {
      location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      ok.innerHTML = `<b>Your email app should now open with the enquiry filled in.</b> Press send to complete it. Nothing opened? Email us directly at <a href="mailto:${SITE.email}">${SITE.email}</a>.`;
      ok.classList.add('show');
    }
    ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

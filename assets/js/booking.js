(function () {
  'use strict';

  const form = document.querySelector('#bookingForm');
  if (!form) return;

  const stepEls = Array.from(document.querySelectorAll('[data-step]'));
  const nextBtns = form.querySelectorAll('[data-next]');
  const prevBtns = form.querySelectorAll('[data-prev]');
  const progress = document.querySelector('[data-progress]');
  const summary = document.querySelector('[data-summary]');
  const modal = document.querySelector('[data-modal]');
  const modalClose = document.querySelector('[data-modal-close]');

  let stepIndex = 0;

  function updateProgress() {
    const percent = ((stepIndex + 1) / stepEls.length) * 100;
    progress.style.width = percent + '%';
  }

  function showStep(index) {
    stepEls.forEach((el, i) => {
      el.classList.toggle('hidden', i !== index);
    });
    stepIndex = index;
    updateProgress();
    updateSummary();
  }

  nextBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (stepIndex < stepEls.length - 1) showStep(stepIndex + 1);
  }));

  prevBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (stepIndex > 0) showStep(stepIndex - 1);
  }));

  // Price calculator
  const courseSelect = form.querySelector('#course');
  const addOns = Array.from(form.querySelectorAll('input[name="addons"]'));
  const priceEl = document.querySelector('[data-price]');

  const basePrices = {
    beginner: 12000,
    intermediate: 18000,
    advanced: 25000,
  };
  const addonPrices = {
    car: 4000,
    night: 2500,
    highway: 3000,
  };

  function calculatePrice() {
    const course = courseSelect.value;
    let total = basePrices[course] || 0;
    for (const a of addOns) if (a.checked) total += addonPrices[a.value] || 0;
    priceEl.textContent = new Intl.NumberFormat('ur-PK').format(total) + ' روپے';
    return total;
  }

  courseSelect.addEventListener('change', calculatePrice);
  addOns.forEach(a => a.addEventListener('change', calculatePrice));

  // Slot generation based on date
  const dateInput = form.querySelector('#date');
  const slotsWrap = form.querySelector('[data-slots]');
  const selectedSlotEl = form.querySelector('[data-selected-slot]');
  let selectedSlot = '';

  function generateSlots(dateStr) {
    slotsWrap.innerHTML = '';
    selectedSlot = '';
    selectedSlotEl.textContent = '—';
    if (!dateStr) return;
    const date = new Date(dateStr);
    const isWeekend = [0,6].includes(date.getDay());
    const startHour = isWeekend ? 10 : 7;
    const endHour = isWeekend ? 18 : 20; // extended on weekdays

    for (let h = startHour; h <= endHour; h++) {
      // No slots during lunch 13:00
      if (h === 13) continue;
      const label = `${String(h).padStart(2,'0')}:00`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'px-3 py-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-emerald-500/20 hover:text-emerald-500 transition';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        selectedSlot = label;
        selectedSlotEl.textContent = label;
        slotsWrap.querySelectorAll('button').forEach(b => b.classList.remove('ring', 'ring-emerald-500'));
        btn.classList.add('ring', 'ring-emerald-500');
      });
      slotsWrap.appendChild(btn);
    }
  }

  dateInput.addEventListener('change', (e) => generateSlots(e.target.value));

  // Initial values
  calculatePrice();
  showStep(0);

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const total = calculatePrice();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!selectedSlot) {
      alert('براہ کرم وقت کا سلاٹ منتخب کریں');
      return;
    }
    const details = {
      name: data.name,
      phone: data.phone,
      course: data.course,
      date: data.date,
      slot: selectedSlot,
      addons: addOns.filter(a => a.checked).map(a => a.value).join(', ') || 'کوئی نہیں',
      amount: total,
    };
    const receipt = document.querySelector('[data-receipt]');
    receipt.innerHTML = `
      <div class="text-sm">
        <p><strong>نام:</strong> ${details.name}</p>
        <p><strong>فون:</strong> ${details.phone}</p>
        <p><strong>کورس:</strong> ${details.course}</p>
        <p><strong>تاریخ:</strong> ${details.date}</p>
        <p><strong>ٹائم سلاٹ:</strong> ${details.slot}</p>
        <p><strong>ایڈ آنز:</strong> ${details.addons}</p>
        <p class="mt-2 text-emerald-500 font-semibold"><strong>کل رقم:</strong> ${new Intl.NumberFormat('ur-PK').format(details.amount)} روپے</p>
      </div>
    `;
    modal?.classList.remove('hidden');
  });

  modalClose?.addEventListener('click', () => modal?.classList.add('hidden'));
})();
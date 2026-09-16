import {
  loadState,
  saveState,
  resizeDailyExpenses,
  CATEGORIES,
  FIXED_COST_KEYS,
} from './storage.js';
import {
  toNonNegativeNumber,
  computeDayTotal,
  computeCategoryTotals,
  computeFixedCostsTotal,
  computeGrandTotal,
  progressStatus,
  computeDateForDay,
} from './calculations.js';

const LABELS = {
  vervoer: 'Vervoer',
  drank: 'Drank',
  lunch: 'Lunch',
  diner: 'Diner',
  aankopen: 'Aankopen',
  vlucht: 'Vlucht',
  accommodatie: 'Accommodatie',
  autohuur: 'Autohuur',
};

function createMemoryStorage() {
  const memoryStorage = {};
  return {
    getItem: (key) => (key in memoryStorage ? memoryStorage[key] : null),
    setItem: (key, value) => { memoryStorage[key] = value; },
  };
}

function getStorage() {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    document.getElementById('storage-warning').hidden = false;
    return createMemoryStorage();
  }
}

const storage = getStorage();
const state = loadState(storage);

function persist() {
  saveState(storage, state);
}

function formatEuro(amount) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
}

function renderSettings() {
  document.getElementById('start-date').value = state.settings.startDate || '';
  document.getElementById('num-days').value = state.settings.numDays;

  const budgetContainer = document.getElementById('budget-inputs');
  budgetContainer.innerHTML = '';
  for (const cat of CATEGORIES) {
    const label = document.createElement('label');
    label.textContent = LABELS[cat];
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '0.01';
    input.value = state.settings.budgets[cat];
    input.addEventListener('input', () => {
      state.settings.budgets[cat] = toNonNegativeNumber(input.value);
      persist();
      renderTotals();
    });
    label.appendChild(input);
    budgetContainer.appendChild(label);
  }

  const fixedContainer = document.getElementById('fixed-cost-inputs');
  fixedContainer.innerHTML = '';
  for (const key of FIXED_COST_KEYS) {
    const label = document.createElement('label');
    label.textContent = LABELS[key];
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '0.01';
    input.value = state.settings.fixedCosts[key];
    input.addEventListener('input', () => {
      state.settings.fixedCosts[key] = toNonNegativeNumber(input.value);
      persist();
      renderTotals();
    });
    label.appendChild(input);
    fixedContainer.appendChild(label);
  }
}

function renderDayList() {
  const container = document.getElementById('day-list');
  container.innerHTML = '';
  for (const dayExpenses of state.dailyExpenses) {
    const card = document.createElement('div');
    card.className = 'day-card';

    const title = document.createElement('div');
    title.className = 'day-title';
    const dateLabel = computeDateForDay(state.settings.startDate, dayExpenses.day);
    title.textContent = dateLabel ? `Dag ${dayExpenses.day} — ${dateLabel}` : `Dag ${dayExpenses.day}`;
    card.appendChild(title);

    const inputsGrid = document.createElement('div');
    inputsGrid.className = 'day-inputs';

    const dayTotalEl = document.createElement('div');
    dayTotalEl.className = 'day-total';
    dayTotalEl.textContent = `Dagtotaal: ${formatEuro(computeDayTotal(dayExpenses, CATEGORIES))}`;

    for (const cat of CATEGORIES) {
      const label = document.createElement('label');
      label.textContent = LABELS[cat];
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = '0.01';
      input.value = dayExpenses[cat];
      input.addEventListener('input', () => {
        dayExpenses[cat] = toNonNegativeNumber(input.value);
        persist();
        renderTotals();
        dayTotalEl.textContent = `Dagtotaal: ${formatEuro(computeDayTotal(dayExpenses, CATEGORIES))}`;
      });
      label.appendChild(input);
      inputsGrid.appendChild(label);
    }
    card.appendChild(inputsGrid);
    card.appendChild(dayTotalEl);

    container.appendChild(card);
  }
}

function renderTotals() {
  const categoryTotals = computeCategoryTotals(state.settings.budgets, state.dailyExpenses, CATEGORIES);
  const fixedCostsTotal = computeFixedCostsTotal(state.settings.fixedCosts, FIXED_COST_KEYS);
  const grandTotal = computeGrandTotal(categoryTotals, CATEGORIES, fixedCostsTotal);

  const categoryContainer = document.getElementById('category-totals');
  categoryContainer.innerHTML = '';
  for (const cat of CATEGORIES) {
    const { budget, spent, remaining, percent } = categoryTotals[cat];
    const wrapper = document.createElement('div');
    wrapper.className = 'category-total';

    const header = document.createElement('div');
    header.className = 'category-total-header';
    header.innerHTML = `<span>${LABELS[cat]}</span><span>${formatEuro(spent)} / ${formatEuro(budget)} (${formatEuro(remaining)} over)</span>`;
    wrapper.appendChild(header);

    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    const fill = document.createElement('div');
    fill.className = `progress-bar-fill ${progressStatus(percent)}`;
    fill.style.width = `${percent}%`;
    bar.appendChild(fill);
    wrapper.appendChild(bar);

    categoryContainer.appendChild(wrapper);
  }

  document.getElementById('fixed-costs-total').textContent =
    `Vaste kosten (al betaald): ${formatEuro(fixedCostsTotal)}`;

  document.getElementById('grand-total').textContent =
    `Totaal: ${formatEuro(grandTotal.totalSpent)} / ${formatEuro(grandTotal.totalBudget)} (${formatEuro(grandTotal.remaining)} over)`;
}

document.getElementById('start-date').addEventListener('change', (event) => {
  state.settings.startDate = event.target.value || null;
  persist();
  renderDayList();
});

document.getElementById('num-days').addEventListener('change', (event) => {
  const numDays = Math.max(1, Math.min(60, Math.round(Number(event.target.value)) || 1));
  state.settings.numDays = numDays;
  state.dailyExpenses = resizeDailyExpenses(state.dailyExpenses, numDays);
  document.getElementById('num-days').value = numDays;
  persist();
  renderDayList();
  renderTotals();
});

renderSettings();
renderDayList();
renderTotals();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}

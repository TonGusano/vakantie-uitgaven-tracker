export function toNonNegativeNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function computeDayTotal(dayExpenses, categories) {
  return categories.reduce((sum, cat) => sum + toNonNegativeNumber(dayExpenses[cat]), 0);
}

export function computeCategoryTotals(budgets, dailyExpenses, categories) {
  const totals = {};
  for (const cat of categories) {
    const budget = toNonNegativeNumber(budgets[cat]);
    const spent = dailyExpenses.reduce((sum, day) => sum + toNonNegativeNumber(day[cat]), 0);
    const remaining = budget - spent;
    const percent = budget > 0
      ? Math.min(100, Math.round((spent / budget) * 100))
      : (spent > 0 ? 100 : 0);
    totals[cat] = { budget, spent, remaining, percent };
  }
  return totals;
}

export function computeFixedCostsTotal(fixedCosts, fixedCostKeys) {
  return fixedCostKeys.reduce((sum, key) => sum + toNonNegativeNumber(fixedCosts[key]), 0);
}

export function computeGrandTotal(categoryTotals, categories, fixedCostsTotal) {
  const totalBudget = categories.reduce((sum, cat) => sum + categoryTotals[cat].budget, 0) + fixedCostsTotal;
  const totalSpent = categories.reduce((sum, cat) => sum + categoryTotals[cat].spent, 0) + fixedCostsTotal;
  return { totalBudget, totalSpent, remaining: totalBudget - totalSpent };
}

export function progressStatus(percent) {
  if (percent >= 100) return 'over';
  if (percent >= 80) return 'warning';
  return 'ok';
}

export function computeDateForDay(startDate, dayNumber) {
  if (!startDate) return null;
  const [year, month, day] = startDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + (dayNumber - 1));
  return date.toISOString().slice(0, 10);
}

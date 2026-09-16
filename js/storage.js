const STORAGE_KEY = 'vakantie-uitgaven-tracker-v1';

export const CATEGORIES = ['vervoer', 'drank', 'lunch', 'diner', 'aankopen'];
export const FIXED_COST_KEYS = ['vlucht', 'accommodatie', 'autohuur'];

function zeroedFields(keys) {
  return Object.fromEntries(keys.map((key) => [key, 0]));
}

function createEmptyDay(day) {
  return { day, ...zeroedFields(CATEGORIES) };
}

export function createDefaultState(numDays = 13) {
  return {
    settings: {
      startDate: null,
      numDays,
      budgets: zeroedFields(CATEGORIES),
      fixedCosts: zeroedFields(FIXED_COST_KEYS),
    },
    dailyExpenses: Array.from({ length: numDays }, (_, i) => createEmptyDay(i + 1)),
  };
}

export function loadState(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultState();
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.settings || !Array.isArray(parsed.dailyExpenses)) {
      return createDefaultState();
    }
    return parsed;
  } catch {
    return createDefaultState();
  }
}

export function saveState(storage, state) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resizeDailyExpenses(dailyExpenses, numDays) {
  const result = [];
  for (let i = 0; i < numDays; i++) {
    const day = i + 1;
    const existing = dailyExpenses.find((d) => d.day === day);
    result.push(existing || createEmptyDay(day));
  }
  return result;
}

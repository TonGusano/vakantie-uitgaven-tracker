import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toNonNegativeNumber,
  computeDayTotal,
  computeCategoryTotals,
  computeFixedCostsTotal,
  computeGrandTotal,
  progressStatus,
  computeDateForDay,
} from '../js/calculations.js';

const CATEGORIES = ['vervoer', 'drank', 'lunch', 'diner', 'aankopen'];
const FIXED_COST_KEYS = ['vlucht', 'accommodatie', 'autohuur'];

test('toNonNegativeNumber geeft 0 terug bij ongeldige invoer', () => {
  assert.equal(toNonNegativeNumber(''), 0);
  assert.equal(toNonNegativeNumber('abc'), 0);
  assert.equal(toNonNegativeNumber(-5), 0);
});

test('toNonNegativeNumber geeft het getal terug bij geldige invoer', () => {
  assert.equal(toNonNegativeNumber('12.5'), 12.5);
  assert.equal(toNonNegativeNumber(7), 7);
});

test('computeDayTotal telt alle categorieën van één dag op', () => {
  const day = { vervoer: 10, drank: 5, lunch: 20, diner: 30, aankopen: 0 };
  assert.equal(computeDayTotal(day, CATEGORIES), 65);
});

test('computeCategoryTotals berekent budget, uitgegeven, resterend en percentage', () => {
  const budgets = { vervoer: 100, drank: 50, lunch: 0, diner: 0, aankopen: 0 };
  const dailyExpenses = [
    { vervoer: 20, drank: 10, lunch: 0, diner: 0, aankopen: 0 },
    { vervoer: 30, drank: 45, lunch: 0, diner: 0, aankopen: 0 },
  ];
  const totals = computeCategoryTotals(budgets, dailyExpenses, CATEGORIES);
  assert.equal(totals.vervoer.spent, 50);
  assert.equal(totals.vervoer.remaining, 50);
  assert.equal(totals.vervoer.percent, 50);
  assert.equal(totals.drank.spent, 55);
  assert.equal(totals.drank.percent, 100);
  assert.equal(totals.lunch.percent, 0);
});

test('computeFixedCostsTotal telt vaste kosten op', () => {
  const fixedCosts = { vlucht: 400, accommodatie: 600, autohuur: 150 };
  assert.equal(computeFixedCostsTotal(fixedCosts, FIXED_COST_KEYS), 1150);
});

test('computeGrandTotal telt categorieën en vaste kosten samen op', () => {
  const budgets = { vervoer: 100, drank: 0, lunch: 0, diner: 0, aankopen: 0 };
  const dailyExpenses = [{ vervoer: 40, drank: 0, lunch: 0, diner: 0, aankopen: 0 }];
  const categoryTotals = computeCategoryTotals(budgets, dailyExpenses, CATEGORIES);
  const grandTotal = computeGrandTotal(categoryTotals, CATEGORIES, 200);
  assert.equal(grandTotal.totalBudget, 300);
  assert.equal(grandTotal.totalSpent, 240);
  assert.equal(grandTotal.remaining, 60);
});

test('progressStatus geeft ok, warning of over terug', () => {
  assert.equal(progressStatus(50), 'ok');
  assert.equal(progressStatus(85), 'warning');
  assert.equal(progressStatus(100), 'over');
  assert.equal(progressStatus(120), 'over');
});

test('computeDateForDay telt dagen op bij de startdatum', () => {
  assert.equal(computeDateForDay('2026-09-01', 1), '2026-09-01');
  assert.equal(computeDateForDay('2026-09-01', 13), '2026-09-13');
  assert.equal(computeDateForDay(null, 5), null);
});

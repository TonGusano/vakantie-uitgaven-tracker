import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultState, loadState, saveState, resizeDailyExpenses } from '../js/storage.js';

function createMemoryStorage() {
  const data = {};
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = value; },
  };
}

test('createDefaultState maakt het juiste aantal dagen aan', () => {
  const state = createDefaultState(13);
  assert.equal(state.dailyExpenses.length, 13);
  assert.equal(state.dailyExpenses[0].day, 1);
  assert.equal(state.dailyExpenses[12].day, 13);
  assert.equal(state.settings.numDays, 13);
});

test('loadState geeft standaardstatus terug als er niets is opgeslagen', () => {
  const storage = createMemoryStorage();
  const state = loadState(storage);
  assert.equal(state.dailyExpenses.length, 13);
});

test('saveState en loadState bewaren de ingevoerde data', () => {
  const storage = createMemoryStorage();
  const state = createDefaultState(13);
  state.settings.budgets.vervoer = 250;
  state.dailyExpenses[0].lunch = 15;
  saveState(storage, state);

  const loaded = loadState(storage);
  assert.equal(loaded.settings.budgets.vervoer, 250);
  assert.equal(loaded.dailyExpenses[0].lunch, 15);
});

test('loadState valt terug op standaardstatus bij kapotte data', () => {
  const storage = createMemoryStorage();
  storage.setItem('vakantie-uitgaven-tracker-v1', 'niet-geldige-json');
  const state = loadState(storage);
  assert.equal(state.dailyExpenses.length, 13);
});

test('resizeDailyExpenses behoudt bestaande dagen en vult nieuwe dagen met nullen aan', () => {
  const dailyExpenses = [
    { day: 1, vervoer: 10, drank: 0, lunch: 0, diner: 0, aankopen: 0 },
    { day: 2, vervoer: 20, drank: 0, lunch: 0, diner: 0, aankopen: 0 },
  ];
  const resized = resizeDailyExpenses(dailyExpenses, 3);
  assert.equal(resized.length, 3);
  assert.equal(resized[0].vervoer, 10);
  assert.equal(resized[2].vervoer, 0);
});

test('resizeDailyExpenses verwijdert overtollige dagen', () => {
  const dailyExpenses = [
    { day: 1, vervoer: 10, drank: 0, lunch: 0, diner: 0, aankopen: 0 },
    { day: 2, vervoer: 20, drank: 0, lunch: 0, diner: 0, aankopen: 0 },
    { day: 3, vervoer: 30, drank: 0, lunch: 0, diner: 0, aankopen: 0 },
  ];
  const resized = resizeDailyExpenses(dailyExpenses, 2);
  assert.equal(resized.length, 2);
});

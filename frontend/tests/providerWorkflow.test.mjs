import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockData } from '../src/utils/providerMockData.ts';
import { eligibility, filterCases, markNotificationsRead, updateStatus, validDate } from '../src/utils/providerWorkflow.ts';

test('search and status filters intersect without changing source data', () => {
  const state = createMockData();
  assert.equal(filterCases(state.cases, ' NIMAL ', 'Pending').length, 1);
  assert.equal(filterCases(state.cases, 'Nimal', 'Rejected').length, 0);
  assert.equal(filterCases(state.cases, 'Bosch', 'More Information Required').length, 1);
  assert.equal(state.cases.length, 5);
});
test('approval is blocked until documents are reviewed', () => {
  const state = createMockData();
  assert.throws(() => updateStatus(state, state.cases[0].request.id, 'Approved', '', new Date().toISOString()), /eligibility/);
});
test('approval updates request and adds exactly one unread notification', () => {
  const state = createMockData(), item = state.cases[0];
  item.documents.forEach(doc => { doc.verificationStatus = 'Verified'; });
  const now = new Date().toISOString();
  const next = updateStatus(state, item.request.id, 'Approved', ' Coverage confirmed ', now);
  assert.equal(next.cases[0].request.status, 'Approved');
  assert.equal(next.cases[0].request.notes, 'Coverage confirmed');
  assert.equal(next.cases[0].request.updatedAt, now);
  assert.equal(state.cases[0].request.status, 'Pending');
  assert.equal(next.notifications.length, state.notifications.length + 1);
  assert.equal(next.notifications[0].isRead, false);
  assert.equal(next.notifications[0].customerName, item.customer.name);
  assert.equal(updateStatus(next, item.request.id, 'Approved', 'Coverage confirmed', now), next);
});
test('missing receipt can request information but cannot be approved', () => {
  const state = createMockData(), item = state.cases[4];
  assert.equal(eligibility(item).find(check => check.label === 'Receipt available').checked, false);
  assert.throws(() => updateStatus(state, item.request.id, 'Approved', '', new Date().toISOString()), /eligibility/);
  const next = updateStatus(state, item.request.id, 'More Information Required', 'Please provide the receipt.', new Date().toISOString());
  assert.equal(next.notifications[0].title, 'More information requested from customer');
});
test('expired warranty fails period eligibility and invalid request is rejected', () => {
  const state = createMockData();
  assert.equal(eligibility(state.cases[3]).find(check => check.label === 'Valid warranty period').checked, false);
  assert.throws(() => updateStatus(state, 'not-found', 'Rejected', '', new Date().toISOString()), /not found/);
});
test('individual and bulk read updates preserve request data', () => {
  const state = createMockData();
  const one = markNotificationsRead(state, 'n1');
  assert.equal(one.notifications[0].isRead, true);
  assert.equal(one.notifications[1].isRead, false);
  assert.equal(state.notifications[0].isRead, false);
  assert.equal(markNotificationsRead(one).notifications.every(item => item.isRead), true);
  assert.equal(one.cases, state.cases);
});
test('date validation rejects malformed or impossible dates', () => {
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2026-2-03'), false);
  assert.equal(validDate('2028-02-29'), true);
});

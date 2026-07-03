import test from 'node:test';
import assert from 'node:assert/strict';
import { containsPhoneNumber } from './containsPhoneNumber.js';

test('normal listing prose with BHK and price words passes', () => {
  const r = containsPhoneNumber('Spacious 3BHK flat near station, rent negotiable around 5 lakh');
  assert.equal(r.blocked, false);
  assert.equal(r.reviewOnly, false);
});

test('pincode and sqft mentions pass in prose', () => {
  assert.equal(containsPhoneNumber('Near main road, pincode area 800001').blocked, false);
  assert.equal(containsPhoneNumber('Bright flat, approx 1200 sqft carpet').blocked, false);
});

test('10-digit phone with spaces is blocked', () => {
  const r = containsPhoneNumber('Owner contact 98765 43210 available');
  assert.equal(r.blocked, true);
  assert.match(r.matchedText, /9876543210/);
});

test('phone split across title and description is blocked when concatenated', () => {
  const combined = 'Reach on 98765 ' + '43210 for visit';
  const r = containsPhoneNumber(combined);
  assert.equal(r.blocked, true);
});

test('spelled-out digits forming phone is blocked', () => {
  const r = containsPhoneNumber(
    'nine eight seven six five four three two one zero'
  );
  assert.equal(r.blocked, true);
});

test('call me directly without digits flags review only', () => {
  const r = containsPhoneNumber('Beautiful flat, call me directly for best deal');
  assert.equal(r.blocked, false);
  assert.equal(r.reviewOnly, true);
  assert.equal(r.matchedText, 'call me');
});

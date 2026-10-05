import { describe, it, expect } from 'vitest';
import { sequenceService } from '../../src/server/services/sequenceService';

describe('Concurrency-Safe Sequence Generation', () => {
  it('generates 20 distinct sequential quote numbers without duplicates concurrently', async () => {
    const promises = Array.from({ length: 20 }, () =>
      sequenceService.getNextNumber('quote', 'org-apex-01')
    );

    const results = await Promise.all(promises);
    const numbers = results.map(r => r.numberStr);

    const uniqueSet = new Set(numbers);
    expect(uniqueSet.size).toBe(20);

    numbers.forEach(num => {
      expect(num).toMatch(/^TKL-\d{4}-\d{6}$/);
    });
  });

  it('generates 20 distinct sequential proforma numbers without duplicates concurrently', async () => {
    const promises = Array.from({ length: 20 }, () =>
      sequenceService.getNextNumber('proforma', 'org-apex-01')
    );
    const results = await Promise.all(promises);
    const uniqueSet = new Set(results.map(r => r.numberStr));
    expect(uniqueSet.size).toBe(20);
    results.forEach(r => expect(r.numberStr).toMatch(/^PRO-\d{4}-\d{6}$/));
  });

  it('generates 20 distinct sequential contract numbers without duplicates concurrently', async () => {
    const promises = Array.from({ length: 20 }, () =>
      sequenceService.getNextNumber('contract', 'org-apex-01')
    );
    const results = await Promise.all(promises);
    const uniqueSet = new Set(results.map(r => r.numberStr));
    expect(uniqueSet.size).toBe(20);
    results.forEach(r => expect(r.numberStr).toMatch(/^SOZ-\d{4}-\d{6}$/));
  });

  it('generates 20 distinct sequential sale numbers without duplicates concurrently', async () => {
    const promises = Array.from({ length: 20 }, () =>
      sequenceService.getNextNumber('sale', 'org-apex-01')
    );
    const results = await Promise.all(promises);
    const uniqueSet = new Set(results.map(r => r.numberStr));
    expect(uniqueSet.size).toBe(20);
    results.forEach(r => expect(r.numberStr).toMatch(/^SAT-\d{4}-\d{6}$/));
  });

  it('generates 20 distinct sequential product numbers without duplicates concurrently', async () => {
    const promises = Array.from({ length: 20 }, () =>
      sequenceService.getNextNumber('product', 'org-apex-01')
    );
    const results = await Promise.all(promises);
    const uniqueSet = new Set(results.map(r => r.numberStr));
    expect(uniqueSet.size).toBe(20);
    results.forEach(r => expect(r.numberStr).toMatch(/^PRD-\d{4}-\d{6}$/));
  });

  it('generates 20 distinct sequential payment numbers without duplicates concurrently', async () => {
    const promises = Array.from({ length: 20 }, () =>
      sequenceService.getNextNumber('payment', 'org-apex-01')
    );
    const results = await Promise.all(promises);
    const uniqueSet = new Set(results.map(r => r.numberStr));
    expect(uniqueSet.size).toBe(20);
    results.forEach(r => expect(r.numberStr).toMatch(/^OD-\d{4}-\d{6}$/));
  });
});

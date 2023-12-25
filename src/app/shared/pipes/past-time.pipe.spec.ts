import { PastTimePipe } from './past-time.pipe';

describe('PastTimePipe', () => {
  it('create an instance', () => {
    const pipe = new PastTimePipe();
    expect(pipe).toBeTruthy();
  });
});

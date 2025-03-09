import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { courseProgressGuard } from './course-progress.guard';

describe('courseProgressGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => courseProgressGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

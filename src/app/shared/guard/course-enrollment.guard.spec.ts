import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { courseEnrollmentGuard } from './course-enrollment.guard';

describe('courseEnrollmentGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => courseEnrollmentGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

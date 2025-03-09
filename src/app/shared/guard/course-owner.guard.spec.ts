import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { courseOwnerGuard } from './course-owner.guard';

describe('courseOwnerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => courseOwnerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { browserSupportGuard } from './browser-support.guard';

describe('browserSupportGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => browserSupportGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

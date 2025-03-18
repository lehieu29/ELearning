import { TestBed } from '@angular/core/testing';

import { LearningHistoryService } from './learning-history.service';

describe('LearningHistoryService', () => {
  let service: LearningHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LearningHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

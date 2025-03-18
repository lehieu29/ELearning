import { TestBed } from '@angular/core/testing';

import { SkillsAssessmentService } from './skills-assessment.service';

describe('SkillsAssessmentService', () => {
  let service: SkillsAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SkillsAssessmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

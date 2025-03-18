import { TestBed } from '@angular/core/testing';

import { PrivacySettingsService } from './privacy-settings.service';

describe('PrivacySettingsService', () => {
  let service: PrivacySettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivacySettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

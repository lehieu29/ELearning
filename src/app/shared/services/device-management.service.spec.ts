import { TestBed } from '@angular/core/testing';

import { DeviceManagementService } from './device-management.service';

describe('DeviceManagementService', () => {
  let service: DeviceManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

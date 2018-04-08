import { TestBed, inject } from '@angular/core/testing';

import { JsonManagerService } from './json-manager.service';

describe('JsonManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonManagerService]
    });
  });

  it('should be created', inject([JsonManagerService], (service: JsonManagerService) => {
    expect(service).toBeTruthy();
  }));
});

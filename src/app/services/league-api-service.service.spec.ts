import { TestBed } from '@angular/core/testing';

import { LeagueApiServiceService } from './league-api-service.service';

describe('LeagueApiServiceService', () => {
  let service: LeagueApiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeagueApiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

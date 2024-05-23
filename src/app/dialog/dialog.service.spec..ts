import { TestBed } from '@angular/core/testing';

import { DialogService } from './dialog.service';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('DialogServiceService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalModule]
    });
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftListComponent } from './shift-list.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('ShiftListComponent', () => {
  let component: ShiftListComponent;
  let fixture: ComponentFixture<ShiftListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftListComponent],
      providers: [ModalModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

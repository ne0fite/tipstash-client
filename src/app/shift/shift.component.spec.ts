import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftComponent } from './shift.component';
import { RouterLink, provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('ShiftComponent', () => {
  let component: ShiftComponent;
  let fixture: ComponentFixture<ShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ShiftComponent,
        RouterLink,
        ModalModule
      ],
      providers: [importProvidersFrom(ModalModule), provideRouter([])]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

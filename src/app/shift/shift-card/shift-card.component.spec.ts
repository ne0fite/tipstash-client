import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftCardComponent } from './shift-card.component';
import { HttpClientModule } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';

describe('ShiftCardComponent', () => {
  let component: ShiftCardComponent;
  let fixture: ComponentFixture<ShiftCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftCardComponent],
      providers: [importProvidersFrom(HttpClientModule), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

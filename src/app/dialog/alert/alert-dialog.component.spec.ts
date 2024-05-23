import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertDialog } from './alert-dialog.component';

describe('AlertdialogComponent', () => {
  let component: AlertDialog;
  let fixture: ComponentFixture<AlertDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

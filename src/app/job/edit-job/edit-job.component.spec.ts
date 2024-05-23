import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditJobComponent } from './edit-job.component';
import { provideToastr } from 'ngx-toastr';

describe('EditJobComponent', () => {
  let component: EditJobComponent;
  let fixture: ComponentFixture<EditJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditJobComponent],
      providers: [provideToastr()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

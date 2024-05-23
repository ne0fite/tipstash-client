import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirmdialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialog {
  title?: string;
  message?: string;
  primaryLabel?: string = 'Yes';
  secondaryLabel?: string = 'No';

  result = false;

  constructor(public bsModalRef: BsModalRef) {}

  onPrimaryClick() {
    this.result = true;
    this.bsModalRef.hide();
  }

  onSecondaryClick() {
    this.result = false;
    this.bsModalRef.hide();
  }
}

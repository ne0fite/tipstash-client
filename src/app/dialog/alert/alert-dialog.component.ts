import { Component } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";

@Component({
  selector: 'dt-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrl: './alert-dialog.component.scss'
})
export class AlertDialog {
  title?: string;
  message?: string;
  primaryLabel?: string = 'Close';

  constructor(public bsModalRef: BsModalRef) {}

  onCloseClick() {
    this.bsModalRef.hide();
  }
}

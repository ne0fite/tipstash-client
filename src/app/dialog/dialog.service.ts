import { Component, Injectable, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

import { AlertDialog } from './alert/alert-dialog.component';
import { ConfirmDialog } from './confirm/confirm-dialog.component';

class DialogOptions {
  title?: string;
  primaryLabel?: string = 'OK';
  secondaryLabel?: string = 'Cancel';
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  modalRef?: BsModalRef;
  constructor(private modalService: BsModalService) { }

  alert(message: string, options: DialogOptions): void {
    const state = {
      ...options,
      message,
    };

    if (!state.title) {
      state.title = 'Alert';
    }

    const initialState: ModalOptions = {
      initialState: state
    };

    this.modalService.show(AlertDialog, initialState);
  }

  confirm(message: string, options: DialogOptions) {
    const state = {
      ...options,
      message,
    };

    if (!state.title) {
      state.title = 'Confirm';
    }

    const initialState: ModalOptions = {
      initialState: state
    };

    return new Promise<boolean>((resolve) => {
      const modalRef = this.modalService.show(ConfirmDialog, initialState);

      modalRef.onHide?.subscribe(() => {
        const result = modalRef.content?.result || false;
        resolve(result);
      });
    });
  }

  show(component: any, initialState?: any): Promise<any> {
    return new Promise((resolve) => {
      const modalRef = this.modalService.show(component, initialState);

      modalRef.onHide?.subscribe(() => {
        const result = modalRef.content;
        resolve(result);
      });
    });
  }
}

import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'ts-shift-card',
  standalone: true,
  imports: [
    RouterLink,

    CurrencyPipe,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './shift-card.component.html',
  styleUrl: './shift-card.component.scss'
})
export class ShiftCardComponent {
  @Input({ required: true }) shift!: any;

  constructor(
    private router: Router
  ) {}

  editShift() {
    this.router.navigate(['shift', this.shift.id]);
  }
}

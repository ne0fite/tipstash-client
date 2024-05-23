import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { ButtonModule } from 'primeng/button';
import { ShiftListComponent } from './shift-list/shift-list.component';


@Component({
  selector: 'dt-shift',
  standalone: true,
  imports: [
    RouterLink,
    FontAwesomeModule,
    ButtonModule,
    ShiftListComponent
  ],
  templateUrl: './shift.component.html',
  styleUrl: './shift.component.scss'
})
export class ShiftComponent {
  faPlus = faPlus;
}

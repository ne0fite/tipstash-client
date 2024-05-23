import { Component } from '@angular/core';
import { OverviewComponent } from '../shift/overview/overview.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    OverviewComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}

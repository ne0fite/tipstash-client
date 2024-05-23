import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ts-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavBarComponent {
  logout() {

  }
}

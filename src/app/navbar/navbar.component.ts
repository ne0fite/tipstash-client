import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome, faMoneyBill, faBriefcase, faSignOut } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'ts-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FontAwesomeModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavBarComponent implements OnInit {
  faHome = faHome;
  faMoneyBill = faMoneyBill;
  faBriefcase = faBriefcase;
  faSignOut = faSignOut;

  isLoggedIn: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(status => {
      this.isLoggedIn = status;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

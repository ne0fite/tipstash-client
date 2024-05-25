import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'dt-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    ButtonModule,
    InputTextModule,
    PasswordModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm = this.formBuilder.group({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required
    ]),
  });

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastrService: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
      if (this.authService.accessToken != null) {
        this.router.navigate(['']);
      }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  async login() {
    this.submitted = true;

    if (!this.loginForm.valid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    if (email == null || password == null) {
      return;
    }

    try {
      await this.authService.login(email, password);
      this.toastrService.success('Logged In!');
      this.router.navigate(['']);
    } catch (error) {
      this.toastrService.error('error logging in');
    }
  }
}

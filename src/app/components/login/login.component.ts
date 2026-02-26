import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, SignUpRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSignUpMode = false;
  credentials: LoginRequest = { username: '', password: '' };
  signUpData: SignUpRequest = { username: '', password: '' };
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMode(): void {
    this.isSignUpMode = !this.isSignUpMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.credentials = { username: '', password: '' };
    this.signUpData = { username: '', password: '' };
  }

  onLogin(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSignUp(): void {
    if (!this.signUpData.username || !this.signUpData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Signup data:', this.signUpData);

    this.authService.signup(this.signUpData).subscribe({
      next: (response) => {
        console.log('Signup success:', response);
        this.successMessage = 'Account created successfully! Please sign in.';
        this.isSignUpMode = false;
        this.signUpData = { username: '', password: '' };
      },
      error: (error) => {
        console.error('Signup error:', error);
        this.errorMessage = error.error?.message || error.message || 'Sign up failed';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
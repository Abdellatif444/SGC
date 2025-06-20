import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './navbar.css', './standalone-navbar.css']
})
export class AppComponent {
  title = 'ScholarSystem';

  constructor(private authService: AuthService) {}

  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem('access_token');
  }

  getUsername(): string {
    if (!this.isBrowser()) return '';
    return localStorage.getItem('username') || '';
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        window.location.reload();
      },
      error: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        window.location.reload();
      }
    });
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
  }

  getProfileImage(): string {
    if (!this.isBrowser()) return '/assets/images/profile.png';
    return localStorage.getItem('profile_image') || '/assets/images/profile.png';
  }
}

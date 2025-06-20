import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form = { username: '', password: '' };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    if (!this.form.username || !this.form.password) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }
    this.authService.login(this.form).subscribe({
      next: (res: any) => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        const payload = JSON.parse(atob(res.access.split('.')[1]));
        // Stocke le username depuis la réponse backend si présent
        if (res.username) {
          localStorage.setItem('username', res.username);
        } else if (payload.username) {
          localStorage.setItem('username', payload.username);
        } else {
          localStorage.removeItem('username');
        }
        localStorage.setItem('role', payload.role);
        if (res.email) {
          localStorage.setItem('email', res.email);
        }
        if (res.date_joined) {
          localStorage.setItem('date_joined', res.date_joined);
        }
        // Redirection selon le rôle
        if (payload.role === 'admin') {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.errorMessage = 'Identifiants invalides. Vérifiez votre email/nom d\'utilisateur et votre mot de passe.';
      }
    });
  }
} 
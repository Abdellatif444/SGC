import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form = { username: '', email: '', password: '' };
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.form.username || !this.form.email || !this.form.password || !this.confirmPassword) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }
    if (this.form.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }
    this.authService.register(this.form).subscribe({
      next: () => {
        this.successMessage = 'Inscription réussie ! Vous pouvez vous connecter.';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        if (err.error && err.error.username && err.error.username[0].includes('unique')) {
          this.errorMessage = 'Ce nom d\'utilisateur est déjà pris.';
        } else if (err.error && err.error.email && err.error.email[0].includes('unique')) {
          this.errorMessage = 'Cet email est déjà utilisé.';
        } else {
          this.errorMessage = 'Erreur lors de l\'inscription.';
        }
      }
    });
  }
} 
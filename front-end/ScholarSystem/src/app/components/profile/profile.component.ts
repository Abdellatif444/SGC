import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  profileImageUrl: string = localStorage.getItem('profile_image') || '/assets/images/profile.png';

  getUsername(): string {
    const username = localStorage.getItem('username');
    if (!username || username === 'undefined' || username === 'null') {
      return 'Profil utilisateur';
    }
    return username;
  }
  getEmail(): string {
    const email = localStorage.getItem('email');
    if (!email || email === 'undefined' || email === 'null') {
      return '';
    }
    return email;
  }
  getRole(): string {
    const role = localStorage.getItem('role');
    if (!role || role === 'undefined' || role === 'null') {
      return '';
    }
    return role;
  }
  getDateJoined(): string {
    const date = localStorage.getItem('date_joined');
    if (!date || date === 'undefined' || date === 'null') {
      return '';
    }
    return date;
  }

  onProfileImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
        localStorage.setItem('profile_image', this.profileImageUrl);
      };
      reader.readAsDataURL(file);
    }
  }
} 
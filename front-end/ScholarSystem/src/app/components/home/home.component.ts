import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css', './home.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class HomeComponent {
  searchTerm: string = '';

  search() {
    console.log('Recherche effectuée pour :', this.searchTerm);
    // Logique de recherche
  }
}



import { Component, OnInit } from '@angular/core';
import { PublicationService } from '../../services/publication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-publication-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publication-list.component.html',
  styleUrls: ['./publication-list.component.css']
})
export class PublicationListComponent implements OnInit {
  publications: any[] = [];
  searchTerm: string = '';
  tag: string = '';
  domain: string = '';
  author: string = '';
  date: string = '';
  sortBy: string = 'latest';
  isLoading: boolean = false;

  constructor(private publicationService: PublicationService) {}

  ngOnInit() {
    this.loadPublications();
  }

  loadPublications() {
    this.publicationService.getAll().subscribe(data => {
      this.publications = data;
    });
  }

  onSearch() {
    this.isLoading = true;
    this.publicationService.advancedSearch({
      q: this.searchTerm,
      tag: this.tag,
      domain: this.domain,
      author: this.author,
      date: this.date,
      sort: this.sortBy
    }).subscribe({
      next: data => {
        this.publications = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // Recherche dynamique
  onFilterChange() {
    this.onSearch();
  }

  resetFilters() {
    this.searchTerm = '';
    this.tag = '';
    this.domain = '';
    this.author = '';
    this.date = '';
    this.sortBy = 'latest';
    this.onSearch();
  }

  downloadPublication(pub: any) {
    if (!pub.document) return;
    window.open(pub.document, '_blank');
  }
} 
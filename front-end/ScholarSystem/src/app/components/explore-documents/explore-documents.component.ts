import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-explore-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore-documents.component.html',
  styleUrls: ['./explore-documents.component.css']
})
export class ExploreDocumentsComponent implements OnInit {
  documents: any[] = [];
  searchTerm: string = '';
  tag: string = '';
  domain: string = '';
  author: string = '';
  date: string = '';

  constructor(private documentService: DocumentService) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.documentService.getAll().subscribe(data => {
      this.documents = data;
    });
  }

  onSearch() {
    this.documentService.advancedSearch({
      q: this.searchTerm,
      tag: this.tag,
      domain: this.domain,
      author: this.author,
      date: this.date
    }).subscribe(data => {
      this.documents = data;
    });
  }

  onFilterChange() {
    this.onSearch();
  }
} 
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicationService } from '../../services/publication.service';

@Component({
  selector: 'app-publication-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publication-form.component.html',
  styleUrls: ['./publication-form.component.css']
})
export class PublicationFormComponent {
  title = '';
  content = '';
  domain = '';
  tags = '';
  document: File | null = null;
  cover_image: File | null = null;

  constructor(private publicationService: PublicationService) {}

  onFileChange(event: any, type: 'document' | 'cover_image') {
    const file = event.target.files[0];
    if (type === 'document') this.document = file;
    if (type === 'cover_image') this.cover_image = file;
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('content', this.content);
    formData.append('domain', this.domain);
    formData.append('tags', JSON.stringify(this.tags.split(',').map(t => t.trim())));
    if (this.document) formData.append('document', this.document);
    if (this.cover_image) formData.append('cover_image', this.cover_image);

    this.publicationService.create(formData).subscribe({
      next: () => {
        alert('Publication créée !');
        this.title = '';
        this.content = '';
        this.domain = '';
        this.tags = '';
        this.document = null;
        this.cover_image = null;
      },
      error: () => alert('Erreur lors de la publication')
    });
  }
} 
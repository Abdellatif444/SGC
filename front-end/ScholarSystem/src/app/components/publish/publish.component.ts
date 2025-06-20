import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicationService } from '../../services/publication.service';

// Publication interface
interface Publication {
  id: string;
  title: string;
  content: string;
  domain: string;
  author: {
    username: string;
    email: string;
  };
  author_name: string;
  created_at: string;
  tags: string[];
    likes: number;
  dislikes?: number;
  comments: any[];
  document?: string;
}

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class PublishComponent implements OnInit {
  // Publications data
  publications: Publication[] = [];
  filteredPublications: Publication[] = [];
  
  // Form data
  newPublication = {
    title: '',
    abstract: '',
    domain: 'Computer Science',
    tags: '',
    authorName: '',
    file: null as File | null,
    coverImage: null as File | null,
    termsAgreed: false
  };
  
  // Current domain filter
  currentDomain: string = 'all';
  
  // Selected publication for comments
  selectedPublication: Publication | null = null;
  commentText: string = '';
  commenterName: string = '';
  
  // Sort option
  sortBy: 'latest' | 'popular' | 'downloads' = 'latest';

  // Loading states
  isLoading = false;
  isPublishing = false;

  // Modal states
  showPublishModal = false;
  showCommentModal = false;

  // Action states to prevent double clicks
  isLiking: { [key: string]: boolean } = {};
  isDisliking: { [key: string]: boolean } = {};
  isCommenting: { [key: string]: boolean } = {};
  isDeletingComment: { [key: string]: { [index: number]: boolean } } = {};

  constructor(private publicationService: PublicationService) { }

  ngOnInit(): void {
    // Load publications data from the API
    this.loadPublications();
  }

  // Load publications from API
  loadPublications(): void {
    this.isLoading = true;
    this.publicationService.getAll().subscribe({
      next: (data) => {
        this.publications = data;
        this.filterPublications();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading publications:', error);
        this.isLoading = false;
        // Fallback to empty array if API fails
        this.publications = [];
        this.filterPublications();
      }
    });
  }

  // Reload publications to ensure data consistency
  reloadPublications(): void {
    this.loadPublications();
  }

  // Filter publications by domain
  filterPublications(domain: string = 'all'): void {
    this.currentDomain = domain;
    
    if (domain === 'all') {
      this.filteredPublications = [...this.publications];
    } else {
      this.filteredPublications = this.publications.filter(pub => pub.domain === domain);
    }
    
    // Apply sorting
    this.sortPublications();
  }

  // Sort publications
  sortPublications(): void {
    switch (this.sortBy) {
      case 'latest':
        this.filteredPublications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        this.filteredPublications.sort((a, b) => b.likes - a.likes);
        break;
      case 'downloads':
        // Since we don't have downloads in the backend model, we'll use likes as fallback
        this.filteredPublications.sort((a, b) => b.likes - a.likes);
        break;
    }
  }

  // Change sort option
  changeSortOption(option: 'latest' | 'popular' | 'downloads'): void {
    this.sortBy = option;
    this.sortPublications();
  }

  // Handle file uploads
  onFileSelected(event: Event, fileType: 'document' | 'cover'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      if (fileType === 'document') {
        // Validate document file
        if (!this.isValidDocumentFile(file)) {
          alert('Please select a valid document file (PDF, DOCX, or TXT) with size less than 20MB.');
          input.value = '';
          return;
        }
        this.newPublication.file = file;
      } else {
        // Validate image file
        if (!this.isValidImageFile(file)) {
          alert('Please select a valid image file (JPEG, JPG, PNG, GIF, BMP, TIFF, or WEBP) with size less than 5MB.');
          input.value = '';
          return;
        }
        this.newPublication.coverImage = file;
      }
    }
  }

  // Validate document file
  isValidDocumentFile(file: File): boolean {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const maxSize = 20 * 1024 * 1024; // 20MB
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return validExtensions.includes(extension) && file.size <= maxSize;
  }

  // Validate image file
  isValidImageFile(file: File): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return validExtensions.includes(extension) && file.size <= maxSize;
  }

  // Get file size in readable format
  getFileSize(file: File): string {
    if (file.size < 1024) {
      return file.size + ' B';
    } else if (file.size < 1024 * 1024) {
      return (file.size / 1024).toFixed(1) + ' KB';
    } else {
      return (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }

  // Submit new publication
  publishResearch(): void {
    if (!this.isAuthenticated()) {
      alert('Vous devez être connecté pour publier.');
      return;
    }
    // Validate form
    if (!this.newPublication.title.trim()) {
      alert('Please enter a title for your research.');
      return;
    }
    
    if (!this.newPublication.abstract.trim()) {
      alert('Please provide an abstract for your research.');
      return;
    }
    
    if (!this.newPublication.domain) {
      alert('Please select a domain for your research.');
      return;
    }
    
    if (!this.newPublication.authorName.trim()) {
      alert('Please enter your name as the author.');
      return;
    }
    
    if (!this.newPublication.file) {
      alert('Please upload a document file.');
      return;
    }
    
    if (!this.newPublication.termsAgreed) {
      alert('Please accept the terms of service to continue.');
      return;
    }
    
    this.isPublishing = true;
    
    // Send to backend API
    this.publicationService.create(
      this.newPublication, 
      this.newPublication.file || undefined, 
      this.newPublication.coverImage || undefined
    ).subscribe({
      next: (response) => {
        console.log('Publication created successfully:', response);
        alert('Your research has been published successfully!');
        this.closePublishModal();
        this.resetForm();
        this.loadPublications(); // Reload the publications list
        this.isPublishing = false;
      },
      error: (error) => {
        console.error('Error publishing research:', error);
        let errorMessage = 'Error publishing research. Please try again.';
        
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.error && typeof error.error === 'object') {
          // Handle Django validation errors
          const errors = Object.values(error.error).flat();
          errorMessage = errors.join('\n');
  }

        alert(errorMessage);
        this.isPublishing = false;
      }
    });
  }

  // Reset form
  resetForm(): void {
    this.newPublication = {
      title: '',
      abstract: '',
      domain: 'Computer Science',
      tags: '',
      authorName: '',
      file: null,
      coverImage: null,
      termsAgreed: false
    };
  }

  // Download publication
  downloadPublication(publication: Publication): void {
    this.publicationService.download(parseInt(publication.id)).subscribe({
      next: (blob: Blob) => {
        // Create a blob URL and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Create a safe filename
        const safeFilename = publication.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';
        link.download = safeFilename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(url);
        
        console.log(`Downloading: ${publication.title}`);
        
        // Reload publications to update comment counter
        this.loadPublications();
      },
      error: (error) => {
        console.error('Error downloading publication:', error);
        alert('Error downloading publication. Please try again.');
      }
    });
  }

  // Like publication
  adorePublication(publication: Publication): void {
    // Prevent double clicks
    if (this.isLiking[publication.id]) {
      return;
    }
    
    this.isLiking[publication.id] = true;
    
    this.publicationService.like(parseInt(publication.id)).subscribe({
      next: (response) => {
        console.log('Publication liked:', response);
        // Update the local publication data with actual values from backend
        const pub = this.publications.find(p => p.id === publication.id);
        if (pub) {
          pub.likes = response.likes;
          pub.dislikes = response.dislikes || 0;
          // Update the filtered publications as well
          const filteredPub = this.filteredPublications.find(p => p.id === publication.id);
          if (filteredPub) {
            filteredPub.likes = response.likes;
            filteredPub.dislikes = response.dislikes || 0;
          }
        }
        // Show success message
        console.log(`Publication "${publication.title}" liked successfully!`);
        this.isLiking[publication.id] = false;
      },
      error: (error) => {
        console.error('Error liking publication:', error);
        alert('Error liking publication. Please try again.');
        this.isLiking[publication.id] = false;
      }
    });
  }

  // Dislike publication
  dislikePublication(publication: Publication): void {
    // Prevent double clicks
    if (this.isDisliking[publication.id]) {
      return;
    }
    
    this.isDisliking[publication.id] = true;
    
    this.publicationService.dislike(parseInt(publication.id)).subscribe({
      next: (response) => {
        console.log('Publication disliked:', response);
        // Update the local publication data with actual values from backend
        const pub = this.publications.find(p => p.id === publication.id);
        if (pub) {
          pub.likes = response.likes;
          pub.dislikes = response.dislikes || 0;
          // Update the filtered publications as well
          const filteredPub = this.filteredPublications.find(p => p.id === publication.id);
          if (filteredPub) {
            filteredPub.likes = response.likes;
            filteredPub.dislikes = response.dislikes || 0;
          }
        }
        // Show success message
        console.log(`Publication "${publication.title}" disliked successfully!`);
        this.isDisliking[publication.id] = false;
      },
      error: (error) => {
        console.error('Error disliking publication:', error);
        alert('Error disliking publication. Please try again.');
        this.isDisliking[publication.id] = false;
      }
    });
  }

  // Open comment modal
  openCommentModal(publication: Publication): void {
    if (!this.isAuthenticated()) {
      alert('Vous devez être connecté pour commenter.');
      return;
    }
    this.selectedPublication = publication;
    this.commentText = '';
    this.commenterName = '';
    this.showCommentModal = true;
  }

  // Close comment modal
  closeCommentModal(): void {
    this.showCommentModal = false;
    
    // Reset commenting flag if there was a selected publication
    if (this.selectedPublication) {
      this.isCommenting[this.selectedPublication.id] = false;
    }
    
    this.selectedPublication = null;
    this.commentText = '';
    this.commenterName = '';
  }

  // Open publish modal
  openPublishModal(): void {
    if (!this.isAuthenticated()) {
      alert('Vous devez être connecté pour publier.');
      return;
    }
    this.showPublishModal = true;
  }

  // Close publish modal
  closePublishModal(): void {
    this.showPublishModal = false;
    this.resetForm();
  }

  // Submit comment
  submitComment(): void {
    if (!this.isAuthenticated()) {
      alert('Vous devez être connecté pour commenter.');
      return;
    }
    if (!this.selectedPublication || !this.commentText.trim()) {
      return;
    }
    
    // Prevent double submissions
    if (this.isCommenting[this.selectedPublication.id]) {
      return;
    }
    
    this.isCommenting[this.selectedPublication.id] = true;

    // Create comment data with name
    const commentData = {
      content: this.commentText,
      user: this.commenterName.trim() || 'Anonymous'
    };

    this.publicationService.comment(parseInt(this.selectedPublication.id), commentData).subscribe({
      next: (response) => {
        console.log('Comment added:', response);
        
        // Reset the commenting flag first
        if (this.selectedPublication) {
          this.isCommenting[this.selectedPublication.id] = false;
        }
        
        // Close modal
        this.closeCommentModal();
        
        // Reload publications to get the updated data from backend
        this.loadPublications();
        
        // Show success message
        if (this.selectedPublication) {
          console.log(`Comment added to "${this.selectedPublication.title}" successfully!`);
        }
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        alert('Error adding comment. Please try again.');
        // Reset the commenting flag on error
        if (this.selectedPublication) {
          this.isCommenting[this.selectedPublication.id] = false;
        }
      }
    });
  }

  // Delete comment
  deleteComment(publication: Publication, commentIndex: number): void {
    // Prevent deletion of system download comments
    if (publication.comments[commentIndex] && publication.comments[commentIndex].type === 'download') {
      alert('System comments cannot be deleted.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this comment?')) {
      // Prevent multiple deletions
      if (this.isDeletingComment[publication.id] && this.isDeletingComment[publication.id][commentIndex]) {
        return;
      }
      
      // Initialize deletion state
      if (!this.isDeletingComment[publication.id]) {
        this.isDeletingComment[publication.id] = {};
      }
      this.isDeletingComment[publication.id][commentIndex] = true;
      
      this.publicationService.deleteComment(parseInt(publication.id), commentIndex).subscribe({
        next: (response) => {
          console.log('Comment deleted:', response);
          
          // Reset deletion state
          if (this.isDeletingComment[publication.id]) {
            this.isDeletingComment[publication.id][commentIndex] = false;
          }
          
          // Reload publications to get the updated data from backend
          this.loadPublications();
          
          console.log('Comment deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
          alert('Error deleting comment. Please try again.');
          
          // Reset deletion state on error
          if (this.isDeletingComment[publication.id]) {
            this.isDeletingComment[publication.id][commentIndex] = false;
          }
        }
      });
    }
  }

  // Format publication date
  formatPublicationDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Get download count from comments
  getDownloadCount(publication: Publication): number {
    if (!publication.comments || !Array.isArray(publication.comments)) {
      return 0;
    }
    return publication.comments.filter((comment: any) => comment.type === 'download').length;
  }

  isCurrentUserAuthor(publication: Publication): boolean {
    // À adapter selon ta logique d'authentification (ici username stocké dans localStorage)
    const currentUser = localStorage.getItem('username');
    return publication.author && publication.author.username === currentUser;
  }

  deletePublication(publication: Publication): void {
    if (confirm('Voulez-vous vraiment supprimer cette publication ?')) {
      this.publicationService.delete(Number(publication.id)).subscribe({
        next: () => {
          alert('Publication supprimée !');
          this.loadPublications();
        },
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  canDeleteComment(comment: any): boolean {
    const currentUser = localStorage.getItem('username');
    return this.isAuthenticated() || (comment.user && comment.user === currentUser);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FileService, FileModel, ShareRequest } from '../../services/file.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  files: FileModel[] = [];
  filteredFiles: FileModel[] = [];
  shareRequests: ShareRequest[] = [];
  totalSize: number = 0;
  isUploading: boolean = false;
  showShareModal: boolean = false;
  selectedFileId: number = 0;
  shareEmail: string = '';
  searchTerm: string = '';

  constructor(
    private authService: AuthService,
    private fileService: FileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadFiles();
    this.loadShareRequests();
  }

  loadFiles(): void {
    const userId = this.authService.getCurrentUserId();
    this.fileService.getUserFiles(userId).subscribe({
      next: (files) => {
        this.files = files;
        this.filteredFiles = files;
        this.totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
      },
      error: () => {}
    });
  }

  filterFiles(): void {
    if (!this.searchTerm.trim()) {
      this.filteredFiles = this.files;
    } else {
      this.filteredFiles = this.files.filter(file => 
        file.originalFileName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File): void {
    this.isUploading = true;
    const userId = this.authService.getCurrentUserId();
    this.fileService.uploadFile(file, userId).subscribe({
      next: () => {
        alert('File uploaded successfully!');
        this.loadFiles();
        this.isUploading = false;
      },
      error: () => {
        alert('Error: File too large or limit reached');
        this.isUploading = false;
      }
    });
  }

  deleteFile(id: number): void {
    if (confirm('Are you sure you want to delete this file?')) {
      const userId = this.authService.getCurrentUserId();
      this.fileService.deleteFile(id, userId).subscribe({
        next: () => {
          this.loadFiles();
        },
        error: () => alert('Delete failed')
      });
    }
  }

  formatFileSize(mb: number): string {
    if (mb === 0) return '0 B';
    if (mb < 0.001) return (mb * 1024 * 1024).toFixed(0) + ' B';
    if (mb < 1) return (mb * 1024).toFixed(2) + ' KB';
    if (mb < 1024) return mb.toFixed(2) + ' MB';
    return (mb / 1024).toFixed(2) + ' GB';
  }

  loadShareRequests(): void {
    const userId = this.authService.getCurrentUserId();
    this.fileService.getPendingShareRequests(userId).subscribe({
      next: (requests) => {
        this.shareRequests = requests;
      },
      error: () => {}
    });
  }

  openShareModal(fileId: number): void {
    this.selectedFileId = fileId;
    this.showShareModal = true;
  }

  closeShareModal(): void {
    this.showShareModal = false;
    this.shareEmail = '';
    this.selectedFileId = 0;
  }

  shareFile(): void {
    const userId = this.authService.getCurrentUserId();
    this.fileService.shareFile(userId, this.selectedFileId, this.shareEmail).subscribe({
      next: () => {
        alert('Share request sent!');
        this.closeShareModal();
      },
      error: (error) => alert(error.error?.message || 'Share failed')
    });
  }

  respondToShareRequest(requestId: number, accept: boolean): void {
    this.fileService.respondToShareRequest(requestId, accept).subscribe({
      next: () => {
        this.loadShareRequests();
        if (accept) {
          this.loadFiles();
        }
      },
      error: () => alert('Action failed')
    });
  }



  downloadFile(fileId: number): void {
    const userId = this.authService.getCurrentUserId();
    const file = this.files.find(f => f.id === fileId);
    
    this.fileService.getSignedUrl(fileId, userId).subscribe({
      next: (response) => {
        fetch(response.url)
          .then(res => res.ok ? res.blob() : Promise.reject())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file?.originalFileName || 'download';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          })
          .catch(() => {});
      },
      error: () => {}
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
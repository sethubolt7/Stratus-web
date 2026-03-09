import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface FileModel {
  id: number;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface ShareRequest {
  id: number;
  senderId: number;
  receiverId: number;
  fileId: number;
  status: number;
  requestedAt: string;
  respondedAt?: string;
  sender: { id: number; username: string; };
  file: FileModel;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'https://stratusapi-latest.onrender.com/api/file';
  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  deleteFile(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  shareFile(fileId: number, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/share`, { fileId, email });
  }

  getUserFiles(): Observable<FileModel[]> {
    return this.http.get<FileModel[]>(`${this.apiUrl}/user`);
  }

  getPendingShareRequests(): Observable<ShareRequest[]> {
    return this.http.get<ShareRequest[]>(`${this.apiUrl}/requests`);
  }

  respondToShareRequest(requestId: number, accept: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/respond`, { requestId, accept });
  }

  getSignedUrl(fileId: number): Observable<{url: string}> {
    return this.http.get<{url: string}>(`${this.apiUrl}/signed-url/${fileId}`);
  }
}

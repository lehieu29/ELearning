import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private http: HttpClient) {}
  
  upload(files: File[], url: string): Observable<number> {
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i], files[i].name);
    }
    
    const req = new HttpRequest('POST', `${environment.apiUrl}${url}`, formData, {
      reportProgress: true
    });
    
    return this.http.request(req).pipe(
      map(event => this.getUploadProgress(event))
    );
  }
  
  private getUploadProgress(event: HttpEvent<any>): number {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        return Math.round(100 * event.loaded / event.total);
      case HttpEventType.Response:
        return 100;
      default:
        return 0;
    }
  }
}

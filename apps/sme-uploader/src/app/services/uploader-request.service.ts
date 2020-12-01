import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as tus from 'tus-js-client';

@Injectable({ providedIn: 'root' })
export class UploaderRequestService {
  private conf = {
    apiUrl: '',
    deleteUrl: '',
    metadata: {},
  };

  constructor(private http: HttpClient) {}

  initConfig(apiUrl, deleteUrl, metadata) {
    this.conf = { apiUrl, deleteUrl, metadata };
  }

  uploading(file, onErrorUpload, onProgressUpload, onSuccessUpload) {
    return new tus.Upload(file, {
      endpoint: this.conf?.apiUrl,
      retryDelays: [0, 3000],
      metadata: {
        ...this.conf?.metadata,
        filename: file.name,
        filetype: file.type,
      },
      onError: (error) => onErrorUpload(error, file),
      onProgress: (bytesUploaded) => {
        onProgressUpload(file, bytesUploaded);
      },
      onSuccess: () => onSuccessUpload(file),
    });
  }

  removeFileFromServer(fileUrl: string = ''): Observable<any> {
    if (fileUrl && this.conf?.deleteUrl) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Tus-Resumable', '1.0.0');
      const fileNumber = this.getFileNumber(fileUrl);
      return this.http.delete(`${this.conf?.deleteUrl}/${fileNumber}`, {
        headers,
      });
    }

    return of(true);
  }

  private getFileNumber(path: string): string {
    const fileNumber = path.split('+')[0].split('/');
    return fileNumber[fileNumber.length - 1];
  }
}

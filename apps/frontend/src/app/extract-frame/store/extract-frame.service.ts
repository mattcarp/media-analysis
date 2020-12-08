import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { pluck, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { HelperService } from '../../media-files/store/services';

@Injectable({
  providedIn: 'root',
})
export class ExtractFrameService {
  private readonly url: string;

  constructor(
    private http: HttpClient,
    private helperService: HelperService,
  ) {
    this.url = `${this.helperService.getEndpoint()}/extract-frame`;
  }

  extractFrame(locationSecs: string): Observable<string> {
    return this.http.post<string>(this.url, { locationSecs })
      .pipe(pluck('filePath'));
  }

  downloadFile(fileUrl: string, fileName: string): Observable<any> {
    return this.http.get(fileUrl, { responseType: 'blob' }).pipe(
      tap((response: any) => saveAs(response, fileName)),
    );
  }

  deleteFile(filePath: string): Observable<boolean> {
    const url = `${this.url}?filePath=${filePath}`;
    return this.http.delete<boolean>(url);
  }
}

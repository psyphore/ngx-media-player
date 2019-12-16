import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiService {

  constructor(private httpClient: HttpClient) { }

  getAvailablePlaylist<T>(): Observable<T> {
    return this.httpClient.get<T>(`${environment.api.baseUrl}/playlist/latest`);
  }

  getAvailableArtwork<T>(): Observable<T> {
    return this.httpClient.get<T>(`${environment.api.baseUrl}/playlist/artwork/`);
  }
}

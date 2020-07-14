import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EndpointService {
  getEndpoint() {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3000/';
    } else {
      return '/';
    }
  }

}

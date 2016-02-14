import {Injectable} from 'angular2/core';

@Injectable()
export class endpointService {
  getEndpoint() {
    if (window.location.hostname === "localhost") {
      return "http://localhost:3000/";
    } else {
      return "http://52.0.119.124:3000/";
    }
  }

}

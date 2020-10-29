import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

declare const X2JS: any;

@Injectable()
export class GracenoteService {
  gracenoteResponse$ = this.gracenoteResponseSource.asObservable();

  private gracenoteUrl = 'https://c2045878769.web.cddbp.net/webapi/xml/1.0/';
  private gracenoteResponseSource = new Subject<any>();

  constructor(private http: HttpClient) {}


  queryByToc(toc?: string) {
    const x2js = new X2JS();
    const request = `
      <QUERIES>
        <AUTH>
          <CLIENT>2045878769-1368BF6D0C5E00E1598CEB24B18894F3</CLIENT>
          <USER>279600670234466494-85F5ECD6517910C02814EAF50844DC68</USER>
        </AUTH>
        <QUERY CMD="ALBUM_TOC">
          <TOC>
            <OFFSETS>${toc}</OFFSETS>
          </TOC>
          <MODE>SINGLE_BEST_COVER</MODE>
          <OPTION>
            <PARAMETER>SELECT_EXTENDED</PARAMETER>
            <VALUE>ARTIST_IMAGE</VALUE>
          </OPTION>
          <OPTION>
            <PARAMETER>SELECT_DETAIL</PARAMETER>
            <VALUE>ARTIST_ORIGIN:4LEVEL</VALUE>
          </OPTION>
        </QUERY>
      </QUERIES>
    `;
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/xml');
    headers.append('Content-Type', 'application/xml');
    console.log('gracenote service got this toc', toc );

    return this.http.post(this.gracenoteUrl, request, { headers }).pipe(
      map((res: any) => {
        this.gracenoteResponseSource.next(x2js.xml_str2json(res.text()));
      }));
      // TODOmc don't subscribe here - do it in the component that consume the data
  }
}

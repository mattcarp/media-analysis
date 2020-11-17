import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { filter, map, tap } from 'rxjs/operators';

import { DdpState } from '../reducers/ddp.reducer';
import { setGracenote } from '../actions/ddp.actions';

declare const X2JS: any;

@Injectable({
  providedIn: 'root',
})
export class GracenoteService {
  private gracenoteUrl = 'https://c2045878769.web.cddbp.net/webapi/xml/1.0/';

  constructor(private http: HttpClient, private store: Store<DdpState>) {}

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
    console.log('gracenote service got this toc', toc);

    this.http.post(this.gracenoteUrl, request, { headers }).pipe(
      map((res: any) => x2js.xml_str2json(res.text())),
      filter((res: any) => !!res?.RESPONSES?.RESPONSE?.ALBUM),
    ).subscribe((res: any) => {
      console.log('!!!!res', res);
      this.store.dispatch(setGracenote({ gracenote: res.RESPONSES.RESPONSE }));
    });
  }
}

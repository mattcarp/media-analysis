import { Component, OnInit } from '@angular/core';

import { GracenoteService } from '../store/services/gracenote.service';

@Component({
  selector: 'ddp-gracenote',
  templateUrl: 'gracenote.component.html',
  styleUrls: ['gracenote.component.scss'],
})
export class GracenoteComponent implements OnInit {
  gracenoteData: any;

  constructor(private gracenoteService: GracenoteService) {}

  ngOnInit(): void {
    this.gracenoteService.gracenoteResponse$.subscribe((data: any) => {
      if (data.RESPONSES.RESPONSE.ALBUM) {
        this.gracenoteData = data.RESPONSES.RESPONSE;
      } else {
        this.gracenoteData = null;
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';

import { CdTextService } from '../store/services/cdtext.service';

@Component({
  selector: 'ddp-cdtext',
  templateUrl: './cdtext.component.html',
  styleUrls: ['./cdtext.component.scss'],
})
export class CdtextComponent implements OnInit {
  parsedPacks: any[];
  parsedCdText: any;

  constructor(private cdtextService: CdTextService) {}

  ngOnInit(): void {
    this.cdtextService.cdTextParsed$.subscribe((packs: any[]) => {
      this.parsedPacks = packs;
    });
    this.cdtextService.packsAssembled$.subscribe((parsedCdText) => {
      this.parsedCdText = parsedCdText;
    });
  }

}

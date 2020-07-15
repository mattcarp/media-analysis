import { Component } from '@angular/core';

import { ExtractMetadataService } from './extract-metadata/extract-metadata.service';

@Component({
  selector: 'analysis-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'client';
  metadataResult: any;

  constructor(private extractMetadataService: ExtractMetadataService) {
     extractMetadataService.metadataResult
       .subscribe((a) => {
         console.log('!2', a);
         this.metadataResult = a;
       });
  }
}

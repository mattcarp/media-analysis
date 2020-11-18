import { Component } from '@angular/core';
import { ExtractMetadataService } from '../extract-metadata/extract-metadata.service';
import { UploaderService } from '../uploader/uploader.service';
import { LoggerService } from '../services/logger.service';
// import {PlayerService} from "./player.service";

declare var jwplayer: any;

// TODOmc inject the player service

@Component({
  selector: 'player',
  templateUrl: './player.html',
})
export class PlayerComponent {
  showPlayer: boolean = false;
  showPlayerHeader: boolean = false;
  metadataResult: any;
  playerInstance: any = jwplayer('player-dark');
  dummyPlaylist = [{
    'file': 'http://www.tonycuffe.com/mp3/cairnomount.mp3',
    'title': 'the first track',
  }, {
    'file': 'http://www.tonycuffe.com/mp3/tail%20toddle.mp3',
    'title': 'the second track',
  }, { 'file': 'full url, man', 'title': 'the third track' }, {
    'file': 'full url, man',
    'title': 'the fourth track',
  }, { 'file': 'full url, man', 'title': 'the fifth track' }, {
    'file': 'full url, man',
    'title': 'the sixth track',
  }, { 'file': 'full url, man', 'title': 'the seventh track' }, {
    'file': 'full url, man',
    'title': 'the eigth track',
  }, { 'file': 'full url, man', 'title': 'the ninth track' }, {
    'file': 'http://www.tonycuffe.com/mp3/cairnomount.mp3',
    'title': 'side two! the first track',
  }, {
    'file': 'http://www.tonycuffe.com/mp3/tail%20toddle.mp3',
    'title': 'the second track',
  }, { 'file': 'full url, man', 'title': 'the third track' }, {
    'file': 'full url, man',
    'title': 'the fourth track',
  }, { 'file': 'full url, man', 'title': 'the fifth track' }, {
    'file': 'full url, man',
    'title': 'the sixth track',
  }, { 'file': 'full url, man', 'title': 'the seventh track' }, {
    'file': 'full url, man',
    'title': 'the eigth track',
  }, { 'file': 'full url, man', 'title': 'the ninth track' }];

  // playerService: any;

  constructor(
    extractMetadataService: ExtractMetadataService,
    fileHandlerService: UploaderService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.info(`Player instance.`, 'color: green');
    console.log(this.playerInstance);
    this.metadataResult = extractMetadataService.metadataResult;
    this.metadataResult.subscribe(() => {
      // this.renderResult(value);
      // this.initPlayer(this.dummyPlaylist);
      this.showPlayerHeader = true;
    });
  }

  playVideo(track: Object) {}

  initPlayer(playlist: Object[]) {
    // TODO if we have no audio tracks, don't load player
    this.loggerService.info(`Player was instantiated.`, 'color: green');
    this.playerInstance.setup({
      playlist: playlist,
      width: '100%',
      height: 40,
      skin: {
        name: 'aoma',
      },
    });
  }

  togglePlayer() {
    this.showPlayer = !this.showPlayer;
  }
}

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UploaderStoreService } from './../services/uploader-store.service';

describe('AppComponent', () => {
  let service: UploaderStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UploaderStoreService],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(UploaderStoreService);
  });

  describe('#initConfig', () => {
    it('#initConfig should be defined', () => {
      expect(service.initConfig).toBeDefined();
      service.initConfig([], 0);
    });
  });

  describe('#addFile', () => {
    it('#addFile should be defined', () => {
      expect(service.addFile).toBeDefined();
      service.addFile(null);
    });
  });
});

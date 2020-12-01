import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UploaderRequestService } from '../services/uploader-request.service';
import { AnalysisService } from './../services/analysis.service';
import { UploaderStoreService } from './../services/uploader-store.service';

describe('HelperService', () => {
  let service: AnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UploaderStoreService,
          useValue: {
            getFileList: () => {
              return [{ analysed: 'error' }];
            },
            checkAnalysisStatus: (success, error) => {},
          },
        },
        UploaderRequestService,
      ],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AnalysisService);
  });

  describe('#getIsErrorAnalysis', () => {
    it('#getIsErrorAnalysis is defined', () => {
      expect(service.getIsErrorAnalysis).toBeDefined();
      service.getIsErrorAnalysis();
    });
  });

  describe('#checkAnalysis', () => {
    it('#checkAnalysis is defined', () => {
      expect(service.checkAnalysis).toBeDefined();
      service.checkAnalysis();
    });
  });

  describe('#setSuccessAnalysis', () => {
    it('#setSuccessAnalysis is defined', () => {
      expect(service.setSuccessAnalysis).toBeDefined();
      service.setSuccessAnalysis('[]');
    });
  });

  describe('#setErrorAnalysis', () => {
    it('#setErrorAnalysis is defined', () => {
      expect(service.setErrorAnalysis).toBeDefined();
      service.setErrorAnalysis('[]');
    });
  });
});

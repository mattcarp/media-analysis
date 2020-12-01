import { HelperService } from '../services/helper.service';

describe('HelperService', () => {
  let service: HelperService;
  const data = {
    a: {
      first: 5,
      second: 4,
      equal: 0,
    },
    b: {
      first: 4,
      second: 5,
      equal: 0,
    },
  };
  beforeEach(() => {
    service = new HelperService();
  });

  describe('#sortFn', () => {
    it('#sortFn should return 1 if a[field] > b[field]', () => {
      expect(service.sortFn(data.a, data.b, 'first')).toBe(1);
    });

    it('#sortFn should return -1 if a[field] < b[field]', () => {
      expect(service.sortFn(data.a, data.b, 'second')).toBe(-1);
    });

    it('#sortFn should return 0 if a[field] === b[field]', () => {
      expect(service.sortFn(data.a, data.b, 'equal')).toBe(0);
    });
  });

  describe('#clockFormat', () => {
    it('#clockFormat should return 01:00:00 hour from 3600 seconds and decimals === 0', () => {
      expect(service.clockFormat(3600, 0)).toEqual('01:00:00');
    });

    it('#clockFormat should return 00:00:59 hour from 59 seconds and decimals === 0', () => {
      expect(service.clockFormat(59, 0)).toEqual('00:00:59');
    });

    it('#clockFormat should return 00:00:59.12 hour from 59.12 seconds and decimals === 2', () => {
      expect(service.clockFormat(59.12, 2)).toEqual('00:00:59.12');
    });

    it('#clockFormat should return 00:00:60.0 hour from 59.99 seconds and decimals === 1', () => {
      expect(service.clockFormat(59.99, 1)).toEqual('00:01:00.0');
    });

    it('#clockFormat should return 00:00 if seconds === 0', () => {
      expect(service.clockFormat(0, 1)).toEqual('00:00');
    });
  });

  describe('#getTimeLeft', () => {
    it('#getTimeLeft should return 00:00 when bytesPerSecond === 0', () => {
      expect(service.getTimeLeft(100, 3600, 0)).toEqual('00:00');
    });

    it('#getTimeLeft should return 00:00:04 when totalSize === 3600, totalUploaded === 0, bytesPerSecond === 1', () => {
      expect(service.getTimeLeft(3600, 0, 1)).toEqual('00:00:04');
    });
  });

  describe('#getUploaderState', () => {
    it('#getUploaderState should return "loading" when file has loading status', () => {
      const fileList = [{ status: 'loading' }, { status: 'new' }];
      expect(service.getUploaderState(fileList)).toEqual('loading');
    });

    it('#getUploaderState should return "paused" when file has paused status', () => {
      const fileList = [{ status: 'paused' }, { status: 'new' }];
      expect(service.getUploaderState(fileList)).toEqual('paused');
    });

    it('#getUploaderState should return "ready" when no "loading" and "puased" statuses', () => {
      const fileList = [{ status: 'new' }, { status: 'new' }];
      expect(service.getUploaderState(fileList)).toEqual('ready');
    });
  });

  describe('#getUploadedSize', () => {
    it('#getUploadedSize should return 200 when 1 file uploaded with 100 and currentBytesUploaded with 100', () => {
      const totalSize = 300;
      const fileList = [{ size: 100, status: 'success' }, { size: 200 }];
      const currentBytesUploaded = 100;

      expect(
        service.getUploadedSize(totalSize, fileList, currentBytesUploaded),
      ).toEqual(200);
    });

    it('#getUploadedSize should return totalSize when totalSize is lower then currentBytes + uploadedFileSize', () => {
      const totalSize = 300;
      const fileList = [{ size: 100 }, { size: 200, status: 'success' }];
      const currentBytesUploaded = 200;

      expect(
        service.getUploadedSize(totalSize, fileList, currentBytesUploaded),
      ).toEqual(300);
    });
  });

  describe('#getUploadSpeed', () => {
    it('#getUploadSpeed check upload speed', () => {
      const startAt = new Date(new Date().getTime() - 100);
      const currentBytesUploaded = 24341;

      expect(service.getUploadSpeed(startAt, currentBytesUploaded)).toBe(243);
    });

    it('#getUploadSpeed should return 0 when no startAt', () => {
      const startAt = undefined;
      const currentBytesUploaded = 24341;

      expect(service.getUploadSpeed(startAt, currentBytesUploaded)).toBe(0);
    });
  });

  describe('#getID', () => {
    it('#getID shoud return random id each time', () => {
      const id1 = service.getID();
      const id2 = service.getID();

      expect(id1).not.toBe('');
      expect(id1).toBeDefined();
      expect(id2).not.toBe('');
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });
  });

  describe('#getIconByMime', () => {
    it('#getIconByMime should return default icon if fileType is not set', () => {
      expect(service.getIconByMime('')).toEqual(
        service.getIconChoices()['default'],
      );
    });

    it('#getIconByMime should return text icon if fileType is text', () => {
      expect(service.getIconByMime('text')).toEqual(
        service.getIconChoices()['text'],
      );
    });

    it('#getIconByMime should return image icon if fileType is image', () => {
      expect(service.getIconByMime('image')).toEqual(
        service.getIconChoices()['image'],
      );
    });

    it('#getIconByMime should return audio icon if fileType is audio', () => {
      expect(service.getIconByMime('audio')).toEqual(
        service.getIconChoices()['audio'],
      );
    });

    it('#getIconByMime should return video icon if fileType is video', () => {
      expect(service.getIconByMime('video')).toEqual(
        service.getIconChoices()['video'],
      );
    });

    it('#getIconByMime should return pdf icon if fileType is pdf', () => {
      expect(service.getIconByMime('pdf')).toEqual(
        service.getIconChoices()['pdf'],
      );
    });

    it('#getIconByMime should return application icon if fileType is application', () => {
      expect(service.getIconByMime('application')).toEqual(
        service.getIconChoices()['application'],
      );
    });

    it('#getIconByMime should return archive icon if fileType is one of archive type', () => {
      expect(service.getIconByMime('application/zip')).toEqual(
        service.getIconChoices()['archive'],
      );
      expect(service.getIconByMime('application/x-gtar')).toEqual(
        service.getIconChoices()['archive'],
      );
    });

    it('#getIconByMime should return default in another of cases', () => {
      expect(service.getIconByMime('randomText')).toEqual(
        service.getIconChoices()['default'],
      );
    });
  });

  describe('#setTheme and #getTheme', () => {
    it('#setTheme and #getTheme should work', () => {
      service.setTheme('promo');
      expect(service.getTheme()).toEqual('promo');
    });
  });

  describe('#getResizeClass', () => {
    const el = document.createElement('div');

    it('#getResizeClass should return "smeu-size-sm" when offsetWidth === 580', () => {
      expect(service.getResizeClass(580)).toEqual('smeu-size-sm');
    });

    it('#getResizeClass should return "smeu-size-md" when offsetWidth === 1020', () => {
      expect(service.getResizeClass(1020)).toEqual('smeu-size-md');
    });

    it('#getResizeClass should return "smeu-size-lg" when offsetWidth === 1150', () => {
      expect(service.getResizeClass(1150)).toEqual('smeu-size-lg');
    });

    it('#getResizeClass should return "smeu-size-xl" when offsetWidth === 1300', () => {
      expect(service.getResizeClass(1300)).toEqual('smeu-size-xl');
    });
  });

  describe('#informer', () => {
    it('#informer should exist', () => {
      service.informer('hello world');
      expect(service.informer).toBeDefined();
    });
  });

  describe('#removeFromLocalstorage', () => {
    it('#removeFromLocalstorage should exist', () => {
      expect(service.removeFromLocalstorage).toBeDefined();
    });

    it('#removeFromLocalstorage should exist', () => {
      localStorage.setItem('uploader', JSON.stringify({ uploadUrl: 'myUrl' }));
      service.removeFromLocalstorage({ url: 'myUrl' });
      expect(JSON.parse(localStorage.getItem('uploader'))).toBe(null);
    });

    it('#removeFromLocalstorage should just return when uploader is null', () => {
      localStorage.setItem('uploader', JSON.stringify({ uploadUrl: 'myUrl' }));
      service.removeFromLocalstorage(null);
      expect(JSON.parse(localStorage.getItem('uploader'))['uploadUrl']).toBe(
        'myUrl',
      );
    });
  });
});

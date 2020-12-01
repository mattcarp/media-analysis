import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AnalysisService } from './services/analysis.service';
import { HelperService } from './services/helper.service';
import { UploaderStoreService } from './services/uploader-store.service';
import { UploaderService } from './services/uploader.service';
import { DeleteModal, UFile } from '@media-analysis/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./styles/_main.scss'],
})
export class AppComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() apiUrl = 'http://0.0.0.0:1080/files';
  @Input() deleteUrl = 'http://0.0.0.0:1080/files';
  @Input() metadata = '{}';
  @Input() theme = 'promo'; // 'promo' | 'modern' | 'aoma'

  @Input()
  set acceptFormats(types: string) {
    this.acceptFormatTypes = types ?? '*';
    this.uploaderService.setTypes(this.acceptFormatTypes);
  }

  @Input()
  set limit(limit: string) {
    if (limit) {
      this.uploaderService.setLimit(limit);
    }
  }

  @Input()
  set pauseDisabled(input: string) {
    this.isPauseDisabled = input === 'true';
  }

  @Input()
  set clearAllDisabled(input: string) {
    this.isClearAllDisabled = input === 'true';
  }

  @Input()
  set stopUploadingDisabled(input: string) {
    this.isStopUploadingDisabled = input === 'true';
  }

  @Input()
  set sortBtnDisabled(input: string) {
    this.isSortBtnDisalbed = input === 'true';
  }

  @Input()
  set sortBtnHidden(input: string) {
    this.isSortBtnHidden = input === 'true';
  }

  @Input()
  set thumbnailBtnDisabled(input: string) {
    this.isThumbnailBtnDisalbed = input === 'true';
  }

  @Input()
  set analysis(input: string) {
    this.isAnalysis = input === 'true';
  }

  @Input()
  set analysisSuccess(array: string) {
    // array example : '["_id1", "_id2", ...]'
    this.analysisService.setSuccessAnalysis(array);
  }

  @Input()
  set analysisError(array: string) {
    this.analysisService.setErrorAnalysis(array);
  }

  @Output() addedFiles = new EventEmitter();
  @Output() removedFile = new EventEmitter();
  @Output() uploadedFilesChanged = new EventEmitter();
  @Output() uploadFinished = new EventEmitter();
  @Output() uploadStarted = new EventEmitter();
  @Output() uploadPaused = new EventEmitter();
  @Output() uploadedFileDeleted = new EventEmitter();
  @Output() ver = new EventEmitter();
  @ViewChild('smeuRoot') root: ElementRef;
  disabledUpload = true;
  isThumbView: boolean;
  files: UFile[] = [];
  numFilesToUpload = 0;
  uploadingState = 'ready';
  isFileAdded = false;
  isAnalysis: boolean;
  isErrorAnalysis = false;
  isUploading = false;
  isPauseDisabled = false;
  isStopUploadingDisabled = false;
  isSortBtnDisalbed = false;
  isSortBtnHidden = false;
  isClearAllDisabled = false;
  isThumbnailBtnDisalbed = false;
  isErrorUpload = false;
  isUploadedFinish = false;
  acceptFormatTypes = '*';
  statusBar: string;
  deleteModalOptions: DeleteModal = {
    showDeleteModal: false,
    title: '',
    bodyText: '',
    parameters: {},
  };
  hasNewFiles = false;

  private readonly verApp: string;
  private destroy$: Subject<boolean> = new Subject();

  constructor(
    private uploaderService: UploaderService,
    private helperService: HelperService,
    private analysisService: AnalysisService,
    private storeService: UploaderStoreService,
  ) {
    // todo fix it
    // this.verApp = require('../../package.json').version;
  }

  ngOnInit(): void {
    this.uploaderService.init({
      apiUrl: this.apiUrl,
      deleteUrl: this.deleteUrl,
      metadata: JSON.parse(this.metadata || null),
      analysis: this.isAnalysis,
    });
    this.subscribeOnRefresh();
    this.checkTheme();
    this.ver.emit(this.verApp);
  }

  ngOnChanges(): void {
    this.checkTheme();
    this.refreshList();
  }

  ngAfterViewInit() {
    this.changeResizeClass(this.root.nativeElement);
  }

  ngOnDestroy(): void {
    this.uploaderService.clear('onDestroy');
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  triggerDelete(params): void {
    const { allowToRemove, isRemoveAll, fileId } = params;

    this.deleteModalOptions.showDeleteModal = false;
    if (allowToRemove) {
      if (isRemoveAll) {
        this.clearAll();
      } else {
        this.deleteFile(fileId);
      }
    }
  }

  cancel(): void {
    this.uploaderService.cancelUpload();
  }

  pause(): void {
    this.uploaderService.pause();
    this.setUploadingState('paused');
    this.uploadPaused.emit({ uploadStatus: 'paused' });
  }

  unPause(): void {
    this.uploaderService.unPause();
    this.setUploadingState('loading');
  }

  startUpload(): void {
    this.uploaderService.setStartedAt();
    this.setUploadingState('uploading');
    this.uploaderService.startUpload();
    this.uploadStarted.emit({ uploadStatus: 'started' });
  }

  setUploadingState(state: string): void {
    this.uploadingState = state;
  }

  onUploadFile(event): void {
    const newFiles = this.uploaderService.addFile(event);
    this.addedFiles.emit(newFiles);
    this.isFileAdded = !!newFiles?.length;

    this.refreshList();
    this.checkOnlineStatus();
  }

  onClearAllClick(): void {
    this.deleteModalOptions = {
      showDeleteModal: true,
      bodyText: 'Are you sure you want to remove all files ?',
      parameters: {
        isRemoveAll: true,
      },
    };
  }

  clearAll(): void {
    this.uploaderService.clear();
    this.removedFile.emit('all');
    this.refreshList();
  }

  softClearList(): void {
    this.uploaderService.softClear();
    this.removedFile.emit('all');
    this.refreshList();
  }

  onDeleteFileClick(fileId, fileName): void {
    if (!this.isUploading) {
      this.deleteModalOptions = {
        showDeleteModal: true,
        bodyText: `Are you sure you want to remove this file?`,
        parameters: {
          fileId,
          isRemoveAll: false,
        },
      };
    }
  }

  deleteFile(fileId: string): void {
    if (!this.isUploading) {
      this.uploaderService.deleteFile(fileId);
      this.removedFile.emit(fileId);
      this.refreshList();
    }
  }

  refreshList(): void {
    this.files = this.uploaderService.getFileList();
    this.uploadingState = this.helperService.getUploaderState(this.files);
    this.isFileAdded = !!this.files?.length;
    this.numFilesToUpload = this.uploaderService.getNumFilesToUpload();
    this.checkAnalysis();
  }

  subscribeOnRefresh(): void {
    this.uploaderService.onRefresh().subscribe((resp: any) => {
      this.isUploading = this.uploaderService.isUploading;
      this.refreshList();
      this.setDisabledButton();

      if (resp?.uploadStatus === 'finished') {
        this.uploadFinished.emit({ uploadStatus: 'finished' });
      }

      if (resp?.removedFile) {
        this.uploadedFileDeleted.emit({ removedFile: resp.removedFile });
      }

      this.hasNewFiles = this.storeService.isNewFile();
      this.uploadedFilesChanged.emit(this.uploaderService.getUploadedFiles());
      this.isUploadedFinish = this.uploaderService.getNumFilesToUpload() === 0;
      this.isErrorUpload = this.uploaderService.isUploadedError();
      this.isErrorAnalysis = this.analysisService.getIsErrorAnalysis();
    });
  }

  setDisabledButton(): void {
    this.disabledUpload =
      !this.files?.length || this.uploaderService.getIsUploading();
  }

  isUploadStart(): boolean {
    return this.uploaderService.isUploadStart();
  }

  getFileTypeColor(fileType: string): string {
    return this.helperService.getIconByMime(fileType).color;
  }

  getFileTypeIcon(fileType: string): string {
    return this.helperService.getIconByMime(fileType).icon;
  }

  getClassUpload(): string {
    return this.theme === 'promo' ? 'upload' : 'play';
  }

  setClassListView(style): void {
    this.isThumbView = style === 'thumb';
  }

  getClassListView(): string {
    return this.isThumbView ? 'smeu-thumb' : 'smeu-list';
  }

  getPlural(): string {
    return this.files.length > 1 ? 's' : '';
  }

  checkTheme(): void {
    this.helperService.setTheme(this.theme);
    this.isThumbView = this.theme !== 'promo';
    this.getClassListView();
  }

  checkAnalysis(): void {
    if (this.isAnalysis) {
      this.analysisService.checkAnalysis();
    }
  }

  @HostListener('window:resize', ['$event']) onResize() {
    this.changeResizeClass(this?.root?.nativeElement);
  }

  get showUploadBtn(): boolean {
    return (
      (this.isUploading && this.isPauseDisabled) ||
      (!this.isUploading && !this.isUploadStart()) ||
      (this.theme === 'promo' && !this.isUploading)
    );
  }

  private changeResizeClass(el) {
    el.classList.remove(
      'smeu-size-sm',
      'smeu-size-md',
      'smeu-size-lg',
      'smeu-size-xl',
    );

    const elClass = this.helperService.getResizeClass(el.offsetWidth);
    el.classList.add(elClass);
  }

  private checkOnlineStatus(): void {
    const onlineEvent = fromEvent(window, 'online');
    const offlineEvent = fromEvent(window, 'offline');

    onlineEvent
      .pipe(takeUntil(this.destroy$))
      .subscribe(() =>
        this.helperService.informer('Connected to the Internet'),
      );

    offlineEvent
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.helperService.informer('No Internet connection'));
  }
}

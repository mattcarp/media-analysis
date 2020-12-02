import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NGXLogger } from 'ngx-logger';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { ValidationState } from '../../store/models';
import { validationsRules } from '../../store/services/validations-rules.constants';
import { MediaFilesState } from '../../store/reducers/media-files.reducer';
import { MediaFilesService, ValidationsImageService } from '../../store/services';
import { selectValidations } from '../../store/selectors/media-files.selectors';

@Component({
  selector: 'app-audio-validations',
  templateUrl: './audio-validations.component.html',
})
export class AudioValidationsComponent implements OnInit, OnDestroy {
  @Input() file: any;
  @Output() outputEmit?: EventEmitter<string> = new EventEmitter();
  hasValidation = false;
  validation: ValidationState;
  totalValidationTime: number;
  passes: any[] = [];
  fails: any[] = [];
  imageValidations: any[] = [];
  validationsRules = validationsRules.audioStream[0];
  isValidationCompleted = false;
  resultValidation = 'question';
  detailsValidation: any[] = [];

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private mediaFileService: MediaFilesService,
    private validationsService: ValidationsImageService,
    private store: Store<MediaFilesState>,
    private logger: NGXLogger
  ) {
    this.store.pipe(
      select(selectValidations),
      map((validations: ValidationState[]) =>
        validations.filter((item: ValidationState) => item.fileId === this.file?.id)),
      takeUntil(this.destroy$),
    ).subscribe((validations: ValidationState[]) => {
      if (validations[0]) {
        this.hasValidation = true;
        this.resultValidation = validations[0].isValid ? 'success' : 'error';
        this.detailsValidation = JSON.parse(validations[0].entries);
        this.passes = this.detailsValidation.filter((item) => item.success === true);
        this.fails = this.detailsValidation.filter((item) => item.success === false);
      }

      this.outputEmit.emit(this.resultValidation);
    });
  }

  ngOnInit(): void {
    this.logger.log('got these validations', this.validation);
    const end = new Date().getTime();
    this.totalValidationTime = end - this.mediaFileService.parseStartTime.getTime();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPlural(arr: []): string {
    return arr.length > 1 ? 's' : '';
  }
}

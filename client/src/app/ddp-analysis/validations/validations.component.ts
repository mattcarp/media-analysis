import { Component, OnDestroy, OnInit } from '@angular/core';
import { IdState, MsState, PqState, ValidationState } from '../store/models';
import { select, Store } from '@ngrx/store';

import { DdpState } from '../store/reducers/ddp.reducer';
import { DdpFileService } from '../store/services/ddp-file.service';
import { DdpmsService } from '../store/services/ddpms.service';
import { DdppqService } from '../store/services/ddppq.service';
import { ValidationsService } from '../store/services/validations.service';
import { selectId, selectMs, selectPq, selectValidation } from '../store/selectors/ddp.selectors';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ddp-validations',
  templateUrl: './validations.component.html',
  styleUrls: ['./validations.component.scss'],
})
export class ValidationsComponent implements OnInit, OnDestroy {
  parsedMs: MsState;
  parsedId: IdState;
  hasValidations = false;
  validations: ValidationState;
  totalValidationTime: number;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private ddpFileService: DdpFileService,
    private ddpmsService: DdpmsService,
    private ddppqService: DdppqService,
    private validationsService: ValidationsService,
    private store: Store<DdpState>,
  ) {}

  ngOnInit(): void {
    this.store.pipe(
      select(selectMs),
      takeUntil(this.destroy$),
    ).subscribe((ms: MsState) => this.parsedMs = ms);

    this.store.pipe(
      select(selectId),
      takeUntil(this.destroy$),
    ).subscribe((id: IdState) => this.parsedId = id);

    this.store.pipe(
      select(selectPq),
      takeUntil(this.destroy$),
    ).subscribe((pq: PqState) => {
      // if the pq is parsed, it means we already have the ms and the files
      this.validationsService.validate(this.ddpFileService.allResumableFiles,
        this.parsedMs, this.parsedId);
      this.store.pipe(
        select(selectValidation),
        takeUntil(this.destroy$),
      ).subscribe((validations: ValidationState) => {
        this.hasValidations = true;
        this.validations = validations;
      });
      // TODO validations are null
      console.log('got these validations', this.validations);
      console.log('in return for ', this.parsedMs, this.parsedId);
      const end = new Date().getTime();
      this.totalValidationTime = end - this.ddpFileService.parseStartTime.getTime();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploaderService } from '../services/uploader.service';
import { AppComponent } from './../app.component';
import { ListViewModule } from './../shared/list-view/list-view.module';
import { SortListModule } from './../shared/sort-list/sort-list.module';
import { StatusBarModule } from './../shared/status-bar/status-bar.module';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UploaderService],
    }),
  );

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AppComponent],
        imports: [SortListModule, ListViewModule, StatusBarModule],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component.disabledUpload).toEqual(true);
    expect(component.isThumbView).toEqual(false);
    expect(component.files).toEqual([]);
    expect(component.uploadingState).toEqual('ready');
    expect(component.isUploading).toEqual(false);
    expect(component.apiUrl).toBeDefined();
    expect(component.deleteUrl).toBeDefined();
    expect(component.isPauseDisabled).toBe(false);
    expect(component.theme).toBeDefined();
  });
});

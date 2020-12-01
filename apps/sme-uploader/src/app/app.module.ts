import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { BrowseFileDirective } from './directives/browse-file.directive';
import { DragDropDirective } from './directives/drag-drop.directive';
import { InputUploaderDirective } from './directives/input-uploader.directive';
import { PipesModule } from './pipes/pipes.module';
import { UploaderService } from './services/uploader.service';
import { ListViewModule } from './shared/list-view/list-view.module';
import { SharedModule } from './shared/shared.module';
import { SortListModule } from './shared/sort-list/sort-list.module';
import { StatusBarModule } from './shared/status-bar/status-bar.module';

@NgModule({
  declarations: [
    AppComponent,
    DragDropDirective,
    BrowseFileDirective,
    InputUploaderDirective,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    StatusBarModule,
    PipesModule,
    SortListModule,
    HttpClientModule,
    ListViewModule,
    SharedModule,
  ],
  providers: [UploaderService],
  entryComponents: [AppComponent],
  bootstrap: [!environment.production ? AppComponent : []],
})
export class AppModule {
  constructor(private injector: Injector) {
    const el = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('sme-uploader', el);
  }

  ngDoBootstrap() {}
}

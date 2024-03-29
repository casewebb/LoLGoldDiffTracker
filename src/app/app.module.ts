import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChampionCardComponent } from './components/champion-card/champion-card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastrModule } from 'ngx-toastr';
import { ItemSearchComponent } from './components/item-search/item-search.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SettingsComponent } from './components/settings/settings.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ChampionCardComponent,
    ItemSearchComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      closeButton: true,
      tapToDismiss: true,
      extendedTimeOut: 0,
      timeOut: 0,
    }),
    MatTabsModule,
    MatCheckboxModule,
    NgSelectModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

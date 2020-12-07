import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {

  constructor(private localStorageService: LocalStorageService) { }

  @Input() animateBg;
  @Output() animateBgChange = new EventEmitter<boolean>();

  @Input() online;
  @Output() onlineChange = new EventEmitter<boolean>();

  @Input() alertItems;
  @Input() itemList;
  @Output() alertItemsChange = new EventEmitter<Array<string>>();

  @Input() alertChamps;
  @Input() champList;
  @Output() alertChampsChange = new EventEmitter<Array<string>>();

  ngOnInit(): void {
  }

  updateAnimateSetting() {
    this.localStorageService.set("animateBg", this.animateBg);
    this.animateBgChange.emit(this.animateBg);
  }

  updateOnlineSetting() {
    this.localStorageService.set("online", this.online);
    this.onlineChange.emit(this.online);
  }

  updateAlertItems() {
    let itemNames = [];
    this.alertItems.forEach(element => {
      itemNames.push(element.name);
    });
    this.localStorageService.set("alertItems", itemNames);
    this.alertItemsChange.emit(itemNames);
  }

  updateLv6ChampAlerts() {
    let champNames = [];
    this.alertChamps.forEach(element => {
      champNames.push(element.name);
    });
    this.localStorageService.set("alertChamps", champNames);
    this.alertChampsChange.emit(champNames);
  }
}

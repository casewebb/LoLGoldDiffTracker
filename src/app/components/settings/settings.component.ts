import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Datum } from 'src/app/interfaces/LeagueInterfaces';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {

  constructor() { }

  @Input() animateBg;
  @Output() animateBgChange = new EventEmitter<boolean>();

  @Input() online;
  @Output() onlineChange = new EventEmitter<boolean>();

  @Input() itemList;

  @Input() alertItems;
  @Output() alertItemsChange = new EventEmitter<Array<string>>();

  ngOnInit(): void {
  }

  updateAnimateSetting() {
    this.animateBgChange.emit(this.animateBg);
  }

  updateOnlineSetting() {
    this.onlineChange.emit(this.online);
  }

  updateAlertItems() {
    let itemNames = [];
    this.alertItems.forEach(element => {
      itemNames.push(element.name);
    });
    console.log(itemNames)
    this.alertItemsChange.emit(itemNames);
  }
}

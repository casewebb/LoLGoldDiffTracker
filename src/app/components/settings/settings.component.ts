import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor() { }

  @Input() animateBg;
  @Output() animateBgChange = new EventEmitter<boolean>();

  @Input() online;
  @Output() onlineChange = new EventEmitter<boolean>();

  ngOnInit(): void {
  }

  updateAnimateSetting() {
    this.animateBgChange.emit(this.animateBg);
  }

  updateOnlineSetting() {
    this.onlineChange.emit(this.online);
  }
}

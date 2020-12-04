import { Component, Input, OnInit } from '@angular/core';
import { Champion } from '../../interfaces/Champion';

@Component({
  selector: 'app-champion-card',
  templateUrl: './champion-card.component.html',
  styleUrls: ['./champion-card.component.css']
})
export class ChampionCardComponent implements OnInit {

  constructor() { }

  @Input() champion: Champion;
  @Input() goldDiff: number;
  @Input() isActivePlayerTeam: boolean;

  ngOnInit(): void {
  }
}

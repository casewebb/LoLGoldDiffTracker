import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Datum } from '../../interfaces/LeagueInterfaces';

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.css']
})
export class ItemSearchComponent implements OnInit {

  @Input() allItems: Array<Datum>;
  @Input() currentLeagueVersion: string;

  searchItem = new FormControl('');
  searchItemName: string;
  searchItemImage: string;
  searchItemCost: string;
  searchItemDescription: string;

  constructor() { }

  ngOnInit(): void {
  }

  //Searching method for example on how to access specific item data
  search() {
    this.searchItemName = this.allItems.filter(item => item.name == this.searchItem.value)[0].name.toString();
    this.searchItemImage = `http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/item/${this.allItems.filter(item => item.name == this.searchItem.value)[0].image.full}`;
    this.searchItemCost = this.allItems.filter(item => item.name == this.searchItem.value)[0].gold.total.toString();
    this.searchItemDescription = this.allItems.filter(item => item.name == this.searchItem.value)[0].plaintext.toString();
  }

}

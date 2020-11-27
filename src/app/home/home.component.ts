import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { Champion } from '../interfaces/Champion';
import { Image, Datum, Game } from '../interfaces/LeagueInterfaces';
import { LeagueApiServiceService } from '../services/league-api-service.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public constructor(private leagueService: LeagueApiServiceService) { }

  //Time in milliseconds that the item list updates
  private REFRESH_TIME = 3000;

  //FOR REAL GAME VS TESTING JSON
  //IF IN A REAL GAME SET TO FALSE
  private OFFLINE = true;

  allChampions: Array<Champion>;
  apiWorking = false;

  currentLeagueVersion: string;
  allItems: Array<Datum>;
  currentGameData: Game;

  searchItem = new FormControl('');
  searchItemName: string;
  searchItemImage: string;
  searchItemCost: string;
  searchItemDescription: string;

  async ngOnInit() {
    await this.leagueService.getLatestGameVersion().toPromise().then(versions => {
      this.currentLeagueVersion = versions[0];
    })

    //Retrieve all of the latest Item info for the latest league patch and add to global array
    this.leagueService.getAllItemInfoForVersion(this.currentLeagueVersion).subscribe(data => {
      let itemArr = new Array<Datum>();
      Object.keys(data.data).forEach(key => (
        itemArr.push(data.data[key])
      ));

      this.allItems = itemArr;
    })

    //Update the UI every 15 seconds with latest items
    //if valid champion is searched for (Only works in real game obviously)
    interval(this.REFRESH_TIME).subscribe((val) => {
      try {
        this.buildAllChamps();
        this.apiWorking = true;
      } catch (err) {
        console.log("Unable to load data")
        this.apiWorking = false;
      }
    })
  }


  //Searching method for example on how to access specific item data
  search() {
    this.searchItemName = this.allItems.filter(item => item.name == this.searchItem.value)[0].name.toString();
    this.searchItemImage = `http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/item/${this.allItems.filter(item => item.name == this.searchItem.value)[0].image.full}`;
    this.searchItemCost = this.allItems.filter(item => item.name == this.searchItem.value)[0].gold.total.toString();
    this.searchItemDescription = this.allItems.filter(item => item.name == this.searchItem.value)[0].plaintext.toString();
  }

  //Build array of all champ items/gold value
  buildAllChamps() {
    if (this.OFFLINE) {
      this.leagueService.getTestGameData().subscribe(data => {
        this.currentGameData = data;
      })
    } else {
      this.leagueService.getGameData().subscribe(data => {
        this.currentGameData = data;
      })
    }

    this.allChampions = new Array<Champion>();
    for (var player of this.currentGameData.allPlayers) {
      var champion = new Champion();
      champion.champImageUrl = `http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/champion/${player.rawChampionName.replace('game_character_displayname_', '')}.png`;

      let totalGold = 0;
      let itemImgArray = new Array<string>();

      for (var item of player.items) {
        totalGold += this.getItemCost(item.displayName);
        itemImgArray.push(`http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/item/${item.itemID}.png`)
      }

      champion.itemImageUrlArr = itemImgArray;
      champion.totalGoldVal = totalGold.toString();

      this.allChampions.push(champion);
    }
  }

  //Reference full item list to find the price of an Item
  getItemCost(itemName: string) {
    return this.allItems.filter(item => item.name == itemName)[0].gold.total;
  }
}

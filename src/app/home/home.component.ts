import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Image,Datum, Game } from '../interfaces/LeagueInterfaces';
import { LeagueApiServiceService } from '../services/league-api-service.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public constructor(private leagueService: LeagueApiServiceService) { }

  currentLeagueVersion: string;
  currentGold: number;
  allItems: Array<Datum>;
  currentGameData: Game;

  searchItem = new FormControl('');
  searchItemName: string;
  searchItemImage: string;
  searchItemCost: string;
  searchItemDescription: string;
  searchChamp = new FormControl('');
  champTotalGold: string;
  champImageUrl: string;
  itemImageArr: Array<string>;

  async ngOnInit() {
    await this.leagueService.getLatestGameVersion().toPromise().then(versions => {
      this.currentLeagueVersion = versions[0];
    })

    //Example grabbing data from (TestJson.json in assets folder)
    //Will be switched to grab LIVE data during the game.
    this.leagueService.getGameData().subscribe(data => {
      this.currentGold = data.activePlayer.currentGold;
      this.currentGameData = data;
    })

    //Retrieve all of the latest Item info for the latest league patch and add to global array
    this.leagueService.getAllItemInfoForVersion(this.currentLeagueVersion).subscribe(data => {

      let itemArr = new Array<Datum>();
      Object.keys(data.data).forEach(key => (
        itemArr.push(data.data[key])
      ));

      this.allItems = itemArr;
    })
  }


  //Searching method for example on how to access specific item data
  search() {
    this.searchItemName = this.allItems.filter(item => item.name == this.searchItem.value)[0].name.toString();
    this.searchItemImage = `http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/item/${this.allItems.filter(item => item.name == this.searchItem.value)[0].image.full}`;
    this.searchItemCost = this.allItems.filter(item => item.name == this.searchItem.value)[0].gold.total.toString();
    this.searchItemDescription = this.allItems.filter(item => item.name == this.searchItem.value)[0].plaintext.toString();
  }
 
  setItemVal() {
    this.searchItemCost = this.allItems.filter(item => item.name == this.searchItem.value)[0].gold.total.toString();
  }

  setChampGoldVal() {
    this.champImageUrl = `http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/champion/${this.searchChamp.value}.png`;
    this.getChampionsTotalGold(this.searchChamp.value);
  }

  getItemCost(itemName: string) {
    return this.allItems.filter(item => item.name == itemName)[0].gold.total;
  }

  getChampionsTotalGold(champName: string) {
    let totalGold = 0;
    let champItems = this.currentGameData.allPlayers.filter(player => player.championName == champName)[0].items;
    let itemImgArray = new Array<string>();
    
    for (var item of champItems) {
      totalGold += this.getItemCost(item.displayName);
      itemImgArray.push(`http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/item/${item.itemID}.png`)
    }
    this.champTotalGold = totalGold.toString();
    this.itemImageArr = itemImgArray;
  }

}

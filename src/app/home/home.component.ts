import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
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
  private REFRESH_TIME = 15000;

  //FOR REAL GAME VS TESTING JSON
  //IF IN A REAL GAME SET TO FALSE
  private OFFLINE = true;

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

    //Retrieve all of the latest Item info for the latest league patch and add to global array
    this.leagueService.getAllItemInfoForVersion(this.currentLeagueVersion).subscribe(data => {
      let itemArr = new Array<Datum>();
      Object.keys(data.data).forEach(key => (
        itemArr.push(data.data[key])
      ));

      this.allItems = itemArr;
    })

    if (this.OFFLINE) {
      this.leagueService.getTestGameData().subscribe(data => {
        this.currentGameData = data;
      })
    } else {
      this.leagueService.getGameData().subscribe(data => {
        this.currentGameData = data;
      })
    }

    //Update the UI every 15 seconds with latest items
    //if valid champion is searched for (Only works in real game obviously)
    interval(this.REFRESH_TIME).subscribe((val) => {
      console.log("Refreshing page")
      try {
        this.getChampionsTotalGold(this.searchChamp.value);
      } catch (err) {
        console.log("Invalid Champion Name")
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

  //What happens when champion search button is hit
  setChampGoldVal() {
    this.champImageUrl = `http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/champion/${this.searchChamp.value}.png`;
    this.getChampionsTotalGold(this.searchChamp.value);
  }

  //Reference full item list to find the price of an Item
  getItemCost(itemName: string) {
    return this.allItems.filter(item => item.name == itemName)[0].gold.total;
  }

  //Calculates total gold of a champions owned items
  //and adds images of those items to array
  getChampionsTotalGold(champName: string) {
    if (this.OFFLINE) {
      this.leagueService.getTestGameData().subscribe(data => {
        this.currentGold = data.activePlayer.currentGold;
        this.currentGameData = data;
      })
    } else {
      this.leagueService.getGameData().subscribe(data => {
        this.currentGold = data.activePlayer.currentGold;
        this.currentGameData = data;
      })
    }

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

import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ItemData, Datum, Image } from '../interfaces/LeagueInterfaces';
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

  searchItem = new FormControl('');
  searchItemName: string;
  searchItemImage: Image;
  searchItemCost: string;
  searchItemDescription: string;

  async ngOnInit() {
    await this.leagueService.getLatestGameVersion().toPromise().then(versions => {
      this.currentLeagueVersion = versions[0];
    })

    //Example grabbing data from (TestJson.json in assets folder)
    //Will be switched to grab LIVE data during the game.
    this.leagueService.getTestGameData().subscribe(data => {
      this.currentGold = data.activePlayer.currentGold;
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
    this.searchItemImage = this.allItems.filter(item => item.name == this.searchItem.value)[0].image;
    this.searchItemCost = this.allItems.filter(item => item.name == this.searchItem.value)[0].gold.total.toString();
    this.searchItemDescription = this.allItems.filter(item => item.name == this.searchItem.value)[0].plaintext.toString();

 
  }

}

import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { interval, throwError } from 'rxjs';
import { Champion } from '../interfaces/Champion';
import { Datum, Game, Player } from '../interfaces/LeagueInterfaces';
import { LeagueApiServiceService } from '../services/league-api-service.service'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public constructor(private leagueService: LeagueApiServiceService, private notifyService: ToastrService) { }

  //Time in milliseconds that the item list updates
  private REFRESH_TIME = 3000;

  //FOR REAL GAME VS TESTING JSON
  //IF IN A REAL GAME SET TO true
  private ONLINE = false;

  private alertItems = ["Perfectly Timed Stopwatch", "Commencing Stopwatch", "Stopwatch", "Zhonya's Hourglass", "Trinity Force"]
  private supportItemEvolved = ["Frostfang", "Runesteel Spaulders", "Targon's Buckler", "Harrowing Crescent"]
  alertsSent = [];

  redTeamChamps: Array<Champion>;
  blueTeamChamps: Array<Champion>;
  goldDiffArr: number[];
  apiWorking = false;

  currentLeagueVersion: string;
  allItems: Array<Datum>;
  currentGameData: Game;
  activePlayer: Champion;

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
      } catch (err) {
        console.log('Unable connect to League Client');
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
    if (!this.ONLINE) {
      this.leagueService.getTestGameData().subscribe(data => {
        this.currentGameData = data;
        this.apiWorking = true;
      })
    } else {
      this.leagueService.getGameData().subscribe((data) => {
        this.currentGameData = data;
        this.apiWorking = true;
      }, (error) => {
        this.apiWorking = false;
        this.redTeamChamps = null;
        this.blueTeamChamps = null;
        this.currentGameData = null;
        return;
      })
    }

    if (!this.blueTeamChamps || this.blueTeamChamps.length < 1) {
      this.redTeamChamps = new Array<Champion>();
      this.blueTeamChamps = new Array<Champion>();
      for (var player of this.currentGameData.allPlayers) {
        var champion = new Champion();
        champion.role = player.position;
        champion.summonerName = player.summonerName;
        champion.champImageUrl = `http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/champion/${player.rawChampionName.replace('game_character_displayname_', '')}.png`;
        if (player.summonerName == this.currentGameData.activePlayer.summonerName) {
          champion.isActivePlayer = true;
        }

        if (player.team == "ORDER") {
          champion.team = "ORDER";
          if (champion.isActivePlayer)
            this.activePlayer = champion;
          this.blueTeamChamps.push(champion);
        } else {
          champion.team = "CHAOS";
          if (champion.isActivePlayer)
            this.activePlayer = champion;
          this.redTeamChamps.push(champion);
        }
      }
    }

    for (var player of this.currentGameData.allPlayers) {
      if (player.team == "ORDER") {
        this.setTeamData(this.blueTeamChamps, player);
      } else {
        this.setTeamData(this.redTeamChamps, player);
      }
    }
    this.getGoldDifferencePerLane();
  }

  //Reference full item list to find the price of an Item
  getItemCost(itemName: string) {
    return this.allItems.filter(item => item.name == itemName)[0].gold.total;
  }

  drop(event: CdkDragDrop<Array<Champion>>, champArray: Array<Champion>) {
    moveItemInArray(champArray, event.previousIndex, event.currentIndex);
  }

  setTeamData(list: Array<Champion>, player: Player) {
    var index = list.findIndex(c => c.summonerName == player.summonerName)
    let totalGold = 0;
    let itemImgArray = new Array<string>();

    for (var item of player.items) {
      if (this.alertItems.includes(item.displayName)
        && !this.alertsSent.includes(player.championName + "_" + item.displayName)
        && player.summonerName != this.currentGameData.activePlayer.summonerName
        && player.team != this.activePlayer.team) {
        this.notifyService.warning(player.championName + ' purchased ' + item.displayName + ".");
        this.alertsSent.push(player.championName + "_" + item.displayName);
      }

      if (this.supportItemEvolved.includes(item.displayName)
        && !this.alertsSent.includes(player.championName + "_" + item.displayName)
        && player.team == this.activePlayer.team) {
        this.notifyService.info(player.championName + ' upgraded their support item. Consider switching trinkets.');
        this.alertsSent.push(player.championName + "_" + item.displayName);
      }
      totalGold += this.getItemCost(item.displayName);
      itemImgArray.push(`http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/item/${item.itemID}.png`)
    }

    list[index].itemImageUrlArr = itemImgArray;
    list[index].totalGoldVal = totalGold.toString();
  }

  getGoldDifferencePerLane() {
    var myTeamArr = this.activePlayer.team == "ORDER" ? this.blueTeamChamps : this.redTeamChamps;
    var enemyTeamArr = this.activePlayer.team != "ORDER" ? this.blueTeamChamps : this.redTeamChamps;
    this.goldDiffArr = [];
    for (var champ of myTeamArr) {
      var index = myTeamArr.indexOf(champ);
      this.goldDiffArr[index] = +champ.totalGoldVal - +enemyTeamArr[index].totalGoldVal;
    }
    this.goldDiffArr.push(this.goldDiffArr.reduce(function(a,b) {
        return a + b;
    }, 0));
  }

}

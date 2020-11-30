import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { interval } from 'rxjs';
import { Champion } from '../interfaces/Champion';
import { ActiveItemData, Datum, Game, Player } from '../interfaces/LeagueInterfaces';
import { LeagueApiServiceService } from '../services/league-api-service.service'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {

  public constructor(private leagueService: LeagueApiServiceService, private notifyService: ToastrService) { }

  private REFRESH_TIME = 3000;
  ONLINE = false;

  alertsSent = [];
  redTeamChamps: Array<Champion>;
  blueTeamChamps: Array<Champion>;
  goldDiffArr: number[];
  apiWorking = false;

  currentLeagueVersion: string;
  allItems: Array<Datum>;
  currentGameData: Game;
  activePlayer: Champion;

  async ngOnInit() {
    this.retrieveStaticLeagueInformation();

    //Update the UI every 15 seconds with latest items
    interval(this.REFRESH_TIME).subscribe(() => {
      try {
        this.updateGameData();
        this.buildAllChamps();
      } catch (err) {
        console.log('Unable connect to League Client');
      }
    })
  }

  //Retrieve all of the latest League of Legends information
  async retrieveStaticLeagueInformation() {
    await this.leagueService.getLatestGameVersion().toPromise().then(versions => {
      this.currentLeagueVersion = versions[0];
    })

    this.leagueService.getAllItemInfoForVersion(this.currentLeagueVersion).subscribe(data => {
      let itemArr = new Array<Datum>();
      Object.keys(data.data).forEach(key => (
        itemArr.push(data.data[key])
      ));

      this.allItems = itemArr;
    })
  }

  /**
   * Retrieve latest game data from 
   * League Client
   */
  updateGameData() {
    if (!this.ONLINE) {
      this.leagueService.getTestGameData().subscribe(data => {
        this.currentGameData = data;
        this.apiWorking = true;
      }, () => {
        this.reset();
        return;
      })
    } else {
      this.leagueService.getGameData().subscribe((data) => {
        this.currentGameData = data;
        this.apiWorking = true;
      }, () => {
        this.reset();
        return;
      })
    }
  }

  /**
   * Initialize/Update champion data lists
   */
  buildAllChamps() {
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

  /**
   * Retrieve an items cost by 
   * comparison with global DataDragon list
   * @param itemName 
   */
  getItemCost(itemName: string) {
    return this.allItems.filter(item => item.name == itemName)[0].gold.total;
  }

  /**
   * Drag and drop logic for champion lists
   * @param event 
   * @param champArray 
   */
  drop(event: CdkDragDrop<Array<Champion>>, champArray: Array<Champion>) {
    moveItemInArray(champArray, event.previousIndex, event.currentIndex);
    this.getGoldDifferencePerLane();
  }


  /**
   * Set each team members total gold and item list
   * Also triggers and applicable alerts for found items
   * 
   * @param list 
   * @param player 
   */
  setTeamData(list: Array<Champion>, player: Player) {
    var index = list.findIndex(c => c.summonerName == player.summonerName)
    let totalGold = 0;
    let itemImgArray = new Array<string>();

    for (var item of player.items) {
      this.checkForItemAlertsToSend(item, player);
      totalGold += this.getItemCost(item.displayName);
      itemImgArray.push(`http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/item/${item.itemID}.png`)
    }

    list[index].itemImageUrlArr = itemImgArray;
    list[index].totalGoldVal = totalGold.toString();
  }

  checkForItemAlertsToSend(item: ActiveItemData, player: Player) {
    //Enemy purchased alert worth item
    var alertItems = ["Perfectly Timed Stopwatch", "Commencing Stopwatch", "Stopwatch", "Zhonya's Hourglass"];
    if (alertItems.includes(item.displayName)
      && !this.alertsSent.includes(player.championName + "_" + item.displayName)
      && player.summonerName != this.currentGameData.activePlayer.summonerName
      && player.team != this.activePlayer.team) {
      this.notifyService.warning(player.championName + ' purchased ' + item.displayName + ".");
      this.alertsSent.push(player.championName + "_" + item.displayName);
    }

    //Support finished item evolution
    var supportItemEvolved = ["Frostfang", "Runesteel Spaulders", "Targon's Buckler", "Harrowing Crescent"];
    if (supportItemEvolved.includes(item.displayName)
      && !this.alertsSent.includes(player.championName + "_" + item.displayName)
      && player.team == this.activePlayer.team) {
      this.notifyService.info(player.championName + ' upgraded their support item. Consider switching trinkets.');
      this.alertsSent.push(player.championName + "_" + item.displayName);
    }
  }

  /**
   * Calculation of gold differences for each lane and total
   * respective to active players team
   */
  getGoldDifferencePerLane() {
    var myTeamArr = this.activePlayer.team == "ORDER" ? this.blueTeamChamps : this.redTeamChamps;
    var enemyTeamArr = this.activePlayer.team != "ORDER" ? this.blueTeamChamps : this.redTeamChamps;
    this.goldDiffArr = [];
    for (var champ of myTeamArr) {
      var index = myTeamArr.indexOf(champ);
      this.goldDiffArr[index] = +champ.totalGoldVal - +enemyTeamArr[index].totalGoldVal;
    }
    this.goldDiffArr.push(this.goldDiffArr.reduce(function (a, b) {
      return a + b;
    }, 0));
  }

  reset() {
    this.apiWorking = false;
    this.redTeamChamps = null;
    this.blueTeamChamps = null;
    this.currentGameData = null;
    this.goldDiffArr = null;
    this.alertsSent = [];
  }

}

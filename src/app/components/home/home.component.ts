import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { interval } from 'rxjs';
import { Champion } from '../../interfaces/Champion';
import { ActiveItemData, ChampData, Datum, Game, Player } from '../../interfaces/LeagueInterfaces';
import { LeagueApiServiceService } from '../../services/league-api-service.service'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  public constructor(private leagueService: LeagueApiServiceService,
    private notifyService: ToastrService) { }

  @ViewChild('videoPlayer') videoplayer: ElementRef;

  private REFRESH_TIME = 3000;
  online = true;
  animateBg = true;

  alertsSent = [];
  redTeamChamps: Array<Champion>;
  blueTeamChamps: Array<Champion>;
  goldDiffArr: number[];
  apiWorking = false;
  backgroundVid: string;
  currentLeagueVersion: string;
  allItems: Array<Datum>;
  allChampArr: Array<ChampData>;
  currentGameData: Game;
  activePlayer: Champion;

  alertItems = ["Perfectly Timed Stopwatch", "Stopwatch", "Zhonya's Hourglass"];
  alertChamps = ["Shen", "Pantheon", "Nocturne", "Gangplank", "Galio",
    "Karthus", "Twisted Fate", "Fiddlesticks", "Tahm Kench"];

  /**
   * ngOnInit is a default Angular call - when this Component is called upon
   * this will run automatically.
   * 
   * I have put things here like finding the latest Leage of Legends version 
   * and gathering all of the data about items.
   */
  async ngOnInit() {
    this.setBackgroundVideo();
    this.retrieveStaticLeagueInformation();

    //Update the UI every 15 seconds with latest items
    interval(this.REFRESH_TIME).subscribe(() => {
      try {
        this.handleBackgroundAutoplay();
        this.updateGameData();
        this.buildAllChamps();
      } catch (err) {
        console.log('Unable connect to League Client');
      }
    })
  }

  //Retrieve all of the latest League of Legends informationF
  async retrieveStaticLeagueInformation() {
    await this.leagueService.getLatestGameVersion().toPromise().then(versions => {
      this.currentLeagueVersion = versions[0];
    })

    this.leagueService.getAllItemInfoForVersion(this.currentLeagueVersion).subscribe(data => {
      let itemArr = new Array<Datum>();
      Object.keys(data.data).forEach(key => {
        itemArr.push(data.data[key]);
      });
      itemArr.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
      this.allItems = itemArr;
    });

    this.leagueService.getAllChampionInfoForVersion(this.currentLeagueVersion).subscribe(data => {
      let champArr = new Array<ChampData>();
      Object.keys(data.data).forEach(key => {
        champArr.push(data.data[key]);
      });
      this.allChampArr = champArr;
    });
  }

  /**
   * Retrieve latest game data from 
   * League Client active game
   */
  updateGameData() {
    if (!this.online) {
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
        champion.championName = player.championName;
        champion.champImageUrl = `http://ddragon.leagueoflegends.com/cdn/${this.currentLeagueVersion}/img/champion/${player.rawChampionName.replace('game_character_displayname_', '')}.png`;
        if (champion.champImageUrl.includes("FiddleSticks")) {
          champion.champImageUrl = champion.champImageUrl.replace("FiddleSticks", "Fiddlesticks"); //Custom logic because of name coming back when someone is playing fiddlesticks..
        }
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
   * Also triggers applicable alerts for found items
   * 
   * @param list 
   * @param player 
   */
  setTeamData(list: Array<Champion>, player: Player) {
    this.checkForChampLv6Alerts(player);
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
    //Enemy purchased alert worthy item
    if (this.alertItems.includes(item.displayName)
      && !this.alertsSent.includes(player.championName + "_" + item.displayName)
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

  checkForChampLv6Alerts(player: Player) {
    if (this.alertChamps.includes(player.championName)
      && !this.alertsSent.includes(player.championName + "_lvl6")
      && player.team != this.activePlayer.team
      && player.level >= 6) {
      this.notifyService.warning(player.championName + ' reached Level 6.');
      this.alertsSent.push(player.championName + "_lvl6");
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
    //This is hackyy and probably not optimal lol
    //I'm adding the total and absolute value of the total at the end of the
    this.goldDiffArr.push(this.goldDiffArr.reduce(function (a, b) {
      return a + b;
    }, 0));
    this.goldDiffArr.push(Math.abs(this.goldDiffArr[5]))
  }

  //If using this for more than 1 game, 
  //reset everything important
  reset() {
    this.apiWorking = false;
    this.redTeamChamps = null;
    this.blueTeamChamps = null;
    this.currentGameData = null;
    this.goldDiffArr = null;
    this.alertsSent = [];
  }

  //Picking a random background
  setBackgroundVideo() {
    const vids = ["animated-bilgewater", "animated-freljord",
      "animated-ionia", "animated-mount-targon", "animated-noxus", "animated-piltover",
      "harrowing-2014-loop", "animated-shurima", "shurimacrest-loop-with-shurimacrest-intro", "animated-void", "animated-zaun"];

    const random = Math.floor(Math.random() * vids.length);
    this.backgroundVid = vids[random];
  }

  handleBackgroundAutoplay() {
    var video: HTMLVideoElement = this.videoplayer.nativeElement;
    if (video.paused && this.animateBg) {
      video.muted;
      video.play();
    }
    if (!this.animateBg) {
      video.pause();
    }
  }
}

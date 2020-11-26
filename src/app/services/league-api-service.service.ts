import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, Subject, throwError, timer } from 'rxjs';
import { catchError, map, retry, share, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Game, ItemData } from '../interfaces/LeagueInterfaces'

const inGameUrl = "https://127.0.0.1:2999/liveclientdata/allgamedata";
const versionsUrl = "https://ddragon.leagueoflegends.com/api/versions.json";
const itemUrl = (version) => `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`

@Injectable({
  providedIn: 'root'
})

export class LeagueApiServiceService implements OnDestroy {

  private stopPolling = new Subject();
  private REFRESH_TIME = 15000; //Milliseconds

  constructor(private http: HttpClient) { }

  //Retrieves all data from inGameUrl response
  getGameData(): Observable<Game> {
    return timer(1, 3000).pipe(switchMap(() => this.http.get<Game>(inGameUrl)
      .pipe(catchError(this.errorHandler))),
      retry(),
      share(),
      takeUntil(this.stopPolling));
  }

  //Test method COPY of the method above so that we don't have to be in 
  //an actual game to get values to play with
  getTestGameData(): Observable<Game> {
      return timer(1, 3000).pipe(switchMap(() => this.http.get<Game>('../assets/TestJson.json')
      .pipe(catchError(this.errorHandler))),
      retry(),
      share(),
      takeUntil(this.stopPolling));
  }

  getLatestGameVersion(): Observable<any> {
    return this.http.get<any>(versionsUrl)
      .pipe(catchError(this.errorHandler));
  }

  getAllItemInfoForVersion(version: string): Observable<ItemData> {
    return this.http.get<ItemData>(itemUrl(version))
      .pipe(catchError(this.errorHandler));
  }

  errorHandler(error: HttpErrorResponse) {
    return throwError(error.message || "API error.");
  }

  ngOnDestroy() {
    this.stopPolling.next();
  }
}

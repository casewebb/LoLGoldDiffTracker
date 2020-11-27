import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Game, ItemData } from '../interfaces/LeagueInterfaces'

const inGameUrl = "/liveclientdata/allgamedata";
const versionsUrl = "https://ddragon.leagueoflegends.com/api/versions.json";
const itemUrl = (version) => `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`

@Injectable({
  providedIn: 'root'
})

export class LeagueApiServiceService {


  constructor(private http: HttpClient) { }
  getGameData(): Observable<Game> {
    return this.http.get<Game>(inGameUrl)
      .pipe(catchError(this.errorHandler));
  }

  getTestGameData(): Observable<Game> {
    return this.http.get<Game>('../assets/TestJson.json')
      .pipe(catchError(this.errorHandler));
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

}

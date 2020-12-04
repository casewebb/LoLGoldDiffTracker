/**
 * This is a class I have created that contains the information
 * I want to keep organized for each Champion in the game
 */

export class Champion {
    championName: string;
    summonerName: string;
    champImageUrl: string;
    totalGoldVal: string;
    team: string;
    role: string;
    isActivePlayer: boolean;
    itemImageUrlArr: Array<string>;
}
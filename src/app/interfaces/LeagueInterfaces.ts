/**
 * All interfaces being returned from the League Client API
 * These allow us to access the values by name easily instead of
 * as String Keys
 */

 //Game Related Interfaces Below
export interface Game {
    activePlayer: ActivePlayer;
    allPlayers:   AllPlayer[];
    events:       Events;
    gameData:     GameData;
}

export interface ActivePlayer {
    abilities:     Abilities;
    championStats: ChampionStats;
    currentGold:   number;
    fullRunes:     FullRunes;
    level:         number;
    summonerName:  string;
}

export interface Abilities {
    E:       AbilityInfo;
    Passive: AbilityInfo;
    Q:       AbilityInfo;
    R:       AbilityInfo;
    W:       AbilityInfo;
}

export interface AbilityInfo {
    abilityLevel?:  number;
    displayName:    string;
    id?:            string;
    rawDescription: string;
    rawDisplayName: string;
}

export interface ChampionStats {
    abilityPower:                 number;
    armor:                        number;
    armorPenetrationFlat:         number;
    armorPenetrationPercent:      number;
    attackDamage:                 number;
    attackRange:                  number;
    attackSpeed:                  number;
    bonusArmorPenetrationPercent: number;
    bonusMagicPenetrationPercent: number;
    cooldownReduction:            number;
    critChance:                   number;
    critDamage:                   number;
    currentHealth:                number;
    healthRegenRate:              number;
    lifeSteal:                    number;
    magicLethality:               number;
    magicPenetrationFlat:         number;
    magicPenetrationPercent:      number;
    magicResist:                  number;
    maxHealth:                    number;
    moveSpeed:                    number;
    physicalLethality:            number;
    resourceMax:                  number;
    resourceRegenRate:            number;
    resourceType:                 string;
    resourceValue:                number;
    spellVamp:                    number;
    tenacity:                     number;
}

export interface FullRunes {
    generalRunes:      Keystone[];
    keystone:          Keystone;
    primaryRuneTree:   Keystone;
    secondaryRuneTree: Keystone;
    statRunes:         StatRune[];
}

export interface Keystone {
    displayName:    string;
    id:             number;
    rawDescription: string;
    rawDisplayName: string;
}

export interface StatRune {
    id:             number;
    rawDescription: string;
}

export interface AllPlayer {
    championName:    string;
    isBot:           boolean;
    isDead:          boolean;
    items:           ItemData[];
    level:           number;
    position:        string;
    rawChampionName: string;
    respawnTimer:    number;
    runes:           Runes;
    scores:          Scores;
    skinID:          number;
    summonerName:    string;
    summonerSpells:  SummonerSpells;
    team:            string;
}

export interface ItemData {
    canUse:         boolean;
    consumable:     boolean;
    count:          number;
    displayName:    string;
    itemID:         number;
    price:          number;
    rawDescription: string;
    rawDisplayName: string;
    slot:           number;
}

export interface Runes {
    keystone:          Keystone;
    primaryRuneTree:   Keystone;
    secondaryRuneTree: Keystone;
}

export interface Scores {
    assists:    number;
    creepScore: number;
    deaths:     number;
    kills:      number;
    wardScore:  number;
}

export interface SummonerSpells {
    summonerSpellOne: AbilityInfo;
    summonerSpellTwo: AbilityInfo;
}

export interface Events {
    Events: Event[];
}

export interface Event {
    EventID:       number;
    EventName:     string;
    EventTime:     number;
    Assisters?:    string[];
    KillerName?:   string;
    VictimName?:   string;
    Recipient?:    string;
    TurretKilled?: string;
    InhibKilled?:  string;
    KillStreak?:   number;
    Acer?:         string;
    AcingTeam?:    string;
}

export interface GameData {
    gameMode:   string;
    gameTime:   number;
    mapName:    string;
    mapNumber:  number;
    mapTerrain: string;
}


//Item Related Interfaces Below

export interface ItemData {
    type:    Type;
    version: string;
    basic:   Basic;
    data:    { [key: string]: Datum };
    groups:  Group[];
    tree:    Tree[];
}

export interface Basic {
    name:             string;
    rune:             Rune;
    gold:             Gold;
    group:            string;
    description:      string;
    colloq:           string;
    plaintext:        string;
    consumed:         boolean;
    stacks:           number;
    depth:            number;
    consumeOnFull:    boolean;
    from:             any[];
    into:             any[];
    specialRecipe:    number;
    inStore:          boolean;
    hideFromAll:      boolean;
    requiredChampion: string;
    requiredAlly:     string;
    stats:            { [key: string]: number };
    tags:             any[];
    maps:             { [key: string]: boolean };
}

export interface Gold {
    base:        number;
    total:       number;
    sell:        number;
    purchasable: boolean;
}

export interface Rune {
    isrune: boolean;
    tier:   number;
    type:   string;
}

export interface Datum {
    name:              string;
    description:       string;
    colloq:            string;
    plaintext:         string;
    into?:             string[];
    image:             Image;
    gold:              Gold;
    tags:              string[];
    maps:              { [key: string]: boolean };
    stats:             { [key: string]: number };
    inStore?:          boolean;
    from?:             string[];
    effect?:           Effect;
    depth?:            number;
    stacks?:           number;
    consumed?:         boolean;
    hideFromAll?:      boolean;
    consumeOnFull?:    boolean;
    requiredChampion?: string;
    specialRecipe?:    number;
}

export interface Effect {
    Effect1Amount:   string;
    Effect2Amount?:  string;
    Effect3Amount?:  string;
    Effect4Amount?:  string;
    Effect5Amount?:  string;
    Effect6Amount?:  string;
    Effect7Amount?:  string;
    Effect8Amount?:  string;
    Effect9Amount?:  string;
    Effect10Amount?: string;
    Effect11Amount?: string;
    Effect12Amount?: string;
    Effect13Amount?: string;
    Effect14Amount?: string;
    Effect15Amount?: string;
    Effect16Amount?: string;
    Effect17Amount?: string;
    Effect18Amount?: string;
}

export interface Image {
    full:   string;
    sprite: string;
    group:  Type;
    x:      number;
    y:      number;
    w:      number;
    h:      number;
}

export enum Type {
    Item = "item",
}

export interface Group {
    id:              string;
    MaxGroupOwnable: string;
}

export interface Tree {
    header: string;
    tags:   string[];
}

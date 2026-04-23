// British Gypsum product catalogue — editable defaults for metals, boards, finishes.
// Prices are UK trade indicative; users can override them inline in the takeoff.

export type StudSize = "48S" | "60S" | "70S" | "92S" | "146S";
export type BoardType = "standard" | "mr" | "fireline" | "soundbloc";
export type Finish = "paint" | "skim" | "tile" | "none";

export interface StudSpec {
  name: string;
  track_name: string;
  partition_label: string;
  stud_price: number;
  track_price: number;
}

export interface BoardSpec {
  name: string;
  tagline: string;
  price: number;
}

export interface FinishSpec {
  label: string;
  tagline: string;
  uses_tape: boolean;
  uses_easifill: boolean;
}

export const STUDS: Record<StudSize, StudSpec> = {
  "48S": {
    name: "Gypframe 48 S 50 'C' Stud",
    track_name: "Gypframe 50 FEC 50 Channel",
    partition_label: "up to 3.6 m — domestic, light duty",
    stud_price: 3.20,
    track_price: 4.80,
  },
  "60S": {
    name: "Gypframe 60 S 50 'C' Stud",
    track_name: "Gypframe 62 FEC 50 Channel",
    partition_label: "up to 4.0 m — domestic +",
    stud_price: 3.80,
    track_price: 5.40,
  },
  "70S": {
    name: "Gypframe 70 S 50 'C' Stud",
    track_name: "Gypframe 72 FEC 50 Channel",
    partition_label: "up to 4.5 m — standard trade",
    stud_price: 4.20,
    track_price: 5.90,
  },
  "92S": {
    name: "Gypframe 92 S 50 'C' Stud",
    track_name: "Gypframe 94 FEC 50 Channel",
    partition_label: "up to 5.4 m — commercial / offices",
    stud_price: 5.40,
    track_price: 6.70,
  },
  "146S": {
    name: "Gypframe 146 S 50 'C' Stud",
    track_name: "Gypframe 148 FEC 50 Channel",
    partition_label: "up to 8.0 m — high-bay / commercial",
    stud_price: 7.60,
    track_price: 9.30,
  },
};

export const BOARDS: Record<BoardType, BoardSpec> = {
  standard: {
    name: "Gyproc WallBoard 12.5 mm",
    tagline: "Bedrooms, living rooms, offices",
    price: 9.50,
  },
  mr: {
    name: "Gyproc Moisture Resistant 12.5 mm",
    tagline: "Bathrooms, kitchens, utility rooms",
    price: 13.40,
  },
  fireline: {
    name: "Gyproc FireLine 12.5 mm",
    tagline: "Fire-rated partitions & riser ducts",
    price: 14.80,
  },
  soundbloc: {
    name: "Gyproc SoundBloc 12.5 mm",
    tagline: "Acoustic walls — party, hotels, schools",
    price: 18.60,
  },
};

export const FINISHES: Record<Finish, FinishSpec> = {
  paint: {
    label: "Paint",
    tagline: "Tape + EasiFill joints, then paint",
    uses_tape: true,
    uses_easifill: true,
  },
  skim: {
    label: "Skim",
    tagline: "Taped joints under a full plaster skim",
    uses_tape: true,
    uses_easifill: false,
  },
  tile: {
    label: "Tile",
    tagline: "Boards tiled directly — no jointing",
    uses_tape: false,
    uses_easifill: false,
  },
  none: {
    label: "Bare",
    tagline: "Riser / service wall — no finish applied",
    uses_tape: false,
    uses_easifill: false,
  },
};

export const STUD_ORDER: StudSize[] = ["48S", "60S", "70S", "92S", "146S"];
export const BOARD_ORDER: BoardType[] = ["standard", "mr", "fireline", "soundbloc"];
export const FINISH_ORDER: Finish[] = ["paint", "skim", "tile", "none"];

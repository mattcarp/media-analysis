export interface Gracenote {
  ALBUM: {
    ARTIST: string;
    TITLE: string;
    PKG_LANG: string;
    DATE: string;
    GENRE: {
      __text: string;
    };
    TRACK_COUNT: number;
    TRACK: {
      TRACK_NUM: string;
      TITLE: string;
    }[];
    URL: string;
  };
}

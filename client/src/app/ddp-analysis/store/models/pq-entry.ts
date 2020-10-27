export interface PqEntry {
  spv: string;
  trk: string;
  idx: string;
  hrs: string;
  min: string;
  sec: string;
  frm: string;
  cb1: string;
  cb2: string;
  isrc: string;
  upc: string;
  txt: string;
  preGap: number; // not in spec
  dur: string; // not in spec - a timecode string
}

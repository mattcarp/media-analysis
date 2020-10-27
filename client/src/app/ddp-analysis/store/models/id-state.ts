export interface IdState {
  fileId: string;
  fileName: string;
  fileSize: number;
  // last mod is not always available
  lastModified?: Date;
  // below are part of spec
  ddpid: string;
  upc: string;
  mss: string;
  msl: string; // reserved in spec level 2.00
  med: string;
  mid: string;
  bk: string;
  type_: string; // 'type' is a keyword in JS
  // bytes 89-92 are reserved in DDP audio, and only used in DVD
  nside: string; // read numbers as strings to avoid NaN
  side: string;
  nlayer: string;
  layer: string;
  // end DVD-only fields
  txt: string;
}

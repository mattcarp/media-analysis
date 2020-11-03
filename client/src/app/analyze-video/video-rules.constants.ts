export const VideoRulesConstants = {
  videoStream: [
    {
      codecs: ['prores', 'mpeg2video', 'h264'],
      codecsMessage: 'Video codec must be ProRes, MPEG-2, H.264, or Avid DNX HD.',
      frameRates: [23.976, 24, 25, 29.97, 30],
      frameRatesMessage: 'Frame rate must be either 23.976, 24, 25, 29.97, or 30.',
      width: 1920,
      widthMessage: `Width must be 1920 pixels.`,
      height: 1080,
      heightMessage: 'Height must be 1080 pixels.',
      tagsEncoder: 'Apple ProRes 422 (HQ)',
      tagsEncoderMessage: 'ProRes must use the Apple 422 HQ encoder',
    },
  ],
  audioStream: [
    {
      sampleRate: '48000',
      sampleRateMessage: 'Audio sample rate must be 48kHz.',
      channelLayout: 'stereo',
      channelLayoutMessage: 'Audio channel layout must be stereo.',
      channels: 2,
      channelsMessage: 'There must be 2 audio channels.',
      codecs: ['pcm_s16be', 'aac', 'mp2'],
      codecsMessage: 'Audio must be either 16 bit PCM or AAC.',
      bitDepths: [0, 16],
      bitDepthsMessage: 'Audio bit depth must be 16 bits.',
    },
  ],
};

export const environment = {
  production: true,
  name: 'NG4-TS-Media Player',
  version: '1.0.4',
  dateTimeFormat: {
    time: 'HH:mm:ss',
    date: 'YYYY-MM-DD',
  },
  supportedMediaExtensions: ['.mp3', '.mp4', '.png', '.jpg', '.jpeg'],
  api: {
    baseUrl:'http://localhost:5001/api'
  },
  socket: {
    baseUrl:'http://localhost:5001',
    subjects: ['refresh', 'playlist', 'current play', 'message', 'debug'],
    options: {}
  },
  defaultArtwork: '600x600bb.jpg',
  intervals: {
    defaultArtwork: (1000 * 5),
    heatBeat: (1000 * 60),
    noTrack: (1000 * 60),
    millisecondOffset: (1000 * 2),
    noPlaylist: (1000 * 120),
  },
  debugging: false
};

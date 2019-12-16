# Angular TypeScript Media Player



# Directory Structure

```
.
├── .vscode
│   ├── launch.json  
│   ├── settings.json
│   └── tasks.json
├── src                        <- source code of the application
│   ├── app
│       ├── media
│           ├── image-audio-playback
│               └── image-audio-playback.component.ts
│           ├── image-playback
│               └── image-playback.component.ts
│           ├── next-media-timer
│               └── next-media-timer.component.ts
│           ├── video-playback
│               └── video-playback.component.ts
│           └── media.module.ts
│       ├── shared
│           ├── enums
│               ├── client-state-type.enum.ts
│               ├── command-state.enum.ts
│               ├── command-type.enum.ts
│               └── media-content-type.enum.ts
│           ├── models
│               ├── client-state.ts
│               ├── media-content.ts
│               ├── media-matrix.ts
│               ├── pattern-item.ts
│               ├── playlist-schedule.ts
│               ├── playlist-template.ts
│               ├── playlist.ts
│               └── socket-message.ts
│           ├── services
│               ├── api.service.ts
│               ├── artwork.service.ts
│               ├── client.service.ts
│               ├── common.service.ts
│               ├── music.service.ts
│               ├── notification.service.ts
│               ├── playlist-helper.service.ts
│               ├── socket.service.ts
│               └── video.service.ts
│           └── shared.module.ts
│       ├── app.component.ts
│       ├── app.module.ts
│       └── operators.ts
│   ├── assets
│       ├── .gitkeep
│   ├── environments
│       ├── environment.prod.ts
│       └── environment.ts
│   ├── index.html
│   ├── main.ts
│   ├── polyfills.ts
│   ├── styles.css
│   ├── tsconfig.app.json
│   └── typings.d.ts
├── README.md                  <- this file
├── package.json               <- dependencies of the project
├── package-lock.json          <- dependencies version lock for npm
├── .angular-cli.json
├── .gitignore.json
└── tsconfig.json
```
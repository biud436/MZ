# Introduction

This plugin package includes helpful features to get you on your way to create your game in RPG Maker MZ.

## Developer's Note

During the RPG Maker MV era, I wrote over 150+ plugins since 2015. However, after the release of RPG Maker MZ and my transition into a web development career, I found myself with less time to work. By the time I got home from work, I was completely exhausted and couldn’t do anything. This made porting plugins very challenging. In the five years following MZ’s release, I managed to port only around 40+ plugins. Meanwhile, many plugins with similar functionalities were released, leading some to lose the will to port them. Today, the presence of numerous AIs further diminishes my motivation.

However, I have not stopped coding and continue to be actively involved, promptly addressing any incoming issues. Although I mostly participate in Korean communities (such as Discord), I always keep an eye on GitHub issues—so please feel free to actively use the issue tracker.

## Deprecated Plugins

The following plugins are deprecated and moved to `Deprecated/` folder:

- **RS_YoutubePlayer.js** → **Deprecated/RS_YoutubePlayer.js** - YouTube policy changes (Error 153) prevent this plugin from working in NW.js. Only works in web browsers.

## How to upstream to `MV` repository

to upstream to `MV` repository, you need to follow the steps below:

```bash
git clone https://github.com/biud436/MZ.git
cd ./MZ
```

and then, you can add a new remote repository and push your changes to it (maintainer only).

```bash
git remote add MV-1 https://github.com/biud436/MV.git
git push MV-1 master:MZ # git push remote-name <source:destination>
```

## Credit and Thanks

Biud436.

## Terms of Use

Free for commercial and non-commercial use.

## License

The MIT License (MIT)

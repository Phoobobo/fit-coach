# 0001 教练示范视频：许可、编码与缓存

状态：已接受。依据 #1（725bc10）和 #2（5301f7b）。

## 背景

型练的仓库是公开的 MIT 许可，站点 https://fit.phoobobo.top 也公开。示范视频不进 git，上传到 `/srv/fit/videos/`，由页面以 `/videos/<name>.mp4?v=<videoVersion>` 引用。Caddy 对 `/videos/*` 缓存 7 天（`src/data/exercises.ts`）。

第一版三个动作用 `videoVersion: 1`。换上去的 mp4 被标成 H.264 level 6.2，手机上的硬件解码器直接拒绝，Edge 打不开。#2 把三个动作都改成 `videoVersion: 2`，避免手机继续用那份缓存 7 天的坏文件，并在播放失败时显示媒体错误码。

## 决定

- 画面只用可自由使用的素材（Pexels、Pixabay 这一类许可）。站点和源码都公开，不能用没有授权的课程录像。
- 转码固定为 H.264 High profile、level 4.0：`-profile:v high -level:v 4.0`。不要再标 level 6.2。
- 换某个 mp4 时，只把该动作的 `videoVersion` 加 1，然后重新构建部署。视频仍然不进 git，也不打进 `dist/`。

## 取舍

版本号放在数据文件里，而不是靠构建期文件哈希。静态构建时仓库里没有这些 mp4，做不出哈希；把整段 `/videos/*` 的缓存改短，会让没换过的视频也被反复下载。

编码参数不写进 `npm run build`。视频在仓库外转好再上传，站点只负责引用。错误码留在播放器里，用来区分找不到文件和解码失败。

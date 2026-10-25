# 型练

面向中文用户的动作示范站，部署在 [https://fit.phoobobo.top](https://fit.phoobobo.top)。纯静态页面，没有登录、计划和训练记录。

当前有三个动作：卷腹、侧卷腹、俄罗斯转体。每个动作有循环示范、动作要点和常见错误。界面字体使用系统字体，不依赖外部 CDN。

## 本地开发

需要 Node.js 20 或以上。

```bash
npm install
npm run dev
```

浏览器打开终端里打印的本地地址。

示范视频不在仓库里。要在本地看播放，把 mp4 放到项目根目录的 `videos/`（已 gitignore），文件名跟数据里的 `video` 一致：

- `videos/crunch.mp4`
- `videos/side-crunch.mp4`
- `videos/russian-twist.mp4`

开发服务器和 `vite preview` 会把这个目录映射到 `/videos/`。不要把视频放进 `public/`，否则会被复制进 `dist/`。

## 构建

```bash
npm run build
npm run preview
```

`npm run build` 会生成 `dist/`。首页卡片和每个动作的 `exercise/<id>/index.html` 都来自 `src/data/exercises.ts`，不需要手写页面。

## 新增一个动作

只改 `src/data/exercises.ts`，在 `exercises` 数组末尾追加一条，然后重新构建。数组第一项会显示在首页主视觉。

| 字段 | 含义 |
| --- | --- |
| `id` | 小写英文、数字、短横线，对应地址 `/exercise/<id>/` |
| `name` | 名称 |
| `muscles` | 目标肌群 |
| `difficulty` | `初级` / `中级` / `高级` |
| `prescription` | 建议组数/次数 |
| `cues` | 动作要点，3 到 5 条 |
| `mistakes` | 常见错误 |
| `video` | 视频路径，例如 `/videos/plank.mp4` |
| `videoVersion` | 缓存版本。页面会请求 `/videos/plank.mp4?v=1` |
| `poster` | 海报路径。留空即可。播放器不加 poster，加载前是藕粉色底 |

换掉某个 mp4 之后，把该动作的 `videoVersion` 加 1，再构建部署。站点对 `/videos/*` 缓存 7 天，不改版本号的话，浏览者会继续看到旧视频。

## 部署

Caddy 用 `file_server` 托管 `/srv/fit`，没有配置 SPA 回退。动作页是真实文件，访问 `/exercise/<id>/` 即可。

```bash
npm run build
rsync -a --delete --exclude videos/ dist/ /srv/fit/
```

`--exclude videos/` 用来留下已经放在服务器上的视频。三个文件分别是：

- `/srv/fit/videos/crunch.mp4`
- `/srv/fit/videos/side-crunch.mp4`
- `/srv/fit/videos/russian-twist.mp4`

视频不在 git 里，也不应出现在 `dist/` 里。

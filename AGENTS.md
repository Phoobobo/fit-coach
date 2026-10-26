# 型练

## 构建与部署

```bash
npm ci
npm run build
```

产物在 `dist/`。Caddy 用 `file_server` 托管 `/srv/fit`，没有 SPA 回退。动作页是 `exercise/<id>/index.html`。

同步到服务器时排除 `videos/`，避免删掉已经上传的示范视频：

```bash
rsync -a --delete --exclude videos/ dist/ /srv/fit/
```

视频不在 git 里，放在 `/srv/fit/videos/`。

## 账号与备案

- 本站不自建账号体系。登录统一走 https://account.phoobobo.top（cookie `phoobobo_sid`，Domain `.phoobobo.top`），用户以 (issuer, subject) 识别。
- 页脚的 ICP 和公安备案号以账号服务的 `/api/filing.json` 为准，不要在本仓库另写一份不同的值。
- 契约与细节只看：https://github.com/Phoobobo/zjsy-bbs/blob/main/docs/INTEGRATION.md 。需要改登录、cookie 或备案行为时，先改那份文档。阶段 2 完成后，这份契约改由 https://github.com/Phoobobo/phoobobo-account/blob/main/docs/INTEGRATION.md 维护。
- 纯静态站：备案在构建时从 filing.json 注入，src/data/filing.json 是回落副本；如需登录状态，只在浏览器用 credentials:'include' 调会话 API。

## Change context (required)

以后每次提交和每个 PR 都要留下足够上下文，让后来的改动能追溯当时为什么这么做。

- 提交说明用祈使句作标题。正文写清为什么改、考虑过哪些做法和取舍、以及如何验证。由 agent 提交、并且知道会话地址时，在正文末尾加一行 `Agent-Session: https://cursor.com/agents/<id>`。
- PR 说明必须按 `.github/pull_request_template.md` 填写，并包含该 agent 会话的链接。
- 不明显的决定写成短 ADR：`docs/decisions/NNNN-title.md`。
- 部署的人在对应 PR 下留一条评论，写明时间（UTC+8）、commit、备份路径，以及做了什么验证。

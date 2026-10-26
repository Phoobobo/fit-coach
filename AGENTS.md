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

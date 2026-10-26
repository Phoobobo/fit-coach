# 0002 页脚同时放 ICP 和公安备案

状态：已接受。依据 #3（3e5e06b）。

## 背景

fit.phoobobo.top、bbs.zjsy.phoobobo.top 和 zainaer.phoobobo.top 共用同一套备案。#1 的页脚只有 ICP `京ICP备2026070128号`。公安备案是 `京公网安备11011402057645号`。计划中的唯一来源是 `https://account.phoobobo.top/api/filing.json`，阶段 1 这个接口还不存在。

## 决定

每一页的页脚都静态写出两条，并链到官网：

- ICP `京ICP备2026070128号` → https://beian.miit.gov.cn/
- 公安 `京公网安备11011402057645号` → https://beian.mps.gov.cn/#/query/webSearch?code=11011402057645 ，旁边用仓库里的 `public/police-filing.png`，不外链图标

构建时先请求账号服务的 `/api/filing.json`。请求失败或内容认不出来，就用 `src/data/filing.json`。两份内容应当相同。不要在本仓库另写一套不同的备案号。

## 取舍

在构建时写进 HTML，而不是让浏览器每次去拉。这个站没有后端，运行时请求失败会让备案从页面上消失。本地副本可能变旧，所以以接口为准，副本只保证断网或账号服务未上线时构建仍然成功。

#3 没有加登录。当时站点没有个性化功能，登录留到真的需要会话再接。

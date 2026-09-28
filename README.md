# Task Reminder

一个部署在 **Cloudflare Workers + KV** 上的轻量级个人任务提醒系统。无需自建服务器，浏览器即可管理任务，支持周期提醒、单次提醒、公历/农历、多渠道通知、自动续订、任务冻结、回收站和 WebDAV 远端备份。

> 当前整理版已移除此前未完成验证的 Microsoft OneDrive / Azure / Entra 集成，只保留通用 WebDAV 远端备份。首次打开“备份与恢复”页面时，Worker 会自动清理 KV 中旧的 OneDrive 配置字段及遗留的临时 OAuth 状态项。

## ✨ 主要功能

- 周期提醒：分钟 / 小时 / 日 / 周 / 月 / 年
- 单次提醒
- 公历 / 农历日期
- 多组提前提醒
- 手动续订 / 自动续订
- 冻结 / 解冻任务
- 30 天回收站
- 最近续订历史
- 推送日志
- 多渠道通知：Server酱、PushPlus、Telegram、Resend、Brevo、NotifyX
- 每个通知渠道独立重试，成功渠道不重复发送
- WebDAV 手动备份、自动智能备份、历史版本和选择恢复
- 手机端 / 桌面端 Web 管理界面

## 🧩 项目结构

```text
task-reminder-main/
├── index.js          # Worker 后端、API、Web 页面、Cron 和业务逻辑
├── wrangler.toml     # Cloudflare Worker / KV / Cron 配置
├── package.json      # Wrangler 依赖与部署命令
├── README.md
└── .gitignore
```

项目采用单文件 Worker 结构，没有单独的数据库服务器和前端工程。主要数据保存在 Cloudflare KV 的 `TASKS_KV` 中。

## 🔔 通知渠道

当前支持：

| 渠道 | 用途 |
|---|---|
| Server酱 | 微信通知 |
| PushPlus | 微信通知 |
| Telegram Bot | Telegram 消息 |
| Resend | 邮件通知 |
| Brevo | 邮件通知 |
| NotifyX | 聚合通知 |

可以同时启用多个渠道。每个提醒点会分别记录各渠道的发送状态；已经成功的渠道不会重复发送，失败渠道会在后续 Cron 周期继续尝试，并设置最大重试次数。

## 💾 WebDAV 智能备份

当前远端备份只保留 **通用 WebDAV**，需要填写：

```text
WebDAV 地址
备份目录
用户名
密码 / 应用密码
```

默认备份目录：

```text
TaskReminderBackup
```

备份分为两类：

- 任务数据：正常任务、冻结任务、回收站、续订历史
- 配置 / Key：系统配置、通知渠道以及对应 Token / API Key

智能自动备份会根据内容是否变化决定是否生成文件：

- 任务变化 → 只备份任务
- 配置 / Key 变化 → 只备份配置 / Key
- 两类同时变化 → 分别备份
- 内容未变化 → 不重复生成

任务历史和配置历史各自最多保留 20 份，“最新状态”文件单独维护，不占历史数量。

### 历史 OneDrive 配置清理

此前版本曾包含 Microsoft OneDrive / Entra OAuth 功能。当前版本已经删除相关 UI、API、Microsoft Graph、PKCE 和 Token 刷新代码。

为了避免升级后 KV 中继续残留旧授权信息，打开“备份与恢复”页面时会自动：

1. 删除 `config` 中所有以 `onedrive` 开头的旧字段；
2. 把旧备份提供商状态切换为 `custom`（WebDAV）；
3. 删除遗留的 `onedrive_oauth_state_*` 临时 KV 项。

如果你希望立即人工确认，也可以直接在 Cloudflare Dashboard → Workers KV → `TASKS_KV` → `KV 对` 中打开 `config`，搜索 `onedrive`。

## ⚡ 部署到 Cloudflare Workers

### 1. 安装依赖

```bash
npm install
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

### 3. 创建并绑定 KV

创建一个 KV Namespace，并在 Worker 中绑定为：

```text
TASKS_KV
```

项目通过：

```js
env.TASKS_KV
```

访问任务、配置、日志和状态数据。

### 4. 设置环境变量

生产环境至少配置：

```text
JWT_SECRET
DEFAULT_USERNAME
DEFAULT_PASSWORD
```

请使用随机高强度 `JWT_SECRET`，并修改默认管理员账号密码。

### 5. 部署

```bash
npm run deploy
```

或者：

```bash
npx wrangler deploy
```

## ⏱ Cron

当前 `wrangler.toml`：

```toml
[triggers]
crons = ["*/5 * * * *"]
```

也就是 Cloudflare 每 **5 分钟**触发一次任务检查。页面中的检查间隔不能高于 Cron 本身的实际触发频率，因此保持默认 Cron 时建议使用：

```text
5 / 10 / 15 / 20 / 30 / 60 分钟
```

## 🔐 安全建议

- 修改默认管理员用户名和密码
- 使用随机高强度 `JWT_SECRET`
- 不要把真实通知 Token、API Key、WebDAV 密码提交到 GitHub
- WebDAV 尽量使用应用密码，而不是主账号密码
- 定期检查 Cloudflare KV 中是否存在不再使用的旧凭据
- 删除外部 OAuth 应用后，同时清理 Worker / KV 中保存的旧 Token 和 Client ID

## 📦 常见 KV 数据

```text
task_<id>              正常任务
trash_<id>             回收站任务
history_<id>           续订历史
config                 系统配置和通知 / 备份设置
push_logs              推送日志
done_<...>             已完成提醒状态
retry_<...>            失败重试状态
autorenew_<...>        自动续订状态
backup_*               智能备份内部状态
```

## 🛠 本地开发

```bash
npm install
npx wrangler dev
```

## License

MIT

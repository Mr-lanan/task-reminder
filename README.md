# task-reminder
# 任务提醒系统（Task Reminder）

基于 Cloudflare Workers 的周期性任务提醒工具，支持续订重置周期、多组提前提醒、6 种通知渠道（Server酱、PushPlus、Telegram、Resend、Brevo、NotifyX）。

## ✨ 特性

- 任务管理（增删改查）
- 周期支持 年/月/周/日，数值自定义
- 续订功能：重置开始日为今天，下次提醒日 = 今天 + 周期
- 每个任务可设置多个提前提醒天数（如 3,7）
- 保留最近 21 条续订历史
- Cron 每分钟触发，按后台设置的 1–60 分钟真实间隔检查并推送
- Web 管理界面，移动端友好

## 🚀 部署到 Cloudflare Workers（通过 GitHub）

1. **Fork 或克隆此仓库** 到你的 GitHub。

2. **创建 KV 命名空间**：
   - 登录 Cloudflare Dashboard → Workers & Pages → KV
   - 创建命名空间，例如 `TASKS_KV`，记下 ID。

3. **创建 Worker**：
   - Workers & Pages → 创建应用程序 → Workers → 创建 Worker
   - 命名为 `task-reminder`（可自定义）。

4. **绑定 KV**：
   - 在 Worker 的“设置” → “KV 命名空间绑定” 中，添加绑定：
     - 变量名：`TASKS_KV`
     - 命名空间：选择刚创建的 `TASKS_KV`。

5. **设置环境变量（敏感信息）**：
   - 在 Worker 的“设置” → “变量” 中添加以下变量（类型为“纯文本”）：
     - `JWT_SECRET`：任意随机字符串（用于 JWT 加密）
     - `DEFAULT_USERNAME`：管理员用户名（如 `admin`）
     - `DEFAULT_PASSWORD`：管理员密码（务必修改！）
   - （可选）也可以在这里直接设置通知渠道的密钥，但更推荐在 Web 界面的“配置”中填写。

6. **连接 GitHub 仓库**：
   - 在 Worker 的“部署” → “Git 集成” 中，连接你的 GitHub 仓库。
   - 选择分支（如 `main`），并设置构建命令（无需构建，直接选择“跳过构建”）。
   - Cloudflare 会自动拉取代码并部署。

7. **配置 Cron 触发器**：
   - 在 Worker 的“触发器” → “Cron 触发器” 中添加 `0 * * * *`（每小时）。

8. **访问**：
   - 部署成功后，Worker 会分配一个 `*.workers.dev` 域名，或自定义域名。

首次访问需登录（默认用户名和密码为你设置的环境变量值），登录后即可使用。

## 🔧 配置通知渠道

登录后，点击右上角“配置”，选择渠道并填写相应密钥：
- **Server酱**：SendKey（[获取](https://sctapi.ftqq.com/)）
- **PushPlus**：Token（[获取](https://www.pushplus.plus/)）
- **Telegram**：Bot Token 和 Chat ID（[教程](https://core.telegram.org/bots)）
- **邮件（Resend）**：Resend API Key、发件邮箱和收件邮箱
- **邮件（Brevo）**：Brevo API Key、已验证的发件邮箱和收件邮箱
- **NotifyX**：API Key（[获取](https://www.notifyx.cn/)）

配置后点击“测试推送”验证。

## 📦 本地开发

```bash
# 安装依赖
npm install

# 本地测试（需先配置 wrangler.toml 中的 KV ID）
wrangler dev


## ⚠️ 必须配置的安全变量

生产环境务必设置 `JWT_SECRET`、`DEFAULT_USERNAME`、`DEFAULT_PASSWORD`，不要使用代码中的默认值。通知密钥会保存在 KV 配置中，请限制 Worker 后台访问权限。

## 多渠道重试规则

每个已启用渠道独立记录成功状态和重试次数：成功渠道不会重复发送，失败渠道会在后续检测周期继续尝试，单个渠道最多 10 次。当前提醒点结束后不会影响任务下一周期。

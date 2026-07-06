// ============================================================
// 配置读取
// ============================================================
async function getConfig(env) {
  const kv = env.TASKS_KV;
  let config = {};
  try {
    const raw = await kv.get('config');
    if (raw) config = JSON.parse(raw);
  } catch (e) {}

  config.username = env.DEFAULT_USERNAME || config.username || 'admin';
  config.password = env.DEFAULT_PASSWORD || config.password || 'admin123';
  config.jwtSecret = env.JWT_SECRET || config.jwtSecret || 'change-this-secret';
  config.checkInterval = parseInt(config.checkInterval) || 5;
  config.enableLogging = config.enableLogging !== undefined ? config.enableLogging : true;

  if (typeof config.notifierTypes === 'string') {
    config.notifierTypes = config.notifierTypes.split(',').map(s => s.trim()).filter(Boolean);
  } else if (!Array.isArray(config.notifierTypes)) {
    config.notifierTypes = [];
  }
  return config;
}

// ============================================================
// 内置农历数据（2020-2030）
// ============================================================
const lunarInfo = [
  [2020, 1, 25, '庚子', [29,30,30,29,29,30,29,30,30,29,30,29], 4, 29],
  [2021, 2, 12, '辛丑', [29,30,29,30,29,29,30,29,30,29,30,30], 0, 0],
  [2022, 2, 1, '壬寅', [30,29,30,29,29,30,29,30,29,30,30,29], 0, 0],
  [2023, 1, 22, '癸卯', [30,29,30,29,30,29,29,30,29,30,29,30], 2, 29],
  [2024, 2, 10, '甲辰', [29,30,29,30,29,30,29,30,29,30,29,30], 0, 0],
  [2025, 1, 29, '乙巳', [30,29,30,29,30,29,29,30,29,30,30,29], 6, 29],
  [2026, 2, 17, '丙午', [29,30,29,30,29,30,29,30,29,30,29,30], 0, 0],
  [2027, 2, 6, '丁未', [30,29,30,29,30,29,29,30,29,30,30,29], 5, 29],
  [2028, 1, 26, '戊申', [29,30,29,30,29,30,29,30,29,30,29,30], 0, 0],
  [2029, 2, 13, '己酉', [30,29,30,29,30,29,29,30,29,30,30,29], 7, 29],
  [2030, 2, 3, '庚戌', [29,30,29,30,29,30,29,30,29,30,29,30], 0, 0],
];
const lunarMonthNames = ['', '正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
const lunarDayNames = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

function getLunarFromDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00+08:00');
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (year < 2020 || year > 2030) return null;
  const info = lunarInfo.find(e => e[0] === year);
  if (!info) return null;
  const springDate = new Date(info[1] + '-' + String(info[2]).padStart(2,'0') + 'T00:00:00+08:00');
  const diffDays = Math.floor((date - springDate) / (1000*60*60*24));
  if (diffDays < 0) return null; // 春节前不考虑
  const months = info[4];
  const leapMonth = info[5];
  const leapDays = info[6];
  let remaining = diffDays;
  let lunarMonth = 0, lunarDay = 0, isLeap = false;
  for (let i = 1; i <= 12; i++) {
    if (remaining < months[i-1]) {
      lunarMonth = i; lunarDay = remaining + 1; break;
    }
    remaining -= months[i-1];
  }
  if (lunarMonth === 0 && leapMonth > 0) {
    if (remaining < leapDays) {
      lunarMonth = leapMonth; lunarDay = remaining + 1; isLeap = true;
    } else {
      remaining -= leapDays;
      for (let i = leapMonth + 1; i <= 12; i++) {
        if (remaining < months[i-1]) {
          lunarMonth = i; lunarDay = remaining + 1; break;
        }
        remaining -= months[i-1];
      }
    }
  }
  if (lunarMonth === 0) return null;
  const monthName = (isLeap ? '闰' : '') + lunarMonthNames[lunarMonth];
  const dayName = lunarDayNames[lunarDay];
  return { year: info[3], month: monthName, day: dayName, full: `${info[3]}年 ${monthName}${dayName}` };
}

async function fetchLunar(dateStr) {
  try {
    const url = `https://api.2xb.cn/lunar/?date=${dateStr}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('网络请求失败');
    const data = await resp.json();
    if (data && data.lunar) return { full: data.lunar };
    throw new Error('数据格式异常');
  } catch (e) {
    const result = getLunarFromDate(dateStr);
    return result ? { full: result.full } : { full: '农历获取失败' };
  }
}

// ============================================================
// HTML 登录页
// ============================================================
function getLoginPage() {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>任务提醒 - 登录</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .login-box { background: #fff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
  .login-box h1 { text-align: center; margin-bottom: 30px; color: #1a1a2e; }
  .login-box input { width: 100%; padding: 12px; margin-bottom: 16px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; }
  .login-box button { width: 100%; padding: 14px; background: #4a6cf7; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
  .login-box button:hover { background: #3a5cd5; }
  .error { color: #e74c3c; text-align: center; margin-top: 12px; }
</style></head>
<body>
<div class="login-box">
  <h1>📋 任务提醒</h1>
  <form id="loginForm">
    <input type="text" id="username" placeholder="用户名" required>
    <input type="password" id="password" placeholder="密码" required>
    <button type="submit">登 录</button>
    <div id="errorMsg" class="error"></div>
  </form>
</div>
<script>
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const resp = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await resp.json();
    if (data.success) {
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } else {
      document.getElementById('errorMsg').textContent = data.message || '登录失败';
    }
  });
</script>
</body></html>`;
}

// ============================================================
// HTML 主面板
// ============================================================
function getDashboardPage() {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>任务提醒系统</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, sans-serif; background: #f0f2f5; padding: 20px; }
  .container { max-width: 1200px; margin: 0 auto; }
  .lunar-display { text-align: center; font-size: 14px; color: #888; padding: 6px 0; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px; }
  .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px,1fr)); gap: 12px; background: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .dashboard .stat { text-align: center; }
  .dashboard .stat .number { font-size: 28px; font-weight: 700; color: #1a1a2e; }
  .dashboard .stat .label { font-size: 13px; color: #888; margin-top: 2px; }
  .dashboard .stat .number.warning { color: #e67e22; }
  .dashboard .stat .number.danger { color: #e74c3c; }
  .dashboard .stat .clickable { cursor: pointer; }
  .header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 16px 24px; border-radius: 12px; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
  .header h1 { font-size: 22px; }
  .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .header-actions button { padding: 8px 18px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: 0.15s; }
  .btn-primary { background: #4a6cf7; color: #fff; }
  .btn-primary:hover { background: #3a5cd5; }
  .btn-success { background: #2ecc71; color: #fff; }
  .btn-success:hover { background: #27ae60; }
  .btn-danger { background: #e74c3c; color: #fff; }
  .btn-danger:hover { background: #c0392b; }
  .btn-outline { background: transparent; color: #555; border: 2px solid #aaa; }
  .btn-outline:hover { background: #f0f0f0; }
  .btn-warning { background: #f39c12; color: #fff; }
  .btn-warning:hover { background: #e67e22; }
  .btn-config { background: #00b894; color: #fff; }
  .btn-config:hover { background: #00a381; }
  .btn-history { background: #a29bfe; color: #fff; }
  .btn-history:hover { background: #8c84f0; }
  .btn-sm { padding: 4px 14px; font-size: 12px; border-radius: 6px; border: none; cursor: pointer; transition: 0.15s; }
  .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
  .task-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-left: 4px solid #4a6cf7; }
  .task-card .title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  .task-card .info { font-size: 14px; color: #666; margin: 4px 0; }
  .task-card .status { display: inline-block; padding: 2px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-top: 8px; }
  .status-active { background: #d4edda; color: #155724; }
  .status-expired { background: #f8d7da; color: #721c24; }
  .task-card .actions { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); justify-content: center; align-items: center; z-index: 1000; }
  .modal.show { display: flex; }
  .modal-content { background: #fff; border-radius: 16px; padding: 32px; max-width: 680px; width: 95%; max-height: 90vh; overflow-y: auto; }
  .modal-content input, .modal-content select, .modal-content textarea { width: 100%; padding: 10px 12px; margin-bottom: 16px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; transition: 0.15s; }
  .modal-content input:focus, .modal-content select:focus, .modal-content textarea:focus { border-color: #4a6cf7; outline: none; }
  .modal-content .form-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .modal-content .form-row > * { flex: 1; min-width: 120px; }
  .modal-content .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
  .modal-content .form-actions button { padding: 10px 28px; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; transition: 0.15s; }
  .reminder-group { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
  .reminder-group input { flex: 2; min-width: 60px; margin-bottom: 0; }
  .reminder-group select { flex: 1; min-width: 60px; margin-bottom: 0; }
  .reminder-group button { padding: 4px 10px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
  .config-checkbox-group { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
  .config-checkbox-group label { display: flex; align-items: center; gap: 4px; font-weight: normal; }
  .config-detail { margin-bottom: 12px; border-left: 3px solid #4a6cf7; padding-left: 12px; }
  .toast { position: fixed; bottom: 30px; right: 30px; background: #333; color: #fff; padding: 14px 24px; border-radius: 10px; z-index: 2000; opacity: 0; transform: translateY(20px); transition: all 0.3s; }
  .toast.show { opacity: 1; transform: translateY(0); }
  .toast.success { background: #2ecc71; }
  .toast.error { background: #e74c3c; }
  .empty-state { text-align: center; padding: 60px 20px; color: #999; }
  .history-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #555; }
  .log-entry { padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #333; }
  .log-entry .time { color: #999; font-size: 12px; }
  .log-entry .success { color: #2ecc71; }
  .log-entry .fail { color: #e74c3c; }
  .mode-hint { font-size: 13px; color: #888; margin-top: 4px; }
  .next-date-display { font-weight: 600; color: #4a6cf7; background: #f0f4ff; padding: 4px 12px; border-radius: 20px; display: inline-block; }
  .reverse-hint { font-size: 12px; color: #999; margin-left: 8px; cursor: pointer; text-decoration: underline; }
  .time-error { color: #e74c3c; font-size: 12px; margin-top: -12px; margin-bottom: 12px; display: none; }
  @media (max-width:600px){ .task-grid{grid-template-columns:1fr;} .reminder-group{flex-wrap:wrap;} .dashboard{grid-template-columns:1fr 1fr;} }
</style></head>
<body>
<div class="container" id="app">
  <div class="lunar-display" id="lunarDisplay">🌙 加载农历中...</div>
  
  <div class="dashboard" id="dashboard">
    <div class="stat"><div class="number" id="statTotal">0</div><div class="label">📋 总任务</div></div>
    <div class="stat"><div class="number danger" id="statExpired">0</div><div class="label">⚠️ 已过期</div></div>
    <div class="stat"><div class="number warning" id="statSoon">0</div><div class="label">⏳ 即将到期</div></div>
    <div class="stat"><div class="number" id="statActive">0</div><div class="label">✅ 进行中</div></div>
    <div class="stat"><div class="number" id="statNextCheck">--</div><div class="label">🕒 下次检查</div></div>
    <div class="stat clickable" onclick="openLogModal()"><div class="number">📋</div><div class="label">查看日志</div></div>
  </div>

  <div class="header">
    <h1>📋 任务提醒</h1>
    <div class="header-actions">
      <button class="btn-primary" onclick="openAddModal()">➕ 新建</button>
      <button class="btn-config" onclick="openConfigModal()">⚙️ 配置</button>
      <button class="btn-danger" onclick="logout()">退出</button>
    </div>
  </div>
  <div id="taskList" class="task-grid"></div>
</div>

<!-- 任务弹窗 -->
<div class="modal" id="taskModal">
  <div class="modal-content">
    <h2 id="taskModalTitle">新建任务</h2>
    <input type="hidden" id="editId">
    <label>任务名称 *</label><input type="text" id="taskName" placeholder="例如：月度报告">
    <label>模式</label>
    <select id="taskMode" onchange="toggleModeFields()">
      <option value="periodic">周期模式</option>
      <option value="countdown">倒数日模式</option>
    </select>
    <div class="mode-hint" id="modeHint">周期模式：设置开始日期和周期，提醒日 = 开始日 + 周期</div>
    <div id="periodicFields">
      <div class="form-row">
        <div><label>开始日期</label><input type="date" id="startDate" onchange="updateNextDateFromStart()"></div>
        <div><label>周期数值</label><input type="number" id="periodValue" value="1" min="1" onchange="updateNextDateFromStart()"></div>
        <div><label>周期单位</label>
          <select id="periodUnit" onchange="updateNextDateFromStart()">
            <option value="day">日</option><option value="week">周</option><option value="month" selected>月</option><option value="year">年</option>
          </select>
        </div>
      </div>
    </div>
    <div id="countdownFields" style="display:none;">
      <label>间隔天数（多少天后提醒）</label>
      <input type="number" id="countdownDays" value="30" min="1" onchange="updateNextDateFromCountdown()">
    </div>
    <div class="form-row">
      <div><label>提醒日期</label><input type="date" id="reminderDate" onchange="reverseCalculate()"></div>
      <div><label>提醒时间（北京时间）</label><input type="time" id="remindTime" value="08:00" step="60" onchange="validateTime()" oninput="validateTime()"></div>
    </div>
    <div id="timeError" class="time-error">⚠️ 提醒分钟必须是检测间隔的倍数</div>
    <div style="margin-bottom:12px;">
      <span class="next-date-display" id="nextDateDisplay">📅 提醒日：未计算</span>
      <span class="reverse-hint" onclick="reverseCalculate()">🔄 点击提醒日期反向计算</span>
    </div>
    <label>提前提醒（点击 ➕ 添加多组，单位：天/小时）</label>
    <div id="reminderDaysContainer"></div>
    <button class="btn-primary btn-sm" onclick="addReminderGroup()">➕ 添加一组</button>
    <label>备注</label><textarea id="remark" rows="2"></textarea>
    <div class="form-actions">
      <button class="btn-outline" onclick="closeModal('taskModal')">取消</button>
      <button class="btn-primary" id="saveTaskBtn" onclick="saveTask()">保存</button>
    </div>
  </div>
</div>

<!-- 历史弹窗 -->
<div class="modal" id="historyModal">
  <div class="modal-content">
    <h2>📜 续订历史</h2>
    <div id="historyList"></div>
    <div class="form-actions"><button class="btn-outline" onclick="closeModal('historyModal')">关闭</button></div>
  </div>
</div>

<!-- 日志弹窗 -->
<div class="modal" id="logModal">
  <div class="modal-content" style="max-width:800px;">
    <h2>📋 推送日志 <span style="font-size:12px;color:#999;font-weight:normal;">（最近100条）</span></h2>
    <div id="logList" style="max-height:60vh;overflow-y:auto;"></div>
    <div class="form-actions">
      <button class="btn-outline" onclick="clearLogs()">🗑️ 清空日志</button>
      <button class="btn-outline" onclick="closeModal('logModal')">关闭</button>
    </div>
  </div>
</div>

<!-- 配置弹窗 -->
<div class="modal" id="configModal">
  <div class="modal-content">
    <h2>⚙️ 系统配置</h2>
    <label>用户名</label><input type="text" id="cfgUsername">
    <label>密码</label><input type="text" id="cfgPassword">
    <label>检测间隔（分钟）</label>
    <input type="number" id="cfgInterval" min="1" max="60" value="5" onchange="validateInterval()" oninput="validateInterval()">
    <div style="font-size:12px;color:#888;margin-top:-8px;margin-bottom:12px;">建议 1-60，任务提醒分钟必须为间隔倍数</div>
    <label><input type="checkbox" id="cfgLogging" checked> 启用日志记录</label>
    <hr>
    <label>推送渠道（可多选）</label>
    <div class="config-checkbox-group" id="notifierCheckboxes">
      <label><input type="checkbox" value="serverchan"> Server酱</label>
      <label><input type="checkbox" value="pushplus"> PushPlus</label>
      <label><input type="checkbox" value="telegram"> Telegram</label>
      <label><input type="checkbox" value="email"> 邮件(Resend)</label>
      <label><input type="checkbox" value="notifyx"> NotifyX</label>
    </div>
    <div id="notifierConfigFields"></div>
    <div class="form-actions">
      <button class="btn-outline" onclick="closeModal('configModal')">取消</button>
      <button class="btn-primary" onclick="saveConfig()">保存</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
  const API_BASE = '';
  let token = localStorage.getItem('token') || '';
  let reminderGroupCounter = 0;
  let checkInterval = 5;

  function getHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }; }
  function showToast(msg, type) {
    type = type || 'success';
    const t = document.getElementById('toast');
    t.textContent = msg; t.className = 'toast ' + type + ' show';
    clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove('show'), 3000);
  }
  function closeModal(id) { document.getElementById(id).classList.remove('show'); }
  function openModal(id) { document.getElementById(id).classList.add('show'); }
  function formatDate(d) { if(!d)return'-'; const dt=new Date(d); return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0'); }
  function formatFullDate(d) { if(!d)return'-'; const dt=new Date(d); return dt.toLocaleString('zh-CN'); }
  function addDays(dateStr, days) { const d=new Date(dateStr); d.setDate(d.getDate()+days); return d.toISOString().split('T')[0]; }

  // 获取农历
  async function fetchLunarForDate(dateStr) {
    try {
      const resp = await fetch('/api/lunar?date=' + dateStr, { headers: getHeaders() });
      const data = await resp.json();
      return data.lunar || '农历获取失败';
    } catch(e) { return '农历获取失败'; }
  }

  // 更新当前农历显示
  async function updateLunarDisplay() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lunar = await fetchLunarForDate(today);
      document.getElementById('lunarDisplay').textContent = '🌙 ' + lunar;
    } catch(e) { document.getElementById('lunarDisplay').textContent = '🌙 农历获取失败'; }
  }

  // 计算下次检查时间
  function getNextCheckTime() {
    const now = new Date();
    const minutes = now.getMinutes();
    const remainder = minutes % checkInterval;
    let nextMinutes = minutes + (checkInterval - remainder);
    if (remainder === 0) nextMinutes = minutes + checkInterval;
    const next = new Date(now);
    next.setMinutes(nextMinutes, 0, 0);
    return next.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  function updateNextCheckDisplay() {
    document.getElementById('statNextCheck').textContent = getNextCheckTime();
  }

  async function fetchInterval() {
    try {
      const resp = await fetch('/api/config', { headers: getHeaders() });
      const data = await resp.json();
      if (data.checkInterval) checkInterval = parseInt(data.checkInterval) || 5;
    } catch(e) { checkInterval = 5; }
    updateNextCheckDisplay();
  }

  // 验证时间分钟
  function validateTime() {
    const timeInput = document.getElementById('remindTime');
    const errorEl = document.getElementById('timeError');
    const saveBtn = document.getElementById('saveTaskBtn');
    if (!timeInput.value) { errorEl.style.display = 'none'; saveBtn.disabled = false; return; }
    const parts = timeInput.value.split(':');
    const minute = parseInt(parts[1]);
    if (minute % checkInterval !== 0) {
      errorEl.style.display = 'block';
      errorEl.textContent = '⚠️ 提醒分钟必须是 ' + checkInterval + ' 的倍数（当前 ' + minute + '）';
      saveBtn.disabled = true;
    } else {
      errorEl.style.display = 'none';
      saveBtn.disabled = false;
    }
  }

  // 模式切换
  function toggleModeFields() {
    const mode = document.getElementById('taskMode').value;
    document.getElementById('periodicFields').style.display = (mode === 'periodic') ? 'block' : 'none';
    document.getElementById('countdownFields').style.display = (mode === 'countdown') ? 'block' : 'none';
    document.getElementById('modeHint').textContent = (mode === 'periodic') ? '周期模式：设置开始日期和周期，提醒日 = 开始日 + 周期' : '倒数日模式：设置间隔天数，提醒日 = 今天 + 间隔天数';
    updateNextDateFromStart();
  }

  function updateNextDateFromStart() {
    const mode = document.getElementById('taskMode').value;
    let nextDate = null;
    if (mode === 'periodic') {
      const start = document.getElementById('startDate').value;
      const val = parseInt(document.getElementById('periodValue').value);
      const unit = document.getElementById('periodUnit').value;
      if (start && val > 0) {
        const d = new Date(start);
        switch(unit) {
          case 'day': d.setDate(d.getDate()+val); break;
          case 'week': d.setDate(d.getDate()+val*7); break;
          case 'month': d.setMonth(d.getMonth()+val); break;
          case 'year': d.setFullYear(d.getFullYear()+val); break;
        }
        nextDate = d.toISOString().split('T')[0];
      }
    } else {
      const days = parseInt(document.getElementById('countdownDays').value);
      if (days > 0) {
        const today = new Date();
        today.setDate(today.getDate()+days);
        nextDate = today.toISOString().split('T')[0];
      }
    }
    if (nextDate) {
      document.getElementById('reminderDate').value = nextDate;
      document.getElementById('nextDateDisplay').textContent = '📅 提醒日：' + nextDate;
    } else {
      document.getElementById('reminderDate').value = '';
      document.getElementById('nextDateDisplay').textContent = '📅 提醒日：未计算';
    }
  }

  function reverseCalculate() {
    const mode = document.getElementById('taskMode').value;
    const reminderDate = document.getElementById('reminderDate').value;
    if (!reminderDate) { showToast('请先选择提醒日期', 'error'); return; }
    if (mode === 'periodic') {
      const val = parseInt(document.getElementById('periodValue').value);
      const unit = document.getElementById('periodUnit').value;
      if (!val || val < 1) { showToast('请输入有效的周期数值', 'error'); return; }
      const d = new Date(reminderDate);
      switch(unit) {
        case 'day': d.setDate(d.getDate()-val); break;
        case 'week': d.setDate(d.getDate()-val*7); break;
        case 'month': d.setMonth(d.getMonth()-val); break;
        case 'year': d.setFullYear(d.getFullYear()-val); break;
      }
      const start = d.toISOString().split('T')[0];
      document.getElementById('startDate').value = start;
      showToast('已根据提醒日反算开始日期：' + start);
    } else {
      const today = new Date();
      const remind = new Date(reminderDate);
      const diffTime = remind - today;
      const diffDays = Math.ceil(diffTime / (1000*60*60*24));
      if (diffDays < 1) { showToast('提醒日必须在今天之后', 'error'); return; }
      document.getElementById('countdownDays').value = diffDays;
      showToast('已计算间隔天数：' + diffDays + ' 天');
    }
    updateNextDateFromStart();
  }

  // 提醒组
  function addReminderGroup(value, unit) {
    const container = document.getElementById('reminderDaysContainer');
    const div = document.createElement('div');
    div.className = 'reminder-group';
    div.dataset.index = reminderGroupCounter++;
    const input = document.createElement('input');
    input.type = 'number'; input.min = 1; input.placeholder = '例如 3';
    if (value) input.value = value;
    input.required = true;
    const select = document.createElement('select');
    select.innerHTML = '<option value="day">天</option><option value="hour">小时</option>';
    if (unit) select.value = unit;
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕'; delBtn.className = 'btn-danger btn-sm';
    delBtn.onclick = function() { div.remove(); };
    div.appendChild(input); div.appendChild(select); div.appendChild(delBtn);
    container.appendChild(div);
  }

  function loadReminderGroups(groups) {
    const container = document.getElementById('reminderDaysContainer');
    container.innerHTML = '';
    reminderGroupCounter = 0;
    if (!groups || groups.length === 0) {
      addReminderGroup(3, 'day');
    } else {
      groups.forEach(g => addReminderGroup(g.value, g.unit || 'day'));
    }
  }

  function getReminderGroups() {
    const groups = document.querySelectorAll('#reminderDaysContainer .reminder-group');
    const result = [];
    groups.forEach(div => {
      const input = div.querySelector('input');
      const select = div.querySelector('select');
      const val = parseInt(input.value);
      if (!isNaN(val) && val > 0) {
        result.push({ value: val, unit: select.value });
      }
    });
    return result;
  }

  async function checkAuth() {
    if(!token){ window.location.href='/login'; return false; }
    try { const resp = await fetch('/api/tasks', { headers: getHeaders() }); if(resp.status===401){ localStorage.removeItem('token'); window.location.href='/login'; return false; } return true; } catch(e){ return false; }
  }

  // 加载任务
  async function loadTasks() {
    if(!await checkAuth()) return;
    try {
      const resp = await fetch('/api/tasks', { headers: getHeaders() });
      const data = await resp.json();
      const tasks = data.tasks || [];
      const container = document.getElementById('taskList');
      if(tasks.length===0){ container.innerHTML='<div class="empty-state"><p>暂无任务，点击「新建」添加</p></div>'; } else {
        container.innerHTML = tasks.map(t => {
          const now = new Date(); const nextDate = new Date(t.nextReminder + 'T' + (t.remindTime||'08:00') + ':00+08:00');
          const isExpired = nextDate < now;
          const unitMap = { day:'日', week:'周', month:'月', year:'年' };
          const modeLabel = t.mode === 'countdown' ? '倒数日' : '周期';
          const reminderStr = (t.reminderDays || []).map((g,i) => {
            const u = t.reminderUnits && t.reminderUnits[i] ? t.reminderUnits[i] : 'day';
            return g + (u === 'hour' ? '小时' : '天');
          }).join(', ') || '无';
          return \`
            <div class="task-card" style="border-left-color:\${isExpired?'#e74c3c':'#2ecc71'}">
              <div class="title">\${t.name} <span style="font-size:12px;color:#999;">[\${modeLabel}]</span></div>
              <div class="info"><strong>周期/倒数：</strong>\${t.mode==='periodic' ? '每 '+t.periodValue+' '+unitMap[t.periodUnit] : '每 '+t.countdownDays+' 天'}</div>
              <div class="info"><strong>开始/基准：</strong>\${t.mode==='periodic' ? formatDate(t.startDate) : '（从今天起）'}</div>
              <div class="info"><strong>提醒日：</strong>\${formatDate(t.nextReminder)} \${t.remindTime||'08:00'} <span class="lunar-date" data-date="\${t.nextReminder}" style="font-size:12px;color:#888;">加载农历...</span></div>
              <div class="info"><strong>提前提醒：</strong>\${reminderStr}</div>
              <div class="info"><strong>备注：</strong>\${t.remark||'-'}</div>
              <span class="status \${isExpired?'status-expired':'status-active'}">\${isExpired?'⚠️ 已过期':'✅ 进行中'}</span>
              <div class="actions">
                <button class="btn-success btn-sm" onclick="renewTask('\${t.id}')">🔄 续订</button>
                <button class="btn-primary btn-sm" onclick="editTask('\${t.id}')">✏️ 编辑</button>
                <button class="btn-history btn-sm" onclick="viewHistory('\${t.id}')">📜 历史</button>
                <button class="btn-warning btn-sm" onclick="testTask('\${t.id}')">📤 测试</button>
                <button class="btn-danger btn-sm" onclick="deleteTask('\${t.id}')">🗑️ 删除</button>
              </div>
            </div>
          \`;
        }).join('');
        // 异步加载每个任务的农历
        const lunarSpans = document.querySelectorAll('.lunar-date');
        for (const span of lunarSpans) {
          const date = span.dataset.date;
          if (date) {
            const lunar = await fetchLunarForDate(date);
            span.textContent = lunar;
          }
        }
      }
      updateDashboard(tasks);
      updateNextCheckDisplay();
    } catch(e) { showToast('加载失败','error'); }
  }

  function updateDashboard(tasks) {
    const now = new Date();
    const total = tasks.length;
    let expired = 0, soon = 0, active = 0;
    tasks.forEach(t => {
      const dt = new Date(t.nextReminder + 'T' + (t.remindTime||'08:00') + ':00+08:00');
      if (dt < now) expired++;
      else if ((dt - now) < 24*60*60*1000) soon++;
      else active++;
    });
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statExpired').textContent = expired;
    document.getElementById('statSoon').textContent = soon;
    document.getElementById('statActive').textContent = active;
  }

  // 打开日志
  async function openLogModal() {
    const resp = await fetch('/api/logs', { headers: getHeaders() });
    const data = await resp.json();
    const list = document.getElementById('logList');
    if (!data.logs || data.logs.length === 0) {
      list.innerHTML = '<p style="color:#999;padding:20px;">暂无日志</p>';
    } else {
      list.innerHTML = data.logs.map(log => {
        const cls = log.success ? 'success' : 'fail';
        return \`<div class="log-entry">
          <span class="time">\${formatFullDate(log.time)}</span>
          [\${log.task}] 渠道:\${log.channel} <span class="\${cls}">\${log.success ? '✅ 成功' : '❌ 失败'}</span>
          \${log.error ? '<span style="color:#e74c3c;font-size:12px;">错误: '+log.error+'</span>' : ''}
        </div>\`;
      }).join('');
    }
    openModal('logModal');
  }

  async function clearLogs() {
    if (!confirm('确认清空所有日志？')) return;
    const resp = await fetch('/api/logs', { method: 'DELETE', headers: getHeaders() });
    if (resp.ok) {
      showToast('日志已清空');
      closeModal('logModal');
    } else {
      showToast('清空失败', 'error');
    }
  }

  // 新建/编辑
  function openAddModal() {
    document.getElementById('taskModalTitle').textContent='新建任务';
    document.getElementById('editId').value='';
    document.getElementById('taskName').value='';
    document.getElementById('taskMode').value='periodic';
    document.getElementById('startDate').value=new Date().toISOString().split('T')[0];
    document.getElementById('periodValue').value='1';
    document.getElementById('periodUnit').value='month';
    document.getElementById('countdownDays').value='30';
    document.getElementById('remindTime').value='08:00';
    document.getElementById('remark').value='';
    loadReminderGroups([{value:3, unit:'day'}]);
    toggleModeFields();
    updateNextDateFromStart();
    validateTime();
    openModal('taskModal');
  }

  async function editTask(id) {
    const resp = await fetch('/api/tasks', { headers: getHeaders() });
    const data = await resp.json();
    const t = data.tasks.find(x=>x.id===id);
    if(!t){ showToast('任务不存在','error'); return; }
    document.getElementById('taskModalTitle').textContent='编辑任务';
    document.getElementById('editId').value=id;
    document.getElementById('taskName').value=t.name;
    document.getElementById('taskMode').value=t.mode || 'periodic';
    document.getElementById('remindTime').value=t.remindTime || '08:00';
    if (t.mode === 'periodic') {
      document.getElementById('startDate').value=t.startDate;
      document.getElementById('periodValue').value=t.periodValue;
      document.getElementById('periodUnit').value=t.periodUnit;
    } else {
      document.getElementById('countdownDays').value=t.countdownDays || 30;
    }
    document.getElementById('remark').value=t.remark||'';
    const groups = (t.reminderDays || []).map((v,i) => ({ value:v, unit: (t.reminderUnits && t.reminderUnits[i]) || 'day' }));
    loadReminderGroups(groups);
    toggleModeFields();
    if (t.nextReminder) {
      document.getElementById('reminderDate').value = t.nextReminder;
      document.getElementById('nextDateDisplay').textContent = '📅 提醒日：' + t.nextReminder;
    } else {
      updateNextDateFromStart();
    }
    validateTime();
    openModal('taskModal');
  }

  async function saveTask() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('taskName').value.trim();
    const mode = document.getElementById('taskMode').value;
    const remindTime = document.getElementById('remindTime').value || '08:00';
    const remark = document.getElementById('remark').value.trim();
    const reminderGroups = getReminderGroups();
    if(!name){ showToast('请输入名称','error'); return; }
    if(reminderGroups.length===0){ showToast('请至少添加一组提前提醒','error'); return; }
    const parts = remindTime.split(':');
    if (parseInt(parts[1]) % checkInterval !== 0) {
      showToast('提醒分钟必须是 ' + checkInterval + ' 的倍数', 'error');
      return;
    }
    let body = { name, mode, remindTime, remark, reminderDays: reminderGroups.map(g=>g.value), reminderUnits: reminderGroups.map(g=>g.unit) };
    if (mode === 'periodic') {
      const startDate = document.getElementById('startDate').value;
      const periodValue = parseInt(document.getElementById('periodValue').value);
      const periodUnit = document.getElementById('periodUnit').value;
      if(!startDate){ showToast('请选开始日期','error'); return; }
      if(!periodValue||periodValue<1){ showToast('周期必须>0','error'); return; }
      body.startDate = startDate;
      body.periodValue = periodValue;
      body.periodUnit = periodUnit;
    } else {
      const days = parseInt(document.getElementById('countdownDays').value);
      if(!days||days<1){ showToast('间隔天数必须>0','error'); return; }
      body.countdownDays = days;
    }
    const url = id ? '/api/tasks/'+id : '/api/tasks';
    const method = id ? 'PUT' : 'POST';
    const resp = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body) });
    const data = await resp.json();
    if(data.success){ closeModal('taskModal'); showToast('保存成功'); loadTasks(); }
    else showToast(data.message||'保存失败','error');
  }

  // 续订、删除、历史、测试
  async function renewTask(id) {
    if(!confirm('确认续订？')) return;
    const resp = await fetch('/api/tasks/'+id+'/renew', { method: 'POST', headers: getHeaders() });
    const data = await resp.json();
    if(data.success){ showToast('续订成功！下次提醒：'+formatDate(data.nextReminder)); loadTasks(); }
    else showToast(data.message||'续订失败','error');
  }

  async function deleteTask(id) {
    if(!confirm('确认删除？')) return;
    const resp = await fetch('/api/tasks/'+id, { method: 'DELETE', headers: getHeaders() });
    const data = await resp.json();
    if(data.success){ showToast('已删除'); loadTasks(); }
    else showToast(data.message||'删除失败','error');
  }

  async function viewHistory(id) {
    const resp = await fetch('/api/tasks/'+id+'/history', { headers: getHeaders() });
    const data = await resp.json();
    const list = document.getElementById('historyList');
    if(!data.history||data.history.length===0) list.innerHTML='<p style="color:#999;">暂无记录</p>';
    else list.innerHTML = data.history.map(h=>'<div class="history-item">🔄 '+formatFullDate(h.renewedAt)+' → 下次提醒 '+formatDate(h.nextReminder)+'</div>').join('');
    openModal('historyModal');
  }

  async function testTask(id) {
    try {
      const resp = await fetch('/api/tasks/'+id+'/test', { method: 'POST', headers: getHeaders() });
      const data = await resp.json();
      if(data.success) showToast('✅ 测试推送已发送（所有已启用渠道）');
      else showToast('❌ 失败: '+data.message, 'error');
    } catch(e) { showToast('请求失败','error'); }
  }

  // 配置
  async function openConfigModal() {
    const resp = await fetch('/api/config', { headers: getHeaders() });
    const data = await resp.json();
    document.getElementById('cfgUsername').value = data.username||'';
    document.getElementById('cfgPassword').value = data.password||'';
    document.getElementById('cfgInterval').value = data.checkInterval || 5;
    document.getElementById('cfgLogging').checked = data.enableLogging !== false;
    const checkboxes = document.querySelectorAll('#notifierCheckboxes input[type="checkbox"]');
    const selected = data.notifierTypes || [];
    checkboxes.forEach(cb => { cb.checked = selected.includes(cb.value); });
    renderNotifierFields(selected, data);
    openModal('configModal');
  }

  function renderNotifierFields(selectedTypes, data) {
    const container = document.getElementById('notifierConfigFields');
    const allFields = {
      serverchan: [{ key:'serverchanKey', label:'SendKey' }],
      pushplus: [{ key:'pushplusToken', label:'Token' }],
      telegram: [{ key:'tgBotToken', label:'Bot Token' }, { key:'tgChatId', label:'Chat ID' }],
      email: [{ key:'emailFrom', label:'发件邮箱' }, { key:'emailTo', label:'收件邮箱' }, { key:'emailApiKey', label:'API Key (Resend)' }],
      notifyx: [{ key:'notifyxApiKey', label:'API Key' }]
    };
    let html = '';
    selectedTypes.forEach(type => {
      const fields = allFields[type] || [];
      if (fields.length) {
        html += '<div class="config-detail"><strong>' + type + '</strong>';
        fields.forEach(f => {
          const val = data[f.key] || '';
          html += \`<label>\${f.label}</label><input type="text" id="cfg_\${f.key}" value="\${val}">\`;
        });
        html += '</div>';
      }
    });
    container.innerHTML = html;
  }

  document.addEventListener('change', function(e) {
    if (e.target.closest && e.target.closest('#notifierCheckboxes')) {
      const checkboxes = document.querySelectorAll('#notifierCheckboxes input[type="checkbox"]:checked');
      const selected = Array.from(checkboxes).map(cb => cb.value);
      const data = {};
      document.querySelectorAll('#notifierConfigFields input').forEach(el => {
        const key = el.id.replace('cfg_', '');
        data[key] = el.value;
      });
      renderNotifierFields(selected, data);
    }
  });

  async function saveConfig() {
    const config = {
      username: document.getElementById('cfgUsername').value.trim(),
      password: document.getElementById('cfgPassword').value.trim(),
      checkInterval: parseInt(document.getElementById('cfgInterval').value) || 5,
      enableLogging: document.getElementById('cfgLogging').checked,
    };
    const checkboxes = document.querySelectorAll('#notifierCheckboxes input[type="checkbox"]:checked');
    config.notifierTypes = Array.from(checkboxes).map(cb => cb.value);
    document.querySelectorAll('#notifierConfigFields input').forEach(el => {
      const key = el.id.replace('cfg_', '');
      config[key] = el.value.trim();
    });
    if(!config.username||!config.password){ showToast('用户名密码不能空','error'); return; }
    if(config.notifierTypes.length===0){ showToast('请至少选择一个推送渠道','error'); return; }
    if(config.checkInterval < 1 || config.checkInterval > 60) { showToast('检测间隔必须在1-60之间','error'); return; }
    const resp = await fetch('/api/config', { method: 'POST', headers: getHeaders(), body: JSON.stringify(config) });
    const data = await resp.json();
    if(data.success){ 
      closeModal('configModal'); 
      showToast('配置保存成功'); 
      checkInterval = config.checkInterval; 
      updateNextCheckDisplay();
      loadTasks();
    }
    else showToast(data.message||'保存失败','error');
  }

  function logout() { localStorage.removeItem('token'); window.location.href='/login'; }

  // 初始化
  (async function init() {
    await fetchInterval();
    await updateLunarDisplay();
    await loadTasks();
    setInterval(() => {
      updateNextCheckDisplay();
    }, 60000);
  })();
</script>
</body></html>`;
}

// ============================================================
// Cloudflare Worker 入口
// ============================================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
    }

    if (path === '/login') return new Response(getLoginPage(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    if (path === '/' || path === '') return new Response(getDashboardPage(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });

    const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
    const config = await getConfig(env);
    const kv = env.TASKS_KV;

    // 登录
    if (path === '/api/login' && method === 'POST') {
      const body = await request.json();
      if (body.username === config.username && body.password === config.password) {
        const token = await generateJWT({ username: body.username }, config.jwtSecret);
        return new Response(JSON.stringify({ success: true, token }), { headers: corsHeaders });
      }
      return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), { status: 401, headers: corsHeaders });
    }

    // 认证中间件
    const auth = request.headers.get('Authorization');
    let user = null;
    if (auth && auth.startsWith('Bearer ')) {
      try { user = await verifyJWT(auth.slice(7), config.jwtSecret); } catch (e) {}
    }
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: '未授权' }), { status: 401, headers: corsHeaders });
    }

    // 农历API
    if (path === '/api/lunar' && method === 'GET') {
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      const lunar = await fetchLunar(date);
      return new Response(JSON.stringify({ lunar: lunar.full }), { headers: corsHeaders });
    }

    // 日志API
    if (path === '/api/logs' && method === 'GET') {
      const raw = await kv.get('logs');
      let logs = raw ? JSON.parse(raw) : [];
      logs.sort((a,b) => new Date(b.time) - new Date(a.time));
      logs = logs.slice(0, 100);
      return new Response(JSON.stringify({ logs }), { headers: corsHeaders });
    }
    if (path === '/api/logs' && method === 'DELETE') {
      await kv.delete('logs');
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // 任务CRUD
    if (path === '/api/tasks' && method === 'GET') {
      const tasks = await getAllTasks(kv);
      return new Response(JSON.stringify({ success: true, tasks }), { headers: corsHeaders });
    }

    if (path === '/api/tasks' && method === 'POST') {
      const body = await request.json();
      const { name, mode, startDate, periodValue, periodUnit, countdownDays, remindTime, reminderDays, reminderUnits, remark } = body;
      if (!name) return errorResponse('缺少任务名称', 400);
      if (!reminderDays || reminderDays.length === 0) return errorResponse('至少需要一组提前提醒', 400);
      const interval = config.checkInterval || 5;
      const parts = (remindTime || '08:00').split(':');
      if (parseInt(parts[1]) % interval !== 0) {
        return errorResponse('提醒分钟必须是 ' + interval + ' 的倍数', 400);
      }
      let task = {
        id: crypto.randomUUID(),
        name,
        mode: mode || 'periodic',
        remindTime: remindTime || '08:00',
        reminderDays: reminderDays.map(Number),
        reminderUnits: reminderUnits || [],
        remark: remark || '',
        createdAt: new Date().toISOString(),
      };
      if (mode === 'periodic') {
        if (!startDate || !periodValue || !periodUnit) return errorResponse('缺少周期字段', 400);
        task.startDate = startDate;
        task.periodValue = parseInt(periodValue);
        task.periodUnit = periodUnit;
        task.nextReminder = calcNextReminder(startDate, periodValue, periodUnit);
      } else {
        if (!countdownDays || countdownDays < 1) return errorResponse('间隔天数必须大于0', 400);
        task.countdownDays = parseInt(countdownDays);
        const today = new Date().toISOString().split('T')[0];
        task.nextReminder = addDays(today, task.countdownDays);
        task.startDate = today;
      }
      await kv.put('task_' + task.id, JSON.stringify(task));
      await kv.put('history_' + task.id, JSON.stringify([]));
      return new Response(JSON.stringify({ success: true, task }), { headers: corsHeaders });
    }

    if (path.startsWith('/api/tasks/') && method === 'PUT') {
      const id = path.split('/')[3];
      const existingRaw = await kv.get('task_' + id);
      if (!existingRaw) return errorResponse('任务不存在', 404);
      const task = JSON.parse(existingRaw);
      const body = await request.json();
      task.name = body.name || task.name;
      task.mode = body.mode || task.mode;
      task.remindTime = body.remindTime || '08:00';
      task.remark = body.remark || '';
      task.reminderDays = (body.reminderDays || []).map(Number);
      task.reminderUnits = body.reminderUnits || [];
      const interval = config.checkInterval || 5;
      const parts = task.remindTime.split(':');
      if (parseInt(parts[1]) % interval !== 0) {
        return errorResponse('提醒分钟必须是 ' + interval + ' 的倍数', 400);
      }
      if (task.mode === 'periodic') {
        task.startDate = body.startDate || task.startDate;
        task.periodValue = body.periodValue || task.periodValue;
        task.periodUnit = body.periodUnit || task.periodUnit;
        task.nextReminder = calcNextReminder(task.startDate, task.periodValue, task.periodUnit);
      } else {
        task.countdownDays = body.countdownDays || task.countdownDays || 30;
        const today = new Date().toISOString().split('T')[0];
        task.nextReminder = addDays(today, task.countdownDays);
        task.startDate = today;
      }
      await kv.put('task_' + id, JSON.stringify(task));
      return new Response(JSON.stringify({ success: true, task }), { headers: corsHeaders });
    }

    if (path.startsWith('/api/tasks/') && method === 'DELETE') {
      const id = path.split('/')[3];
      await kv.delete('task_' + id);
      await kv.delete('history_' + id);
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // 续订
    if (path.startsWith('/api/tasks/') && path.endsWith('/renew') && method === 'POST') {
      const id = path.split('/')[3];
      const existing = await kv.get('task_' + id);
      if (!existing) return errorResponse('任务不存在', 404);
      const task = JSON.parse(existing);
      const today = new Date().toISOString().split('T')[0];
      if (task.mode === 'periodic') {
        task.startDate = today;
        task.nextReminder = calcNextReminder(today, task.periodValue, task.periodUnit);
      } else {
        task.startDate = today;
        task.nextReminder = addDays(today, task.countdownDays);
      }
      await kv.put('task_' + id, JSON.stringify(task));
      const historyRaw = await kv.get('history_' + id);
      let history = historyRaw ? JSON.parse(historyRaw) : [];
      history.push({ renewedAt: new Date().toISOString(), nextReminder: task.nextReminder });
      if (history.length > 21) history = history.slice(-21);
      await kv.put('history_' + id, JSON.stringify(history));
      return new Response(JSON.stringify({ success: true, nextReminder: task.nextReminder }), { headers: corsHeaders });
    }

    // 历史
    if (path.startsWith('/api/tasks/') && path.endsWith('/history') && method === 'GET') {
      const id = path.split('/')[3];
      const historyRaw = await kv.get('history_' + id);
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      return new Response(JSON.stringify({ success: true, history }), { headers: corsHeaders });
    }

    // 测试单个任务
    if (path.startsWith('/api/tasks/') && path.endsWith('/test') && method === 'POST') {
      const id = path.split('/')[3];
      const existing = await kv.get('task_' + id);
      if (!existing) return errorResponse('任务不存在', 404);
      const task = JSON.parse(existing);
      const title = `🧪 测试推送：${task.name}`;
      const content = `这是任务 "${task.name}" 的测试消息。\n📅 提醒日：${task.nextReminder} ${task.remindTime||'08:00'}\n📝 备注：${task.remark || '无'}`;
      const result = await sendNotificationWithRetry(config, title, content, task);
      // 记录日志（测试也记录）
      if (config.enableLogging !== false) {
        await appendLog(kv, { time: new Date().toISOString(), task: task.name, channel: 'test', success: result.success, error: result.error });
      }
      if (result.success) {
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      } else {
        return new Response(JSON.stringify({ success: false, message: result.error }), { status: 500, headers: corsHeaders });
      }
    }

    // 配置
    if (path === '/api/config' && method === 'GET') {
      const cfg = await getConfig(env);
      return new Response(JSON.stringify(cfg), { headers: corsHeaders });
    }

    if (path === '/api/config' && method === 'POST') {
      const body = await request.json();
      const existing = await getConfig(env);
      if (Array.isArray(body.notifierTypes)) {
        body.notifierTypes = body.notifierTypes.filter(Boolean);
      } else {
        delete body.notifierTypes;
      }
      if (body.checkInterval) {
        body.checkInterval = parseInt(body.checkInterval) || 5;
        if (body.checkInterval < 1) body.checkInterval = 1;
        if (body.checkInterval > 60) body.checkInterval = 60;
      }
      body.enableLogging = body.enableLogging === true || body.enableLogging === 'true';
      const newConfig = { ...existing, ...body };
      await kv.put('config', JSON.stringify(newConfig));
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    return new Response('Not Found', { status: 404 });
  },

  // 定时任务（每分钟触发，但只在间隔倍数时执行）
  async scheduled(event, env, ctx) {
    const kv = env.TASKS_KV;
    const config = await getConfig(env);
    const interval = config.checkInterval || 5;
    const now = new Date();
    const minute = now.getMinutes();
    if (minute % interval !== 0) return;

    const tasks = await getAllTasks(kv);
    const beijingNow = new Date(now.getTime() + 8*60*60*1000);

    for (const task of tasks) {
      const remindDateTime = new Date(task.nextReminder + 'T' + (task.remindTime || '08:00') + ':00+08:00');
      let diffHours = (remindDateTime - beijingNow) / (1000 * 60 * 60);
      // 兜底调整
      const reminderMinute = remindDateTime.getMinutes();
      const adjustedMinute = Math.floor(reminderMinute / interval) * interval;
      if (adjustedMinute !== reminderMinute) {
        const adjustedRemind = new Date(remindDateTime);
        adjustedRemind.setMinutes(adjustedMinute, 0, 0);
        diffHours = (adjustedRemind - beijingNow) / (1000 * 60 * 60);
      }

      const reminderDays = task.reminderDays || [];
      const reminderUnits = task.reminderUnits || [];
      let sent = false;
      for (let i = 0; i < reminderDays.length; i++) {
        const val = reminderDays[i];
        const unit = (reminderUnits[i] || 'day');
        let threshold = val;
        if (unit === 'day') threshold *= 24;
        if (Math.abs(diffHours - threshold) < 0.5) {
          const title = `⏰ 任务提醒：${task.name}`;
          const content = `📋 "${task.name}" 提醒日即将到来！\n📅 日期：${task.nextReminder} ${task.remindTime||'08:00'}\n📝 备注：${task.remark || '无'}`;
          const result = await sendNotificationWithRetry(config, title, content, task);
          if (config.enableLogging !== false) {
            await appendLog(kv, { time: new Date().toISOString(), task: task.name, channel: 'scheduled', success: result.success, error: result.error });
          }
          sent = true;
          break;
        }
      }

      if (!sent && diffHours < -1) {
        const title = `⚠️ 任务过期：${task.name}`;
        const content = `📋 "${task.name}" 已过期！\n📅 提醒日：${task.nextReminder} ${task.remindTime||'08:00'}\n请及时续订。`;
        const result = await sendNotificationWithRetry(config, title, content, task);
        if (config.enableLogging !== false) {
          await appendLog(kv, { time: new Date().toISOString(), task: task.name, channel: 'scheduled', success: result.success, error: result.error });
        }
      }
    }
  }
};

// ============================================================
// 辅助函数
// ============================================================
function errorResponse(msg, code) {
  return new Response(JSON.stringify({ success: false, message: msg }), { status: code, headers: { 'Content-Type': 'application/json' } });
}

async function getAllTasks(kv) {
  const list = await kv.list({ prefix: 'task_' });
  const tasks = [];
  for (const key of list.keys) {
    const raw = await kv.get(key.name);
    if (raw) {
      try { tasks.push(JSON.parse(raw)); } catch (e) {}
    }
  }
  tasks.sort((a,b) => new Date(a.nextReminder) - new Date(b.nextReminder));
  return tasks;
}

function calcNextReminder(startDate, periodValue, periodUnit) {
  const d = new Date(startDate);
  const val = parseInt(periodValue) || 1;
  switch (periodUnit) {
    case 'day': d.setDate(d.getDate() + val); break;
    case 'week': d.setDate(d.getDate() + val * 7); break;
    case 'month': d.setMonth(d.getMonth() + val); break;
    case 'year': d.setFullYear(d.getFullYear() + val); break;
    default: d.setMonth(d.getMonth() + val);
  }
  return d.toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

async function appendLog(kv, entry) {
  const raw = await kv.get('logs');
  let logs = raw ? JSON.parse(raw) : [];
  logs.push(entry);
  if (logs.length > 1000) logs = logs.slice(-1000);
  await kv.put('logs', JSON.stringify(logs));
}

async function generateJWT(payload, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify({ ...payload, exp: Date.now() + 86400000 }));
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return btoa(String.fromCharCode(...new Uint8Array(data))) + '.' + btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('Invalid');
  const data = Uint8Array.from(atob(parts[0]), c => c.charCodeAt(0));
  const sig = Uint8Array.from(atob(parts[1]), c => c.charCodeAt(0));
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  if (!await crypto.subtle.verify('HMAC', key, sig, data)) throw new Error('Invalid sig');
  const payload = JSON.parse(new TextDecoder().decode(data));
  if (payload.exp < Date.now()) throw new Error('Expired');
  return payload;
}

async function sendNotificationWithRetry(config, title, content, task) {
  let result = await sendNotification(config, title, content, task);
  if (result.success) return result;
  result = await sendNotification(config, title, content, task);
  return result;
}

async function sendNotification(config, title, content, task) {
  const enabledTypes = config.notifierTypes || [];
  if (enabledTypes.length === 0) {
    return { success: false, error: '未启用任何推送渠道' };
  }

  const results = [];
  for (const type of enabledTypes) {
    let result = { type, success: false, error: '' };
    try {
      switch (type) {
        case 'serverchan':
          if (!config.serverchanKey) { result.error = '未配置 SendKey'; break; }
          const sc = await fetch(`https://sctapi.ftqq.com/${config.serverchanKey}.send`, {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ title, desp: content })
          });
          result.success = sc.ok;
          if (!result.success) result.error = 'HTTP ' + sc.status;
          break;

        case 'pushplus':
          if (!config.pushplusToken) { result.error = '未配置 Token'; break; }
          const pp = await fetch('https://www.pushplus.plus/send', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: config.pushplusToken, title, content })
          });
          const ppd = await pp.json();
          result.success = (ppd.code === 200);
          if (!result.success) result.error = ppd.msg || '发送失败';
          break;

        case 'telegram':
          if (!config.tgBotToken || !config.tgChatId) { result.error = '未配置 Telegram'; break; }
          const tg = await fetch(`https://api.telegram.org/bot${config.tgBotToken}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: config.tgChatId, text: `*${title}*\n${content}`, parse_mode: 'Markdown' })
          });
          const tgd = await tg.json();
          result.success = tgd.ok;
          if (!result.success) result.error = tgd.description || '发送失败';
          break;

        case 'email':
          if (!config.emailFrom || !config.emailTo || !config.emailApiKey) { result.error = '邮件配置不完整'; break; }
          const em = await fetch('https://api.resend.com/emails', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + config.emailApiKey },
            body: JSON.stringify({ from: config.emailFrom, to: [config.emailTo], subject: title, html: `<h2>${title}</h2><p>${content.replace(/\n/g,'<br>')}</p>` })
          });
          result.success = em.ok;
          if (!result.success) result.error = 'HTTP ' + em.status;
          break;

        case 'notifyx':
          if (!config.notifyxApiKey) { result.error = '未配置 NotifyX API Key'; break; }
          try {
            const url = `https://www.notifyx.cn/api/v1/send/${config.notifyxApiKey}`;
            const response = await fetch(url, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: title, content: content })
            });
            if (!response.ok) {
              const text = await response.text();
              result.error = `HTTP ${response.status}: ${text.substring(0, 100)}`;
              break;
            }
            const data = await response.json();
            if (data.status === 'queued' || data.id) {
              result.success = true;
            } else {
              result.error = data.message || '发送失败';
            }
          } catch (e) {
            result.error = e.message;
          }
          break;

        default:
          result.error = '未知渠道';
      }
    } catch (e) {
      result.error = e.message;
    }
    results.push(result);
    console.log(`[通知] ${type}: ${result.success ? '✅' : '❌ ' + result.error}`);
  }

  const anySuccess = results.some(r => r.success);
  const errors = results.filter(r => !r.success).map(r => r.type + ': ' + r.error).join('; ');
  return { success: anySuccess, error: errors || '全部失败' };
}

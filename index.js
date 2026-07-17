// ============================================================
// 农历库（纯本地，1900-2100）- Worker 和前端共用
// ============================================================
const lunarInfo = [0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
0x06566,0x0d4a0,0x0ea50,0x16e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
0x096d0,0x04ddb,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
0x052d0,0x0a9b8,0x0aa50,0x0b5a0,0x0b6a6,0x04ad0,0x0a5b0,0x0a5a4,0x0a930,0x07952,
0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,0x05aa0,
0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,0x0b5a0,
0x056d0];

const LunarCalendar = {
  tianGan: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  diZhi: ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'],
  shengXiao: ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'],
  monthNames: ['正','二','三','四','五','六','七','八','九','十','冬','腊'],
  getLunarMonthDays(year, month, isLeap) {
    if (isLeap) {
      const leapMonth = this.getLeapMonth(year);
      if (leapMonth !== month) return 0;
      return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
    }
    return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
  },
  getLunarYearDays(year) {
    let sum = 348;
    const info = lunarInfo[year - 1900];
    for (let i = 0x8000; i > 0x8; i >>= 1) sum += (info & i) ? 1 : 0;
    return sum + this.getLeapDays(year);
  },
  getLeapMonth(year) {
    return lunarInfo[year - 1900] & 0xf;
  },
  getLeapDays(year) {
    const leapMonth = this.getLeapMonth(year);
    if (leapMonth) return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
    return 0;
  },
  solarToLunar(year, month, day) {
    if (year < 1900 || year > 2100) return null;

    const baseTime = Date.UTC(1900, 0, 31);
    const targetTime = Date.UTC(year, month - 1, day);

    let offset = Math.floor((targetTime - baseTime) / 86400000) + 1;
    if (offset < 0) return null;

    let lunarYear = 1900;
    let daysInLunarYear = this.getLunarYearDays(lunarYear);

    while (offset >= daysInLunarYear) {
      offset -= daysInLunarYear;
      lunarYear++;
      daysInLunarYear = this.getLunarYearDays(lunarYear);
    }

    let lunarMonth = 1;
    let isLeapMonth = false;
    const leapMonth = this.getLeapMonth(lunarYear);

    for (let i = 1; i <= 12; i++) {
      const monthDays = this.getLunarMonthDays(lunarYear, i, false);

      if (offset >= monthDays) {
        offset -= monthDays;

        if (leapMonth === i) {
          const leapDays = this.getLeapDays(lunarYear);

          if (offset >= leapDays) {
            offset -= leapDays;

            if (i === 12) break;
          } else {
            isLeapMonth = true;
            lunarMonth = i;
            break;
          }
        } else if (i === 12) {
          lunarMonth = 12;
        }
      } else {
        lunarMonth = i;
        break;
      }
    }

    if (lunarMonth === 12 && offset >= this.getLunarMonthDays(lunarYear, 12, false)) {
      offset -= this.getLunarMonthDays(lunarYear, 12, false);

      if (leapMonth === 12) {
        const leapDays = this.getLeapDays(lunarYear);

        if (offset < leapDays) {
          isLeapMonth = true;
          lunarMonth = 12;
        } else {
          offset -= leapDays;
          lunarYear++;
          lunarMonth = 1;
        }
      } else {
        lunarYear++;
        lunarMonth = 1;
      }
    }

    const lunarDay = offset + 1;

    return {
      lunarYear,
      lunarMonth,
      lunarDay,
      isLeapMonth,
      monthName: this.monthNames[lunarMonth - 1] + (isLeapMonth ? '闰' : ''),
      dayName: this.getDayName(lunarDay),
      ganZhi: this.tianGan[(lunarYear - 4) % 10] + this.diZhi[(lunarYear - 4) % 12],
      animal: this.shengXiao[(lunarYear - 4) % 12],
      totalDays: this.getLunarYearDays(lunarYear)
    };
  },
  getDayName(day) {
    if (day === 10) return '初十';
    if (day === 20) return '二十';
    if (day === 30) return '三十';

    const numNames = ['','一','二','三','四','五','六','七','八','九','十'];
    if (day < 10) return '初' + numNames[day];
    if (day < 20) return '十' + numNames[day - 10];
    if (day < 30) return '廿' + numNames[day - 20];
    return '三十';
  },
  lunarToSolar(year, month, day, isLeap) {
    if (year < 1900 || year > 2100) return null;

    const leapMonth = this.getLeapMonth(year);

    if (isLeap && leapMonth !== month) return null;

    const monthDays = this.getLunarMonthDays(year, month, !!isLeap);
    if (monthDays <= 0 || day < 1 || day > monthDays) return null;

    const baseTime = Date.UTC(1900, 0, 31);
    let offset = 0;

    for (let y = 1900; y < year; y++) {
      offset += this.getLunarYearDays(y);
    }

    for (let m = 1; m < month; m++) {
      offset += this.getLunarMonthDays(year, m, false);

      if (leapMonth === m) {
        offset += this.getLeapDays(year);
      }
    }

    if (isLeap && leapMonth === month) {
      offset += this.getLunarMonthDays(year, month, false);
    }

    offset += day - 1;

    const resultDate = new Date(baseTime + (offset - 1) * 86400000);

    return {
      year: resultDate.getUTCFullYear(),
      month: resultDate.getUTCMonth() + 1,
      day: resultDate.getUTCDate()
    };
  },
  nextLunarDate(lunarMonth, lunarDay, isLeapMonth, fromDate) {
    const from = new Date(fromDate);
    const fromTime = Date.UTC(
      from.getUTCFullYear(),
      from.getUTCMonth(),
      from.getUTCDate()
    );

    for (let year = from.getUTCFullYear(); year <= 2100; year++) {
      const solar = this.lunarToSolar(year, lunarMonth, lunarDay, isLeapMonth);
      if (!solar) continue;

      const solarTime = Date.UTC(solar.year, solar.month - 1, solar.day);

      if (solarTime >= fromTime) {
        return {
          year: solar.year,
          month: solar.month,
          day: solar.day
        };
      }
    }

    return null;
  }
};

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

  if (typeof config.notifierTypes === 'string') {
    config.notifierTypes = config.notifierTypes.split(',').map(s => s.trim()).filter(Boolean);
  } else if (!Array.isArray(config.notifierTypes)) {
    config.notifierTypes = [];
  }

  return config;
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
// HTML 主面板（含完整内联农历库、仪表盘、所有功能）
// ============================================================
function getDashboardPage() {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>任务提醒系统</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, sans-serif; background: #f0f2f5; padding: 20px; }
  .container { max-width: 1200px; margin: 0 auto; }

  .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap: 12px; background: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .dashboard .stat { text-align: center; }
  .dashboard .stat .number { font-size: 28px; font-weight: 700; color: #1a1a2e; }
  .dashboard .stat .label { font-size: 13px; color: #888; margin-top: 2px; }
  .dashboard .stat .number.warning { color: #e67e22; }
  .dashboard .stat .number.danger { color: #e74c3c; }

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
  .btn-sm.btn-outline { background: transparent; border: 2px solid #aaa; color: #555; }
  .btn-sm.btn-outline:hover { background: #f0f0f0; }
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
  .mode-hint { font-size: 13px; color: #888; margin-top: 4px; }
  .next-date-display { font-weight: 600; color: #4a6cf7; background: #f0f4ff; padding: 4px 12px; border-radius: 20px; display: inline-block; }
  .reverse-hint { font-size: 12px; color: #999; margin-left: 8px; cursor: pointer; text-decoration: underline; }
  .time-error { color: #e74c3c; font-size: 12px; margin-top: -12px; margin-bottom: 12px; display: none; }
  .lunar-display { font-size: 13px; color: #6c5ce7; margin-top: -8px; margin-bottom: 12px; padding: 4px 8px; background: #f3f0ff; border-radius: 6px; }
  .reminder-preview { margin: 14px 0 16px 0; padding: 12px; background: #f3f0ff; border-radius: 8px; color: #4b3fbf; font-size: 14px; line-height: 1.7; white-space: pre-line; }
  @media (max-width:600px){ .task-grid{grid-template-columns:1fr;} .reminder-group{flex-wrap:wrap;} .dashboard{grid-template-columns:1fr 1fr;} }
</style></head>
<body>
<div class="container" id="app">
  <div class="dashboard" id="dashboard">
    <div class="stat"><div class="number" id="statTotal">0</div><div class="label">📋 总任务</div></div>
    <div class="stat"><div class="number danger" id="statExpired">0</div><div class="label">⚠️ 已过期</div></div>
    <div class="stat"><div class="number warning" id="statSoon">0</div><div class="label">⏳ 即将到期</div></div>
    <div class="stat"><div class="number" id="statActive">0</div><div class="label">✅ 进行中</div></div>
    <div class="stat"><div class="number" id="statNextCheck">--</div><div class="label">🕒 下次检查</div></div>
  </div>

  <div class="header">
    <h1>📋 任务提醒</h1>
    <div class="header-actions">
      <button class="btn-primary" onclick="openAddModal()">➕ 新建</button>
      <button class="btn-config" onclick="openConfigModal()">⚙️ 配置</button>
      <button class="btn-history" onclick="viewPushLogs()">📨 推送日志</button>
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
      <option value="countdown">单次提醒</option>
    </select>
    <div class="mode-hint" id="modeHint">周期模式：设置开始日期、开始时间和周期</div>

    <div id="periodicFields">
      <div class="form-row">
        <div id="solarDateRow"><label>开始日期（公历）</label><input type="date" id="startDate" onchange="updateNextDateFromStart()"></div>
        <div><label>开始时间（北京时间）</label><input type="time" id="startTime" value="08:00" step="60" onchange="validateTime(); updateNextDateFromStart()" oninput="validateTime(); updateNextDateFromStart()"></div>
        <div><label>周期数值</label><input type="number" id="periodValue" value="1" min="1" onchange="updateNextDateFromStart()"></div>
        <div><label>周期单位</label>
          <select id="periodUnit" onchange="updateNextDateFromStart()">
            <option value="hour">小时</option><option value="day">日</option><option value="week">周</option><option value="month" selected>月</option><option value="year">年</option>
          </select>
        </div>
      </div>
      <div style="margin: 4px 0 12px 0;">
        <label style="display:flex; align-items:center; gap:8px; font-weight:500;">
          <input type="checkbox" id="calendarLunar" style="width:auto; margin:0;" onchange="toggleCalendarFields()"> 使用农历日期
        </label>
        <div class="mode-hint">不勾选：按公历开始日期和开始时间计算；勾选：选择农历月/日，系统自动换算成公历提醒日期。</div>
      </div>
    </div>

    <div id="countdownFields" style="display:none;">
      <div class="form-row">
        <div><label>提醒日期（公历）</label><input type="date" id="singleReminderDate" onchange="updateNextDateFromStart()"></div>
        <div><label>提醒时间（北京时间）</label><input type="time" id="singleReminderTime" value="08:00" step="60" onchange="validateTime(); updateNextDateFromStart()" oninput="validateTime(); updateNextDateFromStart()"></div>
      </div>
      <div class="mode-hint">单次提醒：直接设置提醒日期和提醒时间，到点只提醒一次。</div>
    </div>

   <div id="lunarFields" style="display:none;">
     <div class="form-row">
       <div>
         <label>农历年</label>
         <select id="lunarYear" onchange="updateLunarNext()">
           <!-- JS 动态生成年份 -->
         </select>
       </div>

       <div>
         <label>农历月</label>
         <select id="lunarMonth" onchange="updateLunarNext()">
           <option value="1">正月</option>
           <option value="2">二月</option>
           <option value="3">三月</option>
           <option value="4">四月</option>
           <option value="5">五月</option>
           <option value="6">六月</option>
           <option value="7">七月</option>
           <option value="8">八月</option>
           <option value="9">九月</option>
           <option value="10">十月</option>
           <option value="11">冬月</option>
           <option value="12">腊月</option>
         </select>
       </div>

       <div>
         <label>农历日</label>
         <select id="lunarDay" onchange="updateLunarNext()">
           <!-- JS 动态生成 1-30 -->
         </select>
       </div>

       <div style="display:flex; align-items:center; gap:8px;">
         <label style="margin-bottom:0;">这是闰月日期</label>
         <input type="checkbox" id="lunarLeap" onchange="updateLunarNext()">
       </div>
     </div>

     <div class="mode-hint" style="margin-bottom:10px;">
    只有开始日期本身是“闰X月”时才勾选；普通农历生日不要勾选。
   </div>
</div>

    <input type="hidden" id="reminderDate">
    <input type="hidden" id="remindTime" value="08:00">
    <div id="timeError" class="time-error">⚠️ 提醒分钟必须是检测间隔的倍数</div>
    
    <div id="autoRenewBlock" style="margin: 8px 0 14px 0;">
      <label style="display:flex; align-items:center; gap:8px; font-weight:500;">
        <input type="checkbox" id="autoRenew" style="width:auto; margin:0;"> 到提醒日后自动续订
      </label>
      <div class="mode-hint">自动续订：到提醒日期后，以当前提醒日为基准计算下一周期；手动续订仍然从当前日期重新开始。</div>
    </div>

    <label>提前提醒（点击 ➕ 添加多组，单位：天/小时）</label>
    <div id="reminderDaysContainer"></div>
    <button class="btn-primary btn-sm" onclick="addReminderGroup()">➕ 添加一组</button>

    <div class="reminder-preview" id="reminderPreview">📅 提醒日：未计算</div>

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

<!-- 推送日志弹窗 -->
<div class="modal" id="pushLogModal">
  <div class="modal-content">
    <h2>📨 推送日志</h2>
    <div id="pushLogList"></div>
    <div class="form-actions">
      <button class="btn-outline" onclick="closeModal('pushLogModal')">关闭</button>
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
    <div id="intervalHint" style="font-size:12px;color:#888;margin-top:-8px;margin-bottom:12px;">建议设置为 1-60 的整数</div>
    <hr>
    <label>推送渠道（可多选）</label>
    <div class="config-checkbox-group" id="notifierCheckboxes">
      <label><input type="checkbox" value="serverchan"> Server酱</label>
      <label><input type="checkbox" value="pushplus"> PushPlus</label>
      <label><input type="checkbox" value="telegram"> Telegram</label>
      <label><input type="checkbox" value="email"> 邮件(Resend)</label>
      <label><input type="checkbox" value="brevo"> 邮件(Brevo)</label>
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

// ============================================================
// 前端内联农历库（完全复制自 Worker 端的定义）
// ============================================================
const lunarInfo = [0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
0x06566,0x0d4a0,0x0ea50,0x16e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
0x096d0,0x04ddb,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
0x052d0,0x0a9b8,0x0aa50,0x0b5a0,0x0b6a6,0x04ad0,0x0a5b0,0x0a5a4,0x0a930,0x07952,
0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,0x05aa0,
0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,0x0b5a0,
0x056d0];

const LunarCalendar = {
  tianGan: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  diZhi: ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'],
  shengXiao: ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'],
  monthNames: ['正','二','三','四','五','六','七','八','九','十','冬','腊'],
  getLunarMonthDays(year, month, isLeap) {
    if (isLeap) {
      const leapMonth = this.getLeapMonth(year);
      if (leapMonth !== month) return 0;
      return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
    }
    return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
  },
  getLunarYearDays(year) {
    let sum = 348;
    const info = lunarInfo[year - 1900];
    for (let i = 0x8000; i > 0x8; i >>= 1) sum += (info & i) ? 1 : 0;
    return sum + this.getLeapDays(year);
  },
  getLeapMonth(year) { return lunarInfo[year - 1900] & 0xf; },
  getLeapDays(year) {
    const leapMonth = this.getLeapMonth(year);
    if (leapMonth) return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
    return 0;
  },
  solarToLunar(year, month, day) {
    if (year < 1900 || year > 2100) return null;

    const baseTime = Date.UTC(1900, 0, 31);
    const targetTime = Date.UTC(year, month - 1, day);

    let offset = Math.floor((targetTime - baseTime) / 86400000) + 1;
    if (offset < 0) return null;

    let lunarYear = 1900;
    let daysInLunarYear = this.getLunarYearDays(lunarYear);

    while (offset >= daysInLunarYear) {
      offset -= daysInLunarYear;
      lunarYear++;
      daysInLunarYear = this.getLunarYearDays(lunarYear);
    }

    let lunarMonth = 1;
    let isLeapMonth = false;
    const leapMonth = this.getLeapMonth(lunarYear);

    for (let i = 1; i <= 12; i++) {
      const monthDays = this.getLunarMonthDays(lunarYear, i, false);

      if (offset >= monthDays) {
        offset -= monthDays;

        if (leapMonth === i) {
          const leapDays = this.getLeapDays(lunarYear);

          if (offset >= leapDays) {
            offset -= leapDays;

            if (i === 12) break;
          } else {
            isLeapMonth = true;
            lunarMonth = i;
            break;
          }
        } else if (i === 12) {
          lunarMonth = 12;
        }
      } else {
        lunarMonth = i;
        break;
      }
    }

    if (lunarMonth === 12 && offset >= this.getLunarMonthDays(lunarYear, 12, false)) {
      offset -= this.getLunarMonthDays(lunarYear, 12, false);

      if (leapMonth === 12) {
        const leapDays = this.getLeapDays(lunarYear);

        if (offset < leapDays) {
          isLeapMonth = true;
          lunarMonth = 12;
        } else {
          offset -= leapDays;
          lunarYear++;
          lunarMonth = 1;
        }
      } else {
        lunarYear++;
        lunarMonth = 1;
      }
    }

    const lunarDay = offset + 1;

    return {
      lunarYear,
      lunarMonth,
      lunarDay,
      isLeapMonth,
      monthName: this.monthNames[lunarMonth - 1] + (isLeapMonth ? '闰' : ''),
      dayName: this.getDayName(lunarDay),
      ganZhi: this.tianGan[(lunarYear - 4) % 10] + this.diZhi[(lunarYear - 4) % 12],
      animal: this.shengXiao[(lunarYear - 4) % 12],
      totalDays: this.getLunarYearDays(lunarYear)
    };
  },
  getDayName(day) {
    if (day === 10) return '初十';
    if (day === 20) return '二十';
    if (day === 30) return '三十';
    const numNames = ['','一','二','三','四','五','六','七','八','九','十'];
    if (day < 10) return '初' + numNames[day];
    if (day < 20) return '十' + numNames[day - 10];
    if (day < 30) return '廿' + numNames[day - 20];
    return '三十';
  },
  lunarToSolar(year, month, day, isLeap) {
    if (year < 1900 || year > 2100) return null;

    const leapMonth = this.getLeapMonth(year);

    if (isLeap && leapMonth !== month) return null;

    const monthDays = this.getLunarMonthDays(year, month, !!isLeap);
    if (monthDays <= 0 || day < 1 || day > monthDays) return null;

    const baseTime = Date.UTC(1900, 0, 31);
    let offset = 0;

    for (let y = 1900; y < year; y++) {
      offset += this.getLunarYearDays(y);
    }

    for (let m = 1; m < month; m++) {
      offset += this.getLunarMonthDays(year, m, false);

      if (leapMonth === m) {
        offset += this.getLeapDays(year);
      }
    }

    if (isLeap && leapMonth === month) {
      offset += this.getLunarMonthDays(year, month, false);
    }

    offset += day - 1;

    const resultDate = new Date(baseTime + (offset - 1) * 86400000);

    return {
      year: resultDate.getUTCFullYear(),
      month: resultDate.getUTCMonth() + 1,
      day: resultDate.getUTCDate()
    };
  },
  nextLunarDate(lunarMonth, lunarDay, isLeapMonth, fromDate) {
    const from = new Date(fromDate);
    const fromTime = Date.UTC(
      from.getUTCFullYear(),
      from.getUTCMonth(),
      from.getUTCDate()
    );

    for (let year = from.getUTCFullYear(); year <= 2100; year++) {
      const solar = this.lunarToSolar(year, lunarMonth, lunarDay, isLeapMonth);
      if (!solar) continue;

      const solarTime = Date.UTC(solar.year, solar.month - 1, solar.day);

      if (solarTime >= fromTime) {
        return {
          year: solar.year,
          month: solar.month,
          day: solar.day
        };
      }
    }

    return null;
  }
};
// ============================================================
// 前端应用逻辑（使用上面的 LunarCalendar）
// ============================================================
const API_BASE = '';
let token = localStorage.getItem('token') || '';
let reminderGroupCounter = 0;
let checkInterval = 5;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  };
}

function showToast(msg, type) {
  type = type || 'success';

  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type + ' show';

  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

function openModal(id) {
  document.getElementById(id).classList.add('show');
}

function formatDate(d) {
  if (!d) return '-';

  const value = String(d);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const dt = new Date(d);
  return formatDateBeijing(dt);
}

function formatFullDate(d) {
  if (!d) return '-';

  const dt = new Date(d);
  return dt.toLocaleString('zh-CN');
}

function parseDateLocalFrontend(dateStr) {
  const parts = dateStr.split('-').map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

function formatDateBeijing(d) {
  const bj = new Date(d.getTime() + 8 * 60 * 60 * 1000);

  return bj.getUTCFullYear() + '-' +
    String(bj.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(bj.getUTCDate()).padStart(2, '0');
}

function addDays(dateStr, days) {
  const d = parseDateLocalFrontend(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateObjLocal(d);
}

// ===== 农历显示 =====
function showLunar() {
  updateReminderPreview();
}

function getNextCheckTime() {
  const now = new Date();
  const minutes = now.getMinutes();
  const remainder = minutes % checkInterval;

  let nextMinutes = minutes + (checkInterval - remainder);
  if (remainder === 0) nextMinutes = minutes + checkInterval;

  const next = new Date(now);
  next.setMinutes(nextMinutes, 0, 0);

  return next.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function updateNextCheckDisplay() {
  document.getElementById('statNextCheck').textContent = getNextCheckTime();
}

async function fetchInterval() {
  try {
    const resp = await fetch('/api/config', { headers: getHeaders() });
    const data = await resp.json();

    if (data.checkInterval) {
      checkInterval = parseInt(data.checkInterval) || 5;
    }
  } catch (e) {
    checkInterval = 5;
  }

  updateNextCheckDisplay();
}

function validateTime() {
  const mode = document.getElementById('taskMode').value;
  const timeInput = mode === 'countdown'
    ? document.getElementById('singleReminderTime')
    : document.getElementById('startTime');
  const hiddenTime = document.getElementById('remindTime');
  const errorEl = document.getElementById('timeError');
  const saveBtn = document.getElementById('saveTaskBtn');

  if (!timeInput || !timeInput.value) {
    errorEl.style.display = 'none';
    saveBtn.disabled = false;
    return;
  }

  if (hiddenTime) hiddenTime.value = timeInput.value;

  const parts = timeInput.value.split(':');
  const minute = parseInt(parts[1]);

  if (minute % checkInterval !== 0) {
    errorEl.style.display = 'block';
    errorEl.textContent = '⚠️ 提醒分钟必须是 ' + checkInterval + ' 的倍数（当前 ' + minute + '）。建议选择 00、05、10、15、20、25、30、35、40、45、50、55 这种检测点。';
    saveBtn.disabled = true;
  } else {
    errorEl.style.display = 'none';
    saveBtn.disabled = false;
  }
}

function toggleModeFields() {
  const mode = document.getElementById('taskMode').value;
  const isPeriodic = mode === 'periodic';
  const lunarCheckbox = document.getElementById('calendarLunar');
  const useLunar = isPeriodic && lunarCheckbox && lunarCheckbox.checked;

  document.getElementById('periodicFields').style.display = isPeriodic ? 'block' : 'none';
  document.getElementById('countdownFields').style.display = (mode === 'countdown') ? 'block' : 'none';
  document.getElementById('lunarFields').style.display = useLunar ? 'block' : 'none';

  const autoRenewBlock = document.getElementById('autoRenewBlock');
  if (autoRenewBlock) autoRenewBlock.style.display = isPeriodic ? 'block' : 'none';
  if (!isPeriodic) document.getElementById('autoRenew').checked = false;

  const solarDateRow = document.getElementById('solarDateRow');
  if (solarDateRow) {
    solarDateRow.style.display = (isPeriodic && !useLunar) ? 'block' : 'none';
  }

  const hints = {
    periodic: useLunar
      ? '周期模式：使用农历日期和开始时间，系统自动换算成对应公历提醒日期'
      : '周期模式：设置公历开始日期、开始时间和周期',
    countdown: '单次提醒：直接设置提醒日期和提醒时间，到点只提醒一次'
  };

  document.getElementById('modeHint').textContent = hints[mode] || '';

  if (useLunar) {
    populateLunarYears();
    populateLunarDays();
    updateLunarNext();
  } else {
    updateNextDateFromStart();
  }

  validateTime();
}

function toggleCalendarFields() {
  toggleModeFields();
}

function populateLunarYears(selectedYear) {
  const select = document.getElementById('lunarYear');
  if (!select) return;

  const nowYear = new Date().getFullYear();
  const oldValue = selectedYear || parseInt(select.value) || nowYear;

  select.innerHTML = '';

  for (let y = 1900; y <= 2100; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y + '年';
    select.appendChild(opt);
  }

  if (oldValue >= 1900 && oldValue <= 2100) {
    select.value = oldValue;
  } else {
    select.value = nowYear;
  }
}
function populateLunarDays(selectedDay) {
  const select = document.getElementById('lunarDay');
  if (!select) return;

  const oldValue = selectedDay || parseInt(select.value) || 1;
  select.innerHTML = '';

  for (let i = 1; i <= 30; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i + '日';
    select.appendChild(opt);
  }

  if (oldValue >= 1 && oldValue <= 30) {
    select.value = oldValue;
  }
}

function formatDateObjLocal(d) {
  return d.getUTCFullYear() + '-' +
    String(d.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(d.getUTCDate()).padStart(2, '0');
}

function parseDateTimeLocalFrontend(dateStr, timeStr) {
  const dateParts = dateStr.split('-').map(Number);
  const timeParts = (timeStr || '08:00').split(':').map(Number);
  return new Date(Date.UTC(
    dateParts[0],
    dateParts[1] - 1,
    dateParts[2],
    timeParts[0] || 0,
    timeParts[1] || 0,
    0
  ));
}

function formatTimeObjLocal(d) {
  return String(d.getUTCHours()).padStart(2, '0') + ':' +
    String(d.getUTCMinutes()).padStart(2, '0');
}

function daysInUtcMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function addMonthsClampedFrontend(d, months) {
  const day = d.getUTCDate();
  const targetMonth = d.getUTCMonth() + months;
  const result = new Date(d.getTime());

  result.setUTCDate(1);
  result.setUTCMonth(targetMonth);
  result.setUTCDate(Math.min(day, daysInUtcMonth(result.getUTCFullYear(), result.getUTCMonth())));

  return result;
}

function addYearsClampedFrontend(d, years) {
  const day = d.getUTCDate();
  const result = new Date(d.getTime());

  result.setUTCDate(1);
  result.setUTCFullYear(result.getUTCFullYear() + years);
  result.setUTCDate(Math.min(day, daysInUtcMonth(result.getUTCFullYear(), result.getUTCMonth())));

  return result;
}

function addPeriodToDateTimeFrontend(d, value, unit) {
  const result = new Date(d.getTime());

  switch (unit) {
    case 'hour':
      result.setUTCHours(result.getUTCHours() + value);
      return result;
    case 'day':
      result.setUTCDate(result.getUTCDate() + value);
      return result;
    case 'week':
      result.setUTCDate(result.getUTCDate() + value * 7);
      return result;
    case 'month':
      return addMonthsClampedFrontend(result, value);
    case 'year':
      return addYearsClampedFrontend(result, value);
    default:
      return result;
  }
}

function getBeijingNowMs() {
  return Date.now();
}

function formatSolarDisplay(dateStr, timeStr) {
  if (!dateStr) return '公历：--';
  const parts = dateStr.split('-').map(Number);
  return '公历：' + parts[0] + '年' + String(parts[1]).padStart(2, '0') + '月' +
    String(parts[2]).padStart(2, '0') + '日 ' + (timeStr || '08:00');
}

function formatLunarDisplay(dateStr, timeStr) {
  if (!dateStr) return '农历：--';
  const parts = dateStr.split('-').map(Number);
  const lunar = LunarCalendar.solarToLunar(parts[0], parts[1], parts[2]);

  if (!lunar) return '农历：不支持';

  return '农历：' + lunar.lunarYear + '年 ' + lunar.monthName + '月 ' +
    lunar.dayName + ' ' + (timeStr || '08:00');
}

function calcAdvanceDateTime(dateStr, timeStr, value, unit) {
  const d = parseDateTimeLocalFrontend(dateStr, timeStr);

  if (unit === 'hour') {
    d.setUTCHours(d.getUTCHours() - value);
  } else {
    d.setUTCDate(d.getUTCDate() - value);
  }

  return {
    date: formatDateObjLocal(d),
    time: formatTimeObjLocal(d),
    ms: new Date(formatDateObjLocal(d) + 'T' + formatTimeObjLocal(d) + ':00+08:00').getTime()
  };
}

function getReminderPreviewText() {
  const dateStr = document.getElementById('reminderDate').value;
  const timeStr = document.getElementById('remindTime').value || '08:00';

  if (!dateStr) return '📅 提醒日：未计算';

  const dueMs = new Date(dateStr + 'T' + timeStr + ':00+08:00').getTime();
  const nowMs = getBeijingNowMs();
  let lines = [];

  lines.push('📅 到期提醒：');
  lines.push(formatSolarDisplay(dateStr, timeStr));
  lines.push(formatLunarDisplay(dateStr, timeStr));

  if (dueMs <= nowMs) {
    lines.push('⚠️ 到期提醒时间已经过去，请重新选择');
  }

  const groups = getReminderGroups();

  groups.forEach((g, index) => {
    const adv = calcAdvanceDateTime(dateStr, timeStr, g.value, g.unit || 'day');
    const unitText = (g.unit || 'day') === 'hour' ? '小时' : '天';

    lines.push('');
    lines.push('⏰ 提前提醒 ' + (index + 1) + '：提前 ' + g.value + unitText);
    lines.push(formatSolarDisplay(adv.date, adv.time));
    lines.push(formatLunarDisplay(adv.date, adv.time));

    if (adv.ms <= nowMs) {
      lines.push('⚠️ 该提前提醒时间已过去，不会推送');
    }
  });

  return lines.join('\\n');
}

function updateReminderPreview() {
  const preview = document.getElementById('reminderPreview');
  if (preview) preview.textContent = getReminderPreviewText();
}

function formatSolarObj(solar) {
  return solar.year + '-' +
    String(solar.month).padStart(2, '0') + '-' +
    String(solar.day).padStart(2, '0');
}

function isValidLunarDate(year, month, day, isLeap) {
  const days = LunarCalendar.getLunarMonthDays(year, month, isLeap);
  return days > 0 && day >= 1 && day <= days;
}

function getValidLunarTargetSolar(year, month, day, isLeap) {
  if (year < 1900 || year > 2100) return null;

  const days = LunarCalendar.getLunarMonthDays(year, month, isLeap);
  if (days <= 0) return null;

  const realDay = Math.min(day, days);
  return LunarCalendar.lunarToSolar(year, month, realDay, isLeap);
}

function addLunarMonths(year, month, addMonths) {
  const total = year * 12 + (month - 1) + addMonths;

  return {
    year: Math.floor(total / 12),
    month: (total % 12) + 1
  };
}

function calcLunarPeriodicNextDate(lunarYear, lunarMonth, lunarDay, lunarLeap, periodValue, periodUnit) {
  periodValue = parseInt(periodValue) || 1;
  if (periodValue < 1) periodValue = 1;

  periodUnit = periodUnit || 'year';

  if (!isValidLunarDate(lunarYear, lunarMonth, lunarDay, lunarLeap)) {
    return null;
  }

  if (periodUnit === 'day' || periodUnit === 'week') {
    const startSolar = LunarCalendar.lunarToSolar(lunarYear, lunarMonth, lunarDay, lunarLeap);
    if (!startSolar) return null;

    const d = new Date(Date.UTC(startSolar.year, startSolar.month - 1, startSolar.day));

    if (periodUnit === 'day') {
      d.setUTCDate(d.getUTCDate() + periodValue);
    } else {
      d.setUTCDate(d.getUTCDate() + periodValue * 7);
    }

    return formatDateObjLocal(d);
  }

  let targetYear = lunarYear;
  let targetMonth = lunarMonth;
  let targetLeap = false;

  if (periodUnit === 'year') {
    targetYear = lunarYear + periodValue;
    targetMonth = lunarMonth;
    targetLeap = !!lunarLeap;
  } else if (periodUnit === 'month') {
    const next = addLunarMonths(lunarYear, lunarMonth, periodValue);
    targetYear = next.year;
    targetMonth = next.month;
    targetLeap = false;
  }

  for (let i = 0; i < 300; i++) {
    const solar = getValidLunarTargetSolar(targetYear, targetMonth, lunarDay, targetLeap);

    if (solar) {
      return formatSolarObj(solar);
    }

    if (periodUnit === 'year') {
      targetYear += periodValue;
    } else if (periodUnit === 'month') {
      const next = addLunarMonths(targetYear, targetMonth, periodValue);
      targetYear = next.year;
      targetMonth = next.month;
      targetLeap = false;
    } else {
      return null;
    }
  }

  return null;
}

function updateLunarNext() {
  const year = parseInt(document.getElementById('lunarYear').value);
  const month = parseInt(document.getElementById('lunarMonth').value);
  const day = parseInt(document.getElementById('lunarDay').value);
  const isLeap = document.getElementById('lunarLeap').checked;

  const periodValue = parseInt(document.getElementById('periodValue').value) || 1;
  const periodUnit = document.getElementById('periodUnit').value || 'year';
  const startTime = document.getElementById('startTime').value || '08:00';

  if (!isValidLunarDate(year, month, day, isLeap)) {
    document.getElementById('reminderDate').value = '';
    document.getElementById('remindTime').value = startTime;
    updateReminderPreview();
    return;
  }

  const startSolar = LunarCalendar.lunarToSolar(year, month, day, isLeap);
  let nextDate = null;
  let nextTime = startTime;

  if (startSolar) {
    if (periodUnit === 'hour' || periodUnit === 'day' || periodUnit === 'week') {
      const base = parseDateTimeLocalFrontend(formatSolarObj(startSolar), startTime);
      const next = addPeriodToDateTimeFrontend(base, periodValue, periodUnit);
      nextDate = formatDateObjLocal(next);
      nextTime = formatTimeObjLocal(next);
    } else {
      nextDate = calcLunarPeriodicNextDate(year, month, day, isLeap, periodValue, periodUnit);
      nextTime = startTime;
    }
  }

  if (nextDate) {
    document.getElementById('reminderDate').value = nextDate;
    document.getElementById('remindTime').value = nextTime;
  } else {
    document.getElementById('reminderDate').value = '';
    document.getElementById('remindTime').value = startTime;
  }

  updateReminderPreview();
}
function updateNextDateFromStart() {
  const mode = document.getElementById('taskMode').value;
  const lunarCheckbox = document.getElementById('calendarLunar');

  if (mode === 'periodic' && lunarCheckbox && lunarCheckbox.checked) {
    updateLunarNext();
    return;
  }

  let nextDate = null;
  let nextTime = null;

  if (mode === 'periodic') {
    const start = document.getElementById('startDate').value;
    const startTime = document.getElementById('startTime').value || '08:00';
    const val = parseInt(document.getElementById('periodValue').value);
    const unit = document.getElementById('periodUnit').value;

    if (start && val > 0) {
      const base = parseDateTimeLocalFrontend(start, startTime);
      const next = addPeriodToDateTimeFrontend(base, val, unit);

      nextDate = formatDateObjLocal(next);
      nextTime = formatTimeObjLocal(next);
    }
  } else {
    nextDate = document.getElementById('singleReminderDate').value;
    nextTime = document.getElementById('singleReminderTime').value || '08:00';
  }

  if (nextDate) {
    document.getElementById('reminderDate').value = nextDate;
    document.getElementById('remindTime').value = nextTime || '08:00';
  } else {
    document.getElementById('reminderDate').value = '';
    document.getElementById('remindTime').value = nextTime || '08:00';
  }

  updateReminderPreview();
}

function reverseCalculate() {
  showToast('当前版本已取消反向计算，请直接修改开始日期/时间或单次提醒时间', 'error');
}

// ===== 提醒组 =====
function addReminderGroup(value, unit) {
  const container = document.getElementById('reminderDaysContainer');

  const div = document.createElement('div');
  div.className = 'reminder-group';
  div.dataset.index = reminderGroupCounter++;

  const input = document.createElement('input');
  input.type = 'number';
  input.min = 1;
  input.placeholder = '例如 3';
  if (value) input.value = value;
  input.required = true;
  input.oninput = updateReminderPreview;
  input.onchange = updateReminderPreview;

  const select = document.createElement('select');
  select.innerHTML = '<option value="day">天</option><option value="hour">小时</option>';
  if (unit) select.value = unit;
  select.onchange = updateReminderPreview;

  const delBtn = document.createElement('button');
  delBtn.textContent = '✕';
  delBtn.className = 'btn-danger btn-sm';
  delBtn.onclick = function() {
    div.remove();
    updateReminderPreview();
  };

  div.appendChild(input);
  div.appendChild(select);
  div.appendChild(delBtn);
  container.appendChild(div);

  updateReminderPreview();
}

function loadReminderGroups(groups) {
  const container = document.getElementById('reminderDaysContainer');
  container.innerHTML = '';
  reminderGroupCounter = 0;

  if (groups && groups.length > 0) {
    groups.forEach(g => addReminderGroup(g.value, g.unit || 'day'));
  }

  updateReminderPreview();
}

function getReminderGroups() {
  const groups = document.querySelectorAll('#reminderDaysContainer .reminder-group');
  const result = [];

  groups.forEach(div => {
    const input = div.querySelector('input');
    const select = div.querySelector('select');
    const val = parseInt(input.value);

    if (!isNaN(val) && val > 0) {
      result.push({
        value: val,
        unit: select.value
      });
    }
  });

  return result;
}

// ===== 认证 & 任务加载 =====
async function checkAuth() {
  if (!token) {
    window.location.href = '/login';
    return false;
  }

  try {
    const resp = await fetch('/api/tasks', { headers: getHeaders() });

    if (resp.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

async function loadTasks() {
  if (!await checkAuth()) return;

  try {
    const resp = await fetch('/api/tasks', { headers: getHeaders() });
    const data = await resp.json();
    const tasks = data.tasks || [];
    const container = document.getElementById('taskList');

    if (tasks.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>暂无任务，点击「新建」添加</p></div>';
    } else {
      container.innerHTML = tasks.map(t => {
        const now = new Date();
        const nextDate = new Date(t.nextReminder + 'T' + (t.remindTime || '08:00') + ':00+08:00');
        const isExpired = nextDate < now;
        const unitMap = {
          hour: '小时',
          day: '日',
          week: '周',
          month: '月',
          year: '年'
        };
        const isLunarPeriodic = t.calendarType === 'lunar' || t.mode === 'lunar';
        const isSingle = t.mode === 'countdown';
        const modeLabel = isSingle ? '单次提醒' : (isLunarPeriodic ? '周期/农历' : '周期');
        const reminderStr = (t.reminderDays || []).map((g, i) => {
          const u = t.reminderUnits && t.reminderUnits[i] ? t.reminderUnits[i] : 'day';
          return g + (u === 'hour' ? '小时' : '天');
        }).join(', ') || '无';

        let ruleStr = '单次提醒';
        if (!isSingle) {
          if (isLunarPeriodic && t.lunarMonth && t.lunarDay) {
            ruleStr = '农历 ' + t.lunarMonth + '月' + t.lunarDay + '日' + (t.lunarLeap ? '（闰月）' : '') + ' / 每 ' + (t.periodValue || 1) + ' ' + unitMap[t.periodUnit || 'year'];
          } else {
            ruleStr = '每 ' + (t.periodValue || 1) + ' ' + unitMap[t.periodUnit || 'month'];
          }
        }

        const startInfo = isSingle
          ? '—'
          : ((isLunarPeriodic ? '农历日期' : formatDate(t.startDate)) + ' ' + (t.startTime || t.remindTime || '08:00'));
        const renewBtn = isSingle
          ? ''
          : '<button class="btn-success btn-sm" onclick="renewTask(\\'' + t.id + '\\')">🔄 续订</button>';

        return '<div class="task-card" style="border-left-color:' + (isExpired ? '#e74c3c' : '#2ecc71') + '">' +
          '<div class="title">' + escapeHtml(t.name) + ' <span style="font-size:12px;color:#999;">[' + modeLabel + ']</span></div>' +
          '<div class="info"><strong>规则：</strong>' + ruleStr + '</div>' +
          '<div class="info"><strong>开始/基准：</strong>' + startInfo + '</div>' +
          '<div class="info"><strong>提醒日：</strong>' + formatSolarDisplay(t.nextReminder, t.remindTime || '08:00') + '</div>' +
          '<div class="info"><strong>提前提醒：</strong>' + reminderStr + '</div>' +
          '<div class="info"><strong>自动续订：</strong>' + (t.autoRenew ? '✅ 开启' : '—') + '</div>' +
          '<div class="info"><strong>备注：</strong>' + escapeHtml(t.remark || '-') + '</div>' +
          '<span class="status ' + (isExpired ? 'status-expired' : 'status-active') + '">' + (isExpired ? '⚠️ 已过期' : '✅ 进行中') + '</span>' +
          '<div class="actions">' +
          renewBtn +
          '<button class="btn-primary btn-sm" onclick="editTask(\\'' + t.id + '\\')">✏️ 编辑</button>' +
          '<button class="btn-history btn-sm" onclick="viewHistory(\\'' + t.id + '\\')">📜 历史</button>' +
          '<button class="btn-warning btn-sm" onclick="testTask(\\'' + t.id + '\\')">📤 测试</button>' +
          '<button class="btn-danger btn-sm" onclick="deleteTask(\\'' + t.id + '\\')">🗑️ 删除</button>' +
          '</div></div>';
      }).join('');
    }

    updateDashboard(tasks);
    updateNextCheckDisplay();
  } catch (e) {
    showToast('加载失败', 'error');
  }
}

function updateDashboard(tasks) {
  const now = new Date();
  const total = tasks.length;
  let expired = 0;
  let soon = 0;
  let active = 0;

  tasks.forEach(t => {
    const dt = new Date(t.nextReminder + 'T' + (t.remindTime || '08:00') + ':00+08:00');

    if (dt < now) {
      expired++;
    } else if ((dt - now) < 24 * 60 * 60 * 1000) {
      soon++;
    } else {
      active++;
    }
  });

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statExpired').textContent = expired;
  document.getElementById('statSoon').textContent = soon;
  document.getElementById('statActive').textContent = active;
}

// ===== 新建/编辑 =====
function openAddModal() {
  document.getElementById('taskModalTitle').textContent = '新建任务';
  document.getElementById('editId').value = '';
  document.getElementById('taskName').value = '';
  document.getElementById('autoRenew').checked = false;
  document.getElementById('taskMode').value = 'periodic';

  const lunarCheckbox = document.getElementById('calendarLunar');
  if (lunarCheckbox) lunarCheckbox.checked = false;

  populateLunarYears();
  populateLunarDays();

  document.getElementById('lunarMonth').value = '1';
  document.getElementById('lunarDay').value = '1';
  document.getElementById('lunarLeap').checked = false;

  const today = formatDateBeijing(new Date());

  document.getElementById('startDate').value = today;
  document.getElementById('startTime').value = '08:00';
  document.getElementById('singleReminderDate').value = today;
  document.getElementById('singleReminderTime').value = '08:00';
  document.getElementById('reminderDate').value = '';
  document.getElementById('remindTime').value = '08:00';
  document.getElementById('periodValue').value = '1';
  document.getElementById('periodUnit').value = 'month';
  document.getElementById('remark').value = '';

  loadReminderGroups([]);
  toggleModeFields();
  updateNextDateFromStart();
  validateTime();
  openModal('taskModal');
}
async function editTask(id) {
  const resp = await fetch('/api/tasks', { headers: getHeaders() });
  const data = await resp.json();
  const t = data.tasks.find(x => x.id === id);

  if (!t) {
    showToast('任务不存在', 'error');
    return;
  }

  const isLunarPeriodic = t.calendarType === 'lunar' || t.mode === 'lunar';
  const isSingle = t.mode === 'countdown';

  document.getElementById('taskModalTitle').textContent = '编辑任务';
  document.getElementById('editId').value = id;
  document.getElementById('taskName').value = t.name;
  document.getElementById('autoRenew').checked = isSingle ? false : !!t.autoRenew;
  document.getElementById('taskMode').value = isSingle ? 'countdown' : 'periodic';
  document.getElementById('reminderDate').value = t.nextReminder || '';
  document.getElementById('remindTime').value = t.remindTime || '08:00';

  const lunarCheckbox = document.getElementById('calendarLunar');
  if (lunarCheckbox) lunarCheckbox.checked = isLunarPeriodic && !isSingle;

  if (isSingle) {
    document.getElementById('singleReminderDate').value = t.nextReminder || formatDateBeijing(new Date());
    document.getElementById('singleReminderTime').value = t.remindTime || '08:00';
    document.getElementById('startDate').value = t.startDate || formatDateBeijing(new Date());
    document.getElementById('startTime').value = t.startTime || t.remindTime || '08:00';
  } else {
    document.getElementById('startDate').value = t.startDate || formatDateBeijing(new Date());
    document.getElementById('startTime').value = t.startTime || t.remindTime || '08:00';
    document.getElementById('periodValue').value = t.periodValue || 1;
    document.getElementById('periodUnit').value = t.periodUnit || (isLunarPeriodic ? 'year' : 'month');

    if (isLunarPeriodic) {
      populateLunarYears(t.lunarYear || parseInt((t.nextReminder || formatDateBeijing(new Date())).split('-')[0]));
      populateLunarDays(t.lunarDay || 1);

      document.getElementById('lunarYear').value = t.lunarYear || parseInt((t.nextReminder || formatDateBeijing(new Date())).split('-')[0]);
      document.getElementById('lunarMonth').value = t.lunarMonth || 1;
      document.getElementById('lunarDay').value = t.lunarDay || 1;
      document.getElementById('lunarLeap').checked = t.lunarLeap || false;
    }
  }

  document.getElementById('remark').value = t.remark || '';

  const groups = (t.reminderDays || []).map((v, i) => ({
    value: v,
    unit: (t.reminderUnits && t.reminderUnits[i]) || 'day'
  }));

  loadReminderGroups(groups);
  toggleModeFields();

  if (t.nextReminder) {
    document.getElementById('reminderDate').value = t.nextReminder;
    document.getElementById('remindTime').value = t.remindTime || '08:00';
    updateReminderPreview();
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
  const remark = document.getElementById('remark').value.trim();
  const reminderGroups = getReminderGroups();
  const lunarCheckbox = document.getElementById('calendarLunar');
  const useLunarCalendar = mode === 'periodic' && lunarCheckbox && lunarCheckbox.checked;

  validateTime();

  if (document.getElementById('saveTaskBtn').disabled) return;

  if (!name) {
    showToast('请输入名称', 'error');
    return;
  }

  updateNextDateFromStart();

  const nextReminder = document.getElementById('reminderDate').value;
  const remindTime = document.getElementById('remindTime').value || '08:00';

  if (!nextReminder) {
    showToast('无法计算提醒时间，请检查日期设置', 'error');
    return;
  }

  const parts = remindTime.split(':');
  if (parseInt(parts[1]) % checkInterval !== 0) {
    showToast('提醒分钟必须是 ' + checkInterval + ' 的倍数', 'error');
    return;
  }

  const dueMs = new Date(nextReminder + 'T' + remindTime + ':00+08:00').getTime();
  if (dueMs <= Date.now()) {
    showToast('提醒时间已经过去，请重新选择', 'error');
    return;
  }

  let body = {
    name,
    autoRenew: mode === 'periodic' ? document.getElementById('autoRenew').checked : false,
    mode,
    calendarType: useLunarCalendar ? 'lunar' : 'solar',
    remindTime,
    remark,
    reminderDays: reminderGroups.map(g => g.value),
    reminderUnits: reminderGroups.map(g => g.unit),
    nextReminder
  };

  if (mode === 'periodic') {
    const periodValue = parseInt(document.getElementById('periodValue').value);
    const periodUnit = document.getElementById('periodUnit').value;
    const startTime = document.getElementById('startTime').value || '08:00';

    if (!periodValue || periodValue < 1) {
      showToast('周期必须>0', 'error');
      return;
    }

    body.periodValue = periodValue;
    body.periodUnit = periodUnit;
    body.startTime = startTime;

    if (useLunarCalendar) {
      const lunarYear = parseInt(document.getElementById('lunarYear').value);
      const lunarMonth = parseInt(document.getElementById('lunarMonth').value);
      const lunarDay = parseInt(document.getElementById('lunarDay').value);
      const lunarLeap = document.getElementById('lunarLeap').checked;

      body.lunarYear = lunarYear;
      body.lunarMonth = lunarMonth;
      body.lunarDay = lunarDay;
      body.lunarLeap = lunarLeap;

      if (!isValidLunarDate(lunarYear, lunarMonth, lunarDay, lunarLeap)) {
        showToast('无效农历日期：只有开始日期本身是“闰X月”时才勾选；普通农历生日不要勾选。', 'error');
        return;
      }

      const startSolar = LunarCalendar.lunarToSolar(lunarYear, lunarMonth, lunarDay, lunarLeap);
      if (!startSolar) {
        showToast('无法计算农历开始日期，请检查年份、日期或闰月设置', 'error');
        return;
      }

      body.startDate = formatSolarObj(startSolar);
    } else {
      const startDate = document.getElementById('startDate').value;

      if (!startDate) {
        showToast('请选开始日期', 'error');
        return;
      }

      body.startDate = startDate;
      body.lunarYear = null;
      body.lunarMonth = null;
      body.lunarDay = null;
      body.lunarLeap = false;
    }
  } else if (mode === 'countdown') {
    body.calendarType = 'solar';
    body.autoRenew = false;
    body.startDate = null;
    body.startTime = null;
    body.periodValue = null;
    body.periodUnit = null;
    body.countdownDays = null;
    body.lunarYear = null;
    body.lunarMonth = null;
    body.lunarDay = null;
    body.lunarLeap = false;
  }

  const url = id ? '/api/tasks/' + id : '/api/tasks';
  const method = id ? 'PUT' : 'POST';

  const resp = await fetch(url, {
    method,
    headers: getHeaders(),
    body: JSON.stringify(body)
  });

  const data = await resp.json();

  if (data.success) {
    showToast(id ? '修改成功' : '创建成功');
    closeModal('taskModal');
    loadTasks();
  } else {
    showToast(data.message || '保存失败', 'error');
  }
}

// ===== 续订、删除、历史、测试 =====
async function renewTask(id) {
  if (!confirm('确认续订？')) return;

  const resp = await fetch('/api/tasks/' + id + '/renew', {
    method: 'POST',
    headers: getHeaders()
  });

  const data = await resp.json();

  if (data.success) {
    showToast('续订成功！下次提醒：' + formatDate(data.nextReminder));
    loadTasks();
  } else {
    showToast(data.message || '续订失败', 'error');
  }
}

async function deleteTask(id) {
  if (!confirm('确认删除？')) return;

  const resp = await fetch('/api/tasks/' + id, {
    method: 'DELETE',
    headers: getHeaders()
  });

  const data = await resp.json();

  if (data.success) {
    showToast('已删除');
    loadTasks();
  } else {
    showToast(data.message || '删除失败', 'error');
  }
}

async function viewHistory(id) {
  const resp = await fetch('/api/tasks/' + id + '/history', {
    headers: getHeaders()
  });

  const data = await resp.json();
  const list = document.getElementById('historyList');

  if (!data.history || data.history.length === 0) {
    list.innerHTML = '<p style="color:#999;">暂无记录</p>';
  } else {
    list.innerHTML = data.history.map(h =>
      '<div class="history-item">🔄 ' +
      formatFullDate(h.renewedAt) +
      ' → 下次提醒 ' +
      formatDate(h.nextReminder) +
      '</div>'
    ).join('');
  }

  openModal('historyModal');
}

async function viewPushLogs() {
  try {
    const resp = await fetch('/api/push-logs', {
      headers: getHeaders()
    });

    const data = await resp.json();
    const list = document.getElementById('pushLogList');

    if (!data.logs || data.logs.length === 0) {
      list.innerHTML = '<p style="color:#999;">暂无推送日志</p>';
    } else {
      list.innerHTML = data.logs.map(log => {
        const status = log.success ? '✅ 成功' : '❌ 失败';
        const error = log.error
          ? '<div style="color:#e74c3c;font-size:12px;">信息：' +
            String(log.error).replace(/</g, '&lt;').replace(/>/g, '&gt;') +
            '</div>'
          : '';

        return '<div class="history-item">' +
          '<div><strong>' + status + '</strong> ' + (log.type || '-') + '</div>' +
          '<div>📋 任务：' + (log.taskName || '-') + '</div>' +
          '<div>🕒 时间：' + formatFullDate(log.time) + '</div>' +
          '<div>📅 提醒日：' + (log.nextReminder || '-') + ' ' + (log.remindTime || '') + '</div>' +
          error +
        '</div>';
      }).join('');
    }

    openModal('pushLogModal');
  } catch (e) {
    showToast('读取推送日志失败', 'error');
  }
}

async function testTask(id) {
  try {
    const resp = await fetch('/api/tasks/' + id + '/test', {
      method: 'POST',
      headers: getHeaders()
    });

    const data = await resp.json();

    if (data.success) {
      showToast('✅ 测试推送已发送（所有已启用渠道）');
    } else {
      showToast('❌ 失败: ' + data.message, 'error');
    }
  } catch (e) {
    showToast('请求失败', 'error');
  }
}

// ===== 配置 =====
async function openConfigModal() {
  const resp = await fetch('/api/config', {
    headers: getHeaders()
  });

  const data = await resp.json();

  document.getElementById('cfgUsername').value = data.username || '';
  document.getElementById('cfgPassword').value = data.password || '';
  document.getElementById('cfgInterval').value = data.checkInterval || 5;

  const checkboxes = document.querySelectorAll('#notifierCheckboxes input[type="checkbox"]');
  const selected = data.notifierTypes || [];

  checkboxes.forEach(cb => {
    cb.checked = selected.includes(cb.value);
  });

  renderNotifierFields(selected, data);
  openModal('configModal');
}

function renderNotifierFields(selectedTypes, data) {
  const container = document.getElementById('notifierConfigFields');

  const allFields = {
    serverchan: [{ key: 'serverchanKey', label: 'SendKey' }],
    pushplus: [{ key: 'pushplusToken', label: 'Token' }],
    telegram: [
      { key: 'tgBotToken', label: 'Bot Token' },
      { key: 'tgChatId', label: 'Chat ID' }
    ],
    email: [
      { key: 'emailFrom', label: '发件邮箱' },
      { key: 'emailTo', label: '收件邮箱（多个用英文逗号分隔）' },
      { key: 'emailApiKey', label: 'API Key (Resend)' }
    ],
    brevo: [
      { key: 'brevoFrom', label: '发件邮箱' },
      { key: 'brevoFromName', label: '发件人名称（可选）' },
      { key: 'brevoTo', label: '收件邮箱（多个用英文逗号分隔）' },
      { key: 'brevoApiKey', label: 'API Key (Brevo)' }
    ],
    notifyx: [{ key: 'notifyxApiKey', label: 'API Key' }]
  };

  let html = '';

  selectedTypes.forEach(type => {
    const fields = allFields[type] || [];

    if (fields.length) {
      html += '<div class="config-detail"><strong>' + type + '</strong>';

      fields.forEach(f => {
        const val = data[f.key] || '';
        html += '<label>' + f.label + '</label><input type="text" id="cfg_' + f.key + '" value="' + val + '">';
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

function validateInterval() {
  const input = document.getElementById('cfgInterval');
  const hint = document.getElementById('intervalHint');
  const val = parseInt(input.value) || 5;

  if (val < 1 || val > 60) {
    hint.style.color = '#e74c3c';
    hint.textContent = '检测间隔必须在 1-60 分钟之间';
  } else {
    hint.style.color = '#888';
    hint.textContent = '当前检测间隔：' + val + ' 分钟。提醒时间的分钟数需要是它的倍数。';
  }
}

async function saveConfig() {
  const config = {
    username: document.getElementById('cfgUsername').value.trim(),
    password: document.getElementById('cfgPassword').value.trim(),
    checkInterval: parseInt(document.getElementById('cfgInterval').value) || 5
  };

  const checkboxes = document.querySelectorAll('#notifierCheckboxes input[type="checkbox"]:checked');
  config.notifierTypes = Array.from(checkboxes).map(cb => cb.value);

  document.querySelectorAll('#notifierConfigFields input').forEach(el => {
    const key = el.id.replace('cfg_', '');
    config[key] = el.value.trim();
  });

  if (!config.username || !config.password) {
    showToast('用户名密码不能空', 'error');
    return;
  }

  if (config.notifierTypes.length === 0) {
    showToast('请至少选择一个推送渠道', 'error');
    return;
  }

  if (config.checkInterval < 1 || config.checkInterval > 60) {
    showToast('检测间隔必须在1-60之间', 'error');
    return;
  }

  const resp = await fetch('/api/config', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(config)
  });

  const data = await resp.json();

  if (data.success) {
    closeModal('configModal');
    showToast('配置保存成功');
    checkInterval = config.checkInterval;
    updateNextCheckDisplay();
    loadTasks();
  } else {
    showToast(data.message || '保存失败', 'error');
  }
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

// 初始化
(async function init() {
  await fetchInterval();
  loadTasks();
  setInterval(() => {
    updateNextCheckDisplay();
  }, 60000);
})();
</script>
</body></html>`;
}

// ============================================================
// JWT 简化实现
// ============================================================
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createToken(username, secret) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = btoa(JSON.stringify({ username, exp }));
  const sig = await sha256(payload + secret);
  return payload + '.' + sig;
}

async function verifyToken(token, secret) {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const payload = parts[0];
  const sig = parts[1];
  const expected = await sha256(payload + secret);

  if (sig !== expected) return false;

  try {
    const data = JSON.parse(atob(payload));
    return data.exp > Date.now();
  } catch (e) {
    return false;
  }
}

// ============================================================
// 日期工具
// ============================================================
function formatDateLocal(d) {
  return d.getUTCFullYear() + '-' +
    String(d.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(d.getUTCDate()).padStart(2, '0');
}

function parseDateLocal(dateStr) {
  const parts = dateStr.split('-').map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

function formatDateBeijingForWorker(d) {
  const bj = new Date(d.getTime() + 8 * 60 * 60 * 1000);

  return bj.getUTCFullYear() + '-' +
    String(bj.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(bj.getUTCDate()).padStart(2, '0');
}

function formatTimeBeijingForWorker(d) {
  const bj = new Date(d.getTime() + 8 * 60 * 60 * 1000);

  return String(bj.getUTCHours()).padStart(2, '0') + ':' +
    String(bj.getUTCMinutes()).padStart(2, '0');
}

function parseDateTimeLocal(dateStr, timeStr) {
  const dateParts = dateStr.split('-').map(Number);
  const timeParts = (timeStr || '08:00').split(':').map(Number);

  return new Date(Date.UTC(
    dateParts[0],
    dateParts[1] - 1,
    dateParts[2],
    timeParts[0] || 0,
    timeParts[1] || 0,
    0
  ));
}

function formatTimeLocal(d) {
  return String(d.getUTCHours()).padStart(2, '0') + ':' +
    String(d.getUTCMinutes()).padStart(2, '0');
}

function daysInUtcMonthForWorker(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function addMonthsClampedForWorker(d, months) {
  const day = d.getUTCDate();
  const targetMonth = d.getUTCMonth() + months;
  const result = new Date(d.getTime());

  result.setUTCDate(1);
  result.setUTCMonth(targetMonth);
  result.setUTCDate(Math.min(day, daysInUtcMonthForWorker(result.getUTCFullYear(), result.getUTCMonth())));

  return result;
}

function addYearsClampedForWorker(d, years) {
  const day = d.getUTCDate();
  const result = new Date(d.getTime());

  result.setUTCDate(1);
  result.setUTCFullYear(result.getUTCFullYear() + years);
  result.setUTCDate(Math.min(day, daysInUtcMonthForWorker(result.getUTCFullYear(), result.getUTCMonth())));

  return result;
}

function addPeriodToDateTimeForWorker(d, value, unit) {
  const result = new Date(d.getTime());

  switch (unit) {
    case 'hour':
      result.setUTCHours(result.getUTCHours() + value);
      return result;
    case 'day':
      result.setUTCDate(result.getUTCDate() + value);
      return result;
    case 'week':
      result.setUTCDate(result.getUTCDate() + value * 7);
      return result;
    case 'month':
      return addMonthsClampedForWorker(result, value);
    case 'year':
      return addYearsClampedForWorker(result, value);
    default:
      return result;
  }
}

function makeRemindDateTime(task) {
  return new Date(task.nextReminder + 'T' + (task.remindTime || '08:00') + ':00+08:00');
}

function makeAdvanceTriggerTime(task, value, unit) {
  const trigger = makeRemindDateTime(task);

  if (unit === 'hour') {
    trigger.setHours(trigger.getHours() - value);
  } else {
    trigger.setDate(trigger.getDate() - value);
  }

  return trigger;
}

function getRetryWindowMinutes(config) {
  const interval = parseInt(config.checkInterval) || 5;
  return Math.max(interval * 10 + 2, 52);
}


async function shouldRunScheduledCheck(kv, interval, scheduledTime) {
  const nowMs = Number(scheduledTime) || Date.now();
  const scheduled = new Date(nowMs);
  const minute = scheduled.getUTCMinutes();
  const safeInterval = Math.max(1, Math.min(60, parseInt(interval) || 5));

  // 按标准分钟点执行：5 分钟就是 00、05、10、15...
  // 使用 scheduledTime，避免 Cloudflare 实际启动晚几秒导致错过检测点。
  if (minute % safeInterval !== 0) return false;

  const slotKey = 'scheduler_slot_' + Math.floor(nowMs / 60000);

  try {
    const existed = await kv.get(slotKey);
    if (existed) return false;
  } catch (e) {}

  await kv.put(slotKey, '1', { expirationTtl: 2 * 24 * 60 * 60 });
  return true;
}

function formatSolarObjForWorker(solar) {
  return solar.year + '-' +
    String(solar.month).padStart(2, '0') + '-' +
    String(solar.day).padStart(2, '0');
}

function getValidLunarTargetSolarForWorker(year, month, day, isLeap) {
  if (year < 1900 || year > 2100) return null;

  const days = LunarCalendar.getLunarMonthDays(year, month, isLeap);
  if (days <= 0) return null;

  const realDay = Math.min(day, days);
  return LunarCalendar.lunarToSolar(year, month, realDay, isLeap);
}

function addLunarMonthsForWorker(year, month, addMonths) {
  const total = year * 12 + (month - 1) + addMonths;

  return {
    year: Math.floor(total / 12),
    month: (total % 12) + 1
  };
}

function calcLunarPeriodicNextDateForWorker(lunarYear, lunarMonth, lunarDay, lunarLeap, periodValue, periodUnit) {
  periodValue = parseInt(periodValue) || 1;
  if (periodValue < 1) periodValue = 1;

  periodUnit = periodUnit || 'year';

  if (periodUnit === 'day' || periodUnit === 'week') {
    const startSolar = LunarCalendar.lunarToSolar(lunarYear, lunarMonth, lunarDay, lunarLeap);
    if (!startSolar) return null;

    const d = new Date(Date.UTC(startSolar.year, startSolar.month - 1, startSolar.day));

    if (periodUnit === 'day') {
      d.setUTCDate(d.getUTCDate() + periodValue);
    } else {
      d.setUTCDate(d.getUTCDate() + periodValue * 7);
    }

    return formatDateLocal(d);
  }

  let targetYear = lunarYear;
  let targetMonth = lunarMonth;
  let targetLeap = false;

  if (periodUnit === 'year') {
    targetYear = lunarYear + periodValue;
    targetMonth = lunarMonth;
    targetLeap = !!lunarLeap;
  } else if (periodUnit === 'month') {
    const next = addLunarMonthsForWorker(lunarYear, lunarMonth, periodValue);
    targetYear = next.year;
    targetMonth = next.month;
    targetLeap = false;
  }

  for (let i = 0; i < 300; i++) {
    const solar = getValidLunarTargetSolarForWorker(targetYear, targetMonth, lunarDay, targetLeap);

    if (solar) {
      return formatSolarObjForWorker(solar);
    }

    if (periodUnit === 'year') {
      targetYear += periodValue;
    } else if (periodUnit === 'month') {
      const next = addLunarMonthsForWorker(targetYear, targetMonth, periodValue);
      targetYear = next.year;
      targetMonth = next.month;
      targetLeap = false;
    } else {
      return null;
    }
  }

  return null;
}

function calcNextFromReminderDate(task) {
  if (!task || !task.nextReminder) return null;

  const val = parseInt(task.periodValue) || 1;
  const unit = task.periodUnit || 'month';
  const isLunarPeriodic = task.calendarType === 'lunar' || task.mode === 'lunar';
  const currentTime = task.remindTime || '08:00';

  if (isLunarPeriodic) {
    if (unit === 'hour' || unit === 'day' || unit === 'week') {
      const d = parseDateTimeLocal(task.nextReminder, currentTime);
      const next = addPeriodToDateTimeForWorker(d, val, unit);

      return {
        nextReminder: formatDateLocal(next),
        remindTime: formatTimeLocal(next)
      };
    }

    const parts = task.nextReminder.split('-').map(Number);

    const currentLunar = LunarCalendar.solarToLunar(
      parts[0],
      parts[1],
      parts[2]
    );

    if (!currentLunar) return null;

    const nextDate = calcLunarPeriodicNextDateForWorker(
      currentLunar.lunarYear,
      currentLunar.lunarMonth,
      currentLunar.lunarDay,
      currentLunar.isLeapMonth,
      val,
      unit || 'year'
    );

    if (!nextDate) return null;

    return {
      nextReminder: nextDate,
      remindTime: currentTime
    };
  }

  if (task.mode === 'periodic') {
    const d = parseDateTimeLocal(task.nextReminder, currentTime);
    const next = addPeriodToDateTimeForWorker(d, val, unit);

    return {
      nextReminder: formatDateLocal(next),
      remindTime: formatTimeLocal(next)
    };
  }

  return null;
}

// ============================================================
// 推送日志
// ============================================================
async function addPushLog(kv, log) {
  try {
    let logs = [];

    try {
      const raw = await kv.get('push_logs');
      logs = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(logs)) logs = [];
    } catch (e) {
      logs = [];
    }

    logs.unshift({
      time: new Date().toISOString(),
      type: log.type || '提醒',
      taskId: log.taskId || '',
      taskName: log.taskName || '',
      nextReminder: log.nextReminder || '',
      remindTime: log.remindTime || '',
      success: !!log.success,
      error: log.error || ''
    });

    logs = logs.slice(0, 50);

    await kv.put('push_logs', JSON.stringify(logs));
  } catch (e) {
    console.log('[推送日志] 写入失败：' + e.message);
  }
}

// ============================================================
// 推送重试状态处理
// 规则：
// 1. 每次 Cron 每个尚未成功的渠道只尝试 1 次。
// 2. 已成功渠道后续重试会跳过，避免重复推送。
// 3. 每个渠道独立最多尝试 10 次。
// 4. 全部渠道成功，或所有失败渠道达到 10 次后，本提醒点结束。
// 5. 单个提醒点结束后写 doneKey，不影响下一周期。
// ============================================================
async function handleNotificationWithRetryState(kv, config, task, notifyKey, logType, title, content) {
  const doneKey = 'done_' + notifyKey;
  const retryKey = 'retry_' + notifyKey;

  const alreadyDone = await kv.get(doneKey);
  if (alreadyDone) {
    return {
      finished: true,
      success: true,
      skipped: true,
      reason: 'already_done'
    };
  }

  const enabledTypes = Array.isArray(config.notifierTypes)
    ? [...new Set(config.notifierTypes.filter(Boolean))]
    : [];

  if (enabledTypes.length === 0) {
    await addPushLog(kv, {
      type: logType,
      taskId: task.id,
      taskName: task.name,
      nextReminder: task.nextReminder,
      remindTime: task.remindTime || '08:00',
      success: false,
      error: '未启用任何推送渠道'
    });
    return { finished: false, success: false, reason: 'no_channel' };
  }

  let retryState = {
    attempts: 0,
    firstAt: '',
    lastAt: '',
    stopped: false,
    channels: {}
  };

  try {
    const raw = await kv.get(retryKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      retryState = {
        attempts: Number(parsed.attempts) || 0,
        firstAt: parsed.firstAt || '',
        lastAt: parsed.lastAt || '',
        stopped: !!parsed.stopped,
        channels: parsed.channels && typeof parsed.channels === 'object' ? parsed.channels : {}
      };
    }
  } catch (e) {}

  for (const type of enabledTypes) {
    const old = retryState.channels[type] || {};
    retryState.channels[type] = {
      attempts: Number(old.attempts) || 0,
      success: !!old.success,
      lastError: old.lastError || ''
    };
  }

  // 配置中已取消的渠道不再阻塞当前提醒点。
  for (const type of Object.keys(retryState.channels)) {
    if (!enabledTypes.includes(type)) delete retryState.channels[type];
  }

  const isFinishedChannel = type => {
    const state = retryState.channels[type];
    return state.success || state.attempts >= 10;
  };

  if (enabledTypes.every(isFinishedChannel)) {
    const allSuccess = enabledTypes.every(type => retryState.channels[type].success);
    retryState.stopped = true;
    await kv.put(doneKey, new Date().toISOString(), { expirationTtl: 400 * 24 * 60 * 60 });
    if (allSuccess) await kv.delete(retryKey);
    else await kv.put(retryKey, JSON.stringify(retryState), { expirationTtl: 400 * 24 * 60 * 60 });
    return {
      finished: true,
      success: allSuccess,
      skipped: true,
      reason: allSuccess ? 'all_succeeded' : 'max_attempts_reached'
    };
  }

  // 同一个提醒点，每个配置周期只允许尝试一次。
  if (retryState.lastAt) {
    const last = new Date(retryState.lastAt);
    const interval = parseInt(config.checkInterval) || 5;
    const diffMinutes = (Date.now() - last.getTime()) / 60000;

    if (diffMinutes < interval - 0.2) {
      return {
        finished: false,
        success: false,
        skipped: true,
        reason: 'wait_next_retry'
      };
    }
  }

  const pendingTypes = enabledTypes.filter(type => !isFinishedChannel(type));
  const result = await sendNotification(config, title, content, task, pendingTypes);
  const nowIso = new Date().toISOString();

  for (const channelResult of result.results) {
    const channelState = retryState.channels[channelResult.type];
    if (!channelState) continue;
    channelState.attempts += 1;
    channelState.success = !!channelResult.success;
    channelState.lastError = channelResult.success ? '' : (channelResult.error || '发送失败');
  }

  retryState.attempts = Math.max(...enabledTypes.map(type => retryState.channels[type].attempts), 0);
  if (!retryState.firstAt) retryState.firstAt = nowIso;
  retryState.lastAt = nowIso;

  const allSuccess = enabledTypes.every(type => retryState.channels[type].success);
  const finished = enabledTypes.every(isFinishedChannel);
  retryState.stopped = finished;

  const summary = enabledTypes.map(type => {
    const state = retryState.channels[type];
    if (state.success) return type + '：成功（第 ' + state.attempts + ' 次）';
    if (state.attempts >= 10) return type + '：失败 10 次，已停止（' + (state.lastError || '未知错误') + '）';
    return type + '：第 ' + state.attempts + '/10 次失败（' + (state.lastError || '未知错误') + '）';
  }).join('；');

  if (finished) {
    await kv.put(doneKey, nowIso, { expirationTtl: 400 * 24 * 60 * 60 });
    if (allSuccess) {
      await kv.delete(retryKey);
    } else {
      await kv.put(retryKey, JSON.stringify(retryState), { expirationTtl: 400 * 24 * 60 * 60 });
    }
  } else {
    await kv.put(retryKey, JSON.stringify(retryState), { expirationTtl: 400 * 24 * 60 * 60 });
  }

  await addPushLog(kv, {
    type: logType,
    taskId: task.id,
    taskName: task.name,
    nextReminder: task.nextReminder,
    remindTime: task.remindTime || '08:00',
    success: allSuccess,
    error: summary
  });

  return {
    finished,
    success: allSuccess,
    attempts: retryState.attempts,
    channels: retryState.channels
  };
}

async function ensureDueReminderCanFinish(kv, config, task, dueNotifyKey) {
  const doneKey = 'done_' + dueNotifyKey;
  const retryKey = 'retry_' + dueNotifyKey;

  const dueDone = await kv.get(doneKey);
  if (dueDone) return true;

  const remindDateTime = makeRemindDateTime(task);
  const dueMinutes = (Date.now() - remindDateTime.getTime()) / 60000;
  const windowMinutes = getRetryWindowMinutes(config);

  if (dueMinutes < windowMinutes) {
    return false;
  }

  let retryState = null;

  try {
    const raw = await kv.get(retryKey);
    retryState = raw ? JSON.parse(raw) : null;
  } catch (e) {}

  await kv.put(doneKey, new Date().toISOString(), { expirationTtl: 400 * 24 * 60 * 60 });

  await addPushLog(kv, {
    type: '到期提醒',
    taskId: task.id,
    taskName: task.name,
    nextReminder: task.nextReminder,
    remindTime: task.remindTime || '08:00',
    success: false,
    error: '到期提醒重试窗口已结束，已尝试 ' + ((retryState && retryState.attempts) || 0) + ' 次。为避免影响下周期，允许自动续订。'
  });

  return true;
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
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    if (path === '/login') {
      return new Response(getLoginPage(), {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8'
        }
      });
    }

    if (path === '/' || path === '') {
      return new Response(getDashboardPage(), {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8'
        }
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    };

    const config = await getConfig(env);
    const kv = env.TASKS_KV;

    if (path === '/api/login' && method === 'POST') {
      const body = await request.json();

      if (body.username === config.username && body.password === config.password) {
        const token = await createToken(body.username, config.jwtSecret);

        return new Response(JSON.stringify({
          success: true,
          token
        }), {
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify({
        success: false,
        message: '用户名或密码错误'
      }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const auth = request.headers.get('Authorization');
    let authed = false;

    if (auth && auth.startsWith('Bearer ')) {
      try {
        authed = await verifyToken(auth.slice(7), config.jwtSecret);
      } catch (e) {}
    }

    if (!authed) {
      return new Response(JSON.stringify({
        success: false,
        message: '未授权'
      }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // ---------- 任务列表 ----------
    if (path === '/api/tasks' && method === 'GET') {
      const tasks = await getAllTasks(kv);

      return new Response(JSON.stringify({
        success: true,
        tasks
      }), {
        headers: corsHeaders
      });
    }

    // ---------- 新建任务 ----------
    if (path === '/api/tasks' && method === 'POST') {
      const body = await request.json();

      const {
        name,
        autoRenew,
        mode,
        calendarType,
        startDate,
        startTime,
        periodValue,
        periodUnit,
        countdownDays,
        remindTime,
        reminderDays,
        reminderUnits,
        remark,
        lunarYear,
        lunarMonth,
        lunarDay,
        lunarLeap,
        nextReminder
      } = body;

      if (!name) return errorResponse('缺少任务名称', 400);

      const interval = config.checkInterval || 5;
      const parts = (remindTime || '08:00').split(':');

      if (parseInt(parts[1]) % interval !== 0) {
        return errorResponse('提醒分钟必须是 ' + interval + ' 的倍数', 400);
      }

      if (!nextReminder) return errorResponse('缺少提醒日期', 400);

      if (new Date(nextReminder + 'T' + (remindTime || '08:00') + ':00+08:00').getTime() <= Date.now()) {
        return errorResponse('提醒时间已经过去，请重新选择', 400);
      }

      const task = {
        id: crypto.randomUUID(),
        name,
        autoRenew: (mode === 'countdown') ? false : !!autoRenew,
        mode: mode === 'lunar' ? 'periodic' : (mode || 'periodic'),
        calendarType: calendarType || (mode === 'lunar' ? 'lunar' : 'solar'),
        remindTime: remindTime || '08:00',
        reminderDays: (reminderDays || []).map(Number),
        reminderUnits: reminderUnits || [],
        remark: remark || '',
        createdAt: new Date().toISOString(),
        nextReminder,
        startDate: startDate || null,
        startTime: startTime || null,
        periodValue: periodValue || null,
        periodUnit: periodUnit || null,
        countdownDays: countdownDays || null,
        lunarYear: lunarYear || null,
        lunarMonth: lunarMonth || null,
        lunarDay: lunarDay || null,
        lunarLeap: lunarLeap || false
      };

      await kv.put('task_' + task.id, JSON.stringify(task));
      await kv.put('history_' + task.id, JSON.stringify([]));

      return new Response(JSON.stringify({
        success: true,
        task
      }), {
        headers: corsHeaders
      });
    }

    // ---------- 修改任务 ----------
    if (path.startsWith('/api/tasks/') && method === 'PUT') {
      const id = path.split('/')[3];
      const existingRaw = await kv.get('task_' + id);

      if (!existingRaw) return errorResponse('任务不存在', 404);

      const task = JSON.parse(existingRaw);
      const body = await request.json();

      task.name = body.name || task.name;
      task.mode = body.mode === 'lunar' ? 'periodic' : (body.mode || task.mode);
      task.autoRenew = task.mode === 'countdown' ? false : (body.autoRenew !== undefined ? !!body.autoRenew : !!task.autoRenew);
      task.calendarType = body.calendarType || (body.mode === 'lunar' ? 'lunar' : (task.calendarType || 'solar'));
      task.remindTime = body.remindTime || '08:00';
      task.remark = body.remark || '';
      task.reminderDays = (body.reminderDays || []).map(Number);
      task.reminderUnits = body.reminderUnits || [];
      task.nextReminder = body.nextReminder || task.nextReminder;
      task.startDate = body.startDate !== undefined ? body.startDate : task.startDate;
      task.startTime = body.startTime !== undefined ? body.startTime : task.startTime;
      task.periodValue = body.periodValue !== undefined ? body.periodValue : task.periodValue;
      task.periodUnit = body.periodUnit !== undefined ? body.periodUnit : task.periodUnit;
      task.countdownDays = body.countdownDays !== undefined ? body.countdownDays : task.countdownDays;
      task.lunarYear = body.lunarYear !== undefined ? body.lunarYear : task.lunarYear;
      task.lunarMonth = body.lunarMonth !== undefined ? body.lunarMonth : task.lunarMonth;
      task.lunarDay = body.lunarDay !== undefined ? body.lunarDay : task.lunarDay;
      task.lunarLeap = body.lunarLeap !== undefined ? body.lunarLeap : task.lunarLeap;

      const interval = config.checkInterval || 5;
      const parts = task.remindTime.split(':');

      if (parseInt(parts[1]) % interval !== 0) {
        return errorResponse('提醒分钟必须是 ' + interval + ' 的倍数', 400);
      }

      if (!task.nextReminder) return errorResponse('缺少提醒日期', 400);

      if (new Date(task.nextReminder + 'T' + (task.remindTime || '08:00') + ':00+08:00').getTime() <= Date.now()) {
        return errorResponse('提醒时间已经过去，请重新选择', 400);
      }

      await kv.put('task_' + id, JSON.stringify(task));

      return new Response(JSON.stringify({
        success: true,
        task
      }), {
        headers: corsHeaders
      });
    }

    // ---------- 删除任务 ----------
    if (path.startsWith('/api/tasks/') && method === 'DELETE') {
      const id = path.split('/')[3];

      await kv.delete('task_' + id);
      await kv.delete('history_' + id);

      return new Response(JSON.stringify({
        success: true
      }), {
        headers: corsHeaders
      });
    }

    // ---------- 手动续订 ----------
    if (path.startsWith('/api/tasks/') && path.endsWith('/renew') && method === 'POST') {
      const id = path.split('/')[3];
      const existing = await kv.get('task_' + id);

      if (!existing) return errorResponse('任务不存在', 404);

      const task = JSON.parse(existing);

      if (task.mode === 'countdown') {
        return errorResponse('单次提醒不支持续订，请直接编辑提醒日期和提醒时间', 400);
      }

      const today = formatDateBeijingForWorker(new Date());
      let newNext;
      let newTime = task.remindTime || '08:00';
      const isLunarPeriodic = task.calendarType === 'lunar' || task.mode === 'lunar';

      if (isLunarPeriodic && task.periodUnit !== 'hour' && task.periodUnit !== 'day' && task.periodUnit !== 'week') {
        const from = parseDateLocal(today);

        const next = LunarCalendar.nextLunarDate(
          task.lunarMonth,
          task.lunarDay,
          task.lunarLeap,
          from
        );

        if (!next) return errorResponse('无法计算农历日期', 400);

        newNext = next.year + '-' +
          String(next.month).padStart(2, '0') + '-' +
          String(next.day).padStart(2, '0');

        task.mode = 'periodic';
        task.calendarType = 'lunar';
        task.periodValue = task.periodValue || 1;
        task.periodUnit = task.periodUnit || 'year';
      } else if (task.mode === 'periodic' || isLunarPeriodic) {
        const base = parseDateTimeLocal(today, task.remindTime || '08:00');
        const next = addPeriodToDateTimeForWorker(
          base,
          parseInt(task.periodValue) || 1,
          task.periodUnit || 'month'
        );

        newNext = formatDateLocal(next);
        newTime = formatTimeLocal(next);
      } else {
        return errorResponse('未知模式', 400);
      }

      task.startDate = today;
      task.startTime = task.remindTime || '08:00';
      task.nextReminder = newNext;
      task.remindTime = newTime;

      if (task.calendarType === 'lunar' || task.mode === 'lunar') {
        const lunar = LunarCalendar.solarToLunar(
          parseInt(newNext.split('-')[0]),
          parseInt(newNext.split('-')[1]),
          parseInt(newNext.split('-')[2])
        );

        if (lunar) {
          task.lunarYear = lunar.lunarYear;
          task.lunarMonth = lunar.lunarMonth;
          task.lunarDay = lunar.lunarDay;
          task.lunarLeap = lunar.isLeapMonth;
        }
      }

      await kv.put('task_' + id, JSON.stringify(task));

      const historyRaw = await kv.get('history_' + id);
      let history = historyRaw ? JSON.parse(historyRaw) : [];

      history.push({
        renewedAt: new Date().toISOString(),
        nextReminder: task.nextReminder,
        remindTime: task.remindTime || '08:00'
      });

      if (history.length > 21) history = history.slice(-21);

      await kv.put('history_' + id, JSON.stringify(history));

      return new Response(JSON.stringify({
        success: true,
        nextReminder: task.nextReminder,
        remindTime: task.remindTime || '08:00'
      }), {
        headers: corsHeaders
      });
    }

    // ---------- 续订历史 ----------
    if (path.startsWith('/api/tasks/') && path.endsWith('/history') && method === 'GET') {
      const id = path.split('/')[3];
      const historyRaw = await kv.get('history_' + id);
      const history = historyRaw ? JSON.parse(historyRaw) : [];

      return new Response(JSON.stringify({
        success: true,
        history
      }), {
        headers: corsHeaders
      });
    }

    // ---------- 测试推送 ----------
    if (path.startsWith('/api/tasks/') && path.endsWith('/test') && method === 'POST') {
      const id = path.split('/')[3];
      const existing = await kv.get('task_' + id);

      if (!existing) return errorResponse('任务不存在', 404);

      const task = JSON.parse(existing);
      const title = '🧪 测试推送：' + task.name;
      const content =
        '这是任务 "' + task.name + '" 的测试消息。\n' +
        '📅 提醒日：' + task.nextReminder + ' ' + (task.remindTime || '08:00') + '\n' +
        '📝 备注：' + (task.remark || '无');

      const result = await sendNotification(config, title, content, task);

      await addPushLog(kv, {
        type: '测试推送',
        taskId: task.id,
        taskName: task.name,
        nextReminder: task.nextReminder,
        remindTime: task.remindTime || '08:00',
        success: result.success,
        error: result.error || ''
      });

      if (result.success) {
        return new Response(JSON.stringify({
          success: true
        }), {
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify({
        success: false,
        message: result.error
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // ---------- 推送日志 ----------
    if (path === '/api/push-logs' && method === 'GET') {
      const raw = await kv.get('push_logs');
      const logs = raw ? JSON.parse(raw) : [];

      return new Response(JSON.stringify({
        success: true,
        logs
      }), {
        headers: corsHeaders
      });
    }

    // ---------- 配置读取 ----------
    if (path === '/api/config' && method === 'GET') {
      const cfg = await getConfig(env);

      return new Response(JSON.stringify(cfg), {
        headers: corsHeaders
      });
    }

    // ---------- 配置保存 ----------
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

      const newConfig = {
        ...existing,
        ...body
      };

      await kv.put('config', JSON.stringify(newConfig));

      return new Response(JSON.stringify({
        success: true
      }), {
        headers: corsHeaders
      });
    }

    return new Response('Not Found', {
      status: 404
    });
  },

  // ============================================================
  // 定时任务
  // 规则：
  // 1. Cloudflare 每到检测点执行一次。
  // 2. 同一个提醒点每次 Cron 只推送 1 次。
  // 3. 任意一个渠道成功，本提醒点结束。
  // 4. 全部渠道失败，下一个 Cron 再试。
  // 5. 最多 10 次。
  // 6. 到期提醒完成后，才自动续订。
  // 7. 自动续订后 nextReminder 变化，下周期重新开始。
  // ============================================================
  async scheduled(event, env, ctx) {
    const kv = env.TASKS_KV;
    const config = await getConfig(env);
    const interval = Math.min(60, Math.max(1, parseInt(config.checkInterval) || 5));
    const nowMs = Number(event.scheduledTime) || Date.now();
    const now = new Date(nowMs);

    // Cron 每分钟触发一次，再按标准分钟点执行配置间隔。
    // 例如 5 分钟固定在 00、05、10、15...，不是从部署时间滚动。
    if (!await shouldRunScheduledCheck(kv, interval, nowMs)) return;

    const tasks = await getAllTasks(kv);
    const retryWindowMinutes = getRetryWindowMinutes(config);

    for (const task of tasks) {
      if (!task.nextReminder) continue;

      const remindDateTime = makeRemindDateTime(task);
      const reminderDays = task.reminderDays || [];
      const reminderUnits = task.reminderUnits || [];
      const dueMinutes = (now.getTime() - remindDateTime.getTime()) / 60000;
      const dueNotifyKey = 'due_' + task.id + '_' + task.nextReminder + '_' + (task.remindTime || '08:00');

      // 1）提前提醒：每个提前点独立，最多 10 次
      for (let i = 0; i < reminderDays.length; i++) {
        const val = Number(reminderDays[i]);
        const unit = reminderUnits[i] || 'day';

        if (!val || val <= 0) continue;

        const triggerTime = makeAdvanceTriggerTime(task, val, unit);
        const diffMinutes = (now.getTime() - triggerTime.getTime()) / 60000;

        if (diffMinutes >= 0 && diffMinutes <= retryWindowMinutes) {
          const title = '⏰ 任务提醒：' + task.name;
          const content =
            '📋 "' + task.name + '" 提醒日即将到来！\n' +
            '📅 日期：' + task.nextReminder + ' ' + (task.remindTime || '08:00') + '\n' +
            '⏳ 提前提醒：' + val + (unit === 'hour' ? '小时' : '天') + '\n' +
            '📝 备注：' + (task.remark || '无');

          const notifyKey = 'advance_' +
            task.id + '_' +
            task.nextReminder + '_' +
            (task.remindTime || '08:00') + '_' +
            val + '_' +
            unit;

          await handleNotificationWithRetryState(
            kv,
            config,
            task,
            notifyKey,
            '提前提醒',
            title,
            content
          );

          // 一次 Cron 只处理一个提前提醒点，避免同一时间多组提醒刷屏
          break;
        }
      }

      // 2）到期日当天准点提醒
      if (dueMinutes >= 0 && dueMinutes <= retryWindowMinutes) {
        const title = '📌 到期提醒：' + task.name;
        const content =
          '📋 "' + task.name + '" 已到提醒时间！\n' +
          '📅 提醒日：' + task.nextReminder + ' ' + (task.remindTime || '08:00') + '\n' +
          '📝 备注：' + (task.remark || '无');

        await handleNotificationWithRetryState(
          kv,
          config,
          task,
          dueNotifyKey,
          '到期提醒',
          title,
          content
        );
      }

      // 3）自动续订：到期提醒成功、10次失败，或者重试窗口结束后，才允许续订
      if (task.autoRenew && dueMinutes >= 0) {
        const dueFinished = await ensureDueReminderCanFinish(kv, config, task, dueNotifyKey);

        if (!dueFinished) {
          // 到期提醒还没结束，不续订，避免改掉 nextReminder 导致本周期提醒丢失
          continue;
        }

        const autoRenewKey = 'autorenew_' +
          task.id + '_' +
          task.nextReminder + '_' +
          (task.remindTime || '08:00');

        const alreadyAutoRenewed = await kv.get(autoRenewKey);

        if (!alreadyAutoRenewed) {
          const oldNext = task.nextReminder;
          const oldTime = task.remindTime || '08:00';
          const nextResult = calcNextFromReminderDate(task);

          if (nextResult && nextResult.nextReminder) {
            const newNext = nextResult.nextReminder;
            const newTime = nextResult.remindTime || oldTime;

            if (newNext !== oldNext || newTime !== oldTime) {
              task.startDate = oldNext;
              task.startTime = oldTime;
              task.nextReminder = newNext;
              task.remindTime = newTime;

              if (task.calendarType === 'lunar' || task.mode === 'lunar') {
                const lunar = LunarCalendar.solarToLunar(
                  parseInt(newNext.split('-')[0]),
                  parseInt(newNext.split('-')[1]),
                  parseInt(newNext.split('-')[2])
                );

                if (lunar) {
                  task.lunarYear = lunar.lunarYear;
                  task.lunarMonth = lunar.lunarMonth;
                  task.lunarDay = lunar.lunarDay;
                  task.lunarLeap = lunar.isLeapMonth;
                }
              }

              await kv.put('task_' + task.id, JSON.stringify(task));

              await kv.put(autoRenewKey, new Date().toISOString(), {
                expirationTtl: 400 * 24 * 60 * 60
              });

              await addPushLog(kv, {
                type: '自动续订',
                taskId: task.id,
                taskName: task.name,
                nextReminder: newNext,
                remindTime: newTime,
                success: true,
                error: '旧提醒日：' + oldNext + ' ' + oldTime
              });
            }
          }
        }

        // 自动续订任务完成后，不再发过期提醒
        continue;
      }

      // 4）过期提醒：只给未开启自动续订的任务使用
      const expiredMinutes = (now.getTime() - remindDateTime.getTime()) / 60000;

      if (expiredMinutes >= 60 && expiredMinutes <= 60 + retryWindowMinutes) {
        const title = '⚠️ 任务过期：' + task.name;
        const content =
          '📋 "' + task.name + '" 已过期！\n' +
          '📅 提醒日：' + task.nextReminder + ' ' + (task.remindTime || '08:00') + '\n' +
          '请及时续订。';

        const notifyKey = 'expired_' +
          task.id + '_' +
          task.nextReminder + '_' +
          (task.remindTime || '08:00');

        await handleNotificationWithRetryState(
          kv,
          config,
          task,
          notifyKey,
          '过期提醒',
          title,
          content
        );
      }
    }
  }
};
// ============================================================
// 辅助函数
// ============================================================
function errorResponse(msg, code) {
  return new Response(JSON.stringify({
    success: false,
    message: msg
  }), {
    status: code,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

async function getAllTasks(kv) {
  const tasks = [];
  let cursor = undefined;

  do {
    const listOptions = {
      prefix: 'task_'
    };

    if (cursor) {
      listOptions.cursor = cursor;
    }

    const list = await kv.list(listOptions);

    for (const key of list.keys) {
      const raw = await kv.get(key.name);

      if (raw) {
        try {
          tasks.push(JSON.parse(raw));
        } catch (e) {}
      }
    }

    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  tasks.sort((a, b) => {
    const ad = new Date((a.nextReminder || '2999-12-31') + 'T' + (a.remindTime || '08:00') + ':00+08:00');
    const bd = new Date((b.nextReminder || '2999-12-31') + 'T' + (b.remindTime || '08:00') + ':00+08:00');
    return ad - bd;
  });

  return tasks;
}

function addDays(dateStr, days) {
  const d = parseDateLocal(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateLocal(d);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function safeReadJson(resp) {
  try {
    return await resp.json();
  } catch (e) {
    return null;
  }
}

async function safeReadText(resp) {
  try {
    return await resp.text();
  } catch (e) {
    return '';
  }
}

// ============================================================
// 推送函数
// 注意：这里不做立即重试。
// 每次 Cron 只调用 sendNotification() 一次。
// 重试次数由 handleNotificationWithRetryState() 统一控制。
// ============================================================
async function sendNotification(config, title, content, task, onlyTypes = null) {
  const configuredTypes = Array.isArray(config.notifierTypes) ? config.notifierTypes : [];
  const enabledTypes = Array.isArray(onlyTypes) ? onlyTypes : configuredTypes;

  if (enabledTypes.length === 0) {
    return {
      success: false,
      error: '未启用任何推送渠道',
      results: []
    };
  }

  const results = [];

  for (const type of enabledTypes) {
    let result = {
      type,
      success: false,
      error: ''
    };

    try {
      switch (type) {
        case 'serverchan': {
          if (!config.serverchanKey) {
            result.error = '未配置 SendKey';
            break;
          }

          const sc = await fetch('https://sctapi.ftqq.com/' + config.serverchanKey + '.send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              title,
              desp: content
            })
          });

          result.success = sc.ok;

          if (!result.success) {
            const text = await safeReadText(sc);
            result.error = 'HTTP ' + sc.status + (text ? ': ' + text.substring(0, 100) : '');
          }

          break;
        }

        case 'pushplus': {
          if (!config.pushplusToken) {
            result.error = '未配置 Token';
            break;
          }

          const pp = await fetch('https://www.pushplus.plus/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              token: config.pushplusToken,
              title,
              content
            })
          });

          const ppd = await safeReadJson(pp);

          if (ppd && ppd.code === 200) {
            result.success = true;
          } else {
            result.error = (ppd && (ppd.msg || ppd.message)) || ('HTTP ' + pp.status);
          }

          break;
        }

        case 'telegram': {
          if (!config.tgBotToken || !config.tgChatId) {
            result.error = '未配置 Telegram';
            break;
          }

          const tg = await fetch('https://api.telegram.org/bot' + config.tgBotToken + '/sendMessage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: config.tgChatId,
              text: title + '\n' + content
            })
          });

          const tgd = await safeReadJson(tg);

          if (tgd && tgd.ok) {
            result.success = true;
          } else {
            result.error = (tgd && tgd.description) || ('HTTP ' + tg.status);
          }

          break;
        }

        case 'email': {
          if (!config.emailFrom || !config.emailTo || !config.emailApiKey) {
            result.error = '邮件配置不完整';
            break;
          }

          const html =
            '<h2>' + escapeHtml(title) + '</h2>' +
            '<p>' + escapeHtml(content).replace(/\n/g, '<br>') + '</p>';

          const em = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + config.emailApiKey
            },
            body: JSON.stringify({
              from: config.emailFrom,
              to: [config.emailTo],
              subject: title,
              html
            })
          });

          result.success = em.ok;

          if (!result.success) {
            const text = await safeReadText(em);
            result.error = 'HTTP ' + em.status + (text ? ': ' + text.substring(0, 100) : '');
          }

          break;
        }

        case 'brevo': {
          if (!config.brevoFrom || !config.brevoTo || !config.brevoApiKey) {
            result.error = 'Brevo 邮件配置不完整';
            break;
          }

          const html =
            '<h2>' + escapeHtml(title) + '</h2>' +
            '<p>' + escapeHtml(content).replace(/\n/g, '<br>') + '</p>';

          const recipients = String(config.brevoTo)
            .split(',')
            .map(value => value.trim())
            .filter(Boolean)
            .map(email => ({ email }));

          if (recipients.length === 0) {
            result.error = 'Brevo 收件邮箱为空';
            break;
          }

          const payload = {
            sender: {
              email: config.brevoFrom,
              name: config.brevoFromName || undefined
            },
            to: recipients,
            subject: title,
            textContent: content,
            htmlContent: html
          };

          const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': config.brevoApiKey,
              'accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const data = await safeReadJson(response);
            result.success = !!(data && (data.messageId || (Array.isArray(data.messageIds) && data.messageIds.length)));
            if (!result.success) result.error = 'Brevo 未返回 messageId';
          } else {
            const data = await safeReadJson(response);
            result.error = (data && (data.message || data.code)) || ('HTTP ' + response.status);
          }

          break;
        }

        case 'notifyx': {
          if (!config.notifyxApiKey) {
            result.error = '未配置 NotifyX API Key';
            break;
          }

          const url = 'https://www.notifyx.cn/api/v1/send/' + config.notifyxApiKey;

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: title,
              content: content
            })
          });

          if (!response.ok) {
            const text = await safeReadText(response);
            result.error = 'HTTP ' + response.status + (text ? ': ' + text.substring(0, 100) : '');
            break;
          }

          const data = await safeReadJson(response);

          if (data && (data.status === 'queued' || data.id || data.success === true)) {
            result.success = true;
          } else {
            result.error = (data && (data.message || data.msg)) || '发送失败';
          }

          break;
        }

        default:
          result.error = '未知渠道：' + type;
          break;
      }
    } catch (e) {
      result.error = e.message || String(e);
    }

    results.push(result);

    console.log('[通知] ' + type + ': ' + (result.success ? '✅ 成功' : '❌ ' + result.error));
  }

  const allSuccess = results.length > 0 && results.every(r => r.success);

  const errors = results
    .filter(r => !r.success)
    .map(r => r.type + ': ' + (r.error || '失败'))
    .join('; ');

  return {
    success: allSuccess,
    error: errors || '',
    results
  };
}
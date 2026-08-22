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
  .header-actions { display: grid; grid-template-columns: repeat(3, minmax(130px, 1fr)); gap: 10px; }
  .header-actions button { padding: 10px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: 0.15s; display:flex; align-items:center; justify-content:center; gap:6px; min-height:42px; white-space:nowrap; }
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
  .btn-trash { background: #e84393; color: #fff; }
  .btn-trash:hover { background: #d63078; }
  .btn-backup { background: #0984e3; color: #fff; }
  .btn-backup:hover { background: #0873c4; }
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
  .status-frozen { background: #dbeafe; color: #1d4ed8; }
  .btn-freeze { background: #3498db; color: #fff; }
  .btn-freeze:hover { background: #2980b9; }
  .backup-type-badge { display:inline-block; padding:2px 9px; border-radius:14px; font-size:12px; font-weight:600; margin-right:6px; }
  .backup-type-tasks { background:#e8f4fd; color:#1f6f9f; }
  .backup-type-config { background:#e9f8ef; color:#237a49; }
  .backup-type-both { background:#f1ebff; color:#6c4fb3; }
  .backup-latest-badge { display:inline-block; padding:2px 8px; border-radius:14px; font-size:12px; background:#fff3cd; color:#856404; }
  .status-completed { background: #e9ecef; color: #495057; }
  .task-card .actions { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); justify-content: center; align-items: center; z-index: 1000; }
  .modal.show { display: flex; }
  .modal-content { background: #fff; border-radius: 16px; padding: 32px; max-width: 680px; width: 95%; max-height: 90vh; overflow-y: auto; }
  .modal-content input, .modal-content select, .modal-content textarea { width: 100%; padding: 10px 12px; margin-bottom: 16px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; transition: 0.15s; }
  .modal-content input:focus, .modal-content select:focus, .modal-content textarea:focus { border-color: #4a6cf7; outline: none; }
  .modal-content .form-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .modal-content .form-row > * { flex: 1; min-width: 120px; }
  .periodic-switch { margin: 4px 0 14px 0; }
  .lunar-fields { margin: 2px 0 6px 0; padding: 12px; border-radius: 10px; background: rgba(108,92,231,0.08); }
  .lunar-leap-field { display: flex; align-items: center; gap: 8px; min-width: 180px; padding-bottom: 16px; }
  .lunar-leap-field label { margin-bottom: 0; white-space: nowrap; }
  .lunar-leap-field input { width: auto; margin: 0; }
  .modal-content .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
  .modal-content .form-actions button { padding: 10px 28px; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; transition: 0.15s; }
  .reminder-group { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
  .reminder-group input { flex: 2; min-width: 60px; margin-bottom: 0; }
  .reminder-group select { flex: 1; min-width: 60px; margin-bottom: 0; }
  .reminder-group button { padding: 4px 10px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
  .config-checkbox-group { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px 12px; margin-bottom: 16px; }
  .config-checkbox-group label { display: flex; align-items: center; justify-content: flex-start; gap: 8px; min-width: 0; min-height: 42px; margin: 0; padding: 8px 10px; border: 1px solid #e7e7e7; border-radius: 8px; font-weight: normal; line-height: 1.2; white-space: nowrap; }
  .config-checkbox-group input { width: 18px; height: 18px; min-width: 18px; margin: 0; padding: 0; flex: 0 0 18px; }
  .config-detail { margin-bottom: 12px; border-left: 3px solid #4a6cf7; padding-left: 12px; }
  .toast { position: fixed; left: 50%; bottom: 30px; right: auto; background: #333; color: #fff; padding: 14px 24px; border-radius: 10px; z-index: 2000; opacity: 0; transform: translate(-50%, 20px); transition: all 0.3s; max-width: calc(100vw - 32px); width: max-content; min-width: 220px; text-align: center; line-height: 1.45; display: flex; align-items: center; justify-content: center; white-space: normal; word-break: break-word; }
  .toast.show { opacity: 1; transform: translate(-50%, 0); }
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
  @media (max-width:600px) {
    body { padding: 10px; overflow-x: hidden; }
    .container { width: 100%; max-width: 100%; }

    .dashboard { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding: 12px; margin-bottom: 14px; border-radius: 10px; }
    .dashboard .stat .number { font-size: 23px; }
    .dashboard .stat .label { font-size: 12px; }

    .header { padding: 14px; margin-bottom: 14px; border-radius: 10px; }
    .header h1 { width: 100%; font-size: 21px; }
    .header-actions { width: 100%; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .header-actions button { width: 100%; min-width: 0; min-height: 44px; padding: 10px 6px; font-size: 14px; white-space: normal; line-height: 1.2; }

    .task-grid { grid-template-columns: 1fr; gap: 12px; }
    .task-card { padding: 16px 14px; border-radius: 10px; }
    .task-card .title { font-size: 18px; }
    .task-card .info { font-size: 14px; line-height: 1.5; overflow-wrap: anywhere; }
    .task-card .actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; align-items: stretch; }
    .task-card .actions .btn-sm { width: 100%; min-width: 0; min-height: 38px; padding: 8px 3px; font-size: 12px; white-space: nowrap; }

    .modal { align-items: flex-start; padding: 10px 6px; overflow-y: auto; overscroll-behavior: contain; }
    .modal-content { width: 100%; max-width: none; max-height: calc(100dvh - 20px); padding: 20px 14px 16px; border-radius: 14px; }
    .modal-content h2 { font-size: 21px; margin-bottom: 14px; }
    .modal-content h3 { line-height: 1.35; }
    .modal-content label { display: block; line-height: 1.35; margin-bottom: 6px; overflow-wrap: anywhere; }
    .modal-content input, .modal-content select, .modal-content textarea { font-size: 16px; padding: 11px 12px; margin-bottom: 12px; min-height: 46px; }
    .modal-content textarea { min-height: 86px; }
    .modal-content .form-row { gap: 10px; }
    .modal-content .form-row > * { min-width: 0; }

    #taskModal .task-date-time-row { display: grid; grid-template-columns: 1fr; gap: 0; }
    #taskModal .task-period-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    #taskModal .lunar-fields .form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    #taskModal .lunar-leap-field { min-width: 0; padding-bottom: 12px; align-self: end; min-height: 46px; }
    #taskModal .periodic-switch { margin-bottom: 12px; }

    .reminder-group { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr) 44px; gap: 8px; align-items: center; }
    .reminder-group input, .reminder-group select { width: 100%; min-width: 0; margin-bottom: 0; }
    .reminder-group button { width: 44px; min-width: 44px; min-height: 44px; padding: 4px; }
    .reminder-preview { font-size: 13px; line-height: 1.65; padding: 10px; }

    .modal-content .form-actions { gap: 8px; flex-wrap: wrap; }
    .modal-content .form-actions button { flex: 1 1 120px; min-width: 0; min-height: 44px; padding: 10px 8px; }

    #configModal .config-checkbox-group { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    #configModal .config-checkbox-group label { display: flex; align-items: center; gap: 7px; min-width: 0; min-height: 42px; margin: 0; padding: 8px 9px; border: 1px solid #e7e7e7; border-radius: 8px; white-space: nowrap; font-size: 14px; }
    #configModal .config-checkbox-group input { width: auto; min-height: 0; margin: 0; padding: 0; flex: 0 0 auto; }
    #configModal .config-detail { padding-left: 10px; }
    #configModal .notifier-action-row { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px !important; }
    #configModal .notifier-action-row button { width: 100%; min-height: 40px; padding: 8px 5px; }

    #backupModal .backup-action-grid { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px !important; }
    #backupModal .backup-action-grid button { width: 100%; min-width: 0; min-height: 44px; margin: 0; padding: 9px 5px; }
    #backupModal .backup-list-controls { display: block; }
    #backupModal .backup-list-controls > div { width: 100%; }
    #backupModal .backup-batch-actions { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px !important; margin: 0 0 12px !important; }
    #backupModal .backup-batch-actions button { width: 100%; min-width: 0; min-height: 40px; padding: 7px 3px; font-size: 12px; white-space: nowrap; }
    #backupModal #backupList .history-item { padding: 12px 0; line-height: 1.5; }
    #backupModal .backup-type-badge, #backupModal .backup-latest-badge { margin-top: 2px; margin-bottom: 2px; }

    #restoreBackupModal .modal-content, #unfreezeModal .modal-content, #onedriveFolderModal .modal-content { max-width: none !important; }
    .toast { bottom: calc(18px + env(safe-area-inset-bottom, 0px)); min-width: 0; width: calc(100vw - 28px); max-width: 520px; padding: 13px 16px; }
  }

  @media (max-width:380px) {
    .task-card .actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    #configModal .config-checkbox-group { grid-template-columns: 1fr; }
    #backupModal .backup-batch-actions { grid-template-columns: 1fr; }
    #taskModal .task-period-row { grid-template-columns: 1fr; }
  }
</style></head>
<body>
<div class="container" id="app">
  <div class="dashboard" id="dashboard">
    <div class="stat"><div class="number" id="statTotal">0</div><div class="label">📋 总任务</div></div>
    <div class="stat"><div class="number danger" id="statExpired">0</div><div class="label">⚠️ 已过期</div></div>
    <div class="stat"><div class="number warning" id="statSoon">0</div><div class="label">⏳ 即将到期</div></div>
    <div class="stat"><div class="number" id="statActive">0</div><div class="label">✅ 进行中</div></div>
    <div class="stat"><div class="number" id="statFrozen">0</div><div class="label">❄️ 已冻结</div></div>
    <div class="stat"><div class="number" id="statNextCheck">--</div><div class="label">🕒 下次检查</div></div>
  </div>

  <div class="header">
    <h1>📋 任务提醒</h1>
    <div class="header-actions">
      <button class="btn-primary" onclick="openAddModal()">➕ 新建</button>
      <button class="btn-config" onclick="openConfigModal()">🛠️ 配置</button>
      <button class="btn-history" onclick="viewPushLogs()">📨 推送日志</button>
      <button class="btn-backup" onclick="openBackupModal()">💾 备份与恢复</button>
      <button class="btn-trash" onclick="viewTrash()">♻️ 回收站</button>
      <button class="btn-danger" onclick="logout()">🚪 退出</button>
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
      <div class="periodic-switch">
        <label style="display:flex; align-items:center; gap:8px; font-weight:500;">
          <input type="checkbox" id="calendarLunar" style="width:auto; margin:0;" onchange="toggleCalendarFields()"> 使用农历日期
        </label>
        <div class="mode-hint">不勾选：按公历开始日期和开始时间计算；勾选：先选择农历日期，再设置开始时间和周期。</div>
      </div>

      <div id="lunarFields" class="lunar-fields" style="display:none;">
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
        </div>

        <div class="form-row">
          <div>
            <label>农历日</label>
            <select id="lunarDay" onchange="updateLunarNext()">
              <!-- JS 动态生成 1-30 -->
            </select>
          </div>

          <div class="lunar-leap-field">
            <label>这是闰月日期</label>
            <input type="checkbox" id="lunarLeap" onchange="updateLunarNext()">
          </div>
        </div>

        <div class="mode-hint" style="margin-bottom:4px;">
          只有开始日期本身是“闰X月”时才勾选；普通农历生日不要勾选。
        </div>
      </div>

      <div class="form-row task-date-time-row">
        <div id="solarDateRow"><label>开始日期（公历）</label><input type="date" id="startDate" onchange="updateNextDateFromStart()"></div>
        <div><label>开始时间（北京时间）</label><input type="time" id="startTime" value="08:00" step="60" onchange="validateTime(); updateNextDateFromStart()" oninput="validateTime(); updateNextDateFromStart()"></div>
      </div>

      <div class="form-row task-period-row">
        <div><label>周期数值</label><input type="number" id="periodValue" value="1" min="1" onchange="updateNextDateFromStart()"></div>
        <div><label>周期单位</label>
          <select id="periodUnit" onchange="applyPeriodInputRules(); updateNextDateFromStart()">
            <option value="minute">分钟</option><option value="hour">小时</option><option value="day">日</option><option value="week">周</option><option value="month" selected>月</option><option value="year">年</option>
          </select>
        </div>
      </div>
    </div>

    <div id="countdownFields" style="display:none;">
      <div class="form-row task-date-time-row">
        <div><label>提醒日期（公历）</label><input type="date" id="singleReminderDate" onchange="updateNextDateFromStart()"></div>
        <div><label>提醒时间（北京时间）</label><input type="time" id="singleReminderTime" value="08:00" step="60" onchange="validateTime(); updateNextDateFromStart()" oninput="validateTime(); updateNextDateFromStart()"></div>
      </div>
      <div class="mode-hint">单次提醒：直接设置提醒日期和提醒时间，到点只提醒一次。</div>
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

    <label>提前提醒（点击 ➕ 添加多组，单位：分钟/小时/天）</label>
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
      <button class="btn-danger" onclick="clearPushLogs()">清空日志</button>
      <button class="btn-outline" onclick="closeModal('pushLogModal')">关闭</button>
    </div>
  </div>
</div>

<!-- 回收站弹窗 -->
<div class="modal" id="trashModal">
  <div class="modal-content">
    <h2>♻️ 回收站</h2>
    <div class="mode-hint" style="margin-bottom:14px;">删除的任务保留 30 天。回收站内任务不会参与提醒、重试或自动续订；恢复已过期任务时不会补发历史提醒。</div>
    <div id="trashList"></div>
    <div class="form-actions">
      <button class="btn-danger" onclick="clearTrash()">清空回收站</button>
      <button class="btn-outline" onclick="closeModal('trashModal')">关闭</button>
    </div>
  </div>
</div>

<!-- 远端备份弹窗 -->
<div class="modal" id="backupModal">
  <div class="modal-content">
    <h2>💾 备份与恢复</h2>
    <div class="mode-hint" style="margin-bottom:14px;">支持 OneDrive 与通用 WebDAV。智能备份会按实际变化区分“任务数据”和“配置 / Key”；两类历史各自最多保留 20 份，互不挤占，最新状态文件始终单独保留。</div>

    <label>备份位置</label>
    <select id="backupProvider" onchange="updateBackupProvider()">
      <option value="onedrive">OneDrive</option>
      <option value="custom">通用 WebDAV</option>
    </select>

    <div id="onedriveFields">
      <label>Microsoft 租户</label>
      <input type="text" id="onedriveTenant" value="common" placeholder="common">
      <div class="mode-hint" style="margin-top:-8px;margin-bottom:12px;">个人 Microsoft 账号或同时支持个人/组织账号时可使用 common。</div>

      <label>Client ID</label>
      <input type="text" id="onedriveClientId" autocomplete="off" placeholder="Microsoft Entra 应用的 Application (client) ID">

      <label>授权回调地址</label>
      <input type="text" id="onedriveRedirectUri" readonly>
      <div class="mode-hint" style="margin-top:-8px;margin-bottom:8px;">长期模式使用 OAuth 2.0 PKCE，不需要 Client Secret。请把此地址添加到 Microsoft Entra → 身份验证 → “移动和桌面应用程序”的自定义重定向 URI；权限使用 Microsoft Graph 委派权限 Files.ReadWrite。首次连接默认使用 OneDrive/TaskReminderBackup，连接后可点击“更改路径”选择任意文件夹。</div>
      <div class="lunar-display" id="onedriveStatus" style="margin-top:0;margin-bottom:12px;">OneDrive：未连接</div>

      <div style="margin:8px 0 14px 0;padding:12px;border:1px solid #e9ecef;border-radius:10px;background:#fafbfc;">
        <label style="margin-bottom:6px;">OneDrive 备份目录</label>
        <div class="lunar-display" id="onedriveFolderPathDisplay" style="margin:0 0 10px 0;">📁 OneDrive/TaskReminderBackup</div>
        <button class="btn-outline btn-sm" id="onedriveChangeFolderBtn" type="button" onclick="openOneDriveFolderPicker()" disabled>📁 更改路径</button>
      </div>
    </div>

    <div id="webdavFields" style="display:none;">
      <label>WebDAV 地址</label>
      <input type="text" id="backupUrl" placeholder="https://example.com/remote.php/dav/files/user/">

      <label>备份目录</label>
      <input type="text" id="backupFolder" value="TaskReminderBackup" placeholder="TaskReminderBackup">
      <div class="mode-hint" id="backupFolderHint" style="margin-top:-8px;margin-bottom:12px;">通用 WebDAV：系统会按需创建该远端目录。</div>

      <div class="form-row">
        <div><label>用户名</label><input type="text" id="backupUsername" autocomplete="username"></div>
        <div><label>密码 / 应用密码</label><input type="password" id="backupPassword" autocomplete="current-password"></div>
      </div>
    </div>

    <label>手动备份内容</label>
    <select id="backupScope">
      <option value="both">全部备份（任务 + 配置 + Key）</option>
      <option value="config">仅配置 + Key</option>
      <option value="tasks">仅任务数据</option>
    </select>
    <div class="mode-hint" style="margin-top:-8px;margin-bottom:12px;">任务数据包含正常任务、回收站和续订历史；Key 包含已启用推送渠道及对应 Token / API Key。远端备份连接凭据和 done/retry/autorenew 临时状态不会写入备份。</div>

    <div style="margin:8px 0 14px 0;padding:12px;border:1px solid #e9ecef;border-radius:10px;background:#fafbfc;">
      <label style="display:flex;align-items:center;gap:8px;font-weight:600;margin-bottom:6px;">
        <input type="checkbox" id="backupAutoEnabled" style="width:auto;margin:0;" checked> 自动备份
      </label>
      <div class="mode-hint" style="margin:0;">智能备份按实际内容判断：任务变化只备份任务；配置 / Key 变化只备份配置 / Key；两类同时变化才分别备份两份。内容没有变化时不会生成新备份。最新状态持续覆盖，历史版本按类别独立保留。</div>
      <div class="mode-hint" id="backupAutoLastTime" style="margin-top:6px;">上次自动备份时间：暂无</div>
      <div class="mode-hint" id="backupAutoLastResult" style="margin-top:4px;">结果：暂无</div>
    </div>

    <div class="mode-hint" style="margin-bottom:12px;">恢复时无需提前选择内容。点击某个备份的“恢复”后，系统会先读取并检测该备份实际包含的数据，再弹出可恢复项目供你选择。</div>

    <div class="form-actions backup-action-grid" style="justify-content:flex-start;flex-wrap:wrap;">
      <button class="btn-config" onclick="saveBackupSettings()">保存连接</button>
      <button class="btn-success" id="onedriveConnectBtn" onclick="connectOneDrive()">连接 OneDrive</button>
      <button class="btn-warning" onclick="testBackupConnection()">测试连接</button>
      <button class="btn-backup" onclick="createRemoteBackup()">立即备份</button>
      <button class="btn-history" onclick="loadRemoteBackups()">刷新列表</button>
      <button class="btn-danger" id="onedriveDisconnectBtn" style="display:none;" onclick="disconnectOneDrive()">断开 OneDrive</button>
    </div>

    <hr style="margin:18px 0;">
    <h3 style="margin-bottom:10px;">远端备份</h3>
    <div class="form-row backup-list-controls" style="align-items:flex-end;margin-bottom:8px;">
      <div>
        <label>列表筛选</label>
        <select id="backupListFilter" onchange="renderRemoteBackupList()">
          <option value="all">全部备份</option>
          <option value="tasks">仅任务数据</option>
          <option value="config">仅配置 / Key</option>
        </select>
      </div>
      <div class="backup-batch-actions" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:16px;">
        <button class="btn-outline btn-sm" type="button" onclick="selectVisibleBackups(true)">全选当前</button>
        <button class="btn-outline btn-sm" type="button" onclick="selectVisibleBackups(false)">取消选择</button>
        <button class="btn-danger btn-sm" type="button" onclick="deleteSelectedRemoteBackups()">删除所选</button>
      </div>
    </div>
    <div class="mode-hint" style="margin-bottom:10px;">“最新状态”不计入 20 份历史，也不会被批量删除；旧版“任务 + 配置 / Key”备份仍可正常恢复。</div>
    <div id="backupList"><p style="color:#999;">尚未读取</p></div>

    <div class="form-actions"><button class="btn-outline" onclick="closeModal('backupModal')">关闭</button></div>
  </div>
</div>

<!-- OneDrive 目录选择弹窗 -->
<div class="modal" id="onedriveFolderModal">
  <div class="modal-content" style="max-width:620px;">
    <h2>📁 选择 OneDrive 备份目录</h2>
    <div class="lunar-display" id="onedriveFolderPickerPath" style="margin-top:10px;margin-bottom:12px;">当前位置：OneDrive</div>

    <div class="form-actions" style="justify-content:flex-start;flex-wrap:wrap;margin-bottom:10px;">
      <button class="btn-outline" id="onedriveFolderUpBtn" type="button" onclick="goOneDriveFolderUp()">⬆️ 上一级</button>
      <button class="btn-primary" type="button" onclick="createOneDriveFolderFromPicker()">➕ 新建文件夹</button>
    </div>

    <div id="onedriveFolderPickerList" style="min-height:120px;"><p style="color:#999;">正在读取...</p></div>

    <div class="form-actions">
      <button class="btn-outline" type="button" onclick="closeModal('onedriveFolderModal')">取消</button>
      <button class="btn-success" type="button" onclick="selectCurrentOneDriveFolder()">选择当前目录</button>
    </div>
  </div>
</div>

<!-- 备份恢复选择弹窗 -->
<div class="modal" id="restoreBackupModal">
  <div class="modal-content" style="max-width:560px;">
    <h2>♻️ 恢复备份</h2>
    <div class="lunar-display" id="restoreBackupFileName" style="margin-top:10px;margin-bottom:14px;">备份：--</div>
    <div class="mode-hint" id="restoreBackupSummary" style="margin-bottom:12px;">正在检测备份内容...</div>

    <label>选择恢复内容</label>
    <div id="restoreDetectedOptions" style="margin:8px 0 14px 0;"></div>

    <div id="restoreExpiredPolicyWrap" style="display:none;">
      <label>恢复任务时，已过期且未完成任务如何处理</label>
      <select id="restoreExpiredPolicy">
        <option value="expired">恢复为已过期，不补发（推荐）</option>
        <option value="push">恢复后立即推送一次，再保持已过期状态</option>
      </select>
    </div>

    <div class="mode-hint" style="margin-bottom:12px;">恢复采用合并方式：同 ID 数据会覆盖；未选择的类别和其他现有任务不会删除。远端备份连接与 OAuth 状态不会被旧备份覆盖。</div>

    <div class="form-actions">
      <button class="btn-outline" onclick="closeModal('restoreBackupModal')">取消</button>
      <button class="btn-success" id="confirmRestoreBackupBtn" onclick="confirmRestoreRemoteBackup()">开始恢复</button>
    </div>
  </div>
</div>

<!-- 冻结 / 解冻处理弹窗 -->
<div class="modal" id="unfreezeModal">
  <div class="modal-content" style="max-width:540px;">
    <h2>❄️ 解冻任务</h2>
    <div class="lunar-display" id="unfreezeTaskInfo" style="margin-top:10px;margin-bottom:14px;">任务：--</div>
    <div class="mode-hint" style="margin-bottom:12px;">该任务原提醒时间已经过去。解冻时请选择如何处理，系统不会未经确认自动补发旧提醒。</div>
    <label>解冻后的处理方式</label>
    <select id="unfreezePolicy">
      <option value="expired">恢复为已过期，不补发（推荐）</option>
      <option value="push">立即推送一次，再保持已过期状态</option>
      <option value="next" id="unfreezeNextOption">跳到下一个有效未来周期</option>
    </select>
    <div class="form-actions">
      <button class="btn-outline" onclick="closeModal('unfreezeModal')">取消</button>
      <button class="btn-freeze" onclick="confirmUnfreezeTask()">确认解冻</button>
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
let notifierConfigCache = {};
let remoteBackupItems = [];
let pendingUnfreezeTaskId = '';

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
    case 'minute':
      result.setUTCMinutes(result.getUTCMinutes() + value);
      return result;
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

  if (unit === 'minute') {
    d.setUTCMinutes(d.getUTCMinutes() - value);
  } else if (unit === 'hour') {
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
    const unit = g.unit || 'day';
    const unitText = unit === 'minute' ? '分钟' : (unit === 'hour' ? '小时' : '天');

    lines.push('');

    if (unit === 'minute' && g.value % 5 !== 0) {
      lines.push('⚠️ 提前提醒 ' + (index + 1) + '：分钟数必须是 5 的倍数');
      return;
    }

    const adv = calcAdvanceDateTime(dateStr, timeStr, g.value, unit);
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
    if (periodUnit === 'minute' || periodUnit === 'hour' || periodUnit === 'day' || periodUnit === 'week') {
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
function applyPeriodInputRules() {
  const unitEl = document.getElementById('periodUnit');
  const valueEl = document.getElementById('periodValue');
  if (!unitEl || !valueEl) return;

  if (unitEl.value === 'minute') {
    valueEl.min = 5;
    valueEl.step = 5;
    const currentValue = parseInt(valueEl.value) || 0;
    if (currentValue < 5 || currentValue % 5 !== 0) valueEl.value = 5;
  } else {
    valueEl.min = 1;
    valueEl.step = 1;
  }
}

function updateNextDateFromStart() {
  applyPeriodInputRules();
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
  select.innerHTML = '<option value="minute">分钟</option><option value="hour">小时</option><option value="day">天</option>';
  if (unit) select.value = unit;

  const applyInputRules = function() {
    if (select.value === 'minute') {
      input.min = 5;
      input.step = 5;
      input.placeholder = '例如 5';
    } else {
      input.min = 1;
      input.step = 1;
      input.placeholder = '例如 3';
    }
  };

  select.onchange = function() {
    applyInputRules();
    updateReminderPreview();
  };

  applyInputRules();

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

  const sortedGroups = sortReminderGroups(groups || []);

  if (sortedGroups.length > 0) {
    sortedGroups.forEach(g => addReminderGroup(g.value, g.unit || 'day'));
  }

  updateReminderPreview();
}

function getReminderOffsetMinutes(group) {
  const value = parseInt(group.value) || 0;
  const unit = group.unit || 'day';
  if (unit === 'minute') return value;
  if (unit === 'hour') return value * 60;
  return value * 24 * 60;
}

function sortReminderGroups(groups) {
  return (groups || [])
    .map(g => ({
      value: parseInt(g.value),
      unit: g.unit || 'day'
    }))
    .filter(g => !isNaN(g.value) && g.value > 0)
    .sort((a, b) => getReminderOffsetMinutes(b) - getReminderOffsetMinutes(a));
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

  return sortReminderGroups(result);
}

function getTaskPushTimesForCard(task) {
  if (!task || !task.nextReminder) return '-';

  const dueTime = task.remindTime || '08:00';
  const groups = sortReminderGroups((task.reminderDays || []).map((value, index) => ({
    value,
    unit: task.reminderUnits && task.reminderUnits[index] ? task.reminderUnits[index] : 'day'
  })));

  const points = [];
  groups.forEach(group => {
    const advance = calcAdvanceDateTime(task.nextReminder, dueTime, group.value, group.unit);
    points.push({ date: advance.date, time: advance.time, ms: advance.ms });
  });

  const dueMs = new Date(task.nextReminder + 'T' + dueTime + ':00+08:00').getTime();
  points.push({ date: task.nextReminder, time: dueTime, ms: dueMs });

  points.sort((a, b) => a.ms - b.ms);

  const unique = [];
  const seen = new Set();
  points.forEach(point => {
    const key = point.date + ' ' + point.time;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(point);
    }
  });

  const sameDate = unique.every(point => point.date === task.nextReminder);
  return unique.map(point => {
    if (sameDate) return point.time;
    return point.date.slice(5).replace('-', '/') + ' ' + point.time;
  }).join('、');
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
        const isCompleted = !!t.completedAt;
        const isFrozen = !!t.frozen;
        const isExpired = !isCompleted && !isFrozen && nextDate < now;
        const unitMap = {
          minute: '分钟',
          hour: '小时',
          day: '日',
          week: '周',
          month: '月',
          year: '年'
        };
        const isLunarPeriodic = t.calendarType === 'lunar' || t.mode === 'lunar';
        const isSingle = t.mode === 'countdown';
        const modeLabel = isSingle ? '单次提醒' : (isLunarPeriodic ? '周期/农历' : '周期');
        const sortedReminders = sortReminderGroups((t.reminderDays || []).map((g, i) => ({
          value: g,
          unit: t.reminderUnits && t.reminderUnits[i] ? t.reminderUnits[i] : 'day'
        })));
        const reminderStr = sortedReminders.map(g => {
          return g.value + (g.unit === 'minute' ? '分钟' : (g.unit === 'hour' ? '小时' : '天'));
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

        const statusClass = isCompleted ? 'status-completed' : (isFrozen ? 'status-frozen' : (isExpired ? 'status-expired' : 'status-active'));
        const statusText = isCompleted ? '✅ 已完成' : (isFrozen ? '❄️ 已冻结' : (isExpired ? '⚠️ 已过期' : '✅ 进行中'));
        const cardColor = isCompleted ? '#95a5a6' : (isFrozen ? '#3498db' : (isExpired ? '#e74c3c' : '#2ecc71'));
        const freezeBtn = isCompleted
          ? ''
          : (isFrozen
            ? '<button class="btn-freeze btn-sm" onclick="unfreezeTask(\\'' + t.id + '\\', ' + (nextDate < now ? 'true' : 'false') + ', ' + (isSingle ? 'true' : 'false') + ')">▶️ 解冻</button>'
            : '<button class="btn-freeze btn-sm" onclick="freezeTask(\\'' + t.id + '\\')">❄️ 冻结</button>');

        return '<div class="task-card" style="border-left-color:' + cardColor + '">' +
          '<div class="title">' + escapeHtml(t.name) + ' <span style="font-size:12px;color:#999;">[' + modeLabel + ']</span></div>' +
          '<div class="info"><strong>规则：</strong>' + ruleStr + '</div>' +
          '<div class="info"><strong>开始/基准：</strong>' + startInfo + '</div>' +
          '<div class="info"><strong>提醒日：</strong>' + formatSolarDisplay(t.nextReminder, t.remindTime || '08:00') + '</div>' +
          '<div class="info"><strong>提前提醒：</strong>' + reminderStr + '</div>' +
          '<div class="info"><strong>推送时间：</strong>' + getTaskPushTimesForCard(t) + '</div>' +
          '<div class="info"><strong>自动续订：</strong>' + (t.autoRenew ? '✅ 开启' : '—') + '</div>' +
          '<div class="info"><strong>备注：</strong>' + escapeHtml(t.remark || '-') + '</div>' +
          '<span class="status ' + statusClass + '">' + statusText + '</span>' +
          '<div class="actions">' +
          renewBtn +
          '<button class="btn-primary btn-sm" onclick="editTask(\\'' + t.id + '\\')">✏️ 编辑</button>' +
          '<button class="btn-history btn-sm" onclick="viewHistory(\\'' + t.id + '\\')">📜 历史</button>' +
          '<button class="btn-warning btn-sm" onclick="testTask(\\'' + t.id + '\\')">📤 测试</button>' +
          freezeBtn +
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
  let frozen = 0;

  tasks.forEach(t => {
    if (t.completedAt) return;
    if (t.frozen) {
      frozen++;
      return;
    }

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
  document.getElementById('statFrozen').textContent = frozen;
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
  const invalidMinuteReminder = reminderGroups.find(g => g.unit === 'minute' && g.value % 5 !== 0);

  if (invalidMinuteReminder) {
    showToast('提前提醒的分钟数必须是 5 的倍数', 'error');
    return;
  }

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
    nextReminder,
    completedAt: ''
  };

  if (mode === 'periodic') {
    const periodValue = parseInt(document.getElementById('periodValue').value);
    const periodUnit = document.getElementById('periodUnit').value;
    const startTime = document.getElementById('startTime').value || '08:00';

    if (!periodValue || periodValue < 1) {
      showToast('周期必须>0', 'error');
      return;
    }

    if (periodUnit === 'minute' && periodValue % 5 !== 0) {
      showToast('分钟周期必须是 5 的倍数', 'error');
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
  if (!confirm('确认移入回收站？任务将在回收站保留 30 天。')) return;

  const resp = await fetch('/api/tasks/' + id, {
    method: 'DELETE',
    headers: getHeaders()
  });

  const data = await resp.json();

  if (data.success) {
    showToast('已移入回收站');
    loadTasks();
  } else {
    showToast(data.message || '删除失败', 'error');
  }
}

async function freezeTask(id) {
  if (!confirm('确认冻结这个任务？冻结后会暂停提前提醒、到期提醒、失败重试和自动续订；任务设置本身不会改变。')) return;

  try {
    const resp = await fetch('/api/tasks/' + id + '/freeze', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ freeze: true })
    });
    const data = await resp.json();
    if (data.success) {
      showToast('任务已冻结，自动提醒已暂停');
      loadTasks();
    } else {
      showToast(data.message || '冻结失败', 'error');
    }
  } catch (e) {
    showToast('冻结失败', 'error');
  }
}

async function unfreezeTask(id, isPast, isSingle) {
  if (!isPast) {
    return submitUnfreezeTask(id, 'normal');
  }

  pendingUnfreezeTaskId = id;
  document.getElementById('unfreezeTaskInfo').textContent = '该任务的原提醒时间已经过去';
  const nextOption = document.getElementById('unfreezeNextOption');
  if (nextOption) nextOption.style.display = isSingle ? 'none' : 'block';
  document.getElementById('unfreezePolicy').value = 'expired';
  openModal('unfreezeModal');
}

async function confirmUnfreezeTask() {
  if (!pendingUnfreezeTaskId) return;
  const policy = document.getElementById('unfreezePolicy').value || 'expired';
  closeModal('unfreezeModal');
  await submitUnfreezeTask(pendingUnfreezeTaskId, policy);
  pendingUnfreezeTaskId = '';
}

async function submitUnfreezeTask(id, policy) {
  try {
    const resp = await fetch('/api/tasks/' + id + '/freeze', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ freeze: false, policy: policy || 'normal' })
    });
    const data = await resp.json();
    if (data.success) {
      let msg = '任务已解冻';
      if (data.movedToNext) msg += '，已跳过' + (data.skippedCycles || 1) + '个已过期周期，定位到下一个有效时间：' + (data.nextReminder || '') + ' ' + (data.remindTime || '');
      else if (data.pushAttempted) msg += data.pushSuccess ? '，已立即推送一次' : '，立即推送失败，任务保持已过期';
      else if (data.suppressCatchUp) msg += '，旧提醒不会补发';
      showToast(msg);
      loadTasks();
    } else {
      showToast(data.message || '解冻失败', 'error');
    }
  } catch (e) {
    showToast('解冻失败', 'error');
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

async function clearPushLogs() {
  if (!confirm('确定清空全部推送日志吗？')) return;

  try {
    const resp = await fetch('/api/push-logs', {
      method: 'DELETE',
      headers: getHeaders()
    });

    const data = await resp.json();

    if (data.success) {
      document.getElementById('pushLogList').innerHTML = '<p style="color:#999;">暂无推送日志</p>';
      showToast('推送日志已清空');
    } else {
      showToast(data.message || '清空失败', 'error');
    }
  } catch (e) {
    showToast('清空推送日志失败', 'error');
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

// ===== 回收站 =====
async function viewTrash() {
  try {
    const resp = await fetch('/api/trash', {
      headers: getHeaders()
    });

    const data = await resp.json();
    const list = document.getElementById('trashList');
    const items = data.items || [];
    const now = Date.now();

    if (items.length === 0) {
      list.innerHTML = '<p style="color:#999;">回收站为空</p>';
    } else {
      list.innerHTML = items.map(item => {
        const deletedAt = item.deletedAt ? formatFullDate(item.deletedAt) : '-';
        const reminder = item.nextReminder
          ? formatSolarDisplay(item.nextReminder, item.remindTime || '08:00')
          : '-';
        const modeLabel = item.mode === 'countdown' ? '单次提醒' : ((item.calendarType === 'lunar' || item.mode === 'lunar') ? '周期/农历' : '周期');
        const remindMs = item.nextReminder
          ? new Date(item.nextReminder + 'T' + (item.remindTime || '08:00') + ':00+08:00').getTime()
          : 0;
        const isPast = !!remindMs && remindMs <= now && !item.completedAt;

        let restoreButtons = '';
        if (isPast) {
          restoreButtons =
            '<button class="btn-success btn-sm" onclick="restoreTrashTask(\\'' + item.id + '\\', \\'expired\\')">↩️ 恢复为已过期</button>' +
            '<button class="btn-warning btn-sm" onclick="restoreTrashTask(\\'' + item.id + '\\', \\'push\\')">📤 恢复并立即推送</button>';
        } else {
          restoreButtons = '<button class="btn-success btn-sm" onclick="restoreTrashTask(\\'' + item.id + '\\', \\'normal\\')">↩️ 恢复</button>';
        }

        return '<div class="history-item" style="padding:12px 0;">' +
          '<div><strong>' + escapeHtml(item.name || '-') + '</strong> <span style="font-size:12px;color:#999;">[' + modeLabel + ']</span></div>' +
          '<div>📅 原提醒：' + reminder + '</div>' +
          '<div>🗑️ 删除时间：' + deletedAt + '</div>' +
          (isPast ? '<div style="font-size:12px;color:#e67e22;margin-top:4px;">原提醒时间已过去：可恢复为已过期，或立即补推一次；两种方式都不会进入 Cron 补发循环。</div>' : '') +
          '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">' +
            restoreButtons +
            '<button class="btn-danger btn-sm" onclick="permanentlyDeleteTrashTask(\\'' + item.id + '\\')">永久删除</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    openModal('trashModal');
  } catch (e) {
    showToast('读取回收站失败', 'error');
  }
}

async function restoreTrashTask(id, policy) {
  policy = policy || 'normal';

  let message = '确认恢复这个任务？';
  if (policy === 'expired') message = '确认恢复为“已过期”状态？不会补发历史提醒，编辑或手动续订后恢复正常提醒。';
  if (policy === 'push') message = '确认恢复并立即推送一次？推送后仍保持已过期状态，避免 Cron 再次补发。';
  if (!confirm(message)) return;

  try {
    const resp = await fetch('/api/trash/' + id + '/restore', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ policy })
    });

    const data = await resp.json();

    if (data.success) {
      if (data.pushAttempted) {
        showToast(data.pushSuccess ? '已恢复并立即推送；任务保持已过期状态' : '任务已恢复为已过期；立即推送失败，请查看推送日志', data.pushSuccess ? 'success' : 'error');
      } else if (data.suppressCatchUp) {
        showToast('已恢复为已过期状态，不会补发历史提醒');
      } else {
        showToast('任务已恢复');
      }
      await viewTrash();
      loadTasks();
    } else {
      showToast(data.message || '恢复失败', 'error');
    }
  } catch (e) {
    showToast('恢复失败', 'error');
  }
}

async function permanentlyDeleteTrashTask(id) {
  if (!confirm('永久删除后无法恢复，并会清理该任务的续订历史和推送状态。确定继续？')) return;

  try {
    const resp = await fetch('/api/trash/' + id, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const data = await resp.json();

    if (data.success) {
      showToast('已永久删除');
      await viewTrash();
    } else {
      showToast(data.message || '永久删除失败', 'error');
    }
  } catch (e) {
    showToast('永久删除失败', 'error');
  }
}

async function clearTrash() {
  if (!confirm('确定清空回收站吗？所有任务将永久删除且无法恢复。')) return;

  try {
    const resp = await fetch('/api/trash', {
      method: 'DELETE',
      headers: getHeaders()
    });

    const data = await resp.json();

    if (data.success) {
      document.getElementById('trashList').innerHTML = '<p style="color:#999;">回收站为空</p>';
      showToast('回收站已清空');
    } else {
      showToast(data.message || '清空失败', 'error');
    }
  } catch (e) {
    showToast('清空回收站失败', 'error');
  }
}

// ===== 远端备份 =====
function updateBackupProvider() {
  const provider = document.getElementById('backupProvider').value || 'onedrive';
  const onedriveFields = document.getElementById('onedriveFields');
  const webdavFields = document.getElementById('webdavFields');
  const connectBtn = document.getElementById('onedriveConnectBtn');
  const disconnectBtn = document.getElementById('onedriveDisconnectBtn');

  if (onedriveFields) onedriveFields.style.display = provider === 'onedrive' ? 'block' : 'none';
  if (webdavFields) webdavFields.style.display = provider === 'custom' ? 'block' : 'none';
  if (connectBtn) connectBtn.style.display = provider === 'onedrive' ? 'inline-block' : 'none';

  if (provider !== 'onedrive' && disconnectBtn) {
    disconnectBtn.style.display = 'none';
  }
}

function updateOneDriveStatus(connected) {
  const status = document.getElementById('onedriveStatus');
  const disconnectBtn = document.getElementById('onedriveDisconnectBtn');
  const folderBtn = document.getElementById('onedriveChangeFolderBtn');
  if (status) status.textContent = connected ? 'OneDrive：✅ 已连接' : 'OneDrive：未连接';
  if (disconnectBtn) disconnectBtn.style.display = connected ? 'inline-block' : 'none';
  if (folderBtn) folderBtn.disabled = !connected;
}

function updateOneDriveFolderPathDisplay(path) {
  const el = document.getElementById('onedriveFolderPathDisplay');
  if (!el) return;
  el.textContent = '📁 ' + (path || 'OneDrive/TaskReminderBackup');
}

let oneDriveFolderPickerCurrent = null;
let oneDriveFolderPickerStack = [];

async function openOneDriveFolderPicker() {
  const status = document.getElementById('onedriveStatus');
  if (!status || !status.textContent.includes('已连接')) {
    showToast('请先连接 OneDrive', 'error');
    return;
  }

  oneDriveFolderPickerCurrent = null;
  oneDriveFolderPickerStack = [];
  openModal('onedriveFolderModal');
  await loadOneDriveFolderLevel('');
}

async function loadOneDriveFolderLevel(parentId, pushCurrent) {
  const list = document.getElementById('onedriveFolderPickerList');
  const pathEl = document.getElementById('onedriveFolderPickerPath');
  const upBtn = document.getElementById('onedriveFolderUpBtn');
  if (!list || !pathEl || !upBtn) return;

  list.innerHTML = '<p style="color:#999;">正在读取...</p>';

  try {
    const query = parentId ? ('?parentId=' + encodeURIComponent(parentId)) : '';
    const resp = await fetch('/api/onedrive/folders' + query, { headers: getHeaders() });
    const data = await resp.json();

    if (!data.success) {
      list.innerHTML = '<p style="color:#e74c3c;">' + escapeHtml(data.message || '读取目录失败') + '</p>';
      return;
    }

    if (pushCurrent && oneDriveFolderPickerCurrent) {
      oneDriveFolderPickerStack.push(oneDriveFolderPickerCurrent);
    }

    oneDriveFolderPickerCurrent = data.current || null;
    pathEl.textContent = '当前位置：' + ((data.current && data.current.path) || 'OneDrive');
    upBtn.disabled = oneDriveFolderPickerStack.length === 0;

    const folders = Array.isArray(data.folders) ? data.folders : [];
    if (folders.length === 0) {
      list.innerHTML = '<p style="color:#999;text-align:center;padding:18px 0;">当前目录下没有子文件夹</p>';
      return;
    }

    list.innerHTML = folders.map(folder =>
      '<button type="button" class="btn-outline" style="width:100%;text-align:left;margin:0 0 8px 0;padding:11px 12px;" ' +
      'data-id="' + encodeURIComponent(folder.id || '') + '" onclick="enterOneDriveFolder(this.dataset.id)">📁 ' + escapeHtml(folder.name || '未命名文件夹') + '</button>'
    ).join('');
  } catch (e) {
    list.innerHTML = '<p style="color:#e74c3c;">读取 OneDrive 目录失败</p>';
  }
}

async function enterOneDriveFolder(encodedId) {
  const id = decodeURIComponent(encodedId || '');
  if (!id) return;
  await loadOneDriveFolderLevel(id, true);
}

async function goOneDriveFolderUp() {
  if (oneDriveFolderPickerStack.length === 0) return;
  const previous = oneDriveFolderPickerStack.pop();
  const list = document.getElementById('onedriveFolderPickerList');
  if (list) list.innerHTML = '<p style="color:#999;">正在读取...</p>';
  try {
    const resp = await fetch('/api/onedrive/folders?parentId=' + encodeURIComponent(previous.id || ''), { headers: getHeaders() });
    const data = await resp.json();
    if (!data.success) throw new Error(data.message || '读取失败');
    oneDriveFolderPickerCurrent = data.current || previous;
    document.getElementById('onedriveFolderPickerPath').textContent = '当前位置：' + ((data.current && data.current.path) || previous.path || 'OneDrive');
    document.getElementById('onedriveFolderUpBtn').disabled = oneDriveFolderPickerStack.length === 0;
    const folders = Array.isArray(data.folders) ? data.folders : [];
    list.innerHTML = folders.length ? folders.map(folder =>
      '<button type="button" class="btn-outline" style="width:100%;text-align:left;margin:0 0 8px 0;padding:11px 12px;" ' +
      'data-id="' + encodeURIComponent(folder.id || '') + '" onclick="enterOneDriveFolder(this.dataset.id)">📁 ' + escapeHtml(folder.name || '未命名文件夹') + '</button>'
    ).join('') : '<p style="color:#999;text-align:center;padding:18px 0;">当前目录下没有子文件夹</p>';
  } catch (e) {
    if (list) list.innerHTML = '<p style="color:#e74c3c;">读取上一级目录失败</p>';
  }
}

async function createOneDriveFolderFromPicker() {
  if (!oneDriveFolderPickerCurrent || !oneDriveFolderPickerCurrent.id) return;
  const name = prompt('请输入新文件夹名称');
  if (!name) return;

  try {
    const resp = await fetch('/api/onedrive/folders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ parentId: oneDriveFolderPickerCurrent.id, name: name.trim() })
    });
    const data = await resp.json();
    if (!data.success) {
      showToast(data.message || '新建文件夹失败', 'error');
      return;
    }
    showToast('文件夹已创建');
    await loadOneDriveFolderLevel(oneDriveFolderPickerCurrent.id);
  } catch (e) {
    showToast('新建文件夹失败', 'error');
  }
}

async function selectCurrentOneDriveFolder() {
  if (!oneDriveFolderPickerCurrent || !oneDriveFolderPickerCurrent.id) {
    showToast('当前目录不可选择', 'error');
    return;
  }

  try {
    const resp = await fetch('/api/onedrive/folder-select', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ folderId: oneDriveFolderPickerCurrent.id })
    });
    const data = await resp.json();
    if (!data.success) {
      showToast(data.message || '保存备份路径失败', 'error');
      return;
    }

    updateOneDriveFolderPathDisplay(data.path || oneDriveFolderPickerCurrent.path);
    closeModal('onedriveFolderModal');
    showToast('OneDrive 备份目录已更新');
    await loadRemoteBackups();
  } catch (e) {
    showToast('保存备份路径失败', 'error');
  }
}

async function openBackupModal() {
  openModal('backupModal');
  const backupList = document.getElementById('backupList');
  backupList.innerHTML = '<p style="color:#999;">正在读取...</p>';
  document.getElementById('onedriveRedirectUri').value = window.location.origin + '/api/onedrive/callback';
  let canLoadList = false;

  try {
    const resp = await fetch('/api/backup-settings', { headers: getHeaders() });
    const data = await resp.json();

    if (data.success) {
      const settings = data.settings || {};
      document.getElementById('backupProvider').value = settings.provider || 'onedrive';
      document.getElementById('backupScope').value = settings.scope || 'both';
      document.getElementById('backupAutoEnabled').checked = settings.autoEnabled !== false;
      const autoLastTime = document.getElementById('backupAutoLastTime');
      const autoLastResult = document.getElementById('backupAutoLastResult');
      if (autoLastTime) {
        autoLastTime.textContent = settings.autoLastAt
          ? '上次自动备份时间：' + formatFullDate(settings.autoLastAt)
          : '上次自动备份时间：暂无';
      }
      if (autoLastResult) {
        if (!settings.autoLastAt) {
          autoLastResult.textContent = '结果：暂无';
          autoLastResult.style.color = '#888';
        } else if (settings.autoLastError) {
          autoLastResult.textContent = '结果：失败 - ' + settings.autoLastError;
          autoLastResult.style.color = '#e74c3c';
        } else {
          autoLastResult.textContent = '结果：成功' + (settings.autoLastSummary ? ' - ' + settings.autoLastSummary : '');
          autoLastResult.style.color = '#2e7d32';
        }
      }

      document.getElementById('onedriveTenant').value = settings.tenant || 'common';
      document.getElementById('onedriveClientId').value = settings.clientId || '';
      updateOneDriveStatus(!!settings.onedriveConnected);
      updateOneDriveFolderPathDisplay(settings.onedriveFolderPath || 'OneDrive/TaskReminderBackup');

      document.getElementById('backupUrl').value = settings.url || '';
      document.getElementById('backupFolder').value = settings.folder || 'TaskReminderBackup';
      document.getElementById('backupUsername').value = settings.username || '';
      document.getElementById('backupPassword').value = settings.password || '';

      const provider = settings.provider || 'onedrive';
      canLoadList = provider === 'onedrive'
        ? !!settings.onedriveConnected
        : !!(settings.url && settings.username && settings.password);
      updateBackupProvider();
    }
  } catch (e) {}

  if (canLoadList) {
    await loadRemoteBackups();
  } else {
    backupList.innerHTML = '<p style="color:#999;text-align:center;">请先配置并连接远端备份</p>';
  }
}

function getBackupSettingsFromForm() {
  return {
    provider: document.getElementById('backupProvider').value || 'onedrive',
    scope: document.getElementById('backupScope').value || 'both',
    autoEnabled: document.getElementById('backupAutoEnabled').checked,
    tenant: document.getElementById('onedriveTenant').value.trim() || 'common',
    clientId: document.getElementById('onedriveClientId').value.trim(),
    url: document.getElementById('backupUrl').value.trim(),
    folder: document.getElementById('backupFolder').value.trim() || 'TaskReminderBackup',
    username: document.getElementById('backupUsername').value.trim(),
    password: document.getElementById('backupPassword').value
  };
}

async function saveBackupSettings(showSuccess) {
  const settings = getBackupSettingsFromForm();

  if (settings.provider === 'onedrive') {
    if (!settings.clientId) {
      showToast('请填写 OneDrive Client ID', 'error');
      return false;
    }
  } else if (!settings.url || !settings.username || !settings.password) {
    showToast('请填写 WebDAV 地址、用户名和密码/应用密码', 'error');
    return false;
  }

  try {
    const resp = await fetch('/api/backup-settings', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    const data = await resp.json();

    if (!data.success) {
      showToast(data.message || '保存远端备份配置失败', 'error');
      return false;
    }

    updateOneDriveStatus(!!data.onedriveConnected);
    if (showSuccess !== false) showToast('远端备份配置已保存');
    return true;
  } catch (e) {
    showToast('保存远端备份配置失败', 'error');
    return false;
  }
}

async function connectOneDrive() {
  if (document.getElementById('backupProvider').value !== 'onedrive') return;

  const popup = window.open('about:blank', 'onedriveAuth', 'width=560,height=760');
  if (!popup) {
    showToast('浏览器阻止了授权窗口，请允许弹出窗口后重试', 'error');
    return;
  }

  if (!await saveBackupSettings(false)) {
    popup.close();
    return;
  }

  try {
    const resp = await fetch('/api/onedrive/auth-url', { headers: getHeaders() });
    const data = await resp.json();
    if (!data.success || !data.authorizationUrl) {
      popup.close();
      showToast(data.message || '生成 OneDrive 授权地址失败', 'error');
      return;
    }
    document.getElementById('onedriveRedirectUri').value = data.redirectUri || (window.location.origin + '/api/onedrive/callback');
    popup.location.href = data.authorizationUrl;
  } catch (e) {
    popup.close();
    showToast('连接 OneDrive 失败', 'error');
  }
}

async function disconnectOneDrive() {
  if (!confirm('确定断开 OneDrive？远端已有备份不会被删除。')) return;

  try {
    const resp = await fetch('/api/onedrive/disconnect', {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await resp.json();
    if (data.success) {
      updateOneDriveStatus(false);
      document.getElementById('backupList').innerHTML = '<p style="color:#999;text-align:center;">OneDrive 已断开</p>';
      showToast('OneDrive 已断开');
    } else {
      showToast(data.message || '断开 OneDrive 失败', 'error');
    }
  } catch (e) {
    showToast('断开 OneDrive 失败', 'error');
  }
}

window.addEventListener('message', async (event) => {
  if (event.origin !== window.location.origin) return;
  if (!event.data || event.data.type !== 'task-reminder-onedrive-connected') return;

  if (!event.data.success) {
    updateOneDriveStatus(false);
    showToast('OneDrive 授权失败，请检查配置后重试', 'error');
    return;
  }

  updateOneDriveStatus(true);
  showToast('OneDrive 已连接');
  try {
    const resp = await fetch('/api/backup-settings', { headers: getHeaders() });
    const data = await resp.json();
    if (data.success && data.settings) {
      updateOneDriveFolderPathDisplay(data.settings.onedriveFolderPath || 'OneDrive/TaskReminderBackup');
    }
  } catch (e) {}
  await loadRemoteBackups();
});

async function testBackupConnection() {
  if (!await saveBackupSettings(false)) return;
  showToast('正在测试远端连接...');

  try {
    const resp = await fetch('/api/backup-test', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ provider: document.getElementById('backupProvider').value })
    });
    const data = await resp.json();

    if (data.success) {
      showToast(data.message || '远端连接测试成功');
    } else {
      showToast(data.message || '远端连接测试失败', 'error');
    }
  } catch (e) {
    showToast('远端连接测试失败', 'error');
  }
}

async function createRemoteBackup() {
  if (!await saveBackupSettings(false)) return;

  const scope = document.getElementById('backupScope').value || 'both';
  showToast('正在备份，请稍候...');

  try {
    const resp = await fetch('/api/backups', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ scope })
    });
    const data = await resp.json();

    if (data.success) {
      const files = Array.isArray(data.fileNames) ? data.fileNames : (data.fileName ? [data.fileName] : []);
      showToast('备份成功' + (files.length ? '：' + files.length + ' 个文件' : ''));
      await loadRemoteBackups();
    } else {
      showToast(data.message || '备份失败', 'error');
    }
  } catch (e) {
    showToast('备份失败', 'error');
  }
}

function backupKindMatchesFilter(item, filter) {
  if (filter === 'all') return true;
  if (filter === 'tasks') return item.kind === 'tasks' || item.kind === 'both';
  if (filter === 'config') return item.kind === 'config' || item.kind === 'both';
  return true;
}

function backupTypeBadge(item) {
  const kind = item.kind || 'both';
  if (kind === 'tasks') return '<span class="backup-type-badge backup-type-tasks">🟦 任务数据</span>';
  if (kind === 'config') return '<span class="backup-type-badge backup-type-config">🟩 配置 / Key</span>';
  return '<span class="backup-type-badge backup-type-both">🟪 任务 + 配置 / Key</span>';
}

function renderRemoteBackupList() {
  const list = document.getElementById('backupList');
  if (!list) return;
  const filterEl = document.getElementById('backupListFilter');
  const filter = filterEl ? filterEl.value : 'all';
  const items = remoteBackupItems.filter(item => backupKindMatchesFilter(item, filter));

  if (items.length === 0) {
    list.innerHTML = '<p style="color:#999;">当前筛选下暂无备份</p>';
    return;
  }

  list.innerHTML = items.map(item => {
    const size = item.size ? Math.max(1, Math.round(item.size / 1024)) + ' KB' : '-';
    const latestBadge = item.isLatest ? '<span class="backup-latest-badge">⭐ 最新状态</span>' : '';
    const check = item.isLatest
      ? ''
      : '<input type="checkbox" class="backup-select-checkbox" data-file="' + escapeHtml(item.fileName || '') + '" style="width:auto;margin:0 8px 0 0;vertical-align:middle;">';
    const deleteBtn = item.isLatest
      ? ''
      : '<button class="btn-danger btn-sm" onclick="deleteRemoteBackup(\\\'' + encodeURIComponent(item.fileName) + '\\\')">删除</button>';
    const reason = item.backupTypeLabel ? '<div style="font-size:12px;color:#777;margin-top:4px;">' + escapeHtml(item.backupTypeLabel) + '</div>' : '';
    return '<div class="history-item" style="padding:12px 0;">' +
      '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">' + check + backupTypeBadge(item) + latestBadge + '</div>' +
      '<div style="margin-top:6px;"><strong>' + escapeHtml(item.displayName || item.fileName || '-') + '</strong></div>' +
      '<div>🕒 ' + escapeHtml(item.modified || '-') + '　📦 ' + size + '</div>' +
      reason +
      '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="btn-success btn-sm" onclick="prepareRestoreRemoteBackup(\\\'' + encodeURIComponent(item.fileName) + '\\\')">恢复</button>' +
        deleteBtn +
      '</div>' +
    '</div>';
  }).join('');
}

async function loadRemoteBackups() {
  const list = document.getElementById('backupList');
  if (!list) return;
  list.innerHTML = '<p style="color:#999;">正在读取...</p>';

  try {
    const resp = await fetch('/api/backups', { headers: getHeaders() });
    const data = await resp.json();

    if (!data.success) {
      list.innerHTML = '<p style="color:#e74c3c;">' + escapeHtml(data.message || '读取失败') + '</p>';
      return;
    }

    remoteBackupItems = data.items || [];
    if (remoteBackupItems.length === 0) {
      list.innerHTML = '<p style="color:#999;">暂无远端备份</p>';
      return;
    }

    renderRemoteBackupList();
  } catch (e) {
    list.innerHTML = '<p style="color:#e74c3c;">读取备份失败</p>';
  }
}

function selectVisibleBackups(checked) {
  document.querySelectorAll('#backupList .backup-select-checkbox').forEach(el => { el.checked = !!checked; });
}

async function deleteSelectedRemoteBackups() {
  const selected = Array.from(document.querySelectorAll('#backupList .backup-select-checkbox:checked')).map(el => el.dataset.file).filter(Boolean);
  if (selected.length === 0) {
    showToast('请先选择要删除的历史备份', 'error');
    return;
  }
  if (!confirm('确定删除选中的 ' + selected.length + ' 份历史备份？最新状态备份不会被删除。')) return;

  try {
    const resp = await fetch('/api/backups/delete-batch', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fileNames: selected })
    });
    const data = await resp.json();
    if (data.success) {
      showToast('已删除 ' + (data.deleted || 0) + ' 份备份');
      await loadRemoteBackups();
    } else {
      showToast(data.message || '批量删除失败', 'error');
    }
  } catch (e) {
    showToast('批量删除失败', 'error');
  }
}

let pendingRestoreBackupFileName = '';
let pendingRestoreBackupInfo = null;

function updateRestoreExpiredPolicyVisibility() {
  const taskCheckbox = document.getElementById('restoreDetectedTasks');
  const wrap = document.getElementById('restoreExpiredPolicyWrap');
  if (!wrap) return;
  wrap.style.display = taskCheckbox && taskCheckbox.checked ? 'block' : 'none';
}

function renderDetectedRestoreOptions(info) {
  const container = document.getElementById('restoreDetectedOptions');
  const summary = document.getElementById('restoreBackupSummary');
  if (!container || !summary) return;

  const available = info && info.available ? info.available : {};
  const rows = [];
  const summaryParts = [];

  if (available.tasks) {
    const taskCount = parseInt(info.taskCount) || 0;
    const trashCount = parseInt(info.trashCount) || 0;
    const historyCount = parseInt(info.historyCount) || 0;
    rows.push(
      '<label style="display:flex;align-items:flex-start;gap:9px;padding:10px 12px;margin-bottom:8px;border:1px solid #e9ecef;border-radius:9px;background:#fafbfc;cursor:pointer;">' +
        '<input type="checkbox" id="restoreDetectedTasks" checked style="width:auto;margin:3px 0 0 0;" onchange="updateRestoreExpiredPolicyVisibility()">' +
        '<span><strong>任务数据</strong><br><span style="font-size:12px;color:#777;">正常任务 ' + taskCount + ' 个，回收站 ' + trashCount + ' 个，续订历史 ' + historyCount + ' 组</span></span>' +
      '</label>'
    );
    summaryParts.push('任务数据');
  }

  if (available.config) {
    const count = parseInt(info.configFieldCount) || 0;
    rows.push(
      '<label style="display:flex;align-items:flex-start;gap:9px;padding:10px 12px;margin-bottom:8px;border:1px solid #e9ecef;border-radius:9px;background:#fafbfc;cursor:pointer;">' +
        '<input type="checkbox" id="restoreDetectedConfig" checked style="width:auto;margin:3px 0 0 0;">' +
        '<span><strong>系统配置</strong><br><span style="font-size:12px;color:#777;">检测到 ' + count + ' 个可恢复配置字段</span></span>' +
      '</label>'
    );
    summaryParts.push('系统配置');
  }

  if (available.keys) {
    const count = parseInt(info.keyFieldCount) || 0;
    rows.push(
      '<label style="display:flex;align-items:flex-start;gap:9px;padding:10px 12px;margin-bottom:8px;border:1px solid #e9ecef;border-radius:9px;background:#fafbfc;cursor:pointer;">' +
        '<input type="checkbox" id="restoreDetectedKeys" checked style="width:auto;margin:3px 0 0 0;">' +
        '<span><strong>推送 Key</strong><br><span style="font-size:12px;color:#777;">检测到 ' + count + ' 个 Token / API Key / 推送相关字段</span></span>' +
      '</label>'
    );
    summaryParts.push('推送 Key');
  }

  if (rows.length === 0) {
    container.innerHTML = '<div style="padding:12px;border-radius:8px;background:#fff3f3;color:#c0392b;">该备份未检测到可恢复内容。</div>';
    summary.textContent = '检测完成：未发现任务、系统配置或推送 Key。';
    document.getElementById('confirmRestoreBackupBtn').disabled = true;
  } else {
    container.innerHTML = rows.join('');
    const countText = available.tasks
      ? ' 当前任务 ' + (parseInt(info.currentTaskCount) || 0) + ' 个，备份任务 ' + (parseInt(info.taskCount) || 0) + ' 个。'
      : '';
    summary.textContent = '检测完成：该备份包含 ' + summaryParts.join('、') + '。' + countText + '请选择本次需要恢复的内容。';
    document.getElementById('confirmRestoreBackupBtn').disabled = false;
  }

  updateRestoreExpiredPolicyVisibility();
}

async function prepareRestoreRemoteBackup(encodedFileName) {
  const fileName = decodeURIComponent(encodedFileName);
  pendingRestoreBackupFileName = fileName;
  pendingRestoreBackupInfo = null;

  document.getElementById('restoreBackupFileName').textContent = '备份：' + fileName;
  document.getElementById('restoreBackupSummary').textContent = '正在读取并检测备份内容...';
  document.getElementById('restoreDetectedOptions').innerHTML = '<p style="color:#999;">正在检测...</p>';
  document.getElementById('restoreExpiredPolicyWrap').style.display = 'none';
  document.getElementById('confirmRestoreBackupBtn').disabled = true;
  openModal('restoreBackupModal');

  try {
    const resp = await fetch('/api/backups/inspect', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fileName })
    });
    const data = await resp.json();

    if (!data.success) {
      document.getElementById('restoreBackupSummary').textContent = data.message || '检测备份内容失败';
      document.getElementById('restoreDetectedOptions').innerHTML = '<div style="padding:12px;border-radius:8px;background:#fff3f3;color:#c0392b;">无法读取该备份，请检查远端连接或备份文件是否完整。</div>';
      return;
    }

    pendingRestoreBackupInfo = data;
    renderDetectedRestoreOptions(data);
  } catch (e) {
    document.getElementById('restoreBackupSummary').textContent = '检测备份内容失败';
    document.getElementById('restoreDetectedOptions').innerHTML = '<div style="padding:12px;border-radius:8px;background:#fff3f3;color:#c0392b;">读取备份时发生网络或解析错误。</div>';
  }
}

async function confirmRestoreRemoteBackup() {
  const fileName = pendingRestoreBackupFileName;
  if (!fileName || !pendingRestoreBackupInfo) {
    showToast('尚未完成备份内容检测', 'error');
    return;
  }

  const taskEl = document.getElementById('restoreDetectedTasks');
  const configEl = document.getElementById('restoreDetectedConfig');
  const keysEl = document.getElementById('restoreDetectedKeys');
  const restoreSections = {
    tasks: !!(taskEl && taskEl.checked),
    config: !!(configEl && configEl.checked),
    keys: !!(keysEl && keysEl.checked)
  };

  if (!restoreSections.tasks && !restoreSections.config && !restoreSections.keys) {
    showToast('请至少选择一项恢复内容', 'error');
    return;
  }

  const expiredPolicy = document.getElementById('restoreExpiredPolicy').value || 'expired';
  const selected = [];
  if (restoreSections.tasks) selected.push('任务数据');
  if (restoreSections.config) selected.push('系统配置');
  if (restoreSections.keys) selected.push('推送 Key');

  const policyText = restoreSections.tasks
    ? (expiredPolicy === 'push'
      ? '已过期任务会立即推送一次，然后保持已过期状态。'
      : '已过期任务会恢复为已过期状态，不补发。')
    : '本次不恢复任务数据。';

  const taskCountText = restoreSections.tasks
    ? '\\n当前正常任务：' + (parseInt(pendingRestoreBackupInfo.currentTaskCount) || 0) + ' 个；备份正常任务：' + (parseInt(pendingRestoreBackupInfo.taskCount) || 0) + ' 个。'
    : '';

  if (!confirm('确认恢复备份“' + fileName + '”？\\n恢复内容：' + selected.join('、') + taskCountText + '\\n当前采用合并恢复：同 ID 数据会覆盖，未选择的类别和其他现有任务不会删除。\\n' + policyText)) return;

  const button = document.getElementById('confirmRestoreBackupBtn');
  button.disabled = true;
  button.textContent = '恢复中...';

  try {
    const resp = await fetch('/api/backups/restore', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fileName, expiredPolicy, restoreSections })
    });
    const data = await resp.json();

    if (data.success) {
      const parts = [];
      if (restoreSections.tasks) parts.push('任务 ' + (data.restoredTasks || 0) + '，回收站 ' + (data.restoredTrash || 0));
      if (data.restoredConfig) parts.push('系统配置');
      if (data.restoredKeys) parts.push('推送 Key');
      if (data.pushedExpired) parts.push('立即推送 ' + data.pushedExpired + ' 条');
      closeModal('restoreBackupModal');
      showToast('恢复完成：' + (parts.join('，') || '无可恢复内容'));
      await loadTasks();
    } else {
      showToast(data.message || '恢复失败', 'error');
    }
  } catch (e) {
    showToast('恢复失败', 'error');
  } finally {
    button.disabled = false;
    button.textContent = '开始恢复';
  }
}

async function deleteRemoteBackup(encodedFileName) {
  const fileName = decodeURIComponent(encodedFileName);
  if (!confirm('确定删除远端备份“' + fileName + '”？')) return;

  try {
    const resp = await fetch('/api/backups/' + encodeURIComponent(fileName), {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await resp.json();

    if (data.success) {
      showToast('远端备份已删除');
      await loadRemoteBackups();
    } else {
      showToast(data.message || '删除失败', 'error');
    }
  } catch (e) {
    showToast('删除失败', 'error');
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

  notifierConfigCache = {
    serverchanKey: data.serverchanKey || '',
    pushplusToken: data.pushplusToken || '',
    tgBotToken: data.tgBotToken || '',
    tgChatId: data.tgChatId || '',
    emailFrom: data.emailFrom || '',
    emailTo: data.emailTo || '',
    emailApiKey: data.emailApiKey || '',
    brevoFrom: data.brevoFrom || '',
    brevoFromName: data.brevoFromName || '',
    brevoTo: data.brevoTo || '',
    brevoApiKey: data.brevoApiKey || '',
    notifyxApiKey: data.notifyxApiKey || ''
  };

  const checkboxes = document.querySelectorAll('#notifierCheckboxes input[type="checkbox"]');
  const selected = data.notifierTypes || [];

  checkboxes.forEach(cb => {
    cb.checked = selected.includes(cb.value);
  });

  renderNotifierFields(selected);
  openModal('configModal');
}

function syncNotifierConfigCacheFromDOM() {
  document.querySelectorAll('#notifierConfigFields input').forEach(el => {
    const key = el.id.replace('cfg_', '');
    notifierConfigCache[key] = el.value;
  });
}

function getNotifierMeta(type) {
  const all = {
    serverchan: { name: 'Server酱', fields: [{ key: 'serverchanKey', label: 'SendKey' }] },
    pushplus: { name: 'PushPlus', fields: [{ key: 'pushplusToken', label: 'Token' }] },
    telegram: { name: 'Telegram', fields: [{ key: 'tgBotToken', label: 'Bot Token' }, { key: 'tgChatId', label: 'Chat ID' }] },
    email: { name: '邮件（Resend）', fields: [{ key: 'emailFrom', label: '发件邮箱' }, { key: 'emailTo', label: '收件邮箱（多个用英文逗号分隔）' }, { key: 'emailApiKey', label: 'API Key (Resend)' }] },
    brevo: { name: '邮件（Brevo）', fields: [{ key: 'brevoFrom', label: '发件邮箱' }, { key: 'brevoFromName', label: '发件人名称（可选）', optional: true }, { key: 'brevoTo', label: '收件邮箱（多个用英文逗号分隔）' }, { key: 'brevoApiKey', label: 'API Key (Brevo)' }] },
    notifyx: { name: 'NotifyX', fields: [{ key: 'notifyxApiKey', label: 'API Key' }] }
  };
  return all[type] || { name: type, fields: [] };
}

function renderNotifierFields(selectedTypes) {
  const container = document.getElementById('notifierConfigFields');
  let html = '';

  selectedTypes.forEach(type => {
    const meta = getNotifierMeta(type);
    const fields = meta.fields || [];

    if (fields.length) {
      const configured = fields.every(field => field.optional || String(notifierConfigCache[field.key] || '').trim());
      html += '<div class="config-detail">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">' +
          '<strong>' + meta.name + '</strong>' +
          '<span style="font-size:12px;color:' + (configured ? '#2e7d32' : '#888') + ';">' + (configured ? '✅ 已配置' : '⚪ 未配置完整') + '</span>' +
        '</div>';

      fields.forEach(f => {
        const val = notifierConfigCache[f.key] || '';
        html += '<label>' + f.label + '</label><input type="text" id="cfg_' + f.key + '" value="' + val + '">';
      });

      html += '<div class="notifier-action-row" style="display:flex;gap:8px;flex-wrap:wrap;margin:2px 0 8px 0;">' +
        '<button type="button" class="btn-success btn-sm" onclick="testNotifierChannel(\\'' + type + '\\')">🧪 测试此渠道</button>' +
        '<button type="button" class="btn-danger btn-sm" onclick="clearNotifierChannelConfig(\\'' + type + '\\')">🗑️ 清除配置</button>' +
      '</div></div>';
    }
  });

  container.innerHTML = html;
}

async function testNotifierChannel(type) {
  syncNotifierConfigCacheFromDOM();
  const meta = getNotifierMeta(type);
  const settings = {};
  (meta.fields || []).forEach(field => {
    settings[field.key] = String(notifierConfigCache[field.key] || '').trim();
  });

  showToast('正在测试 ' + meta.name + '...');

  try {
    const resp = await fetch('/api/config/test-notifier', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type, settings })
    });
    const data = await resp.json();
    if (data.success) showToast('✅ ' + meta.name + ' 测试成功');
    else showToast('❌ ' + meta.name + ' 测试失败：' + (data.message || '未知错误'), 'error');
  } catch (e) {
    showToast('❌ ' + meta.name + ' 测试请求失败', 'error');
  }
}

async function clearNotifierChannelConfig(type) {
  syncNotifierConfigCacheFromDOM();
  const meta = getNotifierMeta(type);
  if (!confirm('确定清除“' + meta.name + '”的已保存配置吗？\\n清除后会同时停用该推送渠道，需要重新填写 Key / Token 后才能再次使用。')) return;

  try {
    const resp = await fetch('/api/config/clear-notifier', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type })
    });
    const data = await resp.json();
    if (!data.success) {
      showToast(data.message || '清除配置失败', 'error');
      return;
    }

    (meta.fields || []).forEach(field => { notifierConfigCache[field.key] = ''; });
    const checkbox = document.querySelector('#notifierCheckboxes input[value="' + type + '"]');
    if (checkbox) checkbox.checked = false;
    const selected = Array.from(document.querySelectorAll('#notifierCheckboxes input[type="checkbox"]:checked')).map(cb => cb.value);
    renderNotifierFields(selected);
    showToast(meta.name + ' 配置已清除并停用');
  } catch (e) {
    showToast('清除配置失败', 'error');
  }
}

document.addEventListener('input', function(e) {
  if (e.target && e.target.closest && e.target.closest('#notifierConfigFields')) {
    const key = e.target.id ? e.target.id.replace('cfg_', '') : '';
    if (key) notifierConfigCache[key] = e.target.value;
  }
});

document.addEventListener('change', function(e) {
  if (e.target.closest && e.target.closest('#notifierCheckboxes')) {
    syncNotifierConfigCacheFromDOM();

    const checkboxes = document.querySelectorAll('#notifierCheckboxes input[type="checkbox"]:checked');
    const selected = Array.from(checkboxes).map(cb => cb.value);

    renderNotifierFields(selected);
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

  syncNotifierConfigCacheFromDOM();

  Object.entries(notifierConfigCache).forEach(([key, value]) => {
    config[key] = String(value || '').trim();
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
    case 'minute':
      result.setUTCMinutes(result.getUTCMinutes() + value);
      return result;
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

function getReminderOffsetMinutesForWorker(value, unit) {
  const num = parseInt(value) || 0;
  if (unit === 'minute') return num;
  if (unit === 'hour') return num * 60;
  return num * 24 * 60;
}

function normalizeReminderPairs(reminderDays, reminderUnits) {
  return (reminderDays || [])
    .map((value, i) => ({
      value: parseInt(value),
      unit: reminderUnits && reminderUnits[i] ? reminderUnits[i] : 'day'
    }))
    .filter(g => !isNaN(g.value) && g.value > 0)
    .sort((a, b) => getReminderOffsetMinutesForWorker(b.value, b.unit) - getReminderOffsetMinutesForWorker(a.value, a.unit));
}

async function markSingleTaskCompleted(kv, task, reason) {
  if (!task || task.completedAt) return;

  task.completedAt = new Date().toISOString();
  task.autoRenew = false;

  await kv.put('task_' + task.id, JSON.stringify(task));

  await addPushLog(kv, {
    type: '单次完成',
    taskId: task.id,
    taskName: task.name,
    nextReminder: task.nextReminder,
    remindTime: task.remindTime || '08:00',
    success: true,
    error: reason || '到期提醒已结束，单次提醒已标记完成。'
  });
}

function makeAdvanceTriggerTime(task, value, unit) {
  const trigger = makeRemindDateTime(task);

  if (unit === 'minute') {
    trigger.setMinutes(trigger.getMinutes() - value);
  } else if (unit === 'hour') {
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
    if (unit === 'minute' || unit === 'hour' || unit === 'day' || unit === 'week') {
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

function advanceTaskToFirstFutureCycle(task, nowMs) {
  if (!task || !task.nextReminder) return { success: false, message: '缺少当前提醒时间' };

  const val = Math.max(1, parseInt(task.periodValue) || 1);
  const unit = task.periodUnit || 'month';
  const currentTime = task.remindTime || '08:00';
  const firstMs = new Date(task.nextReminder + 'T' + currentTime + ':00+08:00').getTime();
  const targetNow = Number(nowMs) || Date.now();

  if (!Number.isFinite(firstMs)) return { success: false, message: '当前提醒时间无效' };
  if (firstMs > targetNow) return { success: true, skippedCycles: 0 };

  // 分钟/小时/日/周都是固定长度周期，可一次算出需要跳过多少个周期，
  // 避免 5 分钟任务冻结较久后逐周期循环几百、几千次。
  const fixedUnitMs = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000
  };

  if (fixedUnitMs[unit]) {
    const stepMs = fixedUnitMs[unit] * val;
    const skippedCycles = Math.floor((targetNow - firstMs) / stepMs) + 1;
    const base = parseDateTimeLocal(task.nextReminder, currentTime);
    const previous = addPeriodToDateTimeForWorker(base, val * Math.max(0, skippedCycles - 1), unit);
    const future = addPeriodToDateTimeForWorker(base, val * skippedCycles, unit);

    task.startDate = formatDateLocal(previous);
    task.startTime = formatTimeLocal(previous);
    task.nextReminder = formatDateLocal(future);
    task.remindTime = formatTimeLocal(future);

    const futureMs = new Date(task.nextReminder + 'T' + task.remindTime + ':00+08:00').getTime();
    if (!Number.isFinite(futureMs) || futureMs <= targetNow) {
      return { success: false, message: '无法定位到下一个有效未来时间' };
    }

    return { success: true, skippedCycles };
  }

  // 月/年以及农历月/年周期长度不固定，逐周期推进，但只推进到第一个真正未来的周期。
  let skippedCycles = 0;
  let currentMs = firstMs;
  while (currentMs <= targetNow && skippedCycles < 5000) {
    const oldNext = task.nextReminder;
    const oldTime = task.remindTime || '08:00';
    const next = calcNextFromReminderDate(task);

    if (!next || !next.nextReminder) return { success: false, message: '无法计算下一个有效未来周期' };
    const nextTime = next.remindTime || oldTime;
    if (next.nextReminder === oldNext && nextTime === oldTime) {
      return { success: false, message: '下一周期未发生变化，无法解冻' };
    }

    task.startDate = oldNext;
    task.startTime = oldTime;
    task.nextReminder = next.nextReminder;
    task.remindTime = nextTime;
    currentMs = new Date(task.nextReminder + 'T' + task.remindTime + ':00+08:00').getTime();
    skippedCycles++;
  }

  if (!Number.isFinite(currentMs) || currentMs <= targetNow) {
    return { success: false, message: '无法在支持范围内找到下一个有效未来周期' };
  }

  return { success: true, skippedCycles };
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

    logs = logs.slice(0, 200);

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
    error: '到期提醒重试窗口已结束，已尝试 ' + ((retryState && retryState.attempts) || 0) + ' 次。当前提醒点已结束。'
  });

  return true;
}
// ============================================================
// Cloudflare Worker 入口
// ============================================================
export default {
  async fetch(request, env, ctx) {
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

    // ---------- OneDrive OAuth 回调（Microsoft 重定向回此地址时没有本系统 Bearer Token） ----------
    if (path === '/api/onedrive/callback' && method === 'GET') {
      const state = url.searchParams.get('state') || '';
      const code = url.searchParams.get('code') || '';
      const oauthError = url.searchParams.get('error') || '';
      const oauthErrorDescription = url.searchParams.get('error_description') || '';

      const htmlResponse = (ok, message) => new Response(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>OneDrive 授权</title>
<style>body{font-family:-apple-system,sans-serif;background:#f0f2f5;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.box{background:#fff;padding:28px;border-radius:14px;max-width:520px;width:90%;box-shadow:0 4px 20px rgba(0,0,0,.1);text-align:center}.ok{color:#1b8f4d}.err{color:#d63031}</style></head>
<body><div class="box"><h2 class="${ok ? 'ok' : 'err'}">${ok ? '✅ OneDrive 已连接' : '❌ OneDrive 连接失败'}</h2><p>${escapeHtmlServer(message)}</p><p style="color:#888;font-size:13px;">${ok ? '可以关闭此窗口并返回任务提醒页面。' : '请关闭窗口，检查 OneDrive 配置后重试。'}</p></div>
<script>try{if(window.opener){window.opener.postMessage({type:'task-reminder-onedrive-connected',success:${ok ? 'true' : 'false'}},window.location.origin);}}catch(e){}${ok ? 'setTimeout(()=>window.close(),1200);' : ''}</script></body></html>`, {
        status: ok ? 200 : 400,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });

      if (oauthError) {
        return htmlResponse(false, oauthErrorDescription || oauthError);
      }
      if (!state || !code) {
        return htmlResponse(false, '授权回调缺少 code 或 state');
      }

      const stateKey = 'onedrive_oauth_state_' + state;
      const stateRaw = await kv.get(stateKey);
      await kv.delete(stateKey);
      if (!stateRaw) {
        return htmlResponse(false, '授权状态已失效，请重新发起连接');
      }

      let stateData = {};
      try { stateData = JSON.parse(stateRaw); } catch (e) {}

      try {
        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        validateOneDriveSettings(settings, false);
        const redirectUri = stateData.redirectUri || (url.origin + '/api/onedrive/callback');
        const codeVerifier = stateData.codeVerifier || '';
        if (!codeVerifier) throw new Error('PKCE 授权状态缺少 code_verifier，请重新连接 OneDrive');
        const tokenData = await exchangeOneDriveAuthorizationCode(settings, code, redirectUri, codeVerifier);
        await verifyOneDriveToken(tokenData.access_token);
        await saveOneDriveTokens(kv, tokenData, 'pkce');
        const folderInfo = await ensureConfiguredOneDriveBackupFolder(kv, tokenData.access_token);
        queueAutoBackup(ctx, kv, '连接 OneDrive');
        return htmlResponse(true, '授权成功，当前备份目录：' + folderInfo.path + '。');
      } catch (e) {
        return htmlResponse(false, e.message || 'OneDrive 授权失败');
      }
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

      const reminderPairs = normalizeReminderPairs(reminderDays || [], reminderUnits || []);

      if (reminderPairs.some(g => g.unit === 'minute' && g.value % 5 !== 0)) {
        return errorResponse('提前提醒的分钟数必须是 5 的倍数', 400);
      }

      const task = {
        id: crypto.randomUUID(),
        name,
        autoRenew: (mode === 'countdown') ? false : !!autoRenew,
        mode: mode === 'lunar' ? 'periodic' : (mode || 'periodic'),
        calendarType: calendarType || (mode === 'lunar' ? 'lunar' : 'solar'),
        remindTime: remindTime || '08:00',
        reminderDays: reminderPairs.map(g => g.value),
        reminderUnits: reminderPairs.map(g => g.unit),
        remark: remark || '',
        createdAt: new Date().toISOString(),
        completedAt: '',
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
      queueAutoBackup(ctx, kv, '新建任务');

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
      const reminderPairs = normalizeReminderPairs(body.reminderDays || [], body.reminderUnits || []);

      if (reminderPairs.some(g => g.unit === 'minute' && g.value % 5 !== 0)) {
        return errorResponse('提前提醒的分钟数必须是 5 的倍数', 400);
      }

      task.reminderDays = reminderPairs.map(g => g.value);
      task.reminderUnits = reminderPairs.map(g => g.unit);
      task.nextReminder = body.nextReminder || task.nextReminder;
      task.completedAt = body.completedAt !== undefined ? body.completedAt : task.completedAt;
      task.startDate = body.startDate !== undefined ? body.startDate : task.startDate;
      task.startTime = body.startTime !== undefined ? body.startTime : task.startTime;
      task.periodValue = body.periodValue !== undefined ? body.periodValue : task.periodValue;
      task.periodUnit = body.periodUnit !== undefined ? body.periodUnit : task.periodUnit;
      task.countdownDays = body.countdownDays !== undefined ? body.countdownDays : task.countdownDays;
      task.lunarYear = body.lunarYear !== undefined ? body.lunarYear : task.lunarYear;
      task.lunarMonth = body.lunarMonth !== undefined ? body.lunarMonth : task.lunarMonth;
      task.lunarDay = body.lunarDay !== undefined ? body.lunarDay : task.lunarDay;
      task.lunarLeap = body.lunarLeap !== undefined ? body.lunarLeap : task.lunarLeap;

      // 用户主动编辑后，以新设置为准，恢复正常提醒逻辑。
      delete task.suppressCatchUp;
      delete task.restoredAt;

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
      queueAutoBackup(ctx, kv, '修改任务');

      return new Response(JSON.stringify({
        success: true,
        task
      }), {
        headers: corsHeaders
      });
    }

    // ---------- 冻结 / 解冻任务 ----------
    if (path.startsWith('/api/tasks/') && path.endsWith('/freeze') && method === 'POST') {
      const id = path.split('/')[3];
      const raw = await kv.get('task_' + id);
      if (!raw) return errorResponse('任务不存在', 404);

      let body = {};
      try { body = await request.json(); } catch (e) {}
      const task = JSON.parse(raw);

      if (task.completedAt) return errorResponse('已完成任务无需冻结', 400);

      const freeze = body.freeze !== false;
      const nowIso = new Date().toISOString();

      if (freeze) {
        task.frozen = true;
        task.frozenAt = nowIso;
        await kv.put('task_' + id, JSON.stringify(task));
        queueAutoBackup(ctx, kv, '冻结任务');
        return new Response(JSON.stringify({ success: true, frozen: true, task }), { headers: corsHeaders });
      }

      const remindMs = task.nextReminder
        ? new Date(task.nextReminder + 'T' + (task.remindTime || '08:00') + ':00+08:00').getTime()
        : 0;
      const isPast = !!remindMs && remindMs <= Date.now();
      const policy = String(body.policy || 'normal');
      let suppressCatchUp = false;
      let pushAttempted = false;
      let pushSuccess = false;
      let movedToNext = false;
      let skippedCycles = 0;

      delete task.frozen;
      delete task.frozenAt;
      task.unfrozenAt = nowIso;

      if (!isPast) {
        delete task.suppressCatchUp;
        delete task.restoredAt;
      } else if (policy === 'next') {
        if (task.mode === 'countdown') return errorResponse('单次提醒不能跳到下一周期，请选择恢复为已过期或立即推送', 400);

        const moveResult = advanceTaskToFirstFutureCycle(task, Date.now());
        if (!moveResult.success) return errorResponse(moveResult.message || '无法找到下一个有效未来周期', 400);
        skippedCycles = moveResult.skippedCycles || 1;

        if (task.calendarType === 'lunar' || task.mode === 'lunar') {
          const parts = task.nextReminder.split('-').map(Number);
          const lunar = LunarCalendar.solarToLunar(parts[0], parts[1], parts[2]);
          if (lunar) {
            task.lunarYear = lunar.lunarYear;
            task.lunarMonth = lunar.lunarMonth;
            task.lunarDay = lunar.lunarDay;
            task.lunarLeap = lunar.isLeapMonth;
          }
        }

        delete task.suppressCatchUp;
        delete task.restoredAt;
        movedToNext = true;

        const historyRaw = await kv.get('history_' + id);
        let history = historyRaw ? JSON.parse(historyRaw) : [];
        history.push({
          renewedAt: nowIso,
          nextReminder: task.nextReminder,
          remindTime: task.remindTime || '08:00',
          reason: '解冻后跳到下一个有效未来周期（跳过 ' + skippedCycles + ' 个已过期周期）'
        });
        if (history.length > 21) history = history.slice(-21);
        await kv.put('history_' + id, JSON.stringify(history));
      } else {
        suppressCatchUp = true;
        task.suppressCatchUp = true;
        task.restoredAt = nowIso;
      }

      await kv.put('task_' + id, JSON.stringify(task));

      if (isPast && policy === 'push') {
        pushAttempted = true;
        const title = '❄️ 解冻提醒：' + task.name;
        const content =
          '📋 "' + task.name + '" 已解冻，并按你的选择立即推送一次。\n' +
          '📅 原提醒日：' + task.nextReminder + ' ' + (task.remindTime || '08:00') + '\n' +
          '📝 备注：' + (task.remark || '无');
        const result = await sendNotification(config, title, content, task);
        pushSuccess = !!result.success;

        await addPushLog(kv, {
          type: '解冻立即推送',
          taskId: task.id,
          taskName: task.name,
          nextReminder: task.nextReminder,
          remindTime: task.remindTime || '08:00',
          success: pushSuccess,
          error: result.error || ''
        });

        if (pushSuccess && task.mode === 'countdown') {
          await markSingleTaskCompleted(kv, task, '解冻后立即推送成功，单次提醒已标记完成。');
        }
      }

      queueAutoBackup(ctx, kv, '解冻任务');
      return new Response(JSON.stringify({
        success: true,
        frozen: false,
        task,
        suppressCatchUp,
        pushAttempted,
        pushSuccess,
        movedToNext,
        skippedCycles,
        nextReminder: task.nextReminder,
        remindTime: task.remindTime || '08:00'
      }), { headers: corsHeaders });
    }

    // ---------- 删除任务：移入回收站 ----------
    if (path.startsWith('/api/tasks/') && method === 'DELETE') {
      const id = path.split('/')[3];
      const existing = await kv.get('task_' + id);

      if (!existing) return errorResponse('任务不存在', 404);

      const task = JSON.parse(existing);
      task.deletedAt = new Date().toISOString();

      await kv.put('trash_' + id, JSON.stringify(task));
      await kv.delete('task_' + id);
      queueAutoBackup(ctx, kv, '删除任务');

      return new Response(JSON.stringify({
        success: true
      }), {
        headers: corsHeaders
      });
    }

    // ---------- 回收站 ----------
    if (path === '/api/trash' && method === 'GET') {
      const items = await getAllTrash(kv);

      return new Response(JSON.stringify({
        success: true,
        items
      }), {
        headers: corsHeaders
      });
    }

    if (path.startsWith('/api/trash/') && path.endsWith('/restore') && method === 'POST') {
      const id = path.split('/')[3];
      const raw = await kv.get('trash_' + id);

      if (!raw) return errorResponse('回收站中不存在该任务', 404);

      let body = {};
      try { body = await request.json(); } catch (e) {}

      const policy = body.policy || 'normal';
      const task = JSON.parse(raw);
      const restoredAt = new Date().toISOString();
      const remindMs = task.nextReminder
        ? new Date(task.nextReminder + 'T' + (task.remindTime || '08:00') + ':00+08:00').getTime()
        : 0;
      const isPast = !!remindMs && remindMs <= Date.now() && !task.completedAt;

      delete task.deletedAt;
      task.restoredAt = restoredAt;

      // 已过期任务恢复时统一禁止 Cron 补发；编辑或手动续订会清除此标记。
      if (isPast) task.suppressCatchUp = true;
      else delete task.suppressCatchUp;

      await kv.put('task_' + id, JSON.stringify(task));
      await kv.delete('trash_' + id);

      let pushAttempted = false;
      let pushSuccess = false;

      if (isPast && policy === 'push') {
        pushAttempted = true;
        const title = '♻️ 恢复提醒：' + task.name;
        const content =
          '📋 "' + task.name + '" 已从回收站恢复，并按你的选择立即推送一次。\n' +
          '📅 原提醒日：' + task.nextReminder + ' ' + (task.remindTime || '08:00') + '\n' +
          '📝 备注：' + (task.remark || '无');

        const result = await sendNotification(config, title, content, task);
        pushSuccess = !!result.success;

        await addPushLog(kv, {
          type: '恢复立即推送',
          taskId: task.id,
          taskName: task.name,
          nextReminder: task.nextReminder,
          remindTime: task.remindTime || '08:00',
          success: pushSuccess,
          error: result.error || ''
        });

        // 单次提醒立即补推成功后直接标记完成；周期任务仍保持已过期，等待编辑或手动续订。
        if (pushSuccess && task.mode === 'countdown') {
          await markSingleTaskCompleted(kv, task, '从回收站恢复后立即推送成功，单次提醒已标记完成。');
        }
      }

      queueAutoBackup(ctx, kv, '恢复任务');

      return new Response(JSON.stringify({
        success: true,
        task,
        suppressCatchUp: isPast,
        pushAttempted,
        pushSuccess
      }), {
        headers: corsHeaders
      });
    }

    if (path.startsWith('/api/trash/') && method === 'DELETE') {
      const id = path.split('/')[3];
      const raw = await kv.get('trash_' + id);

      if (!raw) return errorResponse('回收站中不存在该任务', 404);

      await permanentlyDeleteTaskData(kv, id);
      queueAutoBackup(ctx, kv, '永久删除任务');

      return new Response(JSON.stringify({
        success: true
      }), {
        headers: corsHeaders
      });
    }

    if (path === '/api/trash' && method === 'DELETE') {
      const items = await getAllTrash(kv);

      for (const item of items) {
        if (item && item.id) await permanentlyDeleteTaskData(kv, item.id);
      }
      queueAutoBackup(ctx, kv, '清空回收站');

      return new Response(JSON.stringify({
        success: true,
        deleted: items.length
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

      if (isLunarPeriodic && task.periodUnit !== 'minute' && task.periodUnit !== 'hour' && task.periodUnit !== 'day' && task.periodUnit !== 'week') {
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
      delete task.suppressCatchUp;
      delete task.restoredAt;

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
      queueAutoBackup(ctx, kv, '手动续订');

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

    if (path === '/api/push-logs' && method === 'DELETE') {
      await kv.delete('push_logs');

      return new Response(JSON.stringify({
        success: true
      }), {
        headers: corsHeaders
      });
    }

    // ---------- 远端备份设置 ----------
    if (path === '/api/backup-settings' && method === 'GET') {
      const settings = getBackupSettingsFromConfig(config);

      return new Response(JSON.stringify({
        success: true,
        settings: publicBackupSettings(settings)
      }), {
        headers: corsHeaders
      });
    }

    if (path === '/api/backup-settings' && method === 'POST') {
      try {
        const body = await request.json();
        const result = await saveBackupSettingsToConfig(kv, body);
        queueAutoBackup(ctx, kv, '修改备份设置');

        return new Response(JSON.stringify({
          success: true,
          onedriveConnected: !!result.onedriveConnected
        }), {
          headers: corsHeaders
        });
      } catch (e) {
        return errorResponse(e.message || '保存远端备份配置失败', 400);
      }
    }

    // ---------- OneDrive OAuth ----------
    if (path === '/api/onedrive/auth-url' && method === 'GET') {
      try {
        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        if (settings.provider !== 'onedrive') throw new Error('当前备份位置不是 OneDrive');
        validateOneDriveSettings(settings, false);

        const redirectUri = url.origin + '/api/onedrive/callback';
        const state = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
        const codeVerifier = createPkceVerifier();
        const codeChallenge = await createPkceChallenge(codeVerifier);
        await kv.put('onedrive_oauth_state_' + state, JSON.stringify({
          redirectUri,
          codeVerifier,
          createdAt: new Date().toISOString()
        }), { expirationTtl: 10 * 60 });

        return new Response(JSON.stringify({
          success: true,
          authorizationUrl: buildOneDriveAuthorizationUrl(settings, redirectUri, state, codeChallenge),
          redirectUri
        }), {
          headers: corsHeaders
        });
      } catch (e) {
        return errorResponse(e.message || '生成 OneDrive 授权地址失败', 400);
      }
    }

    if (path === '/api/onedrive/disconnect' && method === 'POST') {
      const rawConfig = await kv.get('config');
      const existing = rawConfig ? JSON.parse(rawConfig) : {};
      delete existing.onedriveRefreshToken;
      delete existing.onedriveAccessToken;
      delete existing.onedriveAccessTokenExpiresAt;
      delete existing.onedriveAuthMode;
      delete existing.onedriveClientSecret;
      await kv.put('config', JSON.stringify(existing));

      return new Response(JSON.stringify({ success: true }), {
        headers: corsHeaders
      });
    }

    // ---------- OneDrive 目录浏览 / 新建 / 选择 ----------
    if (path === '/api/onedrive/folders' && method === 'GET') {
      try {
        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        validateOneDriveSettings(settings, true);
        const token = await getOneDriveAccessToken(kv, latestConfig);
        const parentId = url.searchParams.get('parentId') || '';
        const result = await listOneDriveFolders(token, parentId);
        return new Response(JSON.stringify({ success: true, ...result }), { headers: corsHeaders });
      } catch (e) {
        return errorResponse(e.message || '读取 OneDrive 目录失败', 500);
      }
    }

    if (path === '/api/onedrive/folders' && method === 'POST') {
      try {
        const body = await request.json();
        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        validateOneDriveSettings(settings, true);
        const token = await getOneDriveAccessToken(kv, latestConfig);
        const result = await createOneDriveFolder(token, body.parentId || '', body.name || '');
        return new Response(JSON.stringify({ success: true, folder: result }), { headers: corsHeaders });
      } catch (e) {
        return errorResponse(e.message || '新建 OneDrive 文件夹失败', 400);
      }
    }

    if (path === '/api/onedrive/folder-select' && method === 'POST') {
      try {
        const body = await request.json();
        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        validateOneDriveSettings(settings, true);
        const token = await getOneDriveAccessToken(kv, latestConfig);
        const item = await getOneDriveFolderItem(token, body.folderId || '');
        await saveOneDriveFolderSelection(kv, item.id, item.path);
        queueAutoBackup(ctx, kv, '修改 OneDrive 备份目录');
        return new Response(JSON.stringify({ success: true, folderId: item.id, path: item.path }), { headers: corsHeaders });
      } catch (e) {
        return errorResponse(e.message || '保存 OneDrive 备份目录失败', 400);
      }
    }

    // ---------- 远端连接测试 ----------
    if (path === '/api/backup-test' && method === 'POST') {
      try {
        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        const result = await testRemoteBackupConnection(kv, latestConfig, settings);

        return new Response(JSON.stringify({
          success: true,
          ...result
        }), {
          headers: corsHeaders
        });
      } catch (e) {
        return errorResponse(e.message || '远端连接测试失败', 500);
      }
    }

    // ---------- 远端备份列表 ----------
    if (path === '/api/backups' && method === 'GET') {
      try {
        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        const rawItems = await listRemoteBackups(kv, latestConfig, settings);
        const items = rawItems.map(item => ({ ...item, ...describeBackupFileName(item.fileName) }));

        return new Response(JSON.stringify({
          success: true,
          items
        }), {
          headers: corsHeaders
        });
      } catch (e) {
        return errorResponse(e.message || '读取远端备份失败', 500);
      }
    }

    // ---------- 创建远端备份 ----------
    if (path === '/api/backups' && method === 'POST') {
      try {
        const body = await request.json();
        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        const scope = ['config', 'tasks', 'both'].includes(body.scope) ? body.scope : (settings.scope || 'both');
        const stamp = buildBackupTimestamp();
        const fileNames = [];
        let deletedOld = 0;

        if (scope === 'tasks' || scope === 'both') {
          const result = await writeBackupKind(kv, latestConfig, settings, 'tasks', {
            backupType: 'manual',
            reason: '手动备份',
            createHistory: true,
            stamp
          });
          if (result.historyName) fileNames.push(result.historyName);
          deletedOld += result.deletedOld || 0;
        }

        if (scope === 'config' || scope === 'both') {
          const result = await writeBackupKind(kv, latestConfig, settings, 'config', {
            backupType: 'manual',
            reason: '手动备份',
            createHistory: true,
            stamp
          });
          if (result.historyName) fileNames.push(result.historyName);
          deletedOld += result.deletedOld || 0;
        }

        return new Response(JSON.stringify({
          success: true,
          fileNames,
          fileName: fileNames[0] || '',
          deletedOld
        }), {
          headers: corsHeaders
        });
      } catch (e) {
        return errorResponse(e.message || '远端备份失败', 500);
      }
    }

    // ---------- 批量删除历史备份 ----------
    if (path === '/api/backups/delete-batch' && method === 'POST') {
      try {
        const body = await request.json();
        const names = Array.isArray(body.fileNames) ? body.fileNames.map(v => String(v || '').trim()).filter(Boolean) : [];
        if (names.length === 0) return errorResponse('没有选择要删除的备份', 400);

        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        let deleted = 0;

        for (const fileName of [...new Set(names)].slice(0, 100)) {
          if (!isSafeBackupFileName(fileName)) continue;
          const meta = describeBackupFileName(fileName);
          if (meta.isLatest) continue;
          try {
            await deleteRemoteBackupFile(kv, latestConfig, settings, fileName);
            deleted++;
          } catch (e) {}
        }

        return new Response(JSON.stringify({ success: true, deleted }), { headers: corsHeaders });
      } catch (e) {
        return errorResponse(e.message || '批量删除备份失败', 500);
      }
    }

    // ---------- 检测远端备份内容 ----------
    if (path === '/api/backups/inspect' && method === 'POST') {
      try {
        const body = await request.json();
        const fileName = String(body.fileName || '').trim();
        if (!isSafeBackupFileName(fileName)) return errorResponse('备份文件名无效', 400);

        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        const backup = await getRemoteBackup(kv, latestConfig, settings, fileName);
        const sections = normalizeBackupSectionsForRestore(backup || {});

        const taskCount = Array.isArray(sections.tasks) ? sections.tasks.length : 0;
        const trashCount = Array.isArray(sections.trash) ? sections.trash.length : 0;
        const historyCount = sections.histories && typeof sections.histories === 'object' ? Object.keys(sections.histories).length : 0;
        const currentTasks = await getAllTasks(kv);
        const currentTaskCount = currentTasks.length;
        const configFieldCount = sections.config && typeof sections.config === 'object' ? Object.keys(sections.config).length : 0;
        const keyFieldCount = sections.keys && typeof sections.keys === 'object' ? Object.keys(sections.keys).length : 0;

        return new Response(JSON.stringify({
          success: true,
          fileName,
          format: backup && backup.format ? backup.format : '',
          scope: backup && backup.scope ? backup.scope : '',
          backupType: backup && backup.backupType ? backup.backupType : '',
          exportedAt: backup && backup.exportedAt ? backup.exportedAt : '',
          available: {
            tasks: taskCount > 0 || trashCount > 0 || historyCount > 0,
            config: configFieldCount > 0,
            keys: keyFieldCount > 0
          },
          taskCount,
          currentTaskCount,
          trashCount,
          historyCount,
          configFieldCount,
          keyFieldCount
        }), {
          headers: corsHeaders
        });
      } catch (e) {
        return errorResponse(e.message || '检测备份内容失败', 500);
      }
    }

    // ---------- 恢复远端备份 ----------
    if (path === '/api/backups/restore' && method === 'POST') {
      try {
        const body = await request.json();
        const fileName = String(body.fileName || '').trim();
        const expiredPolicy = body.expiredPolicy === 'push' ? 'push' : 'expired';
        const restoreSections = {
          tasks: body.restoreSections ? body.restoreSections.tasks !== false : true,
          config: body.restoreSections ? body.restoreSections.config !== false : true,
          keys: body.restoreSections ? body.restoreSections.keys !== false : true
        };

        if (!restoreSections.tasks && !restoreSections.config && !restoreSections.keys) return errorResponse('请至少选择一项恢复内容', 400);
        if (!isSafeBackupFileName(fileName)) return errorResponse('备份文件名无效', 400);

        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        const backup = await getRemoteBackup(kv, latestConfig, settings, fileName);
        const result = await restoreBackupPayload(kv, config, backup, expiredPolicy, restoreSections);

        return new Response(JSON.stringify({
          success: true,
          ...result
        }), {
          headers: corsHeaders
        });
      } catch (e) {
        return errorResponse(e.message || '恢复远端备份失败', 500);
      }
    }

    // ---------- 删除单个远端备份 ----------
    if (path.startsWith('/api/backups/') && method === 'DELETE') {
      try {
        const fileName = decodeURIComponent(path.slice('/api/backups/'.length));
        if (!isSafeBackupFileName(fileName)) return errorResponse('备份文件名无效', 400);
        if (describeBackupFileName(fileName).isLatest) return errorResponse('最新状态备份受保护，不能单独删除', 400);

        const latestRaw = await kv.get('config');
        const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
        const settings = getBackupSettingsFromConfig(latestConfig);
        await deleteRemoteBackupFile(kv, latestConfig, settings, fileName);

        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders
        });
      } catch (e) {
        return errorResponse(e.message || '删除远端备份失败', 500);
      }
    }

    // ---------- 单渠道测试 ----------
    if (path === '/api/config/test-notifier' && method === 'POST') {
      const body = await request.json();
      const type = String(body.type || '').trim();
      const fieldMap = {
        serverchan: ['serverchanKey'], pushplus: ['pushplusToken'], telegram: ['tgBotToken', 'tgChatId'],
        email: ['emailFrom', 'emailTo', 'emailApiKey'], brevo: ['brevoFrom', 'brevoFromName', 'brevoTo', 'brevoApiKey'], notifyx: ['notifyxApiKey']
      };
      const nameMap = { serverchan: 'Server酱', pushplus: 'PushPlus', telegram: 'Telegram', email: 'Resend', brevo: 'Brevo', notifyx: 'NotifyX' };
      if (!fieldMap[type]) return errorResponse('未知推送渠道', 400);

      const testConfig = { ...config };
      const settings = body.settings && typeof body.settings === 'object' ? body.settings : {};
      fieldMap[type].forEach(key => {
        if (Object.prototype.hasOwnProperty.call(settings, key)) testConfig[key] = String(settings[key] || '').trim();
      });

      const result = await sendNotification(
        testConfig,
        '🧪 推送渠道测试：' + nameMap[type],
        '这是一条来自任务提醒系统的单渠道测试消息。\n测试时间：' + new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        null,
        [type]
      );
      const channelResult = result.results && result.results.length ? result.results[0] : null;

      return new Response(JSON.stringify({
        success: !!(channelResult && channelResult.success),
        message: channelResult && channelResult.error ? channelResult.error : '',
        result: channelResult || null
      }), {
        status: channelResult && channelResult.success ? 200 : 400,
        headers: corsHeaders
      });
    }

    // ---------- 清除单渠道配置 ----------
    if (path === '/api/config/clear-notifier' && method === 'POST') {
      const body = await request.json();
      const type = String(body.type || '').trim();
      const fieldMap = {
        serverchan: ['serverchanKey'], pushplus: ['pushplusToken'], telegram: ['tgBotToken', 'tgChatId'],
        email: ['emailFrom', 'emailTo', 'emailApiKey'], brevo: ['brevoFrom', 'brevoFromName', 'brevoTo', 'brevoApiKey'], notifyx: ['notifyxApiKey']
      };
      if (!fieldMap[type]) return errorResponse('未知推送渠道', 400);

      const raw = await kv.get('config');
      const existing = raw ? JSON.parse(raw) : {};
      fieldMap[type].forEach(key => delete existing[key]);
      if (Array.isArray(existing.notifierTypes)) existing.notifierTypes = existing.notifierTypes.filter(item => item !== type);
      await kv.put('config', JSON.stringify(existing));
      queueAutoBackup(ctx, kv, '清除推送渠道配置');

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
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
      queueAutoBackup(ctx, kv, '修改系统或推送设置');

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

    // 每天最多执行一次回收站自动清理，永久删除超过 30 天的任务。
    await cleanupExpiredTrash(kv, nowMs);

    const tasks = await getAllTasks(kv);
    const retryWindowMinutes = getRetryWindowMinutes(config);

    for (const task of tasks) {
      if (!task.nextReminder || task.completedAt || task.frozen) continue;

      // 从回收站恢复且原提醒时间已经过去的任务，不补发历史提醒。
      // 用户编辑或手动续订后会自动清除此标记。
      if (task.suppressCatchUp) continue;

      const remindDateTime = makeRemindDateTime(task);
      const advanceReminders = normalizeReminderPairs(task.reminderDays || [], task.reminderUnits || []);
      const dueMinutes = (now.getTime() - remindDateTime.getTime()) / 60000;
      const dueNotifyKey = 'due_' + task.id + '_' + task.nextReminder + '_' + (task.remindTime || '08:00');
      let dueResult = null;

      // 1）提前提醒：每个提前点独立，最多 10 次
      for (let i = 0; i < advanceReminders.length; i++) {
        const val = Number(advanceReminders[i].value);
        const unit = advanceReminders[i].unit || 'day';

        if (!val || val <= 0) continue;

        const triggerTime = makeAdvanceTriggerTime(task, val, unit);

        // 恢复任务后，不补发恢复时间之前已经错过的提前提醒。
        if (task.restoredAt && triggerTime.getTime() <= new Date(task.restoredAt).getTime()) {
          continue;
        }

        const diffMinutes = (now.getTime() - triggerTime.getTime()) / 60000;

        if (diffMinutes >= 0 && diffMinutes <= retryWindowMinutes) {
          const title = '⏰ 任务提醒：' + task.name;
          const content =
            '📋 "' + task.name + '" 提醒日即将到来！\n' +
            '📅 日期：' + task.nextReminder + ' ' + (task.remindTime || '08:00') + '\n' +
            '⏳ 提前提醒：' + val + (unit === 'minute' ? '分钟' : (unit === 'hour' ? '小时' : '天')) + '\n' +
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

        dueResult = await handleNotificationWithRetryState(
          kv,
          config,
          task,
          dueNotifyKey,
          '到期提醒',
          title,
          content
        );
      }

      // 3）单次提醒：到期提醒结束后标记完成，不再进入过期提醒
      if (task.mode === 'countdown' && dueMinutes >= 0) {
        const dueFinished = dueResult && dueResult.finished
          ? true
          : await ensureDueReminderCanFinish(kv, config, task, dueNotifyKey);

        if (dueFinished) {
          await markSingleTaskCompleted(kv, task, '到期提醒已结束，单次提醒已标记完成。');
        }

        continue;
      }

      // 4）自动续订：到期提醒成功、10次失败，或者重试窗口结束后，才允许续订
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
              delete task.suppressCatchUp;
              delete task.restoredAt;

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

async function listKvKeysByPrefix(kv, prefix) {
  const names = [];
  let cursor = undefined;

  do {
    const options = { prefix };
    if (cursor) options.cursor = cursor;

    const list = await kv.list(options);
    for (const key of list.keys) names.push(key.name);

    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  return names;
}

async function getAllTrash(kv) {
  const items = [];
  const names = await listKvKeysByPrefix(kv, 'trash_');

  for (const name of names) {
    const raw = await kv.get(name);
    if (!raw) continue;

    try {
      const item = JSON.parse(raw);
      if (!item.id) item.id = name.slice('trash_'.length);
      items.push(item);
    } catch (e) {}
  }

  items.sort((a, b) => {
    const at = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
    const bt = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
    return bt - at;
  });

  return items;
}

async function deleteTaskStateKeys(kv, taskId) {
  const prefixes = ['done_', 'retry_', 'autorenew_'];

  for (const prefix of prefixes) {
    const names = await listKvKeysByPrefix(kv, prefix);

    for (const name of names) {
      if (name.includes('_' + taskId + '_') || name.startsWith('autorenew_' + taskId + '_')) {
        await kv.delete(name);
      }
    }
  }
}

async function permanentlyDeleteTaskData(kv, taskId) {
  await kv.delete('task_' + taskId);
  await kv.delete('trash_' + taskId);
  await kv.delete('history_' + taskId);
  await deleteTaskStateKeys(kv, taskId);
}

async function cleanupExpiredTrash(kv, nowMs) {
  const now = new Date(Number(nowMs) || Date.now());
  const dayKey = 'trash_cleanup_' +
    now.getUTCFullYear() + '-' +
    String(now.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(now.getUTCDate()).padStart(2, '0');

  try {
    if (await kv.get(dayKey)) return;
  } catch (e) {}

  const items = await getAllTrash(kv);
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
  const currentMs = Number(nowMs) || Date.now();

  for (const item of items) {
    if (!item || !item.id || !item.deletedAt) continue;

    const deletedMs = new Date(item.deletedAt).getTime();
    if (Number.isFinite(deletedMs) && currentMs - deletedMs >= maxAgeMs) {
      await permanentlyDeleteTaskData(kv, item.id);
    }
  }

  await kv.put(dayKey, '1', { expirationTtl: 2 * 24 * 60 * 60 });
}

function normalizeBackupProvider(value) {
  return value === 'custom' ? 'custom' : 'onedrive';
}

function normalizeBackupSettings(input) {
  input = input || {};
  return {
    provider: normalizeBackupProvider(input.provider),
    scope: ['config', 'tasks', 'both'].includes(input.scope) ? input.scope : 'both',
    autoEnabled: input.autoEnabled !== false,
    autoLastAt: String(input.autoLastAt || ''),
    autoLastError: String(input.autoLastError || ''),
    autoLastSummary: String(input.autoLastSummary || ''),
    tenant: String(input.tenant || 'common').trim() || 'common',
    clientId: String(input.clientId || '').trim(),
    clientSecret: String(input.clientSecret || '').trim(),
    authMode: String(input.authMode || ''),
    refreshToken: String(input.refreshToken || ''),
    accessToken: String(input.accessToken || ''),
    accessTokenExpiresAt: parseInt(input.accessTokenExpiresAt, 10) || 0,
    onedriveFolderId: String(input.onedriveFolderId || '').trim(),
    onedriveFolderPath: String(input.onedriveFolderPath || '').trim(),
    url: String(input.url || '').trim(),
    folder: String(input.folder || 'TaskReminderBackup').trim() || 'TaskReminderBackup',
    username: String(input.username || '').trim(),
    password: String(input.password || '')
  };
}

function getBackupSettingsFromConfig(config) {
  const legacyProvider = config.backupProvider || (config.webdavUrl ? 'custom' : 'onedrive');
  return normalizeBackupSettings({
    provider: legacyProvider,
    scope: config.backupScope || config.webdavBackupScope || 'both',
    autoEnabled: config.backupAutoEnabled !== false,
    autoLastAt: config.backupAutoLastAt || '',
    autoLastError: config.backupAutoLastError || '',
    autoLastSummary: config.backupAutoLastSummary || '',
    tenant: config.onedriveTenant || 'common',
    clientId: config.onedriveClientId,
    clientSecret: config.onedriveClientSecret,
    authMode: config.onedriveAuthMode || '',
    refreshToken: config.onedriveRefreshToken,
    accessToken: config.onedriveAccessToken,
    accessTokenExpiresAt: config.onedriveAccessTokenExpiresAt,
    onedriveFolderId: config.onedriveFolderId,
    onedriveFolderPath: config.onedriveFolderPath,
    url: config.webdavUrl,
    folder: config.webdavFolder,
    username: config.webdavUsername,
    password: config.webdavPassword
  });
}

function publicBackupSettings(settings) {
  return {
    provider: settings.provider,
    scope: settings.scope,
    autoEnabled: settings.autoEnabled !== false,
    autoLastAt: settings.autoLastAt || '',
    autoLastError: settings.autoLastError || '',
    autoLastSummary: settings.autoLastSummary || '',
    tenant: settings.tenant,
    clientId: settings.clientId,
    authMode: settings.authMode || '',
    onedriveConnected: !!settings.refreshToken,
    onedriveFolderId: settings.onedriveFolderId || '',
    onedriveFolderPath: settings.onedriveFolderPath || 'OneDrive/TaskReminderBackup',
    url: settings.url,
    folder: settings.folder,
    username: settings.username,
    password: settings.password
  };
}

async function saveBackupSettingsToConfig(kv, input) {
  const next = normalizeBackupSettings(input);
  const rawConfig = await kv.get('config');
  const existing = rawConfig ? JSON.parse(rawConfig) : {};
  const previous = getBackupSettingsFromConfig(existing);

  if (next.provider === 'onedrive') {
    validateOneDriveSettings(next, false);
  } else {
    validateWebDavSettings(next);
  }

  existing.backupProvider = next.provider;
  existing.backupScope = next.scope;
  existing.webdavBackupScope = next.scope;
  existing.backupAutoEnabled = next.autoEnabled !== false;

  if (next.provider === 'onedrive') {
    const identityChanged = previous.clientId !== next.clientId || previous.tenant !== next.tenant;
    existing.onedriveTenant = next.tenant;
    existing.onedriveClientId = next.clientId;

    if (identityChanged) {
      delete existing.onedriveRefreshToken;
      delete existing.onedriveAccessToken;
      delete existing.onedriveAccessTokenExpiresAt;
      delete existing.onedriveAuthMode;
      delete existing.onedriveClientSecret;
      delete existing.onedriveFolderId;
      delete existing.onedriveFolderPath;
    }
  } else {
    existing.webdavProvider = 'custom';
    existing.webdavUrl = next.url;
    existing.webdavFolder = next.folder;
    existing.webdavUsername = next.username;
    existing.webdavPassword = next.password;
  }

  await kv.put('config', JSON.stringify(existing));
  const saved = getBackupSettingsFromConfig(existing);
  return { onedriveConnected: !!saved.refreshToken };
}

function validateOneDriveSettings(settings, requireConnected = true) {
  if (!settings.clientId) {
    throw new Error('请先填写 OneDrive Client ID');
  }
  if (!/^[A-Za-z0-9._-]+$/.test(settings.tenant || 'common')) {
    throw new Error('Microsoft 租户格式无效');
  }
  if (requireConnected && !settings.refreshToken) {
    throw new Error('OneDrive 尚未授权，请先点击“连接 OneDrive”完成授权');
  }
}

function validateWebDavSettings(settings) {
  if (!settings.url || !settings.username || !settings.password) {
    throw new Error('请先配置 WebDAV 地址、用户名和密码/应用密码');
  }

  let parsed;
  try { parsed = new URL(settings.url); } catch (e) { throw new Error('WebDAV 地址格式无效'); }
  if (!/^https?:$/.test(parsed.protocol)) throw new Error('WebDAV 地址必须使用 http 或 https');
}

function base64UrlFromBytes(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function createPkceVerifier() {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return base64UrlFromBytes(bytes);
}

async function createPkceChallenge(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlFromBytes(new Uint8Array(digest));
}

function buildOneDriveAuthorizationUrl(settings, redirectUri, state, codeChallenge) {
  const tenant = encodeURIComponent(settings.tenant || 'common');
  const params = new URLSearchParams({
    client_id: settings.clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    response_mode: 'query',
    scope: 'offline_access Files.ReadWrite',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
  return 'https://login.microsoftonline.com/' + tenant + '/oauth2/v2.0/authorize?' + params.toString();
}

async function exchangeOneDriveAuthorizationCode(settings, code, redirectUri, codeVerifier) {
  const tenant = encodeURIComponent(settings.tenant || 'common');
  const response = await fetch('https://login.microsoftonline.com/' + tenant + '/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: settings.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      scope: 'offline_access Files.ReadWrite'
    }).toString()
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    const detail = String(data.error_description || data.error || '未知错误');
    const publicClientHint = /AADSTS7000218|client_secret|client_assertion/i.test(detail)
      ? '。请在 Microsoft Entra → 身份验证中，把本系统回调地址添加到“移动和桌面应用程序”的自定义重定向 URI 后重新连接'
      : '';
    throw new Error('Microsoft PKCE 授权换取令牌失败（HTTP ' + response.status + '）：' + detail.slice(0, 180) + publicClientHint);
  }
  if (!data.refresh_token) {
    throw new Error('Microsoft 未返回 refresh_token，请确认授权包含 offline_access');
  }
  return data;
}

async function verifyOneDriveToken(accessToken) {
  const driveResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive?$select=id,driveType,quota', {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  if (!driveResponse.ok) {
    const text = await driveResponse.text().catch(() => '');
    throw new Error('OneDrive 访问失败（HTTP ' + driveResponse.status + (text ? '：' + text.slice(0, 160) : '') + '）');
  }

  return true;
}

async function saveOneDriveTokens(kv, tokenData, authMode) {
  const rawConfig = await kv.get('config');
  const existing = rawConfig ? JSON.parse(rawConfig) : {};
  existing.onedriveAccessToken = tokenData.access_token || existing.onedriveAccessToken || '';
  if (tokenData.refresh_token) existing.onedriveRefreshToken = tokenData.refresh_token;
  existing.onedriveAccessTokenExpiresAt = Date.now() + Math.max(60, parseInt(tokenData.expires_in, 10) || 3600) * 1000;
  if (authMode) existing.onedriveAuthMode = authMode;
  if (authMode === 'pkce') delete existing.onedriveClientSecret;
  await kv.put('config', JSON.stringify(existing));
}

async function getOneDriveAccessToken(kv, config) {
  const settings = getBackupSettingsFromConfig(config);
  validateOneDriveSettings(settings, true);

  if (settings.accessToken && settings.accessTokenExpiresAt > Date.now() + 2 * 60 * 1000) {
    return settings.accessToken;
  }

  const tenant = encodeURIComponent(settings.tenant || 'common');
  const refreshParams = {
    client_id: settings.clientId,
    grant_type: 'refresh_token',
    refresh_token: settings.refreshToken,
    scope: 'offline_access Files.ReadWrite'
  };

  // 兼容已经存在的旧版 Client Secret 连接；重新“连接 OneDrive”后会切换到 PKCE 长期模式。
  if (settings.authMode !== 'pkce' && settings.clientSecret) {
    refreshParams.client_secret = settings.clientSecret;
  }

  const response = await fetch('https://login.microsoftonline.com/' + tenant + '/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(refreshParams).toString()
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error('OneDrive 登录状态已失效，请重新连接（HTTP ' + response.status + '）：' + String(data.error_description || data.error || '未知错误').slice(0, 180));
  }

  await saveOneDriveTokens(kv, data);
  return data.access_token;
}

const ONEDRIVE_BACKUP_FOLDER = 'TaskReminderBackup';

function oneDriveItemApiUrl(itemId, suffix = '') {
  return 'https://graph.microsoft.com/v1.0/me/drive/items/' + encodeURIComponent(itemId) + suffix;
}

function oneDriveFileUrl(folderId, fileName, content = false) {
  const safeName = encodeURIComponent(fileName);
  return oneDriveItemApiUrl(folderId, ':/' + safeName + ':' + (content ? '/content' : ''));
}

function oneDriveDisplayPathFromItem(item) {
  if (!item) return 'OneDrive';
  if (item.root) return 'OneDrive';
  if (!item.parentReference || !item.parentReference.path) return 'OneDrive';

  const parentPath = String(item.parentReference && item.parentReference.path || '');
  const marker = 'root:';
  const pos = parentPath.indexOf(marker);
  let relative = pos >= 0 ? parentPath.slice(pos + marker.length) : '';
  try { relative = decodeURIComponent(relative); } catch (e) {}
  relative = relative.replace(/^\/+|\/+$/g, '');

  const parts = ['OneDrive'];
  if (relative) parts.push(relative);
  if (item.name) parts.push(item.name);
  return parts.join('/').replace(/\/{2,}/g, '/');
}

async function getOneDriveRootItem(accessToken) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root?$select=id,name,root,parentReference,folder', {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error('读取 OneDrive 根目录失败（HTTP ' + response.status + (text ? '：' + text.slice(0, 120) : '') + '）');
  }
  const item = await response.json();
  item.path = 'OneDrive';
  return item;
}

async function getOneDriveFolderItem(accessToken, folderId) {
  if (!folderId) return await getOneDriveRootItem(accessToken);

  const response = await fetch(oneDriveItemApiUrl(folderId, '?$select=id,name,root,parentReference,folder'), {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error('读取 OneDrive 文件夹失败（HTTP ' + response.status + (text ? '：' + text.slice(0, 120) : '') + '）');
  }

  const item = await response.json();
  if (!item.folder && !item.root) throw new Error('选择的 OneDrive 项目不是文件夹');
  item.path = oneDriveDisplayPathFromItem(item);
  return item;
}

async function listOneDriveFolders(accessToken, parentId) {
  const current = await getOneDriveFolderItem(accessToken, parentId || '');
  const response = await fetch(oneDriveItemApiUrl(current.id, '/children?$select=id,name,folder,parentReference&$top=200'), {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error('读取 OneDrive 子目录失败（HTTP ' + response.status + (text ? '：' + text.slice(0, 120) : '') + '）');
  }

  const data = await response.json();
  const folders = (Array.isArray(data.value) ? data.value : [])
    .filter(item => item && item.folder)
    .map(item => ({
      id: item.id,
      name: item.name,
      path: oneDriveDisplayPathFromItem(item)
    }))
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN'));

  return {
    current: { id: current.id, name: current.name || 'OneDrive', path: current.path || 'OneDrive' },
    folders
  };
}

async function createOneDriveFolder(accessToken, parentId, name) {
  name = String(name || '').trim();
  if (!name) throw new Error('请输入文件夹名称');
  if (/[\\/:*?"<>|]/.test(name)) throw new Error('文件夹名称包含不支持的字符');

  const parent = await getOneDriveFolderItem(accessToken, parentId || '');
  const response = await fetch(oneDriveItemApiUrl(parent.id, '/children'), {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      folder: {},
      '@microsoft.graph.conflictBehavior': 'rename'
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error('新建 OneDrive 文件夹失败（HTTP ' + response.status + (text ? '：' + text.slice(0, 120) : '') + '）');
  }

  const item = await response.json();
  return { id: item.id, name: item.name, path: oneDriveDisplayPathFromItem(item) };
}

async function saveOneDriveFolderSelection(kv, folderId, folderPath) {
  const rawConfig = await kv.get('config');
  const existing = rawConfig ? JSON.parse(rawConfig) : {};
  existing.onedriveFolderId = String(folderId || '');
  existing.onedriveFolderPath = String(folderPath || 'OneDrive');
  await kv.put('config', JSON.stringify(existing));
}

async function ensureDefaultOneDriveBackupFolder(accessToken) {
  const root = await getOneDriveRootItem(accessToken);
  const response = await fetch(oneDriveItemApiUrl(root.id, '/children?$select=id,name,folder,parentReference&$top=200'), {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error('读取 OneDrive 根目录失败（HTTP ' + response.status + (text ? '：' + text.slice(0, 120) : '') + '）');
  }

  const data = await response.json();
  const existing = (Array.isArray(data.value) ? data.value : []).find(item => item && item.name === ONEDRIVE_BACKUP_FOLDER);
  if (existing) {
    if (!existing.folder) throw new Error('OneDrive 根目录已存在同名项目“' + ONEDRIVE_BACKUP_FOLDER + '”，但它不是文件夹，请先重命名或删除该项目');
    return { id: existing.id, name: existing.name, path: 'OneDrive/' + ONEDRIVE_BACKUP_FOLDER };
  }

  return await createOneDriveFolder(accessToken, root.id, ONEDRIVE_BACKUP_FOLDER);
}

async function ensureConfiguredOneDriveBackupFolder(kv, accessToken, config) {
  let latestConfig = config;
  if (!latestConfig) {
    const raw = await kv.get('config');
    latestConfig = raw ? JSON.parse(raw) : {};
  }
  const settings = getBackupSettingsFromConfig(latestConfig || {});

  if (settings.onedriveFolderId) {
    try {
      const item = await getOneDriveFolderItem(accessToken, settings.onedriveFolderId);
      const path = item.path || settings.onedriveFolderPath || 'OneDrive';
      if (path !== settings.onedriveFolderPath) {
        await saveOneDriveFolderSelection(kv, item.id, path);
      }
      return { id: item.id, path };
    } catch (e) {
      if (!/HTTP 404/.test(String(e && e.message || ''))) throw e;
    }
  }

  const folder = await ensureDefaultOneDriveBackupFolder(accessToken);
  await saveOneDriveFolderSelection(kv, folder.id, folder.path);
  return { id: folder.id, path: folder.path };
}

async function listOneDriveBackups(kv, config) {
  const token = await getOneDriveAccessToken(kv, config);
  const folder = await ensureConfiguredOneDriveBackupFolder(kv, token, config);
  const response = await fetch(oneDriveItemApiUrl(folder.id, '/children?$select=name,size,lastModifiedDateTime,file&$top=200'), {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error('读取 OneDrive 备份列表失败（HTTP ' + response.status + (text ? '：' + text.slice(0, 120) : '') + '）');
  }

  const data = await response.json();
  const items = Array.isArray(data.value) ? data.value : [];
  return items
    .filter(item => item && item.file && isSafeBackupFileName(item.name))
    .map(item => {
      const modifiedDate = item.lastModifiedDateTime ? new Date(item.lastModifiedDateTime) : null;
      return {
        fileName: item.name,
        modified: modifiedDate && !isNaN(modifiedDate.getTime())
          ? modifiedDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
          : '-',
        modifiedMs: modifiedDate && !isNaN(modifiedDate.getTime()) ? modifiedDate.getTime() : 0,
        size: parseInt(item.size, 10) || 0
      };
    })
    .sort((a, b) => {
      if (b.modifiedMs !== a.modifiedMs) return b.modifiedMs - a.modifiedMs;
      return b.fileName.localeCompare(a.fileName);
    });
}

async function putOneDriveBackup(kv, config, fileName, payload) {
  const token = await getOneDriveAccessToken(kv, config);
  const folder = await ensureConfiguredOneDriveBackupFolder(kv, token, config);
  const body = JSON.stringify(payload, null, 2);
  const response = await fetch(oneDriveFileUrl(folder.id, fileName, true), {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error('上传 OneDrive 备份失败（HTTP ' + response.status + (text ? '：' + text.slice(0, 140) : '') + '）');
  }
}

async function getOneDriveBackup(kv, config, fileName) {
  const token = await getOneDriveAccessToken(kv, config);
  const folder = await ensureConfiguredOneDriveBackupFolder(kv, token, config);
  const response = await fetch(oneDriveFileUrl(folder.id, fileName, true), {
    headers: { 'Authorization': 'Bearer ' + token },
    redirect: 'follow'
  });
  if (!response.ok) throw new Error('下载 OneDrive 备份失败（HTTP ' + response.status + '）');

  let data;
  try { data = await response.json(); } catch (e) { throw new Error('OneDrive 备份文件不是有效 JSON'); }
  if (!data || !['task-reminder-backup-v1', 'task-reminder-backup-v2'].includes(data.format)) throw new Error('不是本系统支持的备份文件');
  return data;
}

async function deleteOneDriveBackupFile(kv, config, fileName) {
  const token = await getOneDriveAccessToken(kv, config);
  const folder = await ensureConfiguredOneDriveBackupFolder(kv, token, config);
  const response = await fetch(oneDriveFileUrl(folder.id, fileName, false), {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!(response.ok || response.status === 204 || response.status === 404)) {
    throw new Error('删除 OneDrive 备份失败（HTTP ' + response.status + '）');
  }
}

async function testOneDriveConnection(kv, config) {
  const token = await getOneDriveAccessToken(kv, config);
  await verifyOneDriveToken(token);
  const folder = await ensureConfiguredOneDriveBackupFolder(kv, token, config);

  const fileName = 'task-reminder_connection-test-' + Date.now() + '.txt';
  const testBody = 'Task Reminder OneDrive connection test ' + new Date().toISOString();
  const putResponse = await fetch(oneDriveFileUrl(folder.id, fileName, true), {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'text/plain; charset=utf-8'
    },
    body: testBody
  });
  if (!putResponse.ok) throw new Error('OneDrive 写入测试失败（HTTP ' + putResponse.status + '）');

  try {
    const getResponse = await fetch(oneDriveFileUrl(folder.id, fileName, true), {
      headers: { 'Authorization': 'Bearer ' + token },
      redirect: 'follow'
    });
    if (!getResponse.ok) throw new Error('OneDrive 读取测试失败（HTTP ' + getResponse.status + '）');
    const returned = await getResponse.text();
    if (returned !== testBody) throw new Error('OneDrive 读写校验失败：返回内容与测试内容不一致');
  } finally {
    await fetch(oneDriveFileUrl(folder.id, fileName, false), {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    }).catch(() => null);
  }

  return { message: 'OneDrive 连接正常，当前目录 ' + folder.path + ' 读/写/删测试通过' };
}

function webDavAuthHeader(settings) {
  const bytes = new TextEncoder().encode(settings.username + ':' + settings.password);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return 'Basic ' + btoa(binary);
}

function normalizeWebDavBaseUrl(url) {
  return String(url || '').replace(/\/+$/, '') + '/';
}

function encodeWebDavPathPart(value) {
  return String(value || '')
    .split('/')
    .filter(Boolean)
    .map(part => encodeURIComponent(part))
    .join('/');
}

function getWebDavFolderUrl(settings) {
  return normalizeWebDavBaseUrl(settings.url) + encodeWebDavPathPart(settings.folder) + '/';
}

function getWebDavCollectionUrl(settings) {
  return getWebDavFolderUrl(settings);
}

function getWebDavFileUrl(settings, fileName) {
  return getWebDavCollectionUrl(settings) + encodeURIComponent(fileName);
}

async function ensureWebDavFolder(settings) {
  validateWebDavSettings(settings);
  const base = normalizeWebDavBaseUrl(settings.url);
  const parts = String(settings.folder || 'TaskReminderBackup').split('/').filter(Boolean);
  let current = base;

  for (const part of parts) {
    current += encodeURIComponent(part) + '/';
    const response = await fetch(current, {
      method: 'MKCOL',
      headers: { 'Authorization': webDavAuthHeader(settings) }
    });

    if (response.ok || response.status === 405 || response.status === 301 || response.status === 302) continue;

    const check = await fetch(current, {
      method: 'PROPFIND',
      headers: {
        'Authorization': webDavAuthHeader(settings),
        'Depth': '0'
      }
    });
    if (!(check.ok || check.status === 207)) {
      throw new Error('无法创建/访问 WebDAV 备份目录（HTTP ' + response.status + '）');
    }
  }
}

function decodeXmlEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function isSafeBackupFileName(fileName) {
  const name = String(fileName || '');
  return /^task-reminder_backup_(config|tasks|both)_\d{8}_\d{6}\.json$/.test(name) ||
    /^task-reminder_latest_(config|tasks)\.json$/.test(name);
}

async function listWebDavBackups(settings) {
  await ensureWebDavFolder(settings);
  const response = await fetch(getWebDavCollectionUrl(settings), {
    method: 'PROPFIND',
    headers: {
      'Authorization': webDavAuthHeader(settings),
      'Depth': '1',
      'Content-Type': 'application/xml; charset=utf-8'
    },
    body: '<?xml version="1.0" encoding="utf-8"?><d:propfind xmlns:d="DAV:"><d:prop><d:getlastmodified/><d:getcontentlength/><d:resourcetype/></d:prop></d:propfind>'
  });

  if (!(response.ok || response.status === 207)) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('WebDAV 认证失败，请检查用户名和应用密码（HTTP ' + response.status + '）');
    }
    throw new Error('读取 WebDAV 目录失败（HTTP ' + response.status + '）');
  }

  const xml = await response.text();
  const blocks = xml.match(/<(?:[^:>]+:)?response\b[\s\S]*?<\/(?:[^:>]+:)?response>/gi) || [];
  const items = [];

  for (const block of blocks) {
    const hrefMatch = block.match(/<(?:[^:>]+:)?href\b[^>]*>([\s\S]*?)<\/(?:[^:>]+:)?href>/i);
    if (!hrefMatch) continue;

    let href = decodeXmlEntities(hrefMatch[1].trim());
    try { href = decodeURIComponent(href); } catch (e) {}
    const fileName = href.split('/').filter(Boolean).pop() || '';
    if (!isSafeBackupFileName(fileName)) continue;

    const modifiedMatch = block.match(/<(?:[^:>]+:)?getlastmodified\b[^>]*>([\s\S]*?)<\/(?:[^:>]+:)?getlastmodified>/i);
    const sizeMatch = block.match(/<(?:[^:>]+:)?getcontentlength\b[^>]*>([\s\S]*?)<\/(?:[^:>]+:)?getcontentlength>/i);
    const modifiedRaw = modifiedMatch ? decodeXmlEntities(modifiedMatch[1].trim()) : '';
    const modifiedDate = modifiedRaw ? new Date(modifiedRaw) : null;

    items.push({
      fileName,
      modified: modifiedDate && !isNaN(modifiedDate.getTime()) ? modifiedDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '-',
      modifiedMs: modifiedDate && !isNaN(modifiedDate.getTime()) ? modifiedDate.getTime() : 0,
      size: sizeMatch ? (parseInt(sizeMatch[1], 10) || 0) : 0
    });
  }

  items.sort((a, b) => {
    if (b.modifiedMs !== a.modifiedMs) return b.modifiedMs - a.modifiedMs;
    return b.fileName.localeCompare(a.fileName);
  });
  return items;
}

async function putWebDavBackup(settings, fileName, payload) {
  await ensureWebDavFolder(settings);
  const body = JSON.stringify(payload, null, 2);
  const response = await fetch(getWebDavFileUrl(settings, fileName), {
    method: 'PUT',
    headers: {
      'Authorization': webDavAuthHeader(settings),
      'Content-Type': 'application/json; charset=utf-8'
    },
    body
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    if (response.status === 401 || response.status === 403) {
      throw new Error('WebDAV 认证失败，请检查用户名和应用密码（HTTP ' + response.status + '）');
    }
    throw new Error('上传 WebDAV 备份失败（HTTP ' + response.status + (text ? '：' + text.slice(0, 120) : '') + '）');
  }
}

async function getWebDavBackup(settings, fileName) {
  const response = await fetch(getWebDavFileUrl(settings, fileName), {
    headers: { 'Authorization': webDavAuthHeader(settings) }
  });
  if (!response.ok) throw new Error('下载备份失败（HTTP ' + response.status + '）');

  let data;
  try { data = await response.json(); } catch (e) { throw new Error('备份文件不是有效 JSON'); }
  if (!data || !['task-reminder-backup-v1', 'task-reminder-backup-v2'].includes(data.format)) throw new Error('不是本系统支持的备份文件');
  return data;
}

async function deleteWebDavBackupFile(settings, fileName) {
  const response = await fetch(getWebDavFileUrl(settings, fileName), {
    method: 'DELETE',
    headers: { 'Authorization': webDavAuthHeader(settings) }
  });
  if (!(response.ok || response.status === 404)) {
    throw new Error('删除远端备份失败（HTTP ' + response.status + '）');
  }
}

async function testWebDavConnectionForWorker(settings) {
  await ensureWebDavFolder(settings);
  const physicalName = 'task-reminder_connection-test-' + Date.now() + '.txt';
  const testUrl = getWebDavCollectionUrl(settings) + encodeURIComponent(physicalName);
  const testBody = 'Task Reminder WebDAV connection test ' + new Date().toISOString();

  const putResponse = await fetch(testUrl, {
    method: 'PUT',
    headers: {
      'Authorization': webDavAuthHeader(settings),
      'Content-Type': 'text/plain; charset=utf-8'
    },
    body: testBody
  });
  if (!putResponse.ok) {
    const detail = await putResponse.text().catch(() => '');
    if (putResponse.status === 401 || putResponse.status === 403) {
      throw new Error('WebDAV 认证失败，请检查用户名和应用密码（HTTP ' + putResponse.status + '）');
    }
    throw new Error('WebDAV 写入测试失败（HTTP ' + putResponse.status + (detail ? '：' + detail.slice(0, 120) : '') + '）');
  }

  try {
    const getResponse = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': webDavAuthHeader(settings),
        'Cache-Control': 'no-cache'
      }
    });
    if (!getResponse.ok) throw new Error('WebDAV 读取测试失败（HTTP ' + getResponse.status + '）');
    const returned = await getResponse.text();
    if (returned !== testBody) throw new Error('WebDAV 读写校验失败：返回内容与测试内容不一致');
  } finally {
    await fetch(testUrl, {
      method: 'DELETE',
      headers: { 'Authorization': webDavAuthHeader(settings) }
    }).catch(() => null);
  }
  return { message: 'WebDAV 连接正常，目录访问及读/写/删测试通过' };
}

async function listRemoteBackups(kv, config, settings) {
  if (settings.provider === 'onedrive') {
    validateOneDriveSettings(settings, true);
    return listOneDriveBackups(kv, config);
  }
  validateWebDavSettings(settings);
  return listWebDavBackups(settings);
}

async function putRemoteBackup(kv, config, settings, fileName, payload) {
  if (settings.provider === 'onedrive') {
    validateOneDriveSettings(settings, true);
    return putOneDriveBackup(kv, config, fileName, payload);
  }
  validateWebDavSettings(settings);
  return putWebDavBackup(settings, fileName, payload);
}

async function getRemoteBackup(kv, config, settings, fileName) {
  if (settings.provider === 'onedrive') {
    validateOneDriveSettings(settings, true);
    return getOneDriveBackup(kv, config, fileName);
  }
  validateWebDavSettings(settings);
  return getWebDavBackup(settings, fileName);
}

async function deleteRemoteBackupFile(kv, config, settings, fileName) {
  if (settings.provider === 'onedrive') {
    validateOneDriveSettings(settings, true);
    return deleteOneDriveBackupFile(kv, config, fileName);
  }
  validateWebDavSettings(settings);
  return deleteWebDavBackupFile(settings, fileName);
}

async function testRemoteBackupConnection(kv, config, settings) {
  if (settings.provider === 'onedrive') {
    validateOneDriveSettings(settings, true);
    return testOneDriveConnection(kv, config);
  }
  validateWebDavSettings(settings);
  return testWebDavConnectionForWorker(settings);
}

function buildBackupTimestamp() {
  const bj = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return String(bj.getUTCFullYear()) +
    String(bj.getUTCMonth() + 1).padStart(2, '0') +
    String(bj.getUTCDate()).padStart(2, '0') + '_' +
    String(bj.getUTCHours()).padStart(2, '0') +
    String(bj.getUTCMinutes()).padStart(2, '0') +
    String(bj.getUTCSeconds()).padStart(2, '0');
}

function buildBackupFileName(scope, stamp) {
  return 'task-reminder_backup_' + scope + '_' + (stamp || buildBackupTimestamp()) + '.json';
}

function buildLatestBackupFileName(kind) {
  return 'task-reminder_latest_' + kind + '.json';
}

function describeBackupFileName(fileName) {
  const name = String(fileName || '');
  let m = name.match(/^task-reminder_latest_(tasks|config)\.json$/);
  if (m) {
    const kind = m[1];
    return {
      kind,
      isLatest: true,
      displayName: kind === 'tasks' ? '最新任务状态' : '最新配置 / Key 状态',
      backupTypeLabel: '智能备份 · 最新状态'
    };
  }

  m = name.match(/^task-reminder_backup_(tasks|config|both)_(\d{8})_(\d{6})\.json$/);
  if (m) {
    const kind = m[1];
    return {
      kind,
      isLatest: false,
      displayName: kind === 'tasks' ? '任务历史备份' : (kind === 'config' ? '配置 / Key 历史备份' : '旧版完整备份'),
      backupTypeLabel: kind === 'both' ? '旧版 · 任务 + 配置 / Key' : '历史版本'
    };
  }

  return { kind: 'both', isLatest: false, displayName: name, backupTypeLabel: '旧版备份' };
}

async function trimRemoteBackupsByKind(kv, config, settings, kind, maxCount) {
  const items = await listRemoteBackups(kv, config, settings);
  const keep = Math.max(1, parseInt(maxCount) || 20);
  const sameKindHistory = items.filter(item => {
    const meta = describeBackupFileName(item.fileName);
    return !meta.isLatest && meta.kind === kind;
  });
  if (sameKindHistory.length <= keep) return 0;

  const oldItems = sameKindHistory.slice(keep);
  let deleted = 0;
  for (const item of oldItems) {
    try {
      await deleteRemoteBackupFile(kv, config, settings, item.fileName);
      deleted++;
    } catch (e) {}
  }
  return deleted;
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map(key => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(text || '')));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function comparableBackupData(payload, kind) {
  if (kind === 'tasks') {
    return {
      tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
      trash: Array.isArray(payload.trash) ? payload.trash : [],
      histories: payload.histories && typeof payload.histories === 'object' ? payload.histories : {}
    };
  }
  return {
    config: payload.config && typeof payload.config === 'object' ? payload.config : {},
    keys: payload.keys && typeof payload.keys === 'object' ? payload.keys : {}
  };
}

async function getBackupPayloadHash(payload, kind) {
  return sha256Hex(stableStringify(comparableBackupData(payload, kind)));
}

const BACKUP_HISTORY_MAX = 20;
const BACKUP_HISTORY_INTERVAL_MS = 30 * 60 * 1000;
const BACKUP_HASH_TASKS_KEY = 'backup_hash_tasks';
const BACKUP_HASH_CONFIG_KEY = 'backup_hash_config';
const BACKUP_HISTORY_LAST_TASKS_KEY = 'backup_history_last_tasks';
const BACKUP_HISTORY_LAST_CONFIG_KEY = 'backup_history_last_config';

async function writeBackupKind(kv, config, settings, kind, options = {}) {
  const payload = options.payload || await buildBackupPayload(kv, kind, {
    backupType: options.backupType || 'manual',
    reason: options.reason || ''
  });
  const hash = options.hash || await getBackupPayloadHash(payload, kind);
  const latestName = buildLatestBackupFileName(kind);

  await putRemoteBackup(kv, config, settings, latestName, payload);
  await kv.put(kind === 'tasks' ? BACKUP_HASH_TASKS_KEY : BACKUP_HASH_CONFIG_KEY, hash);

  let historyName = '';
  let deletedOld = 0;
  if (options.createHistory) {
    historyName = buildBackupFileName(kind, options.stamp || buildBackupTimestamp());
    await putRemoteBackup(kv, config, settings, historyName, payload);
    await kv.put(kind === 'tasks' ? BACKUP_HISTORY_LAST_TASKS_KEY : BACKUP_HISTORY_LAST_CONFIG_KEY, String(Date.now()));
    deletedOld = await trimRemoteBackupsByKind(kv, config, settings, kind, BACKUP_HISTORY_MAX);
  }

  return { latestName, historyName, hash, deletedOld };
}

const BACKUP_KEY_FIELDS = [
  'notifierTypes',
  'serverchanKey',
  'pushplusToken',
  'tgBotToken',
  'tgChatId',
  'emailFrom',
  'emailTo',
  'emailApiKey',
  'brevoFrom',
  'brevoFromName',
  'brevoTo',
  'brevoApiKey',
  'notifyxApiKey'
];

const BACKUP_CONNECTION_FIELDS = [
  'backupProvider',
  'backupScope',
  'webdavProvider',
  'webdavUrl',
  'webdavFolder',
  'webdavUsername',
  'webdavPassword',
  'webdavBackupScope',
  'onedriveTenant',
  'onedriveClientId',
  'onedriveClientSecret',
  'onedriveAuthMode',
  'onedriveRefreshToken',
  'onedriveAccessToken',
  'onedriveAccessTokenExpiresAt',
  'onedriveFolderId',
  'onedriveFolderPath',
  'jwtSecret',
  'backupAutoLastAt',
  'backupAutoLastError',
  'backupAutoLastSummary'
];

function splitConfigForBackup(rawConfig) {
  const cfg = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
  const systemConfig = {};
  const keys = {};

  for (const [key, value] of Object.entries(cfg)) {
    if (BACKUP_CONNECTION_FIELDS.includes(key)) continue;
    if (BACKUP_KEY_FIELDS.includes(key)) keys[key] = value;
    else systemConfig[key] = value;
  }

  return { systemConfig, keys };
}

function normalizeBackupSectionsForRestore(backup) {
  const result = {
    config: {},
    keys: {},
    tasks: Array.isArray(backup && backup.tasks) ? backup.tasks : [],
    trash: Array.isArray(backup && backup.trash) ? backup.trash : [],
    histories: backup && backup.histories && typeof backup.histories === 'object' ? backup.histories : {}
  };

  if (backup && backup.format === 'task-reminder-backup-v2') {
    result.config = backup.config && typeof backup.config === 'object' ? backup.config : {};
    result.keys = backup.keys && typeof backup.keys === 'object' ? backup.keys : {};
    return result;
  }

  // 兼容旧版 v1：原来的配置和推送 Key 混在 backup.config 中。
  const legacy = backup && backup.config && typeof backup.config === 'object' ? backup.config : {};
  const split = splitConfigForBackup(legacy);
  result.config = split.systemConfig;
  result.keys = split.keys;
  return result;
}

async function buildBackupPayload(kv, scope, options = {}) {
  const payload = {
    format: 'task-reminder-backup-v2',
    version: 2,
    exportedAt: new Date().toISOString(),
    scope,
    backupType: options.backupType || 'manual',
    reason: options.reason || ''
  };

  if (scope === 'config' || scope === 'both') {
    const raw = await kv.get('config');
    const cfg = raw ? JSON.parse(raw) : {};
    const split = splitConfigForBackup(cfg);
    payload.config = split.systemConfig;
    payload.keys = split.keys;
  }

  if (scope === 'tasks' || scope === 'both') {
    payload.tasks = await getAllTasks(kv);
    payload.trash = await getAllTrash(kv);
    payload.histories = {};

    const ids = new Set();
    for (const task of payload.tasks) if (task && task.id) ids.add(task.id);
    for (const task of payload.trash) if (task && task.id) ids.add(task.id);

    for (const id of ids) {
      const raw = await kv.get('history_' + id);
      if (raw) {
        try { payload.histories[id] = JSON.parse(raw); } catch (e) {}
      }
    }
  }

  return payload;
}

function escapeHtmlServer(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function restoreBackupPayload(kv, config, backup, expiredPolicy, restoreSections = {}) {
  const sections = normalizeBackupSectionsForRestore(backup || {});
  const restoreTasks = restoreSections.tasks !== false;
  const restoreConfig = restoreSections.config !== false;
  const restoreKeys = restoreSections.keys !== false;

  let restoredConfig = false;
  let restoredKeys = false;
  let restoredTasks = 0;
  let restoredTrash = 0;
  let pushedExpired = 0;
  let pushConfig = { ...config };
  const nowMs = Date.now();
  const restoredAt = new Date(nowMs).toISOString();

  if (restoreConfig || restoreKeys) {
    const currentRaw = await kv.get('config');
    const current = currentRaw ? JSON.parse(currentRaw) : {};
    const merged = { ...current };

    if (restoreConfig && sections.config && typeof sections.config === 'object') {
      Object.assign(merged, sections.config);
      restoredConfig = Object.keys(sections.config).length > 0;
    }

    if (restoreKeys && sections.keys && typeof sections.keys === 'object') {
      Object.assign(merged, sections.keys);
      restoredKeys = Object.keys(sections.keys).length > 0;
    }

    // 远端连接、OAuth Token 与当前自动备份运行状态始终保留当前值，避免恢复后断开备份连接。
    for (const key of BACKUP_CONNECTION_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(current, key)) merged[key] = current[key];
      else delete merged[key];
    }

    await kv.put('config', JSON.stringify(merged));
    pushConfig = { ...pushConfig, ...merged };
  }

  const histories = sections.histories || {};

  if (restoreTasks && Array.isArray(sections.tasks)) {
    for (const source of sections.tasks) {
      if (!source || !source.id) continue;
      const task = JSON.parse(JSON.stringify(source));
      delete task.deletedAt;
      task.restoredAt = restoredAt;

      const remindMs = task.nextReminder
        ? new Date(task.nextReminder + 'T' + (task.remindTime || '08:00') + ':00+08:00').getTime()
        : 0;
      const isPast = !!remindMs && remindMs <= nowMs && !task.completedAt;

      if (isPast) task.suppressCatchUp = true;
      else delete task.suppressCatchUp;

      await deleteTaskStateKeys(kv, task.id);
      await kv.delete('trash_' + task.id);
      await kv.put('task_' + task.id, JSON.stringify(task));

      if (Object.prototype.hasOwnProperty.call(histories, task.id)) {
        await kv.put('history_' + task.id, JSON.stringify(histories[task.id] || []));
      }

      restoredTasks++;

      if (isPast && expiredPolicy === 'push') {
        const title = '☁️ 备份恢复提醒：' + task.name;
        const content =
          '📋 "' + task.name + '" 已从远端备份恢复，并按你的选择立即推送一次。\n' +
          '📅 原提醒日：' + task.nextReminder + ' ' + (task.remindTime || '08:00') + '\n' +
          '📝 备注：' + (task.remark || '无');
        const result = await sendNotification(pushConfig, title, content, task);

        await addPushLog(kv, {
          type: '备份恢复立即推送',
          taskId: task.id,
          taskName: task.name,
          nextReminder: task.nextReminder,
          remindTime: task.remindTime || '08:00',
          success: !!result.success,
          error: result.error || ''
        });

        if (result.success) {
          pushedExpired++;
          if (task.mode === 'countdown') {
            await markSingleTaskCompleted(kv, task, '从远端备份恢复后立即推送成功，单次提醒已标记完成。');
          }
        }
      }
    }
  }

  if (restoreTasks && Array.isArray(sections.trash)) {
    for (const source of sections.trash) {
      if (!source || !source.id) continue;
      const task = JSON.parse(JSON.stringify(source));
      if (!task.deletedAt) task.deletedAt = restoredAt;

      await kv.delete('task_' + task.id);
      await kv.put('trash_' + task.id, JSON.stringify(task));

      if (Object.prototype.hasOwnProperty.call(histories, task.id)) {
        await kv.put('history_' + task.id, JSON.stringify(histories[task.id] || []));
      }

      restoredTrash++;
    }
  }

  return {
    restoredConfig,
    restoredKeys,
    restoredTasks,
    restoredTrash,
    pushedExpired
  };
}

const AUTO_BACKUP_PENDING_KEY = 'backup_auto_pending';
const AUTO_BACKUP_DELAY_MS = 10000;

function queueAutoBackup(ctx, kv, reason) {
  const job = scheduleAutoBackup(kv, reason).catch(() => null);
  if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(job);
}

async function updateAutoBackupStatus(kv, success, errorMessage, summary) {
  try {
    const raw = await kv.get('config');
    const cfg = raw ? JSON.parse(raw) : {};
    cfg.backupAutoLastAt = new Date().toISOString();
    cfg.backupAutoLastError = success ? '' : String(errorMessage || '自动备份失败').slice(0, 180);
    cfg.backupAutoLastSummary = success ? String(summary || '').slice(0, 180) : '';
    await kv.put('config', JSON.stringify(cfg));
  } catch (e) {}
}

async function scheduleAutoBackup(kv, reason) {
  const configRaw = await kv.get('config');
  const config = configRaw ? JSON.parse(configRaw) : {};
  const settings = getBackupSettingsFromConfig(config);

  if (settings.autoEnabled === false) return;
  if (settings.provider === 'onedrive' && !settings.refreshToken) return;
  if (settings.provider === 'custom' && (!settings.url || !settings.username || !settings.password)) return;

  const token = crypto.randomUUID();
  await kv.put(AUTO_BACKUP_PENDING_KEY, JSON.stringify({
    token,
    reason: String(reason || ''),
    requestedAt: new Date().toISOString()
  }), { expirationTtl: 5 * 60 });

  await new Promise(resolve => setTimeout(resolve, AUTO_BACKUP_DELAY_MS));

  const pendingRaw = await kv.get(AUTO_BACKUP_PENDING_KEY);
  if (!pendingRaw) return;
  let pending = {};
  try { pending = JSON.parse(pendingRaw); } catch (e) {}
  if (pending.token !== token) return;

  try {
    const latestRaw = await kv.get('config');
    const latestConfig = latestRaw ? JSON.parse(latestRaw) : {};
    const latestSettings = getBackupSettingsFromConfig(latestConfig);
    if (latestSettings.autoEnabled === false) return;

    const tasksPayload = await buildBackupPayload(kv, 'tasks', {
      backupType: 'auto',
      reason: pending.reason || reason || ''
    });
    const configPayload = await buildBackupPayload(kv, 'config', {
      backupType: 'auto',
      reason: pending.reason || reason || ''
    });

    const taskHash = await getBackupPayloadHash(tasksPayload, 'tasks');
    const configHash = await getBackupPayloadHash(configPayload, 'config');
    const oldTaskHash = await kv.get(BACKUP_HASH_TASKS_KEY);
    const oldConfigHash = await kv.get(BACKUP_HASH_CONFIG_KEY);
    const taskChanged = oldTaskHash !== taskHash;
    const configChanged = oldConfigHash !== configHash;

    if (!taskChanged && !configChanged) {
      await updateAutoBackupStatus(kv, true, '', '内容无变化，未生成新备份');
      return;
    }

    const now = Date.now();
    const summary = [];

    if (taskChanged) {
      const lastHistory = parseInt(await kv.get(BACKUP_HISTORY_LAST_TASKS_KEY), 10) || 0;
      const createHistory = !lastHistory || now - lastHistory >= BACKUP_HISTORY_INTERVAL_MS;
      await writeBackupKind(kv, latestConfig, latestSettings, 'tasks', {
        payload: tasksPayload,
        hash: taskHash,
        backupType: 'auto',
        reason: pending.reason || reason || '',
        createHistory
      });
      summary.push(createHistory ? '任务：最新状态 + 历史版本' : '任务：更新最新状态');
    }

    if (configChanged) {
      const lastHistory = parseInt(await kv.get(BACKUP_HISTORY_LAST_CONFIG_KEY), 10) || 0;
      const createHistory = !lastHistory || now - lastHistory >= BACKUP_HISTORY_INTERVAL_MS;
      await writeBackupKind(kv, latestConfig, latestSettings, 'config', {
        payload: configPayload,
        hash: configHash,
        backupType: 'auto',
        reason: pending.reason || reason || '',
        createHistory
      });
      summary.push(createHistory ? '配置/Key：最新状态 + 历史版本' : '配置/Key：更新最新状态');
    }

    await updateAutoBackupStatus(kv, true, '', summary.join('；'));
  } catch (e) {
    await updateAutoBackupStatus(kv, false, e && e.message ? e.message : String(e || '自动备份失败'), '');
  } finally {
    const latestPending = await kv.get(AUTO_BACKUP_PENDING_KEY);
    if (latestPending) {
      try {
        const parsed = JSON.parse(latestPending);
        if (parsed.token === token) await kv.delete(AUTO_BACKUP_PENDING_KEY);
      } catch (e) {}
    }
  }
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
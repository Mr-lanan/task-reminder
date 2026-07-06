// ============================================================
// 配置读取（优先环境变量 -> KV存储 -> 默认值）
// ============================================================
async function getConfig(env) {
  const kv = env.TASKS_KV;
  let config = {};
  try {
    const raw = await kv.get('config');
    if (raw) config = JSON.parse(raw);
  } catch (e) {}

  // 环境变量覆盖（在 Cloudflare Dashboard 设置）
  config.username = env.DEFAULT_USERNAME || config.username || 'admin';
  config.password = env.DEFAULT_PASSWORD || config.password || 'admin123';
  config.jwtSecret = env.JWT_SECRET || config.jwtSecret || 'change-this-secret';
  
  // 通知渠道配置（从 KV 读取，界面配置会保存到这里）
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
  .header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 16px 24px; border-radius: 12px; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
  .header h1 { font-size: 22px; }
  .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .header-actions button { padding: 8px 18px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
  .btn-primary { background: #4a6cf7; color: #fff; }
  .btn-success { background: #2ecc71; color: #fff; }
  .btn-danger { background: #e74c3c; color: #fff; }
  .btn-outline { background: transparent; color: #555; border: 2px solid #ddd; }
  .btn-sm { padding: 4px 12px; font-size: 12px; }
  .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
  .task-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-left: 4px solid #4a6cf7; }
  .task-card .title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  .task-card .info { font-size: 14px; color: #666; margin: 4px 0; }
  .task-card .status { display: inline-block; padding: 2px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-top: 8px; }
  .status-active { background: #d4edda; color: #155724; }
  .status-expired { background: #f8d7da; color: #721c24; }
  .task-card .actions { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; }
  .task-card .actions button { padding: 4px 14px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
  .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); justify-content: center; align-items: center; z-index: 1000; }
  .modal.show { display: flex; }
  .modal-content { background: #fff; border-radius: 16px; padding: 32px; max-width: 540px; width: 90%; max-height: 90vh; overflow-y: auto; }
  .modal-content input, .modal-content select, .modal-content textarea { width: 100%; padding: 10px; margin-bottom: 16px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
  .modal-content .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
  .modal-content .form-actions button { padding: 10px 28px; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
  .toast { position: fixed; bottom: 30px; right: 30px; background: #333; color: #fff; padding: 14px 24px; border-radius: 10px; z-index: 2000; opacity: 0; transform: translateY(20px); transition: all 0.3s; }
  .toast.show { opacity: 1; transform: translateY(0); }
  .toast.success { background: #2ecc71; }
  .toast.error { background: #e74c3c; }
  .empty-state { text-align: center; padding: 60px 20px; color: #999; }
  .history-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #555; }
  @media (max-width:600px){ .task-grid{grid-template-columns:1fr;} }
</style></head>
<body>
<div class="container" id="app">
  <div class="header">
    <h1>📋 任务提醒</h1>
    <div class="header-actions">
      <button class="btn-primary" onclick="openAddModal()">➕ 新建</button>
      <button class="btn-outline" onclick="openConfigModal()">⚙️ 配置</button>
      <button class="btn-outline" onclick="testNotification()">📤 测试</button>
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
    <label>周期单位</label>
    <select id="periodUnit"><option value="day">日</option><option value="week">周</option><option value="month" selected>月</option><option value="year">年</option></select>
    <label>周期数值 *</label><input type="number" id="periodValue" value="1" min="1">
    <label>开始日期 *</label><input type="date" id="startDate">
    <label>提前提醒天数（逗号分隔）</label><input type="text" id="reminderDays" placeholder="3,7" value="3">
    <label>备注</label><textarea id="remark" rows="2"></textarea>
    <div class="form-actions">
      <button class="btn-outline" onclick="closeModal('taskModal')">取消</button>
      <button class="btn-primary" onclick="saveTask()">保存</button>
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

<!-- 配置弹窗 -->
<div class="modal" id="configModal">
  <div class="modal-content">
    <h2>⚙️ 系统配置</h2>
    <label>用户名</label><input type="text" id="cfgUsername">
    <label>密码</label><input type="text" id="cfgPassword">
    <hr>
    <label>通知渠道</label>
    <select id="cfgNotifier">
      <option value="serverchan">Server酱</option>
      <option value="pushplus">PushPlus</option>
      <option value="telegram">Telegram</option>
      <option value="email">邮件(Resend)</option>
      <option value="notifyx">NotifyX</option>
    </select>
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
  function getHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }; }
  function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg; t.className = 'toast ' + type + ' show';
    clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove('show'), 3000);
  }
  function closeModal(id) { document.getElementById(id).classList.remove('show'); }
  function openModal(id) { document.getElementById(id).classList.add('show'); }
  function formatDate(d) { if(!d)return'-'; const dt=new Date(d); return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0'); }
  function formatFullDate(d) { if(!d)return'-'; const dt=new Date(d); return dt.toLocaleString('zh-CN'); }

  async function checkAuth() {
    if(!token){ window.location.href='/login'; return false; }
    try { const resp = await fetch('/api/tasks', { headers: getHeaders() }); if(resp.status===401){ localStorage.removeItem('token'); window.location.href='/login'; return false; } return true; } catch(e){ return false; }
  }

  async function loadTasks() {
    if(!await checkAuth()) return;
    try {
      const resp = await fetch('/api/tasks', { headers: getHeaders() });
      const data = await resp.json();
      const container = document.getElementById('taskList');
      if(!data.tasks || data.tasks.length===0){ container.innerHTML='<div class="empty-state"><p>暂无任务，点击「新建」添加</p></div>'; return; }
      container.innerHTML = data.tasks.map(t => {
        const now = new Date(); const nextDate = new Date(t.nextReminder); const isExpired = nextDate < now;
        const unitMap = { day:'日', week:'周', month:'月', year:'年' };
        return \`
          <div class="task-card" style="border-left-color:\${isExpired?'#e74c3c':'#2ecc71'}">
            <div class="title">\${t.name}</div>
            <div class="info"><strong>周期：</strong>每 \${t.periodValue} \${unitMap[t.periodUnit]||t.periodUnit}</div>
            <div class="info"><strong>开始：</strong>\${formatDate(t.startDate)}</div>
            <div class="info"><strong>提醒：</strong>\${formatDate(t.nextReminder)}</div>
            <div class="info"><strong>提前：</strong>\${(t.reminderDays||[]).join(', ')||'无'}</div>
            <div class="info"><strong>备注：</strong>\${t.remark||'-'}</div>
            <span class="status \${isExpired?'status-expired':'status-active'}">\${isExpired?'⚠️ 已过期':'✅ 进行中'}</span>
            <div class="actions">
              <button class="btn-success btn-sm" onclick="renewTask('\${t.id}')">🔄 续订</button>
              <button class="btn-primary btn-sm" onclick="editTask('\${t.id}')">✏️ 编辑</button>
              <button class="btn-outline btn-sm" onclick="viewHistory('\${t.id}')">📜 历史</button>
              <button class="btn-danger btn-sm" onclick="deleteTask('\${t.id}')">🗑️ 删除</button>
            </div>
          </div>
        \`;
      }).join('');
    } catch(e) { showToast('加载失败','error'); }
  }

  function openAddModal() {
    document.getElementById('taskModalTitle').textContent='新建任务';
    document.getElementById('editId').value='';
    document.getElementById('taskName').value='';
    document.getElementById('periodUnit').value='month';
    document.getElementById('periodValue').value='1';
    document.getElementById('startDate').value=new Date().toISOString().split('T')[0];
    document.getElementById('reminderDays').value='3';
    document.getElementById('remark').value='';
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
    document.getElementById('periodUnit').value=t.periodUnit;
    document.getElementById('periodValue').value=t.periodValue;
    document.getElementById('startDate').value=t.startDate;
    document.getElementById('reminderDays').value=(t.reminderDays||[]).join(',');
    document.getElementById('remark').value=t.remark||'';
    openModal('taskModal');
  }

  async function saveTask() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('taskName').value.trim();
    const periodUnit = document.getElementById('periodUnit').value;
    const periodValue = parseInt(document.getElementById('periodValue').value);
    const startDate = document.getElementById('startDate').value;
    const reminderDays = document.getElementById('reminderDays').value.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)&&n>0);
    const remark = document.getElementById('remark').value.trim();
    if(!name){ showToast('请输入名称','error'); return; }
    if(!periodValue||periodValue<1){ showToast('周期必须>0','error'); return; }
    if(!startDate){ showToast('请选开始日期','error'); return; }
    const body = { name, periodUnit, periodValue, startDate, reminderDays, remark };
    const url = id ? '/api/tasks/'+id : '/api/tasks';
    const method = id ? 'PUT' : 'POST';
    const resp = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body) });
    const data = await resp.json();
    if(data.success){ closeModal('taskModal'); showToast('保存成功'); loadTasks(); }
    else showToast(data.message||'保存失败','error');
  }

  async function renewTask(id) {
    if(!confirm('确认续订？开始日将重置为今天。')) return;
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

  async function openConfigModal() {
    const resp = await fetch('/api/config', { headers: getHeaders() });
    const data = await resp.json();
    document.getElementById('cfgUsername').value = data.username||'';
    document.getElementById('cfgPassword').value = data.password||'';
    document.getElementById('cfgNotifier').value = data.notifierType||'serverchan';
    renderNotifierFields(data.notifierType||'serverchan', data);
    openModal('configModal');
  }

  function renderNotifierFields(type, data) {
    const container = document.getElementById('notifierConfigFields');
    const fields = {
      serverchan: [{ key:'serverchanKey', label:'SendKey' }],
      pushplus: [{ key:'pushplusToken', label:'Token' }],
      telegram: [{ key:'tgBotToken', label:'Bot Token' }, { key:'tgChatId', label:'Chat ID' }],
      email: [{ key:'emailFrom', label:'发件邮箱' }, { key:'emailTo', label:'收件邮箱' }, { key:'emailApiKey', label:'API Key (Resend)' }],
      notifyx: [{ key:'notifyxApiKey', label:'API Key' }]
    };
    const f = fields[type]||[];
    container.innerHTML = f.map(field => \`<label>\${field.label}</label><input type="text" id="cfg_\${field.key}" value="\${(data[field.key]||'')}">\`).join('');
  }
  document.getElementById('cfgNotifier').addEventListener('change', function() {
    const data = {};
    document.querySelectorAll('#notifierConfigFields input').forEach(el => { const key=el.id.replace('cfg_',''); data[key]=el.value; });
    renderNotifierFields(this.value, data);
  });

  async function saveConfig() {
    const config = {
      username: document.getElementById('cfgUsername').value.trim(),
      password: document.getElementById('cfgPassword').value.trim(),
      notifierType: document.getElementById('cfgNotifier').value,
    };
    document.querySelectorAll('#notifierConfigFields input').forEach(el => {
      const key=el.id.replace('cfg_','');
      config[key]=el.value.trim();
    });
    if(!config.username||!config.password){ showToast('用户名密码不能空','error'); return; }
    const resp = await fetch('/api/config', { method: 'POST', headers: getHeaders(), body: JSON.stringify(config) });
    const data = await resp.json();
    if(data.success){ closeModal('configModal'); showToast('配置保存成功'); }
    else showToast(data.message||'保存失败','error');
  }

  async function testNotification() {
    const resp = await fetch('/api/test-notification', { method: 'POST', headers: getHeaders() });
    const data = await resp.json();
    if(data.success) showToast('✅ 测试推送已发送');
    else showToast('❌ 失败: '+data.message,'error');
  }

  function logout() { localStorage.removeItem('token'); window.location.href='/login'; }
  loadTasks();
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

    // 页面
    if (path === '/login') return new Response(getLoginPage(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    if (path === '/' || path === '') return new Response(getDashboardPage(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });

    const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
    const config = await getConfig(env);
    const kv = env.TASKS_KV;

    // 登录（公开）
    if (path === '/api/login' && method === 'POST') {
      const body = await request.json();
      if (body.username === config.username && body.password === config.password) {
        const token = await generateJWT({ username: body.username }, config.jwtSecret);
        return new Response(JSON.stringify({ success: true, token }), { headers: corsHeaders });
      }
      return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), { status: 401, headers: corsHeaders });
    }

    // JWT 验证
    const auth = request.headers.get('Authorization');
    let user = null;
    if (auth && auth.startsWith('Bearer ')) {
      try { user = await verifyJWT(auth.slice(7), config.jwtSecret); } catch (e) {}
    }
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: '未授权' }), { status: 401, headers: corsHeaders });
    }

    // ---------- 任务 API ----------
    if (path === '/api/tasks' && method === 'GET') {
      const tasks = await getAllTasks(kv);
      return new Response(JSON.stringify({ success: true, tasks }), { headers: corsHeaders });
    }

    if (path === '/api/tasks' && method === 'POST') {
      const body = await request.json();
      const { name, periodUnit, periodValue, startDate, reminderDays, remark } = body;
      if (!name || !periodValue || !startDate) {
        return new Response(JSON.stringify({ success: false, message: '缺少必填字段' }), { status: 400, headers: corsHeaders });
      }
      const id = crypto.randomUUID();
      const task = {
        id, name, periodUnit, periodValue: parseInt(periodValue), startDate,
        reminderDays: (reminderDays || []).filter(n => n > 0),
        remark: remark || '',
        createdAt: new Date().toISOString(),
        nextReminder: calcNextReminder(startDate, periodValue, periodUnit),
      };
      await kv.put('task_' + id, JSON.stringify(task));
      await kv.put('history_' + id, JSON.stringify([]));
      return new Response(JSON.stringify({ success: true, task }), { headers: corsHeaders });
    }

    if (path.startsWith('/api/tasks/') && method === 'PUT') {
      const id = path.split('/')[3];
      const body = await request.json();
      const existing = await kv.get('task_' + id);
      if (!existing) return new Response(JSON.stringify({ success: false, message: '任务不存在' }), { status: 404, headers: corsHeaders });
      const task = JSON.parse(existing);
      task.name = body.name || task.name;
      task.periodUnit = body.periodUnit || task.periodUnit;
      task.periodValue = body.periodValue || task.periodValue;
      task.startDate = body.startDate || task.startDate;
      task.reminderDays = (body.reminderDays || []).filter(n => n > 0);
      task.remark = body.remark || '';
      task.nextReminder = calcNextReminder(task.startDate, task.periodValue, task.periodUnit);
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
      if (!existing) return new Response(JSON.stringify({ success: false, message: '任务不存在' }), { status: 404, headers: corsHeaders });
      const task = JSON.parse(existing);
      const today = new Date().toISOString().split('T')[0];
      task.startDate = today;
      task.nextReminder = calcNextReminder(today, task.periodValue, task.periodUnit);
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

    // 配置
    if (path === '/api/config' && method === 'GET') {
      const cfg = await getConfig(env);
      // 避免返回敏感字段？但界面需要回显，保留
      return new Response(JSON.stringify(cfg), { headers: corsHeaders });
    }

    if (path === '/api/config' && method === 'POST') {
      const body = await request.json();
      // 合并现有配置，保留未传入的字段
      const existing = await getConfig(env);
      const newConfig = { ...existing, ...body };
      await kv.put('config', JSON.stringify(newConfig));
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // 测试推送
    if (path === '/api/test-notification' && method === 'POST') {
      const cfg = await getConfig(env);
      const result = await sendNotification(cfg, '🧪 测试推送', '这是一条测试消息，配置正确！', cfg);
      if (result.success) {
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      } else {
        return new Response(JSON.stringify({ success: false, message: result.error }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response('Not Found', { status: 404 });
  },

  // ---------- 定时任务（每小时） ----------
  async scheduled(event, env, ctx) {
    const kv = env.TASKS_KV;
    const config = await getConfig(env);
    const tasks = await getAllTasks(kv);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const task of tasks) {
      const nextDate = new Date(task.nextReminder);
      nextDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));

      const reminderDays = task.reminderDays || [];
      for (const rd of reminderDays) {
        if (diffDays === rd || (diffDays < 0 && diffDays > -1)) {
          const title = `⏰ 任务提醒：${task.name}`;
          const content = `📋 "${task.name}" 提醒日即将到来！\n📅 日期：${task.nextReminder}\n📝 备注：${task.remark || '无'}`;
          await sendNotification(config, title, content, task);
          break;
        }
      }

      if (diffDays < 0) {
        const title = `⚠️ 任务过期：${task.name}`;
        const content = `📋 "${task.name}" 已过期！\n📅 提醒日：${task.nextReminder}\n请及时续订。`;
        await sendNotification(config, title, content, task);
      }
    }
  }
};

// ============================================================
// 辅助函数
// ============================================================

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

// JWT
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

// 推送通知
async function sendNotification(config, title, content, task) {
  const type = config.notifierType || 'serverchan';
  let result = { success: false, error: '未知渠道' };
  try {
    switch (type) {
      case 'serverchan':
        if (!config.serverchanKey) return { success: false, error: '未配置 SendKey' };
        const sc = await fetch(`https://sctapi.ftqq.com/${config.serverchanKey}.send`, {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ title, desp: content })
        });
        result = sc.ok ? { success: true } : { success: false, error: 'HTTP ' + sc.status };
        break;
      case 'pushplus':
        if (!config.pushplusToken) return { success: false, error: '未配置 Token' };
        const pp = await fetch('https://www.pushplus.plus/send', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: config.pushplusToken, title, content })
        });
        const ppd = await pp.json();
        result = ppd.code === 200 ? { success: true } : { success: false, error: ppd.msg };
        break;
      case 'telegram':
        if (!config.tgBotToken || !config.tgChatId) return { success: false, error: '未配置 Telegram' };
        const tg = await fetch(`https://api.telegram.org/bot${config.tgBotToken}/sendMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: config.tgChatId, text: `*${title}*\n${content}`, parse_mode: 'Markdown' })
        });
        const tgd = await tg.json();
        result = tgd.ok ? { success: true } : { success: false, error: tgd.description };
        break;
      case 'email':
        if (!config.emailFrom || !config.emailTo || !config.emailApiKey) return { success: false, error: '邮件配置不完整' };
        const em = await fetch('https://api.resend.com/emails', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + config.emailApiKey },
          body: JSON.stringify({ from: config.emailFrom, to: [config.emailTo], subject: title, html: `<h2>${title}</h2><p>${content.replace(/\n/g,'<br>')}</p>` })
        });
        result = em.ok ? { success: true } : { success: false, error: 'HTTP ' + em.status };
        break;
      case 'notifyx':
        if (!config.notifyxApiKey) return { success: false, error: '未配置 NotifyX' };
        const nx = await fetch('https://notifyx.cn/api/send', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + config.notifyxApiKey },
          body: JSON.stringify({ title, content })
        });
        const nxd = await nx.json();
        result = nxd.code === 200 ? { success: true } : { success: false, error: nxd.msg };
        break;
      default: return { success: false, error: '不支持的渠道' };
    }
  } catch (e) { result = { success: false, error: e.message }; }
  console.log(`[通知] ${type}: ${result.success ? '✅' : '❌ ' + result.error}`);
  return result;
}

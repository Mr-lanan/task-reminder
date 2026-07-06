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

  config.username = env.DEFAULT_USERNAME || config.username || 'admin';
  config.password = env.DEFAULT_PASSWORD || config.password || 'admin123';
  config.jwtSecret = env.JWT_SECRET || config.jwtSecret || 'change-this-secret';

  // 规范化 notifierTypes 为数组
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
// HTML 主面板（含多选推送、动态提醒天数、任务测试）
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
  .btn-warning { background: #f39c12; color: #fff; }
  .btn-sm { padding: 4px 12px; font-size: 12px; }
  .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
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
  .modal-content { background: #fff; border-radius: 16px; padding: 32px; max-width: 580px; width: 95%; max-height: 90vh; overflow-y: auto; }
  .modal-content input, .modal-content select, .modal-content textarea { width: 100%; padding: 10px; margin-bottom: 16px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
  .modal-content .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
  .modal-content .form-actions button { padding: 10px 28px; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
  .toast { position: fixed; bottom: 30px; right: 30px; background: #333; color: #fff; padding: 14px 24px; border-radius: 10px; z-index: 2000; opacity: 0; transform: translateY(20px); transition: all 0.3s; }
  .toast.show { opacity: 1; transform: translateY(0); }
  .toast.success { background: #2ecc71; }
  .toast.error { background: #e74c3c; }
  .empty-state { text-align: center; padding: 60px 20px; color: #999; }
  .history-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #555; }
  .reminder-group { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
  .reminder-group input { flex: 1; margin-bottom: 0; }
  .reminder-group button { padding: 4px 10px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
  .config-checkbox-group { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
  .config-checkbox-group label { display: flex; align-items: center; gap: 4px; font-weight: normal; }
  .config-detail { margin-bottom: 12px; border-left: 3px solid #4a6cf7; padding-left: 12px; }
  @media (max-width:600px){ .task-grid{grid-template-columns:1fr;} }
</style></head>
<body>
<div class="container" id="app">
  <div class="header">
    <h1>📋 任务提醒</h1>
    <div class="header-actions">
      <button class="btn-primary" onclick="openAddModal()">➕ 新建</button>
      <button class="btn-outline" onclick="openConfigModal()">⚙️ 配置</button>
      <button class="btn-danger" onclick="logout()">退出</button>
    </div>
  </div>
  <div id="taskList" class="task-grid"></div>
</div>

<!-- 新建/编辑任务弹窗 -->
<div class="modal" id="taskModal">
  <div class="modal-content">
    <h2 id="taskModalTitle">新建任务</h2>
    <input type="hidden" id="editId">
    <label>任务名称 *</label><input type="text" id="taskName" placeholder="例如：月度报告">
    <label>周期单位</label>
    <select id="periodUnit"><option value="day">日</option><option value="week">周</option><option value="month" selected>月</option><option value="year">年</option></select>
    <label>周期数值 *</label><input type="number" id="periodValue" value="1" min="1">
    <label>开始日期 *</label><input type="date" id="startDate">
    
    <label>提前提醒天数（点击 ➕ 添加多组）</label>
    <div id="reminderDaysContainer"><!-- 动态添加 --></div>
    <button class="btn-primary btn-sm" onclick="addReminderGroup()">➕ 添加一组</button>
    
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

<!-- 配置弹窗（多选推送） -->
<div class="modal" id="configModal">
  <div class="modal-content">
    <h2>⚙️ 系统配置</h2>
    <label>用户名</label><input type="text" id="cfgUsername">
    <label>密码</label><input type="text" id="cfgPassword">
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

  // ===== 动态提醒天数组 =====
  function addReminderGroup(value) {
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
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.className = 'btn-danger btn-sm';
    delBtn.onclick = function() { div.remove(); };
    div.appendChild(input);
    div.appendChild(delBtn);
    container.appendChild(div);
  }

  function loadReminderGroups(values) {
    const container = document.getElementById('reminderDaysContainer');
    container.innerHTML = '';
    reminderGroupCounter = 0;
    if (!values || values.length === 0) {
      addReminderGroup(3); // 默认一组
    } else {
      values.forEach(v => addReminderGroup(v));
    }
  }

  function getReminderGroups() {
    const inputs = document.querySelectorAll('#reminderDaysContainer .reminder-group input');
    const values = [];
    inputs.forEach(inp => {
      const val = parseInt(inp.value);
      if (!isNaN(val) && val > 0) values.push(val);
    });
    return values;
  }

  // ===== 登录检查 =====
  async function checkAuth() {
    if(!token){ window.location.href='/login'; return false; }
    try { const resp = await fetch('/api/tasks', { headers: getHeaders() }); if(resp.status===401){ localStorage.removeItem('token'); window.location.href='/login'; return false; } return true; } catch(e){ return false; }
  }

  // ===== 加载任务列表 =====
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
            <div class="info"><strong>提前提醒：</strong>\${(t.reminderDays||[]).join(', ')||'无'}</div>
            <div class="info"><strong>备注：</strong>\${t.remark||'-'}</div>
            <span class="status \${isExpired?'status-expired':'status-active'}">\${isExpired?'⚠️ 已过期':'✅ 进行中'}</span>
            <div class="actions">
              <button class="btn-success btn-sm" onclick="renewTask('\${t.id}')">🔄 续订</button>
              <button class="btn-primary btn-sm" onclick="editTask('\${t.id}')">✏️ 编辑</button>
              <button class="btn-outline btn-sm" onclick="viewHistory('\${t.id}')">📜 历史</button>
              <button class="btn-warning btn-sm" onclick="testTask('\${t.id}')">📤 测试</button>
              <button class="btn-danger btn-sm" onclick="deleteTask('\${t.id}')">🗑️ 删除</button>
            </div>
          </div>
        \`;
      }).join('');
    } catch(e) { showToast('加载失败','error'); }
  }

  // ===== 新建任务 =====
  function openAddModal() {
    document.getElementById('taskModalTitle').textContent='新建任务';
    document.getElementById('editId').value='';
    document.getElementById('taskName').value='';
    document.getElementById('periodUnit').value='month';
    document.getElementById('periodValue').value='1';
    document.getElementById('startDate').value=new Date().toISOString().split('T')[0];
    document.getElementById('remark').value='';
    loadReminderGroups([3]); // 默认提前3天
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
    document.getElementById('remark').value=t.remark||'';
    loadReminderGroups(t.reminderDays || [3]);
    openModal('taskModal');
  }

  async function saveTask() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('taskName').value.trim();
    const periodUnit = document.getElementById('periodUnit').value;
    const periodValue = parseInt(document.getElementById('periodValue').value);
    const startDate = document.getElementById('startDate').value;
    const reminderDays = getReminderGroups();
    const remark = document.getElementById('remark').value.trim();
    if(!name){ showToast('请输入名称','error'); return; }
    if(!periodValue||periodValue<1){ showToast('周期必须>0','error'); return; }
    if(!startDate){ showToast('请选开始日期','error'); return; }
    if(reminderDays.length===0){ showToast('请至少添加一组提前提醒天数','error'); return; }
    const body = { name, periodUnit, periodValue, startDate, reminderDays, remark };
    const url = id ? '/api/tasks/'+id : '/api/tasks';
    const method = id ? 'PUT' : 'POST';
    const resp = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body) });
    const data = await resp.json();
    if(data.success){ closeModal('taskModal'); showToast('保存成功'); loadTasks(); }
    else showToast(data.message||'保存失败','error');
  }

  // ===== 续订 =====
  async function renewTask(id) {
    if(!confirm('确认续订？开始日将重置为今天。')) return;
    const resp = await fetch('/api/tasks/'+id+'/renew', { method: 'POST', headers: getHeaders() });
    const data = await resp.json();
    if(data.success){ showToast('续订成功！下次提醒：'+formatDate(data.nextReminder)); loadTasks(); }
    else showToast(data.message||'续订失败','error');
  }

  // ===== 删除 =====
  async function deleteTask(id) {
    if(!confirm('确认删除？')) return;
    const resp = await fetch('/api/tasks/'+id, { method: 'DELETE', headers: getHeaders() });
    const data = await resp.json();
    if(data.success){ showToast('已删除'); loadTasks(); }
    else showToast(data.message||'删除失败','error');
  }

  // ===== 历史 =====
  async function viewHistory(id) {
    const resp = await fetch('/api/tasks/'+id+'/history', { headers: getHeaders() });
    const data = await resp.json();
    const list = document.getElementById('historyList');
    if(!data.history||data.history.length===0) list.innerHTML='<p style="color:#999;">暂无记录</p>';
    else list.innerHTML = data.history.map(h=>'<div class="history-item">🔄 '+formatFullDate(h.renewedAt)+' → 下次提醒 '+formatDate(h.nextReminder)+'</div>').join('');
    openModal('historyModal');
  }

  // ===== 测试单个任务 =====
  async function testTask(id) {
    try {
      const resp = await fetch('/api/tasks/'+id+'/test', { method: 'POST', headers: getHeaders() });
      const data = await resp.json();
      if(data.success) showToast('✅ 测试推送已发送（所有已启用渠道）');
      else showToast('❌ 失败: '+data.message, 'error');
    } catch(e) { showToast('请求失败','error'); }
  }

  // ===== 配置（多选推送） =====
  async function openConfigModal() {
    const resp = await fetch('/api/config', { headers: getHeaders() });
    const data = await resp.json();
    document.getElementById('cfgUsername').value = data.username||'';
    document.getElementById('cfgPassword').value = data.password||'';
    // 设置勾选框
    const checkboxes = document.querySelectorAll('#notifierCheckboxes input[type="checkbox"]');
    const selected = data.notifierTypes || [];
    checkboxes.forEach(cb => {
      cb.checked = selected.includes(cb.value);
    });
    // 渲染详细配置字段
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
    // 只显示选中的渠道
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

  // 监听复选框变化，动态渲染详细字段
  document.addEventListener('change', function(e) {
    if (e.target.closest && e.target.closest('#notifierCheckboxes')) {
      const checkboxes = document.querySelectorAll('#notifierCheckboxes input[type="checkbox"]:checked');
      const selected = Array.from(checkboxes).map(cb => cb.value);
      // 重新读取已有数据
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
    };
    const checkboxes = document.querySelectorAll('#notifierCheckboxes input[type="checkbox"]:checked');
    config.notifierTypes = Array.from(checkboxes).map(cb => cb.value);
    // 收集所有配置字段
    document.querySelectorAll('#notifierConfigFields input').forEach(el => {
      const key = el.id.replace('cfg_', '');
      config[key] = el.value.trim();
    });
    if(!config.username||!config.password){ showToast('用户名密码不能空','error'); return; }
    if(config.notifierTypes.length===0){ showToast('请至少选择一个推送渠道','error'); return; }
    const resp = await fetch('/api/config', { method: 'POST', headers: getHeaders(), body: JSON.stringify(config) });
    const data = await resp.json();
    if(data.success){ closeModal('configModal'); showToast('配置保存成功'); }
    else showToast(data.message||'保存失败','error');
  }

  function logout() { localStorage.removeItem('token'); window.location.href='/login'; }
  
  // 初始化时加载任务
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

    // ---------- 任务 CRUD ----------
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
      if (!reminderDays || reminderDays.length === 0) {
        return new Response(JSON.stringify({ success: false, message: '至少需要一组提前提醒天数' }), { status: 400, headers: corsHeaders });
      }
      const id = crypto.randomUUID();
      const task = {
        id, name, periodUnit, periodValue: parseInt(periodValue), startDate,
        reminderDays: reminderDays.map(Number).filter(n => n > 0),
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
      task.reminderDays = (body.reminderDays || []).map(Number).filter(n => n > 0);
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

    // 测试单个任务推送
    if (path.startsWith('/api/tasks/') && path.endsWith('/test') && method === 'POST') {
      const id = path.split('/')[3];
      const existing = await kv.get('task_' + id);
      if (!existing) return new Response(JSON.stringify({ success: false, message: '任务不存在' }), { status: 404, headers: corsHeaders });
      const task = JSON.parse(existing);
      const title = `🧪 测试推送：${task.name}`;
      const content = `这是任务 "${task.name}" 的测试消息。\n📅 提醒日：${task.nextReminder}\n📝 备注：${task.remark || '无'}`;
      const result = await sendNotification(config, title, content, task);
      if (result.success) {
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      } else {
        return new Response(JSON.stringify({ success: false, message: result.error }), { status: 500, headers: corsHeaders });
      }
    }

    // 配置（读写）
    if (path === '/api/config' && method === 'GET') {
      const cfg = await getConfig(env);
      return new Response(JSON.stringify(cfg), { headers: corsHeaders });
    }

    if (path === '/api/config' && method === 'POST') {
      const body = await request.json();
      const existing = await getConfig(env);
      // 确保 notifierTypes 是数组
      if (Array.isArray(body.notifierTypes)) {
        body.notifierTypes = body.notifierTypes.filter(Boolean);
      } else {
        delete body.notifierTypes;
      }
      const newConfig = { ...existing, ...body };
      await kv.put('config', JSON.stringify(newConfig));
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
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
        if (diffDays === rd) {
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

// ============================================================
// 推送通知（支持多渠道并发发送）
// ============================================================
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
            const payload = { title: title, content: content };
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
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
            }
    // 根据官方文档，成功时返回 { status: 'queued' }，但不确定是否有 code，简单判断 status 存在即可
    if (nxd.status === 'queued' || nxd.id) {
      result.success = true;
    } else {
      result.error = nxd.message || '发送失败';
    }
  } catch (e) {
    result.error = e.message;
  }
  break;
            }
    result.success = (nxd.code === 200);
    if (!result.success) result.error = nxd.msg || '发送失败';
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

  // 只要有一个成功就算整体成功
  const anySuccess = results.some(r => r.success);
  const errors = results.filter(r => !r.success).map(r => r.type + ': ' + r.error).join('; ');
  return { success: anySuccess, error: errors || '全部失败' };
}

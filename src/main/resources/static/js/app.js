/* ===== AVATAR COLORS ===== */
const COLORS=['linear-gradient(135deg,#3b82f6,#1d4ed8)','linear-gradient(135deg,#d4a017,#b8860b)','linear-gradient(135deg,#2563eb,#1e40af)','linear-gradient(135deg,#8b5cf6,#6d28d9)','linear-gradient(135deg,#10b981,#059669)','linear-gradient(135deg,#f43f5e,#be123c)','linear-gradient(135deg,#f59e0b,#d97706)','linear-gradient(135deg,#06b6d4,#0891b2)'];
/* Emergency API removed */
function color(i){return COLORS[i%COLORS.length]}
function initials(n){const p=n.replace(/^Dr\.?\s*/i,'').trim().split(' ');return p.length>=2?(p[0][0]+p[p.length-1][0]).toUpperCase():p[0].substring(0,2).toUpperCase()}
function roleClass(r){const m={'Doctor':'badge-doctor','Nurse':'badge-nurse','Surgeon':'badge-surgeon','Technician':'badge-technician','Pharmacist':'badge-pharmacist','Receptionist':'badge-receptionist'};return m[r]||'badge-doctor'}
function fmtDate(d){if(!d)return'—';return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
function fmtSalary(s){return '₹'+Number(s).toLocaleString('en-IN')}
function fmtTime(t){if(!t)return'—';const d=new Date(t);return d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}
function fmtShift(s){return s?s.charAt(0)+s.slice(1).toLowerCase():'—'}

/* ===== TOAST ===== */
function toast(msg,type='info'){
  let c=document.querySelector('.toast-container');
  if(!c){c=document.createElement('div');c.className='toast-container';document.body.appendChild(c)}
  const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
  const t=document.createElement('div');
  t.className=`toast toast-${type}`;
  t.innerHTML=`<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-text">${msg}</span><button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>`;
  c.appendChild(t);
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),300)},4000);
}

/* ===== MODAL ===== */
function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
document.addEventListener('click',e=>{if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('open')});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open'))});

/* ===== TABS ===== */
function switchTab(name){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.id===`tab-${name}`));
  if(name==='staff')loadStaff();
  else if(name==='attendance')loadAttendance();
  else if(name==='shifts')loadShifts();
  else if(name==='leave')loadLeave();
  else if(name==='notifications')loadNotifications();
}

/* ===== DATE/CLOCK ===== */
function updateClock(){
  const now=new Date();
  const el=document.getElementById('navDate');
  if(el)el.textContent=now.toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})+' '+now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
}

/* ===== NOTIFICATION BADGE ===== */
async function refreshNotifBadge(){
  try{
    const r=await NotifAPI.getCount();
    const badge=document.getElementById('notifBadge');
    if(badge){badge.textContent=r.unread;badge.style.display=r.unread>0?'flex':'none'}
  }catch(e){/* api not ready */}
}

/* =============================================
   STAFF TAB
   ============================================= */
let staffData=[];let staffIdx=0;let activeOnly=false;let editingId=null;

async function loadStaff(){
  const tbody=document.getElementById('staffBody');
  tbody.innerHTML=`<tr><td colspan="14"><div class="loading"><div class="spinner"></div>Loading staff…</div></td></tr>`;
  try{
    staffData=await StaffAPI.getAll();
    await populateFilters();
    updateStats();
    renderStaff();
  }catch(e){
    staffData=getMockStaff();
    await populateFilters();
    updateStats();
    renderStaff();
    toast('Backend not connected — showing sample data','warning');
  }
}

function getMockStaff(){
  return[
    {id:1,empid:'EMP001',empname:'Dr. Arjun Sharma',empsalary:95000,empRole:'Doctor',department:'Cardiology',shiftType:'MORNING',workHours:8,qualification:'MBBS, MD Cardiology',phone:'9876543210',email:'arjun.sharma@medsched.io',joiningDate:'2020-06-15',status:'Active'},
    {id:2,empid:'EMP002',empname:'Dr. Priya Nair',empsalary:88000,empRole:'Doctor',department:'Neurology',shiftType:'EVENING',workHours:8,qualification:'MBBS, DM Neurology',phone:'9876543211',email:'priya.nair@medsched.io',joiningDate:'2019-03-20',status:'Active'},
    {id:3,empid:'EMP003',empname:'Nurse Rekha Patel',empsalary:42000,empRole:'Nurse',department:'ICU',shiftType:'NIGHT',workHours:8,qualification:'BSc Nursing',phone:'9876543212',email:'rekha.patel@medsched.io',joiningDate:'2021-08-01',status:'Active'},
    {id:4,empid:'EMP004',empname:'Dr. Ramesh Kumar',empsalary:110000,empRole:'Surgeon',department:'Surgery',shiftType:'MORNING',workHours:9,qualification:'MBBS, MS Surgery',phone:'9876543213',email:'ramesh.k@medsched.io',joiningDate:'2018-11-10',status:'Active'},
    {id:5,empid:'EMP005',empname:'Dr. Meena Joshi',empsalary:78000,empRole:'Doctor',department:'Pediatrics',shiftType:'MORNING',workHours:8,qualification:'MBBS, MD Pediatrics',phone:'9876543214',email:'meena.j@medsched.io',joiningDate:'2022-01-05',status:'Active'},
    {id:6,empid:'EMP006',empname:'Nurse Anjali Singh',empsalary:40000,empRole:'Nurse',department:'Emergency',shiftType:'EVENING',workHours:8,qualification:'BSc Nursing',phone:'9876543215',email:'anjali.s@medsched.io',joiningDate:'2021-07-12',status:'Active'},
    {id:7,empid:'EMP007',empname:'Mr. Vijay Mehta',empsalary:35000,empRole:'Technician',department:'Radiology',shiftType:'MORNING',workHours:8,qualification:'BSc Radiology',phone:'9876543216',email:'vijay.m@medsched.io',joiningDate:'2020-04-18',status:'Active'},
    {id:8,empid:'EMP008',empname:'Dr. Sunita Rao',empsalary:92000,empRole:'Doctor',department:'Oncology',shiftType:'MORNING',workHours:8,qualification:'MBBS, DM Oncology',phone:'9876543217',email:'sunita.r@medsched.io',joiningDate:'2017-09-25',status:'Active'},
    {id:9,empid:'EMP009',empname:'Ms. Kavitha Reddy',empsalary:30000,empRole:'Receptionist',department:'Administration',shiftType:'MORNING',workHours:8,qualification:'B.Com',phone:'9876543218',email:'kavitha.r@medsched.io',joiningDate:'2023-02-14',status:'Active'},
    {id:10,empid:'EMP010',empname:'Mr. Anil Gupta',empsalary:38000,empRole:'Pharmacist',department:'Pharmacy',shiftType:'EVENING',workHours:8,qualification:'B.Pharma',phone:'9876543219',email:'anil.g@medsched.io',joiningDate:'2020-10-30',status:'Active'},
    {id:11,empid:'EMP011',empname:'Dr. Pooja Iyer',empsalary:85000,empRole:'Doctor',department:'Orthopedics',shiftType:'MORNING',workHours:8,qualification:'MBBS, MS Ortho',phone:'9876543220',email:'pooja.i@medsched.io',joiningDate:'2021-05-22',status:'Active'},
    {id:12,empid:'EMP012',empname:'Nurse Deepak Verma',empsalary:43000,empRole:'Nurse',department:'Surgery',shiftType:'NIGHT',workHours:8,qualification:'BSc Nursing',phone:'9876543221',email:'deepak.v@medsched.io',joiningDate:'2022-09-08',status:'Inactive'},
  ];
}

async function populateFilters(){
  const deptSel=document.getElementById('filterDept');
  const roleSel=document.getElementById('filterRole');
  const deptForm=document.getElementById('shiftStaffDept');
  if(!deptSel)return;
  const depts=[...new Set(staffData.map(s=>s.department))].sort();
  const roles=[...new Set(staffData.map(s=>s.empRole))].sort();
  deptSel.innerHTML='<option value="">All Departments</option>'+depts.map(d=>`<option>${d}</option>`).join('');
  roleSel.innerHTML='<option value="">All Roles</option>'+roles.map(r=>`<option>${r}</option>`).join('');
  // Populate staff selects in shift/leave forms
  const staffSels=document.querySelectorAll('.staff-select');
  const opts=staffData.filter(s=>s.status==='Active').map(s=>`<option value="${s.id}">${s.empname}</option>`).join('');
  staffSels.forEach(sel=>{sel.innerHTML='<option value="">Select Staff…</option>'+opts});
  if(deptForm){deptForm.innerHTML='<option value="">All</option>'+depts.map(d=>`<option>${d}</option>`).join('')}
}

function updateStats(){
  const total=staffData.length;
  const active=staffData.filter(s=>s.status==='Active').length;
  const depts=new Set(staffData.map(s=>s.department)).size;
  const inactive=staffData.filter(s=>s.status==='Inactive').length;
  animNum('statTotal',total);animNum('statActive',active);animNum('statDepts',depts);animNum('statInactive',inactive);
}

function animNum(id,target){
  const el=document.getElementById(id);if(!el)return;
  let cur=0;const step=Math.max(1,Math.ceil(target/20));
  const t=setInterval(()=>{cur=Math.min(cur+step,target);el.textContent=cur;if(cur>=target)clearInterval(t)},30);
}

function getFilteredStaff(){
  const q=(document.getElementById('searchInput')?.value||'').toLowerCase();
  const dept=document.getElementById('filterDept')?.value||'';
  const role=document.getElementById('filterRole')?.value||'';
  return staffData.filter(s=>{
    const mq=!q||s.empname.toLowerCase().includes(q)||String(s.empid).toLowerCase().includes(q)||s.empRole.toLowerCase().includes(q)||s.department.toLowerCase().includes(q);
    return mq&&(!dept||s.department===dept)&&(!role||s.empRole===role)&&(!activeOnly||s.status==='Active');
  });
}

function renderStaff(){
  const data=getFilteredStaff();
  const tbody=document.getElementById('staffBody');
  const noRes=document.getElementById('noResults');
  document.getElementById('staffCount').textContent=data.length;
  document.getElementById('footerText').textContent=`Showing ${data.length} of ${staffData.length} staff`;
  if(!data.length){tbody.innerHTML='';noRes.style.display='block';return}
  noRes.style.display='none';
  tbody.innerHTML=data.map((s,i)=>{
    const idx=staffData.indexOf(s);
    return`<tr style="animation:fadeUp .3s ease-out ${i*.04}s both">
      <td>${i+1}</td>
      <td><div class="staff-info">
        <div class="avatar" style="background:${color(idx)}">${initials(s.empname)}</div>
        <div><div class="staff-name">${s.empname}</div></div>
      </div></td>
      <td><span class="emp-id">${s.empid}</span></td>
      <td>${fmtSalary(s.empsalary)}</td>
      <td><span class="badge ${roleClass(s.empRole)}">${s.empRole}</span></td>
      <td>${s.department}</td>
      <td><span class="badge badge-${s.shiftType?.toLowerCase()||'morning'}">${fmtShift(s.shiftType)}</span></td>
      <td>${s.workHours}h</td>
      <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${s.qualification||''}">${s.qualification||'—'}</td>
      <td>${s.phone||'—'}</td>
      <td style="font-size:.8rem">${s.email||'—'}</td>
      <td>${fmtDate(s.joiningDate)}</td>
      <td><span class="badge badge-${s.status?.toLowerCase()==='active'?'active':'inactive'}"><span class="status-dot"></span>${s.status}</span></td>
      <td><div class="action-btns">
        <button class="btn-cancel" onclick="viewStaff(${idx})" style="padding:5px 10px;font-size:12px">View</button>
        <button class="btn-cancel" onclick="openEdit(${idx})" style="padding:5px 10px;font-size:12px;color:var(--gold2)">Edit</button>
        <button class="btn-danger-sm" onclick="confirmDelete(${s.id},${idx})" style="padding:5px 10px;font-size:12px">Delete</button>
      </div></td>
    </tr>`;
  }).join('');
}

function toggleActiveFilter(){
  activeOnly=!activeOnly;
  document.getElementById('activeBtn').classList.toggle('active',activeOnly);
  renderStaff();
}

/* ── VIEW STAFF ── */
function viewStaff(idx){
  const s=staffData[idx];
  document.getElementById('viewBody').innerHTML=`
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:22px">
      <div class="avatar" style="width:60px;height:60px;font-size:1.2rem;background:${color(idx)}">${initials(s.empname)}</div>
      <div><div style="font-size:1.2rem;font-weight:700">${s.empname}</div>
      <div style="color:var(--muted);font-size:.83rem;margin-top:3px">${s.empRole} · ${s.department}</div></div>
    </div>
    <div class="detail-grid">
      <div class="detail-item"><label>Emp ID</label><div class="val" style="color:var(--gold2)">${s.empid}</div></div>
      <div class="detail-item"><label>Salary</label><div class="val" style="color:var(--gold2)">${fmtSalary(s.empsalary)}</div></div>
      <div class="detail-item"><label>Department</label><div class="val">${s.department}</div></div>
      <div class="detail-item"><label>Shift</label><div class="val"><span class="badge badge-${s.shiftType?.toLowerCase()}">${fmtShift(s.shiftType)}</span></div></div>
      <div class="detail-item"><label>Work Hours</label><div class="val">${s.workHours}h/day</div></div>
      <div class="detail-item"><label>Status</label><div class="val"><span class="badge badge-${s.status?.toLowerCase()==='active'?'active':'inactive'}"><span class="status-dot"></span>${s.status}</span></div></div>
      <div class="detail-item"><label>Phone</label><div class="val">${s.phone||'—'}</div></div>
      <div class="detail-item"><label>Joining Date</label><div class="val">${fmtDate(s.joiningDate)}</div></div>
      <div class="detail-item" style="grid-column:1/-1"><label>Qualification</label><div class="val">${s.qualification||'—'}</div></div>
      <div class="detail-item" style="grid-column:1/-1"><label>Email</label><div class="val">${s.email||'—'}</div></div>
    </div>`;
  openModal('viewModal');
}

/* ── ADD STAFF ── */
function openAddStaff(){
  editingId=null;
  document.getElementById('staffFormTitle').textContent='Add New Staff';
  document.getElementById('staffForm').reset();
  openModal('staffModal');
}

/* ── EDIT STAFF ── */
function openEdit(idx){
  const s=staffData[idx];
  editingId=s.id;
  document.getElementById('staffFormTitle').textContent='Edit Staff';
  document.getElementById('fEmpid').value=s.empid||'';
  document.getElementById('fName').value=s.empname||'';
  document.getElementById('fSalary').value=s.empsalary||'';
  document.getElementById('fRole').value=s.empRole||'';
  document.getElementById('fDept').value=s.department||'';
  document.getElementById('fShift').value=s.shiftType||'MORNING';
  document.getElementById('fHours').value=s.workHours||8;
  document.getElementById('fQual').value=s.qualification||'';
  document.getElementById('fPhone').value=s.phone||'';
  document.getElementById('fEmail').value=s.email||'';
  document.getElementById('fJoining').value=s.joiningDate||'';
  document.getElementById('fStatus').value=s.status||'Active';
  openModal('staffModal');
}

async function submitStaffForm(e){
  e.preventDefault();
  const data={
    empid:document.getElementById('fEmpid').value,
    empname:document.getElementById('fName').value,
    empsalary:parseFloat(document.getElementById('fSalary').value)||0,
    empRole:document.getElementById('fRole').value,
    department:document.getElementById('fDept').value,
    shiftType:document.getElementById('fShift').value,
    workHours:parseInt(document.getElementById('fHours').value)||8,
    qualification:document.getElementById('fQual').value,
    phone:document.getElementById('fPhone').value,
    email:document.getElementById('fEmail').value,
    joiningDate:document.getElementById('fJoining').value||null,
    status:document.getElementById('fStatus').value,
  };
  try{
    if(editingId){await StaffAPI.update(editingId,data);toast('Staff updated successfully','success')}
    else{await StaffAPI.create(data);toast('Staff added successfully','success')}
    closeModal('staffModal');loadStaff();refreshNotifBadge();
  }catch(err){
    // Demo mode: update local array
    if(editingId){const i=staffData.findIndex(s=>s.id===editingId);if(i>=0)staffData[i]={...staffData[i],...data};toast('Staff updated (demo)','success')}
    else{staffData.push({...data,id:Date.now()});toast('Staff added (demo)','success')}
    closeModal('staffModal');renderStaff();updateStats();
  }
}

/* ── DELETE ── */
let deleteTarget=null;
function confirmDelete(id,idx){
  deleteTarget={id,idx};
  document.getElementById('deleteStaffName').textContent=staffData[idx].empname;
  openModal('deleteModal');
}
async function doDelete(){
  if(!deleteTarget)return;
  try{
    await StaffAPI.delete(deleteTarget.id);
    toast('Staff deleted','success');
    closeModal('deleteModal');loadStaff();refreshNotifBadge();
  }catch(e){
    staffData.splice(deleteTarget.idx,1);
    toast('Staff deleted (demo)','success');
    closeModal('deleteModal');renderStaff();updateStats();
  }
  deleteTarget=null;
}

/* ── EMERGENCY TOGGLE ── */

/* =============================================
   ATTENDANCE TAB
   ============================================= */
async function loadAttendance(){
  const dateInput=document.getElementById('attDate');
  if(dateInput&&!dateInput.value)dateInput.value=new Date().toISOString().split('T')[0];
  const formDate=document.getElementById('attFormDate');
  if(formDate&&!formDate.value)formDate.value=new Date().toISOString().split('T')[0];
  const date=dateInput?.value||new Date().toISOString().split('T')[0];
  const tbody=document.getElementById('attBody');
  tbody.innerHTML=`<tr><td colspan="8"><div class="loading"><div class="spinner"></div>Loading attendance…</div></td></tr>`;
  try{
    const data=await AttendanceAPI.getByDate(date);
    renderAttendance(data);
  }catch(e){
    renderAttendance(getMockAttendance());
  }
}

function getMockAttendance(){
  const now=new Date().toISOString();
  return staffData.slice(0,10).map((s,i)=>({
    staffId:s.id,staffName:s.empname,empid:s.empid,department:s.department,role:s.empRole,
    date:new Date().toISOString().split('T')[0],
    checkIn:i<7?now:null,checkOut:i<3?now:null,
    status:i===4?'ABSENT':i===8?'ON_LEAVE':i===3?'LATE':'PRESENT'
  }));
}

function renderAttendance(rows){
  const tbody=document.getElementById('attBody');
  if(!rows.length){tbody.innerHTML=`<tr><td colspan="8"><div class="no-results" style="display:block"><div class="icon">📋</div><p>No attendance records found</p></div></td></tr>`;return}
  tbody.innerHTML=rows.map((r,i)=>`<tr style="animation:fadeUp .3s ease-out ${i*.04}s both">
    <td>${i+1}</td>
    <td><div class="staff-info">
      <div class="avatar" style="background:${color(i)};width:32px;height:32px;font-size:.75rem">${initials(r.staffName)}</div>
      <div><div class="staff-name">${r.staffName}</div><div class="staff-sub">${r.empid}</div></div>
    </div></td>
    <td>${r.department}</td>
    <td><span class="badge badge-${r.status?.toLowerCase()}">${r.status?.replace('_',' ')}</span></td>
    <td>${r.checkIn?fmtTime(r.checkIn):'<span style="color:var(--muted)">—</span>'}</td>
    <td>${r.checkOut?fmtTime(r.checkOut):'<span style="color:var(--muted)">—</span>'}</td>
    <td>${r.checkIn&&r.checkOut?calcDur(r.checkIn,r.checkOut):'Active'}</td>
    <td><div class="action-btns">
      ${!r.checkIn?`<button class="act-btn green" title="Check In" onclick="doCheckIn(${r.staffId})" style="font-size:13px">🟢 In</button>`:''}
      ${r.checkIn&&!r.checkOut?`<button class="act-btn danger" title="Check Out" onclick="doCheckOut(${r.staffId})" style="font-size:13px">🔴 Out</button>`:''}
    </div></td>
  </tr>`).join('');
}

function calcDur(cin,cout){
  const diff=(new Date(cout)-new Date(cin))/3600000;
  return diff.toFixed(1)+'h';
}

async function doCheckIn(id){
  try{
    await AttendanceAPI.checkIn(id);toast('Check-in recorded','success');
  }catch(e){toast('Check-in recorded (demo)','success')}
  loadAttendance();refreshNotifBadge();
}
async function doCheckOut(id){
  try{
    await AttendanceAPI.checkOut(id);toast('Check-out recorded','success');
  }catch(e){toast('Check-out recorded (demo)','success')}
  loadAttendance();
}

async function submitAttendance(e){
  e.preventDefault();
  const data={
    staffId:document.getElementById('attStaffId').value,
    date:document.getElementById('attFormDate').value,
    status:document.getElementById('attStatus').value,
    notes:document.getElementById('attNotes').value,
  };
  try{
    await AttendanceAPI.create(data);
    toast('Attendance marked successfully','success');
  }catch(err){
    toast('Attendance marked (demo)','success');
  }
  document.getElementById('attendanceForm').reset();
  loadAttendance();
}

/* =============================================
   SHIFTS TAB
   ============================================= */
async function loadShifts(){
  const dateInput=document.getElementById('shiftDate2');
  if(dateInput&&!dateInput.value)dateInput.value=new Date().toISOString().split('T')[0];
  const tbody=document.getElementById('shiftBody');
  tbody.innerHTML=`<tr><td colspan="7"><div class="loading"><div class="spinner"></div>Loading shifts…</div></td></tr>`;
  try{
    const date=document.getElementById('shiftDate2')?.value||new Date().toISOString().split('T')[0];
    const data=await ShiftAPI.getByDate(date);
    renderShifts(data);
  }catch(e){renderShifts(getMockShifts())}
}

function getMockShifts(){
  const types=['MORNING','EVENING','NIGHT'];
  return staffData.slice(0,7).map((s,i)=>({
    id:i+1,staffId:s.id,staffName:s.empname,empid:s.empid,department:s.department,
    shiftType:types[i%3],shiftDate:new Date().toISOString().split('T')[0],
    startTime:i%3===0?'07:00:00':i%3===1?'15:00:00':'23:00:00',
    endTime:i%3===0?'15:00:00':i%3===1?'23:00:00':'07:00:00',
    room:['Cardiology OPD','Neurology Ward','ICU','OR-1','Emergency','Oncology OPD','Ortho Ward'][i]
  }));
}

function renderShifts(rows){
  // count by type
  const mc=rows.filter(r=>r.shiftType==='MORNING').length;
  const ec=rows.filter(r=>r.shiftType==='EVENING').length;
  const nc=rows.filter(r=>r.shiftType==='NIGHT').length;
  document.getElementById('morningCount').textContent=mc;
  document.getElementById('eveningCount').textContent=ec;
  document.getElementById('nightCount').textContent=nc;
  const tbody=document.getElementById('shiftBody');
  if(!rows.length){tbody.innerHTML=`<tr><td colspan="7"><div class="no-results" style="display:block"><div class="icon">🗓</div><p>No shifts for selected date</p></div></td></tr>`;return}
  tbody.innerHTML=rows.map((r,i)=>`<tr style="animation:fadeUp .3s ease-out ${i*.04}s both">
    <td><div class="staff-info">
      <div class="avatar" style="background:${color(i)};width:32px;height:32px;font-size:.75rem">${initials(r.staffName)}</div>
      <div><div class="staff-name">${r.staffName}</div><div class="staff-sub">${r.empid}</div></div>
    </div></td>
    <td>${r.department}</td>
    <td><span class="badge badge-${r.shiftType?.toLowerCase()}">${fmtShift(r.shiftType)}</span></td>
    <td>${(r.startTime||'').substring(0,5)}</td>
    <td>${(r.endTime||'').substring(0,5)}</td>
    <td>${r.room||'—'}</td>
    <td><button class="act-btn danger" title="Remove shift" onclick="deleteShift(${r.id})" style="font-size:14px">🗑</button></td>
  </tr>`).join('');
}

async function addShift(e){
  e.preventDefault();
  const staffId=document.getElementById('shiftStaffId').value;
  const shiftType=document.getElementById('shiftTypeSelect').value;
  const shiftDate=document.getElementById('shiftDate2').value||new Date().toISOString().split('T')[0];
  const room=document.getElementById('shiftRoom').value;
  const times={MORNING:{s:'07:00:00',e:'15:00:00'},EVENING:{s:'15:00:00',e:'23:00:00'},NIGHT:{s:'23:00:00',e:'07:00:00'}};
  try{
    await ShiftAPI.create({staffId,shiftType,shiftDate,startTime:times[shiftType].s,endTime:times[shiftType].e,room});
    toast('Shift assigned','success');
  }catch(err){toast('Shift assigned (demo)','success')}
  document.getElementById('shiftForm').reset();loadShifts();
}

async function deleteShift(id){
  try{await ShiftAPI.delete(id)}catch(e){}
  toast('Shift removed','info');loadShifts();
}

/* =============================================
   LEAVE TAB
   ============================================= */
async function loadLeave(){
  const filter=document.getElementById('leaveFilter')?.value||'';
  const tbody=document.getElementById('leaveBody');
  tbody.innerHTML=`<tr><td colspan="7"><div class="loading"><div class="spinner"></div>Loading…</div></td></tr>`;
  try{
    const data=await LeaveAPI.getAll(filter);renderLeave(data);
  }catch(e){renderLeave(getMockLeave())}
}

function getMockLeave(){
  const today=new Date().toISOString().split('T')[0];
  const future=new Date(Date.now()+3*86400000).toISOString().split('T')[0];
  return[
    {id:1,staffId:5,staffName:'Dr. Meena Joshi',empid:'EMP005',department:'Pediatrics',startDate:today,endDate:future,reason:'Family emergency',status:'PENDING',createdAt:new Date().toISOString()},
    {id:2,staffId:9,staffName:'Ms. Kavitha Reddy',empid:'EMP009',department:'Administration',startDate:yesterday(),endDate:future,reason:'Medical leave',status:'APPROVED',createdAt:new Date().toISOString()},
    {id:3,staffId:12,staffName:'Nurse Deepak Verma',empid:'EMP012',department:'Surgery',startDate:future,endDate:new Date(Date.now()+5*86400000).toISOString().split('T')[0],reason:'Personal reasons',status:'PENDING',createdAt:new Date().toISOString()},
  ];
}
function yesterday(){return new Date(Date.now()-86400000).toISOString().split('T')[0]}

function renderLeave(rows){
  const tbody=document.getElementById('leaveBody');
  if(!rows.length){tbody.innerHTML=`<tr><td colspan="7"><div class="no-results" style="display:block"><div class="icon">📋</div><p>No leave requests</p></div></td></tr>`;return}
  tbody.innerHTML=rows.map((r,i)=>`<tr style="animation:fadeUp .3s ease-out ${i*.04}s both">
    <td><div class="staff-name">${r.staffName}</div><div class="staff-sub">${r.department}</div></td>
    <td><span class="emp-id">${r.empid}</span></td>
    <td>${fmtDate(r.startDate)}</td>
    <td>${fmtDate(r.endDate)}</td>
    <td style="max-width:200px;font-size:.82rem;color:var(--text2)">${r.reason||'—'}</td>
    <td><span class="badge badge-${r.status?.toLowerCase()}">${r.status}</span></td>
    <td><div class="action-btns">
      ${r.status==='PENDING'?`<button class="act-btn green" title="Approve" onclick="approveLeave(${r.id})" style="font-size:13px">✅</button>
      <button class="act-btn danger" title="Reject" onclick="rejectLeave(${r.id})" style="font-size:13px">❌</button>`:'<span style="color:var(--muted);font-size:.78rem">Done</span>'}
    </div></td>
  </tr>`).join('');
}

async function submitLeave(e){
  e.preventDefault();
  const data={
    staffId:document.getElementById('leaveStaff').value,
    startDate:document.getElementById('leaveStart').value,
    endDate:document.getElementById('leaveEnd').value,
    reason:document.getElementById('leaveReason').value,
  };
  try{await LeaveAPI.create(data);toast('Leave request submitted','success')}
  catch(err){toast('Leave submitted (demo)','success')}
  document.getElementById('leaveForm').reset();loadLeave();refreshNotifBadge();
}

async function approveLeave(id){
  try{await LeaveAPI.approve(id);toast('Leave approved','success')}
  catch(e){toast('Leave approved (demo)','success')}
  loadLeave();refreshNotifBadge();
}
async function rejectLeave(id){
  try{await LeaveAPI.reject(id);toast('Leave rejected','info')}
  catch(e){toast('Leave rejected (demo)','info')}
  loadLeave();refreshNotifBadge();
}

/* =============================================
   NOTIFICATIONS TAB
   ============================================= */
async function loadNotifications(){
  const list=document.getElementById('notifList');
  list.innerHTML=`<div class="loading"><div class="spinner"></div>Loading…</div>`;
  try{
    const data=await NotifAPI.getAll();renderNotifications(data);
  }catch(e){renderNotifications(getMockNotifs())}
}

function getMockNotifs(){
  return[
    {id:1,message:'Dr. Arjun Sharma has checked in for Morning shift.',type:'SUCCESS',isRead:false,staffName:'Dr. Arjun Sharma',createdAt:new Date(Date.now()-2*60000).toISOString()},
    {id:2,message:'Shift conflict detected in Surgery on upcoming Sunday.',type:'WARNING',isRead:false,staffName:null,createdAt:new Date(Date.now()-18*60000).toISOString()},
    {id:3,message:'Leave request from Dr. Meena Joshi is pending approval.',type:'INFO',isRead:false,staffName:'Dr. Meena Joshi',createdAt:new Date(Date.now()-60*60000).toISOString()},
    {id:4,message:'Nurse Rekha Patel marked as Emergency Available.',type:'INFO',isRead:true,staffName:'Nurse Rekha Patel',createdAt:new Date(Date.now()-120*60000).toISOString()},
    {id:5,message:'System maintenance scheduled on Sunday 2:00 AM.',type:'WARNING',isRead:true,staffName:null,createdAt:new Date(Date.now()-180*60000).toISOString()},
    {id:6,message:'Dr. Ramesh Kumar check-in is 30 minutes late.',type:'WARNING',isRead:false,staffName:'Dr. Ramesh Kumar',createdAt:new Date(Date.now()-240*60000).toISOString()},
  ];
}

function renderNotifications(rows){
  const list=document.getElementById('notifList');
  const typeIcon={SUCCESS:'✅',WARNING:'⚠️',DANGER:'🚨',INFO:'ℹ️'};
  const typeBg={SUCCESS:'rgba(16,185,129,.12)',WARNING:'rgba(245,158,11,.12)',DANGER:'rgba(244,63,94,.12)',INFO:'rgba(59,130,246,.12)'};
  list.innerHTML=rows.map(n=>`
    <div class="notif-item ${n.isRead?'':'unread'}">
      <div class="notif-icon" style="background:${typeBg[n.type]||typeBg.INFO}">${typeIcon[n.type]||'ℹ️'}</div>
      <div class="notif-content">
        <div class="notif-msg">${n.message}</div>
        <div class="notif-time">${n.staffName?n.staffName+' · ':''} ${timeAgo(n.createdAt)}</div>
      </div>
      ${!n.isRead?`<button class="notif-read-btn" onclick="markRead(${n.id})">Mark read</button>`:'<span style="font-size:.72rem;color:var(--muted)">Read</span>'}
    </div>`).join('')||'<div class="no-results" style="display:block"><div class="icon">🔔</div><p>No notifications</p></div>';
}

function timeAgo(iso){
  const diff=(Date.now()-new Date(iso))/60000;
  if(diff<1)return'just now';
  if(diff<60)return Math.floor(diff)+'m ago';
  if(diff<1440)return Math.floor(diff/60)+'h ago';
  return Math.floor(diff/1440)+'d ago';
}

async function markRead(id){
  try{await NotifAPI.markRead(id)}catch(e){}
  loadNotifications();refreshNotifBadge();
}
async function markAllRead(){
  try{await NotifAPI.markAllRead();toast('All marked as read','success')}
  catch(e){toast('All marked as read (demo)','success')}
  loadNotifications();refreshNotifBadge();
}

/* ===== AUTH LOGIC ===== */
function logout() {
  localStorage.removeItem('medsched_token');
  localStorage.removeItem('medsched_user');
  window.location.href = 'login.html';
}

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded',()=>{
  const token = localStorage.getItem('medsched_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  const user = localStorage.getItem('medsched_user') || 'Admin';
  const unameEl = document.getElementById('navUsername');
  if (unameEl) unameEl.textContent = user;

  updateClock();setInterval(updateClock,30000);
  refreshNotifBadge();setInterval(refreshNotifBadge,30000);
  switchTab('staff');
  document.getElementById('searchInput')?.addEventListener('input',renderStaff);
  document.getElementById('filterDept')?.addEventListener('change',renderStaff);
  document.getElementById('filterRole')?.addEventListener('change',renderStaff);
});

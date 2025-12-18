const API_BASE = 'http://127.0.0.1:8000';

function toJSON(obj){ try { return JSON.stringify(obj, null, 2) } catch(e){ return String(obj) } }

async function post(path, body){
  const res = await fetch(API_BASE + path, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  const txt = await res.text();
  try { return {status: res.status, body: JSON.parse(txt)} } catch(e) { return {status: res.status, body: txt} }
}

async function get(path){
  const res = await fetch(API_BASE + path);
  const txt = await res.text();
  try { return {status: res.status, body: JSON.parse(txt)} } catch(e) { return {status: res.status, body: txt} }
}

// Register
document.getElementById('form-register').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target); const body = Object.fromEntries(fd.entries());
  const r = await post('/digital_id/register', body);
  document.getElementById('out-register').textContent = toJSON(r);
});

// Zone
document.getElementById('form-zone').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target); const body = {name: fd.get('name'), lat: parseFloat(fd.get('lat')), lng: parseFloat(fd.get('lng')), radius_m: parseFloat(fd.get('radius_m'))};
  const r = await post('/zones', body);
  document.getElementById('out-zone').textContent = toJSON(r);
});

// Position
document.getElementById('form-position').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target); const body = {user_id: fd.get('user_id'), lat: parseFloat(fd.get('lat')), lng: parseFloat(fd.get('lng'))};
  const r = await post('/position', body);
  document.getElementById('out-position').textContent = toJSON(r);
});

// SOS
document.getElementById('form-sos').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target); const body = {user_id: fd.get('user_id')||null, lat: parseFloat(fd.get('lat')), lng: parseFloat(fd.get('lng')), message: fd.get('message'), panic: fd.get('panic')?true:false, injury: fd.get('injury')?true:false, threat: fd.get('threat')?true:false};
  const r = await post('/sos', body);
  document.getElementById('out-sos').textContent = toJSON(r);
});

// IoT
document.getElementById('form-iot').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target); let payload = {};
  try { payload = JSON.parse(fd.get('payload')) } catch(err){ alert('Invalid JSON for payload'); return }
  const body = {device_id: fd.get('device_id'), lat: parseFloat(fd.get('lat')), lng: parseFloat(fd.get('lng')), payload};
  const r = await post('/iot/ingest', body);
  document.getElementById('out-iot').textContent = toJSON(r);
});

// Predict
document.getElementById('form-predict').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target); let points = [];
  try { points = JSON.parse(fd.get('points')) } catch(err){ alert('Invalid JSON for points'); return }
  const r = await post('/predict/risk', {points});
  document.getElementById('out-predict').textContent = toJSON(r);
});

// List incidents / sensors
document.getElementById('btn-list-incidents').addEventListener('click', async ()=>{
  const r = await get('/incidents');
  document.getElementById('out-list').textContent = toJSON(r);
});

async function listSensors(){
  const r = await fetch(API_BASE + '/iot/events').catch(()=>null);
  if(r && r.ok){ const body = await r.json(); document.getElementById('out-list').textContent = toJSON({status:r.status, body}); }
  else{
    // our backend exposes sensors via /iot/ingest store only; call a known list route (none) so we call /predict to show hint
    document.getElementById('out-list').textContent = 'No direct sensors listing endpoint; use /iot/ingest to add events and check backend memory via server console or add an endpoint.';
  }
}

document.getElementById('btn-list-sensors').addEventListener('click', listSensors);

// Helpful note: adjust API_BASE if your backend is at a different host/port

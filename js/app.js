const state={equipment:[],manufacturers:[],jobs:[],score:100,xp:0,selectedWire:null,assignments:{},beamBroken:false};
const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];

async function loadData(){
  const [e,m,j]=await Promise.all([
    fetch('data/equipment.json').then(r=>r.json()),
    fetch('data/manufacturers.json').then(r=>r.json()),
    fetch('data/jobs.json').then(r=>r.json())
  ]);
  state.equipment=e;state.manufacturers=m;state.jobs=j;
  buildFilters();renderEquipment();renderJobs();
}

$$('.tab').forEach(b=>b.addEventListener('click',()=>{
  $$('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  $$('.view').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.view).classList.add('active');
}));

const bayData={
 roller:{title:'Roller shutter bay',copy:'Inspect the industrial operator, control panel, photocells, safety edge, curtain, guides and limits.',parts:['Operator / motor','Control panel','Photocells','Safety edge','Limits','Push buttons']},
 gate:{title:'Automatic gate bay',copy:'Inspect drive units, gate controller, photocells, safety edges, encoder/limits and access-control inputs.',parts:['Gate motor','Control PCB','Photocells','Safety edges','Encoder / limits','Access control']},
 barrier:{title:'Traffic barrier bay',copy:'Inspect barrier cabinet, motor/gearbox, boom balance, loop detector, photocells and limit system.',parts:['Barrier drive','Control PCB','Loop detector','Photocells','Boom balance','Limits']}
};
$$('.bay').forEach(b=>b.addEventListener('click',()=>{
  const d=bayData[b.dataset.job];$('#inspect-title').textContent=d.title;$('#inspect-copy').textContent=d.copy;
  $('#component-buttons').innerHTML=d.parts.map(p=>`<button>${p}</button>`).join('');
}));

function buildFilters(){
 const mf=$('#manufacturer-filter');
 [...new Set(state.equipment.map(x=>x.manufacturer))].sort().forEach(v=>mf.insertAdjacentHTML('beforeend',`<option>${v}</option>`));
 const tf=$('#type-filter');
 [...new Set(state.equipment.map(x=>x.type))].sort().forEach(v=>tf.insertAdjacentHTML('beforeend',`<option>${v}</option>`));
 ['equipment-search','manufacturer-filter','type-filter','verified-filter'].forEach(id=>$('#'+id).addEventListener('input',renderEquipment));
}
function renderEquipment(){
 const q=$('#equipment-search').value.toLowerCase(), mf=$('#manufacturer-filter').value, type=$('#type-filter').value, verified=$('#verified-filter').checked;
 const items=state.equipment.filter(x=>(!q||`${x.manufacturer} ${x.model} ${x.type}`.toLowerCase().includes(q))&&(!mf||x.manufacturer===mf)&&(!type||x.type===type)&&(!verified||x.verified));
 $('#equipment-grid').innerHTML=items.length?items.map(x=>`<article class="equipment-card">
   <div class="eyebrow">${x.sector.toUpperCase()}</div><h3>${x.manufacturer} · ${x.model}</h3>
   <div class="meta"><span class="pill">${x.type}</span><span class="pill ${x.verified?'verified':''}">${x.verified?'VERIFIED':'EXPANSION RECORD'}</span></div>
   <p>${x.summary}</p><p><b>Training:</b> ${(x.training||[]).join(' · ')}</p>
   ${x.lesson_id?`<button data-open-job="${x.lesson_id}">Open training job</button>`:''}
 </article>`).join(''):`<div class="empty">No equipment matches those filters.</div>`;
 $$('[data-open-job]').forEach(b=>b.addEventListener('click',()=>{showJobs();openJob(b.dataset.openJob)}));
}
function renderJobs(){
 $('#job-grid').innerHTML=state.jobs.map(j=>`<article class="job-card">
   <div class="eyebrow">${j.code} · ${j.sector}</div><h3>${j.title}</h3>
   <div class="meta"><span class="pill">${j.difficulty}</span><span class="pill ${j.verified?'verified':''}">${j.verified?'VERIFIED LESSON':'SCENARIO TEMPLATE'}</span></div>
   <p>${j.description}</p><button data-job-id="${j.id}" ${j.verified?'':'disabled'}>${j.verified?'Start job':'Awaiting equipment verification'}</button>
 </article>`).join('');
 $$('[data-job-id]').forEach(b=>b.addEventListener('click',()=>openJob(b.dataset.jobId)));
}
function showJobs(){
 $$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view==='jobs'));$$('.view').forEach(x=>x.classList.remove('active'));$('#jobs').classList.add('active');
}
function openJob(id){
 const j=state.jobs.find(x=>x.id===id);if(!j||!j.verified)return;
 state.selectedWire=null;state.assignments={};state.beamBroken=false;
 $('#simulator').classList.remove('hidden');$('#sim-code').textContent=`${j.code} · ${j.difficulty}`;$('#sim-title').textContent=j.title;
 $('#task-copy').innerHTML=`<div class="callout"><strong>Objective</strong><p>Match each conductor to its published function, then prove the simulated photocell response. This lesson models the UK GfA TOF accessory example; it is not a substitute for the exact installation instructions on site.</p></div>`;
 renderWiring();$('#sim-result').className='result info';$('#sim-result').textContent='Select a conductor, then select a function.';
 $('#simulator').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderWiring(){
 const wires=[['brown','Brown'],['blue','Blue'],['green','Green'],['black','Black'],['grey','Grey']];
 const terms=[['supply-a','24 VDC supply'],['supply-b','24 VDC supply'],['com','Relay COM'],['nc','Relay N/C'],['logic','Logic selector']];
 $('#wiring-puzzle').innerHTML=`<h3>Conductor puzzle</h3><div class="wire-grid">${wires.map(([k,n])=>`<button class="wire ${state.selectedWire===k?'active':''}" data-wire="${k}"><span class="dot ${k==='green'?'greenwire':k}"></span>${n}</button>`).join('')}</div>
 <div class="term-grid">${terms.map(([k,n])=>{const w=Object.keys(state.assignments).find(x=>state.assignments[x]===k);return `<button class="terminal" data-term="${k}"><b>${n}</b><small>${w?w.toUpperCase():'Empty'}</small></button>`}).join('')}</div>
 <button id="check-wiring">Check conductor functions</button>`;
 $$('.wire').forEach(b=>b.addEventListener('click',()=>{state.selectedWire=b.dataset.wire;renderWiring()}));
 $$('.terminal').forEach(b=>b.addEventListener('click',()=>{if(!state.selectedWire)return;Object.keys(state.assignments).forEach(w=>{if(state.assignments[w]===b.dataset.term)delete state.assignments[w]});state.assignments[state.selectedWire]=b.dataset.term;state.selectedWire=null;renderWiring()}));
 $('#check-wiring').addEventListener('click',checkWiring);
}
function checkWiring(){
 const a=state.assignments;
 const supply=(a.brown==='supply-a'&&a.blue==='supply-b')||(a.brown==='supply-b'&&a.blue==='supply-a');
 const ok=supply&&a.green==='com'&&a.black==='nc'&&a.grey==='logic';
 if(ok){state.xp+=100;$('#xp').textContent=state.xp;$('#sim-result').className='result good';$('#sim-result').innerHTML='<b>PASS · +100 XP</b><br>Correct conductor functions for this training example. Now command CLOSE and obstruct the photocell beam.'}
 else{state.score=Math.max(0,state.score-10);$('#score').textContent=state.score;$('#sim-result').className='result bad';$('#sim-result').innerHTML='<b>Not correct yet.</b><br>Re-check supply, relay COM, relay N/C and logic-selector functions. −10 points.'}
}
$('#cmd-close').addEventListener('click',()=>{$('#sim-curtain').style.transform='translateY(65px)';$('#sim-result').className='result info';$('#sim-result').textContent=state.beamBroken?'Close inhibited by simulated photocell input.':'Shutter is closing. Interrupt the photocell beam.'});
$('#cmd-open').addEventListener('click',()=>{$('#sim-curtain').style.transform='translateY(-50px)';$('#sim-result').className='result info';$('#sim-result').textContent='Shutter opening.'});
$('#cmd-stop').addEventListener('click',()=>{$('#sim-result').className='result info';$('#sim-result').textContent='Movement stopped.'});
$('#break-beam').addEventListener('click',()=>{state.beamBroken=!state.beamBroken;$('#sim-beam').style.opacity=state.beamBroken?.15:1;$('#break-beam').textContent=state.beamBroken?'Clear photocell':'Obstruct photocell';$('#sim-result').className='result good';$('#sim-result').innerHTML=state.beamBroken?'<b>Photocell obstructed.</b><br>The simulated safety input changes state.':'Photocell clear.'});
$('#close-sim').addEventListener('click',()=>$('#simulator').classList.add('hidden'));

loadData().catch(err=>{$('#equipment-grid').innerHTML=`<div class="empty">Could not load local data. If you opened index.html directly, run it through GitHub Pages or a local web server.</div>`;console.error(err)});

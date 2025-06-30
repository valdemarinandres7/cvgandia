let modo = "config"; // config | partido
let equipoLocal = [
  {dorsal:"5",nombre:"Juan"}, {dorsal:"2",nombre:"Pedro"}, {dorsal:"9",nombre:"Luis"},
  {dorsal:"7",nombre:"Carlos"}, {dorsal:"8",nombre:"Mateo"}, {dorsal:"12",nombre:"Fede"}
];
let suplentesLocal = [ {dorsal:"4",nombre:"Hernan"} ];
let equipoRival = [
  {dorsal:"10",nombre:"Ale"}, {dorsal:"15",nombre:"Leo"}, {dorsal:"13",nombre:"Maxi"},
  {dorsal:"6",nombre:"Santi"}, {dorsal:"17",nombre:"Tobias"}, {dorsal:"18",nombre:"Bruno"}
];
let suplentesRival = [ {dorsal:"3",nombre:"Ramiro"} ];
let nombreLocal = "Equipo Local", nombreRival = "Equipo Rival";

let puntosLocal = 0, puntosRival = 0;
let jugadas = [];
let sel = {equipo:"local",jugador:0,accion:"Ataque",resultado:"++",zona:"",subzona:""};

const zonas = [ {x:300,y:245},{x:180,y:245},{x:60,y:245},{x:300,y:145},{x:180,y:145},{x:60,y:145} ];
const zonasRival = [ {x:300,y:40},{x:180,y:40},{x:60,y:40},{x:300,y:110},{x:180,y:110},{x:60,y:110} ];

function render() {
  if(modo==="config") renderConfig();
  else renderPartido();
}

function renderConfig() {
  document.getElementById("app").innerHTML = `
    <div class="titulo">Configura tu partido</div>
    <form class="config-box" id="conf">
      <label>Nombre equipo local:<input name="nl" value="${nombreLocal}"/></label>
      <label>Titulares local (Dorsal,Nombre por línea):</label>
      <textarea name="tl">${equipoLocal.map(j=>`${j.dorsal},${j.nombre}`).join('\n')}</textarea>
      <label>Suplentes local (Dorsal,Nombre por línea):</label>
      <textarea name="sl">${suplentesLocal.map(j=>`${j.dorsal},${j.nombre}`).join('\n')}</textarea>
      <hr style="margin:1em 0;">
      <label>Nombre equipo rival:<input name="nr" value="${nombreRival}"/></label>
      <label>Titulares rival (Dorsal,Nombre por línea):</label>
      <textarea name="tr">${equipoRival.map(j=>`${j.dorsal},${j.nombre}`).join('\n')}</textarea>
      <label>Suplentes rival (Dorsal,Nombre por línea):</label>
      <textarea name="sr">${suplentesRival.map(j=>`${j.dorsal},${j.nombre}`).join('\n')}</textarea>
      <div style="text-align:center;">
        <button class="btn-main" type="submit">Comenzar partido</button>
      </div>
    </form>
  `;
  document.getElementById("conf").onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    nombreLocal = fd.get("nl")||"Local";
    equipoLocal = (fd.get("tl")||"").split("\n").map(l=>{
      let [d,n]=l.split(",");
      return d&&n?{dorsal:d.trim(),nombre:n.trim()}:null;
    }).filter(j=>j);
    suplentesLocal = (fd.get("sl")||"").split("\n").map(l=>{
      let [d,n]=l.split(",");
      return d&&n?{dorsal:d.trim(),nombre:n.trim()}:null;
    }).filter(j=>j);
    nombreRival = fd.get("nr")||"Rival";
    equipoRival = (fd.get("tr")||"").split("\n").map(l=>{
      let [d,n]=l.split(",");
      return d&&n?{dorsal:d.trim(),nombre:n.trim()}:null;
    }).filter(j=>j);
    suplentesRival = (fd.get("sr")||"").split("\n").map(l=>{
      let [d,n]=l.split(",");
      return d&&n?{dorsal:d.trim(),nombre:n.trim()}:null;
    }).filter(j=>j);
    puntosLocal = 0; puntosRival = 0; jugadas = [];
    sel = {equipo:"local",jugador:0,accion:"Ataque",resultado:"++",zona:"",subzona:""};
    modo = "partido";
    render();
  };
}

function renderPartido() {
  document.getElementById("app").innerHTML = `
    <div class="titulo">Voley Live Stats</div>
    <div class="flex">
      <div class="panel-acciones">
        <label>Equipo:
          <select onchange="sel.equipo=this.value;sel.jugador=0;render()" id="eqSel">
            <option value="local">Local</option>
            <option value="rival">Rival</option>
          </select>
        </label>
        <label>Jugador:</label>
        <div class="teclado" id="jugadores"></div>
        <label>Acción:</label>
        <div class="teclado">
          ${["Saque","Recepción","Ataque","Bloqueo","Defensa"].map(a=>
            `<button onclick="sel.accion='${a}';render()" class="${sel.accion===a?'selected':''}">${a}</button>`
          ).join('')}
        </div>
        <label>Resultado:</label>
        <div class="teclado">
          ${["++","+","!","=","-","--"].map(r=>
            `<button onclick="sel.resultado='${r}';render()" class="${sel.resultado===r?'selected':''}">${r}</button>`
          ).join('')}
        </div>
        <label>Zona:
          <select id="zonaSel" onchange="sel.zona=this.value;">
            <option value="">-</option>
            <option value="1" ${sel.zona==="1"?"selected":""}>1</option>
            <option value="2" ${sel.zona==="2"?"selected":""}>2</option>
            <option value="3" ${sel.zona==="3"?"selected":""}>3</option>
            <option value="4" ${sel.zona==="4"?"selected":""}>4</option>
            <option value="5" ${sel.zona==="5"?"selected":""}>5</option>
            <option value="6" ${sel.zona==="6"?"selected":""}>6</option>
          </select>
        </label>
        <label>Subzona:
          <select id="subzonaSel" onchange="sel.subzona=this.value;">
            <option value="">-</option>
            <option value="A" ${sel.subzona==="A"?"selected":""}>A</option>
            <option value="B" ${sel.subzona==="B"?"selected":""}>B</option>
            <option value="C" ${sel.subzona==="C"?"selected":""}>C</option>
            <option value="D" ${sel.subzona==="D"?"selected":""}>D</option>
          </select>
        </label>
        <button style="margin-top:10px;background:#00baff;color:#fff;" onclick="registrarJugada()">Registrar</button>
        <button style="background:#101418;color:#00baff;" onclick="modo='config';render()">Editar equipos</button>
        <button class="btn-main" style="background:#fff;color:#00baff;border:1.5px solid #00baff;" onclick="resetPartido()">Reiniciar partido</button>
        <button class="export-btn" onclick="exportCSV()">Exportar CSV</button>
      </div>
      <div class="cancha-svg" style="position:relative;">
        <svg width="380" height="340" viewBox="0 0 380 340" style="position:absolute;left:0;top:0;z-index:1;">
          <rect x="20" y="20" width="340" height="300" rx="15" fill="#fff"/>
          <rect x="20" y="160" width="340" height="8" fill="#101418"/>
          <line x1="120" y1="20" x2="120" y2="320" stroke="#00baff" stroke-width="3"/>
          <line x1="240" y1="20" x2="240" y2="320" stroke="#00baff" stroke-width="3"/>
          <text x="190" y="38" text-anchor="middle" font-size="14" fill="#101418" font-weight="bold">${nombreRival}</text>
          <text x="190" y="328" text-anchor="middle" font-size="14" fill="#00baff" font-weight="bold">${nombreLocal}</text>
          <text x="190" y="175" text-anchor="middle" font-size="13" fill="#101418" font-weight="bold">RED</text>
        </svg>
        ${equipoLocal.map((j,i)=>renderJugador(j,zonas[i],"local",i)).join('')}
        ${equipoRival.map((j,i)=>renderJugador(j,zonasRival[i],"rival",i)).join('')}
      </div>
    </div>
    <div class="puntos-bar">
      <span style="color:#00baff;">${puntosLocal}</span>
      -
      <span style="color:#101418;">${puntosRival}</span>
    </div>
    <div style="display:flex;justify-content:space-between;gap:15px;width:100%;margin:0 auto 0.6em auto;">
      <div class="suplentes-box">
        <h4>Suplentes ${nombreLocal}</h4>
        <div class="suplentes-list">
          ${suplentesLocal.length ? suplentesLocal.map(j=>`
            <span class="suplentes-badge">${j.dorsal} - ${j.nombre}</span>
          `).join('') : "<i>Sin suplentes</i>"}
        </div>
      </div>
      <div class="suplentes-box">
        <h4>Suplentes ${nombreRival}</h4>
        <div class="suplentes-list">
          ${suplentesRival.length ? suplentesRival.map(j=>`
            <span class="suplentes-badge">${j.dorsal} - ${j.nombre}</span>
          `).join('') : "<i>Sin suplentes</i>"}
        </div>
      </div>
    </div>
    ${renderRegistro()}
    ${renderEstadisticas()}
  `;

  document.getElementById("eqSel").value = sel.equipo;
  const jugadores = sel.equipo==="local"?equipoLocal:equipoRival;
  document.getElementById("jugadores").innerHTML = jugadores.map((j,i)=>
    `<button onclick="sel.jugador=${i};render()" class="${sel.jugador===i?'selected':''}">${j.dorsal}<br>${j.nombre}</button>`
  ).join('');
  document.getElementById("zonaSel").value = sel.zona||"";
  document.getElementById("subzonaSel").value = sel.subzona||"";
}

function renderJugador(j,pos,eq) {
  return `<div class="jugador-campo${eq==="rival"?' rival':''}" style="left:${pos.x-22}px;top:${pos.y-22}px;">${j.dorsal}<br>${j.nombre}</div>`;
}

window.registrarJugada = function() {
  const jugadores = sel.equipo==="local"?equipoLocal:equipoRival;
  if(!jugadores[sel.jugador]) return alert("Selecciona un jugador válido.");
  // Suma puntos automáticos para ++ y -- (ejemplo simple)
  if(sel.resultado==="++") sel.equipo==="local"?puntosLocal++:puntosRival++;
  if(sel.resultado==="--") sel.equipo==="local"?puntosRival++:puntosLocal++;
  jugadas.push({...sel, puntosLocal, puntosRival});
  render();
};

window.resetPartido = function() {
  if(confirm("¿Seguro que quieres reiniciar todo el partido?")) {
    puntosLocal = 0; puntosRival = 0; jugadas = [];
    sel = {equipo:"local",jugador:0,accion:"Ataque",resultado:"++",zona:"",subzona:""};
    render();
  }
};

window.exportCSV = function() {
  if(!jugadas.length) return alert("No hay jugadas para exportar.");
  let csv = "Nro,Equipo,Jugador,Accion,Resultado,Zona,Subzona,Marcador\n";
  jugadas.forEach((j,i)=>{
    let jugadorObj = j.equipo==="local"?equipoLocal[j.jugador]:equipoRival[j.jugador];
    csv += `${i+1},${j.equipo==="local"?nombreLocal:nombreRival},"${jugadorObj.dorsal}-${jugadorObj.nombre}",${j.accion},${j.resultado},${j.zona},${j.subzona},${j.puntosLocal} - ${j.puntosRival}\n`;
  });
  let blob = new Blob([csv],{type:'text/csv'});
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "voley_stats.csv";
  link.click();
};

function renderRegistro() {
  if (!jugadas.length) return "";
  return `
    <div class="registro-acciones">
      <b>Registro de jugadas</b>
      <table>
        <tr>
          <th>#</th><th>Eq</th><th>Jugador</th><th>Acción</th><th>Res.</th><th>Zona</th><th>Subzona</th><th>Marcador</th>
        </tr>
        ${jugadas.slice(-20).map((r,i,arr)=>`
          <tr>
            <td>${jugadas.length-20+i+1>0?jugadas.length-20+i+1:i+1}</td>
            <td>${r.equipo==="local"?nombreLocal:nombreRival}</td>
            <td>${(r.equipo==="local"?equipoLocal:equipoRival)[r.jugador].dorsal} - ${(r.equipo==="local"?equipoLocal:equipoRival)[r.jugador].nombre}</td>
            <td>${r.accion}</td>
            <td>${r.resultado}</td>
            <td>${r.zona||"-"}</td>
            <td>${r.subzona||"-"}</td>
            <td>${r.puntosLocal} - ${r.puntosRival}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
}

function renderEstadisticas() {
  // Por equipo
  const puntosL = jugadas.filter(j=>j.equipo==="local"&&j.resultado==="++").length;
  const puntosR = jugadas.filter(j=>j.equipo==="rival"&&j.resultado==="++").length;
  const erroresL = jugadas.filter(j=>j.equipo==="local"&&j.resultado==="--").length;
  const erroresR = jugadas.filter(j=>j.equipo==="rival"&&j.resultado==="--").length;
  // Por jugador
  function statsJugador(eq, idx) {
    let jug = jugadas.filter(j=>j.equipo===eq&&j.jugador===idx);
    let puntos = jug.filter(j=>j.resultado==="++").length;
    let errores = jug.filter(j=>j.resultado==="--").length;
    let ataques = jug.filter(j=>j.accion==="Ataque").length;
    let recep = jug.filter(j=>j.accion==="Recepción").length;
    let bloqueos = jug.filter(j=>j.accion==="Bloqueo").length;
    let saques = jug.filter(j=>j.accion==="Saque").length;
    let eficacia = jug.length ? Math.round((puntos-errores)*100/jug.length) : 0;
    return {puntos,errores,ataques,recep,bloqueos,saques,eficacia};
  }
  return `
    <div class="stats-box">
      <div class="stats-title">Estadísticas por equipo</div>
      <table>
        <tr><th>Equipo</th><th>Puntos</th><th>Errores</th></tr>
        <tr>
          <td>${nombreLocal}</td>
          <td>${puntosL}</td>
          <td>${erroresL}</td>
        </tr>
        <tr>
          <td>${nombreRival}</td>
          <td>${puntosR}</td>
          <td>${erroresR}</td>
        </tr>
      </table>
      <div class="stats-title" style="margin-top:1.2em;">Estadísticas por jugador</div>
      <table>
        <tr><th>Jugador</th><th>Puntos</th><th>Errores</th><th>Ataques</th><th>Recep.</th><th>Bloq.</th><th>Saque</th><th>Eficacia %</th></tr>
        ${equipoLocal.map((j,idx)=>{
          let s = statsJugador("local",idx);
          return `<tr>
            <td>${j.dorsal} - ${j.nombre}</td>
            <td>${s.puntos}</td><td>${s.errores}</td><td>${s.ataques}</td><td>${s.recep}</td><td>${s.bloqueos}</td><td>${s.saques}</td><td>${s.eficacia}</td>
          </tr>`;
        }).join('')}
        ${equipoRival.map((j,idx)=>{
          let s = statsJugador("rival",idx);
          return `<tr>
            <td>${j.dorsal} - ${j.nombre}</td>
            <td>${s.puntos}</td><td>${s.errores}</td><td>${s.ataques}</td><td>${s.recep}</td><td>${s.bloqueos}</td><td>${s.saques}</td><td>${s.eficacia}</td>
          </tr>`;
        }).join('')}
      </table>
    </div>
  `;
}

render();

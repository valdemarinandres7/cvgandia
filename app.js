let page = 1;

let partido = {
  fecha: "",
  lugar: "",
  equipoLocal: {
    nombre: "",
    color: "#00baff",
    titulares: [
      { nombre: "", dorsal: "", rol: "" },
      { nombre: "", dorsal: "", rol: "" },
      { nombre: "", dorsal: "", rol: "" },
      { nombre: "", dorsal: "", rol: "" },
      { nombre: "", dorsal: "", rol: "" },
      { nombre: "", dorsal: "", rol: "" }
    ],
    suplentes: []
  },
  equipoRival: {
    nombre: "",
    color: "#222a35",
    titulares: [
      { nombre: "", dorsal: "", rol: "" },
      { nombre: "", dorsal: "", rol: "" },
      { nombre: "", dorsal: "", rol: "" },
      { nombre: "", dorsal: "", rol: "" },
      { nombre: "", dorsal: "", rol: "" },
      { nombre: "", dorsal: "", rol: "" }
    ],
    suplentes: []
  }
};

let rotacionLocal = [null,null,null,null,null,null];
let rotacionRival = [null,null,null,null,null,null];

// -- Para jugadas y estadísticas --
let jugadaRegistro = []; // {equipo, jugador, accion, zona, subzona, resultado, puntosLocal, puntosRival}
let puntosLocal = 0, puntosRival = 0;

function render() {
  if (page === 1) renderDatosPartido();
  else if (page === 2) renderRotacionManual();
  else renderCanchaPartido();
}

function renderDatosPartido() {
  document.getElementById("app").innerHTML = `
    <div class="titulo">Datos del Partido</div>
    <form class="form-block" id="formPartido">
      <label>Fecha y Hora: <input required name="fecha" type="datetime-local" value="${partido.fecha}"/></label>
      <label>Lugar: <input name="lugar" value="${partido.lugar}"/></label>
      <div class="equipo-section">
        <h3>Equipo Local</h3>
        <label>Nombre: <input required name="eqLocalNombre" value="${partido.equipoLocal.nombre}"/></label>
        <label>Color camiseta: <input name="eqLocalColor" type="color" value="${partido.equipoLocal.color}"/></label>
        <label>Titulares (6):</label>
        ${[0,1,2,3,4,5].map(i=>`
          <input required name="localT${i}" placeholder="Dorsal, Nombre, Rol" value="${(partido.equipoLocal.titulares[i].dorsal||"")},${(partido.equipoLocal.titulares[i].nombre||"")},${(partido.equipoLocal.titulares[i].rol||"")}"/>
        `).join('')}
        <label>Suplentes (uno por línea, formato: Dorsal,Nombre, Rol):</label>
        <textarea name="localSupl">${partido.equipoLocal.suplentes.map(j=>`${j.dorsal},${j.nombre},${j.rol}`).join('\n')}</textarea>
      </div>
      <div class="equipo-section">
        <h3>Equipo Rival</h3>
        <label>Nombre: <input required name="eqRivalNombre" value="${partido.equipoRival.nombre}"/></label>
        <label>Color camiseta: <input name="eqRivalColor" type="color" value="${partido.equipoRival.color}"/></label>
        <label>Titulares (6):</label>
        ${[0,1,2,3,4,5].map(i=>`
          <input required name="rivalT${i}" placeholder="Dorsal, Nombre, Rol" value="${(partido.equipoRival.titulares[i].dorsal||"")},${(partido.equipoRival.titulares[i].nombre||"")},${(partido.equipoRival.titulares[i].rol||"")}"/>
        `).join('')}
        <label>Suplentes (uno por línea, formato: Dorsal,Nombre, Rol):</label>
        <textarea name="rivalSupl">${partido.equipoRival.suplentes.map(j=>`${j.dorsal},${j.nombre},${j.rol}`).join('\n')}</textarea>
      </div>
      <div style="text-align:center;">
        <button type="submit" class="btn-main">Siguiente</button>
      </div>
    </form>
  `;
  document.getElementById("formPartido").onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    partido.fecha = fd.get("fecha");
    partido.lugar = fd.get("lugar");
    partido.equipoLocal.nombre = fd.get("eqLocalNombre");
    partido.equipoLocal.color = fd.get("eqLocalColor") || "#00baff";
    partido.equipoLocal.titulares = [0,1,2,3,4,5].map(i=>{
      let [dorsal,nombre,rol] = (fd.get(`localT${i}`)||",,").split(",");
      return {dorsal:dorsal.trim(),nombre:nombre.trim(),rol:rol.trim()};
    });
    partido.equipoLocal.suplentes = (fd.get("localSupl")||"").split('\n').map(line=>{
      let [dorsal,nombre,rol] = line.split(",");
      if (!nombre) return null;
      return {dorsal:dorsal?.trim(),nombre:nombre?.trim(),rol:rol?.trim()};
    }).filter(j=>j && j.nombre);
    partido.equipoRival.nombre = fd.get("eqRivalNombre");
    partido.equipoRival.color = fd.get("eqRivalColor") || "#222a35";
    partido.equipoRival.titulares = [0,1,2,3,4,5].map(i=>{
      let [dorsal,nombre,rol] = (fd.get(`rivalT${i}`)||",,").split(",");
      return {dorsal:dorsal.trim(),nombre:nombre.trim(),rol:rol.trim()};
    });
    partido.equipoRival.suplentes = (fd.get("rivalSupl")||"").split('\n').map(line=>{
      let [dorsal,nombre,rol] = line.split(",");
      if (!nombre) return null;
      return {dorsal:dorsal?.trim(),nombre:nombre?.trim(),rol:rol?.trim()};
    }).filter(j=>j && j.nombre);
    rotacionLocal = [null,null,null,null,null,null];
    rotacionRival = [null,null,null,null,null,null];
    page = 2;
    render();
  };
}

function renderRotacionManual() {
  document.getElementById("app").innerHTML = `
    <div class="titulo">Elegir Rotación Inicial</div>
    <div style="display:flex;gap:80px;justify-content:center;">
      <div>
        <h3 style="color:#00baff;text-align:center;">${partido.equipoLocal.nombre||"Local"}</h3>
        ${renderRotacionSelect("local")}
      </div>
      <div>
        <h3 style="color:#222a35;text-align:center;">${partido.equipoRival.nombre||"Rival"}</h3>
        ${renderRotacionSelect("rival")}
      </div>
    </div>
    <div style="text-align:center;margin-top:2em;">
      <button class="btn-main" onclick="confirmarRotacion()" ${rotacionLocal.includes(null)||rotacionRival.includes(null)?'disabled':''}>Confirmar rotación y ver cancha</button>
      <button class="btn-sec" style="margin-left:2em;" onclick="page=1;render()">Volver</button>
    </div>
  `;
}

function renderRotacionSelect(tipo) {
  let titulares = tipo==="local"?partido.equipoLocal.titulares:partido.equipoRival.titulares;
  let rotacion = tipo==="local"?rotacionLocal:rotacionRival;
  return `
    <table style="margin:0 auto;">
      <tr>
        <th>Zona</th>
        <th>Jugador</th>
      </tr>
      ${[1,2,3,4,5,6].map((z,i)=>`
        <tr>
          <td style="text-align:center;font-weight:bold;">${z}</td>
          <td>
            <select onchange="setRotacion('${tipo}',${i},this.value)">
              <option value="">-- Elegir titular --</option>
              ${titulares.map((j,idx)=>`
                <option value="${idx}" ${rotacion[i]==idx?"selected":""}
                  ${rotacion.includes(idx)&&rotacion[i]!=idx?"disabled":""}>
                  ${j.dorsal} - ${j.nombre} (${j.rol})
                </option>
              `).join('')}
            </select>
          </td>
        </tr>
      `).join('')}
    </table>
    <div style="margin:1em 0 0.5em 0;font-size:0.99em;color:#888;">Cada titular debe asignarse a una sola zona.</div>
  `;
}

window.setRotacion = function(tipo, zonaIdx, titIdx) {
  titIdx = titIdx===""?null:Number(titIdx);
  if(tipo==="local") rotacionLocal[zonaIdx]=titIdx;
  else rotacionRival[zonaIdx]=titIdx;
  renderRotacionManual();
};

window.confirmarRotacion = function() {
  partido.equipoLocal.rotacion = rotacionLocal.map(idx=>partido.equipoLocal.titulares[idx]);
  partido.equipoRival.rotacion = rotacionRival.map(idx=>partido.equipoRival.titulares[idx]);
  puntosLocal = 0; puntosRival = 0; jugadaRegistro = [];
  page = 3;
  render();
};

// Coordenadas de cancha compacta:
const POS_LOCAL = [
  {x: 480, y: 285},{x: 350, y: 285},{x: 220, y: 285},
  {x: 480, y: 215},{x: 350, y: 215},{x: 220, y: 215}
];
const POS_RIVAL = [
  {x: 480, y: 75},{x: 350, y: 75},{x: 220, y: 75},
  {x: 480, y: 145},{x: 350, y: 145},{x: 220, y: 145}
];

function renderCanchaPartido() {
  document.getElementById("app").innerHTML = `
    <div class="titulo">Partido en juego</div>
    ${renderPanelAcciones()}
    <div class="cancha-wrap">
      <div class="cancha-svg" style="position:relative;">
        ${renderSVGCancha()}
        ${partido.equipoLocal.rotacion.map((j,i)=>renderJugadorCampo(j, POS_LOCAL[i], partido.equipoLocal.color, "local", i===0)).join('')}
        ${partido.equipoRival.rotacion.map((j,i)=>renderJugadorCampo(j, POS_RIVAL[i], partido.equipoRival.color, "rival", i===0)).join('')}
      </div>
      <div class="puntos-bar">
        <span style="color:#00baff;">${puntosLocal}</span>
         - 
        <span style="color:#222a35;">${puntosRival}</span>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px;width:95%;margin:0 auto;">
        <div class="suplentes-box">
          <h4>Suplentes ${partido.equipoLocal.nombre||"Local"}</h4>
          <div class="suplentes-list">
            ${partido.equipoLocal.suplentes.length ? partido.equipoLocal.suplentes.map(j=>`
              <span class="suplentes-badge">${j.dorsal} - ${j.nombre} (${j.rol})</span>
            `).join('') : "<i>Sin suplentes</i>"}
          </div>
        </div>
        <div class="suplentes-box">
          <h4>Suplentes ${partido.equipoRival.nombre||"Rival"}</h4>
          <div class="suplentes-list">
            ${partido.equipoRival.suplentes.length ? partido.equipoRival.suplentes.map(j=>`
              <span class="suplentes-badge">${j.dorsal} - ${j.nombre} (${j.rol})</span>
            `).join('') : "<i>Sin suplentes</i>"}
          </div>
        </div>
      </div>
    </div>
    ${renderRegistro()}
    ${renderEstadisticas()}
    <div style="text-align:center;margin:1.5em 0">
      <button class="btn-sec" onclick="page=2;render()">Volver a rotación</button>
    </div>
  `;
}

function renderPanelAcciones() {
  // Llenar jugadores según selección actual
  let eq = "local";
  let jugOpts = partido.equipoLocal.rotacion.map((j,i)=>`<option value="${i}">${j.dorsal}-${j.nombre}</option>`).join('');
  setTimeout(()=>{
    document.getElementById("eqSel").onchange = function(e){
      eq = e.target.value;
      const jugadores = eq==="local"?partido.equipoLocal.rotacion:partido.equipoRival.rotacion;
      document.getElementById("jugSel").innerHTML = jugadores.map((j,i)=>`<option value="${i}">${j.dorsal}-${j.nombre}</option>`).join('');
    };
  },30);
  return `
    <div class="panel-acciones">
      <label>Equipo:
        <select id="eqSel">
          <option value="local">Local</option>
          <option value="rival">Rival</option>
        </select>
      </label>
      <label>Jugador:
        <select id="jugSel">${jugOpts}</select>
      </label>
      <label>Acción:
        <select id="accSel">
          <option value="Punto">Punto</option>
          <option value="Error">Error</option>
          <option value="Saque">Saque</option>
          <option value="Ataque">Ataque</option>
          <option value="Recepción">Recepción</option>
        </select>
      </label>
      <label>Zona:
        <select id="zonaSel">
          <option value="">-</option>
          <option value="1">1</option><option value="2">2</option><option value="3">3</option>
          <option value="4">4</option><option value="5">5</option><option value="6">6</option>
        </select>
      </label>
      <label>Subzona:
        <select id="subzonaSel">
          <option value="">-</option>
          <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
        </select>
      </label>
      <button onclick="registrarJugada()">Registrar</button>
    </div>
  `;
}

window.registrarJugada = function() {
  const eq = document.getElementById("eqSel").value;
  const jugIdx = document.getElementById("jugSel").value;
  const jugador = eq==="local" ? partido.equipoLocal.rotacion[jugIdx] : partido.equipoRival.rotacion[jugIdx];
  const accion = document.getElementById("accSel").value;
  const zona = document.getElementById("zonaSel").value;
  const subzona = document.getElementById("subzonaSel").value;
  if(!jugador) return alert("Selecciona un jugador válido.");
  // Actualiza puntos según acción
  if(accion==="Punto") eq==="local"?puntosLocal++:puntosRival++;
  if(accion==="Error") eq==="local"?puntosRival++:puntosLocal++;
  jugadaRegistro.push({
    equipo: eq, jugador, accion, zona, subzona, puntosLocal, puntosRival
  });
  renderCanchaPartido();
};

function renderSVGCancha() {
  return `
    <svg width="650" height="360" viewBox="0 0 650 360" style="position:absolute;left:0;top:0;z-index:1;">
      <rect x="20" y="20" width="610" height="320" rx="22" fill="#fff"/>
      <rect x="20" y="170" width="610" height="6" fill="#0a0c11"/>
      <line x1="200" y1="20" x2="200" y2="340" stroke="#00baff" stroke-width="3"/>
      <line x1="420" y1="20" x2="420" y2="340" stroke="#00baff" stroke-width="3"/>
      <text x="325" y="37" text-anchor="middle" font-size="13" fill="#222a35" font-weight="bold">${partido.equipoRival.nombre||"RIVAL"}</text>
      <text x="325" y="355" text-anchor="middle" font-size="13" fill="#00baff" font-weight="bold">${partido.equipoLocal.nombre||"LOCAL"}</text>
      <text x="325" y="185" text-anchor="middle" font-size="13" fill="#0a0c11" font-weight="bold">RED</text>
    </svg>
  `;
}

function renderJugadorCampo(j, pos, color, lado, sacador) {
  if (!j || !j.nombre) return '';
  let style = `left:${pos.x-25}px;top:${pos.y-25}px;background:linear-gradient(140deg,${color} 85%,#fff 100%);color:${lado==='local'?'#222a35':'#fff'};border-color:${lado==='local'?'#fff':color};`;
  if(lado==='rival') style += "background:linear-gradient(140deg,#222a35 90%,#fff 100%);color:#fff;";
  return `
    <div class="jugador-campo ${lado==='rival'?'rival':''}${sacador?' sacador':''}" style="${style}">
      ${j.dorsal}<span style="font-size:0.97em;line-height:1">${j.rol}</span>
      <span style="display:block;font-size:0.89em;">${j.nombre}</span>
    </div>
  `;
}

function renderRegistro() {
  if (!jugadaRegistro.length) return "";
  return `
    <div class="registro-acciones">
      <b>Registro de jugadas</b>
      <table>
        <tr>
          <th>#</th><th>Equipo</th><th>Jugador</th><th>Acción</th><th>Zona</th><th>Subzona</th><th>Marcador</th>
        </tr>
        ${jugadaRegistro.map((r,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${r.equipo==="local"?partido.equipoLocal.nombre:partido.equipoRival.nombre}</td>
            <td>${r.jugador.dorsal} - ${r.jugador.nombre}</td>
            <td>${r.accion}</td>
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
  // Ejemplo: puntos y errores por equipo
  const puntosL = jugadaRegistro.filter(j=>j.equipo==="local"&&j.accion==="Punto").length;
  const puntosR = jugadaRegistro.filter(j=>j.equipo==="rival"&&j.accion==="Punto").length;
  const erroresL = jugadaRegistro.filter(j=>j.equipo==="local"&&j.accion==="Error").length;
  const erroresR = jugadaRegistro.filter(j=>j.equipo==="rival"&&j.accion==="Error").length;
  return `
    <div class="stats-box" style="margin-top:1em;">
      <div class="stats-title">Estadísticas básicas</div>
      <table>
        <tr><th>Equipo</th><th>Puntos</th><th>Errores</th></tr>
        <tr>
          <td>${partido.equipoLocal.nombre||"Local"}</td>
          <td>${puntosL}</td>
          <td>${erroresL}</td>
        </tr>
        <tr>
          <td>${partido.equipoRival.nombre||"Rival"}</td>
          <td>${puntosR}</td>
          <td>${erroresR}</td>
        </tr>
      </table>
    </div>
  `;
}

render();

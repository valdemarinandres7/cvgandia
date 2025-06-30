// Posiciones absolutas en la cancha para 6 jugadores (zonas 1-6) de cada lado
const POS_LOCAL = [
  {x: 500, y: 325}, // Z1
  {x: 330, y: 325}, // Z6
  {x: 160, y: 325}, // Z5
  {x: 500, y: 235}, // Z2
  {x: 330, y: 235}, // Z3
  {x: 160, y: 235}, // Z4
];
const POS_RIVAL = [
  {x: 500, y: 90}, // Z1
  {x: 330, y: 90}, // Z6
  {x: 160, y: 90}, // Z5
  {x: 500, y: 180}, // Z2
  {x: 330, y: 180}, // Z3
  {x: 160, y: 180}, // Z4
];

let equipoLocal = [
  { nombre: "Juan", dorsal: 1, rol: "C" },
  { nombre: "Pedro", dorsal: 2, rol: "R" },
  { nombre: "Luis", dorsal: 3, rol: "Z" },
  { nombre: "Carlos", dorsal: 4, rol: "O" },
  { nombre: "Mateo", dorsal: 5, rol: "R" },
  { nombre: "Fede", dorsal: 7, rol: "L" }
];
let equipoRival = [
  { nombre: "Ale", dorsal: 11, rol: "C" },
  { nombre: "Maxi", dorsal: 12, rol: "R" },
  { nombre: "Leo", dorsal: 13, rol: "Z" },
  { nombre: "Santi", dorsal: 14, rol: "O" },
  { nombre: "Tobias", dorsal: 15, rol: "R" },
  { nombre: "Bruno", dorsal: 17, rol: "L" }
];

let rotLocal = [...equipoLocal];
let rotRival = [...equipoRival];
let puntosLocal = 0;
let puntosRival = 0;
let saqueLocal = true; // true=local, false=rival

let jugadorSel = { equipo: null, idx: null };
let accionSel = null;
let calidadSel = null;

let registro = [];

const acciones = [
  "Saque", "Recepción", "Ataque", "Bloqueo", "Defensa", "Contraataque"
];
const calidades = [
  "Doble positiva", "Positiva", "Exclamativa", "Neutra", "Negativa", "Doble negativa"
];

function render() {
  document.getElementById("app").innerHTML = `
    <div class="titulo">ClickVoley - Cancha Visual</div>
    <div class="cancha-wrap">
      <div class="cancha-svg" style="position:relative;">
        ${renderSVGCancha()}
        ${rotLocal.map((j,i)=>renderJugador(j, i, 'local')).join('')}
        ${rotRival.map((j,i)=>renderJugador(j, i, 'rival')).join('')}
      </div>
      <div class="puntos-bar"><span style="color:#43ea53;">${puntosLocal}</span> - <span style="color:#e57373;">${puntosRival}</span></div>
      <div style="text-align:center;margin-bottom:1em;"><b>${saqueLocal ? "Saque Local 🏐" : "Saque Rival 🏐"}</b></div>
    </div>
    <div class="panel">
      <div>Jugador seleccionado: 
        ${jugadorSel.equipo ? (jugadorSel.equipo==='local'?rotLocal[jugadorSel.idx]:rotRival[jugadorSel.idx]).dorsal + " - " + (jugadorSel.equipo==='local'?rotLocal[jugadorSel.idx]:rotRival[jugadorSel.idx]).nombre : "<i>Ninguno</i>"}
      </div>
      <div>
        Acción:
        ${acciones.map(a=>`<button class="${accionSel===a?'selected':''}" onclick="setAccion('${a}')">${a}</button>`).join('')}
      </div>
      <div>
        Calidad:
        ${calidades.map(c=>`<button class="${calidadSel===c?'selected':''}" onclick="setCalidad('${c}')">${c}</button>`).join('')}
      </div>
      <button style="background:#ffda47;color:#23263a;" onclick="registrarAccion()">Registrar</button>
    </div>
    ${renderRegistro()}
  `;
}

function renderSVGCancha() {
  // Fondo y líneas de la cancha, mitad a mitad
  return `
    <svg width="660" height="420" viewBox="0 0 660 420" style="position:absolute;left:0;top:0;z-index:1;">
      <rect x="30" y="30" width="600" height="360" rx="22" fill="#fafdff"/>
      <rect x="30" y="210" width="600" height="4" fill="#ffda47"/>
      <line x1="230" y1="30" x2="230" y2="390" stroke="#23263a" stroke-width="3"/>
      <line x1="430" y1="30" x2="430" y2="390" stroke="#23263a" stroke-width="3"/>
      <text x="330" y="22" text-anchor="middle" font-size="15" fill="#ffda47" font-weight="bold">RED</text>
      <text x="330" y="410" text-anchor="middle" font-size="13" fill="#43ea53" font-weight="bold">LOCAL</text>
      <text x="330" y="46" text-anchor="middle" font-size="13" fill="#e57373" font-weight="bold">RIVAL</text>
    </svg>
  `;
}

function renderJugador(j, idx, equipo) {
  let pos = equipo === 'local' ? POS_LOCAL[idx] : POS_RIVAL[idx];
  let selected = (jugadorSel.equipo === equipo && jugadorSel.idx === idx) ? "selected" : "";
  let sacador = (equipo === 'local' && saqueLocal && idx === 0) || (equipo === 'rival' && !saqueLocal && idx === 0);
  return `
    <div class="jugador-campo ${equipo==='rival'?'rival':''} ${selected} ${sacador?'sacador':''}"
      style="left:${pos.x-30}px;top:${pos.y-30}px;"
      onclick="selectJugador('${equipo}',${idx})"
      title="${j.nombre}">
      ${j.dorsal}<span style="font-size:0.97em;line-height:1">${j.rol}</span>
    </div>
  `;
}

window.selectJugador = function(equipo, idx) {
  jugadorSel = { equipo, idx };
  render();
};
window.setAccion = function(a) {
  accionSel = a;
  render();
};
window.setCalidad = function(c) {
  calidadSel = c;
  render();
};

window.registrarAccion = function() {
  if (!jugadorSel.equipo || accionSel===null || calidadSel===null) {
    alert("Selecciona jugador, acción y calidad.");
    return;
  }
  let equipo = jugadorSel.equipo;
  let idx = jugadorSel.idx;
  let jugador = equipo==="local"?rotLocal[idx]:rotRival[idx];
  // Puntuación y rotación
  if (calidadSel === "Doble positiva") {
    if (equipo === "local") puntosLocal++;
    else puntosRival++;
    // No cambia saque ni rotación
  } else if (calidadSel === "Doble negativa") {
    if (equipo === "local") {
      puntosRival++;
      if (saqueLocal) {
        saqueLocal = false;
        rotRival.unshift(rotRival.pop());
      }
    } else {
      puntosLocal++;
      if (!saqueLocal) {
        saqueLocal = true;
        rotLocal.unshift(rotLocal.pop());
      }
    }
  }
  registro.push({
    equipo: equipo==="local"?"Local":"Rival",
    jugador,
    accion: accionSel,
    calidad: calidadSel,
    puntosLocal,
    puntosRival
  });
  jugadorSel = { equipo:null, idx:null };
  accionSel = null; calidadSel = null;
  render();
};

function renderRegistro() {
  if (!registro.length) return "";
  return `
    <div class="registro-acciones">
      <b style="font-size:1.14em;">Registro</b>
      <table>
        <tr>
          <th>#</th><th>Equipo</th><th>Jugador</th><th>Acción</th><th>Calidad</th><th>Puntos</th>
        </tr>
        ${registro.map((r,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${r.equipo}</td>
            <td>${r.jugador.dorsal} - ${r.jugador.nombre}</td>
            <td>${r.accion}</td>
            <td>${r.calidad}</td>
            <td>${r.puntosLocal} - ${r.puntosRival}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
}

render();

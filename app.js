// -- Utilidad para editar equipos --
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
let zonaSel = null;
let subzonaSel = null;
let resultadoSel = null;

let registro = [];

const acciones = [
  "Saque", "Recepción", "Ataque", "Bloqueo", "Defensa", "Contraataque"
];
const resultados = [
  "Doble positiva", "Positiva", "Exclamativa", "Neutra", "Negativa", "Doble negativa", "Punto", "Error"
];

// -- Posiciones absolutas para 6 jugadores por equipo --
// Local: parte baja, Rival: parte alta
const POS_LOCAL = [
  {x: 670, y: 380}, // Z1
  {x: 470, y: 380}, // Z6
  {x: 270, y: 380}, // Z5
  {x: 670, y: 295}, // Z2
  {x: 470, y: 295}, // Z3
  {x: 270, y: 295}, // Z4
];
const POS_RIVAL = [
  {x: 670, y: 100}, // Z1
  {x: 470, y: 100}, // Z6
  {x: 270, y: 100}, // Z5
  {x: 670, y: 185}, // Z2
  {x: 470, y: 185}, // Z3
  {x: 270, y: 185}, // Z4
];

// Zonas (1-6) y subzonas (A-D) - para cada mitad
const zonas = [
  {zona:1, x:650, y:330}, {zona:6, x:470, y:330}, {zona:5, x:290, y:330},
  {zona:2, x:650, y:250}, {zona:3, x:470, y:250}, {zona:4, x:290, y:250}
];
const zonasRival = [
  {zona:1, x:650, y:150}, {zona:6, x:470, y:150}, {zona:5, x:290, y:150},
  {zona:2, x:650, y:70}, {zona:3, x:470, y:70}, {zona:4, x:290, y:70}
];

// Subzonas: A=esquina derecha atrás, B=centro atrás, C=centro adelante, D=esquina derecha adelante
function subzonaCoords(zx, zy, lado) {
  // lado: "local" o "rival"
  let dx = lado==="local"?-1:1;
  return [
    {k:"A", x:zx-25*dx, y:zy+17}, // atrás derecha
    {k:"B", x:zx, y:zy+17},       // atrás centro
    {k:"C", x:zx, y:zy-17},       // adelante centro
    {k:"D", x:zx-25*dx, y:zy-17}  // adelante derecha
  ];
}

function render() {
  document.getElementById("app").innerHTML = `
    <div class="titulo">
      ClickVoley - Cancha Visual Mejorada
      <button class="btn-edit" onclick="editarEquipo('local')">Editar Local</button>
      <button class="btn-edit" onclick="editarEquipo('rival')">Editar Rival</button>
    </div>
    <div class="cancha-wrap">
      <div class="cancha-svg" style="position:relative;">
        ${renderSVGCancha()}
        ${rotLocal.map((j,i)=>renderJugador(j, i, 'local')).join('')}
        ${rotRival.map((j,i)=>renderJugador(j, i, 'rival')).join('')}
        ${renderZonasYSubzonas()}
      </div>
      <div class="puntos-bar">
        <span style="color:#43ea53;">${puntosLocal}</span> - <span style="color:#e57373;">${puntosRival}</span>
      </div>
      <div style="text-align:center;margin-bottom:1em;"><b>${saqueLocal ? "Saque Local 🏐" : "Saque Rival 🏐"}</b></div>
    </div>
    <div class="panel">
      <div>Jugador seleccionado: 
        ${jugadorSel.equipo != null ? (jugadorSel.equipo==='local'?rotLocal[jugadorSel.idx]:rotRival[jugadorSel.idx]).dorsal + " - " + (jugadorSel.equipo==='local'?rotLocal[jugadorSel.idx]:rotRival[jugadorSel.idx]).nombre : "<i>Ninguno</i>"}
      </div>
      <div>
        Acción:
        ${acciones.map(a=>`<button class="${accionSel===a?'selected':''}" onclick="setAccion('${a}')">${a}</button>`).join('')}
      </div>
      <div>
        Resultado:
        ${resultados.map(c=>`<button class="${resultadoSel===c?'selected':''}" onclick="setResultado('${c}')">${c}</button>`).join('')}
      </div>
      <button style="background:#ffda47;color:#23263a;" onclick="registrarAccion()">Registrar</button>
    </div>
    ${renderRegistro()}
  `;
}

function renderSVGCancha() {
  // Fondo y líneas de la cancha, zonas y subzonas
  let zonasSVG = '';
  // Zonas Local (abajo)
  zonas.forEach(z=>{
    zonasSVG += `<rect x="${z.x-55}" y="${z.y-37}" width="110" height="74" rx="14" fill="#e4f3ff" opacity="0.20" stroke="#0ea5e9" stroke-width="2.8"/>`
      + `<text x="${z.x}" y="${z.y+7}" text-anchor="middle" class="zona-label">${z.zona}</text>`;
    // Subzonas A-D
    subzonaCoords(z.x, z.y, "local").forEach(s=>{
      zonasSVG += `<circle cx="${s.x}" cy="${s.y}" r="13" fill="#ffd600" opacity="0.15" stroke="#1976d2" stroke-width="1.7"/>`
        + `<text x="${s.x}" y="${s.y+5}" text-anchor="middle" class="subzona">${s.k}</text>`;
    });
  });
  // Zonas Rival (arriba)
  zonasRival.forEach(z=>{
    zonasSVG += `<rect x="${z.x-55}" y="${z.y-37}" width="110" height="74" rx="14" fill="#ffe4e1" opacity="0.17" stroke="#e20613" stroke-width="2.8"/>`
    + `<text x="${z.x}" y="${z.y+7}" text-anchor="middle" class="zona-label">${z.zona}</text>`;
    subzonaCoords(z.x, z.y, "rival").forEach(s=>{
      zonasSVG += `<circle cx="${s.x}" cy="${s.y}" r="13" fill="#ffd600" opacity="0.15" stroke="#e20613" stroke-width="1.7"/>`
        + `<text x="${s.x}" y="${s.y+5}" text-anchor="middle" class="subzona">${s.k}</text>`;
    });
  });
  return `
    <svg width="900" height="480" viewBox="0 0 900 480" style="position:absolute;left:0;top:0;z-index:1;">
      <rect x="50" y="50" width="800" height="380" rx="30" fill="#fff"/>
      <rect x="50" y="240" width="800" height="8" fill="#ffda47"/>
      <line x1="320" y1="50" x2="320" y2="430" stroke="#23263a" stroke-width="4"/>
      <line x1="580" y1="50" x2="580" y2="430" stroke="#23263a" stroke-width="4"/>
      <text x="450" y="43" text-anchor="middle" font-size="18" fill="#e20613" font-weight="bold">RIVAL</text>
      <text x="450" y="470" text-anchor="middle" font-size="18" fill="#43ea53" font-weight="bold">LOCAL</text>
      <text x="450" y="255" text-anchor="middle" font-size="18" fill="#ffda47" font-weight="bold">RED</text>
      ${zonasSVG}
    </svg>
  `;
}

function renderZonasYSubzonas() {
  // Overlay de clics para subzonas
  let html = '';
  // Local (abajo)
  zonas.forEach((z, idx)=>{
    subzonaCoords(z.x, z.y, "local").forEach(s=>{
      let selected = zonaSel?.zona==z.zona && subzonaSel==s.k && zonaSel.lado=="local";
      html += `<div
        class="subzona-btn${selected?' selected':''}"
        style="position:absolute;left:${s.x-18}px;top:${s.y-18}px;width:36px;height:36px;z-index:13;"
        onclick="clickZonaSubzona('local',${z.zona},'${s.k}')"
        title="Zona ${z.zona}${s.k}"
      ></div>`;
    });
  });
  // Rival (arriba)
  zonasRival.forEach((z, idx)=>{
    subzonaCoords(z.x, z.y, "rival").forEach(s=>{
      let selected = zonaSel?.zona==z.zona && subzonaSel==s.k && zonaSel.lado=="rival";
      html += `<div
        class="subzona-btn${selected?' selected':''}"
        style="position:absolute;left:${s.x-18}px;top:${s.y-18}px;width:36px;height:36px;z-index:13;"
        onclick="clickZonaSubzona('rival',${z.zona},'${s.k}')"
        title="Zona ${z.zona}${s.k}"
      ></div>`;
    });
  });
  return html;
}

function renderJugador(j, idx, equipo) {
  let pos = equipo === 'local' ? POS_LOCAL[idx] : POS_RIVAL[idx];
  let selected = (jugadorSel.equipo === equipo && jugadorSel.idx === idx) ? "selected" : "";
  let sacador = (equipo === 'local' && saqueLocal && idx === 0) || (equipo === 'rival' && !saqueLocal && idx === 0);
  return `
    <div class="jugador-campo ${equipo==='rival'?'rival':''} ${selected} ${sacador?'sacador':''}"
      style="left:${pos.x-32}px;top:${pos.y-32}px;"
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
window.setResultado = function(r) {
  resultadoSel = r;
  render();
};
window.clickZonaSubzona = function(lado, zona, subzona) {
  zonaSel = {zona, lado};
  subzonaSel = subzona;
  render();
};

window.registrarAccion = function() {
  if (!jugadorSel.equipo || accionSel===null || resultadoSel===null || !zonaSel || !subzonaSel) {
    alert("Selecciona jugador, acción, zona y resultado.");
    return;
  }
  let equipo = jugadorSel.equipo;
  let idx = jugadorSel.idx;
  let jugador = equipo==="local"?rotLocal[idx]:rotRival[idx];
  // Puntuación y rotación
  if (resultadoSel === "Doble positiva" || resultadoSel === "Punto") {
    if (equipo === "local") puntosLocal++;
    else puntosRival++;
    // No cambia saque ni rotación
  } else if (resultadoSel === "Doble negativa" || resultadoSel==="Error") {
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
    zona: zonaSel.zona, lado: zonaSel.lado, subzona: subzonaSel,
    resultado: resultadoSel,
    puntosLocal,
    puntosRival
  });
  jugadorSel = { equipo:null, idx:null };
  accionSel = null; resultadoSel = null; zonaSel = null; subzonaSel = null;
  render();
};

// Edición de equipos
window.editarEquipo = function(tipo) {
  let plantel = tipo==='local' ? equipoLocal : equipoRival;
  let promptStr = plantel.map(j=>`${j.dorsal},${j.nombre},${j.rol}`).join('\n');
  let res = prompt(`Edita los jugadores (dorsal,nombre,rol por línea):\nEjemplo:\n1,Juan,C\n2,Luis,Z`, promptStr);
  if (res!==null) {
    let nuevo = res.split('\n').map(line=>{
      let [dorsal,nombre,rol] = line.split(',');
      return {dorsal: dorsal?.trim()||'', nombre:nombre?.trim()||'', rol:rol?.trim()||''};
    }).filter(j=>j.nombre);
    if (tipo==='local') {
      equipoLocal = nuevo.slice(0,6);
      rotLocal = [...equipoLocal];
    } else {
      equipoRival = nuevo.slice(0,6);
      rotRival = [...equipoRival];
    }
    render();
  }
};

function renderRegistro() {
  if (!registro.length) return "";
  return `
    <div class="registro-acciones">
      <b style="font-size:1.14em;">Registro</b>
      <table>
        <tr>
          <th>#</th><th>Equipo</th><th>Jugador</th><th>Acción</th><th>Zona</th><th>Subzona</th><th>Resultado</th><th>Puntos</th>
        </tr>
        ${registro.map((r,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${r.equipo}</td>
            <td>${r.jugador.dorsal} - ${r.jugador.nombre}</td>
            <td>${r.accion}</td>
            <td>${r.lado=="local"?"L":"R"}${r.zona}</td>
            <td>${r.subzona}</td>
            <td>${r.resultado}</td>
            <td>${r.puntosLocal} - ${r.puntosRival}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
}

render();

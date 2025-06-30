// === Datos del partido ===
let partido = {
  nombre: "",
  fecha: "",
  lugar: "",
  equipoLocal: "Local",
  equipoVisita: "Visita"
};

// === Planteles ===
let plantelLocal = [
  { nombre: "Juan", dorsal: 1, rol: "C" },
  { nombre: "Pedro", dorsal: 2, rol: "R" },
  { nombre: "Luis", dorsal: 3, rol: "Z" },
  { nombre: "Carlos", dorsal: 4, rol: "O" },
  { nombre: "Mateo", dorsal: 5, rol: "R" },
  { nombre: "Fede", dorsal: 7, rol: "L" }
];
let plantelVisita = [
  { nombre: "Ale", dorsal: 11, rol: "C" },
  { nombre: "Maxi", dorsal: 12, rol: "R" },
  { nombre: "Leo", dorsal: 13, rol: "Z" },
  { nombre: "Santi", dorsal: 14, rol: "O" },
  { nombre: "Tobias", dorsal: 15, rol: "R" },
  { nombre: "Bruno", dorsal: 17, rol: "L" }
];

// === En cancha ===
let enPista = [...plantelLocal];
let marcador = { local: 0, rival: 0 };
let registro = [];

let accionSel = null;
let jugadorSel = null;
let zonaOrigen = null;
let zonaDestino = null;

function render() {
  if (!partido.nombre || !partido.fecha) {
    renderDatosPartido();
    return;
  }
  // Panel principal
  document.getElementById('app').innerHTML = `
    <div class="titulo">${partido.nombre || "ClickVoley"}</div>
    <div style="text-align:center; margin-bottom: 0.6em; font-size:1.1em;">
      <b>${partido.equipoLocal}</b> vs <b>${partido.equipoVisita}</b> | Fecha: ${partido.fecha} | Lugar: ${partido.lugar}
      <button style="margin-left:2em" onclick="editarDatosPartido()">Editar datos</button>
    </div>
    <div class="acciones-panel">
      <select id="jugSelect">${enPista.map((j,i)=>`<option value="${i}"${jugadorSel===i?' selected':''}>${j.dorsal} - ${j.nombre}</option>`).join('')}</select>
      ${["Saque","Recepción","Ataque","Bloqueo","Defensa","Contraataque","Error"].map(a=>
        `<button onclick="setAccion('${a}')" class="${accionSel===a?'selected':''}">${a}</button>`
      ).join('')}
    </div>
    <div style="text-align:center;margin-bottom:1em;">1. Selecciona jugador | 2. Acción | 3. Zona de origen propia | 4. Zona destino rival</div>
    <div class="pista-lateral" id="pista">
      ${renderPistaVoley(zonaOrigen, zonaDestino)}
    </div>
    <div class="marcador">
      <span class="local">${partido.equipoLocal}</span> ${marcador.local} - ${marcador.rival} <span class="rival">${partido.equipoVisita}</span>
    </div>
    ${renderStats()}
    <div class="registro-acciones">
      <b style="font-size:1.14em;">Registro de Acciones</b>
      <table>
        <tr>
          <th>#</th><th>Set</th><th>Acción</th><th>Jugador</th><th>Origen</th><th>Destino</th><th>Resultado</th><th>Borrar</th>
        </tr>
        ${registro.map((r,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${r.set||1}</td>
            <td>${r.accion}</td>
            <td>${r.jugador? r.jugador.dorsal+" "+r.jugador.nombre : "-"}</td>
            <td>${r.zonaOrigen||"-"}</td>
            <td>${r.zonaDestino||"-"}</td>
            <td>${r.resultado||"-"}</td>
            <td><button onclick="borrarAccion(${i})">✗</button></td>
          </tr>
        `).join('')}
      </table>
      <button class="export-btn" onclick="exportarExcel()">Exportar Excel</button>
      <button class="export-btn" onclick="exportarPDF()">Exportar PDF</button>
    </div>
  `;
  document.getElementById('jugSelect').onchange = (e) => {
    jugadorSel = parseInt(e.target.value);
    render();
  };
}

// ==================== DATOS PARTIDO ====================
function renderDatosPartido() {
  document.getElementById('app').innerHTML = `
    <div class="titulo">Datos del Partido - ClickVoley</div>
    <form id="formPartido" style="max-width:420px;margin:2em auto;font-size:1.12em;">
      <label>Nombre del partido: <input required name="nombre" style="width:100%"/></label><br>
      <label>Fecha y hora: <input required name="fecha" type="datetime-local" style="width:100%"/></label><br>
      <label>Lugar: <input name="lugar" style="width:100%"/></label><br>
      <label>Equipo local: <input required name="equipoLocal" value="Local" style="width:100%"/></label><br>
      <label>Equipo visitante: <input required name="equipoVisita" value="Visita" style="width:100%"/></label><br>
      <div style="margin-top:1.3em;"><b>Plantel Local:</b> <button type="button" onclick="editarPlantel('local')">Editar</button></div>
      <div>${renderPlantelForm(plantelLocal)}</div>
      <div style="margin-top:1.3em;"><b>Plantel Visitante:</b> <button type="button" onclick="editarPlantel('visita')">Editar</button></div>
      <div>${renderPlantelForm(plantelVisita)}</div>
      <br>
      <button type="submit" style="padding:0.7em 2em;font-size:1.1em;">Comenzar Partido</button>
    </form>
  `;
  document.getElementById('formPartido').onsubmit = (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    partido.nombre = fd.get('nombre');
    partido.fecha = fd.get('fecha');
    partido.lugar = fd.get('lugar');
    partido.equipoLocal = fd.get('equipoLocal');
    partido.equipoVisita = fd.get('equipoVisita');
    enPista = [...plantelLocal];
    render();
  };
}
window.editarDatosPartido = function() {
  partido.nombre = "";
  render();
};
function renderPlantelForm(plantel) {
  return `<ol>${plantel.map(j=>`<li>${j.dorsal} - ${j.nombre} (${j.rol})</li>`).join('')}</ol>`;
}
window.editarPlantel = function(tipo) {
  let plantel = tipo==='local'?plantelLocal:plantelVisita;
  let nombres = prompt("Ingresa los jugadores como: dorsal,nombre,rol por línea\nEj:\n1,Juan,C\n2,Luis,Z", plantel.map(j=>`${j.dorsal},${j.nombre},${j.rol}`).join('\n'));
  if (nombres!==null) {
    let nuevo = nombres.split('\n').map(line=>{
      let [dorsal,nombre,rol] = line.split(',');
      return {dorsal:dorsal.trim(),nombre:nombre.trim(),rol:rol.trim()};
    }).filter(j=>j.nombre);
    if (tipo==='local') plantelLocal = nuevo;
    else plantelVisita = nuevo;
  }
  renderDatosPartido();
};

// =============== PISTA DE VOLEY SVG ================
function renderPistaVoley(origen, destino) {
  // Zonas propias (abajo), zonas rivales (arriba)
  const zonas = [
    {x:110, y:210, n:5}, {x:290, y:210, n:6}, {x:470, y:210, n:1},
    {x:110, y:125, n:4}, {x:290, y:125, n:3}, {x:470, y:125, n:2},
    // Zonas rivales
    {x:110, y:40, n:'5r'}, {x:290, y:40, n:'6r'}, {x:470, y:40, n:'1r'},
    {x:110, y:125, n:'4r'}, {x:290, y:125, n:'3r'}, {x:470, y:125, n:'2r'},
  ];
  return `
    <svg width="600" height="300" style="display:block;margin:auto;" viewBox="0 0 600 300">
      <rect x="50" y="30" width="500" height="240" rx="18" fill="#fff" stroke="#1976d2" stroke-width="6"/>
      <line x1="50" y1="150" x2="550" y2="150" stroke="#ffd600" stroke-width="4"/>
      <line x1="216" y1="30" x2="216" y2="270" stroke="#355c9b" stroke-width="2"/>
      <line x1="384" y1="30" x2="384" y2="270" stroke="#355c9b" stroke-width="2"/>
      <line x1="50" y1="90" x2="550" y2="90" stroke="#355c9b" stroke-width="2"/>
      <line x1="50" y1="210" x2="550" y2="210" stroke="#355c9b" stroke-width="2"/>
      ${zonas.map(z=>`
        <circle cx="${z.x}" cy="${z.y}" r="26" fill="${
          (origen==z.n)?'#ffe066':
          (destino==z.n)?'#43ea53':
          (typeof z.n==='string' && destino==z.n.replace('r',''))?'#43ea53':'#fafdff'
        }" stroke="#1976d2" stroke-width="2"
        onclick="clickZona('${z.n}')"
        style="cursor:pointer;"
        />
        <text x="${z.x}" y="${z.y+6}" text-anchor="middle" font-size="25" font-weight="bold" fill="#1976d2">${typeof z.n==='string'?z.n.replace('r',''):z.n}</text>
      `).join('')}
      <text x="300" y="20" text-anchor="middle" font-size="18" fill="#1976d2">${partido.equipoVisita}</text>
      <text x="300" y="295" text-anchor="middle" font-size="18" fill="#1976d2">${partido.equipoLocal}</text>
      <text x="300" y="150" text-anchor="middle" font-size="14" fill="#ffd600" font-weight="bold">RED</text>
    </svg>
    <div style="text-align:center;">
      Zona Propia: <b>${origen||"-"}</b> | Zona Rival: <b>${destino||"-"}</b>
      ${origen && destino && accionSel!==null && jugadorSel!==null ? `<button style="margin-left:2em;font-size:1.1em;" onclick="popupResultado()">Registrar acción</button>`:""}
    </div>
  `;
}
window.clickZona = function(n) {
  if (typeof n === "string" && n.endsWith("r")) {
    zonaDestino = n;
  } else {
    zonaOrigen = n;
  }
  render();
};

// ============ POPUP RESULTADO =============
window.popupResultado = function() {
  let popup = document.getElementById('popup');
  popup.style.display = "flex";
  popup.innerHTML = `
    <div class="popup-box" id="popupbox">
      <b>Resultado de la acción</b>
      <div style="margin-top:1em;">
        <button class="punto" id="puntoBtn">Punto</button>
        <button class="error" id="errorBtn">Error</button>
        <button class="neutral" id="neutralBtn">/</button>
        <button class="punto" id="doblePosBtn" style="background:#1976d2;color:#fff;">Doble positiva</button>
        <button class="error" id="dobleNegBtn" style="background:#b91c1c;">Doble negativa</button>
        <button style="margin-left:1em;background:#eee;color:#555;" onclick="cerrarPopup()">Cancelar</button>
      </div>
    </div>
  `;
  function guardar(tipo) {
    registro.push({
      set: 1,
      accion: accionSel,
      jugador: enPista[jugadorSel],
      zonaOrigen,
      zonaDestino,
      resultado: tipo
    });
    if(tipo==="Punto" || tipo==="Doble positiva") marcador.local++;
    if(tipo==="Error" || tipo==="Doble negativa") marcador.rival++;
    zonaOrigen = null; zonaDestino = null; accionSel = null;
    render();
    cerrarPopup();
  }
  document.getElementById("puntoBtn").onclick = ()=>guardar("Punto");
  document.getElementById("errorBtn").onclick = ()=>guardar("Error");
  document.getElementById("neutralBtn").onclick = ()=>guardar("Neutral");
  document.getElementById("doblePosBtn").onclick = ()=>guardar("Doble positiva");
  document.getElementById("dobleNegBtn").onclick = ()=>guardar("Doble negativa");
};
window.cerrarPopup = function() {
  document.getElementById('popup').style.display = "none";
};

window.setAccion = function(a) {
  accionSel = a;
  render();
};
window.borrarAccion = function(idx) {
  registro.splice(idx,1);
  render();
};

// =============== ESTADÍSTICAS ================
function renderStats() {
  const fund = ["Saque","Recepción","Ataque","Bloqueo","Defensa","Contraataque","Error"];
  let stats = {};
  fund.forEach(f=>stats[f]={punto:0,error:0,neutral:0,dp:0,dn:0,total:0});
  registro.forEach(r=>{
    if(r.jugador && fund.includes(r.accion)) {
      stats[r.accion].total++;
      if(r.resultado==="Punto") stats[r.accion].punto++;
      else if(r.resultado==="Error") stats[r.accion].error++;
      else if(r.resultado==="Doble positiva") stats[r.accion].dp++;
      else if(r.resultado==="Doble negativa") stats[r.accion].dn++;
      else stats[r.accion].neutral++;
    }
  });
  let jugStats = {};
  enPista.forEach(j=>{
    jugStats[j.dorsal] = {nombre:j.nombre, rol:j.rol, punto:0,error:0,neutral:0,dp:0,dn:0,total:0};
  });
  registro.forEach(r=>{
    if(r.jugador && jugStats[r.jugador.dorsal]) {
      jugStats[r.jugador.dorsal].total++;
      if(r.resultado==="Punto") jugStats[r.jugador.dorsal].punto++;
      else if(r.resultado==="Error") jugStats[r.jugador.dorsal].error++;
      else if(r.resultado==="Doble positiva") jugStats[r.jugador.dorsal].dp++;
      else if(r.resultado==="Doble negativa") jugStats[r.jugador.dorsal].dn++;
      else jugStats[r.jugador.dorsal].neutral++;
    }
  });
  return `
    <div class="stats-panel">
      <div class="stats-box">
        <div class="stats-title">Totales por Fundamento</div>
        <table>
          <tr><th>Fund.</th><th>++</th><th>+</th><th>-</th><th>--</th><th>/</th><th>Tot</th><th>Efic.</th></tr>
          ${fund.map(f=>`
            <tr>
              <td>${f}</td>
              <td>${stats[f].dp}</td>
              <td>${stats[f].punto}</td>
              <td>${stats[f].error}</td>
              <td>${stats[f].dn}</td>
              <td>${stats[f].neutral}</td>
              <td>${stats[f].total}</td>
              <td>${stats[f].total?(((stats[f].dp+stats[f].punto-stats[f].error-stats[f].dn)/stats[f].total)*100).toFixed(1):"0"}%</td>
            </tr>
          `).join('')}
        </table>
      </div>
      <div class="stats-box">
        <div class="stats-title">Totales por Jugador</div>
        <table>
          <tr><th>Dorsal</th><th>Nombre</th><th>Rol</th><th>++</th><th>+</th><th>-</th><th>--</th><th>/</th><th>Tot</th><th>Efic.</th></tr>
          ${Object.entries(jugStats).map(([d,j])=>`
            <tr>
              <td>${d}</td>
              <td>${j.nombre}</td>
              <td>${j.rol}</td>
              <td>${j.dp}</td>
              <td>${j.punto}</td>
              <td>${j.error}</td>
              <td>${j.dn}</td>
              <td>${j.neutral}</td>
              <td>${j.total}</td>
              <td>${j.total?(((j.dp+j.punto-j.error-j.dn)/j.total)*100).toFixed(1):"0"}%</td>
            </tr>
          `).join('')}
        </table>
      </div>
    </div>
  `;
}

// ============ EXPORTACIÓN EXCEL Y PDF ============
window.exportarExcel = function() {
  let sheetAcciones = [
    ["#", "Set", "Acción", "Jugador", "Origen", "Destino", "Resultado"]
  ];
  registro.forEach((r,i)=>{
    sheetAcciones.push([
      i+1, r.set||1, r.accion,
      r.jugador ? `${r.jugador.dorsal} ${r.jugador.nombre}` : "",
      r.zonaOrigen, r.zonaDestino, r.resultado
    ]);
  });
  let wb = XLSX.utils.book_new();
  wb.SheetNames.push("Acciones");
  wb.Sheets["Acciones"] = XLSX.utils.aoa_to_sheet(sheetAcciones);
  XLSX.writeFile(wb, "clickvoley.xlsx");
};

window.exportarPDF = function() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF('l', 'pt', 'a4');
  let title = "ClickVoley - Acciones y Estadísticas";
  doc.setFontSize(18);
  doc.text(title, 40, 40);

  // Datos partido
  doc.setFontSize(12);
  doc.text(`Partido: ${partido.nombre || ""}`, 40, 60);
  doc.text(`Fecha: ${partido.fecha || ""} | Lugar: ${partido.lugar || ""}`, 40, 75);
  doc.text(`Equipos: ${partido.equipoLocal} vs ${partido.equipoVisita}`, 40, 90);

  // Tabla de Acciones
  let accionesData = registro.map((r,i)=>[
    i+1, r.set||1, r.accion,
    r.jugador ? `${r.jugador.dorsal} ${r.jugador.nombre}` : "",
    r.zonaOrigen, r.zonaDestino, r.resultado
  ]);
  doc.setFontSize(14);
  doc.autoTable({
    startY: 110,
    head: [["#", "Set", "Acción", "Jugador", "Origen", "Destino", "Resultado"]],
    body: accionesData,
    margin: { left:40, right:40 },
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [25, 118, 210] }
  });

  // Tabla de estadísticas por fundamento
  const fund = ["Saque","Recepción","Ataque","Bloqueo","Defensa","Contraataque","Error"];
  let stats = {};
  fund.forEach(f=>stats[f]={punto:0,error:0,neutral:0,dp:0,dn:0,total:0});
  registro.forEach(r=>{
    if(r.jugador && fund.includes(r.accion)) {
      stats[r.accion].total++;
      if(r.resultado==="Punto") stats[r.accion].punto++;
      else if(r.resultado==="Error") stats[r.accion].error++;
      else if(r.resultado==="Doble positiva") stats[r.accion].dp++;
      else if(r.resultado==="Doble negativa") stats[r.accion].dn++;
      else stats[r.accion].neutral++;
    }
  });
  let statsFundData = fund.map(f=>{
    let efi = stats[f].total?(((stats[f].dp+stats[f].punto-stats[f].error-stats[f].dn)/stats[f].total)*100).toFixed(1):"0";
    return [f, stats[f].dp, stats[f].punto, stats[f].error, stats[f].dn, stats[f].neutral, stats[f].total, efi+"%"];
  });
  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 110 + (accionesData.length+1)*20;
  doc.text("Estadísticas por Fundamento", 40, finalY);
  doc.autoTable({
    startY: finalY+10,
    head: [["Fundamento","++","+","-","--","/","Total","Eficiencia"]],
    body: statsFundData,
    margin: { left:40, right:40 },
    styles: { fontSize: 11, cellPadding: 3 },
    headStyles: { fillColor: [25, 118, 210] }
  });

  // Tabla de estadísticas por jugador
  let jugStats = {};
  enPista.forEach(j=>{
    jugStats[j.dorsal] = {nombre:j.nombre, rol:j.rol, punto:0,error:0,neutral:0,dp:0,dn:0,total:0};
  });
  registro.forEach(r=>{
    if(r.jugador && jugStats[r.jugador.dorsal]) {
      jugStats[r.jugador.dorsal].total++;
      if(r.resultado==="Punto") jugStats[r.jugador.dorsal].punto++;
      else if(r.resultado==="Error") jugStats[r.jugador.dorsal].error++;
      else if(r.resultado==="Doble positiva") jugStats[r.jugador.dorsal].dp++;
      else if(r.resultado==="Doble negativa") jugStats[r.jugador.dorsal].dn++;
      else jugStats[r.jugador.dorsal].neutral++;
    }
  });
  let statsJugData = Object.entries(jugStats).map(([d,j])=>{
    let efi = j.total?(((j.dp+j.punto-j.error-j.dn)/j.total)*100).toFixed(1):"0";
    return [d, j.nombre, j.rol, j.dp, j.punto, j.error, j.dn, j.neutral, j.total, efi+"%"];
  });
  let finalY2 = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : finalY + (statsFundData.length+1)*20;
  doc.text("Estadísticas por Jugador", 40, finalY2);
  doc.autoTable({
    startY: finalY2+10,
    head: [["Dorsal","Nombre","Rol","++","+","-","--","/","Total","Eficiencia"]],
    body: statsJugData,
    margin: { left:40, right:40 },
    styles: { fontSize: 11, cellPadding: 3 },
    headStyles: { fillColor: [25, 118, 210] }
  });

  doc.save("clickvoley.pdf");
};

render();

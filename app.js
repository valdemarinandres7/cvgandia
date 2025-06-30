// Configuración inicial
let partido = {
  nombre: "",
  fecha: "",
  lugar: "",
  equipoLocal: "Local",
  equipoVisita: "Visita"
};

let plantelLocal = [
  { nombre: "Juan", dorsal: 1, rol: "C" },
  { nombre: "Pedro", dorsal: 2, rol: "R" },
  { nombre: "Luis", dorsal: 3, rol: "Z" },
  { nombre: "Carlos", dorsal: 4, rol: "O" },
  { nombre: "Mateo", dorsal: 5, rol: "R" },
  { nombre: "Fede", dorsal: 7, rol: "L" }
];

let enPista = [plantelLocal[0],plantelLocal[1],plantelLocal[2],plantelLocal[3],plantelLocal[4],plantelLocal[5]]; // posiciones 1-6
let marcador = { local: 0, rival: 0 };
let registro = [];

let accionSel = null;
let jugadorSel = null;
let zonaDestino = null;

// --- Render principal ---
function render() {
  if (!partido.nombre || !partido.fecha) {
    renderDatosPartido();
    return;
  }
  document.getElementById('app').innerHTML = `
    <div class="titulo">${partido.nombre}</div>
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
    <div style="text-align:center;margin-bottom:1em;">1. Selecciona jugador | 2. Acción | 3. Haz click en zona destino rival</div>
    <div class="pista-container">
      ${renderPistaVoley()}
    </div>
    <div class="marcador">
      <span class="local">${partido.equipoLocal}</span> ${marcador.local} - ${marcador.rival} <span class="rival">${partido.equipoVisita}</span>
    </div>
    ${renderStats()}
    <div class="registro-acciones">
      <b style="font-size:1.14em;">Registro de Acciones</b>
      <table>
        <tr>
          <th>#</th><th>Set</th><th>Acción</th><th>Jugador</th><th>Zona destino</th><th>Resultado</th><th>Borrar</th>
        </tr>
        ${registro.map((r,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${r.set||1}</td>
            <td>${r.accion}</td>
            <td>${r.jugador? r.jugador.dorsal+" "+r.jugador.nombre : "-"}</td>
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
  renderDarkToggle();
  document.getElementById('jugSelect').onchange = (e) => {
    jugadorSel = parseInt(e.target.value);
    render();
  };
}

// --- Formulario datos partido ---
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
    enPista = plantelLocal.slice(0,6);
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
  }
  renderDatosPartido();
};

// --- PISTA DE VOLEY SVG CON JUGADORES DISTRIBUIDOS ---
function renderPistaVoley() {
  // Posiciones oficiales (coordenadas para 6 vs 6)
  const posLocal = [
    {x:150, y:340}, // zona 1
    {x:325, y:340}, // zona 6
    {x:500, y:340}, // zona 5
    {x:150, y:250}, // zona 2
    {x:325, y:250}, // zona 3
    {x:500, y:250}, // zona 4
  ];
  const posRival = [
    {x:150, y:70},
    {x:325, y:70},
    {x:500, y:70},
    {x:150, y:160},
    {x:325, y:160},
    {x:500, y:160},
  ];
  // Zonas destino (rival)
  const zonasRival = [
    {label: '1', x:90, y:40, n:"1"}, {label:'2', x:270, y:40, n:"2"}, {label:'3', x:450, y:40, n:"3"},
    {label: '4', x:90, y:130, n:"4"}, {label:'5', x:270, y:130, n:"5"}, {label:'6', x:450, y:130, n:"6"},
  ];
  let svg = `
    <div style="position:relative;width:100%;height:420px;">
    <svg class="pista-voley-svg" width="1000" height="420" viewBox="0 0 700 420">
      <rect x="40" y="30" width="620" height="360" rx="22" fill="#fff" stroke="#ffda47" stroke-width="8"/>
      <rect x="40" y="210" width="620" height="4" fill="#ffda47"/>
      <line x1="246.6" y1="30" x2="246.6" y2="390" stroke="#23263a" stroke-width="3"/>
      <line x1="453.3" y1="30" x2="453.3" y2="390" stroke="#23263a" stroke-width="3"/>
      <text x="350" y="22" text-anchor="middle" font-size="16" fill="#ffda47" font-weight="bold">${partido.equipoVisita}</text>
      <text x="350" y="410" text-anchor="middle" font-size="16" fill="#ffda47" font-weight="bold">${partido.equipoLocal}</text>
      <text x="350" y="225" text-anchor="middle" font-size="16" fill="#ffda47" font-weight="bold">RED</text>
      ${zonasRival.map(z=>`
        <rect x="${z.x}" y="${z.y}" width="160" height="90" rx="12"
          fill="${zonaDestino==z.n?'#ffe066':'#fafdff'}" stroke="#0ea5e9" stroke-width="3"
          style="cursor:pointer"
          onclick="clickZonaDestino('${z.n}')"/>
        <text x="${z.x+80}" y="${z.y+55}" text-anchor="middle" font-size="35" font-weight="bold"
        fill="#0ea5e9" style="pointer-events:none">${z.label}</text>
      `).join('')}
    </svg>
    ${
      enPista.map((j,i)=>`
      <div class="jugador-campo${jugadorSel===i?' selected':''}"
        onclick="seleccionarJugador(${i})"
        style="left:${posLocal[i].x-32}px;top:${posLocal[i].y-32}px;z-index:10;">
        ${j.dorsal}<span style="font-size:0.97em;line-height:1">${j.rol}</span>
      </div>
      `).join('')
    }
    </div>
  `;
  // Si todo listo, muestra botón registrar
  svg += `
    <div style="text-align:center;">
      Zona destino: <b>${zonaDestino||"-"}</b>
      ${zonaDestino && accionSel!==null && jugadorSel!==null ? `<button style="margin-left:2em;font-size:1.1em;" onclick="popupResultado()">Registrar acción</button>`:""}
    </div>
  `;
  return svg;
}
window.clickZonaDestino = function(n) {
  zonaDestino = n;
  render();
};
window.seleccionarJugador = function(idx) {
  jugadorSel = idx;
  render();
};

// --- Popup resultado acción ---
window.popupResultado = function() {
  let popup = document.getElementById('popup');
  popup.style.display = "flex";
  popup.innerHTML = `
    <div class="popup-box" id="popupbox">
      <b>Resultado de la acción</b>
      <div style="margin-top:1em;display:flex;gap:10px;">
        <button class="punto" id="puntoBtn">Punto</button>
        <button class="error" id="errorBtn">Error</button>
        <button class="neutral" id="neutralBtn">/</button>
        <button class="punto" id="doblePosBtn" style="background:#1976d2;color:#fff;">Doble positiva</button>
        <button class="error" id="dobleNegBtn" style="background:#b91c1c;">Doble negativa</button>
      </div>
      <div class="popup-footer">
        <button style="margin-top:1.2em;background:#eee;color:#555;" onclick="cerrarPopup()">Cancelar</button>
      </div>
    </div>
  `;
  function guardar(tipo) {
    registro.push({
      set: 1,
      accion: accionSel,
      jugador: enPista[jugadorSel],
      zonaDestino,
      resultado: tipo
    });
    if(tipo==="Punto" || tipo==="Doble positiva") marcador.local++;
    if(tipo==="Error" || tipo==="Doble negativa") marcador.rival++;
    zonaDestino = null; accionSel = null;
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

// --- Estadísticas (igual que antes) ---
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

// --- Exportación Excel/PDF (igual que antes) ---
window.exportarExcel = function() {
  let sheetAcciones = [
    ["#", "Set", "Acción", "Jugador", "Zona destino", "Resultado"]
  ];
  registro.forEach((r,i)=>{
    sheetAcciones.push([
      i+1, r.set||1, r.accion,
      r.jugador ? `${r.jugador.dorsal} ${r.jugador.nombre}` : "",
      r.zonaDestino, r.resultado
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
    r.zonaDestino, r.resultado
  ]);
  doc.setFontSize(14);
  doc.autoTable({
    startY: 110,
    head: [["#", "Set", "Acción", "Jugador", "Zona destino", "Resultado"]],
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

// --- Dark mode ---
let dark = true;
function renderDarkToggle() {
  if (!document.getElementById('dark-toggle')) {
    const btn = document.createElement('button');
    btn.className = "dark-toggle-btn";
    btn.id = "dark-toggle";
    btn.innerText = dark ? "☀ Modo Claro" : "🌙 Modo Oscuro";
    btn.onclick = ()=>{
      dark = !dark;
      document.body.classList.toggle('dark', dark);
      btn.innerText = dark ? "☀ Modo Claro" : "🌙 Modo Oscuro";
    };
    document.body.appendChild(btn);
  } else {
    document.getElementById('dark-toggle').innerText = dark ? "☀ Modo Claro" : "🌙 Modo Oscuro";
    document.body.classList.toggle('dark', dark);
  }
}

// --- Inicializa ---
render();

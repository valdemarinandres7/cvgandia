let enPista = [
  { nombre: "Juan", dorsal: 1, rol: "C" },
  { nombre: "Pedro", dorsal: 2, rol: "R" },
  { nombre: "Luis", dorsal: 3, rol: "Z" },
  { nombre: "Carlos", dorsal: 4, rol: "O" },
  { nombre: "Mateo", dorsal: 5, rol: "R" },
  { nombre: "Fede", dorsal: 7, rol: "L" }
];
let enPistaRival = [
  { nombre: "Ale", dorsal: 11, rol: "C" },
  { nombre: "Maxi", dorsal: 12, rol: "R" },
  { nombre: "Leo", dorsal: 13, rol: "Z" },
  { nombre: "Santi", dorsal: 14, rol: "O" },
  { nombre: "Tobias", dorsal: 15, rol: "R" },
  { nombre: "Bruno", dorsal: 17, rol: "L" }
];
let marcador = { local: 0, rival: 0 };
let registro = [];

const posCoords = [
  {x:150, y:210},{x:300, y:210},{x:450, y:210},{x:600, y:210},{x:750, y:210},{x:890, y:210}
];
const posCoordsRival = [
  {x:150, y:70},{x:300, y:70},{x:450, y:70},{x:600, y:70},{x:750, y:70},{x:890, y:70}
];

let accionSel = null;

function render() {
  document.getElementById('app').innerHTML = `
    <div class="titulo">ClickVoley</div>
    <div class="acciones-panel">
      ${["Saque","Recepción","Ataque","Bloqueo","Defensa","Contraataque","Error"].map(a=>
        `<button onclick="setAccion('${a}')" class="${accionSel===a?'selected':''}">${a}</button>`
      ).join('')}
    </div>
    <div class="pista-lateral" id="pista">
      <svg class="pista-svg" width="950" height="285" viewBox="0 0 950 285">
        <rect x="60" y="30" width="830" height="225" rx="20" fill="#fafdff" stroke="#1976d2" stroke-width="8"/>
        <line x1="60" y1="142.5" x2="890" y2="142.5" stroke="#ffd600" stroke-width="4"/>
        <rect x="60" y="142.5" width="830" height="45" fill="#a7b8d9" fill-opacity="0.18"/>
        <rect x="60" y="97.5" width="830" height="45" fill="#f87171" fill-opacity="0.10"/>
        <rect x="60" y="30" width="830" height="225" rx="20" fill="none" stroke="#355c9b" stroke-width="3"/>
        ${registro.map(r=>`
          <circle cx="${r.x}" cy="${r.y}" r="11" fill="${r.resultado==='Punto'?'#43ea53':r.resultado==='Error'?'#e57373':r.resultado==='Doble positiva'?'#1976d2':r.resultado==='Doble negativa'?'#b91c1c':'#ffd600'}" opacity="0.7"/>
        `).join('')}
      </svg>
      ${enPista.map((j,i)=>`
        <div class="jugador-campo"
          style="left:${posCoords[i].x-27}px;top:${posCoords[i].y-27}px;"
        >${j.dorsal}<span style="font-size:0.91em;line-height:1">${j.rol}</span></div>
      `).join('')}
      ${enPistaRival.map((j,i)=>`
        <div class="jugador-campo rival"
          style="left:${posCoordsRival[i].x-27}px;top:${posCoordsRival[i].y-27}px;"
        >${j.dorsal}<span style="font-size:0.91em;line-height:1">${j.rol}</span></div>
      `).join('')}
    </div>
    <div class="marcador">
      <span class="local">Local</span> ${marcador.local} - ${marcador.rival} <span class="rival">Rival</span>
    </div>
    ${renderStats()}
    <div class="registro-acciones">
      <b style="font-size:1.14em;">Registro de Acciones</b>
      <table>
        <tr>
          <th>#</th><th>Set</th><th>Acción</th><th>Realizador</th><th>Rival</th><th>Resultado</th><th>Sector</th><th>Borrar</th>
        </tr>
        ${registro.map((r,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${r.set||1}</td>
            <td>${r.accion}</td>
            <td>${r.jugador? r.jugador.dorsal+" "+r.jugador.rol : "-"}</td>
            <td>${r.rival? r.rival.dorsal+" "+r.rival.rol : "-"}</td>
            <td>${r.resultado}</td>
            <td>(${Math.round(r.x)},${Math.round(r.y)})</td>
            <td><button onclick="borrarAccion(${i})">✗</button></td>
          </tr>
        `).join('')}
      </table>
      <button class="export-btn" onclick="exportarExcel()">Exportar Excel</button>
      <button class="export-btn" onclick="exportarPDF()">Exportar PDF</button>
    </div>
  `;
  let pista = document.getElementById('pista');
  pista.onclick = function(ev) {
    if(!accionSel) return;
    let rect = pista.getBoundingClientRect();
    let x = ev.clientX - rect.left;
    let y = ev.clientY - rect.top;
    showPopup(x,y);
  };
}

window.setAccion = function(a) {
  accionSel = a;
  render();
};

window.borrarAccion = function(idx) {
  registro.splice(idx,1);
  render();
};

function showPopup(x,y) {
  let popup = document.getElementById('popup');
  popup.style.display = "flex";
  popup.innerHTML = `
    <div class="popup-box" id="popupbox">
      <label>¿Quién realizó la acción?</label>
      <div class="jug-list">
        ${enPista.map((j,i)=>`
          <button class="jug-btn" id="jug${i}">${j.dorsal} ${j.rol}</button>
        `).join('')}
      </div>
      <label>¿A qué rival?</label>
      <div class="jug-list">
        ${enPistaRival.map((j,i)=>`
          <button class="jug-btn" id="rival${i}">${j.dorsal} ${j.rol}</button>
        `).join('')}
      </div>
      <div class="popup-footer">
        <button class="punto" id="puntoBtn">Punto</button>
        <button class="error" id="errorBtn">Error</button>
        <button class="neutral" id="neutralBtn">/</button>
        <button class="punto" id="doblePosBtn" style="background:#1976d2;color:#fff;">Doble positiva</button>
        <button class="error" id="dobleNegBtn" style="background:#b91c1c;">Doble negativa</button>
        <button style="margin-left:1em;background:#eee;color:#555;" onclick="cerrarPopup()">Cancelar</button>
      </div>
    </div>
  `;
  let jugadorIdx = null;
  let rivalIdx = null;
  enPista.forEach((j,i)=>{
    document.getElementById(`jug${i}`).onclick = function(){
      jugadorIdx = i;
      enPista.forEach((_,ii)=>document.getElementById(`jug${ii}`).classList.toggle("selected",ii===i));
    }
  });
  enPistaRival.forEach((j,i)=>{
    document.getElementById(`rival${i}`).onclick = function(){
      rivalIdx = i;
      enPistaRival.forEach((_,ii)=>document.getElementById(`rival${ii}`).classList.toggle("selected",ii===i));
    }
  });
  function guardar(tipo) {
    if(jugadorIdx===null || rivalIdx===null) return;
    let jugador = enPista[jugadorIdx];
    let rival = enPistaRival[rivalIdx];
    registro.push({set: 1, accion:accionSel, jugador, rival, resultado:tipo, x, y});
    if(tipo==="Punto" || tipo==="Doble positiva") marcador.local++;
    if(tipo==="Error" || tipo==="Doble negativa") marcador.rival++;
    if(accionSel==="Saque" && (tipo==="Punto" || tipo==="Doble positiva")) {
      enPista.unshift(enPista.pop());
    }
    render();
    cerrarPopup();
  }
  document.getElementById("puntoBtn").onclick = ()=>guardar("Punto");
  document.getElementById("errorBtn").onclick = ()=>guardar("Error");
  document.getElementById("neutralBtn").onclick = ()=>guardar("Neutral");
  document.getElementById("doblePosBtn").onclick = ()=>guardar("Doble positiva");
  document.getElementById("dobleNegBtn").onclick = ()=>guardar("Doble negativa");
}
window.cerrarPopup = function() {
  document.getElementById('popup').style.display = "none";
};

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

window.exportarExcel = function() {
  let sheetAcciones = [
    ["#", "Set", "Acción", "Realizador", "Rival", "Resultado", "X", "Y"]
  ];
  registro.forEach((r,i)=>{
    sheetAcciones.push([
      i+1, r.set||1, r.accion,
      r.jugador ? `${r.jugador.dorsal} ${r.jugador.rol}` : "",
      r.rival ? `${r.rival.dorsal} ${r.rival.rol}` : "",
      r.resultado, Math.round(r.x), Math.round(r.y)
    ]);
  });
  let wb = XLSX.utils.book_new();
  wb.SheetNames.push("Acciones");
  wb.Sheets["Acciones"] = XLSX.utils.aoa_to_sheet(sheetAcciones);
  const fund = ["Saque","Recepción","Ataque","Bloqueo","Defensa","Contraataque","Error"];
  let statsSheet = [["Fundamento","++","+","-","--","/","Total","Eficiencia"]];
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
  fund.forEach(f=>{
    let efi = stats[f].total?(((stats[f].dp+stats[f].punto-stats[f].error-stats[f].dn)/stats[f].total)*100).toFixed(1):"0";
    statsSheet.push([f,stats[f].dp,stats[f].punto,stats[f].error,stats[f].dn,stats[f].neutral,stats[f].total,efi+"%"]);
  });
  wb.SheetNames.push("StatsFund");
  wb.Sheets["StatsFund"] = XLSX.utils.aoa_to_sheet(statsSheet);
  XLSX.writeFile(wb, "clickvoley.xlsx");
};

// === Exportación PDF (acciones + stats) ===
window.exportarPDF = function() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF('l', 'pt', 'a4');
  let title = "ClickVoley - Acciones y Estadísticas";
  doc.setFontSize(18);
  doc.text(title, 40, 40);

  // Tabla de Acciones
  let accionesData = registro.map((r,i)=>[
    i+1, r.set||1, r.accion,
    r.jugador ? `${r.jugador.dorsal} ${r.jugador.rol}` : "",
    r.rival ? `${r.rival.dorsal} ${r.rival.rol}` : "",
    r.resultado, Math.round(r.x), Math.round(r.y)
  ]);
  doc.setFontSize(14);
  doc.text("Tabla de Acciones", 40, 75);
  doc.autoTable({
    startY: 85,
    head: [["#", "Set", "Acción", "Realizador", "Rival", "Resultado", "X", "Y"]],
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
  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 85 + (accionesData.length+1)*20;
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

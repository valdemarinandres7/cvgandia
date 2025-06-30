// ...todo el código JS que te pasé en la respuesta anterior, incluyendo la función exportarPDF...

// === Exportación PDF (acciones + stats) ===
window.exportarPDF = function() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF('l', 'pt', 'a4');
  let title = "Scout Voleibol PRO - Acciones y Estadísticas";
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

  doc.save("scout_volley.pdf");
};

// ...resto de tu código render, acciones, etc...
render();

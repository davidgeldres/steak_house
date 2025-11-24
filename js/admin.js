// admin.js - Panel admin con control real de reservas
document.addEventListener("DOMContentLoaded", ()=>{

  const u = requireRole("admin");
  const welcome = document.getElementById("adminWelcome");
  if(u && welcome){
    welcome.textContent = `Sesión iniciada como ${u.username}`;
  }

  // Navegación (pestañas)
  const links = document.querySelectorAll(".sb-link");
  const sections = {
    reservas: document.getElementById("view-reservas"),
    mesas: document.getElementById("view-mesas")
  };
  links.forEach(link=>{
    link.addEventListener("click", ()=>{
      links.forEach(l=>l.classList.remove("active"));
      link.classList.add("active");
      const v = link.dataset.view;
      Object.keys(sections).forEach(k=>{
        sections[k].classList.toggle("active", k === v);
      });
    });
  });

  // Logout
  document.getElementById("btnLogoutAdmin").addEventListener("click", ()=>{
    clearCurrentUser();
    showToast("Sesión cerrada","Has salido del panel administrador.","info");
    setTimeout(()=> window.location.href="index.html", 700);
  });

  // --------------------------
  // RESERVAS
  // --------------------------

  const LS_KEY = "rsh_reservas_demo";
  const tbody = document.getElementById("adminResBody");

  function getReservas(){
    try{
      return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    }catch{
      return [];
    }
  }

  function saveReservas(arr){
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  }

  function pintarReservas(){
    const reservas = getReservas();
    tbody.innerHTML = "";

    if(reservas.length === 0){
      tbody.innerHTML = `<tr><td colspan="7" class="muted">No hay reservas registradas.</td></tr>`;
      return;
    }

    reservas.forEach(r=>{
      const tr = document.createElement("tr");

      const estadoBadge = `
        <span class="badge ${
          r.estado === "confirmada" ? "ok" :
          r.estado === "cancelada" ? "error" :
          "pending"
        }">${r.estado}</span>
      `;

      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.cliente}</td>
        <td>${r.fecha}</td>
        <td>${r.hora}</td>
        <td>${r.personas}</td>
        <td>${estadoBadge}</td>
        <td>
          <button class="btn tiny confirm" data-id="${r.id}">✔</button>
          <button class="btn tiny cancel" data-id="${r.id}">✖</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    asignarClicks();
  }

  function asignarClicks(){
    document.querySelectorAll(".confirm").forEach(b=>{
      b.addEventListener("click", ()=>{
        cambiarEstado(b.dataset.id, "confirmada");
      });
    });

    document.querySelectorAll(".cancel").forEach(b=>{
      b.addEventListener("click", ()=>{
        cambiarEstado(b.dataset.id, "cancelada");
      });
    });
  }

  function cambiarEstado(id, nuevoEstado){
    const reservas = getReservas();
    const r = reservas.find(x => x.id == id);

    if(r){
      r.estado = nuevoEstado;
      saveReservas(reservas);
      pintarReservas();

      showToast(
        "Estado actualizado",
        `La reserva #${id} ahora está ${nuevoEstado}.`,
        nuevoEstado === "confirmada" ? "success" : "error"
      );
    }
  }

  pintarReservas();

  // --------------------------
  // MESAS (DEMO)
  // --------------------------
  const mesasGrid = document.getElementById("mesasGrid");
  for(let i=1; i<=12; i++){
    const card = document.createElement("div");
    card.className = "mesa-card";
    card.innerHTML = `
      <strong>Mesa ${i}</strong><br>
      <span class="muted">
        Capacidad: ${ i < 5 ? 2 : i < 9 ? 4 : 6}
      </span>
    `;
    mesasGrid.appendChild(card);
  }

});

// cliente.js - Panel cliente
document.addEventListener("DOMContentLoaded", ()=>{

  const u = requireRole("cliente");
  const welcome = document.getElementById("clienteWelcome");
  if(u && welcome){
    welcome.textContent = `Bienvenido, ${u.username}. Aquí puedes gestionar tus reservas.`;
  }

  // Tabs
  const links = document.querySelectorAll(".sb-link");
  const sections = {
    nueva: document.getElementById("view-nueva"),
    mis: document.getElementById("view-mis")
  };
  links.forEach(link=>{
    link.addEventListener("click", ()=>{
      links.forEach(l=>l.classList.remove("active"));
      link.classList.add("active");
      const v = link.dataset.view;
      Object.keys(sections).forEach(k=>{
        sections[k].classList.toggle("active", k===v);
      });
    });
  });

  // Logout
  document.getElementById("btnLogoutCliente").addEventListener("click", ()=>{
    clearCurrentUser();
    showToast("Sesión cerrada","Has salido correctamente.","info");
    setTimeout(()=> window.location.href="index.html", 700);
  });

  // DEMO reserva
  const form = document.getElementById("clienteReservaForm");
  const lista = document.getElementById("misReservasLista");
  const reservasLSKey = "rsh_reservas_demo";

  function getReservas(){
    try{
      return JSON.parse(localStorage.getItem(reservasLSKey)) || [];
    }catch{
      return [];
    }
  }

  function saveReservas(data){
    localStorage.setItem(reservasLSKey, JSON.stringify(data));
  }

  function pintarReservas(){
    const all = getReservas().filter(r => r.userId === u.id);
    lista.innerHTML = "";

    if(all.length === 0){
      lista.innerHTML = `<p class="muted">Aún no tienes reservas registradas.</p>`;
      return;
    }

    all.forEach(r=>{
      const card = document.createElement("article");
      card.className = "res-card";
      card.innerHTML = `
        <div class="res-header">
          <strong>Reserva #${r.id}</strong>
          <span class="badge pending">Pendiente</span>
        </div>

        <div class="muted">
          <b>${r.fecha}</b> · ${r.hora} · ${r.personas} persona(s)
        </div>

        <div>${r.notas || "<em>Sin comentarios adicionales</em>"}</div>
      `;
      lista.appendChild(card);
    });
  }

  form.addEventListener("submit",(e)=>{
    e.preventDefault();

    const fecha = document.getElementById("resFecha").value;
    const hora  = document.getElementById("resHora").value;
    const pers  = document.getElementById("resPersonas").value;
    const notas = document.getElementById("resNotas").value.trim();

    if(!fecha || !hora){
      showToast("Datos incompletos","Por favor completa fecha y hora.","warning");
      return;
    }

    const nueva = {
      id: Math.floor(1000 + Math.random() * 9000),
      userId: u.id,
      fecha,
      hora,
      personas: pers,
      notas
    };

    const all = getReservas();
    all.push(nueva);
    saveReservas(all);

    showToast("Reserva enviada","Tu solicitud está en revisión.","success");
    form.reset();
    pintarReservas();
  });

  pintarReservas();
});

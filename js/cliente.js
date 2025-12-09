// js/cliente.js - Panel Cliente Roca Steak House (PRO)
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Verificar sesión
  const u = requireRole("cliente");
  if (!u) return;

  const welcome = document.getElementById("clienteWelcome");
  if (welcome) {
    welcome.textContent = `Bienvenido, ${u.nombre}. Gestiona tus reservas aquí.`;
  }

  const inputFecha = document.getElementById("resFecha");
  const inputHora = document.getElementById("resHora");
  const inputMesa = document.getElementById("resMesa");
  const inputPersonas = document.getElementById("resPersonas");
  const inputNotas = document.getElementById("resNotas");
  const mesasGrid = document.getElementById("mesasGrid");
  const listaReservas = document.getElementById("misReservasLista");
  const formReserva = document.getElementById("clienteReservaForm");

  /* =========================================================
     2. FECHA Y HORA (FLATPICKR)
     ========================================================= */

  // Forzamos un pequeño delay por si otros scripts tardan
  setTimeout(() => {
    if (inputFecha) {
      flatpickr(inputFecha, {
        dateFormat: "Y-m-d",    // compatible con MySQL
        minDate: "today",
        disableMobile: true,
        locale: { firstDayOfWeek: 1 }
      });
    }

    if (inputHora) {
      flatpickr(inputHora, {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        minuteIncrement: 15,
        minTime: "12:00",
        maxTime: "23:45",
        disableMobile: true
      });
    }
  }, 80);

  /* =========================================================
     3. CARGAR MESAS (12 mesas + ocupadas si backend lo indica)
     ========================================================= */

  async function cargarMesas() {
    if (!mesasGrid) return;

    mesasGrid.innerHTML = "";
    let mesas = [];

    try {
      const res = await fetchAuth("/mesas");
      if (!res) throw new Error("Sin respuesta");
      mesas = await res.json();

      // Si por alguna razón vienen 0 mesas, creamos 12 por defecto
      if (!Array.isArray(mesas) || mesas.length === 0) {
        throw new Error("Sin mesas");
      }
    } catch (e) {
      // Fallback: 12 mesas por defecto (por si backend está vacío)
      mesas = Array.from({ length: 12 }).map((_, i) => ({
        id: i + 1,
        numero: i + 1,
        capacidad: 4,
        ocupada: false
      }));
    }

    // Ordenar por número / id
    mesas.sort((a, b) => (a.numero || a.id) - (b.numero || b.id));

    mesasGrid.innerHTML = "";
    mesas.forEach(m => {
      const card = document.createElement("div");
      card.className = "mesa-card brillo";

      if (m.ocupada) card.classList.add("ocupada");

      const numeroMesa = m.numero ?? m.id;
      const capacidad = m.capacidad ?? "?";

      card.innerHTML = `
        <div class="mesa-numero">Mesa ${numeroMesa}</div>
        <div class="mesa-detalle muted">Capacidad: ${capacidad} personas</div>
      `;

      card.addEventListener("click", () => {
        if (card.classList.contains("ocupada")) return;

        document
          .querySelectorAll(".mesa-card")
          .forEach(c => c.classList.remove("active"));

        card.classList.add("active");
        inputMesa.value = m.id;
      });

      mesasGrid.appendChild(card);
    });
  }

  /* =========================================================
     4. CARGAR MIS RESERVAS
     ========================================================= */

  async function cargarMisReservas() {
    if (!listaReservas) return;

    listaReservas.innerHTML = "";

    try {
      const res = await fetchAuth(`/reservas/usuario/${u.id}`);
      if (!res) throw new Error("Sin respuesta");
      const reservas = await res.json();

      if (!reservas || reservas.length === 0) {
        listaReservas.innerHTML = `<p class="muted">Aún no tienes reservas.</p>`;
        return;
      }

      reservas.forEach(r => {
        const card = document.createElement("article");
        card.className = "res-card";

        const fechaMostrar = r.fecha
          ? new Date(r.fecha).toLocaleDateString()
          : "Fecha no disponible";

        const horaMostrar = r.hora ? r.hora.substring(0, 5) : "--:--";
        const estado = r.estado || "pendiente";
        const estadoClass =
          estado === "confirmada"
            ? "ok"
            : estado === "cancelada"
              ? "error"
              : "pending";

        const mesaNumero = r.mesa_numero || r.mesa_id || "?";

        card.innerHTML = `
          <div class="res-header">
            <div>
              <strong>Reserva #${r.id}</strong>
              <span class="muted"> · Mesa ${mesaNumero}</span>
            </div>
            <span class="badge ${estadoClass}">${estado}</span>
          </div>

          <div class="res-info">
            <div>
              <ion-icon name="calendar-clear-outline"></ion-icon>
              <span>${fechaMostrar} a las ${horaMostrar}</span>
            </div>
            <div>
              <ion-icon name="people-outline"></ion-icon>
              <span>${r.personas} personas</span>
            </div>
          </div>

          ${r.notas
            ? `<div class="res-notas">
                   <ion-icon name="chatbubble-ellipses-outline"></ion-icon>
                   <span>${r.notas}</span>
                 </div>`
            : ""
          }
        `;

        listaReservas.appendChild(card);
      });
    } catch (error) {
      console.error("Error cargando reservas:", error);
      listaReservas.innerHTML = `<p class="muted">No se pudieron cargar las reservas.</p>`;
    }
  }

  /* =========================================================
     5. CREAR RESERVA
     ========================================================= */

  if (formReserva) {
    formReserva.addEventListener("submit", async e => {
      e.preventDefault();

      const fecha = inputFecha.value.trim();
      const hora = inputHora.value.trim();
      const personas = inputPersonas.value;
      const notas = inputNotas.value.trim();
      const mesa_id = inputMesa.value;

      if (!fecha || !hora || !mesa_id) {
        showToast(
          "Faltan datos",
          "Debes seleccionar fecha, hora y mesa antes de enviar.",
          "warning"
        );
        return;
      }

      // Validación extra de hora (por si escriben a mano)
      const [h, m] = hora.split(":").map(Number);
      const minutosTotal = h * 60 + m;
      const minPermitido = 12 * 60;
      const maxPermitido = 23 * 60 + 45;
      if (
        isNaN(minutosTotal) ||
        minutosTotal < minPermitido ||
        minutosTotal > maxPermitido
      ) {
        showToast(
          "Hora inválida",
          "La hora debe estar entre 12:00 y 23:45.",
          "warning"
        );
        return;
      }

      try {
        const res = await fetchAuth("/reservas", {
          method: "POST",
          body: JSON.stringify({
            usuario_id: u.id,
            cliente_nombre: u.nombre,
            fecha,
            hora,
            personas,
            mesa_id,
            notas
          })
        });

        const data = await res.json();
        if (!res.ok) {
          const msg = data && data.message ? data.message : "Error al crear la reserva.";
          throw new Error(msg);
        }

        showToast("Éxito", "Tu reserva fue registrada correctamente.", "success");

        formReserva.reset();
        inputMesa.value = "";
        document
          .querySelectorAll(".mesa-card")
          .forEach(c => c.classList.remove("active"));

        const tabMis = document.querySelector('.sb-link[data-view="mis"]');
        if (tabMis) tabMis.click();
        await cargarMisReservas();
      } catch (error) {
        console.error("Error creando reserva:", error);
        showToast("Error", error.message, "error");
      }
    });
  }

  /* =========================================================
     6. NAVEGACIÓN ENTRE TABS
     ========================================================= */

  document.querySelectorAll(".sb-link").forEach(link => {
    link.addEventListener("click", () => {
      document
        .querySelectorAll(".sb-link")
        .forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const vista = link.dataset.view;
      document
        .querySelectorAll(".panel-section")
        .forEach(sec => sec.classList.remove("active"));

      if (vista === "nueva") {
        document.getElementById("view-nueva")?.classList.add("active");
      } else if (vista === "mis") {
        document.getElementById("view-mis")?.classList.add("active");
        cargarMisReservas();
      }
    });
  });

  /* =========================================================
     7. LOGOUT
     ========================================================= */

  const btnLogout = document.getElementById("btnLogoutCliente");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      clearSession();
      window.location.href = "index.html";
    });
  }



  /* =========================================================
     9. CARGA INICIAL
     ========================================================= */
  cargarMesas();
  cargarMisReservas();
});

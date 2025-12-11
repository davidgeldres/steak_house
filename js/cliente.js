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

  // Modal elementos
  const modalEditar = document.getElementById("modalEditar");
  const formEditar = document.getElementById("formEditar");
  const btnCerrarModal = document.getElementById("btnCerrarModal");
  const inputEditFecha = document.getElementById("editFecha");
  const inputEditHora = document.getElementById("editHora");
  const inputEditPersonas = document.getElementById("editPersonas");
  const inputEditNotas = document.getElementById("editNotas");
  const inputEditId = document.getElementById("editId");

  // Flatpickr instances for edit
  let fpEditFecha, fpEditHora;

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


    // Init Flatpickr for Modal
    if (inputEditFecha) {
      fpEditFecha = flatpickr(inputEditFecha, {
        dateFormat: "Y-m-d", minDate: "today", disableMobile: true, locale: { firstDayOfWeek: 1 }
      });
    }
    if (inputEditHora) {
      fpEditHora = flatpickr(inputEditHora, {
        enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true,
        minuteIncrement: 15, minTime: "12:00", maxTime: "23:45", disableMobile: true
      });
    }
  }, 80);

  // Helper 24h check
  function puedeModificar(fecha, hora) {
    const ahora = new Date();
    const fechaStr = new Date(fecha).toISOString().split('T')[0];
    const reservaDate = new Date(`${fechaStr}T${hora}`);
    const diffHoras = (reservaDate - ahora) / (1000 * 60 * 60);
    return diffHoras >= 24;
  }

  /* =========================================================
     3. CARGAR MESAS (12 mesas + ocupadas si backend lo indica)
     ========================================================= */

  /* =========================================================
     3. CARGAR MESAS (12 mesas + ocupadas si backend lo indica)
     ========================================================= */

  async function checkAvailability() {
    const fecha = inputFecha.value;
    const hora = inputHora.value;

    if (!fecha || !hora) {
      // Si falta fecha u hora, cargamos mesas como 'libres' (o bloqueadas si queremos forzar selección)
      // Por ahora, recargamos limpieza.
      cargarMesas([]);
      return;
    }

    try {
      const res = await fetchAuth(`/reservas/disponibilidad?fecha=${fecha}&hora=${hora}`);
      if (!res) return;
      const data = await res.json();

      if (data.globalBlock) {
        showToast("Aviso", "Esta fecha/hora está bloqueada globalmente.", "warning");
        cargarMesas([], true); // true = bloquear todo
      } else {
        cargarMesas(data.occupiedIds || []);
      }

    } catch (e) {
      console.error(e);
    }
  }

  // Hook listeners to inputs
  if (inputFecha) inputFecha.addEventListener("change", checkAvailability);
  if (inputHora) inputHora.addEventListener("change", checkAvailability);

  async function cargarMesas(occupiedIds = [], blockAll = false) {
    if (!mesasGrid) return;

    mesasGrid.innerHTML = "";
    let mesas = [];

    try {
      const res = await fetchAuth("/mesas");
      if (!res) throw new Error("Sin respuesta");
      mesas = await res.json();

      if (!Array.isArray(mesas) || mesas.length === 0) {
        throw new Error("Sin mesas");
      }
    } catch (e) {
      mesas = Array.from({ length: 12 }).map((_, i) => ({
        id: i + 1,
        numero: i + 1,
        capacidad: 4
      }));
    }

    mesas.sort((a, b) => (a.numero || a.id) - (b.numero || b.id));

    mesasGrid.innerHTML = "";
    mesas.forEach(m => {
      const card = document.createElement("div");
      card.className = "mesa-card brillo";

      // Check if occupied
      let isOccupied = blockAll || occupiedIds.includes(m.id);

      // Backend 'ocupada' flag from /mesas is static (usually false). 
      // We rely on dynamic occupiedIds.
      if (isOccupied) {
        card.classList.add("ocupada");
        card.style.opacity = "0.5";
        card.style.cursor = "not-allowed";
        card.title = "No disponible";
      }

      const numeroMesa = m.numero ?? m.id;
      const capacidad = m.capacidad ?? "?";

      const labelMesa = numeroMesa.toString().toLowerCase().startsWith('mesa') ? numeroMesa : `Mesa ${numeroMesa}`;

      card.innerHTML = `
        <div class="mesa-numero">${labelMesa}</div>
        <div class="mesa-detalle muted">Capacidad: ${capacidad} personas</div>
      `;

      card.addEventListener("click", () => {
        if (isOccupied) {
          showToast("Ocupada", "Esta mesa no está disponible en este horario.", "warning");
          return;
        }

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
          (estado === "confirmada" || estado === "aceptada")
            ? "ok"
            : (estado === "cancelada" || estado === "rechazada")
              ? "error"
              : "pending";

        const mesaNumero = r.mesa_numero || r.mesa_id || "?";

        card.innerHTML = `
          <div class="res-header">
            <div>
              <strong>Reserva #${r.id}</strong>
              <span class="muted"> · ${mesaNumero.toString().startsWith('Mesa') ? mesaNumero : 'Mesa ' + mesaNumero}</span>
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

        // Botones de acción (Solo si > 24h y no cancelada)
        const esCancelable = (estado !== 'cancelada' && estado !== 'rechazada') && puedeModificar(r.fecha, r.hora);
        let accionesHtml = '';

        if (esCancelable) {
          accionesHtml = `
            <div class="res-actions" style="margin-top: 10px; border-top: 1px solid #444; padding-top: 10px; display: flex; gap: 10px;">
                <button class="btn tiny ghost edit-btn" data-id="${r.id}" data-json='${JSON.stringify(r)}'>
                    <ion-icon name="create-outline"></ion-icon> Editar
                </button>
                <button class="btn tiny danger cancel-btn" data-id="${r.id}">
                    <ion-icon name="trash-outline"></ion-icon> Cancelar
                </button>
            </div>
            `;
        }

        card.innerHTML = `
          <div class="res-header">
            <div>
              <strong>Reserva #${r.id}</strong>
              <span class="muted"> · ${mesaNumero.toString().startsWith('Mesa') ? mesaNumero : 'Mesa ' + mesaNumero}</span>
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
          ${accionesHtml}
        `;

        listaReservas.appendChild(card);
      });

      // Listeners
      document.querySelectorAll(".cancel-btn").forEach(b => {
        b.addEventListener("click", () => cancelarReserva(b.dataset.id));
      });
      document.querySelectorAll(".edit-btn").forEach(b => {
        b.addEventListener("click", () => {
          const data = JSON.parse(b.dataset.json);
          abrirModal(data);
        });
      });

    } catch (error) {
      console.error("Error cargando reservas:", error);
      listaReservas.innerHTML = `<p class="error">No se pudieron cargar las reservas. <br><small>${error.message}</small></p>`;
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

  /* =========================================================
     10. FUNCIONES DE ACCIÓN
     ========================================================= */

  async function cancelarReserva(id) {
    if (!confirm("¿Estás seguro de cancelar esta reserva?")) return;

    try {
      const res = await fetchAuth(`/reservas/${id}/cancelar`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast("Cancelada", data.message, "success");
      cargarMisReservas();
    } catch (e) {
      showToast("Error", e.message, "error");
    }
  }

  function abrirModal(r) {
    if (modalEditar) {
      inputEditId.value = r.id;
      inputEditPersonas.value = r.personas;
      inputEditNotas.value = r.notas || "";

      // Ajustar fechas flatpickr
      if (fpEditFecha) fpEditFecha.setDate(new Date(r.fecha));
      if (fpEditHora) fpEditHora.setDate(r.hora, true);

      modalEditar.showModal();
    }
  }

  if (btnCerrarModal) {
    btnCerrarModal.addEventListener("click", () => modalEditar.close());
  }

  if (formEditar) {
    formEditar.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = inputEditId.value;
      const fecha = inputEditFecha.value;
      const hora = inputEditHora.value;
      const personas = inputEditPersonas.value;
      const notas = inputEditNotas.value;

      try {
        const res = await fetchAuth(`/reservas/${id}`, {
          method: "PUT",
          body: JSON.stringify({ fecha, hora, personas, notas })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showToast("Actualizado", "Reserva editada correctamente", "success");
        modalEditar.close();
        cargarMisReservas();
      } catch (err) {
        showToast("Error", err.message, "error");
      }
    });
  }
});

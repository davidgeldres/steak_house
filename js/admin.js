// js/admin.js - Panel Administrador Roca Steak House
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Verificar rol admin
  const u = requireRole("admin");
  if (!u) return;

  const welcome = document.getElementById("adminWelcome");
  if (welcome) {
    welcome.textContent = `Sesión iniciada: ${u.nombre}`;
  }

  const tbodyReservas = document.getElementById("adminResBody");
  const gridMesas = document.getElementById("mesasGrid");
  const tbodyUsuarios = document.getElementById("usuariosBody");

  // Elementos Bloqueos
  const tbodyBloqueos = document.getElementById("bloqueosBody");
  const formBloqueo = document.getElementById("formBloqueo");
  const selectBloqueoMesa = document.getElementById("bloqueoMesa");
  const inputBloqueoFecha = document.getElementById("bloqueoFecha");
  const inputBloqueoInicio = document.getElementById("bloqueoInicio");
  const inputBloqueoFin = document.getElementById("bloqueoFin");

  // Init Flatpickr Bloqueos
  if (inputBloqueoFecha) {
    flatpickr(inputBloqueoFecha, { dateFormat: "Y-m-d", minDate: "today", disableMobile: true, locale: { firstDayOfWeek: 1 } });
  }
  if (inputBloqueoInicio) {
    flatpickr(inputBloqueoInicio, { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true, disableMobile: true });
  }
  if (inputBloqueoFin) {
    flatpickr(inputBloqueoFin, { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true, disableMobile: true });
  }

  /* =========================================================
     2. FUNCIONES AUXILIARES
     ========================================================= */

  function formatearFecha(fecha) {
    if (!fecha) return "Fecha no disponible";
    try {
      return new Date(fecha).toLocaleDateString();
    } catch {
      return fecha;
    }
  }

  function estadoClass(estado) {
    if (estado === "confirmada" || estado === "aceptada") return "ok";
    if (estado === "cancelada" || estado === "rechazada") return "error";
    return "pending";
  }



  /* =========================================================
     2b. DASHBOARD & CHARTS
     ========================================================= */
  let charts = {}; // Store chart instances to destroy them before re-creating

  async function loadDashboard() {
    try {
      const res = await fetchAuth("/reportes/dashboard");
      if (!res) return;
      const stats = await res.json();

      renderChart("chartPeakHours", "bar", "Reservas por Hora",
        stats.peakHours.map(x => `${x.hora}:00`),
        stats.peakHours.map(x => x.cantidad),
        'rgba(255, 99, 132, 0.5)'
      );

      renderChart("chartTopTables", "bar", "Mesas Populares",
        stats.topTables.map(x => x.nombre),
        stats.topTables.map(x => x.cantidad),
        'rgba(54, 162, 235, 0.5)'
      );

      renderChart("chartTimeline", "line", "Reservas Diarias",
        stats.timeline.map(x => new Date(x.fecha).toLocaleDateString()),
        stats.timeline.map(x => x.cantidad),
        'rgba(75, 192, 192, 0.5)'
      );

      renderChart("chartStatus", "doughnut", "Distribución de Estado",
        stats.statusDist.map(x => x.estado),
        stats.statusDist.map(x => x.cantidad),
        ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      );

    } catch (e) {
      console.error("Error loading dashboard", e);
    }
  }

  function renderChart(canvasId, type, label, labels, data, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (charts[canvasId]) {
      charts[canvasId].destroy();
    }

    charts[canvasId] = new Chart(ctx, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: data,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  async function cargarReservas() {
    if (!tbodyReservas) return;

    try {
      const res = await fetchAuth("/reservas");
      if (!res) return;

      const reservas = await res.json();
      tbodyReservas.innerHTML = "";

      // Estadísticas
      const total = reservas.length;
      const pendientes = reservas.filter((r) => r.estado === "pendiente").length;
      const confirmadas = reservas.filter((r) => ["confirmada", "aceptada"].includes(r.estado)).length;
      const canceladas = reservas.filter((r) => ["cancelada", "rechazada"].includes(r.estado)).length;

      document.getElementById("statTotal").textContent = total;
      document.getElementById("statPendientes").textContent = pendientes;
      document.getElementById("statConfirmadas").textContent = confirmadas;
      document.getElementById("statCanceladas").textContent = canceladas;

      // DETECTAR CONFLICTOS (SOLO ACEPTADAS/CONFIRMADAS)
      // Agrupar por Mesa + Fecha + Hora
      const conteo = {};
      reservas.forEach(r => {
        if (["confirmada", "aceptada"].includes(r.estado)) {
          // Simplificamos hora a HH (rango 1h) o completa si queremos exactitud
          // El usuario dijo "misma hora". Usaremos HH:MM exacto.
          const key = `${r.mesa_id}_${r.fecha.substring(0, 10)}_${r.hora}`;
          conteo[key] = (conteo[key] || 0) + 1;
        }
      });

      reservas.forEach((r) => {
        const tr = document.createElement("tr");
        const fechaMostrar = formatearFecha(r.fecha);
        const horaCorta = r.hora ? r.hora.substring(0, 5) : "--:--";
        const claseEstado = estadoClass(r.estado);
        const mesaNumero = r.mesa_numero || r.mesa_id || "?";

        // Chequear conflicto
        const key = `${r.mesa_id}_${r.fecha.substring(0, 10)}_${r.hora}`;
        const esConflicto = ["confirmada", "aceptada"].includes(r.estado) && conteo[key] > 1;

        if (esConflicto) {
          tr.classList.add("conflict-row");
          tr.title = "¡CONFLICTO! Mesa ocupada doblemente.";
        }

        tr.innerHTML = `
          <td>${r.id}</td>
          <td>${r.cliente_nombre || "Sin nombre"}</td>
          <td>${fechaMostrar}</td>
          <td>${horaCorta}</td>
          <td>${r.personas || "-"}</td>
          <td>${mesaNumero}</td>
          <td>
            <span class="badge ${claseEstado}">
              ${r.estado || "pendiente"}
            </span>
          </td>
          <td class="acciones">
            ${r.estado === "pendiente"
            ? `
              <button class="btn tiny confirm" data-id="${r.id}">
                ✔
              </button>
              <button class="btn tiny cancel" data-id="${r.id}">
                ✖
              </button>
              `
            : "-"
          }
          </td>
        `;

        tbodyReservas.appendChild(tr);
      });

      // Listeners botones de acción
      tbodyReservas.querySelectorAll(".confirm").forEach(b =>
        b.addEventListener("click", () => cambiarEstado(b.dataset.id, "aceptada"))
      );
      tbodyReservas.querySelectorAll(".cancel").forEach(b =>
        b.addEventListener("click", () => cambiarEstado(b.dataset.id, "rechazada"))
      );

    } catch (error) {
      console.error("Error cargando reservas:", error);
      showToast("Error", "No se pudieron cargar las reservas.", "error");
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      const res = await fetchAuth(`/reservas/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!res.ok) {
        throw new Error("No se pudo actualizar el estado de la reserva.");
      }

      showToast("Actualizado", `Reserva #${id} ahora está ${nuevoEstado}.`, "success");
      cargarReservas();
    } catch (error) {
      console.error("Error cambiando estado:", error);
      showToast("Error", error.message, "error");
    }
  }

  /* =========================================================
     4. CARGAR MESAS
     ========================================================= */

  /* =========================================================
     4. CARGAR MESAS (CRUD)
     ========================================================= */

  const modalMesa = document.getElementById("modalMesa");
  const formMesa = document.getElementById("formMesa");
  const btnNuevaMesa = document.getElementById("btnNuevaMesa");
  const btnCerrarModalMesa = document.getElementById("btnCerrarModalMesa");

  if (btnNuevaMesa) {
    btnNuevaMesa.addEventListener("click", () => abrirModalMesa());
  }
  if (btnCerrarModalMesa) {
    btnCerrarModalMesa.addEventListener("click", () => modalMesa.close());
  }
  if (formMesa) {
    formMesa.addEventListener("submit", guardarMesa);
  }

  function abrirModalMesa(mesa = null) {
    const title = document.getElementById("modalMesaTitle");
    const idInput = document.getElementById("mesaId");
    const numInput = document.getElementById("mesaNumero");
    const capInput = document.getElementById("mesaCapacidad");

    if (mesa) {
      title.textContent = "Editar Mesa";
      idInput.value = mesa.id;
      numInput.value = mesa.numero || mesa.id;
      capInput.value = mesa.capacidad;
    } else {
      title.textContent = "Nueva Mesa";
      idInput.value = "";
      numInput.value = "";
      capInput.value = "";
    }
    modalMesa.showModal();
  }

  async function guardarMesa(e) {
    e.preventDefault();
    const id = document.getElementById("mesaId").value;
    const numero = document.getElementById("mesaNumero").value;
    const capacidad = document.getElementById("mesaCapacidad").value;

    const method = id ? "PUT" : "POST";
    const url = id ? `/mesas/${id}` : "/mesas";

    try {
      const res = await fetchAuth(url, {
        method,
        body: JSON.stringify({ nombre: numero, capacidad: parseInt(capacidad) })
      });

      if (!res.ok) throw new Error("Error guardando mesa");

      showToast("Éxito", "Mesa guardada", "success");
      modalMesa.close();
      cargarMesas();
    } catch (e) {
      showToast("Error", e.message, "error");
    }
  }

  async function borrarMesa(id) {
    if (!confirm("¿Eliminar esta mesa?")) return;
    try {
      const res = await fetchAuth(`/mesas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error eliminando");
      showToast("Eliminado", "Mesa eliminada", "success");
      cargarMesas();
    } catch (e) {
      showToast("Error", e.message, "error");
    }
  }

  async function cargarMesas() {
    if (!gridMesas) return;

    try {
      const res = await fetchAuth("/mesas");
      if (!res) return;

      const mesas = await res.json();
      gridMesas.innerHTML = "";

      mesas
        .sort((a, b) => (a.numero || a.id) - (b.numero || b.id))
        .forEach((m) => {
          const card = document.createElement("div");
          card.className = "mesa-card admin";
          // card.style.position = "relative"; // para botones

          const numero = m.numero ?? m.id;
          const capacidad = m.capacidad || "?";

          const labelMesa = numero.toString().toLowerCase().startsWith('mesa') ? numero : `Mesa ${numero}`;

          card.innerHTML = `
            <div class="mesa-numero">${labelMesa}</div>
            <div class="mesa-detalle muted">Capacidad: ${capacidad} personas</div>
            <div class="mesa-actions" style="margin-top:10px; display:flex; gap:5px; justify-content:center;">
                <button class="btn tiny ghost edit-mesa">✏️</button>
                <button class="btn tiny danger delete-mesa">🗑️</button>
            </div>
          `;

          card.querySelector(".edit-mesa").addEventListener("click", () => abrirModalMesa(m));
          card.querySelector(".delete-mesa").addEventListener("click", () => borrarMesa(m.id));

          gridMesas.appendChild(card);
        });
    } catch (error) {
      console.error("Error cargando mesas:", error);
      showToast("Error", "No se pudieron cargar las mesas.", "error");
    }
  }

  // ALSO POPULATE SELECT BLOQUEO
  async function cargarMesasSelect() {
    if (!selectBloqueoMesa) return;
    try {
      const res = await fetchAuth("/mesas");
      if (!res) return;
      const mesas = await res.json();

      selectBloqueoMesa.innerHTML = '<option value="">-- Todas las Mesas --</option>';
      mesas.sort((a, b) => (a.numero || a.id) - (b.numero || b.id))
        .forEach(m => {
          const opt = document.createElement("option");
          opt.value = m.id;
          opt.textContent = `Mesa ${m.numero || m.id} (Cap: ${m.capacidad})`;
          selectBloqueoMesa.appendChild(opt);
        });
    } catch (e) { console.error(e); }
  }

  /* =========================================================
     5. CARGAR USUARIOS
     ========================================================= */

  async function cargarUsuarios() {
    if (!tbodyUsuarios) return;

    try {
      const res = await fetchAuth("/usuarios");
      if (!res) return;

      const usuarios = await res.json();
      tbodyUsuarios.innerHTML = "";

      usuarios.forEach((user) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${user.id}</td>
          <td>${user.nombre}</td>
          <td>${user.email}</td>
          <td>
            <span class="badge">${user.rol}</span>
          </td>
        `;

        tbodyUsuarios.appendChild(tr);
      });
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      showToast("Error", "No se pudieron cargar los usuarios.", "error");
    }
  }

  /* =========================================================
     6. TABS NAVEGACIÓN
     ========================================================= */

  document.querySelectorAll(".sb-link").forEach((link) => {
    link.addEventListener("click", () => {
      document
        .querySelectorAll(".sb-link")
        .forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const vista = link.dataset.view;

      document
        .querySelectorAll(".panel-section")
        .forEach((sec) => sec.classList.remove("active"));

      const sec = document.getElementById(`view-${vista}`);
      if (sec) sec.classList.add("active");

      if (sec) sec.classList.add("active");

      if (vista === "dashboard") loadDashboard();
      if (vista === "reservas") cargarReservas();
      if (vista === "mesas") cargarMesas();
      if (vista === "usuarios") cargarUsuarios();
      if (vista === "bloqueos") { cargarBloqueos(); cargarMesasSelect(); }
    });
  });

  /* =========================================================
     7. LOGOUT
     ========================================================= */

  const btnLogout = document.getElementById("btnLogoutAdmin");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      clearSession();
      window.location.href = "index.html";
    });
  }

  /* =========================================================
     6a. CRONOGRAMA BLOQUEOS
     ========================================================= */

  async function cargarBloqueos() {
    if (!tbodyBloqueos) return;
    try {
      const res = await fetchAuth("/bloqueos");
      if (!res) return;
      const bloqueos = await res.json();
      tbodyBloqueos.innerHTML = "";

      bloqueos.forEach(b => {
        const tr = document.createElement("tr");
        // Format time to HH:mm
        const inicio = b.hora_inicio.substring(0, 5);
        const fin = b.hora_fin.substring(0, 5);

        tr.innerHTML = `
             <td>${b.id}</td>
             <td>${b.mesa_nombre || "TODAS"}</td>
             <td>${formatearFecha(b.fecha)}</td>
             <td>${inicio} - ${fin}</td>
             <td>${b.motivo}</td>
             <td>
               <button class="btn tiny danger delete-block" data-id="${b.id}">
                 <ion-icon name="trash-outline"></ion-icon>
               </button>
             </td>
           `;
        tbodyBloqueos.appendChild(tr);
      });

      // Listeners delete
      tbodyBloqueos.querySelectorAll(".delete-block").forEach(btn => {
        btn.addEventListener("click", () => eliminarBloqueo(btn.dataset.id));
      });

    } catch (e) { console.error(e); }
  }

  async function crearBloqueo(e) {
    e.preventDefault();
    const mesa_id = selectBloqueoMesa.value || null;
    const fecha = inputBloqueoFecha.value;
    const hora_inicio = inputBloqueoInicio.value;
    const hora_fin = inputBloqueoFin.value;
    const motivo = document.getElementById("bloqueoMotivo").value;

    // VALIDACION HORARIA
    if (hora_inicio >= hora_fin) {
      showToast("Error", "La hora de inicio debe ser anterior a la hora fin.", "error");
      return;
    }

    try {
      const res = await fetchAuth("/bloqueos", {
        method: "POST",
        body: JSON.stringify({ mesa_id, fecha, hora_inicio, hora_fin, motivo })
      });
      if (!res.ok) throw new Error("Error creando bloqueo");

      showToast("Éxito", "Bloqueo creado", "success");
      formBloqueo.reset();
      cargarBloqueos();
    } catch (e) {
      showToast("Error", e.message, "error");
    }
  }

  async function eliminarBloqueo(id) {
    if (!confirm("¿Eliminar bloqueo?")) return;
    try {
      const res = await fetchAuth(`/bloqueos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error");
      showToast("Eliminado", "Bloqueo eliminado", "success");
      cargarBloqueos();
    } catch (e) {
      showToast("Error", "No se pudo eliminar", "error");
    }
  }

  if (formBloqueo) {
    formBloqueo.addEventListener("submit", crearBloqueo);
  }

  /* =========================================================
     8. EXPORTAR EXCEL
     ========================================================= */

  const btnExport = document.getElementById("btnExportOption");
  if (btnExport) {
    btnExport.addEventListener("click", async () => {
      try {
        const res = await fetchAuth("/reportes/excel");

        if (!res.ok) throw new Error("Error al descargar reporte");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "reporte_reservas.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        showToast("Éxito", "Reporte descargado correctamente", "success");
      } catch (error) {
        console.error("Error exportando:", error);
        showToast("Error", "No se pudo descargar el reporte", "error");
      }
    });
  }

  /* =========================================================
     9. CARGA INICIAL
     ========================================================= */

  loadDashboard();
  cargarReservas();
});

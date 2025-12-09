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
    if (estado === "confirmada") return "ok";
    if (estado === "cancelada") return "error";
    return "pending";
  }

  /* =========================================================
     3. CARGAR RESERVAS
     ========================================================= */

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
      const confirmadas = reservas.filter((r) => r.estado === "confirmada").length;
      const canceladas = reservas.filter((r) => r.estado === "cancelada").length;

      document.getElementById("statTotal").textContent = total;
      document.getElementById("statPendientes").textContent = pendientes;
      document.getElementById("statConfirmadas").textContent = confirmadas;
      document.getElementById("statCanceladas").textContent = canceladas;

      reservas.forEach((r) => {
        const tr = document.createElement("tr");
        const fechaMostrar = formatearFecha(r.fecha);
        const horaCorta = r.hora ? r.hora.substring(0, 5) : "--:--";
        const claseEstado = estadoClass(r.estado);
        const mesaNumero = r.mesa_numero || r.mesa_id || "?";

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
            ${
              r.estado === "pendiente"
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
      tbodyReservas
        .querySelectorAll(".confirm")
        .forEach((b) =>
          b.addEventListener("click", () => cambiarEstado(b.dataset.id, "confirmada"))
        );

      tbodyReservas
        .querySelectorAll(".cancel")
        .forEach((b) =>
          b.addEventListener("click", () => cambiarEstado(b.dataset.id, "cancelada"))
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

          const numero = m.numero ?? m.id;
          const capacidad = m.capacidad || "?";

          card.innerHTML = `
            <div class="mesa-numero">Mesa ${numero}</div>
            <div class="mesa-detalle muted">Capacidad: ${capacidad} personas</div>
          `;

          gridMesas.appendChild(card);
        });
    } catch (error) {
      console.error("Error cargando mesas:", error);
      showToast("Error", "No se pudieron cargar las mesas.", "error");
    }
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

      if (vista === "reservas") cargarReservas();
      if (vista === "mesas") cargarMesas();
      if (vista === "usuarios") cargarUsuarios();
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
     8. CARGA INICIAL
     ========================================================= */

  cargarReservas();
});

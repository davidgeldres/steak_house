document.addEventListener("DOMContentLoaded", () => {
  
  // 1. LÓGICA DE PESTAÑAS
  const tabs = document.querySelectorAll(".login-tab");
  const panels = {
    login: document.getElementById("login-panel"),
    register: document.getElementById("register-panel")
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const tabName = tab.dataset.tab;
      Object.keys(panels).forEach(k => {
        panels[k].classList.toggle("active", k === tabName);
      });
    });
  });

  // 2. MOSTRAR / OCULTAR CONTRASEÑA
  document.querySelectorAll(".toggle-pass").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      const icon = btn.querySelector("ion-icon");

      if (input.type === "password") {
        input.type = "text";
        icon.setAttribute("name", "eye-off-outline");
      } else {
        input.type = "password";
        icon.setAttribute("name", "eye-outline");
      }
    });
  });

  // 3. LOGIN CORREGIDO
  const loginForm = document.getElementById("loginForm");
  const loginMsg = document.getElementById("loginMsg");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // CAMBIO: Usar email en lugar de dato
      const email = document.getElementById("loginUser").value.trim();
      const password = document.getElementById("loginPass").value.trim();

      if (!email || !password) {
        loginMsg.textContent = "Completa todos los campos.";
        loginMsg.style.color = "#f87171";
        return;
      }

      try {
        loginMsg.textContent = "Verificando...";
        loginMsg.style.color = "#ccc";

        // DEBUG: Verificar URL
        const baseUrl = (typeof API_URL !== 'undefined') ? API_URL : "http://localhost:4001/api";
        console.log("URL de login:", `${baseUrl}/auth/login`);
        console.log("Email enviado:", email);

        const res = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // CAMBIO: Usar { email, password } en lugar de { dato, password }
          body: JSON.stringify({ email, password })
        });

        // DEBUG: Verificar respuesta
        console.log("Status:", res.status);
        
        const data = await res.json();
        console.log("Respuesta del servidor:", data);

        if (!res.ok) {
          throw new Error(data.message || "Credenciales incorrectas");
        }

        // GUARDAR SESIÓN
        if (typeof setSession === "function") {
          setSession(data.token, data.user);
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // TOAST opcional
        if (typeof showToast === "function") {
          showToast("Bienvenido", `Hola ${data.user.nombre}`, "success");
        }

        loginMsg.textContent = "¡Acceso correcto!";
        loginMsg.style.color = "#4ade80";

        setTimeout(() => {
          if (data.user.rol === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "cliente.html";
          }
        }, 1000);

      } catch (error) {
        console.error("Error en login:", error);
        loginMsg.textContent = error.message || "Error al iniciar sesión. Verifica tus credenciales.";
        loginMsg.style.color = "#f87171";
        
        if (typeof showToast === "function") {
          showToast("Error", error.message || "Error de autenticación", "error");
        }
      }
    });
  }

  // 4. REGISTRO
  const regForm = document.getElementById("registerForm");
  const regMsg = document.getElementById("regMsg");

  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("regUser").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const p1 = document.getElementById("regPass1").value.trim();
      const p2 = document.getElementById("regPass2").value.trim();

      if (!nombre || !email || !p1 || !p2) {
        regMsg.textContent = "Todos los campos son obligatorios.";
        regMsg.style.color = "#f87171";
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        regMsg.textContent = "Ingresa un email válido.";
        regMsg.style.color = "#f87171";
        return;
      }

      if (p1 !== p2) {
        regMsg.textContent = "Las contraseñas no coinciden.";
        regMsg.style.color = "#f87171";
        return;
      }

      if (p1.length < 6) {
        regMsg.textContent = "La contraseña es muy corta (mínimo 6 caracteres).";
        regMsg.style.color = "#f87171";
        return;
      }

      try {
        regMsg.textContent = "Creando cuenta...";
        regMsg.style.color = "#ccc";

        const baseUrl = (typeof API_URL !== 'undefined') ? API_URL : "http://localhost:4001/api";

        const res = await fetch(`${baseUrl}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, email, password: p1 })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Error al registrarse");
        }

        if (typeof showToast === "function") {
          showToast("Cuenta creada", "Registro exitoso. Ahora inicia sesión.", "success");
        }

        regMsg.textContent = "¡Cuenta creada con éxito!";
        regMsg.style.color = "#4ade80";

        regForm.reset();

        setTimeout(() => {
          const tabLogin = document.querySelector('[data-tab="login"]');
          if (tabLogin) tabLogin.click();
          document.getElementById("loginUser").value = email;
          document.getElementById("loginPass").focus();
        }, 1500);

      } catch (error) {
        console.error("Error en registro:", error);
        regMsg.textContent = error.message || "Error al crear la cuenta";
        regMsg.style.color = "#f87171";
        
        if (typeof showToast === "function") {
          showToast("Error", error.message || "Error en registro", "error");
        }
      }
    });
  }
});
// login-page.js - comportamiento de login.html
document.addEventListener("DOMContentLoaded", ()=>{
  const tabs = document.querySelectorAll(".login-tab");
  const panels = {
    login: document.getElementById("login-panel"),
    register: document.getElementById("register-panel")
  };

  tabs.forEach(tab=>{
    tab.addEventListener("click", ()=>{
      tabs.forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");

      const tabName = tab.dataset.tab;
      Object.keys(panels).forEach(k=>{
        panels[k].classList.toggle("active", k === tabName);
      });
    });
  });

  const loginForm = document.getElementById("loginForm");
  const loginMsg  = document.getElementById("loginMsg");
  const loginRole = document.getElementById("loginRole");

  document.getElementById("btnDemoCliente").addEventListener("click", ()=>{
    document.getElementById("loginUser").value = "cliente";
    document.getElementById("loginPass").value = "1234";
    loginRole.value = "cliente";
  });
  document.getElementById("btnDemoAdmin").addEventListener("click", ()=>{
    document.getElementById("loginUser").value = "admin";
    document.getElementById("loginPass").value = "1234";
    loginRole.value = "admin";
  });

  loginForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();
    const role = loginRole.value;

    if(!user || !pass){
      loginMsg.textContent = "Completa usuario y contraseña.";
      loginMsg.style.color = "#f97373";
      return;
    }

    // DEMO: usuario/clave fijos
    if(pass !== "1234"){
      loginMsg.textContent = "Contraseña incorrecta (demo: 1234).";
      loginMsg.style.color = "#f97373";
      showToast("Error de acceso","Contraseña incorrecta","error");
      return;
    }

    const current = { id: Date.now(), username:user, role };
    setCurrentUser(current);

    showToast("Bienvenido",`Has iniciado sesión como ${role}.`,"success");
    // redirigir según rol
    setTimeout(()=>{
      if(role === "admin") window.location.href = "admin.html";
      else window.location.href = "cliente.html";
    }, 700);
  });

  const regForm = document.getElementById("registerForm");
  const regMsg  = document.getElementById("regMsg");

  regForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const u  = document.getElementById("regUser").value.trim();
    const em = document.getElementById("regEmail").value.trim();
    const p1 = document.getElementById("regPass1").value.trim();
    const p2 = document.getElementById("regPass2").value.trim();

    if(!u || !em || !p1 || !p2){
      regMsg.textContent = "Completa todos los campos.";
      regMsg.style.color = "#f97373";
      return;
    }
    if(p1 !== p2){
      regMsg.textContent = "Las contraseñas no coinciden.";
      regMsg.style.color = "#f97373";
      return;
    }
    if(p1.length < 6){
      regMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
      regMsg.style.color = "#f97373";
      return;
    }

    // DEMO: solo mostramos mensaje. Aquí iría tu fetch() al backend.
    regMsg.textContent = "Cuenta creada (demo). Ahora inicia sesión.";
    regMsg.style.color = "#4ade80";
    showToast("Cuenta creada","Tu cuenta se creó correctamente (demo).","success");
  });
});

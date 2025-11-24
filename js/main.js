// main.js - Home: carta demo + navegación
const DATA = {
  "Entradas a la parrilla": [
    {
      n: "Champiñones a la parrilla",
      p: 36.00,
      d: "Con chimichurri, mantequilla al ajo y queso parmesano."
    },
    {
      n: "Queso fundido",
      p: 38.00,
      d: "Madurado de vacuno, tomates cherry y albahaca fresca."
    },
    {
      n: "Brochetas de pollo",
      p: 35.00,
      d: "2 unidades de pollo a la parrilla."
    },
    {
      n: "Mollejas de res",
      p: 38.00,
      d: "Aprox. 250 g de mollejas a la parrilla."
    },
    {
      n: "Chorizos al vino",
      p: 38.00,
      d: "2 unidades de chorizo salteado al vino."
    }
  ],
  "Ensaladas": [
    {
      n: "Ensalada parrillera",
      p: 27.00,
      d: "Lechuga, tomate, cebolla blanca, palta, pimientos morroneados, espárragos grillados y vinagreta de la casa."
    },
    {
      n: "Ensalada César",
      p: 35.00,
      d: "Lechuga, pollo, crutones, queso parmesano, tocino ahumado y vinagreta César."
    }
  ]
};

function renderCarta(){
  const tabs = document.getElementById("tabs");
  const content = document.getElementById("menuContent");
  if(!tabs || !content) return;

  const cats = Object.keys(DATA);
  let active = cats[0];

  function drawTabs(){
    tabs.innerHTML = "";
    cats.forEach(c=>{
      const b = document.createElement("button");
      b.textContent = c;
      if(c === active) b.classList.add("active");
      b.addEventListener("click", ()=>{
        active = c;
        drawTabs();
        drawList();
      });
      tabs.appendChild(b);
    });
  }

  function drawList(){
    content.innerHTML = "";
    DATA[active].forEach(item=>{
      const card = document.createElement("article");
      card.className = "item";
      card.innerHTML = `
        <div>
          <div class="item-name">${item.n}</div>
          <div class="item-desc">${item.d}</div>
        </div>
        <div class="item-price">S/ ${item.p.toFixed(2)}</div>
      `;
      content.appendChild(card);
    });
  }

  drawTabs();
  drawList();
}

document.addEventListener("DOMContentLoaded", ()=>{
  // burger
  const burger = document.getElementById("burger");
  const navMenu = document.getElementById("navMenu");
  if(burger && navMenu){
    burger.addEventListener("click", ()=> navMenu.classList.toggle("open"));
  }

  renderCarta();

  const btnHero = document.getElementById("btnHeroReservar");
  if(btnHero){
    btnHero.addEventListener("click", (e)=>{
      e.preventDefault();
      // si ya está logueado, redirigir al panel correcto
      const u = getCurrentUser();
      if(u){
        if(u.role === "admin") window.location.href = "admin.html";
        else window.location.href = "cliente.html";
      }else{
        window.location.href = "login.html";
      }
    });
  }
});

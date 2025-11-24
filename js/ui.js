// ui.js - Toast / helpers
function showToast(title, message, type = "info", duration = 3000){
  const toast = document.getElementById("toast");
  if(!toast) return;
  const iconBox = toast.querySelector(".toast-icon");
  const tTitle  = document.getElementById("toast-title");
  const tMsg    = document.getElementById("toast-message");

  const icons = {
    info: "information-circle-outline",
    success: "checkmark-circle-outline",
    error: "close-circle-outline",
    warning: "warning-outline"
  };
  const iconName = icons[type] || icons.info;

  iconBox.innerHTML = `<ion-icon name="${iconName}"></ion-icon>`;
  tTitle.textContent = title;
  tMsg.textContent   = message;

  toast.classList.remove("show");
  // force reflow
  void toast.offsetWidth;
  toast.classList.add("show");

  if(window._toastTimeout) clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(()=>{
    toast.classList.remove("show");
  }, duration);
}

document.addEventListener("DOMContentLoaded", ()=>{
  const toastClose = document.getElementById("toast-close");
  if(toastClose){
    toastClose.addEventListener("click", ()=>{
      const toast = document.getElementById("toast");
      if(toast) toast.classList.remove("show");
    });
  }
});

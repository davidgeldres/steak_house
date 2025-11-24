// auth.js - Manejo simple de usuarios con localStorage (solo demo)
const LS_USER_KEY = "rsh_usuario";

function setCurrentUser(user){
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
}

function getCurrentUser(){
  try{
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){
    return null;
  }
}

function clearCurrentUser(){
  localStorage.removeItem(LS_USER_KEY);
}

function requireRole(role, redirect = "login.html"){
  const u = getCurrentUser();
  if(!u || u.role !== role){
    window.location.href = redirect;
  }
  return u;
}

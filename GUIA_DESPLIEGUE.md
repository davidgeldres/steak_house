# Guía de Despliegue - Roca Steak House

Esta guía te ayudará a subir tu servidor backend a internet para que tu aplicación funcione desde el celular y otros dispositivos.

## 1. Subir el código a GitHub

Ya tienes el repositorio: `https://github.com/davidgeldres/steak_house.git`

Abre una **nueva terminal** en la carpeta de tu proyecto (`proyecto_roca_estructura_completa`) y ejecuta estos comandos uno por uno:

```bash
# 1. Inicializar git (si no lo has hecho)
git init

# 2. Agregar tu repositorio remoto
git remote add origin https://github.com/davidgeldres/steak_house.git
# NOTA: Si da error "remote origin already exists", ignoralo y sigue.

# 3. Preparar los archivos (El .gitignore que creé evitará subir basura)
git add .

# 4. Guardar los cambios
git commit -m "Preparando despliegue backend"

# 5. Cambiar a la rama principal (main)
git branch -M main

# 6. Subir a GitHub
git push -u origin main
```

## 2. Crear Base de Datos en la Nube (IMPORTANTE)

Como tus archivos JSON (`usuarios_creados.json`) se borrarán cada vez que el servidor se reinicie en la nube, necesitas una base de datos real.

Recomiendo usar **Railway** o **Clever Cloud** que ofrecen bases de datos MySQL gratuitas o de bajo costo.

1.  Crea una cuenta en [Railway.app](https://railway.app/).
2.  Crea un nuevo proyecto y añade "MySQL".
3.  Copia las credenciales que te den (Host, User, Password, Database, Port).

## 3. Desplegar el Backend (Servidor)

Recomiendo usar **Render** (tienen plan gratuito para web services).

1.  Ve a [Render.com](https://render.com/) y crea una cuenta.
2.  Haz clic en "New Web Service".
3.  Conecta tu cuenta de GitHub y selecciona el repositorio `steak_house`.
4.  En la configuración:
    *   **Root Directory**: `backend` (Muy importante, tu servidor está en esa carpeta).
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  **Variables de Entorno (Environment Variables)**:
    Haz clic en "Advanced" o "Environment" y agrega tus credenciales de la base de datos (las que copiaste en el paso 2):
    *   `DB_HOST`: (Tu host de Railway)
    *   `DB_USER`: (Tu usuario)
    *   `DB_PASSWORD`: (Tu contraseña)
    *   `DB_NAME`: (Tu nombre de base de datos)
    *   `DB_PORT`: (El puerto, ej. 3306)
    *   `JWT_SECRET`: Escribe una contraseña segura inventada por ti.

6.  Haz clic en **Create Web Service**.

## 4. Conectar el Frontend (Página Web)

Una vez que Render termine, te dará una URL (ejemplo: `https://roca-backend.onrender.com`).

1.  Vuelve a abrir tu código en VS Code.
2.  Abre el archivo `js/auth.js`.
3.  Cambia la línea:
    `const API_URL = "http://localhost:4001/api";`
    
    Por:
    `const API_URL = "https://roca-backend.onrender.com/api";` (Tu URL real).

4.  Guarda, haz un nuevo commit y push a GitHub.
5.  Netlify actualizará tu página web automáticamente y ¡listo!

Ahora funcionará en tu celular.

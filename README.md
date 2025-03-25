# ✨ Full Stack chat en tiempo real ✨

[ChatDocente](/frontend/public/screenshot-readme.png)

https://chatdocente.onrender.com/

Caracteristicas:

- 🌟 Stack tecnológico: MERN + Socket.io + TailwindCSS + Daisy UI
- 🎃 Autenticación y autorización con JWT
- 👋 Verificacion de usuario humano con recaptcha v2
- 👾 Mensajería en tiempo real con Socket.io
- 🚀 Estado de usuario en línea
- 👌 Gestión de estado global con Zustand
- 🐞 Manejo de errores tanto en el servidor como en el cliente
- 🔍 Funcionalidades de Filtrado y Búsqueda
- ⚠️ Validaciones y Mensajes de Error
- ✅ Visualización del Estado del Mensaje
- 🟢 Indicadores de Usuario en Línea
- 🚨 Soporte para Mensajes Urgentes
- 🖼️ Subida de Imágenes para perfil y mensajes con claudinary
- ⭐ Al final, despliegue en render
- 📇 Perfil de usuario personalizable con foto de perfil
- 🗂️ Sistema de archivado de chats
- 🔔 Opción para mostrar solo usuarios conectados
- 🔍 Búsqueda de mensajes dentro de conversaciones
- 🔄 Filtros para visualizar mensajes (todos/urgentes/normales)
- 🔒 Recuperación de contraseña con tokens y enlace temporal
- 📱 Diseño responsive para dispositivos móviles y de escritorio
- 📆 Información de cuenta con fecha de registro
- 📝 Formularios con validación completa
- 📨 Sistema de recuperación de contraseña con Nodemailer
- 📅 Sistema de gestión de tareas y recordatorios
- 📧 Envío de correos electrónicos para recuperación de cuenta
- ⏱️ Tokens de restablecimiento con expiración por seguridad

### configuración archivo .env en la raiz del backend

```js
MONGODB_URI=...
PORT=5001
JWT_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_SECRET_KEY=...

# Configuración para nodemailer
EMAIL_USER=...
EMAIL_PASSWORD=...
EMAIL_FROM=...
FRONTEND_URL=...

NODE_ENV=development
```

### Hacer el build

```shell
npm run build
```

### Iniciar el backend

```shell
npm start
```

### Iniciar el frontend

```shell
npm run dev
```

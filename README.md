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

### configuración archivo .env en la raiz del backend

```js
MONGODB_URI=...
PORT=5001
JWT_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_SECRET_KEY=...

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

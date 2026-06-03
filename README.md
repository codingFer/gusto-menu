# 🍽️ GustoMenu — Menú Digital Inteligente

**GustoMenu** es una plataforma ágil y moderna diseñada para que restaurantes y emprendedores gastronómicos creen sus propios menús digitales en minutos, sin complicaciones técnicas y con recepción de pedidos directa a WhatsApp.

![GustoMenu Preview](https://via.placeholder.com/1200x600/FF4B2B/FFFFFF?text=GustoMenu+-+Digital+Menu+Creator)

---

## 📌 Estado del Proyecto

| Área | Estado |
|------|--------|
| Frontend (React + Vite) | ✅ En producción |
| Backend API | ✅ **Laravel 9** (`backend-laravel/`) |
| Backend anterior (Node/Express) | ❌ Retirado — reemplazado por Laravel |
| Base de datos (MySQL) | ✅ Persistencia de restaurantes, platillos y usuarios |
| Autenticación | ✅ Laravel Sanctum (tokens Bearer) |
| Panel de administración | ✅ Dashboard con roles (admin / dueño) |
| Menú por URL (Base64) | ✅ Modo sin cuenta — compartir link instantáneo |
| Menú persistido por API | ✅ Guardar y cargar por ID o slug |

---

## 🎯 Objetivos del Proyecto

Esta aplicación web está diseñada para solucionar tres necesidades fundamentales:

1. **Creación de Menús Digitales**: Permitir a los negocios gastronómicos crear y personalizar sus menús digitales en cuestión de minutos de manera sumamente sencilla.
2. **Mapa de Asociados**: Generar un mapa interactivo de restaurantes asociados para potenciar la socialización, visibilidad y descubrimiento de los locales relacionados.
3. **Pedidos sin Complicaciones**: Permitir a los clientes realizar sus pedidos de forma fluida, ágil y sin complicaciones técnicas.

---

## ✨ Características Principales

- **🚀 Creación Instantánea**: Genera un menú completo simplemente llenando un formulario.
- **💬 Pedidos por WhatsApp**: Los clientes arman su carrito y el pedido llega estructurado al WhatsApp del negocio.
- **📱 Responsive & Mobile-First**: Experiencia premium optimizada para smartphones.
- **🌓 Modo Oscuro/Claro**: Soporte nativo para temas basado en las preferencias del usuario o sistema.
- **🍲 Almuerzos Completos**: Soporte especial para menús del día (Sopa + Segundo).
- **🔗 Dos modos de publicación**:
  - **Sin cuenta**: el menú se codifica en la URL (Base64) para compartir al instante.
  - **Con cuenta**: el menú se guarda en la API y se accede por ID numérico o **slug** permanente (ej. `tusitio.com/#/menu?d=42` o slug vía API).
- **👤 Cuentas y roles**: Registro, login y panel para dueños de restaurante y administradores.
- **🖼️ Logo del negocio**: Subida de imagen desde el panel autenticado.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19 & Vite 8**: SPA moderna y reactiva.
- **Framer Motion**: Animaciones y transiciones.
- **React Router**: Navegación por hash (`#/menu`, `#/crear`, etc.).
- **CSS3 Variables**: Sistema de diseño con temas.
- **Fetch API**: Cliente HTTP hacia la API Laravel (`src/api.js`).

### Backend (`backend-laravel/`)
- **Laravel 9**: API REST.
- **Laravel Sanctum**: Autenticación por token para el SPA.
- **Eloquent ORM**: Modelos `User`, `Restaurante`, `Platillo`, `Guarnicion`, `TipoPlatillo`.
- **MySQL**: Base de datos relacional.
- **CORS** (`fruitcake/laravel-cors`): Acceso desde el frontend en otro origen.

---

## 📂 Estructura del Proyecto

```text
gusto-menu/
├── src/                    # Frontend React
│   ├── api.js              # Cliente de la API Laravel
│   ├── context/            # Estado global (Cart, Theme, Auth)
│   ├── pages/              # Home, Creator, MenuView, Dashboard, Login…
│   └── utils.js            # encodeMenu / decodeMenu (modo URL)
├── public/                 # Activos estáticos
├── backend-laravel/        # API Laravel (reemplaza al antiguo backend/)
│   ├── app/Http/Controllers/ApiController.php
│   ├── app/Models/
│   ├── routes/api.php
│   └── database/migrations/
├── deploy-backend.cjs      # Script para empaquetar backend-laravel.zip
└── package.json            # Dependencias del frontend
```

---

## 🔌 API (Laravel)

Rutas principales bajo el prefijo `/api`:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/register`, `/login` | Registro e inicio de sesión |
| `GET` | `/restaurantes/{slug}` | Menú público por slug |
| `GET` | `/restaurantes/id/{id}` | Menú público por ID |
| `GET` | `/tipos-platillo` | Catálogo de tipos de platillo |
| `*` | `/restaurantes`, `/restaurantes/full`, `/users`… | Rutas protegidas con `auth:sanctum` |

---

## 🚀 Instalación y Desarrollo

### Frontend

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Crea un archivo `.env` en la raíz del proyecto (o copia de `.env.production`):
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Build de producción:
   ```bash
   npm run build
   ```

### Backend (Laravel)

1. Entra al directorio del backend:
   ```bash
   cd backend-laravel
   ```
2. Instala dependencias PHP:
   ```bash
   composer install
   ```
3. Configura el entorno:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Edita `.env` con los datos de tu base MySQL (`DB_*`).
4. Ejecuta migraciones:
   ```bash
   php artisan migrate
   ```
5. Inicia el servidor:
   ```bash
   php artisan serve
   ```
   La API quedará en `http://localhost:8000/api`.

### Despliegue del backend

Desde la raíz del monorepo puedes generar un zip para hosting compartido:

```bash
node deploy-backend.cjs
```

Esto crea `backend-laravel.zip` listo para subir al servidor.

---

## 🗺️ Próximos Pasos

- **Mapa de asociados**: Vista geográfica de restaurantes registrados.
- **URLs amigables en el frontend**: Rutas dedicadas por slug (ej. `#/r/mi-restaurante`) además del parámetro `?d=`.
- **Estadísticas de pedidos**: Métricas desde pedidos vía WhatsApp o registro en backend.
- **Schema SQL versionado**: Centralizar el esquema de BD en el repo (la migración inicial puede importar un `schema.sql` si se restaura).

---

Desarrollado con ❤️ por [codingFer](https://github.com/codingFer).

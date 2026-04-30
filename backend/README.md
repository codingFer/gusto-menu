# 🚀 GustoMenu Backend — API Express + MySQL

Este es el servidor backend para GustoMenu, encargado de persistir los datos de usuarios, restaurantes y menús.

## 🛠️ Tecnologías
- **Node.js + Express**: Framework web.
- **MySQL**: Base de datos relacional (Ideal para Hostinger).
- **mysql2**: Cliente de MySQL para Node con soporte de promesas.
- **Helmet & CORS**: Seguridad y políticas de origen.
- **Dotenv**: Gestión de variables de entorno.

## 📂 Estructura
- `index.js`: Punto de entrada y definición de endpoints.
- `db.js`: Configuración de la conexión a la base de datos.
- `schema.sql`: Estructura de la base de datos (Postgres).
- `.env`: Variables de entorno (no subir a Git).

## 🚀 Instalación Local
1. Entra a la carpeta backend: `cd backend`
2. Instala dependencias: `npm install`
3. Crea tu base de datos en MySQL (ej: via phpMyAdmin o terminal).
4. Configura el archivo `.env` con tus credenciales:
   ```env
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   DB_NAME=gustomenu
   ```
5. Importa el esquema SQL: `mysql -u tu_usuario -p gustomenu < schema.sql`
6. Inicia el servidor: `npm run dev`

---

## ☁️ Despliegue en Hostinger (VPS)

Para desplegar en un VPS de Hostinger con Ubuntu/Debian:

1. **Instalar Node.js y MySQL**:
   ```bash
   sudo apt update
   sudo apt install nodejs npm mysql-server
   ```
2. **Configurar MySQL**:
   - Crea un usuario y base de datos.
   - Ejecuta el archivo `schema.sql`.
3. **Subir el código**: Usa Git o FTP para subir la carpeta `backend`.
4. **Instalar PM2** (para mantener el servidor corriendo):
   ```bash
   sudo npm install -g pm2
   pm2 start index.js --name gustomenu-api
   ```
5. **Configurar Firewall/Nginx**: Asegúrate de abrir el puerto 3000 o usar Nginx como Proxy Inverso.

> [!IMPORTANT]
> Si tu plan de Hostinger es **Shared Hosting**, es posible que no soporte Node.js de forma nativa o que solo ofrezca MySQL. En ese caso, se recomienda migrar el esquema a MySQL o usar un servicio externo como **Supabase** para la base de datos y conectar el Express a él.

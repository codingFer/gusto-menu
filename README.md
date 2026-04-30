# 🍽️ GustoMenu — Menú Digital Inteligente

**GustoMenu** es una plataforma ágil y moderna diseñada para que restaurantes y emprendedores gastronómicos creen sus propios menús digitales en minutos, sin complicaciones técnicas y con recepción de pedidos directa a WhatsApp.

![GustoMenu Preview](https://via.placeholder.com/1200x600/FF4B2B/FFFFFF?text=GustoMenu+-+Digital+Menu+Creator)

---

## ✨ Características Principales

- **🚀 Creación Instantánea**: Genera un menú completo simplemente llenando un formulario.
- **💬 Pedidos por WhatsApp**: Los clientes arman su carrito y el pedido llega estructurado al WhatsApp del negocio.
- **📱 Responsive & Mobile-First**: Experiencia premium optimizada para smartphones.
- **🌓 Modo Oscuro/Claro**: Soporte nativo para temas basado en las preferencias del usuario o sistema.
- **🍲 Almuerzos Completos**: Soporte especial para menús del día (Sopa + Segundo).
- **🔗 Sin Backend (Actual)**: Los datos se codifican en la URL, eliminando la necesidad de servidores o registros.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 & CSS3**: Estilizado con variables CSS modernas para un diseño premium y flexible.
- **Vanilla JavaScript**: Arquitectura SPA (Single Page Application) basada en hash-routing.
- **Web Storage API**: Persistencia local del borrador del menú para no perder cambios.
- **Base64 Encoding**: Los datos del menú se transmiten íntegramente a través de la URL.

---

## 📂 Estructura del Proyecto

```text
gusto-menu/
├── index.html     # Punto de entrada y contenedor del SPA
├── css/
│   └── style.css  # Sistema de diseño, temas y componentes
└── js/
    └── app.js     # Lógica de ruteo, estado, renderizado y persistencia
```

---

## 🚀 Próximos Pasos: Base de Datos

Actualmente, GustoMenu opera de forma descentralizada ("Serverless/Backend-less"). Para escalar la plataforma y permitir la persistencia robusta de múltiples restaurantes, estamos planificando la integración de una **Capa de Datos**:

### Objetivo:
- Permitir que los dueños de negocios guarden múltiples versiones de sus menús.
- Tener URLs cortas y permanentes (ej: `gustomenu.app/restaurante-la-paz`).
- Gestión de inventario y estadísticas de pedidos.

### Tecnologías Propuestas:
- **Firebase Firestore**: Ideal por su SDK de tiempo real y facilidad de integración con JS.
- **Supabase**: Una alternativa SQL robusta con autenticación integrada.
- **IndexedDB**: Para una gestión de base de datos local avanzada antes de subir a la nube.

---

## 💻 Instalación Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/codingFer/gusto-menu.git
   ```
2. Abre `index.html` en cualquier navegador moderno. No requiere compilación.

---

Desarrollado con ❤️ por [codingFer](https://github.com/codingFer).

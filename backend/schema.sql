-- GustoMenu Database Schema (MySQL)

CREATE TABLE roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(150) NOT NULL,
  role_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles (id)
);

CREATE TABLE restaurantes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  whatsapp_opcional VARCHAR(20),
  direccion TEXT,
  tema VARCHAR(50) DEFAULT 'light',
  imagen_url TEXT,
  horarios JSON,
  tagline VARCHAR(255),
  promo VARCHAR(255),
  precio_menu DECIMAL(10, 2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Tipos de Platillo (Sopa, Segundo, Postre, etc.)
CREATE TABLE tipos_platillo (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  bloqueado BOOLEAN DEFAULT FALSE -- Si es TRUE, el admin no puede borrarlo
);

-- Platillos base (átomos del menú)
CREATE TABLE platillos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  restaurante_id BIGINT NOT NULL,
  tipo_id BIGINT NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
  emoji VARCHAR(10),
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE,
  FOREIGN KEY (tipo_id) REFERENCES tipos_platillo(id)
);

-- Entidad Combo (Almuerzos completos, packs, etc.)
CREATE TABLE combos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  restaurante_id BIGINT NOT NULL,
  nombre VARCHAR(200) NOT NULL, -- Ej: "Almuerzo Ejecutivo"
  precio DECIMAL(10, 2) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE
);

-- Secciones de un Combo (Ej: "Elija su Sopa", "Elija su Segundo")
CREATE TABLE combo_secciones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  combo_id BIGINT NOT NULL,
  nombre VARCHAR(100) NOT NULL, -- Ej: "Sopa", "Segundo", "Refresco"
  min_items INT DEFAULT 1,
  max_items INT DEFAULT 1,
  orden INT DEFAULT 0,
  FOREIGN KEY (combo_id) REFERENCES combos(id) ON DELETE CASCADE
);

-- Relación entre Secciones y Platillos específicos
CREATE TABLE combo_seccion_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  seccion_id BIGINT NOT NULL,
  platillo_id BIGINT NOT NULL,
  precio_adicional DECIMAL(10, 2) DEFAULT 0,
  FOREIGN KEY (seccion_id) REFERENCES combo_secciones(id) ON DELETE CASCADE,
  FOREIGN KEY (platillo_id) REFERENCES platillos(id) ON DELETE CASCADE
);

-- Catálogo de Guarniciones por restaurante
CREATE TABLE guarniciones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  restaurante_id BIGINT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  precio_extra DECIMAL(10, 2) DEFAULT 0,
  FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE
);

-- Relación entre Platillos y sus Guarniciones permitidas
CREATE TABLE platillo_guarniciones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  platillo_id BIGINT NOT NULL,
  guarnicion_id BIGINT NOT NULL,
  es_obligatorio BOOLEAN DEFAULT FALSE,
  max_selecciones INT DEFAULT 1,
  FOREIGN KEY (platillo_id) REFERENCES platillos(id) ON DELETE CASCADE,
  FOREIGN KEY (guarnicion_id) REFERENCES guarniciones(id) ON DELETE CASCADE
);

-- Seed basic roles
INSERT INTO roles (name) VALUES ('admin'), ('owner'), ('customer');
-- Inserción de tipos por defecto bloqueados
INSERT INTO tipos_platillo (nombre, descripcion, bloqueado) VALUES 
('Sopa', 'Plato líquido servido al inicio', TRUE),
('Segundo', 'Plato principal de la comida', TRUE),
('Segundo Suelto', 'Plato principal sin sopa', TRUE),
('Postre', 'Dulce servido al final', TRUE),
('Bebida', 'Líquidos para acompañar', TRUE);

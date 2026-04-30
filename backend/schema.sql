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
  slug VARCHAR(100) NOT NULL UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  whatsapp_opcional VARCHAR(20),
  tema VARCHAR(50),
  imagen_url TEXT
);

CREATE TABLE platillos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  restaurante_id BIGINT,
  nombre VARCHAR(200) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  emoji VARCHAR(10),
  orden INT,
  FOREIGN KEY (restaurante_id) REFERENCES restaurantes (id)
);

CREATE TABLE promociones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  platillo_id BIGINT,
  nuevo_precio DECIMAL(10, 2),
  descripcion TEXT,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NOT NULL,
  dias_aplicacion JSON, -- MySQL uses JSON for arrays
  FOREIGN KEY (platillo_id) REFERENCES platillos (id)
);

-- Seed basic roles
INSERT INTO roles (name) VALUES ('admin'), ('owner'), ('customer');

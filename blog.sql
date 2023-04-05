CREATE TABLE IF NOT EXISTS usuarios(
id          int auto_increment not null,
nombre      varchar(100) not null,
apellidos   varchar(100) not null,
email       varchar(100) not null,
password    varchar(100) not null,
fecha       date not null,
CONSTRAINT pk_usuarios PRIMARY KEY(id),
CONSTRAINT uq_email UNIQUE(email)
)ENGINE=InnoDb;

CREATE TABLE IF NOT EXISTS categorias(
id      int auto_increment not null,
nombre  varchar(100),
CONSTRAINT pk_categorias PRIMARY KEY(id)
)ENGINE=InnoDb;

CREATE TABLE IF NOT EXISTS entradas(
id              int auto_increment not null,
usuario_id      int not null,
categoria_id    int not null,
titulo          varchar(100) not null,
descripcion     MEDIUMTEXT,
fecha           date not null,
CONSTRAINT pk_entradas PRIMARY KEY(id),
CONSTRAINT fk_entrada_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
CONSTRAINT fk_entrada_categoria FOREIGN KEY(categoria_id) REFERENCES categorias(id) ON DELETE NO ACTION
)ENGINE=InnoDb;

/* session table control of users */
CREATE TABLE IF NOT EXISTS blog_sessions (
  session_id varchar(128) COLLATE utf8mb4_bin NOT NULL,
  expires bigint unsigned NOT NULL,
  data mediumtext COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB

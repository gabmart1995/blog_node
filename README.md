# Blog_videojuegos

Diseño de blog personal de videojuegos construido en node, express y ejs.

Puede ser utilzado para cualquier tipo de blog personal

## Requerimientos:

- node >= 12.0
- mysql o mariadb >= 10.0

Importa los modulos de node con el comando `npm install`,
e importa la BD en tu gestor de mysql o mariaDB

### Desarrollo 

Para correr en http `http://localhost:8080`

Esta configurado en http, pero si quieres trabajar sobre https debes generar un certificado para protocolo https con el siguiente comando como administrador:


`sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./test_key.key -out test_cert.crt`
referencia en "https://github.com/sagardere/set-up-SSL-in-nodejs"


Para correr en modo desarrollo usa el comando `npm start`
visualizalo en `https://localhost:8080`

const mysql = require('mysql')

const SQL = Object.freeze({
    login: 'SELECT * FROM usuarios WHERE email = :email',
    register: 'INSERT INTO usuarios VALUES ( null, :name, :surname, :email, :password, CURDATE() );',
    validateEmail: 'SELECT id, email FROM usuarios WHERE email = :email',
    updateUser: 'UPDATE usuarios SET nombre = :name, apellidos = :surname, email = :email, password = :password WHERE id = :id;',
    getCategories: 'SELECT * FROM categorias ORDER BY id ASC;',
    getCategory: 'SELECT * FROM categorias WHERE id = :id',
    getLastEntries: 'SELECT e.*, c.nombre AS categoria FROM entradas e INNER JOIN categorias c ON e.categoria_id = c.id ORDER BY e.id DESC LIMIT 4;',
    getEntries: 'SELECT e.*, c.nombre AS categoria, c.id FROM entradas e INNER JOIN categorias c ON e.categoria_id = c.id ORDER BY e.id DESC;',
    insertCategory: 'INSERT INTO categorias VALUES( null, :nombre );',
    insertEntries: 'INSERT INTO entradas VALUES( NULL, :usuario_id, :categoria_id, :titulo, :descripcion, CURDATE() );',
    getEntriesByCategory: 'SELECT e.*, c.nombre AS categoria FROM entradas e INNER JOIN categorias c ON e.categoria_id = c.id WHERE e.categoria_id = :categoria_id ORDER BY e.id DESC LIMIT 4;'
})

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'test',
    password: '123456',
    database: 'blog_master'
})

// custom format
connection.config.queryFormat = function ( query, values ) {

    if ( !values ) {
        return query
    }

    return query.replace( /\:(\w+)/g, (function ( text, key ) {

        if ( values.hasOwnProperty( key ) ) {
            return this.escape( values[key] )
        }

        return text
        
    }).bind( this ))
}

function connectDatabase() {
    
    return new Promise(( resolve, reject ) => {
        
        connection.connect( error => {

            if ( error ) {
                reject( error )
                return
            }

            console.log('Base de datos conectada')
            resolve()
        })
    })
}

function executeQuery( query, data, callback ) {
    connection.query( query, data, callback )
}

function closeConnection() {
    
    return new Promise((resolve, reject) => {
        
        connection.end( error => {
            if ( error ) {
                reject( error )
                return
            }

            console.log('Base de datos cerrada')
            resolve()
        })
    })
}

module.exports = {
    connectDatabase,
    executeQuery,
    closeConnection,
    SQL
}
'use strict'

const EventEmitter = require('events')
class DatabaseEmitter extends EventEmitter {}
const databaseEmitter = new DatabaseEmitter()

const https = require('https')
const fs = require('fs')
const express = require('express')
const hbs = require('hbs')
const path = require('path')

const router = require('./routes/routes')
const { connectDatabase, closeConnection } = require('./database/database')
const app = express()
const port = 8443

hbs.registerPartials( path.join( __dirname, 'public/partials' ))

// hbs
app.set('view engine', 'hbs')
app.set('views', 'public')

// servir contenido estatico
app
    .use( express.static('public/static') )
    .use( express.urlencoded({ extended: true }) )
    .use( router )


// process close
process.once('SIGINT', () => databaseEmitter.emit('close'))
process.once('SIGTERM', () => databaseEmitter.emit('close') )

// event listeners
databaseEmitter.once('connect', async () => {

    try {

        await connectDatabase()
        
        console.log('Servidor funcionando en el puerto %d', port )
        
    } catch ( error ) {
        
        console.error( error )

        process.exit(1)
    }
})

databaseEmitter.once('close', async () => {
    
    try {

        await closeConnection()
        
        // cierra el proceso abierto
        process.exit(0)
        
    } catch ( error ) {
        
        console.error( error )

        process.exit(1)
    }
})


// app listen devuelve una instancia del servidor de node http    
// app.listen( port, () => databaseEmitter.emit('connect') )

/** 
 * Para habilitar el https necesitas la clave crt y el key, 
 * pasandole el http server de express 
 */

try {
    
    const key = fs.readFileSync('./test_key.key')
    const cert = fs.readFileSync('./test_cert.crt')
    const server = https.createServer({ key, cert }, app )
    
    server.listen( port, () => databaseEmitter.emit('connect') )

} catch ( error ) {

    console.log( error )
}



'use strict'

const EventEmitter = require('events')
const path = require('path')
const express = require('express')
const hbs = require('hbs')
const session = require('express-session')

const { connectDatabase, closeConnection } = require('./database/database')
const cookieParser = require('cookie-parser')

function startServer( port = 8080 ) {
    
    const router = require('./routes')
    const app = express()

    class DatabaseEmitter extends EventEmitter {}
    
    const databaseEmitter = new DatabaseEmitter()

    hbs.registerPartials( path.join( __dirname, 'public/partials' ))

    // hbs
    app.set('view engine', 'hbs')
    app.set('views', 'public')

    // servir contenido estatico
    app
       .use( session({ 
            secret: 'API_KEY_SECRET', 
            saveUninitialized: false,  // salva la cookie cuando hay un cambio en la variable session 
            resave: false ,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24
            }
        }))
        .use( express.static('public/static') )
        .use( express.urlencoded({ extended: true }) )
        .use( cookieParser() )
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
            
            // cierra el session store
            // sessionStore.close();
            
            // cierra el proceso abierto
            process.exit(0)
            
        } catch ( error ) {
            
            console.error( error )

            process.exit(1)
        }
    })


    // app listen devuelve una instancia del servidor de node http    
    app.listen( port, () => databaseEmitter.emit('connect') )

    /** 
     * Para habilitar el https necesitas la clave crt y el key, 
     * pasandole el http server de express 
     */

    /*
    // const https = require('https')
    // const fs = require('fs')

    try {
        
        const key = fs.readFileSync('./test_key.key')
        const cert = fs.readFileSync('./test_cert.crt')
        const server = https.createServer({ key, cert }, app )
        
        server.listen( port, () => databaseEmitter.emit('connect') )

    } catch ( error ) {

        console.error( error )
    }*/
}

startServer()


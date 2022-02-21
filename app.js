'use strict'

const express = require('express')
const hbs = require('hbs')

const router = require('./routes/routes')
const { connectDatabase } = require('./database/database')
const { logMiddleware } = require('./middlewares/log-middleware')

const app = express()
const port = 3000

hbs.registerPartials( __dirname + '/public/partials' )

// hbs
app.set('view engine', 'hbs')
app.set('views', 'public')

// servir contenido estatico
app
    .use( express.static('public/static') )
    .use( express.urlencoded({ extended: true }) )
    .use( logMiddleware )
    .use( router )

app.listen( port, async () => {

    try {
        await connectDatabase() 
        console.log('Servidor funcionando en el puerto %d', port)
    
    } catch ( error ) {
        console.error( error )
    
    }
})


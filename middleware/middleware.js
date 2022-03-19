const fs = require('fs')
const path = require('path')
const { getSession } = require("../helpers/helpers")

async function loggedMiddleware( request, response, next ) {
    
    const { cookies } = request

    // console.log( cookies )

    if ( 'session_id' in cookies ) {

        // busca en la bd el registro en session
        try {
            
            const data = JSON.parse( cookies.session_id )
            const session = await getSession({ session_id: data.session_id })

            // console.log({ data, session })
            
            if ( session ) {
                next()
                return
            
            } else {
                throw new Error('session no encontrada')
            }

        } catch ( error ) {
            
            // console.error( error )

            response.status(403).redirect('/logout')
            return
        }
    }

    response.status(403).redirect('/logout')
}

function logsMiddleware( request, response, next ) {
    
    // event onfinish se ejecuta al finalizar cada peticion

    response.once('finish', () => {
        
        const getActualRequestDurationInMilliseconds = ( start = process.hrtime() ) => {

            // console.log( start )

            const NS_PER_SEC = 1e9; // constant to convert to nanoseconds
            const NS_TO_MS = 1e6; // constant to convert to milliseconds
            
            // devuelve
            const diff = process.hrtime(start);
            
            // console.log( (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS )

            return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
        };

        const currentDatetime = new Date()
        const method = request.method
        const url = request.url
        const status = response.statusCode
        const duration = getActualRequestDurationInMilliseconds( process.hrtime() )

        let formatedDate = (`${currentDatetime.getFullYear()}-${currentDatetime.getMonth() + 1 > 9 ? (currentDatetime.getMonth() + 1) : '0' + (currentDatetime.getMonth() + 1)  }-${currentDatetime.getDate()}`)
        formatedDate += (` ${currentDatetime.getHours()}:${currentDatetime.getMinutes() > 9 ? currentDatetime.getMinutes() : '0' + currentDatetime.getMinutes() }:${currentDatetime.getSeconds() > 9 ? currentDatetime.getSeconds() : '0' + currentDatetime.getSeconds()}`)
        
        const log = (`[${formatedDate}] ${status} ${method} : ${url} ${duration.toLocaleString()}ms.`)
        
        // escribe los datos en el archivo
        const route = path.join( __dirname, '..', '/storage/express.log' )

        fs.appendFile( route, (log + "\n"), ( error ) => {
            if ( error ) {
                console.error( error )
            }
        })

        console.log( log )
    })

    next()
}

module.exports = { loggedMiddleware, logsMiddleware }
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

module.exports = { loggedMiddleware }
const state = require('../state/state')

function loggedMiddleware( request, response, next ) {
    
    const { cookies } = request

    if ( 'session_id' in cookies ) {

        if ( request.session.isAuth ) {

            next()

            return;
        }

        response.status(403).redirect('/')

        return
    }

    response.status(403).redirect('/')
}

module.exports = { loggedMiddleware }
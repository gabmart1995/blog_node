const state = require('../state/state')

function loggedMiddleware( request, response, next ) {
    
    // console.log('paso por el middleware')

    const { login } = state.getState()

    if ( !login ) {
        
        response.redirect('/')

        return
    }

    next()
}

module.exports = { loggedMiddleware }
const express = require('express')
const router = express.Router()
const { insertUser, loginUser, getCategories, getLastEntries } = require('../helpers/helpers')
const state = require('../state/state')

const regex = Object.freeze({
    string: (/^[A-Za-z\s]{1,25}$/),
    emailString: (/^[a-z0-9]+@[a-z]{4,}\.[a-z]{3,}$/) 
})

// index
router.get('/', async ( request, response ) => {
    
    try {

        const categories = await getCategories()
        const lastEntries = await getLastEntries()

        state.dispatch( state.getCategoriesAction( categories ) )
        state.dispatch( state.getLastEntriesAction( lastEntries ) )

    } catch ( error ) {

        state.dispatch( state.getCategoriesAction([]) )
        state.dispatch( state.getLastEntriesAction([]) )
        
        console.log( error )
        
    } finally {
        
        // console.log( state.getState() )
        response.render('index', state.getState() )

        // limpia el estado despues de renderizar la vista
        // para la limpieza de los formularios
        state.clearState()
    }
})

// logout session
router.get('/logout', ( request, response ) => {

    const STATE = state.getState()

    if ( STATE.login ) {
        state.dispatch( state.logoutAction() )
    }

    console.log( STATE )

    response.redirect('/')
})

// register
router.post('/register', async ( request, response ) => {
    
    const form = request.body
    const errors = new Map()

    if ( !form.name || !regex.string.test( form.name.trim() ) ) {
        errors.set('name', 'el nombre no es valido')
    }

    if ( !form.surname || !regex.string.test( form.surname.trim() ) ) {
        errors.set('surname', 'el apellido es valido')
    }

    if ( !form.email || !regex.emailString.test( form.email.trim() ) ) {
        errors.set('email', 'El email no es valido')
    }

    if ( !form.password || form.password.trim().length === 0 ) {
        errors.set('password', 'password esta vacio')
    }

    // comprobacion del Map Object
    if ( errors.size > 0 ) {
        
        // console.log( errors )

        state.dispatch( state.registerAction( false ) )
        state.dispatch( 
            state.errorsRegisterAction({
                name: errors.get('name'),
                surname: errors.get('surname'),
                email: errors.get('email'),
                password: errors.get('password')
            }) 
        )

    } else {
        
        try {
                
            await insertUser( form );

            state.dispatch( state.registerAction( true ) )
            
        } catch ( error ) {

            // console.error( error )
            errors.set('general', 'Fallo al guardar usuario')

            state.dispatch( state.registerAction( false ) )
            state.dispatch( 
                state.errorsRegisterAction({
                    name: errors.get('name'),
                    surname: errors.get('surname'),
                    email: errors.get('email'),
                    password: errors.get('password'),
                    general: errors.get('general')
                }) 
            )
        }
    }

    // redirecciona al index
    response.redirect('/');
})

// login
router.post('/login', async ( request, response ) => {
    
    const form = request.body
    const errorsLogin = new Map()

    if ( !form.email || !regex.emailString.test( form.email.trim() )  ) {
        errorsLogin.set('email', 'El email no es valido')
    }

    if ( !form.password || form.password.trim().length === 0 ) {
        errorsLogin.set('password', 'El password no es valido')
    }

    // comprobacion de errores
    if ( errorsLogin.size > 0 ) {
    
        state.dispatch( state.loginAction( false ) )
        state.dispatch( 
            state.errorsLoginAction({
                email: errorsLogin.get('email'),
                password: errorsLogin.get('password')
            }) 
        )
        
    } else {
        
        try {
            
           const userLogged = await loginUser( form )

            state.dispatch( state.loginAction( true ) )
            state.dispatch( state.userLoggedAction( userLogged ) )
            
        } catch ( error ) {
            
            state.dispatch( state.loginAction( false ) )
            state.dispatch( 
                state.errorsLoginAction({
                    email: errorsLogin.get('email'),
                    password: errorsLogin.get('password'),
                    general: error.message
                }) 
            )   
        }
    
    }

    response.redirect('/')
})

module.exports = router
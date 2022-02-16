const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const { executeQuery, SQL } = require('../database/database')
const state = require('../state/state')

const regex = Object.freeze({
    string: (/^[A-Za-z\s]{1,25}$/),
    emailString: (/^[a-z0-9]+@[a-z]{4,}\.[a-z]{3,}$/) 
})

router.get('/', ( request, response ) => {
    
    response.render('index', state.getState() )

    // limpia el estado despues de renderizar la vista
    // para la limpieza de los formularios
    state.clearState()
})

// register
router.post('/register', async ( request, response ) => {
    
    const form = request.body;
    
    const errors = new Map()
    const insertUser = () => new Promise( ( resolve, reject ) => {
        
        executeQuery(SQL.register, form, ( error ) => {
            
            if ( error ) {
                
                console.error( error )
                errors.set('general', 'Fallo al guardar usuario')

                reject( error )
                
                return 
            }
            
            resolve()
        })
    })


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
                
            let password_cifer = bcrypt.hashSync( form.password, 4 )    
            form.password = password_cifer

            await insertUser();

            state.dispatch( state.registerAction( true ) )
            
        } catch ( error ) {

            // console.error( error )

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

router.post('/login', async ( request, response ) => {
    
    const form = request.body
    const errorsLogin = new Map()
    const login = () => new Promise(( resolve, reject ) => {

        executeQuery( SQL.login, form, ( error, results ) => {

            if ( error ) {

                console.error( error )
                errorsLogin.set('general', 'Problemas al autenticar usuario')

                reject( error )
                
                return;
            }

            // console.log( results )

            if ( results.length > 0 ) {

                let [ userLogged ] = results;

                if ( bcrypt.compareSync( form.password,  userLogged.password ) ) {
                    
                    // console.log('usuario logueado');
                    
                    resolve( userLogged );
                    
                    return;
                }
            }

            // console.log('credenciales invalidas');

            errorsLogin.set('general', 'Credenciales invalidas')

            reject('Credenciales invalidas')
        })
    })

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
            
           const userLogged = await login()

            state.dispatch( state.loginAction( true ) )
            state.dispatch( state.userLoggedAction( userLogged ) )
            
        } catch ( error ) {
            
            state.dispatch( state.loginAction( false ) )
            state.dispatch( 
                state.errorsLoginAction({
                    email: errorsLogin.get('email'),
                    password: errorsLogin.get('password'),
                    general: errorsLogin.get('general')
                }) 
            )   
        }
    
    }

    response.redirect('/')
})

module.exports = router
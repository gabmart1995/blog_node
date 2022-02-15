const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const { executeQuery, SQL } = require('../database/database')
const state = require('../state/state')

router.get('/', ( request, response ) => {
    
    response.render('index', state.getState() )

    // limpia el estado despues de renderizar la vista
    // para la limpieza de los formularios
    state.clearState()
})

// register
router.post('/register', async ( request, response ) => {
    
    const form = request.body;
    const regex = Object.freeze({
        string: (/^[A-Za-z\s]{1,25}$/),
        emailString: (/^[a-z0-9]+@[a-z]{4,}\.[a-z]{3,}$/) 
    })
    
    const errors = new Map()
    const insertUser = () => new Promise( ( resolve, reject ) => {
        
        executeQuery(SQL.register, form, ( error ) => {
            
            if ( error ) {
                
                console.error( error )
                errors.set('general', 'Fallo al guardar usuario')

                reject( error )
                
                return 
            }
            
            register = true

            resolve()
        })
    })

    // flag de registro
    let register = false

    if ( !form.name || !regex.string.test( form.name ) ) {
        errors.set('name', 'el nombre no es valido')
    }

    if ( !form.surname || !regex.string.test( form.surname ) ) {
        errors.set('surname', 'el apellido es valido')
    }

    if ( !form.email || !regex.emailString.test( form.email ) ) {
        errors.set('email', 'El email no es valido')
    }

    if ( !form.password || form.password.length === 0 ) {
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

module.exports = router
const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const { executeQuery, SQL } = require('../database/database')

router.get('/', ( request, response ) => {
    response.render('index')
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

    let name = form.name || false
    let surname = form.surname || false
    let email = form.email || false
    let password = form.password || false
    
    // flag de registro
    let register = false

    if ( !name || !regex.string.test( name ) ) {
        errors.set('name', 'el nombre no es valido')
    }

    if ( !surname || !regex.string.test( surname ) ) {
        errors.set('surname', 'el apellido es valido')
    }

    if ( !email || !regex.emailString.test( email ) ) {
        errors.set('email', 'El email no es valido')
    }

    if ( !password || password.length === 0 ) {
        errors.set('password', 'password esta vacio')
    }

    // comprobacion del Map Object
    if ( errors.size > 0 ) {
        
        console.log( errors )
        
        response.render('index', { 
            register, 
            errorsRegister: {
                name: errors.get('name'),
                surname: errors.get('surname'),
                email: errors.get('email'),
                password: errors.get('password')
            } 
        })

    } else {
        
        try {
                
            let password_cifer = bcrypt.hashSync( password, 4 )    
            form.password = password_cifer

            await insertUser();

            response.render('index', { register })
            
        } catch ( error ) {

            console.log( error )

            response.render('index', { 
                register, 
                errorsRegister: {
                    name: errors.get('name'),
                    surname: errors.get('surname'),
                    email: errors.get('email'),
                    password: errors.get('password'),
                    general: errors.get('general')
                }
            })
        }
    }
})

module.exports = router
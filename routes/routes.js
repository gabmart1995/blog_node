const express = require('express')
const router = express.Router()
const { 
    insertUser, 
    loginUser, 
    getCategories, 
    getLastEntries, 
    insertCategory, 
    createEntries, 
    updateUser,
    getAllEntries
} = require('../helpers/helpers')

const state = require('../state/state')

const regex = Object.freeze({
    string: (/^[A-Za-z\s]{1,25}$/),
    descriptionString: (/^[A-Za-z0-9\s]{1,255}$/),
    emailString: (/^[a-z0-9]+@[a-z]{4,}\.[a-z]{3,}$/),
    onlyNumbers: (/^[0-9]+$/) 
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

    // console.log( STATE )

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

// profile
router.get('/profile', async ( request, response ) => {

    const { login } = state.getState()

    if ( !login ) {
        response.redirect('/')

        return
    }

    try {
        const categories = await getCategories()  
        state.dispatch( state.getCategoriesAction( categories ) )      
    
    } catch ( error ) {

        state.dispatch( state.getCategoriesAction([]) )
        console.log( error )
    
    } finally {
        response.render('profile', state.getState())
        state.clearState()
    }
})

// update-user
router.post('/update-profile', async ( request, response ) => {

    const form = request.body
    const errorsProfile = new Map()
    const userLogged = state.getState().userLogged

    if ( !form.name || !regex.string.test( form.name.trim() ) ) {
        errorsProfile.set('name', 'El nombre no es valido')
    }

    if ( !form.surname || !regex.string.test( form.surname.trim() ) ) {
        errorsProfile.set('surname', 'El apellido no es valido')
    }

    if ( !form.email || !regex.emailString.test( form.email.trim() ) ) {
        errorsProfile.set('email', 'El email no es valido')
    }

    if ( !form.password || form.password.trim().length === 0 ) {
        errorsProfile.set('password', 'password esta vacio')
    }

    if ( errorsProfile.size > 0 ) {
        
        // console.log( errorsProfile )

        state.dispatch( state.registerAction( false ) )
        state.dispatch( 
            state.errorsProfileAction({
                name: errorsProfile.get('name'),
                surname: errorsProfile.get('surname'),
                email: errorsProfile.get('email'),
                password: errorsProfile.get('password')
            })        
        )
    
    } else {
        
        try {
            
            const user = await updateUser({ ...form, id: userLogged.id })
            
            state.dispatch( state.registerAction( true ) )
            
            // cambia los datos del usuario en el estado
            state.dispatch( state.userLoggedAction({
                    nombre: user.name,
                    apellidos: user.surname,
                    id: user.id,
                    email: user.email,
                    fecha: userLogged.fecha
                }) 
            )

            // console.log( state.getState() )
        
        } catch ( error ) {

            state.dispatch( state.registerAction( false ) )
            state.dispatch( 
                state.errorsProfileAction({
                    name: errorsProfile.get('name'),
                    surname: errorsProfile.get('surname'),
                    email: errorsProfile.get('email'),
                    password: errorsProfile.get('password'),
                    general: error.message
                }) 
            )

        }
    }

    response.redirect('/profile')
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

// category
router.get('/create-category', async ( request, response ) => {

    const { login } = state.getState()
    
    // verificar si el usuario esta logueado
    if ( !login ) {
        
        response.redirect('/')
        
        return
    }

    try {
        
        const categories = await getCategories()   
        state.dispatch( state.getCategoriesAction( categories ) )
    
    } catch (error) {
        
        console.error( error )
        state.dispatch( state.getCategoriesAction( null ) )

    } finally {
        
        response.render('create-category', state.getState() )
        state.clearState()
    }
})


router.post('/save-category', async ( request, response ) => {
    
    const form = request.body;
    const errorsCategory = new Map()

    if ( !form.nombre || !regex.string.test( form.nombre.trim() ) ) {
        errorsCategory.set('nombre', 'El nombre de la categoria no es valido')
    }

    if ( errorsCategory.size > 0 ) {

        // console.log( errorsCategory )

        state.dispatch( state.registerAction( false ) )
        state.dispatch( 
            state.errorsCategoryAction({
                nombre: errorsCategory.get('nombre')
            }) 
        )

        response.redirect('/create-category')

    } else {
        
        try {
            
            await insertCategory( form )
            
            state.dispatch( state.registerAction( true ) )

            response.redirect('/')

        } catch ( error ) {
            
            // console.error( error )

            state.dispatch( state.registerAction( false ) )
            state.dispatch( 
                state.errorsCategoryAction({
                    nombre: errorsCategory.get('nombre'),
                    general: error.message
                }) 
            )

            response.redirect('/create-category')
        }
    }
})

router.get('/create-entries', async ( request, response ) => {

    const { login } = state.getState()

    if ( !login ) {
        response.redirect('/')

        return
    }

    try {

        const categories = await getCategories()
        state.dispatch( state.getCategoriesAction( categories ) )

    } catch ( error ) {

        console.error( error )
        state.dispatch( state.getCategoriesAction( null ) )

    } finally {

        // console.log( state.getState() )
        
        response.render('create-entries', state.getState())

        state.clearState()
    }
})

router.post('/save-entries', async ( request, response ) => {

    const form = request.body
    const errorsEntries = new Map()

    if ( !form.titulo || !regex.descriptionString.test( form.titulo ) ) {
        errorsEntries.set('titulo', 'El titulo de la entrada no es valido')
    }

    if ( !form.descripcion || !regex.descriptionString.test( form.descripcion ) ) {
        errorsEntries.set('descripcion', 'La descripcion no es valida')
    }

    if ( !form.categoria || !regex.onlyNumbers.test( form.categoria ) ) {
        errorsEntries.set('categoria', 'debe seleccionar al menos una categoria')
    }

    if ( errorsEntries.size > 0 ) {

        // console.log( errorsEntries )

        state.dispatch( state.registerAction( false ) )
        state.dispatch( 
            state.errorsEntriesAction({
                titulo: errorsEntries.get('titulo'),
                descripcion: errorsEntries.get('descripcion'),
                categoria: errorsEntries.get('categoria')
            }) 
        )

        response.redirect('/create-entries')

        return

    } else {
        
        try {
            
            await createEntries({ 
                titulo: form.titulo.trim(),
                descripcion: form.descripcion.trim(),
                usuario_id: state.getState().userLogged.id,
                categoria_id: Number( form.categoria )
            })

            state.dispatch( state.registerAction( true ) )

            response.redirect('/')
            
        } catch ( error ) {

            // console.log( error.message )

            state.dispatch( state.registerAction( false ) )
            state.dispatch( 
                state.errorsEntriesAction({
                    titulo: errorsEntries.get('titulo'),
                    descripcion: errorsEntries.get('descripcion'),
                    categoria: errorsEntries.get('categoria'),
                    general: error.message
                }) 
            )

            response.redirect('/create-entries')
        }
    }
})

router.get('/entries', async ( request, response ) => {
    
    try {
        const entries = await getAllEntries()
        const categories = await getCategories()

        state.dispatch( state.getCategoriesAction( categories ) )
        state.dispatch( state.getEntriesAction( entries ) )

    } catch (error) {

        state.dispatch( state.getCategoriesAction([]) )
        state.dispatch( state.getEntriesAction([]) )
    
    } finally {
        response.render('entries', state.getState())
        state.clearState()
    }
})



// route 404
router.all('*', ( request, response ) => {
    response.status(404)
    response.send('not found')
})

module.exports = router
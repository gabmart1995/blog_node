const express = require('express')
const router = express.Router()
const helpers = require('../helpers/helpers')

const state = require('../state/state')
const { loggedMiddleware } = require('../middleware/middleware')

const regex = Object.freeze({
    string: (/^[A-Za-z\s]{1,25}$/),
    descriptionString: (/^[A-Za-z0-9\.\,\s]{1,1000}$/),
    emailString: (/^[a-z0-9]+@[a-z]{4,}\.[a-z]{3,}$/),
    onlyNumbers: (/^[0-9]+$/) 
})

// index
router.get('/', async ( request, response ) => {

    // console.log( 'session_id' in request.cookies )

    try {

        const categories = await helpers.getCategories()
        state.dispatch( state.getCategoriesAction( categories ) )
        
        const lastEntries = await helpers.getLastEntries()
        state.dispatch( state.getLastEntriesAction( lastEntries ) )

    } catch ( error ) {

        state.dispatch( state.getCategoriesAction([]) )
        state.dispatch( state.getLastEntriesAction([]) )
        
        console.log( error )
        
    } finally {
        
        const { cookies } = request

        // console.log( state.getState() )
        
        response.render('index', { 
            ...state.getState(), 
            login: 'session_id' in cookies || false, 
            userLogged: 'session_id' in cookies ? 
                JSON.parse( cookies.session_id ).userLogged : null
        })


        // limpia el estado despues de renderizar la vista
        // para la limpieza de los formularios
        state.clearState()

    }
})

// logout session
router.get('/logout', async ( request, response ) => {

    const STATE = state.getState()

    if ( STATE.login ) {
        state.dispatch( state.logoutAction() )
    }

    // console.log( STATE )

    try {

        await helpers.deleteSesion({ session_id: request.session.id })

        request.session.isAuth = false

        // limpia las cookie
        response.clearCookie('session_id')
        response.clearCookie('connect.sid')

        // destruye la session
        request.session.destroy()
    
    } catch ( error ) {

        console.error( error )
    }


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
                
            await helpers.insertUser( form );

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
router.get('/profile', [ loggedMiddleware ], async ( request, response ) => {

    try {
        const categories = await helpers.getCategories()  
        state.dispatch( state.getCategoriesAction( categories ) )      
    
    } catch ( error ) {

        state.dispatch( state.getCategoriesAction([]) )
        console.log( error )
    
    } finally {
        
        const { cookies } = request

        response.render('profile', { 
            ...state.getState(),
            login: 'session_id' in cookies || false, 
            userLogged: 'session_id' in cookies ? 
                JSON.parse( cookies.session_id ).userLogged : null
        })
        
        state.clearState()
    }
})

// update-user
router.post('/update-profile', async ( request, response ) => {

    const form = request.body
    const errorsProfile = new Map()
    const userLogged = JSON.parse( request.cookies.session_id ).userLogged

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
            
            await helpers.updateUser({ ...form, id: userLogged.id })
            
            // eliminamos la cookie y le pedimos al usuario que se authentique
            // para registrar nuevamente la session
            response.clearCookie('session_id')
        
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
            
            const userLogged = await helpers.loginUser( form )
            const TIME_EXPIRED_SESSION = ( 1000 * 60 * 60 * 24 ) 

            request.session.isAuth = true

            // registramos en la bd la session del usuario
            await helpers.createSesion({
                session_id: request.session.id,
                expires: Date.now() + TIME_EXPIRED_SESSION,
                data: ''
            })

            // enviamos la cookie al cliente
            response.cookie(
                'session_id', 
                JSON.stringify({
                    session_id: request.session.id,
                    userLogged: { ...userLogged }
                }),  
                { maxAge: TIME_EXPIRED_SESSION }
            )
            
            // establecemos el estado
            state.dispatch( state.loginAction( true ) )
            state.dispatch( state.userLoggedAction( userLogged ) )

            // console.log( request.session.id )
            
        } catch ( error ) {
            
            console.error( error )

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
router.get('/create-category', [ loggedMiddleware ], async ( request, response ) => {

    try {
        
        const categories = await helpers.getCategories()   
        state.dispatch( state.getCategoriesAction( categories ) )
    
    } catch (error) {
        
        console.error( error )
        state.dispatch( state.getCategoriesAction( null ) )

    } finally {

        const { cookies } = request
        
        response.render('create-category', {
            ...state.getState(),
            login: 'session_id' in cookies || false, 
            userLogged: 'session_id' in cookies ? 
                JSON.parse( cookies.session_id ).userLogged : null
        })

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
            
            await helpers.insertCategory( form )
            
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

// category
router.get('/category', async ( request, response ) => {
    
    const { id } = request.query 

    if ( !regex.onlyNumbers.test( id ) ) {
        response.redirect('/')
        return
    }

    try {
        
        // busca la cateogria
        const category = await helpers.getCategory( Number( id ) )
        
        // si no halla la categoria redirecciona al index
        if ( !category ) {
            response.redirect('/')
            return
        }
        
        // entradas por categoria
        const categories = await helpers.getCategories()
        const entries = await helpers.getEntriesByCategory( id )
        
        // console.log({ category, entries })
        
        state.dispatch( state.getCategoriesAction( categories ) )
        state.dispatch( state.setCategoryAction( category ) )
        state.dispatch( state.getEntriesByCategoryAction( entries ) )

    } catch ( error ) {

        console.error( error )

        state.dispatch( state.getCategoriesAction([]) )
        state.dispatch( state.setCategoryAction( null ) )
        state.dispatch( state.getEntriesByCategoryAction([]) )
        
        
    } finally {

        const { cookies } = request
        
        const data = {
            ...state.getState(), 
            login: 'session_id' in cookies || false, 
            userLogged: 'session_id' in cookies ? 
                JSON.parse( cookies.session_id ).userLogged : null,
        }

        response.render('category', data )

        state.clearState()
    }
})

// entries
router.get('/create-entries', [ loggedMiddleware ], async ( request, response ) => {

    try {

        const categories = await helpers.getCategories()
        state.dispatch( state.getCategoriesAction( categories ) )

    } catch ( error ) {

        console.error( error )
        state.dispatch( state.getCategoriesAction( null ) )

    } finally {

        // console.log( state.getState() )        
        const { cookies } = request
        const data = {
            ...state.getState(), 
            login: 'session_id' in cookies || false, 
            userLogged: 'session_id' in cookies ? 
                JSON.parse( cookies.session_id ).userLogged : null,
        }
        
        response.render('create-entries', data)

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
            
            const { cookies } = request

            await helpers.createEntries({ 
                titulo: form.titulo.trim(),
                descripcion: form.descripcion.trim(),
                usuario_id: JSON.parse( cookies.session_id ).userLogged.id,
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

// get entry
router.get('/entries', async ( request, response ) => {
    
    try {
        const entries = await helpers.getAllEntries()
        const categories = await helpers.getCategories()

        // console.log( entries )

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

router.get('/entry', async ( request, response ) => {

    const { id } = request.query
    const { cookies } = request

    let isAuthor = false  // flag autor del post

    if ( !regex.onlyNumbers.test( id ) ) {
        response.redirect('/')
        return
    }

    try {

        const categories = await helpers.getCategories()
        const entry = await helpers.getEntry( Number( id ) )
        
        if ( 'session_id' in cookies ) {
            isAuthor = entry.usuario_id === JSON.parse( cookies.session_id ).userLogged.id;
        }

        state.dispatch( state.getCategoriesAction( categories ) )
        state.dispatch( state.setEntryAction( entry ) )
        
        // console.log( entry )

    } catch ( error ) {

        state.dispatch( state.getCategoriesAction([]) )
        state.dispatch( state.setEntryAction( null ) )

        // console.log( error )
    
    } finally {

        const data = {
            ...state.getState(), 
            login: 'session_id' in cookies || false, 
            userLogged: 'session_id' in cookies ? 
                JSON.parse( cookies.session_id ).userLogged : null,
            isAuthor
        }

        response.render('entry', data )

        state.clearState()
    }
})

router.get('/delete-entry', async ( request, response ) => {
    
    const { id } = request.query
    const { cookies } = request

    if ( !regex.onlyNumbers.test( id ) ) {
        
        response.redirect('/')
        
        return 
    }
    
    try {
        
        await helpers.deleteEntry( Number( id ), JSON.parse( cookies.session_id ).userLogged.id )

        state.dispatch( state.setDelete() )
        

    } catch ( error ) {

        console.error( error )
    
    } finally {

        response.redirect('/')
        
        // state.clearState()
    }
})

router.get('/edit-entry', [ loggedMiddleware ], async ( request, response ) => {

    const { id } = request.query

    if ( !regex.onlyNumbers.test( id ) ) {
        
        response.redirect('/')
        return
    }

    try {
        
        const entry = await helpers.getEntry( Number( id ) )
        
        if ( !entry ) {
            response.redirect('/')
            return
        }
        
        const categories = await helpers.getCategories()

        state.dispatch( state.setEntryAction( entry ) )
        state.dispatch( state.getCategoriesAction( categories ) )

    } catch ( error ) {

        console.error( error )

        state.dispatch( state.setEntryAction( null ) )
        state.dispatch( state.getCategoriesAction([]) )

    } 
    
    const { cookies } = request
    const data = {
        ...state.getState(), 
        login: 'session_id' in cookies || false, 
        userLogged: 'session_id' in cookies ? 
            JSON.parse( cookies.session_id ).userLogged : null,
    }

    response.render('edit-entries', data )
    state.clearState()
})

router.post('/update-entries', async ( request, response ) => {
    
    const form = request.body
    const { id } = request.query
    const errorsEntries = new Map()
    
    // console.log({ id, form })

    if ( !regex.onlyNumbers.test( id ) ) {
        errorsEntries.set('id', 'el identificador de la entrada no es válido')
    }

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

        state.dispatch( 
            state.errorsEntriesAction({
                titulo: errorsEntries.get('titulo'),
                descripcion: errorsEntries.get('descripcion'),
                categoria: errorsEntries.get('categoria'),
                id: errorsEntries.get('id')
            }) 
        )

        state.dispatch( state.updateAction( false ) )
                
    } else {
        
        try {
            
            // console.log('usuario: ' + JSON.parse( request.cookies.session_id ).userLogged.id )

            await helpers.updateEntries({ 
                ...form, 
                categoria: Number( form.categoria ), 
                id: Number( id ), 
                usuario_id: JSON.parse( request.cookies.session_id ).userLogged.id
            })

            state.dispatch( state.updateAction( true ) )
            
        } catch ( error ) {
        
            state.dispatch( 
                state.errorsEntriesAction({
                    titulo: errorsEntries.get('titulo'),
                    descripcion: errorsEntries.get('descripcion'),
                    categoria: errorsEntries.get('categoria'),
                    id: errorsEntries.get('id'),
                    general: error.message
                })
            )

            state.dispatch( state.updateAction( false ) )
        }
    }
    
    response.redirect( '/edit-entry?id=' + id )
})

router.post('/search', async ( request, response ) => {

    const form = request.body
    const errorsSearch = new Map()

    // console.log( form )

    if ( !regex.string.test( form.busqueda ) ) {
        errorsSearch.set('search', 'El patrón de busqueda no es válido')
    }

    if ( errorsSearch.size > 0 ) {
        
        // console.log( errorsSearch )
        
        state.dispatch( 
            state.setErrorsSearchAction({ busqueda: errorsSearch.get('search') }) 
        )
        
    } else {

        try {
            
            const entries = await helpers.searchEntries({ search: '%' + form.busqueda + '%' })
            const categories = await helpers.getCategories()

            // console.log( entries )

            state.dispatch( state.getEntriesAction( entries ) )
            state.dispatch( state.getCategoriesAction( categories ) )

        } catch ( error ) {
            
            state.dispatch( state.getEntriesAction([]) )
            state.dispatch( state.getCategoriesAction([]) )

            state.dispatch( 
                state.setErrorsSearchAction({ 
                    search: errorsSearch.get('search'), 
                    general: error.message
                }) 
            )
        }
    }

    const { cookies } = request
    const data = {
        ...state.getState(), 
        login: 'session_id' in cookies || false, 
        userLogged: 'session_id' in cookies ? 
            JSON.parse( cookies.session_id ).userLogged : null,
            search: form.busqueda
    }

    // renderiza la vista de resultados
    response.render('search', data )

    state.clearState()
})

// route 404
router.all('*', async ( request, response ) => {

    try {
        
        const categories = await helpers.getCategories()

        state.dispatch( state.getCategoriesAction( categories ) )

    } catch ( error ) {
        
        console.error( error )

        state.dispatch( state.getEntriesAction([]) )
    
    } finally {

        const { cookies } = request
        const data = {
            ...state.getState(), 
            login: 'session_id' in cookies || false, 
            userLogged: 'session_id' in cookies ? 
                JSON.parse( cookies.session_id ).userLogged : null,
        }

        response
            .status(404)
            .render('404', data )

        state.clearState()
    }

})

module.exports = router
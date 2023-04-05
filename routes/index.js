const express = require('express')
const router = express.Router()
const helpers = require('../helpers/helpers')
const { loggedMiddleware } = require('../middleware/middleware')

const regex = Object.freeze({
    string: (/^[A-Za-z\s]{1,25}$/),
    descriptionString: (/^[\w\.\,\s]{1,1000}$/),
    emailString: (/^[a-z\_0-9]+@[a-z]{4,}\.[a-z]{3,}$/),
    onlyNumbers: (/^[0-9]+$/) 
})

// index
router.get('/', async ( request, response ) => {

    let categories = []
    let lastEntries = []

    try {
        
        categories = await helpers.getCategories()
        lastEntries = await helpers.getLastEntries()
    
    } catch ( error ) {
        console.log( error )
    
    } finally {

        const login = request.session.isAuth || false
        const [ register ] = request.flash('register')
        const [ errorsLogin ] = request.flash('errorsLogin')
        const [ errorsRegister ] = request.flash('errorsRegister')

        response.render('index', {
            categories,
            lastEntries,
            register: register || false,
            errorsRegister: errorsRegister || null,
            login,
            errorsLogin: errorsLogin || null,
            userLogged: request.session.userLogged || null,
            year: request.year || new Date().getFullYear()
        })
    }
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

    if ( errorsLogin.size > 0 ) {

        request.flash('errorsLogin', {
            email: errorsLogin.get('email'),
            password: errorsLogin.get('password')
        })
    
    } else {
        
        try {
            
            const userLogged = await helpers.loginUser( form )

            request.session.userLogged = userLogged
            request.session.isAuth = true

            // guarda los cambios de la session en el store
            request.session.save(( error ) => {

                if ( error ) {
                    console.error( error )
                }
            })  

        } catch ( error ) {
            
            request.flash('errorsLogin', {
                general: error.message
            })
        }
    }

    response.redirect('/')
})

// logout session
router.get('/logout', async ( request, response ) => {

    // limpia la session
    request.session.destroy(( error ) => {

        if ( error ) {
            console.error( error )
            return
        }
    
        response.redirect('/')
    })
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

    if ( errors.size > 0 ) {

        request.flash('errorsRegister', {
            name: errors.get('name'),
            surname: errors.get('surname'),
            email: errors.get('email'),
            password: errors.get('password')
        })

    } else {

        try {
                
            await helpers.insertUser( form );

            request.flash('register', true)
            
        } catch ( error ) {

            // console.error( error )

            errors.set('general', 'Fallo al guardar usuario')

            request.flash('errorsRegister', {
                general: error.message
            })
        }
    }

    response.redirect('/')
})

// profile
router.get('/profile', [ loggedMiddleware ], async ( request, response ) => {

    const userLogged = request.session.userLogged || null
    
    let categories = []
    let profile = null

    try {

        categories = await helpers.getCategories()  
        profile = await helpers.getUserLogged( userLogged.id )

    } catch ( error ) {
        console.log( error )
    
    }

    const login = request.session.isAuth || false
    const [ register ] = request.flash('register')
    const [ update ] = request.flash('update')
    const [ errorsLogin ] = request.flash('errorsLogin')
    const [ errorsRegister ] = request.flash('errorsRegister')
    const [ errorsProfile ] = request.flash('errorsProfile')

    response.render('profile', { 
        login, 
        userLogged,
        categories,
        year: request.year || new Date().getFullYear(),
        register: register || false,
        errorsRegister: errorsRegister || null,
        login,
        errorsLogin: errorsLogin || null,
        errorsProfile: errorsProfile || null,
        update,
        profile 
    })  
})

// update-user
router.post('/update-profile', async ( request, response ) => {

    const form = request.body
    const errorsProfile = new Map()
    const userLogged = request.session.userLogged

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

        request.flash('errorsProfile', {
            name: errorsProfile.get('name'),
            surname: errorsProfile.get('surname'),
            email: errorsProfile.get('email'),
            password: errorsProfile.get('password')
        })
    
    } else {

        try {
            
            const update = { ...form, id: userLogged.id  }

            await helpers.updateUser( update )

            request.flash('update', true)

            request.session.userLogged = { 
                ...update, 
                nombre: update.name, 
                apellidos: update.surname 
            }

            request.session.save(( error ) => {

                if ( error ) {
                    console.error( error )
                }
            })
        
        } catch ( error ) {

            request.flash('errorsProfile', {
                general: error.message
            })
        }
    }

    response.redirect('/profile')
})

// category
router.get('/create-category', [ loggedMiddleware ], async ( request, response ) => {

    let categories = []

    try {
        
        categories = await helpers.getCategories()   
    
    } catch (error) {
        
        console.error( error )

    } finally {

        const login = request.session.isAuth || false
        const userLogged = request.session.userLogged || null
        const [ register ] = request.flash('register')
        const [ errorsLogin ] = request.flash('errorsLogin')
        const [ errorsRegister ] = request.flash('errorsRegister')
        const [ errorsCategory ] = request.flash('errorsCategory')
        
        response.render('create-category', {
            year: request.year || new Date().getFullYear(),
            categories,
            register: register || false,
            errorsRegister: errorsRegister || null,
            login,
            errorsLogin: errorsLogin || null,
            userLogged,
            errorsCategory: errorsCategory || null
        })
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

        request.flash('errorsCategory', {
            nombre: errorsCategory.get('nombre')
        })

        response.redirect('/create-category')

    } else {
        
        try {
            
            await helpers.insertCategory( form )
            
            request.flash('register', true)

            response.redirect('/')

        } catch ( error ) {
            
            // console.error( error )
            request.flash('errorsCategory', {
                general: error.message
            })
    
            response.redirect('/create-category')
        }
    }
})

// category
router.get('/category', async ( request, response ) => {
    
    const { id } = request.query 
    let category = null
    let categories = null
    let entries = []

    if ( !regex.onlyNumbers.test( id ) ) {
        response.redirect('/')
        return
    }

    try {
        
        // busca la cateogria
        category = await helpers.getCategory( Number( id ) )
        
        // si no halla la categoria redirecciona al index
        if ( !category ) {
            response.redirect('/')
            return
        }
        
        // entradas por categoria
        categories = await helpers.getCategories()
        entries = await helpers.getEntriesByCategory( id )
        
        // console.log({ category, entries })

    } catch ( error ) {

        console.error( error )        
        
    } finally {

        const login = request.session.isAuth || false
        const userLogged = request.session.userLogged || null
        const [ register ] = request.flash('register')
        const [ errorsLogin ] = request.flash('errorsLogin')
        const [ errorsRegister ] = request.flash('errorsRegister')
        
        const data = {
            login,
            userLogged,
            register,
            errorsLogin,
            errorsRegister,
            categories,
            year: request.year || new Date().getFullYear(),
            category,
            entries
        }

        response.render('category', data )
    }
})

// entries
router.get('/create-entries', [ loggedMiddleware ], async ( request, response ) => {

    let categories = null

    try {

        categories = await helpers.getCategories()

    } catch ( error ) {

        console.error( error )

    } finally {

        const login = request.session.isAuth || false
        const userLogged = request.session.userLogged || null
        const [ register ] = request.flash('register')
        const [ errorsLogin ] = request.flash('errorsLogin')
        const [ errorsRegister ] = request.flash('errorsRegister')
        const [ errorsEntries ] = request.flash('errorsEntries')

        const data = {
            register,
            errorsLogin,
            errorsRegister,
            errorsEntries, 
            login, 
            userLogged,
            categories, 
            year: request.year || new Date().getFullYear()
        }
        
        response.render('create-entries', data)
    }
})

router.post('/save-entries', async ( request, response ) => {

    const form = request.body
    const errorsEntries = new Map()
    const userLogged = request.session.userLogged || null

    if ( !form.titulo || !regex.descriptionString.test( form.titulo ) ) {
        errorsEntries.set('titulo', 'El titulo de la entrada no es valido')
    }


    if ( !form.descripcion || !regex.descriptionString.test( form.descripcion ) ) {
        errorsEntries.set('descripcion', 'La descripcion no es valida')
    }

    if ( !form.categoria || !regex.onlyNumbers.test( form.categoria ) ) {
        errorsEntries.set('categoria', 'categoría requerida')
    }

    if ( errorsEntries.size > 0 ) {

        // console.log( errorsEntries )

        request.flash('errorsEntries', {
            titulo: errorsEntries.get('titulo'),
            descripcion: errorsEntries.get('descripcion'),
            categoria: errorsEntries.get('categoria')
        })

        response.redirect('/create-entries')

        return

    } else {
        
        try {
            
            await helpers.createEntries({ 
                titulo: form.titulo.trim(),
                descripcion: form.descripcion.trim(),
                usuario_id: userLogged.id,
                categoria_id: Number( form.categoria )
            })

            response.redirect('/')
            
        } catch ( error ) {

            // console.log( error.message )

            request.flash({
                general: error.message
            }) 
            
            response.redirect('/create-entries')
        }
    }
})

// get entry
router.get('/entries', async ( request, response ) => {
    
    let entries = null
    let categories = null

    try {
        entries = await helpers.getAllEntries()
        categories = await helpers.getCategories()

    } catch (error) {

        console.error(error)
    
    } finally {

        const login = request.session.isAuth || false
        const userLogged = request.session.userLogged || null
        const [ register ] = request.flash('register')
        const [ errorsLogin ] = request.flash('errorsLogin')
        const [ errorsRegister ] = request.flash('errorsRegister')
        
        response.render('entries', {
            categories,
            year: request.year || new Date().getFullYear(),
            login,
            userLogged,
            register,
            errorsRegister,
            errorsLogin,
            entries
        })
    }
})

router.get('/entry', async ( request, response ) => {

    const { id } = request.query
    
    let isAuthor = false  // flag autor del post
    let categories = null
    let entry = null

    const userLogged = request.session.userLogged || null

    if ( !regex.onlyNumbers.test( id ) ) {
        response.redirect('/')
        return
    }

    try {

        categories = await helpers.getCategories()
        entry = await helpers.getEntry( Number( id ) )
        
        if ( userLogged ) {
            isAuthor = entry.usuario_id === userLogged.id;
        }

    } catch ( error ) {
        console.log( error )
    
    } finally {

        const login = request.session.isAuth
        const [ register ] = request.flash('register')
        const [ errorsLogin ] = request.flash('errorsLogin')
        const [ errorsRegister ] = request.flash('errorsRegister')

        const data = {
            categories,
            year: request.year || new Date().getFullYear(), 
            login, 
            userLogged,
            isAuthor,
            register,
            errorsRegister,
            errorsLogin,
            entry
        }

        response.render('entry', data )
    }
})

router.get('/delete-entry', async ( request, response ) => {
    
    const { id } = request.query
    const userLogged = request.session.userLogged || null

    if ( !regex.onlyNumbers.test( id ) ) {
        
        response.redirect('/')
        
        return 
    }
    
    try {
        
        await helpers.deleteEntry( Number( id ), userLogged.id )

    } catch ( error ) {

        console.error( error )
    
    } finally {

        response.redirect('/')
    }
})

router.get('/edit-entry', [ loggedMiddleware ], async ( request, response ) => {

    const { id } = request.query
    let categories = null
    let entry = null

    if ( !regex.onlyNumbers.test( id ) ) {
        
        response.redirect('/')
        return
    }

    try {
        
        entry = await helpers.getEntry( Number( id ) )
        
        if ( !entry ) {
            response.redirect('/')
            return
        }
        
        categories = await helpers.getCategories()

    } catch ( error ) {

        console.error( error )
    } 

    const login = request.session.isAuth
    const [ register ] = request.flash('register')
    const [ errorsLogin ] = request.flash('errorsLogin')
    const [ errorsRegister ] = request.flash('errorsRegister')
    const userLogged = request.session.userLogged || null
    const [ update ] = request.flash('update')
    const [ errorsEntries ] = request.flash('errorsEntries')

    const data = {
        login,
        register,
        errorsLogin,
        errorsRegister,
        userLogged,
        categories,
        entry,
        update,
        errorsEntries,
        year: request.year || new Date().getFullYear()
    }

    response.render('edit-entries', data )
})

router.post('/update-entries', async ( request, response ) => {
    
    const form = request.body
    const { id } = request.query
    const errorsEntries = new Map()
    const userLogged = request.session.userLogged || null
    
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
        request.flash('errorsEntries', {
            titulo: errorsEntries.get('titulo'),
            descripcion: errorsEntries.get('descripcion'),
            categoria: errorsEntries.get('categoria'),
            id: errorsEntries.get('id')
        }) 
                
    } else {
        
        try {
            
            // console.log('usuario: ' + JSON.parse( request.cookies.session_id ).userLogged.id )

            await helpers.updateEntries({ 
                ...form, 
                categoria: Number( form.categoria ), 
                id: Number( id ), 
                usuario_id: userLogged.id
            })

            request.flash('update', true)
            
        } catch ( error ) {
            
            console.error( error )

            request.flash('general', { general: error.message })
        }
    }
    
    response.redirect( '/edit-entry?id=' + id )
})

router.post('/search', async ( request, response ) => {

    const form = request.body
    const errorsSearch = new Map()

    let entries = null
    let categories = null

    if ( !regex.string.test( form.busqueda ) ) {
        errorsSearch.set('search', 'El patrón de busqueda no es válido')
    }

    if ( errorsSearch.size > 0 ) {
        
        // console.log( errorsSearch )
        
        request.flash('errorsSearch', {
            search: errorsSearch.get('search')
        })
        
    } else {

        try {
            
            entries = await helpers.searchEntries({ search: '%' + form.busqueda + '%' })
            categories = await helpers.getCategories()

            // console.log( entries )

        } catch ( error ) {
        
            console.error( error )

            request.flash('errorsSearch', {
                general: error.message
            })
        }
    }
    
    const login = request.session.isAuth
    const [ register ] = request.flash('register')
    const [ errorsLogin ] = request.flash('errorsLogin')
    const [ errorsRegister ] = request.flash('errorsRegister')
    const userLogged = request.session.userLogged || null

    const data = {
        search: form.busqueda,
        login,
        categories,
        register,
        errorsSearch,
        errorsLogin,
        errorsRegister,
        userLogged,
        entries,
        year: request.year || new Date().getFullYear()
    }

    // renderiza la vista de resultados
    response.render('search', data )
})

// route 404
router.all('*', async ( request, response ) => {

    let categories = null

    try {
        
        categories = await helpers.getCategories()

    } catch ( error ) {
        
        console.error( error )
    
    } finally {

            
        const login = request.session.isAuth
        const [ register ] = request.flash('register')
        const [ errorsLogin ] = request.flash('errorsLogin')
        const [ errorsRegister ] = request.flash('errorsRegister')
        const userLogged = request.session.userLogged || null

        const data = { 
            login, 
            userLogged,
            categories,
            register,
            errorsRegister,
            errorsLogin,
            year: request.year || new Date().getFullYear()
        }

        response
            .status(404)
            .render('404', data )
    }

})

module.exports = router

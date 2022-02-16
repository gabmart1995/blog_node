// module helpers
const bcrypt = require('bcryptjs')
const { executeQuery, SQL } = require('../database/database')

function insertUser( form ) {
    
    return new Promise(( resolve, reject ) => {

        let password_cifer = bcrypt.hashSync( form.password, 4 )    
        form.password = password_cifer
        
        executeQuery( SQL.register, form, ( error ) => {
            
            if ( error ) {
                
                console.error( error )
                
                reject( error )
                
                return 
            }
            
            resolve()
        })
    })    
}

function insertCategory( form ) {
    return new Promise(( resolve, reject ) => {
        
        executeQuery( SQL.insertCategory, form, ( error ) => {

            if ( error ) {
                console.error( error )
                
                reject( new Error('No se pudo registrar la categoria') )
                
                return
            }

            resolve()
        })
    })
}

function loginUser( form ) {

    return new Promise(( resolve, reject ) => {
        
        executeQuery( SQL.login, form, ( error, results ) => {

            if ( error ) {

                console.error( error )
                
                reject( new Error('Problemas al autenticar usuario') )
                return;
            }

            // console.log( results )

            if ( results.length > 0 ) {

                const [ userLogged ] = results;

                if ( bcrypt.compareSync( form.password,  userLogged.password ) ) {
                    // console.log('usuario logueado');   
                    resolve( userLogged );
                    return;
                }
            }

            // console.log('credenciales invalidas');

            reject( new Error('Credenciales invalidas') )
        })    
    })
}

function getCategories() {

    return new Promise(( resolve, reject ) => {
        executeQuery( SQL.getCategories, null, ( error, results ) => {
            
            if ( error ) {
                console.error( error )
                reject( error )
                return
            }

            // console.log( results )

            resolve( results )
        })
    })
}

function getLastEntries() {

    return new Promise(( resolve, reject ) => {
        executeQuery( SQL.getLastEntries, null, ( error, results ) => {
            
            if ( error ) {
                console.error( error )
                reject( error )
                return
            }

            if ( results.length === 0 ) {

                resolve( null )

                return
            }
            // console.log( results )
            results = results.map( formatEntries )
 
            resolve( results )
        })
    })
}

function formatEntries( result ) {
    
    const date = new Date( result.fecha )
                
    return {
        ...result,
        fecha: (`${ date.getDate() }-${ date.getMonth() > 9 ? date.getMonth() + 1 : '0' + ( date.getMonth() + 1 ) }-${ date.getFullYear() }`),
        descripcion: result.descripcion.slice( 0, 100 ) + ' ...'
    }
}

module.exports = {
    insertUser,
    loginUser,
    getCategories,
    getLastEntries,
    insertCategory
}
// module helpers
const bcrypt = require('bcryptjs')
const { executeQuery, SQL } = require('../database/database')

function createSesion( data ) {
    return new Promise(( resolve, reject ) => {

        executeQuery( SQL.createSession, data, ( error ) => {

            if ( error ) {
                console.error( error )

                reject( error )

                return
            }

            resolve();
        })
    })
}

function deleteSesion( data ) {
    return new Promise(( resolve, reject ) => {

        executeQuery( SQL.deleteSession, data, ( error ) => {

            if ( error ) {
                console.error( error )

                reject( error )

                return
            }

            resolve();
        })
    })
}


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

function updateUser( form ) {

    return new Promise(( resolve, reject ) => {

        // comprueba si el email existe
        executeQuery( SQL.validateEmail, { email: form.email }, ( error, results ) => {

            if ( error ) {
                
                console.error( error )
                
                reject( new Error('Ocurrio un problema con la busqueda del usuario') )
                
                return
            }

            // console.log( results )

            if ( results.length > 0 ) {

                for ( const result of results ) {
                    
                    // si el id de la base de datos coincide con la usuario logueado
                    // entonces actualiza el usuario
                    if ( result.id === form.id ) {
                        
                        let password_cifer = bcrypt.hashSync( form.password, 4 )
                        form.password = password_cifer
                        
                        executeQuery( SQL.updateUser, form, ( error ) => {
                            
                            if ( error ) {
                                
                                console.error( error )
                                
                                reject( new Error('Ocurrio un problema con la actualizacion del usuario') )
                                
                                return
                            }
                            
                            delete form.password
                            
                            resolve( form )
                        })
                        
                    } else {                    
                        
                        // en caso de colocar un email de otro usuario         
                        reject( new Error('El usuario ya existe y esta registrado en el blog') )
                    }
                }    
            
            } else {

                let password_cifer = bcrypt.hashSync( form.password, 4 )
                form.password = password_cifer
        
                executeQuery( SQL.updateUser, form, ( error ) => {
        
                    if ( error ) {
                        
                        console.error( error )
                        
                        reject( new Error('Ocurrio un problema con la actualizacion del usuario') )
                        
                        return
                    }
        
                    delete form.password
        
                    resolve( form )
                })
            }
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
                
                    delete userLogged.password

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

function getCategory( idCategory ) {

    return new Promise(( resolve, reject ) => {

        executeQuery(  SQL.getCategory, { id: idCategory }, ( error, results ) => {

            if ( error ) {
                
                console.error( error )
                
                reject( new Error('Error al obtener las categorias') )
                
                return
            }

            // console.log( results )
            
            if ( results.length === 0 ) {
                
                resolve( null )
                
                return
            }

            resolve( results[0] )
        })
    })
}

function getEntriesByCategory( idCategory ) {

    return new Promise(( resolve, reject ) => {

        executeQuery(  SQL.getEntriesByCategory, { categoria_id: idCategory }, ( error, results ) => {

            if ( error ) {
                console.error( error )
                reject( new Error('Error al obtener las entradas') )
            }

            // console.log( results )

            resolve( results.map( formatEntries ) )
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
        descripcion: result.descripcion.length > 100 ? 
            ( result.descripcion.slice( 0, 100 ) + ' ...' ) : result.descripcion
    }
}

function createEntries( form ) {
    
    return new Promise(( resolve, reject ) => {
        executeQuery( SQL.insertEntries, form, ( error ) => {
            
            if ( error ) {
                
                console.error( error )

                reject( new Error('Ocurrio un problema con el registro de la entrada') )
            
                return
            }

            resolve()
        })
    })
}

function getAllEntries() {

    return new Promise(( resolve, reject ) => {
        
        executeQuery( SQL.getEntries, null, ( error, results ) => {
            
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

function searchEntries( form ) {

    return new Promise(( resolve, reject ) => {
        
        executeQuery( SQL.searchEntries, form, ( error, results ) => {
            
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

function getEntry( idEntry ) {

    return new Promise(( resolve, reject ) => {
        
        executeQuery( SQL.getEntry, { id: idEntry }, ( error, results ) => {

            if ( error ) {
                
                console.error( error )
                
                reject( new Error('Error al obtener la entrada') )
                
                return
            }

            if ( results.length === 0 ) {
                
                resolve( null )
                
                return
            }

            let [ result ] = results
            const date = new Date( result.fecha )

            result.fecha = (`${ date.getDate() }-${ date.getMonth() > 9 ? date.getMonth() + 1 : '0' + ( date.getMonth() + 1 ) }-${ date.getFullYear() }`) 
            
            // console.log( results )
        
            resolve( result )
        })
    })
}

function deleteEntry( idEntry, idUser ) {
    
    // console.log({ idEntry, idUser });

    return new Promise(( resolve, reject ) => {

        executeQuery( SQL.deleteEntries, { id: idEntry, usuario_id: idUser }, ( error ) => {
            
            if ( error ) {

                console.error( error )
                
                reject( new Error('Error al borrar la entrada') )
                
                return 
            }

            resolve()
        })
    })
}


function updateEntries( form ) {
    
    return new Promise(( resolve, reject ) => {
        executeQuery( SQL.updateEntries, form, ( error ) => {
            
            if ( error ) {
                
                console.error( error )

                reject( new Error('Ocurrio un problema con la actualizacion de la entrada') )
            
                return
            }

            resolve()
        })
    })
}

module.exports = {
    deleteSesion,
    insertUser,
    loginUser,
    getCategories,
    getLastEntries,
    insertCategory,
    createEntries,
    updateUser,
    getAllEntries,
    getCategory,
    getEntriesByCategory,
    getEntry,
    deleteEntry,
    updateEntries,
    searchEntries,
    createSesion
}
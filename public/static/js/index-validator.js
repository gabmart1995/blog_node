/**
 * Validator JS Forms index.js
 * Author: Gabriel Martinez
 */

const [ searchForm, loginForm, registerForm ] = document.forms
const [ inputSearch ] = searchForm

inputSearch.addEventListener('input', ( $eventInput ) => {
        
    const input = $eventInput.target
    const inputButton = searchForm[1]

    // console.log( inputButton )

    input.setCustomValidity('')

    // console.log( $eventInput.target.validity )

    if ( input.validity.patternMismatch ) {
        input.setCustomValidity('El campo de busqueda es incorrecto')
        input.reportValidity()      
    }

    // cambiamos el disabled del boton
    inputButton.disabled = !input.validity.valid 
})


if ( loginForm ) {
    
    const [ inputEmail, inputPassword, loginButton ] = loginForm
    
    // events inputs
    inputPassword.addEventListener('input', ( $eventInput ) => {
        
        const input = $eventInput.target

        input.setCustomValidity('')

        // console.log( $eventInput.target.validity.valid )

        if ( input.validity.tooShort ) {
            input.setCustomValidity('Minimo 8 caracteres')
            input.reportValidity()      
        }
        
        // cambiamos el disabled del boton
        loginButton.disabled = !( input.validity.valid && inputEmail.validity.valid )
    })

    inputEmail.addEventListener('input', ( $eventInput ) => {
        
        const input = $eventInput.target
        
        input.setCustomValidity('')

        // console.log( $eventInput.target.validity.valid )

        if ( !input.validity.valid ) {
            input.setCustomValidity('El campo del correo electronico es incorrecto')
            input.reportValidity()      
        }
        
        // cambiamos el disabled del boton
        loginButton.disabled = !( input.validity.valid && inputPassword.validity.valid )
    })
}

if ( registerForm ) {

    const [ inputName, inputSurname, inputEmail, inputPassword, registerButton ] = registerForm

    const isValid = () => ( 
        inputEmail.validity.valid && 
        inputName.validity.valid &&
        inputSurname.validity.valid && 
        inputPassword.validity.valid
    )
    
    inputEmail.addEventListener('input', ( $eventInput ) => {
        
        const input = $eventInput.target
        
        input.setCustomValidity('')

        // console.log( $eventInput.target.validity.valid )

        if ( !input.validity.valid ) {
            input.setCustomValidity('El campo del correo electronico es incorrecto')
            input.reportValidity()      
        }
        
        // cambiamos el disabled del boton
        registerButton.disabled = !isValid()
    })

    inputPassword.addEventListener('input', ( $eventInput ) => {
        
        const input = $eventInput.target

        input.setCustomValidity('')

        // console.log( $eventInput.target.validity.valid )

        if ( input.validity.tooShort ) {
            input.setCustomValidity('Minimo 8 caracteres')
            input.reportValidity()      
        }
        
        // cambiamos el disabled del boton
        registerButton.disabled = !isValid()
    })

    inputName.addEventListener('input', ( $eventInput ) => {
        
        const input = $eventInput.target
    
        // console.log( inputButton )
    
        input.setCustomValidity('')
    
        // console.log( $eventInput.target.validity )
    
        if ( input.validity.patternMismatch ) {
            input.setCustomValidity('El campo nombre es incorrecto')
            input.reportValidity()      
        }
    
        // cambiamos el disabled del boton
        registerButton.disabled = !isValid() 
    })

    inputSurname.addEventListener('input', ( $eventInput ) => {
        
        const input = $eventInput.target
    
        // console.log( inputButton )
    
        input.setCustomValidity('')
    
        // console.log( $eventInput.target.validity )
    
        if ( input.validity.patternMismatch ) {
            input.setCustomValidity('El campo apellido es incorrecto')
            input.reportValidity()      
        }
    
        // cambiamos el disabled del boton
        registerButton.disabled = !isValid() 
    })
}
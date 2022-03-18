( function () {
    
    const profileForm = document.forms[1]
    
    const [ inputName, inputSurname, inputEmail, inputPassword, inputButton ] = profileForm

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
        inputButton.disabled = !isValid()
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
        inputButton.disabled = !isValid()
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

        if ( input.value.length === 0 ) {
            input.setCustomValidity('campo requerido')
            input.reportValidity()
        }
    
        // cambiamos el disabled del boton
        inputButton.disabled = !isValid() 
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

        if ( input.value.length === 0 ) {
            input.setCustomValidity('campo requerido')
            input.reportValidity()
        }
    
        // cambiamos el disabled del boton
        inputButton.disabled = !isValid() 
    })

    console.log({ profileForm })

})()

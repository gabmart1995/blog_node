(function() {

    const categoryForm = document.forms[1]
    const [ inputName, inputButton ] = categoryForm
    
    inputName.addEventListener('input', ( $eventInput ) => {
        
        const input = $eventInput.target
    
        input.setCustomValidity('')
    
        if ( input.validity.patternMismatch ) {
            input.setCustomValidity('El campo nombre es incorrecto')
            input.reportValidity()      
        }

        if ( input.value.length === 0 ) {
            input.setCustomValidity('campo requerido')
            input.reportValidity()
        }
    
        // cambiamos el disabled del boton
        inputButton.disabled = !input.validity.valid
    })
})()

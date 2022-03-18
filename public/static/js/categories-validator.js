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
    
        // cambiamos el disabled del boton
        inputButton.disabled = !input.validity.valid
    })
})()

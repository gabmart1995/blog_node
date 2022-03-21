/**
 * Validator JS Forms entry-validator.js
 * Author: Gabriel Martinez gabmart1995
 */
(function() {
    
    const entryForm = document.forms[1]
    const [ inputTitle, inputDescription, selectCategory, inputButton ] = entryForm
    
    const isValid = () => (
        inputTitle.validity.valid &&
        (/^[\w\s\.\,]{1,1000}$/).test( inputDescription.value ) &&
        selectCategory.value.length > 0
    )
    
    inputTitle.addEventListener('input', ( $eventInput ) => {
            
        const input = $eventInput.target
    
        input.setCustomValidity('')
    
        // console.log(input.value)
    
        if ( input.validity.patternMismatch ) {
            input.setCustomValidity('El campo de titulo es incorrecto')
            input.reportValidity()      
        }

        if ( input.value.length === 0 ) {
            input.setCustomValidity('campo requerido')
            input.reportValidity()
        }
    
        inputButton.disabled = !isValid()
    })
    
    inputDescription.addEventListener('input', ( $eventInput ) => {
            
        const input = $eventInput.target
    
        // console.log( input.validity )
    
        input.setCustomValidity('')
    
        const valid = (/^[\w\s\.\,]{1,1000}$/).test( input.value )
    
        if ( !valid ) {
            input.setCustomValidity('El campo de descripcion es incorrecto')
            input.reportValidity()      
        }
    
        inputButton.disabled = !isValid()
    })
    
    selectCategory.addEventListener('change', ( $eventSelect ) => {
        
        const select = $eventSelect.target
        
        select.setCustomValidity('')
    
        if ( select.value.length === 0 ) {
            select.setCustomValidity('Selecciona una categoria del listado')
            select.reportValidity()
        }
    
        inputButton.disabled = !isValid()
    })
})()

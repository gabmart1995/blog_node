/**
 * Validator JS Forms entry-validator.js
 * Author: Gabriel Martinez gabmart1995
 */

const entryForm = document.forms[1]
const [ inputTitle, inputDescription, selectCategory, inputButton ] = entryForm

const isValid = () => (
    inputTitle.validity.valid &&
    inputDescription.validity.valid &&
    selectCategory.validity.valid
)

inputTitle.addEventListener('input', ( $eventInput ) => {
        
    const input = $eventInput.target

    input.setCustomValidity('')

    if ( input.validity.patternMismatch ) {
        input.setCustomValidity('El campo de titulo es incorrecto')
        input.reportValidity()      
    }

    inputButton.disabled = !isValid()
})

inputDescription.addEventListener('input', ( $eventInput ) => {
        
    const input = $eventInput.target

    console.log( input.validity )

    input.setCustomValidity('')

    if ( input.validity.patternMismatch ) {
        input.setCustomValidity('El campo de descripcion es incorrecto')
        input.reportValidity()      
    }

    inputButton.disabled = !isValid()
})
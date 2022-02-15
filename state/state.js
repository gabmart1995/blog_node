// modulo del estado de la aplicacion
let STATE = {
    errorsRegister: null,
    register: false,
    login: false
}

function registerAction( payload ) {
    return { type: 'register', payload }
}

function loginAction( payload ) {
    return { type: 'login', payload  }
}

function errorsRegisterAction( payload ) {
    return { type: 'errorsRegister', payload }
}


function getState() {
    return STATE;
}

function clearState() {
    STATE = {
        errorsRegister: null,
        register: false,
        login: false
    }
}

function dispatch( action ) {

    switch ( action.type ) {
        case 'login':
            return STATE = { ...STATE, login: action.payload }

        case 'register':
            return STATE = { ...STATE, register: action.payload }

        case 'errorsRegister':
            return STATE = { ...STATE, errorsRegister: action.payload }

        default:
            return STATE
    }
}


module.exports = {
    dispatch,
    getState,
    registerAction,
    loginAction,
    errorsRegisterAction,
    clearState
}




// modulo del estado de la aplicacion
let STATE = {
    errorsRegister: null,
    errorsLogin: null,
    register: false,
    login: false,
    userLogged: null
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

function errorsLoginAction( payload ) {
    return { type: 'errorsLogin', payload }
}

function userLoggedAction( payload ) {
    return { type: 'userLogged', payload }
}

function getState() {
    return STATE;
}

function clearState() {
    STATE = {
        errorsRegister: null,
        errorsLogin: null,
        register: false,
        login: false,
        userLogged: null
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

        case 'errorsLogin': 
            return STATE = { ...STATE, errorsLogin: action.payload }

        case 'userLogged': 
            return STATE = { ...STATE, userLogged: action.payload }

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
    errorsLoginAction,
    clearState,
    userLoggedAction
}
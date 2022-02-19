// modulo del estado de la aplicacion
let STATE = {
    errorsRegister: null,
    errorsLogin: null,
    errorsCategory: null,
    errorsEntries: null,
    register: false,
    login: false,
    userLogged: null,
    categories: [],
    lastEntries: [],
    year: new Date().getFullYear()
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

function errorsEntriesAction( payload ) {
    return { type: 'errorsEntries', payload }
}

function userLoggedAction( payload ) {
    return { type: 'userLogged', payload }
}

function logoutAction() {
    return { type: 'logout' }
}

function getCategoriesAction( payload ) {
    return { type: 'getCategories', payload }
}

function getLastEntriesAction( payload ) {
    return { type: 'getLastEntries', payload }
}

function errorsCategoryAction( payload ) {
    return { type: 'errorsCategory', payload }
}

function getState() {
    return STATE;
}


function clearState() {
    STATE = {
        ...STATE,
        errorsRegister: null,
        errorsLogin: null,
        errorsCategory: null,
        errorsEntries: null,
        register: false,
        categories: [],
        lastEntries: []
    }
}

function dispatch( action ) {

    switch ( action.type ) {
        case 'login':
            return STATE = { ...STATE, login: action.payload }
        
        case 'logout':
            return STATE = { ...STATE, login: false, userLogged: null }

        case 'register':
            return STATE = { ...STATE, register: action.payload }

        case 'errorsRegister':
            return STATE = { ...STATE, errorsRegister: action.payload }

        case 'errorsLogin': 
            return STATE = { ...STATE, errorsLogin: action.payload }

            case 'errorsCategory': 
            return STATE = { ...STATE, errorsCategory: action.payload }

        case 'userLogged': 
            return STATE = { ...STATE, userLogged: action.payload }

        case 'getCategories':
            return STATE = { ...STATE, categories: action.payload }

        case 'getLastEntries':
            return STATE = { ...STATE, lastEntries: action.payload }
        
        case 'errorsEntries': 
            return STATE = { ...STATE, errorsEntries: action.payload }

        default:
            return STATE
    }
}

module.exports = {
    errorsEntriesAction,
    dispatch,
    getState,
    registerAction,
    loginAction,
    errorsRegisterAction,
    errorsLoginAction,
    clearState,
    userLoggedAction,
    logoutAction,
    getCategoriesAction,
    getLastEntriesAction,
    errorsCategoryAction
}
// modulo del estado de la aplicacion
let STATE = {
    errorsRegister: null,
    errorsLogin: null,
    errorsCategory: null,
    errorsEntries: null,
    errorsProfile: null,
    errorsSearch: null,
    register: false,
    delete: false,
    update: false,
    login: false,
    // userLogged: null,
    categories: [],
    lastEntries: [],
    entries: [],
    category: null,
    entry: null,
    year: new Date().getFullYear()
}

function clearState() {
    STATE = {
        ...STATE,
        errorsRegister: null,
        errorsLogin: null,
        errorsCategory: null,
        errorsEntries: null,
        errorsProfile: null,
        register: false,
        // categories: [],
        category: null,
        lastEntries: [],
        entry: null,
        entries: [],
        delete: false,
        update: false,
        errorsSearch: null
    }
}

function registerAction( payload ) {
    return { type: 'register', payload }
}

function updateAction( payload ) {
   return { type: 'update', payload } 
}

function getEntriesByCategoryAction( payload ) {
    return { type: 'getEntriesByCategory', payload }
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

function errorsProfileAction( payload ) {
    return { type: 'errorsProfile', payload }
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

function getEntriesAction( payload ) {
    return { type: 'getEntries', payload }
}

function errorsCategoryAction( payload ) {
    return { type: 'errorsCategory', payload }
}

function getState() {
    return STATE;
}

function setCategoryAction( payload ) {
    return { type: 'setCategoryAction', payload }
}

function setEntryAction( payload ) {
    return { type: 'setEntry', payload }
}

function setDelete() {
    return { type: 'setDelete' }
}

function setErrorsSearchAction( payload ) {
    return { type: 'setErrorsSearch', payload }
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
        
        case 'getEntries': 
            return STATE = { ...STATE, entries: action.payload }
        
        case 'errorsEntries': 
            return STATE = { ...STATE, errorsEntries: action.payload }

        case 'errorsProfile':
            return STATE = { ...STATE, errorsProfile: action.payload }
        
        case 'getEntriesByCategory':
            return STATE = { ...STATE, entries: action.payload }

        case 'setCategoryAction':
            return STATE = { ...STATE, category: action.payload }

        case 'setEntry': 
            return STATE = { ...STATE, entry: action.payload }

        case 'setDelete':
            return STATE = { ...STATE, delete: true }

        case 'update':
            return STATE = { ...STATE, update: action.payload }

        case 'setErrorsSearch':
            return STATE = { ...STATE, errorsSearch: action.payload }

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
    getEntriesAction,
    errorsCategoryAction,
    errorsProfileAction,
    getEntriesByCategoryAction,
    setCategoryAction,
    setEntryAction,
    setDelete,
    updateAction,
    setErrorsSearchAction
}
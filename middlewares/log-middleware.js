function logMiddleware( request, response, next ) {
    
    const date = new Date()

    const infoClient = { 
        method: request.method, 
        path: request.path,
        statusCode: response.statusCode,
        timeStamp: (`${ date.getFullYear() }-${ date.getMonth() > 9 ? date.getMonth() + 1 : '0' + ( date.getMonth() + 1 ) }-${ date.getDate() } ${ date.getHours() }:${ date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes() }:${ date.getSeconds() }`), 
        ipClient: () => { 

            if ( request.headers['x-forwarded-for'] ) {
                return request.headers['x-forwarded-for'].split(',')[0]
            }
            
            return request.socket.remoteAddress
        }  
    };

    console.log("%s - [%d] %s %s \"%s\"", 
        infoClient.method,
        infoClient.statusCode,
        infoClient.path,
        infoClient.ipClient(), 
        infoClient.timeStamp
    )

    next()
}

module.exports = { logMiddleware }
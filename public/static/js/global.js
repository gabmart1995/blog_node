(function() {
    
    const contactButton = document.querySelector('#contact')
    const aboutButton = document.querySelector('#about')
    
    contactButton.addEventListener('click', () => {
        alert(`
            Contacto:

            github: "https://gabmart1995.github.io"
            correo-electronico: "gabmart1995@gmail.com"
        `)
    })

    aboutButton.addEventListener('click', () => {
        alert(`
            Datos del creador:

            Gabriel Martinez (gabmart1995)
            Desarrollador Independiente 
        `)
    })
})()
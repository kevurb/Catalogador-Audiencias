const mostrarPantalla=(duplicados) =>{
        
    if (duplicados.length >= 1){
        console.log("EXISTEN DUPLICADOS");           
    
        dialog.showMessageBox({
        type: 'info',
        buttons: ['Abrir Reporte'],
        title: 'Validación Duplicados',
        message: `Se ha generado el reporte de duplicados`
            
        }).then( result=> {
            if (result.response == 0) {
            
                // crear ventana en la que se muestra la validacion
                const verifyPage = new BrowserWindow({ 
                    width: 800, 
                    height: 500, 
                    autoHideMenuBar: true,
                    //transparent: true, 
                    //frame: false, 
                    alwaysOnTop: false,
                    webPreferences: {
                        //preload: path.join(__dirname, 'preload.js'), 
                        nodeIntegration: true,
                        contextIsolation: false
                    }
                });
                
                // cargar la pagina
                verifyPage.loadFile('verify-page-duplicates.html');
                verifyPage.center();

                // funcion para enviar el objeto que contiene la lista a la ventana
                verifyPage.webContents.on('did-finish-load', () => {
                    verifyPage.webContents.send('channel5', catalogFileObject);    
                })

                //abrir carpeta que va a ser catalogada
                shell.openPath(receivedDirectory);

            }
        })
        
    }
   
}
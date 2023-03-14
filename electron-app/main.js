if (require('electron-squirrel-startup')) return;

const { app, BrowserWindow, dialog, ipcMain, shell} = require('electron'); 
const { exec, execSync } = require('child_process');
const path = require('path'); 
const fs = require('fs');
const { verify } = require('crypto');
const ProgressBar = require('electron-progressbar');
const { Console } = require('console');



//------------ CONFIGURACION INICIAL DE LA APP - MANEJO DE ACCESOS DIRECTOS ----

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};

// --------------------- UPDATE --------------------------
/*
require('update-electron-app')({
    repo: 'anperz/catalogador',
    updateInterval: '1 hour',
    //logger: require('electron-log')
  })
*/


function manualUpdate () {
    // version actual de la app
    let dir = `M:\\App Catalogacion`;
    let actualVersion = app.getVersion().replace(/\./g, '');

    //buscar archivo en el servidor
    let serverFile = fs.readdirSync(dir);
    
    //validar archivo
    let serverFileVersion = serverFile[0].slice(17, -10).replace(/\./g, '');

    //verifica si la version del servidor es mayor
    if (serverFileVersion > actualVersion) {
        
        // mostrat mensaje de actualizacion disponible
        dialog.showMessageBox({
            type: 'info',
            buttons: ['Actualizar', 'Mas tarde'],
            title: 'Actualizacion',
            message: 'Hemos encontrado una actualizacion disponible'
        }).then(result => {

            // si el usuario selecciona actualizar
            if (result.response == 0) {

                fs.copyFileSync(`${dir}\\${serverFile[0]}`, `C:\\${serverFile[0]}`)
                shell.openPath(`C:\\${serverFile[0]}`);
            } else {
                console.log('actualizacion cancelada')
            }
        });
        
    }
}




// --------------------   FUNCIONES --------------------------------------

// funcion asincrona para ejecutar comandos de powershell

 function execShellCommand(cmd) {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
     exec(cmd, {'shell':'powershell.exe'}, (error, stdout, stderr) => {
      if (error) {
       console.warn(error);
      }
      resolve(stdout? stdout : stderr);
     });
    });
   }


//verificar directorio (alarma si hay valores mas largos que 260 char)
function verifyDirectory(receivedDirectory) {

    execSync(`

            Start-Transcript -Append -Path "${__dirname}\\App-Catalogacion-Log.txt" 

            Get-ChildItem -LiteralPath "\\\\?\\${receivedDirectory}" -Exclude directory.csv  -Attributes !Directory -Recurse . | 
            Select-Object @{
                Name="Length";
                Expression={$_.FullName.Length}
            }, Name, FullName | 
            Where-Object {$_.Length -ge 256} |
            Sort-Object lengthOfName -Descending | 
            ConvertTo-Json | 
            Out-File -LiteralPath "\\\\?\\${receivedDirectory}\\verify.txt" -Encoding utf8
            
        `, {'shell':'powershell.exe'}, (error, stdout, stderr) => {
            console.log('out:' + stdout);
            console.log('err:' + stderr);
            console.log('error:' + error);
        });
    
    // obtener tamaño del archivo verify.txt
    const stats = fs.statSync(receivedDirectory + '\\verify.txt');

    if (stats.size == 0) {
        //si el archivo esta vacio retorna true
        return true;
    } else {

        //si hay contenido lo convierte en un objeto

        fs.readFile(receivedDirectory + '\\verify.txt', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            const errorFileObject = JSON.parse(data.toString('utf8').replace(/^\uFEFF/, ''));
            const errorFileNumber = errorFileObject.length;

            dialog.showMessageBox({
                type: 'info',
                buttons: ['Abrir Reporte', 'Cancelar Importacion'],
                title: 'Validacion al importar',
                message: `Se encontraron ${errorFileNumber} archivos con una ruta y nombre muy largos`
              }).then(result => {
                
                if (result.response == 0) {
                    // shell.openPath(receivedDirectory + '\\verify.txt');

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
                    verifyPage.loadFile('verify-page.html');
                    verifyPage.center();

                    // funcion para enviar el objeto que contiene la lista a la ventana
                    verifyPage.webContents.on('did-finish-load', () => {
                        verifyPage.webContents.send('channel5', errorFileObject);    
                    })

                    }
            });
        }) 

    }
}

// crear directorio powershell
function createDirectoryCsv(receivedDirectory, importDateTime) {
    
    //asignar valores dependiendo de si se marco el check (importar fecha y hora)

    let dateVal;
    let timeVal;
    let nameVal = `@{
        name='Name'
        expr={$_.Name, $_.LastWriteTime.ToString("yyyy/MM/dd HH:mm:ss") -join ' >> Modifcado: '}
    }`

    if (importDateTime == true) {
        dateVal = `@{
            name='Date'
            expr={$_.LastWriteTime.ToString("yyyy/MM/dd")}
        }`

        timeVal = `@{
            name='Time'
            expr={$_.LastWriteTime.ToString("HH:mm:ss")}
        }`

    } else {
        dateVal = 'Date';
        timeVal = 'Time';
    }

    execSync(`

            Start-Transcript -Append -Path "${__dirname}\\App-Catalogacion-Log.txt" 

            Get-ChildItem -LiteralPath "${receivedDirectory}" -Exclude directory.csv -Attributes !Directory -Recurse . | 
            Sort-Object fullname | Select-Object FullName, ${nameVal}, Category, Radicado, ${dateVal}, ${timeVal}, Organo, Sala, Reserved, Virtual, Consecutivo, NewName, NameLength, Extension, Length, FinalPath | 
            Export-Csv -Force -Delimiter '|' -Encoding UTF8 -LiteralPath "${receivedDirectory}\\directory.csv"
            
        `, {'shell':'powershell.exe'}, (error, stdout, stderr) => {
            console.log('out:' + stdout);
            console.log('err:' + stderr);
            console.log('error:' + error);
        });
}; 
async function backup(receivedDirectory,csv){
    fs.writeFileSync(dir + `\\back-up.csv`, csv);
        console.log('archivo backup creado');
}
// crear directorio y mover a las carpetas powershell
async function catalogDirectoryCsv(receivedDirectory, receivedCsv) {

    // se genera el archivo Export
    fs.writeFileSync(receivedDirectory + "\\export.csv", receivedCsv);
    console.log('archivo export creado');

    const commandPS = `

        Start-Transcript -Append -Path "${__dirname}\\App-Catalogacion-Log.txt"

        Stop-Process -Name "wmplayer"
        Stop-Process -Name "vlc"

        Import-Csv -Delimiter '|' -Path "${receivedDirectory}\\export.csv" | 
        ForEach-Object {
            if ($_.FinalPath -ne "") {
                New-Item -ItemType "directory" -Path "${receivedDirectory}$($_.FinalPath)"
            }
        } | 
        Format-Table

        $movedList = @()

        Import-Csv -Delimiter '|' -Path "${receivedDirectory}\\export.csv" | 
        ForEach-Object { 
            if ($_.FinalPath -ne "") {
                $initialName = $_.Name.Split(" >> ")
                
                $movedItem = Copy-Item -Path $_.FullName -Destination "${receivedDirectory}$($_.FinalPath)$($_.NewName)" -PassThru
                $movedItem
                if ($movedItem.Length -eq $_.Length) {
                    $fileCheck = "OK"
                    $objectName = $movedItem.FullName
                    Remove-Item -Path $_.FullName -Verbose
                    if (Test-Path -Path $_.FullName -PathType leaf) {
                        $fileCheck = "verificar-eliminacion"
                    }
                    
                }
                else{
                    $fileCheck = "error-al-copiar"
                    $objectName = "$($_.FullName)"
                }
                $movedITemArray = [pscustomobject]@{Check=$fileCheck; Length=$movedItem.Length; Name=$initialName[0]; FullName=$objectName}
                $movedList += $movedITemArray
            }
        } 
        $movedList | Format-Table
        $movedList |  ConvertTo-Json | 
        Out-File -LiteralPath "${receivedDirectory}\\verify.txt" -Encoding utf8
 
    `; 
    
    // cargar barra de progreso
    var progressBar = new ProgressBar({
        text: 'Por favor espera...',
        detail: 'Copiando, renombrando y verificando archivos. NO cierres esta ventana...'
      });
      
      progressBar
        .on('completed', function() {
          console.info(`completed...`);
          progressBar.detail = 'Finalizado. Generando reporte...';
        })
        .on('aborted', function() {
          console.info(`operacion cancelada...`);
        });  
    
    // enviar codigo a la funcion asincrona de powershell
    const commandResult = await execShellCommand(commandPS);
    console.log(commandResult);

    // una vez terminado el script cerrar la barra de progreso
    progressBar.setCompleted();


    //Verificar exportacion

    fs.readFile(receivedDirectory + '\\verify.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        const catalogFileObject = JSON.parse(data.toString('utf8').replace(/^\uFEFF/, ''));
        const catalogFileNumber = catalogFileObject.length;

        dialog.showMessageBox({
            type: 'info',
            buttons: ['Abrir Reporte'],
            title: 'Catalogacion',
            message: `Se ha generado el reporte de la catalogacion`
          }).then(result => {
            
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
                    verifyPage.loadFile('verify-page.html');
                    verifyPage.center();

                    // funcion para enviar el objeto que contiene la lista a la ventana
                    verifyPage.webContents.on('did-finish-load', () => {
                        verifyPage.webContents.send('channel5', catalogFileObject);    
                    })

                    //abrir carpeta que va a ser catalogada
                    shell.openPath(receivedDirectory);

                }
        });
    }) 
}; 


// enviar archivo csv al renderer 
function sendCsvFile (receivedEvent, receivedDirectory) {

    const ev = receivedEvent;

    fs.readFile(receivedDirectory + '\\directory.csv', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        //enviar string del archivo al renderer
        ev.sender.send('channel1-response', [receivedDirectory,data])
      });

};





// -------------------------   PROCESOS DE ELECTRON ------------------------------

// funcion para crear una nueva ventana
const createWindow = () => {
    let inicio_time
    let fin_time
    const win = new BrowserWindow({
        show: false,
        height: 768, 
        width: 1366,
        icon: "./images/icon.png",
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), 
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    //win.removeMenu();
    win.loadFile("index.html");

    // cargar pagina de carga inicial
    const loadingPage = new BrowserWindow({ 
        width: 500, 
        height: 300, 
        transparent: true, 
        frame: false, 
        alwaysOnTop: true 
      });
      
      loadingPage.loadFile('loading-page.html');
      loadingPage.center();

      // luego de 2 segundos cerrar pagina de carga y abrir pagina principal 
      
      setTimeout(function () {
        loadingPage.close();
        
        win.center();
        win.show();
        inicio_time=Date.now();
        //console.log(inicio_time);
        //win.maximize();
        
        //consulta de actualizaciones manuales
        //manualUpdate ();

      }, 2000);
    

    // Open the DevTools.
    //win.webContents.openDevTools();



    //confirmacion de cierre de ventana
    win.on('close', function(e) {
        const choice = require('electron').dialog.showMessageBoxSync(this,
            {
            type: 'info',
            buttons: ['Yes', 'No'],
            title: 'Confirmacion',
            message: 'Segura/o que deseas salir?'
            });
            //console.log(choice);
            
        if (choice === 1) {
            e.preventDefault();

        }
        else{

            fin_time=Date.now();
            console.log("TIEMPO EN LA APP",(fin_time-inicio_time)/1000);

        }
    });

};


//crear la ventana cuando la aplicacion este lista
app.whenReady().then(()=> {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      });
      
});

// no cerrar toda la app al salir
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  });





  // ------------- IPC LISTENERS PARA COMUNICACION CON EL RENDERER PROCESS ---

// ipc listener abrir carpeta
ipcMain.on('channel1', (e, args) => {

    if (args[0] == 'abrete-sesamo') {

        // abrir dialog para carpeta
        dialog.showOpenDialog( {
            buttonLabel: 'Seleccionar Carpeta', 
            properties: ['openDirectory']
        }).then( result =>  {
            //console.log(result)
            const createdFilePath = result.filePaths[0];

            console.log('Carpeta seleccionada: ' + createdFilePath);

            const validImport = verifyDirectory(createdFilePath);

            if (validImport) {

                //crear el archivo csv
                let importDateTime = args[1];
                createDirectoryCsv(createdFilePath, importDateTime);
                
                //enviar archivo al renderer
                sendCsvFile(e, createdFilePath); 
                console.log('Importacion Correcta');

                } else {
                    console.log('Importacion Cancelada');
                }

        })
    }
})

// ipc listener para copia de seguridad y para iniciar catalogacion de carpetas
ipcMain.on('channel2', (e, args) => {
    
    // traer el csv y la ruta
    const dir = args[1];
    const csv = args[2];

    if (args[0] == 'catalogar') {
        // enviar a funcion de catalogacion
        catalogDirectoryCsv(dir, csv);
        //console.log ("espere 2")

        //enviar respuesta al renderer
        e.sender.send('channel2-response', 'catalogacion-terminada');

    }
    if (args[0] == 'backup') {
        // enviar a funcion de catalogacion
        fs.writeFileSync(dir + `\\backup.csv`, csv);
        console.log('archivo export creado');

    }
    if (args[0] == 'guardar') {

        fs.writeFileSync(dir + `\\copia-seguridad.csv`, csv);
        console.log('archivo export creado');

        //enviar respuesta al renderer
        e.sender.send('channel2-response', 'guardado-copia-seguridad.csv');

        //verificar si el archivo esta en carpeta
        if (fs.existsSync(dir + `\\copia-seguridad.csv`)) {
            //abrir alerta
            dialog.showMessageBox({
                type: 'info',
                buttons: ['Abrir en carpeta','Cancelar'],
                title: 'Verificacion de Grabacion',
                message: 'Se ha guardado una copia de seguridad'
            }).then(result => {
                
                if (result.response == 0) {
                    shell.showItemInFolder(dir + `\\copia-seguridad.csv`);
                }
            });
        }
        
        

    }

   
})

// ipc listener para abrir video catalogacion de carpetas

ipcMain.on('channel3', (e, args) => {
    const dir = args;
    
    //abrir elemento en carpeta
    shell.openPath(dir);
}) 


// ipc listener para abrir alerta en el main

ipcMain.on('channel4', (e, args) => {
    const alertMessage = args;
    
    //abrir alerta
    dialog.showMessageBox({
        type: 'info',
        buttons: ['Aceptar'],
        title: 'Verificacion de Grabacion',
        message: alertMessage
    }).then(result => {
        /*
        if (result.response == 0) {
            shell.openPath(receivedDirectory + '\\verify.txt');
        }  */
    });
}) 


// ipc listener para abrir archivo en carpeta

ipcMain.on('channel6', (e, args) => {
    const dir = args;
    
    let filteredDir = dir.replace("\\\\?\\", '')
    //abrir elemento en carpeta
    shell.showItemInFolder(filteredDir);
}) 

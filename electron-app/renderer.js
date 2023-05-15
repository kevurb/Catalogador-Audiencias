
const {ipcRenderer} = require('electron');
/*
function deleteLocalStorage() {
    localStorage.tableData = "";
    console.log('Reseteado localStorage');
}; */


/* 
<button value='${records[i][j]}'>Archivo</button>

*/

//variables necesarias para validacion de fechas
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth();
const currentday = date.getDay();
const currentDate = [currentYear,currentMonth,currentday];

function securityCopy () {
    const csv = localStorage.tableData;
    const dir = document.getElementById('directory-input').value;
    //enviar al main informacion para guardar avance
    if (pathInputValue !== "") {
        ipcRenderer.send('channel2', ['guardar', dir, csv]);
    } else {
        console.log("No se puede enviar el avance al archivo export si la ruta esta vacia");
    }

}
function securityBlindCopy () {
    const csv = localStorage.tableData;
    const dir = document.getElementById('directory-input').value;
    //enviar al main informacion para guardar avance
    if (pathInputValue !== "") {
        ipcRenderer.send('channel2', ['backup', dir, csv]);
    } else {
        console.log("No se puede enviar el avance al archivo export si la ruta esta vacia");
    }

}

// Canales IPC de comunicacion con el main

// ENVIAR
function fillDataExist(){

    const NamesArrayList = document.getElementsByName('Name');
    const RadicadoList = document.getElementsByName('Radicado');
    const SalaList = document.getElementsByName('Sala');
    const DateList = document.getElementsByName('Date');
    const TimeList = document.getElementsByName('Time');
    const OrganoList = document.getElementsByName('Organo');
    for (let i=1; i<NamesArrayList.length; i++){
            
        const selectedClass = NamesArrayList[i].className;
        const rowList = document.getElementsByClassName(selectedClass);
        const rawFieldName = rowList['Name'].value; 
        const buscarradicado = /\d{23}/;
        const buscarsala = /[A-Za-z]{3}Sala\d{3}/;
        const buscarfecha = /_20[0-3]\d{5}/;
        const buscarhora = /_([01]\d|2[0-3])[0-5]\d[0-5]\d_/;
        const buscarOrgano = /_\d{12}/;
        const buscarOrgano2 = /_[RL]\d{12}/;
        const radicados = [];
        const sala =[];
        const fechas = [];
        const horas = [];
        const organos = [];
        //console.log(buscarfecha.test(rawFieldName));
        // VALIDA Y TRAE LA SALA EXISTENTE EN EL NOMBRE
        if (buscarsala.test(rawFieldName)== true){
            const SalaNew= rawFieldName.match(buscarsala);
            
            sala.push(SalaNew);
        }
        else{
            const SalaNew='';
            sala.push(SalaNew);
        }
        // VALIDA EL RADICADO CON 23 DIGITOS SEGUIDOS EXISTENTE EN EL NOMBRE
        if (buscarradicado.test(rawFieldName) ==  true){
    
            const radicadoNew= rawFieldName.match(buscarradicado);
            //console.log("el radicado es",radicadoNew[0]);
           //actualRadicado.value=radicadoNew;
            radicados.push(radicadoNew);
        }
        else{
            //console.log("no contiene radicado");
            const radicadoNew='';
            radicados.push(radicadoNew);
        }
        // VALIDA LA FECHA EXISTENTE EN EL NOMBRE
        if (buscarfecha.test(rawFieldName)== true){
            const fechaEncontrada= rawFieldName.match(buscarfecha);
            //console.log(fechaEncontrada,"FECHA : ",fechaEncontrada[0].substring(1));
            fechas.push(fechaEncontrada[0].substring(1));
           
        }else{
            fechaNew ='';
            fechas.push(fechaNew);
        }
        // VALIDA LA HORA EXISTENTE EN EL NOMBRE
        if (buscarhora.test(rawFieldName)== true){
            const HoraEncontrada = rawFieldName.match(buscarhora);
            console.log(HoraEncontrada[0].replace(/_/g, ""));
            horas.push(HoraEncontrada[0].replace(/_/g, ""));
        }
        else{
            HoraEncontrada = '';
           horas.push(HoraEncontrada);
        }
        if (buscarOrgano.test(rawFieldName)==true){
            const OrganoEncontrado = rawFieldName.match(buscarOrgano);
            console.log(OrganoEncontrado);
            organos.push(OrganoEncontrado[0].substring(1));
        }else{
            OrganoEncontrado = ''
            organos.push(OrganoEncontrado);
        }
        RadicadoList[i-1].value=radicados[0];
        SalaList[i-1].value= sala[0];
        DateList[i-1].value = fechas[0];
        TimeList[i-1].value = horas[0];
        OrganoList[i-1].value = organos[0];

        createRadicadoValidation();
        createSalaValidation();
        createFechaValidation();
        createOrganoValidation();

        
    };
};
// crear el canal para  enviar "abrir carpeta" al main
document.getElementById('open-directory-button').addEventListener('click', e => {
    
    // validar si se debe importar la fecha y la hora
    const importDateTime = document.getElementById("dateTimeBox").checked;
    
    const openMessage = ['abrete-sesamo', importDateTime];
    ipcRenderer.send('channel1', openMessage);
})

// crear el canal para enviar datos de catalogacion al main
document.getElementById('catalogar-button').addEventListener('click', e => {
    const csv = localStorage.tableData;
    const dir = document.getElementById('directory-input').value;
    
    if (dir !== "") {

        // parar la reproduccion de video
        const videoTagHtml = `<video autoplay height="100%" controls><source src="" type="video/mp4">Your browser does not support the video tag.</video>`;
        document.getElementById('video-container').innerHTML = videoTagHtml;

        setTimeout(() => {
            ipcRenderer.send('channel2', ['catalogar', dir, csv]);
        }, 3000);

        // iniciar catalogacion
        //ipcRenderer.send('channel2', ['catalogar', dir, csv]);
    } else {

        let alertMessage = `Estas intentando realizar una catalogacion sin haber seleccionado primero una carpeta. Selecciona primero la carpeta a catalogar usando el boton "Carga automatica de carpeta".`;
        //abrir alerta
        ipcRenderer.send('channel4', alertMessage);
    }
    
});


// RECIBIR

// crear el canal para escuchar respuesta del main al seleccionar carpeta
ipcRenderer.on('channel1-response', (e, args) => {
    //console.log(args);
    document.getElementById('directory-input').value = args[0];
    dataToArray(args[1]);
})

// crear el canal para escuchar respuesta del main al catalogar
ipcRenderer.on('channel2-response', (e, args) => {
    console.log(args);
})


/// Funcion para cargar manualmente el localstorage en el aplicativo

function setLocalStorage() {
    //console.log('hay datos en localStorage: ' + localStorage.tableData);
    const savedCsv = localStorage.tableData;
    document.getElementById("directory-input").value = localStorage.catalogPath;
    dataToArray(savedCsv);
};


/// Eventos para el formulario de carga manual

const myForm = document.getElementById("myForm");
const csvFile = document.getElementById("csvFile");

myForm.addEventListener("submit", function (e) {
    //document.getElementById('message-container').innerHTML = '<p>Cargando archivo de datos...</p>';

    e.preventDefault();
    console.log([csvFile]);
    const input = csvFile.files[0];

    //extraer la ruta del archivo
    const fileDirectory = input.path.replace(`\\${input.name}`, '');
    const reader = new FileReader();

    reader.onload = function (e) {
        
        //colocar ruta del archivo en el campo directory imput
        document.getElementById('directory-input').value = fileDirectory;

        //enviar datos del csv a la funcion de importacion
        const text = e.target.result;
        dataToArray(text);
        
        //document.getElementById('message-container').innerHTML = '<p>Carga completa</p>';
    };
    reader.readAsText(input);
});

/// Funcion principal de importacion de CSV

function dataToArray(text) {

    //console.log (text);

    const records = [];

    function record (FullName, Name, Category, Radicado, Date, Time, Organo, Sala, Reserved, Virtual, Consecutivo, NewName, NameLength, Extension, Length, FinalPath) {
        this.FullName = FullName; // 0
        this.Name = Name; // 1
        this.Category = Category; // 2
        this.Radicado = Radicado; // 3
        this.Date = Date; // 4
        this.Time = Time; // 5
        this.Organo = Organo; // 6
        this.Sala = Sala; // 7
        this.Reserved = Reserved; // 8
        this.Virtual = Virtual; // 9
        this.Consecutivo = Consecutivo; // 10
        this.NewName = NewName; // 11
        this.NameLength = NameLength; // 12
        this.Extension = Extension; // 13
        this.Length = Length; // 14
        this.FinalPath = FinalPath; // 15
    };

    //eliminar encabezado de typo del csv y comillas dobles
    deletedFormatHeader = text.replace('#TYPE Selected.System.IO.FileInfo\r\n"', '');
    deletedVoidCol = deletedFormatHeader.replace('\r', '');

    const unQuotedText = deletedVoidCol.replace(/["]+/g, "");
    
    //Creacion de objetos a partir del texto del csv
    const row = unQuotedText.split('\n');
    //console.log(row);

    for (let i=0 ; i < row.length ; i++) {

        if (row[i] !== "") { //verifica si la fila no esta vacia, si no crear celdas y agregarlas a recods

            const cell = row[i].split('|');
            const newRecord = new record(cell[0], cell[1], cell[2], cell[3], cell[4], cell[5], cell[6], cell[7], cell[8], cell[9], cell[10], cell[11], cell[12], cell[13], cell[14], cell[15]);
            records.push(newRecord);
            //console.log("nombres",newRecord.Name);
            //console.log("este es",records[i]);
        };

    };

    

    // generador de tabla HTML
    var html = '<table id="table-container">';
    html += '<thead id="header-container"><tr>';

        // crear encabezados desde el archivo
        /*
        for( var j in records[0] ) {
            html += '<th class="table-header">' + j +'</th>';
        };*/

        html += `<th class="table-header">Videos (${records.length -1})</th>`;
        html += '<th class="table-header" name="Name">Nombre Inicial</th>';
        html += '<th class="table-header">Categoria</th>';        
        html += '<th class="table-header">Radicado</th>';
        html += '<th class="table-header">Fecha</th>';
        html += '<th class="table-header">Hora</th>';
        html += '<th class="table-header">Organo</th>';
        html += '<th class="table-header">Sala</th>';
        html += '<th class="table-header">R / L</th>';
        html += '<th class="table-header">V / P</th>';
        html += '<th class="table-header">Cons</th>';
        html += '<th class="table-header">Nuevo Nombre</th>';
        html += '<th class="table-header">Largo</th>';
        html += '<th class="table-header">Ext</th>';
        html += '<th class="table-header">Tamaño</th>';
        html += '<th class="table-header">Ruta Final</th>';
        html += '</tr></thead><tbody id= "row-container"';

        // crear celdas de contenido
        for(let i = 1; i < records.length; i++) {
            html += '<tr>';
            for( let j in records[i] ) {

// FullName, Name, Extension, Length, Radicado, Date, Time, Organo, Reserved, Virtual, Consecutivo, NewName, NameLength, Category, FinalPath
                // casos para generar cada elemento HTML
                switch (j) {
                    case "FullName": html += `<td>
                    <button class="play-button ${i}" value="${records[i][j]}">${i} ▶</button>
                    <button class="folder-button" value="${records[i][j]}">📁</button>
                    </td>`;
                        break;
                        
                    case "Name": html += '<td><textarea class="'+i+'" name="Name" type="text" readonly="readonly">'+ records[i][j] + '</textarea></td>';
                        //console.log("nombres->>>>:",records[i][j]);
                        //const nombres = records[i][j];
                        break;

                    case "Category": switch (records[i][j]) {
                        // verifica si hay un valor guardado para crear el elemento que debe aparecer como seleccionado en categoria
                        case "Teams": html += '<td><select class="'+i+'" name="Category" type="number"> <option>Seleccionar...</option> <option selected>Teams</option> <option>Lifesize</option> <option>Historico</option> <option>Actas</option> <option>No Aplica</option> <option>No Catalogable</option> <option>Duplicado</option> <option>Actas Solas</option>  <option>Portal</option> <option>No Reproduce</option> </select></td>';
                            break;

                        case "Lifesize": html += '<td><select class="'+i+'" name="Category" type="number"> <option>Seleccionar...</option> <option>Teams</option> <option selected>Lifesize</option> <option>Historico</option> <option>Actas</option> <option>No Aplica</option> <option>No Catalogable</option> <option>Duplicado</option> <option>Actas Solas</option>  <option>Portal</option> <option>No Reproduce</option> </select> </td>';
                            break;
                        
                        case "Historico": html += '<td><select class="'+i+'" name="Category" type="number"> <option>Seleccionar...</option> <option>Teams</option> <option>Lifesize</option> <option selected>Historico</option> <option>Actas</option> <option>No Aplica</option> <option>No Catalogable</option> <option>Duplicado</option> <option>Actas Solas</option>  <option>Portal</option> <option>No Reproduce</option> </select> </td>';
                            break;

                        case "Actas": html += '<td><select class="'+i+'" name="Category" type="number"> <option>Seleccionar...</option> <option>Teams</option> <option>Lifesize</option> <option>Historico</option> <option selected>Actas</option> <option>No Aplica</option> <option>No Catalogable</option> <option>Duplicado</option> <option>Actas Solas</option>  <option>Portal</option> <option>No Reproduce</option> </select> </td>';
                            break;

                        case "No Aplica": html += '<td><select class="'+i+'" name="Category" type="number"> <option>Seleccionar...</option> <option>Teams</option> <option>Lifesize</option> <option>Historico</option> <option>Actas</option> <option selected>No Aplica</option> <option>No Catalogable</option> <option>Duplicado</option> <option>Actas Solas</option> <option>Portal</option> <option>No Reproduce</option> </select> </td>';
                            break;

                        case "No Catalogable": html += '<td><select class="'+i+'" name="Category" type="number"> <option>Seleccionar...</option> <option>Teams</option> <option>Lifesize</option> <option>Historico</option> <option>Actas</option> <option>No Aplica</option> <option selected>No Catalogable</option> <option>Duplicado</option> <option>Actas Solas</option> <option>Portal</option> <option>No Reproduce</option> </select> </td>';
                            break;

                        case "Duplicado": html += '<td><select class="'+i+'" name="Category" type="number"> <option>Seleccionar...</option> <option>Teams</option> <option>Lifesize</option> <option>Historico</option> <option>Actas</option> <option>No Aplica</option> <option>No Catalogable</option> <option selected>Duplicado</option> <option>Actas Solas</option> <option>Portal</option> <option>No Reproduce</option> </select> </td>';
                            break;

                        case "Actas Solas": html += '<td><select class="'+i+'" name="Category" type="number"> <option>Seleccionar...</option> <option>Teams</option> <option>Lifesize</option> <option>Historico</option> <option>Actas</option> <option>No Aplica</option> <option>No Catalogable</option> <option>Duplicado</option> <option selected>Actas Solas</option> <option>Portal</option> <option>No Reproduce</option> </select> </td>';
                            break;
                        
                        case "Portal": html += '<td><select class="'+i+'" name="Category" type="number"> <option>Seleccionar...</option> <option>Teams</option> <option>Lifesize</option> <option>Historico</option> <option>Actas</option> <option>No Aplica</option> <option>No Catalogable</option> <option>Duplicado</option> <option>Actas Solas</option> <option selected>Portal</option> <option>No Reproduce</option> </select> </td>';
                            break;

                        case "No Reproduce": html += '<td><select class="'+i+'" name="Category" type="number"> <option>Seleccionar...</option> <option>Teams</option> <option>Lifesize</option> <option>Historico</option> <option>Actas</option> <option>No Aplica</option> <option>No Catalogable</option> <option>Duplicado</option> <option>Actas Solas</option> <option>Portal</option> <option selected>No Reproduce</option> </select> </td>';
                            break;

                        default: html += '<td><select class="'+i+'" name="Category" type="number"> <option selected>Seleccionar...</option> <option>Teams</option> <option>Lifesize</option> <option>Historico</option> <option>Actas</option> <option>No Aplica</option> <option>No Catalogable</option> <option>Duplicado</option> <option>Actas Solas</option> <option>Portal</option> <option>No Reproduce</option> </select> </td>';
                            break;
                    } ;
                        break;

                    case "Radicado": html += '<td><input class="'+i+'" name="Radicado" type="text" maxlength="27" placeholder="Radicado(23 digitos)" value="' + records[i][j]+ '"></td>';
                        break;

                    case "Date": html += '<td><input class="'+i+'" name="Date" type="text" maxlength="10" placeholder="AAAA/MM/DD" value="' + records[i][j]+ '"></td>';
                        break;

                    case "Time": html += '<td><input class="'+i+'" name="Time" type="text" maxlength="8" placeholder="HH:MM:SS" value="' + records[i][j]+ '"></td>';
                        break;

                    case "Organo": html += '<td><input class="'+i+'" name="Organo" type="text" maxlength="12" placeholder="Organo(12 digitos)" value="' + records[i][j]+ '"></td>';
                        break;

                    case "Sala": html += '<td><input class="'+i+'" name="Sala" type="text" maxlength="10" placeholder="Sala(10 digitos)" value="' + records[i][j]+ '"></td>';
                        break;

                    case "Reserved": html += '<td><input class="'+i+'" name="Reserved" type="text" maxlength="1" placeholder="R-L" value="' + records[i][j]+ '"></td>';
                        break;

                    case "Virtual": html += '<td><input class="'+i+'" name="Virtual" type="text" maxlength="1" placeholder="V-P" value="' + records[i][j]+ '"></td>';
                        break;

                    case "Consecutivo": html += '<td><input class="'+i+'" name="Consecutivo" type="number" maxlength="2" readonly="readonly" value="01"></td>';
                        break;

                    case "NewName": html += '<td><textarea class="'+i+'" name="NewName" readonly="readonly" type="text"></textarea></td>';
                        break;

                    case "NameLength": html += '<td><input class="'+i+'" name="NameLength" readonly="readonly" type="number"></td>';
                        break;
                    
                    case "Extension": html += '<td><input class="'+i+'" name="Extension" type="text" readonly="readonly" value="' + records[i][j]+ '"></td>';
                        break;

                    case "Length": html += '<td><input class="'+i+'" name="Length" type="text" readonly="readonly" value="' + records[i][j]+ '"></td>';
                        break;

                    case "FinalPath": html += '<td><textarea class="'+i+'" name="FinalPath" readonly="readonly" type="text"></textarea></td>';
                        break;

                    default: html += "<td>" + records[i][j]+ "</td>";
                        break;
                };

            };
        html += '</tr>';
        };
    html += '</tbody></table>';

    // aplicar html al elemento container
    document.getElementById('container').innerHTML = html;

    // evento que se activa al producirse un cambio en la tabla
    document.getElementById('table-container').addEventListener('change', checkConsecutivo);
    const importData = document.getElementById("dataBox").checked;
    if (importData == true){

        fillDataExist();
        //console.log("ESTA TRAYENDO LOS DATOS");
    }
    
    //creacion de eventos para reproducir video al hacer click en el boton
    createPlayButtonAction();

    //creacion de eventos para abrir carpeta al hacer click en el boton
    createFolderButtonAction();

    //creacion de eventos para formatear el radicado
    createRadicadoValidation();

    //creacion de eventos para formatear la fecha
    createFechaValidation();

    //creacion de eventos para formatear la hora
    createHoraValidation();

    //creacion de eventos para formatear el organo
    createOrganoValidation();
    
    //creacion de eventos para formatear la sala
    createSalaValidation()

    //creacion de eventos para formatear el campo reservado-libre
    createReservadoLibreValidation();

    //creacion de eventos para formatear el campo virtual-preencial
    createVirtualPresencialValidation();

    //creacion de eventos al asignar categoria
    createCategoriaValidation();

    // creacion de evento para validar 
    checkConsecutivo ();

    //VALIDAR DUPLICADOS 
    createLengthValidation();

    //fillDataExist();
    
    

};


function checkConsecutivo () {

    const arrayConsecutivo = document.getElementsByName('Consecutivo');
    const radicadoList = document.getElementsByName('Radicado');
    const radicadoArray = [];

    for (let i=0; i<radicadoList.length; i++){
        
        //obtener valores de los campos radicado, fecha y hora de la fila
        const rowClass = radicadoList[i].className;
        const rowItemList = document.getElementsByClassName(rowClass);
        const partFieldRadicado = rowItemList['Radicado'].value;
        const partFieldDate = rowItemList['Date'].value;
        const partFieldTime = rowItemList['Time'].value;

        radicadoItem = `${partFieldRadicado}_${partFieldDate}_${partFieldTime}`;
        radicadoArray.push(radicadoItem);
    };

    for (let x=1 ; x<arrayConsecutivo.length ; x++) {

        //obtener valor del campo categoria
        const rowClass = arrayConsecutivo[x].className;
        const rowItemList = document.getElementsByClassName(rowClass);
        const partFieldCategoria = rowItemList['Category'].value;

        var cuentaConsecutivo = 1;

        for (let i=0 ; i<x; i++) {

            //verificar si el valor ya esta
            if (radicadoArray[x] == radicadoArray[i]) {
                
                // si la categoria no es Acta aumenta el consecutivo
                if (partFieldCategoria !== "Actas") {
                    cuentaConsecutivo++;
                }           
            };
        };
        if (cuentaConsecutivo<10) {
            cuentaConsecutivo = '0' + cuentaConsecutivo;
        };
        arrayConsecutivo[x].value = cuentaConsecutivo;

    };
    checkNewName ();
};

function checkNewName () {
    const arrayNewName = document.getElementsByName('NewName');

    for (let x=0 ; x<arrayNewName.length ; x++) {
        const selectedClass = arrayNewName[x].className;
        const rowList = document.getElementsByClassName(selectedClass);
        //console.log(rowList);

// FullName, Name, Extension, Length, Radicado, Date, Time, Organo, Sala, Reserved, Virtual, Consecutivo, NewName, NameLength, Category, FinalPath

        // filtrar separadores de valores

        const rawFieldName = rowList['Name'].value;
        const fieldName = rawFieldName.split(' >> ');
        //console.log(fieldName.length);
        const fieldCategoria = rowList['Category'].value;

        const rawFieldRadicado = rowList['Radicado'].value;
        const fieldRadicado = rawFieldRadicado.replace(/-/g, '');

        const rawFieldDate = rowList['Date'].value;
        const fieldDate = rawFieldDate.replace(/\//g, '');

        const rawFieldTime = rowList['Time'].value;
        const fieldTime = rawFieldTime.replace(/:/g, '');
        
        const fieldOrgano = rowList['Organo'].value;   
        const fieldSala = rowList['Sala'].value;
        const fieldConsecutivo = rowList['Consecutivo'].value;
        const fieldExtension = rowList['Extension'].value.toLowerCase();
        const fieldReserved = rowList['Reserved'].value;
        const fieldVirtual = rowList['Virtual'].value;

        //asignar valor a NewName
        if (fieldCategoria == "Teams" || fieldCategoria == "Historico" || fieldCategoria == "Lifesize" || fieldCategoria == "Actas") {
            if ((fieldReserved == 'R' || fieldReserved == 'L')&& (fieldVirtual=='V'||fieldVirtual=='P') ){
                rowList['NewName'].style.backgroundColor = "black" ;
                rowList['NewName'].value = fieldRadicado +"_"+ fieldReserved + fieldOrgano + fieldSala +"_"+ fieldConsecutivo +"_"+ fieldDate +"_"+ fieldTime + "_" + fieldVirtual + fieldExtension;
            }
            else{
                // este es NOMBRE
                rowList['NewName'].style.backgroundColor = "red" ;
                
                rowList['NewName'].value = fieldRadicado +"_"+ fieldReserved + fieldOrgano + fieldSala +"_"+ fieldConsecutivo +"_"+ fieldDate +"_"+ fieldTime + "_" + fieldVirtual + fieldExtension;
            }
        } else {
            
            if (fieldCategoria == "Seleccionar...") {
                rowList['NewName'].value = '';
            } else {
                rowList['NewName'].value = fieldName[0];
                }
        }

        //asignar valor a NameLength
        rowList['NameLength'].value = String(rowList['NewName'].value).length;


        //asignar valor a FinalPath

        

        if (fieldCategoria == "Teams" || fieldCategoria == "Historico" || fieldCategoria == "Lifesize") {
            
            rowList['FinalPath'].value = '\\' + fieldCategoria + '\\' + despachosObject[fieldOrgano] + '\\';

        } else {

            if (fieldCategoria == "Actas") {
            
                rowList['FinalPath'].value = '\\' + "Historico" + '\\' + despachosObject[fieldOrgano] + '\\';
    
            } else {

                if (fieldCategoria == "Seleccionar...") {
                    rowList['FinalPath'].value = '';
                } else {
                    rowList['FinalPath'].value = '\\' + fieldCategoria + '\\';
                    }
            }
        }

        setCategoryBackgroundColor(rowList['Category']);
        setNameLengthBackgroundColor(rowList['NameLength']);

        // validar si la ruta sera muy larga
        let inputPath1 = document.getElementById('directory-input').value;
        let inputPath2 = rowList['FinalPath'].value;
        let inputPath3 = rowList['NewName'].value;
        let totalPathLength = inputPath1.length + inputPath2.length + inputPath3.length;
        //console.log(totalPathLength);
        
        if (totalPathLength >= 256) {
            rowList['Category'].value = "Seleccionar...";
            checkConsecutivo ();

            let alertMessage = `El nombre final del archivo sera muy largo (${totalPathLength} caracteres). Deberas dejar SIN CATALOGAR este elemento y luego renombrarlo o moverlo de carpeta.`
            //abrir alerta
            ipcRenderer.send('channel4', alertMessage);
        };


    };

    saveDataOnLocalStorage();
    securityBlindCopy();
};



// fucnion para guardar en local storage
function saveDataOnLocalStorage() {

    const csvDelimiter = `|`;
    //se colocan los headers del csv
    var csv = '"FullName"|"Name"|"Category"|"Radicado"|"Date"|"Time"|"Organo"|"Sala"|"Reserved"|"Virtual"|"Consecutivo"|"NewName"|"NameLength"|"Extension"|"Length"|"FinalPath"\n';

    const arrayNewName = document.getElementsByName('NewName');

    // se itera sobre cada  fila y columna para generar el csv
    for (let x=0 ; x<arrayNewName.length ; x++) {
        const selectedClass = arrayNewName[x].className;
        const rowList = document.getElementsByClassName(selectedClass);

        for (let i=0 ; i<rowList.length ; i++) {
            const cell = rowList[i].value
            csv += '"' + cell + '"|';
        };

        if (x !== arrayNewName.length -1) {
            csv += '\n';
        }
    };

    pathInputValue = document.getElementById("directory-input").value;
    //console.log(pathInputValue);

    if (typeof(Storage) !== 'undefined') {
        localStorage.tableData = csv;
        localStorage.catalogPath = pathInputValue;
        //console.log("ESTO SE GUARDA"+localStorage.tableData);
        console.log("Guardado en local storage");
      } else {
        console.log("Local storage NO disponible");
      };
} ;

//funcion que se activa para descargar el CSV manualmente
function download() {
    var csv = localStorage.tableData;
    
    // codigo para chrome
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
    pom.setAttribute('download', "export.csv");
    pom.click();
    

    // codigo para funcionar en internet explorer
/*
    var IEwindow = window.open();
    IEwindow.document.write(csv);
    IEwindow.document.close();
    IEwindow.document.execCommand('SaveAs', true, "export.csv");
    IEwindow.close(); */
};

// funcion para cambiar el color de  fondo de la categoria
function setCategoryBackgroundColor(categoryElement) {

    if (categoryElement.value === "Teams" || categoryElement.value === "Historico" || categoryElement.value === "Lifesize" || categoryElement.value === "Actas") {
        categoryElement.style.backgroundColor = "#388e3c";
        categoryElement.style.color = "white";
        categoryElement.style.border = "4px solid #388e3c";
    } else if (categoryElement.value === "Seleccionar...") {
        categoryElement.style.backgroundColor = "white";
        categoryElement.style.color = "black";
        categoryElement.style.border = "4px solid white";
    } else {
        categoryElement.style.backgroundColor = "#ffaf46";
        categoryElement.style.color = "black";
        categoryElement.style.border = "4px solid #ffaf46";
    }
}


// funcion para cambiar el color de  fondo del tamaño del nombre
function setNameLengthBackgroundColor(categoryElement) {

    if (categoryElement.value === "72") {
        categoryElement.style.backgroundColor = "#388e3c";
        categoryElement.style.border = "4px solid #388e3c";
        categoryElement.style.borderRadius = "4px";
    } else {
        categoryElement.style.backgroundColor = "rgba(0, 0, 0, 0)";
        categoryElement.style.border = "none";
        categoryElement.style.borderRadius = "none";
    }
}


// anular control-z

function KeyPress(e) {
    var evtobj = window.event? event : e
    if (evtobj.ctrlKey && evtobj.keyCode == 90) {
        console.log('ctrl-z pressed');
        //return false;
    }
}

document.onkeydown = KeyPress ;

// agregrar comandos de teclado

document.onkeyup = function(e) {
    
    if (e.altKey && e.key == 'ArrowUp') {
        focusedElement = document.activeElement;
        const inputName = focusedElement.name;

        if (inputName == 'Radicado' || inputName == 'Date' || inputName == 'Time' || inputName == 'Organo' || inputName == 'Sala' || inputName == 'Reserved' || inputName == 'Virtual') {
            console.log(inputName);
            let rownumber = focusedElement.className;
            referenceRowNumber = rownumber -2 ;
            if (referenceRowNumber >= 0) {
                arrayInputs = document.getElementsByName(inputName)
                referenceInput = arrayInputs[referenceRowNumber].value;
                focusedElement.value = referenceInput;
                const event = new Event('input');
                focusedElement.dispatchEvent(event);
            }
        }
  };
  if (e.altKey && e.key == 'ArrowDown'){
    //console.log('columna select');
    
    const salaList = document.getElementsByName('Sala');
    
    focusedElement = document.activeElement;
    const inputName = focusedElement.name;
    console.log();
    if (inputName == 'Organo' || inputName == 'Sala') {
        //console.log(inputName);
        let rownumber = focusedElement.className;
        referenceRowNumber = rownumber -2 ;
        //console.log("numero de columna",focusedElement.className);
        arrayInputs = document.getElementsByName(inputName)
        referenceInput = arrayInputs[referenceRowNumber].value;
        //console.log(arrayInputs.Length);
        for (var i=rownumber-1;i<salaList.length-1;i++){
            
            arrayInputs[i].value=referenceInput;
            createReservadoLibreValidation(); 
            createOrganoValidation();
            //console.log(arrayInputs[i].value);
        
        }
        createSalaValidation();
        saveDataOnLocalStorage();
    }
    else {
    }
  };
};


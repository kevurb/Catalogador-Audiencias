// funciones comunes

// recive el elemento y va al siguiente input
function goToNextInput (element) {
    const parentElement = element.parentElement.nextElementSibling;
    const nextElement = parentElement.children[0];
    nextElement.focus();
};

//Funciones de Validacion
function createPlayButtonAction() {
    const butonsList = document.getElementsByClassName('play-button');

    for (let i=0; i<butonsList.length; i++) {

        butonsList[i].addEventListener('click', function playVideo (button_click) {
            const videoUrlValue = button_click.target.value;
            const videoTagHtml = '<video autoplay height="100%" controls><source src="'+ videoUrlValue +'" type="video/mp4">Your browser does not support the video tag.</video>';
            document.getElementById('video-container').innerHTML = videoTagHtml;

            // resaltar fila que se esta reproduciendo
            const elements=document.getElementsByTagName('tr');

            for(let i=0;i<elements.length;i++) {
                elements[i].classList.remove('playin-row');
            }
            const parent = button_click.target.parentNode.parentNode;
            parent.classList.add('playin-row');
        });

    };
};

function createFolderButtonAction() {
    const folderList = document.getElementsByClassName('folder-button');

    for (let i=0; i<folderList.length; i++) {

        folderList[i].addEventListener('click', function playVideo (folder_click) {
            const folderUrlValue = folder_click.target.value;
            
            //abrir archivos en reproductor
            ipcRenderer.send('channel3', folderUrlValue);

            // resaltar fila que se esta reproduciendo
            const elements=document.getElementsByTagName('tr');

            for(let i=0;i<elements.length;i++) {
                elements[i].classList.remove('playin-row');
            }
            const parent = folder_click.target.parentNode.parentNode;
            parent.classList.add('playin-row');
        });

    };
};

function createRadicadoValidation() {
    
    const radicadoInputList = document.getElementsByName('Radicado');

    for (let i=0; i<radicadoInputList.length; i++) {
        const actualInput = radicadoInputList[i];
        actualInput.addEventListener('input', function (radicadoFormat) {
            let inputValue = radicadoFormat.target.value;
            let cleanInputValue = inputValue.replace(/[\W\s\._\-]+/g, '');

            let splitArray = [];
            let checkOrganoRadicado = false;
            let checkAnoRadicado = false;
            let checkLargoRadicado = false;

            if (cleanInputValue.length <= 27) {
                let splittedText1 = cleanInputValue.substring(0, 5);
                splitArray.push(splittedText1);

                if (cleanInputValue.length >= 6) {
                    let splittedText2 = cleanInputValue.substring(5, 12);
                    splitArray.push(splittedText2);

                    // validar "organo" del radicado
                        let radicadoOrgano = splittedText1 + splittedText2;
                        if (typeof despachosObject[radicadoOrgano] !== "undefined") {
                            checkOrganoRadicado = true;
                        } else {
                            //console.log('organo incorrecto');
                        }

                    if (cleanInputValue.length >= 13) {
                        let splittedText3 = cleanInputValue.substring(12, 16);
                        splitArray.push(splittedText3);

                                // validar "año" del radicado
                                if (splittedText3 >= 2000 && splittedText3 <= currentYear) {
                                    checkAnoRadicado = true;
                                } else {
                                    //console.log('año incorrecto');
                                }

                        if (cleanInputValue.length >= 17) {
                            let splittedText4 = cleanInputValue.substring(16, 21);
                            splitArray.push(splittedText4);

                            if (cleanInputValue.length >= 22) {
                                let splittedText4 = cleanInputValue.substring(21, 23);
                                splitArray.push(splittedText4);

                                        //validar largo
                                        if (cleanInputValue.length == 23) {
                                            checkLargoRadicado = true;
                                        } else {
                                            //console.log('largo incorrecto');
                                        }
                            };
                        };
                    };
                };
                actualInput.value = splitArray.join("-");

                // validar hora y colorear correcto o incorrecto
                if (inputValue == 0) {
                    this.parentElement.style.borderBottomColor = 'rgba(255, 255, 255, 0.123)';
                }else {
                    if (/* checkOrganoRadicado && */ checkAnoRadicado && checkLargoRadicado == true) {
                        this.parentElement.style.borderBottomColor = 'green';
                        goToNextInput(this);

                    } else {
                        this.parentElement.style.borderBottomColor = 'red';
                    }
                }
                //checkConsecutivo ();
            } else {
                actualInput.value = "";
            };
        });

        // ejecutar evento luego de crearlo
        const event = new Event('input');
        actualInput.dispatchEvent(event);
    };
};

function createFechaValidation() {
    const dateInputList = document.getElementsByName('Date');


    for (let i=0; i<dateInputList.length; i++) {
        const actualInput = dateInputList[i];
        actualInput.addEventListener('input', function (dateFormat) {
            let inputValue = dateFormat.target.value;
            let cleanInputValue = inputValue.replace(/[\W\s\._\-]+/g, '');

            //variables necesarias
            let splitArray = [];
            let checkyear = false;
            let checkmonth = false;
            let checkday = false;
            let checkLargoRadicado = false;

            if (cleanInputValue.length <= 10) {
                let splittedText1 = cleanInputValue.substring(0, 4);
                        
                    //validar año
                        if (splittedText1 >= 2000 && splittedText1 <= currentYear) {
                            checkyear = true;
                        } else {
                            checkyear = false;
                            //corregir al año actual si es mas alto
                            //splittedText1 = currentYear;
                        }
                        splitArray.push(splittedText1);


                    if (cleanInputValue.length >= 5) {
                        let splittedText2 = cleanInputValue.substring(4, 6);
                                
                            //validar mes
                                if (splittedText2 >= 1 && splittedText2 < 13) {
                                    checkmonth = true;
                                } else {
                                    checkmonth = false;
                                    //corregir al ultimo mes si es mas alto
                                    //splittedText2 = 12;
                                }
                                splitArray.push(splittedText2);

                        if (cleanInputValue.length >= 7) {
                            let splittedText3 = cleanInputValue.substring(6, 8);
                                    
                                //validar dia
                                    if (splittedText3 >= 1 && splittedText3 < 32) {
                                        checkday = true;
                                    } else {
                                        checkday = false;
                                        //corregir al ultimo dia del mes si es mas alto
                                        /*
                                        const lastMonthDay = {
                                            '01': '31',
                                            '02': '29',
                                            '03': '31',
                                            '04': '30',
                                            '05': '31',
                                            '06': '30',
                                            '07': '31',
                                            '08': '31',
                                            '09': '30',
                                            '10': '31',
                                            '11': '30',
                                            '12': '31'
                                        }
                                        splittedText3 = lastMonthDay[splittedText2];
                                        checkday = true; */
                                    }
                                    splitArray.push(splittedText3);

                                    //validar largo
                                    if (cleanInputValue.length == 8) {
                                        checkLargoRadicado = true;
                                    } else {
                                        //console.log('largo incorrecto');
                                    }
/*
                                    // si la fecha es futura corregir a la fecha actual
                                    if (splitArray.join("") > currentDate.join("")) {
                                        //asignar al input los valores de la fecha de hoy
                                        actualInput.value = currentDate.join("/");
                                    } else {
                                        //asignar al input los valores correctamente escritos
                                        actualInput.value = splitArray.join("/");
                                    } 
                                    */
                        };
                };
                actualInput.value = splitArray.join("/");

                // validar hora y colorear correcto o incorrecto
                if (inputValue == 0) {
                    this.parentElement.style.borderBottomColor = 'rgba(255, 255, 255, 0.123)';
                }else {
                    if (checkyear && checkmonth && checkday && checkLargoRadicado == true) {
                        this.parentElement.style.borderBottomColor = 'green';
                        goToNextInput(this);

                    } else {
                        this.parentElement.style.borderBottomColor = 'red';
                    }
                }
                //checkConsecutivo ();
            } else {
                actualInput.value = "";
            };
        });

        // ejecutar evento luego de crearlo
        const event = new Event('input');
        actualInput.dispatchEvent(event);
    };
};

function createHoraValidation(){

    const timeInputList = document.getElementsByName('Time');

    for (let i=0; i<timeInputList.length; i++) {
        const actualInput = timeInputList[i];
        actualInput.addEventListener('input', function (timeFormat) {
            let inputValue = timeFormat.target.value;
            let cleanInputValue = inputValue.replace(/[\W\s\._\-]+/g, '');

            let splitArray = [];
            let checkhour = false;
            let checkmin = false;
            let checkseg = false;
            let checkLargoRadicado = false;

            if (cleanInputValue.length <= 8) {
                let splittedText1 = cleanInputValue.substring(0, 2);

                        //validar la hora
                        if (splittedText1 < 24) {
                            checkhour = true;
                        } else {
                            checkhour = false;
                            //corregir al la ultima hora del dia
                            //splittedText1 = 23;
                        }
                        splitArray.push(splittedText1);

                if (cleanInputValue.length >= 3) {
                    let splittedText2 = cleanInputValue.substring(2, 4);

                            //validar la minutos
                            if (splittedText2 < 60) {
                                checkmin = true;
                            } else {
                                checkmin = false;
                                //corregir al ultimo minuto
                                //splittedText2 = 59;
                            }
                            splitArray.push(splittedText2);

                    if (cleanInputValue.length >= 5) {
                        let splittedText3 = cleanInputValue.substring(4, 6);

                                //validar la minutos
                                if (splittedText3 < 60) {
                                    checkseg = true;
                                } else {
                                    checkseg = false;
                                    //corregir al ultimo segundo
                                    //splittedText3 = 59;
                                    //checkseg = true;
                                }
                                splitArray.push(splittedText3);

                                //validar largo
                                if (cleanInputValue.length == 6) {
                                    checkLargoRadicado = true;
                                } else {
                                    //console.log('largo incorrecto');
                                }
                    };
                };
                actualInput.value = splitArray.join(":");

                // validar hora y colorear correcto o incorrecto
                if (inputValue == 0) {
                    this.parentElement.style.borderBottomColor = 'rgba(255, 255, 255, 0.123)';
                }else {
                    if (checkhour && checkmin && checkseg && checkLargoRadicado == true) {
                        this.parentElement.style.borderBottomColor = 'green';
                        goToNextInput(this);

                    } else {
                        this.parentElement.style.borderBottomColor = 'red';
                    }
                }
                //checkConsecutivo ();
            } else {
                actualInput.value = "";
            };
        });

        // ejecutar evento luego de crearlo
        const event = new Event('input');
        actualInput.dispatchEvent(event);
    };
};

function createOrganoValidation() {
    
    const organoInputList = document.getElementsByName('Organo');

    for (let i=0; i<organoInputList.length; i++) {
        const actualInput = organoInputList[i];
        actualInput.addEventListener('input', function (organoFormat) {
            let inputValue = organoFormat.target.value;

            //solo dejar numeros
            let cleanInputValue = inputValue.replace(/[\W\s\._\-]+/g, '');

            //aceptar solo 12 valores
            if (cleanInputValue.length <= 12) {
                actualInput.value = cleanInputValue;

            } else {
                actualInput.value = "";
            };
            
            //consultar el listado de despachos y colorear correcto o incorrecto
            if (inputValue == 0) {
                this.parentElement.style.borderBottomColor = 'rgba(255, 255, 255, 0.123)';
                
            }else {
                if (typeof despachosObject[inputValue] !== "undefined") {
                    this.parentElement.style.borderBottomColor = 'green';

                    // colocar el valor de Reservado o Libre 
                    
                    //buscar el campor R/L
                    const parentElement = this.parentElement.nextElementSibling;
                    const salaNextElement = parentElement.nextElementSibling;
                    const reservadoInput = salaNextElement.children[0];
                    const entidadEspecialidad = cleanInputValue.substring(5, 9);

                    // revisar si el campo esta vacio si esta lleno no se cambia
                    if (reservadoInput.value == '') {

                        // verificar si el organo es libre o reservado y aplicar
                        if (typeof juzgadosLibresObject[entidadEspecialidad] !== "undefined") {
                            reservadoInput.value = 'L';
                        } else {
                            reservadoInput.value = 'R';
                        }
                    }
                            
                    goToNextInput(this);
                    
                } else {
                    this.parentElement.style.borderBottomColor = 'red';
                }
            }
        });

        // ejecutar evento luego de crearlo
        const event = new Event('input');
        actualInput.dispatchEvent(event);
    };
};

function createSalaValidation() {
    
    const salaInputList = document.getElementsByName('Sala');

    for (let i=0; i<salaInputList.length; i++) {
        const actualInput = salaInputList[i];
        actualInput.addEventListener('input', function (salaFormat) {
            let inputValue = salaFormat.target.value;

            //solo dejar numeros y letras
            let cleanInputValue = inputValue.replace(/[^a-zA-Z0-9]/g, '');

            //aceptar solo 12 valores
            if (cleanInputValue.length <= 12) {
                actualInput.value = cleanInputValue;

            } else {
                actualInput.value = "";
            };

            //validar el largo y colorear correcto o incorrecto
            //console.log(inputValue);
            //console.log(inputValue.length);

            const regex = /^[a-zA-Z]{3}Sala[0-9]{3}$/;
            
            if (inputValue == "") {
                //console.log('se restablece');
                this.parentElement.style.borderBottomColor = 'rgba(255, 255, 255, 0.123)';
            }else {
                if (cleanInputValue.length == 10) {
                    if (regex.test(cleanInputValue)) {
                        this.parentElement.style.borderBottomColor = 'green';
                      } else {
                        this.parentElement.style.borderBottomColor = 'red';
                      }
                    
                    //goToNextInput(this);
                } else {
                    this.parentElement.style.borderBottomColor = 'red';
                }
            }
        });

        // ejecutar evento luego de crearlo
        const event = new Event('input');
        actualInput.dispatchEvent(event);
    };
};

function createReservadoLibreValidation() {

    const reservedInputList = document.getElementsByName('Reserved');

    for (let i=0; i<reservedInputList.length; i++) {
        const actualInput = reservedInputList[i];
        actualInput.addEventListener('input', function (reservedFormat) {
            let inputValue = reservedFormat.target.value;
            actualInput.value = inputValue.toUpperCase();
            if(actualInput.value == ''){
                this.parentElement.style.borderBottomColor = 'rgba(255, 255, 255, 0.123)';

            }
            else {
                if (actualInput.value == 'R' || actualInput.value == 'L' ){
                    this.parentElement.style.borderBottomColor = 'green';
                }
                else{
    
                    this.parentElement.style.borderBottomColor = 'red';
                }
            } 
            
            //checkConsecutivo ();
        });

        // ejecutar evento luego de crearlo
        const event = new Event('input');
        actualInput.dispatchEvent(event);
    };
};

function createVirtualPresencialValidation() {

const virtualInputList = document.getElementsByName('Virtual');

    for (let i=0; i<virtualInputList.length; i++) {
        const actualInput = virtualInputList[i];
        actualInput.addEventListener('input', function (virtualFormat) {
            let inputValue = virtualFormat.target.value;
            actualInput.value = inputValue.toUpperCase();
            //checkConsecutivo ();
            if(actualInput.value == ''){
                this.parentElement.style.borderBottomColor = 'rgba(255, 255, 255, 0.123)';

            }
            else {
                if (actualInput.value == 'V' || actualInput.value == 'P' ){
                    this.parentElement.style.borderBottomColor = 'green';
                }
                else{
    
                    this.parentElement.style.borderBottomColor = 'red';
                }
            } 
        });
        
        // ejecutar evento luego de crearlo
        const event = new Event('input');
        actualInput.dispatchEvent(event);
    };
};


function createCategoriaValidation() {

    const categoryInputList = document.getElementsByName('Category');
    
        for (let i=0; i<categoryInputList.length; i++) {
            const actualInput = categoryInputList[i];
            actualInput.addEventListener('change', function (categoryFormat) {
                
                //console.log([actualInput]);
                let selectClassName = actualInput.className;
                let rowList = document.getElementsByClassName(selectClassName);

                const fieldCategoria = rowList['Category'].value;

                
                // colocar valores fijos al campo de sala y virtual/reservado

                switch (fieldCategoria) {
                    case "Teams":   rowList['Sala'].value = 'TeaSala001';
                                    rowList['Virtual'].value = 'V';
                        break;
                    case "Historico":   rowList['Virtual'].value = 'P';
                       
                        break;
                    
                    case "Lifesize":    rowList['Sala'].value = 'LifSala001';
                                        rowList['Virtual'].value = 'V';
                        break;
                
                    default:    if (rowList['Sala'].value == 'TeaSala001' || rowList['Sala'].value == 'LifSala001') {
                        rowList['Sala'].value = '';
                         rowList['Virtual'].value = '';
                    };
                        break;
                }

                // ejecutar evento de validacion en el campo sala
                
                const fieldEvent = new Event('input');
                rowList['Sala'].dispatchEvent(fieldEvent); 
                
            });
        };
    };
function createCategoriaValidationAutoFill() {

    const categoryInputList = document.getElementsByName('Category');
    
        for (let i=0; i<categoryInputList.length; i++) {
            const actualInput = categoryInputList[i];
            actualInput.addEventListener('change', function (categoryFormat) {
                
                //console.log([actualInput]);
                let selectClassName = actualInput.className;
                let rowList = document.getElementsByClassName(selectClassName);

                const fieldCategoria = rowList['Category'].value;
                const fieldSala = rowList['Sala'].value;
                //console.log('cuandooooooooooo',fieldSala)
                // colocar valores fijos al campo de sala y virtual/reservado

                switch (fieldCategoria) {
                    case "Teams":   rowList['Sala'].value = 'TeaSala001';
                                    rowList['Virtual'].value = 'V';
                        break;
                    case "Historico":   rowList['Virtual'].value = 'P';
                                        rowList['Sala'].value = fieldSala;
                        break;
                    
                    case "Lifesize":    rowList['Sala'].value = 'LifSala001';
                                        rowList['Virtual'].value = 'V';
                        break;
                
                    default:    if (rowList['Sala'].value != 'TeaSala001' || rowList['Sala'].value != 'LifSala001') {
                        rowList['Sala'].value = '';
                         rowList['Virtual'].value = '';
                    };
                        break;
                }

                // ejecutar evento de validacion en el campo sala
                
                const fieldEvent = new Event('input');
                rowList['Sala'].dispatchEvent(fieldEvent); 

            });
        };
    };
function createLengthValidation(){

    const LengthInputList = document.getElementsByName('Length');
    //console.log(':',LengthInputList.defaulValue);
    for (var i=0; i <= LengthInputList.length;i++){
        const Lengthactual = LengthInputList[i];
        if (Lengthactual== '72'){

        }
        else{}

    }
};

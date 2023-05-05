function validarEntrada(entrada) {
    // Expresión regular para validar la entrada
    const regex = /^[a-zA-Z]{3}Sala[0-9]{3}$/;
    
    // Verificar si la entrada cumple con la expresión regular
    if (regex.test(entrada)) {
      return true; // La entrada es válida
    } else {
      return false; // La entrada no es válida
    }
  }
  
  // Ejemplo de uso
  const entradaValida = '123Sala123';
  const entradaInvalida = 'ABCSalaxxx';
  
  console.log(validarEntrada(entradaValida)); // true
  console.log(validarEntrada(entradaInvalida)); // false
  
  const cadena = "AUDIENCIA DEL ARTICULO 392 DEL C.G.P. - VERBAL SUMARIO RAD. No. 13001400300920190000100 (38113)-20210519_101650";
const expresionRegular = /\d{23}/;

const resultado = cadena.match(expresionRegular);
const valor = expresionRegular.test(cadena);
console.log(valor);




function fillDataExist(){

  const NamesArrayList = document.getElementsByName('Name');
  const RadicadoList = document.getElementsByName('Radicado');
  for (let i=1; i<NamesArrayList.length; i++){
          
      const selectedClass = NamesArrayList[i].className;
      const rowList = document.getElementsByClassName(selectedClass);
      const rawFieldName = rowList['Name'].value; 
      const buscarradicado = /\d{23}/;
  
      const radicados = [];
      
      //console.log("nombeee-zzz<<<<>>>>>>",rawFieldName);
      //const digitos = names.match(buscarradicado);
      //console.log(digitos[0]);
      //const name = rawFieldName.split(' >> ');
      //console.log(name);
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
      RadicadoList[i-1].value=radicados[0];
     
      createRadicadoValidation();
      
  };
  
  
  }


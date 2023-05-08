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
  
 /*console.log(validarEntrada(entradaInvalida)); // false
  
  const expresionRegular = /\d{23}/;

const resultado = cadena.match(expresionRegular);
const valor = expresionRegular.test(cadena);
console.log(valor);*/




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
  
  
  };

  const cadena1 = "11001408801320110738000_110014088013CSJSala001_20110727_173631_1";
  const expresionRegular3 = /_20[0-2]\d{5}/;
  
  if(expresionRegular3.test(cadena1)){
    const nueva = cadena1.match(expresionRegular3);
    console.log("La cadena cumple con el patrón",nueva[0].substring(1));
  } else {
    console.log("La cadena no cumple con el patrón");
  }

 
  const texto = "El reporte se generó a las_235959.";
const hora = /_([01]\d|2[0-3])[0-5]\d[0-5]\d/;
const horaEncontrada = texto.match(hora);

console.log(horaEncontrada[0].substring(1)); // muestra ["_235959"]
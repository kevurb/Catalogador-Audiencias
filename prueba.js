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
  
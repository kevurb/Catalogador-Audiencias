const {ipcRenderer} = require('electron');

// codigo IPC listener para recibir los datos de el archivo verify .txt
ipcRenderer.on('channel5', (e, args) => {
  console.log(args);
  createVerifyTable (args);
})

function createVerifyTable (array) {
  array.Check = "Duplicado"
  let html = '<table id="table-container" class="verify-table">';
      html += '<thead id="header-container"><tr>';
      html += '<th class="table-header">  </th>';
      html += '<th class="table-header">Tamaño</th>';
      html += '<th class="table-header">Ruta</th>';
      //html += '<th class="table-header">Nombre</th>';
      
      
      
      html += '</tr></thead>';

      html += '<tbody id= "row-container"';

      if (typeof(array.length) == 'undefined') {
        
        html += '<tr>';

        //validar si el json es de importacion o de catalogacion
            if (typeof(array.Check)  == 'undefined') {
              html += `<td></td>`
            } else {
              document.getElementById("verify-page-title").innerText = "RESULTADO DE CATALOGACION";

              // si hay algun error colocar en rojo la celda
              if(array.Check == "error-al-copiar" || array.Check == "verificar-eliminacion") {
                html += `<td style="background: #c06363">${array.Check}</td>`;
              } else {
                html += `<td>${array.Check}</td>`;
              }
            }
            html += `<td>${array.Length}</td>`;
            html += `<td class="folder-link" title="Clic para abrir en carpeta">${array.FullName}</td>`;
            //html += `<td>${array.Name}</td>`;
            
            html += '</tr>';

      } else {

              array.forEach(element => {

                html += '<tr>';

                //validar si el json es de importacion o de catalogacion
                    if (typeof(element.Check)  == 'undefined') {
                      html += `<td></td>`
                    } else {
                      document.getElementById("verify-page-title").innerText = "RESULTADO DE CATALOGACION";

                      // si hay algun error colocar en rojo la celda
                      if(element.Check == "error-al-copiar" || element.Check == "verificar-eliminacion") {
                        html += `<td style="background: #c06363">${element.Check}</td>`;
                      } else {
                        html += `<td>${element.Check}</td>`;
                      }
                      
                    }
                html += `<td>${element.Length}</td>`;
                html += `<td class="folder-link" title="Clic para abrir en carpeta">${element.FullName}</td>`;  
                //html += `<td>${element.Name}</td>`;
                html += '</tr>';
            });

      }
      
        html += '</tbody></table>';
   
        document.getElementById('verify-table-container').innerHTML = html;

        createFolderLinkAction()
}


function createFolderLinkAction() {
  const folderList = document.getElementsByClassName('folder-link');

  for (let i=0; i<folderList.length; i++) {

      folderList[i].addEventListener('click', function openFile (folder_click) {
          const folderUrlValue = folder_click.target.innerText;
          console.log([folderUrlValue]);
          ipcRenderer.send('channel6', folderUrlValue);
      });

  };
};
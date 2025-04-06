/**
 * Validates a CSV file against several criteria
 * @param {File} file - The file object to validate
 * @returns {Object} - Object with validation results
 */
export const validateCSVFile = async (file) => {
    const validationResults = {
      isCSVExtension: { 
        status: 'pending', 
        message: 'El archivo debe tener extensión .csv' 
      },
      isNotEmpty: { 
        status: 'pending', 
        message: 'El archivo no debe estar vacío'
      },
      hasNoEmptyRows: { 
        status: 'pending', 
        message: 'El archivo no debe tener filas vacías'
      },
      hasSemicolonSeparator: { 
        status: 'pending', 
        message: 'El archivo debe estar separado por punto y coma (;)' 
      },
    };
  
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.csv')) {
      validationResults.isCSVExtension.status = 'success';
    } else {
      validationResults.isCSVExtension.status = 'error';
    }
  
    try {
      // Read file content
      const fileContent = await readFileContent(file);
      
      // Check if file is completely empty
      if (fileContent.trim().length === 0) {
        validationResults.isNotEmpty.status = 'error';
        validationResults.hasNoEmptyRows.status = 'error';
        validationResults.hasSemicolonSeparator.status = 'error';
        return validationResults;
      }
      
      validationResults.isNotEmpty.status = 'success';
      
      // Normalizamos los saltos de línea (CR, LF, CRLF -> LF)
      const normalizedContent = fileContent.replace(/\r\n|\r/g, '\n');
      
      // Verificamos si tiene filas vacías usando la función proporcionada
      const hasEmptyRows = tieneFilasVacias(normalizedContent);
      validationResults.hasNoEmptyRows.status = hasEmptyRows ? 'error' : 'success';
      
      // Verificación del separador
      // Dividimos en líneas y filtramos las que están completamente vacías
      const lines = normalizedContent.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length > 0) {
        // Inicializamos contadores de diferentes separadores
        let semicolonCount = 0;
        let commaCount = 0;
        let pipeCount = 0;
        let tabCount = 0;
        
        // Analizamos cada línea con contenido
        for (const line of lines) {
          semicolonCount += (line.match(/;/g) || []).length;
          commaCount += (line.match(/,/g) || []).length;
          pipeCount += (line.match(/\|/g) || []).length;
          tabCount += (line.match(/\t/g) || []).length;
        }
        
        // Verificamos si hay algún punto y coma y si no hay otros separadores más predominantes
        if (semicolonCount === 0) {
          // Sin puntos y coma, definitivamente incorrecto
          validationResults.hasSemicolonSeparator.status = 'error';
        } else if (pipeCount > 0 || commaCount > semicolonCount || tabCount > semicolonCount) {
          // Si hay pipes o hay más comas o más tabs que puntos y coma
          validationResults.hasSemicolonSeparator.status = 'error';
        } else {
          // Los puntos y coma son predominantes
          validationResults.hasSemicolonSeparator.status = 'success';
        }
        
        // Comprobación adicional: verificar un patrón típico de CSV
        const firstLine = lines[0];
        if (firstLine && (firstLine.match(/;/g) || []).length < 1) {
          // Si no hay al menos un punto y coma en la primera línea, probablemente no es un CSV correcto
          validationResults.hasSemicolonSeparator.status = 'error';
        }
      } else {
        validationResults.hasSemicolonSeparator.status = 'error';
      }
    } catch (error) {
      console.error("Error reading file:", error);
      // Mark remaining validations as error if file can't be read
      validationResults.isNotEmpty.status = 'error';
      validationResults.hasNoEmptyRows.status = 'error';
      validationResults.hasSemicolonSeparator.status = 'error';
    }
  
    return validationResults;
  };
  
  /**
   * Verifica si el CSV contiene filas vacías (definidas como filas donde todas las columnas están vacías)
   * @param {string} csvTexto - Contenido del archivo CSV
   * @returns {boolean} - True si hay filas vacías, False si no las hay
   */
  function tieneFilasVacias(csvTexto) {
    // Dividimos el texto en filas
    const filas = csvTexto.split('\n');
    
    // Verificamos cada fila
    for (const fila of filas) {
      // Omitir la última fila si está completamente vacía
      if (fila === '' && filas.indexOf(fila) === filas.length - 1) {
        continue;
      }
      
      // Dividimos la fila en columnas usando el separador punto y coma
      const columnas = fila.split(';');
      
      // Verificamos si todas las columnas están vacías después de quitar espacios
      const esFilaVacia = columnas.every(c => c.trim() === '');
      
      // Si encontramos una fila vacía, retornamos true
      if (esFilaVacia) {
        return true;
      }
    }
    
    // Si no encontramos filas vacías, retornamos false
    return false;
  }
  
  /**
   * Read file content as text
   * @param {File} file - The file to read
   * @returns {Promise<string>} - The file content as string
   */
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  };
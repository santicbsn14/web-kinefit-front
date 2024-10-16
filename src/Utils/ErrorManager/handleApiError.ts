type ErrorResponse = {
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any; // Puede ser un array o un objeto que contenga más detalles del error
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const handleError = (error: any) => {
    // Revisamos si el error es una instancia de AxiosError
    if (error.response) {
      const status = error.response.status;
      const data: ErrorResponse = error.response.data;
     console.log(error.message)
      switch (status) {
        case 400:
          if (data.message === "Validation error") {
            // Si el backend nos envía un error de validación de Zod
            
            if (Array.isArray(data.details)) {
              // Procesamos el array de errores de Zod
              const validationErrors = data.details
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((detail: any) => `${detail.path.join('.')} - ${detail.message}`)
                .join(', ');

              return `Error de validación: ${validationErrors}`;
            }
            return "Error de validación desconocido.";
          }
          return "Solicitud incorrecta (400)";
        case 401:
          if (data.message.includes('invalid password')) {
            return 'Contraseña incorrecta. Inténtalo de nuevo.';
          }
          if (data.message.includes('Email and Password invalid format')) {
            return 'Formato de email o contraseña inválido.';
          }
          return "Error de autenticación (401)";
  
        case 404:
          if (data.message.includes('not found')) {
            return "Recurso no encontrado (404)";
          }
          if (data.message.includes("User don't exist")) {
            return "Usuario no encontrado.";
          }
          if(data.message.includes('No se han configurado los horarios de este profesional')){
            return 'No se han configurado los horarios de este profesional'
          }
          return "No se pudo encontrar el recurso (404)";
  
          case 409:
            if(data.message.includes('turno')){
              return "El paciente ya tiene un turno asignado para esta fecha."
            }
            if(data.message.includes('email')){
              return "El email ingresado ya pertenece a un usuario existente"
            }
            if(data.message.includes('Los pacientes no pueden ser profesionales')){
              return "Los pacientes no pueden ser profesionales"
            }
            if(data.message.includes('The professional does not work in that time slot')){
              return "El profesional no trabaja en el horario ingresado"
            }
            if(data.message.includes('El recurso ya ha sido creado previamente')){
              return 'El recurso ya ha sido creado previamente'
            }
            return "Hay un conflicto con los datos ingresados"
        case 500:
          return "Ocurrió un error en el servidor. Por favor, intenta más tarde.";
  
        default:
          return `Error inesperado (Status: ${status})`;
      }
    } else if (error.request) {
      // No se recibió respuesta del servidor
      return "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
    } else {
      // Otros errores que no sean de Axios (configuración, etc.)
      return `Error inesperado: ${error.message}`;
    
    }
  };
  
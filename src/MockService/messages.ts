import dayjs from "dayjs";
export const sendWhatsAppMessageConfirmAppointment = (receptor: string, date: Date) => {
    // Si el número no comienza con "54", se lo agregamos
    let receptor_send = receptor.toString()
    
    if (!receptor_send.startsWith('54')) {
      receptor_send = '54' + receptor;
    }
    const message = `Hola, te contactamos desde kinefit para comentarte que confirmamos tu turno y te esperamos el día ${dayjs(date).format('dddd, D [de] MMMM [de] YYYY')}`;
    const whatsappLink = `https://wa.me/${receptor_send}?text=${encodeURIComponent(message)}`;
  
    window.open(whatsappLink, '_blank');
  };
  
import dayjs from "dayjs";

export const sendWhatsAppMessageConfirmAppointment = (receptor: string, date: Date, hour: string) => {
    // Si el número no comienza con "54", se lo agregamos
    let receptor_send = receptor.toString()
    console.log(date)
    if (!receptor_send.startsWith('54')) {
      receptor_send = '54' + receptor;
    }
    const message = `Hola, te contactamos desde kinefit para comentarte que confirmamos tu turno y te esperamos a las ${hour} horas, el día ${dayjs(date).format('dddd, D [de] MMMM [de] YYYY')}. Te dejamos nuestro instagram para que puedas conocer mas sobre nosotros https://www.instagram.com/kinefit.sn/`;
    const whatsappLink = `https://wa.me/${receptor_send}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappLink, '_blank');
  };
  
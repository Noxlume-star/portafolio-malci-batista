/* =========================================================
   CONTENIDO EDITABLE — modifica solo este archivo.
   Reemplaza los textos de ejemplo por tus datos reales.
   Las imágenes van en assets/img/ (yo.jpg, mascara-batman.jpg, etc.)
   ========================================================= */
window.PORTAFOLIO = {
  identidad: {
    nombre: "TU NOMBRE",
    condicion: "Desarrolladora Web Full Stack",
    especialidad: "Especialidad: soluciones web para negocios",
    descripcion: "Descripción breve de quién eres.",
    numero: "ID-000",
    ciudad: "",
    edad: "",
    estudiante: false,
    institucion: "",
    foto: "assets/img/yo.jpg",
    datos: []
  },

  sobreMi: {
    titulo: "Sobre mí",
    foto: "assets/img/yo.jpg",
    perfil: "Escribe aquí tu perfil profesional.",
    formacion: "Escribe aquí tu formación académica.",
    descripcion: "Escribe aquí tu descripción personal.",
    objetivos: "Escribe aquí tus objetivos profesionales."
  },

  // Categorías válidas: Frontend, Backend, Bases de datos, Herramientas, Otros conocimientos
  // nivel: número de 0 a 100, o null si no quieres mostrarlo
  habilidades: [
    { nombre: "EJEMPLO: HTML5", categoria: "Frontend", icono: "◆", nivel: null, descripcion: "Reemplaza esta habilidad." },
    { nombre: "EJEMPLO: Node.js", categoria: "Backend", icono: "◆", nivel: 70, descripcion: "Reemplaza esta habilidad." }
  ],

  proyectos: [
    {
      nombre: "Proyecto de ejemplo",
      portada: "assets/img/proyecto-1.jpg",
      descripcion: "Descripción corta del proyecto.",
      categoria: "Landing page",
      estado: "Publicado",
      visible: true,
      descripcionCompleta: "Descripción completa del proyecto.",
      problema: "Qué problema resuelve.",
      utilidad: "Para qué sirve.",
      tecnologias: ["HTML", "CSS", "JavaScript"],
      lenguajes: ["JavaScript"],
      caracteristicas: ["Característica principal 1", "Característica principal 2"],
      estructura: "index.html\ncss/styles.css\njs/main.js",
      capturas: ["assets/img/proyecto-1.jpg"],
      url: "#",
      github: "#"
    }
  ],

  disponible: true,
  pie: "© 2026 · Todos los derechos reservados · Hecho por Alec Towers",
  capitulo: {
    numero: "Capítulo I",
    linea1: "Nadie sabe quién se oculta",
    linea2: "detrás de la fotografía.",
    texto: "Mueve el cursor, o pasa el dedo, para descubrir la otra cara de la historia.",
    fotoBase: "",
    fotoVelo: ""
  },
  canal: { titulo: "Canal seguro", texto: "Comunícate conmigo.", correo: true, whatsapp: true, github: true, linkedin: true, instagram: true },
  invitacion: { activa: true, titulo: "¿Trabajamos juntos?", texto: "Si tienes un proyecto en mente, cuéntame y lo convertimos en realidad.", boton: "Escríbeme por WhatsApp", enlace: "#" },
  clientes: { valor: 50, visible: true },
  servicios: [
    { nombre: "Landing page", detalle: "Página de una sección para promocionar tu negocio.", tiempo: "3 a 5 días", icono: "◆" }
  ],
  certificados: [
    { nombre: "Nombre del certificado", emisor: "Institución que lo emite", fecha: "2026", imagen: "", enlace: "#", visible: true }
  ],
  presupuesto: {
    opciones: ["Menú digital", "Catálogo digital", "Página web completa", "Página web básica"],
    plazos: ["Menos de 1 semana", "1 a 2 semanas", "Más de 2 semanas"]
  },
  contacto: {
    correo: "tu@correo.com",
    github: "#",
    linkedin: "#",
    instagram: "#",
    whatsapp: ""
  }
};

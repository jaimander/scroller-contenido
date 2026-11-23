
const transportadora = document.querySelector("#transportadora");

let posicion = 0;
let noticias = [];
let indiceNoticia = 0;
let contadorTaps = 0;
const tapsNecesarios = 5;

// Crear indicador de taps
const indicador = document.createElement("div");
indicador.id = "contador-taps";
indicador.textContent = "0/5";
document.body.appendChild(indicador);

// Generar color
function colorAleatorio() {
  return "rgb(255, 255, 255)";
}

// Mezclar noticias aleatoriamente
function mezclarNoticias(array) {
  return [...array].sort(() => Math.random() - 0.5);
}


function crearElemento() {

  const div = document.createElement("div");

  div.classList.add("elemento");
  div.style.backgroundColor = colorAleatorio();

  const noticia = noticias[indiceNoticia];

  // Guardar enlace asociado a la noticia
  div.dataset.link = noticia.link || "";

  // Crear contenedor de imagen
  const contenedorImagen = document.createElement("div");
  contenedorImagen.classList.add("contenedor-imagen");

  // Crear imagen
  const imagen = document.createElement("img");
  imagen.classList.add("imagen-noticia");

  if (noticia.imagen) {
    imagen.src = noticia.imagen;
    imagen.alt = "";
  }

  contenedorImagen.appendChild(imagen);
  div.appendChild(contenedorImagen);

  // Crear contenedor de texto
  const contenedorTexto = document.createElement("div");
  contenedorTexto.classList.add("contenedor-texto");

  const texto = document.createElement("p");
  texto.classList.add("texto-noticia");

  contenedorTexto.appendChild(texto);
  div.appendChild(contenedorTexto);

  transportadora.appendChild(div);

  // Recortar texto según el espacio disponible
  recortarTexto(texto, noticia.informacion);

  // Pasar a la siguiente noticia
  indiceNoticia++;

  if (indiceNoticia >= noticias.length) {
    noticias = mezclarNoticias(noticias);
    indiceNoticia = 0;
  }
}


// Recortar texto y agregar [...]
function recortarTexto(elemento, textoOriginal) {

  elemento.textContent = textoOriginal;

  if (elemento.scrollHeight <= elemento.clientHeight) return;

  const palabras = textoOriginal.trim().split(/\s+/);

  let inicio = 0;
  let fin = palabras.length;

  while (inicio < fin) {

    const medio = Math.ceil((inicio + fin) / 2);

    elemento.textContent =
      palabras.slice(0, medio).join(" ") + " [...]";

    if (elemento.scrollHeight <= elemento.clientHeight) {
      inicio = medio;
    } else {
      fin = medio - 1;
    }
  }

  elemento.textContent =
    palabras.slice(0, inicio).join(" ") + " [...]";
}

// Obtener enlace de la noticia visible
function obtenerEnlaceActual() {
  const elementoActual = transportadora.children[posicion];

  return elementoActual?.dataset.link || "";
}

// Registrar taps
document.addEventListener("click", (e) => {

  // Bloquear navegación mediante otros enlaces
  if (e.target.closest("a")) {
    e.preventDefault();
  }

  contadorTaps++;

  indicador.textContent = `${contadorTaps}/${tapsNecesarios}`;

 // Al completar los 5 taps
if (contadorTaps >= tapsNecesarios) {

  const enlace = obtenerEnlaceActual();

  if (enlace) {
    try {
      const url = new URL(enlace, window.location.href);

      if (url.protocol === "https:" || url.protocol === "http:") {

        // Mostrar mensaje de redirección
        indicador.textContent = "REDIRIGIENDO...";

        // Evitar más interacciones
        document.body.style.pointerEvents = "none";

        // Pequeña pausa antes de redirigir
        setTimeout(() => {
          window.open(url.href, "_blank", "noopener,noreferrer");
        }, 800);

      }

    } catch (error) {
      console.error("Enlace no válido:", error);
    }
  } else {
    console.warn("Esta noticia no tiene un enlace asociado.");
    contadorTaps = 0;
    indicador.textContent = "0/5";
  }
}

});

// Cargar base de datos JSON
fetch("data/formato_noticias.json")
  .then(response => response.json())
  .then(data => {

    noticias = data.filter(noticia =>
      noticia.informacion &&
      noticia.informacion.trim() !== ""
    );

    noticias = mezclarNoticias(noticias);

    crearElemento();
    crearElemento();

    setInterval(moverTransportadora, 2000);

  })
  .catch(error => {
    console.error("Error cargando las noticias:", error);
  });

// Movimiento automático
function moverTransportadora() {

  posicion++;

  // Reiniciar contador al cambiar de noticia
  contadorTaps = 0;
  indicador.textContent = "0/5";

  transportadora.style.transform =
    `translateY(-${posicion * 100}vh)`;

  crearElemento();
}

// Bloquear desplazamiento manual
document.addEventListener("wheel", e => e.preventDefault(), {
  passive: false
});

document.addEventListener("touchmove", e => e.preventDefault(), {
  passive: false
});

document.addEventListener("keydown", e => {

  if ([
    "ArrowUp",
    "ArrowDown",
    "PageUp",
    "PageDown",
    "Home",
    "End",
    " "
  ].includes(e.key)) {
    e.preventDefault();
  }

});


document.addEventListener("contextmenu", e => {
  e.preventDefault();
});
/* =============================================
   MI CLON DE SPOTIFY — script.js
   Cada sección está marcada con la FASE
   del proyecto a la que pertenece.
   ============================================= */


/* =============================================
   FASE 2: Array de canciones
   Cada objeto tiene las propiedades que
   necesita la app. El src apunta a audio
   de dominio público (freemusicarchive.org).
   Si los enlaces no funcionan, reemplázalos
   con rutas a tus propios archivos .mp3
   ============================================= */
const canciones = [
  {
    titulo: 'Jazz in Paris',
    artista: 'Media Right Productions',
    duracion: '2:30',
    portada: 'https://picsum.photos/seed/jazz/300/300',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    titulo: 'Acoustic Breeze',
    artista: 'Benjamin Tissot',
    duracion: '3:15',
    portada: 'https://picsum.photos/seed/acoustic/300/300',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    titulo: 'Creative Minds',
    artista: 'Benjamin Tissot',
    duracion: '2:42',
    portada: 'https://picsum.photos/seed/creative/300/300',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    titulo: 'Sunny',
    artista: 'Bensound',
    duracion: '2:20',
    portada: 'https://picsum.photos/seed/sunny/300/300',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    titulo: 'Ukulele',
    artista: 'Bensound',
    duracion: '1:58',
    portada: 'https://picsum.photos/seed/ukulele/300/300',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    titulo: 'Epic Orchestra',
    artista: 'SoundHelix',
    duracion: '3:05',
    portada: 'https://picsum.photos/seed/epic/300/300',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  }
];


/* =============================================
   FASE 3: Variable de estado
   cancionActual guarda el ÍNDICE de la
   canción seleccionada en el array.
   ============================================= */
let cancionActual = 0;

/* FASE 4: Variable de estado para reproducción */
let estaReproduciendo = false;

/* FASE 7 EXTRA: Shuffle y tiempo acumulado */
let shuffleActivo = false;
let tiempoAcumuladoSegundos = 0;  // FASE 7C
let intervaloTiempo = null;        // FASE 7C: referencia al setInterval


/* =============================================
   SELECCIÓN DE ELEMENTOS DEL DOM
   Se hace UNA SOLA VEZ al cargar la página
   para no buscar en el DOM repetidamente.
   ============================================= */
const listaCanciones    = document.getElementById('listaCanciones');
const reproductor       = document.getElementById('reproductor');
const btnPlay           = document.getElementById('btnPlay');
const btnSiguiente      = document.getElementById('btnSiguiente');
const btnAnterior       = document.getElementById('btnAnterior');
const btnShuffle        = document.getElementById('btnShuffle');
const btnTema           = document.getElementById('btnTema');
const campoBusqueda     = document.getElementById('campoBusqueda');
const portadaImg        = document.getElementById('portadaImg');
const albumNombre       = document.getElementById('albumNombre');
const albumArtista      = document.getElementById('albumArtista');
const barraCarril       = document.getElementById('barraCarril');
const barraRelleno      = document.getElementById('barraRelleno');
const barraPulgar       = document.getElementById('barraPulgar');
const tiempoActual      = document.getElementById('tiempoActual');
const tiempoDuracion    = document.getElementById('tiempoDuracion');
const tiempoTotalElem   = document.getElementById('tiempoTotal');
const ecualizador       = document.getElementById('ecualizador');
const sliderVolumen     = document.getElementById('sliderVolumen');


/* =============================================
   FASE 2: Función renderizarCanciones()
   Lee el array y crea los <li> dinámicamente.
   Acepta un parámetro para poder filtrar
   (usado en la búsqueda, Fase 2 extra).
   ============================================= */
function renderizarCanciones(lista = canciones) {
  // Limpiamos antes de pintar para no duplicar
  listaCanciones.innerHTML = '';

  lista.forEach(function(cancion, indice) {
    // Buscamos el índice REAL en el array original
    // (importante para que la búsqueda no rompa la lógica)
    const indiceReal = canciones.indexOf(cancion);

    const item = document.createElement('li');

    // FASE 3: Guardamos el índice real en data-indice
    item.dataset.indice = indiceReal;

    // FASE 2: Template literals para construir el HTML interno
    item.innerHTML = `
      <span class="cancion-numero">${indice + 1}</span>
      <div class="cancion-info">
        <span class="cancion-titulo">${cancion.titulo}</span>
        <span class="cancion-artista-lista">${cancion.artista}</span>
      </div>
      <span class="cancion-duracion">${cancion.duracion}</span>
    `;

    // Marcamos como activa si es la canción actual
    if (indiceReal === cancionActual) {
      item.classList.add('activa');
    }

    listaCanciones.appendChild(item);
  });
}


/* =============================================
   FASE 3: Función seleccionarCancion(indice)
   Actualiza el estado y la UI cuando el
   usuario elige una canción.
   ============================================= */
function seleccionarCancion(indice) {
  // Actualizamos la variable de estado
  cancionActual = indice;

  const cancion = canciones[cancionActual];

  // Actualizamos el panel izquierdo
  portadaImg.src       = cancion.portada;
  albumNombre.textContent  = cancion.titulo;
  albumArtista.textContent = cancion.artista;

  // FASE 5: Resaltar la canción activa en la lista
  // Primero quitamos 'activa' de TODOS los <li>
  document.querySelectorAll('.lista-canciones li').forEach(function(li) {
    li.classList.remove('activa');
  });

  // Luego la agregamos solo al <li> correcto
  const liActivo = listaCanciones.querySelector(`[data-indice="${indice}"]`);
  if (liActivo) {
    liActivo.classList.add('activa');
    // Scroll suave para que sea visible
    liActivo.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // FASE 4: Cambiamos la fuente de audio
  // Pausamos primero para evitar que sigan sonando a la vez
  reproductor.pause();
  reproductor.src = cancion.src;

  // Reproducimos y manejamos la Promesa que devuelve .play()
  reproductor.play()
    .then(function() {
      estaReproduciendo = true;
      actualizarBotonPlay();
      actualizarAnimaciones(true);
    })
    .catch(function(error) {
      // El navegador bloqueó la reproducción automática
      console.log('No se pudo reproducir:', error);
      estaReproduciendo = false;
      actualizarBotonPlay();
    });
}


/* =============================================
   FASE 5: Función togglePlay()
   Alterna entre play y pausa.
   ============================================= */
function togglePlay() {
  // .paused es una propiedad del HTMLMediaElement
  if (reproductor.paused) {
    reproductor.play()
      .then(function() {
        estaReproduciendo = true;
        actualizarBotonPlay();
        actualizarAnimaciones(true);
      })
      .catch(function(error) {
        console.log('Error al reproducir:', error);
      });
  } else {
    reproductor.pause();
    estaReproduciendo = false;
    actualizarBotonPlay();
    actualizarAnimaciones(false);
  }
}


/* =============================================
   FASE 5: Funciones de navegación
   El operador % (módulo) es la clave para
   "dar la vuelta" al llegar al final del array.
   ============================================= */

// Avanza a la siguiente canción
function siguienteCancion() {
  let siguiente;

  if (shuffleActivo) {
    // FASE 7 EXTRA: Modo aleatorio — elegimos un índice
    // distinto al actual usando Math.random()
    do {
      siguiente = Math.floor(Math.random() * canciones.length);
    } while (siguiente === cancionActual && canciones.length > 1);
  } else {
    // (5 + 1) % 6 = 0 → al llegar al final, vuelve al inicio
    siguiente = (cancionActual + 1) % canciones.length;
  }

  seleccionarCancion(siguiente);
}

// Retrocede a la canción anterior
function anteriorCancion() {
  // Si llevamos más de 3 s reproducidos, volvemos al inicio de la misma
  if (reproductor.currentTime > 3) {
    reproductor.currentTime = 0;
    return;
  }
  // cancionActual - 1: si estamos en 0, saltamos al último
  const anterior = (cancionActual - 1 + canciones.length) % canciones.length;
  seleccionarCancion(anterior);
}


/* =============================================
   UTILIDADES: Actualizar UI
   ============================================= */

// Cambia el ícono del botón play/pausa
function actualizarBotonPlay() {
  btnPlay.textContent = estaReproduciendo ? '⏸' : '▶';
}

// Activa/desactiva las animaciones de disco y ecualizador
function actualizarAnimaciones(reproduciendo) {
  portadaImg.classList.toggle('girando', reproduciendo);
  ecualizador.classList.toggle('activo', reproduciendo);
}

// Formatea segundos → "m:ss" ó "mm:ss"
function formatearTiempo(segundos) {
  if (isNaN(segundos) || !isFinite(segundos)) return '0:00';
  const mins = Math.floor(segundos / 60);
  const segs = Math.floor(segundos % 60);
  // padStart(2, '0') convierte 7 → '07'
  return `${mins}:${segs.toString().padStart(2, '0')}`;
}

// Formatea segundos → "hh:mm:ss" para el contador total
function formatearTiempoTotal(segundosTotales) {
  const horas = Math.floor(segundosTotales / 3600);
  const mins  = Math.floor((segundosTotales % 3600) / 60);
  const segs  = segundosTotales % 60;
  return [
    horas.toString().padStart(2, '0'),
    mins.toString().padStart(2, '0'),
    segs.toString().padStart(2, '0')
  ].join(':');
}


/* =============================================
   FASE 6: Barra de progreso
   El evento 'timeupdate' se dispara varias
   veces por segundo mientras hay reproducción.
   ============================================= */
reproductor.addEventListener('timeupdate', function() {
  // Prevenimos dividir por NaN cuando el audio aún no cargó
  if (!isNaN(reproductor.duration) && reproductor.duration > 0) {
    const porcentaje = (reproductor.currentTime / reproductor.duration) * 100;

    // Movemos el relleno y el pulgar
    barraRelleno.style.width  = porcentaje + '%';
    barraPulgar.style.left    = porcentaje + '%';

    // Mostramos el tiempo en formato mm:ss
    tiempoActual.textContent  = formatearTiempo(reproductor.currentTime);
    tiempoDuracion.textContent = formatearTiempo(reproductor.duration);
  }
});

// Cuando el audio termina de cargar, mostramos la duración total
reproductor.addEventListener('loadedmetadata', function() {
  tiempoDuracion.textContent = formatearTiempo(reproductor.duration);
});


/* =============================================
   FASE 6: Clic en la barra para saltar
   e.offsetX = píxeles desde el borde izquierdo
   del elemento donde ocurrió el clic.
   ============================================= */
barraCarril.addEventListener('click', function(e) {
  // Proporción del clic respecto al ancho total
  const proporcion = e.offsetX / barraCarril.offsetWidth;
  // La convertimos a segundos
  reproductor.currentTime = proporcion * reproductor.duration;
});


/* =============================================
   FASE 5: Evento 'ended' — auto-siguiente
   Cuando la canción termina, pasamos a la
   siguiente automáticamente sin que el
   usuario haga nada.
   ============================================= */
reproductor.addEventListener('ended', function() {
  siguienteCancion();
});

// Pausar y reanudar actualizan el estado correctamente
reproductor.addEventListener('pause', function() {
  estaReproduciendo = false;
  actualizarBotonPlay();
  actualizarAnimaciones(false);
  // FASE 7C: Pausamos el contador de tiempo
  detenerContadorTiempo();
});

reproductor.addEventListener('play', function() {
  estaReproduciendo = true;
  actualizarBotonPlay();
  actualizarAnimaciones(true);
  // FASE 7C: Reanudamos el contador de tiempo
  iniciarContadorTiempo();
});


/* =============================================
   FASE 3: Delegación de eventos en la lista
   Un solo listener en el <ul> padre detecta
   clics en cualquier <li> hijo.
   Es más eficiente que un listener por <li>.
   ============================================= */
listaCanciones.addEventListener('click', function(e) {
  // closest('li') sube por el árbol DOM hasta encontrar el <li>
  // Esto soluciona el problema de hacer clic en el texto dentro del <li>
  const itemClicado = e.target.closest('li');
  if (!itemClicado) return; // Clic fuera de cualquier <li>

  // dataset devuelve strings → parseInt convierte a número
  const indice = parseInt(itemClicado.dataset.indice);
  seleccionarCancion(indice);
});


/* =============================================
   FASE 5: Event listeners de los botones
   ============================================= */
btnPlay.addEventListener('click', function() {
  // Si no hay src cargado, seleccionamos la canción actual
  if (!reproductor.src || reproductor.src === window.location.href) {
    seleccionarCancion(cancionActual);
  } else {
    togglePlay();
  }
});

btnSiguiente.addEventListener('click', siguienteCancion);
btnAnterior.addEventListener('click', anteriorCancion);

// FASE 7 EXTRA: Toggle de shuffle
btnShuffle.addEventListener('click', function() {
  shuffleActivo = !shuffleActivo;
  btnShuffle.classList.toggle('activo', shuffleActivo);
  btnShuffle.title = shuffleActivo ? 'Aleatorio: ON' : 'Aleatorio: OFF';
});


/* =============================================
   FASE 4 EXTRA: Control de volumen
   La propiedad .volume del HTMLMediaElement
   acepta valores entre 0 y 1.
   ============================================= */
sliderVolumen.addEventListener('input', function() {
  reproductor.volume = parseFloat(this.value);
});


/* =============================================
   FASE 2 EXTRA: Búsqueda en tiempo real
   El evento 'input' se dispara con cada
   tecla que el usuario escribe.
   .filter() devuelve un nuevo array solo con
   las canciones que coinciden con la búsqueda.
   ============================================= */
campoBusqueda.addEventListener('input', function() {
  const termino = this.value.toLowerCase().trim();

  if (termino === '') {
    // Sin texto → mostramos todas
    renderizarCanciones(canciones);
  } else {
    const resultado = canciones.filter(function(cancion) {
      // .includes() comprueba si el string contiene el término
      return cancion.titulo.toLowerCase().includes(termino) ||
             cancion.artista.toLowerCase().includes(termino);
    });
    renderizarCanciones(resultado);
  }
});


/* =============================================
   FASE 7A: Modo oscuro / claro
   classList.toggle() agrega la clase si no
   está, y la quita si ya está.
   localStorage persiste la preferencia entre
   recargas de página.
   ============================================= */
btnTema.addEventListener('click', function() {
  document.body.classList.toggle('modo-claro');
  const esModoClaro = document.body.classList.contains('modo-claro');
  // Guardamos la preferencia en localStorage
  localStorage.setItem('tema', esModoClaro ? 'claro' : 'oscuro');
  btnTema.textContent = esModoClaro ? '🌙' : '☀️';
});

// Aplicamos el tema guardado ANTES de que el usuario vea la página
// (esto evita el "flash" de tema incorrecto)
(function aplicarTemaGuardado() {
  const temaGuardado = localStorage.getItem('tema');
  if (temaGuardado === 'claro') {
    document.body.classList.add('modo-claro');
    btnTema.textContent = '🌙';
  }
})();


/* =============================================
   FASE 7C: Contador de tiempo acumulado
   setInterval ejecuta una función cada N ms.
   clearInterval detiene el intervalo activo.
   Guardamos en localStorage cada 10 s para
   persistir entre recargas.
   ============================================= */

// Recuperamos el tiempo guardado al arrancar
(function recuperarTiempoGuardado() {
  const guardado = localStorage.getItem('tiempoAcumulado');
  if (guardado) {
    tiempoAcumuladoSegundos = parseInt(guardado);
    tiempoTotalElem.textContent = formatearTiempoTotal(tiempoAcumuladoSegundos);
  }
})();

function iniciarContadorTiempo() {
  // Evitamos tener múltiples intervalos corriendo a la vez
  if (intervaloTiempo) return;

  intervaloTiempo = setInterval(function() {
    tiempoAcumuladoSegundos++;
    tiempoTotalElem.textContent = formatearTiempoTotal(tiempoAcumuladoSegundos);

    // Guardamos en localStorage cada 10 segundos
    if (tiempoAcumuladoSegundos % 10 === 0) {
      localStorage.setItem('tiempoAcumulado', tiempoAcumuladoSegundos);
    }
  }, 1000);
}

function detenerContadorTiempo() {
  clearInterval(intervaloTiempo);
  intervaloTiempo = null; // Reseteamos la referencia
}


/* =============================================
   INICIO: Llamamos a renderizarCanciones()
   para que las canciones aparezcan al cargar.
   La primera canción queda pre-seleccionada.
   ============================================= */
renderizarCanciones();

// Pre-cargamos el src de la primera canción (sin reproducir aún)
reproductor.src = canciones[cancionActual].src;

// Variables
// - Listado
const listadoArticulosDOM = document.querySelector("#listado-articulos");
const templatePreviaArticulo = document.querySelector("#previa-articulo").content.firstElementChild;
const loadingDOM = document.querySelector("#loading");
const miPlantillaComentario = document.querySelector("#plantillaComentario").content.firstElementChild;
const marcadorDOM = document.querySelector("#marcador");
// - Single
const singleDOM = document.querySelector("#single-blog");
const singleTitleDOM = document.querySelector("#single-blog__title");
const singleContentDOM = document.querySelector("#single-blog__content");
const botonVolverDOM = document.querySelector("#boton-volver");
// - Data
let articulos = new Array();
// 2 estados: "listado articulos" y "single articulo"
let estado = "listado articulos";
// - Paginado
let paginaActual = 1;
const numeroArticulosPorPagina = 6;
let observerCuadrado = null;
// - API
const urlAPI ="https://jsonplaceholder.typicode.com/posts/";

// Funciones
function renderizar(){
    // Comprobar estado
    switch (estado){
        case "listado articulos":
            singleDOM.classList.add("d-none");
            listadoArticulosDOM.classList.remove("d-none");
            loadingDOM.classList.add("d-none");
            break;
        case "single articulo":
            singleDOM.classList.remove("d-none");
            listadoArticulosDOM.classList.add("d-none");
            loadingDOM.classList.add("d-none");
            break;
        case "loading":
            loadingDOM.classList.remove("d-none");
            break;
    }
    // Borramos el contenido
    listadoArticulosDOM.innerHTML = "";
    // Lista de articulos
    articulos.forEach(function (articulo){
        // Clonamos plantilla
        const miArticulo = templatePreviaArticulo.cloneNode(true);
        // Modificamos los datos
        const titulo = miArticulo.querySelector("#titulo");
        titulo.textContent = articulo.title;
        const resumen = miArticulo.querySelector("#resumen");
        resumen.textContent = articulo.body;
        // Añadimos la id al boton de Ver
        const botonVer = miArticulo.querySelector("#boton-ver");
        botonVer.dataset.id = articulo.id;
        botonVer.addEventListener("click", function (){
            obtenerSingleArticulo(articulo.id);
        });
        // Insertamos
        listadoArticulosDOM.appendChild(miArticulo);
    });
}

async function obtenerArticulos(){
    // Mostrar loading

    // Calculamos los cortes
    const corteInicio = (paginaActual - 1 ) * numeroArticulosPorPagina;
    const corteFinal = corteInicio + numeroArticulosPorPagina;
    const miURL= generarURLBusqueda(corteInicio, numeroArticulosPorPagina);
    console.log(miURL);

    // Realiza la petición
    const miFetch = await fetch(miURL);
    // Transforma la respuesta. En este caso lo convierte a JSON
    const json = await miFetch.json();
    // Para de añadir articulos cuando no hay mas infomracion,
    if(json.length === 0){
        observerCuadrado.unobserve(marcadorDOM);

    }
    // Actualizamos articulos
    articulos = articulos.concat(json);

    // Redibujamos
    renderizar();

}


function generarURLBusqueda(start, limit) {
    // Creamos la constante de los parametros
    const misParametros = new URLSearchParams();

    // Parametro para ver caules coges
    misParametros.set("_start",start);
    // Le ponemos limit como limite
    misParametros.set("_limit",limit);
    // Devolvemos la url completa
    return `${urlAPI}?${misParametros.toString()}`;
} // Fin generarURLBusqueda

function avanzarPagina(){
    paginaActual++;
    obtenerArticulos();
}


function vigilanteDeMarcador(){
    // Creamos un objeto IntersectionObserver
    observerCuadrado = new IntersectionObserver((entries) => {
        // Comprobamos todas las intesecciones. En el ejemplo solo existe una: cuadrado
        entries.forEach((entry) => {
            // Si es observable, entra
            if (entry.isIntersecting) {
                // Aumentamos la pagina actual
                avanzarPagina();
            }
        });
    });

    // Añaddo observable
    observerCuadrado.observe(marcadorDOM);
}

async function mostrarTextoComentarios(id){
    // Capturamos el articulo
    const miArticulo = document.querySelector(`#${id}`);
    // Hacemos el fetch de ese articulo y obtenemos lo que queramos
    // Le hago el slice porque todos los ID empiezan por arti
    const miFetchArticulo = await fetch(generarURLBusquedaPorID(id.slice(4)));
    const jsonArticulo = await miFetchArticulo.json();

    const misComentarios = jsonArticulo;
    misComentarios.forEach(function (comentario){
        // Clonamos nuestra plantila
        const miComentario = miPlantillaComentario.cloneNode(true);
        // Obtenemis el nombre del comentario
        const miComentarioNombre = miComentario.querySelector("#nombre-comentario");
        // Cambiamos el nombre
        miComentarioNombre.textContent = comentario.name;
        // Obtenemis el email del comentario
        const miComentarioEmail = miComentario.querySelector("#email-comentario");
        // Cambiamos el mail
        miComentarioEmail.textContent = comentario.email;
        // Obtenemis el cuerpo del comentario
        const miComentarioCuerpo = miComentario.querySelector("#body-comentario");
        // Cambiamos el cuerpo
        miComentarioCuerpo.textContent = `"${comentario.body}"`;

        // Pintamos
        miArticulo.appendChild(miComentario);
    });
    console.log(misComentarios);
    // Guardamos esa informacion
    // La imprimimos

}

function cambiarEstado(nuevoEstado){
    estado = nuevoEstado;
    renderizar();
}

async function obtenerSingleArticulo(id){
    // Mostrar loading
    cambiarEstado("loading");
    // Realiza la petición
    const miFetch = await fetch(`${urlAPI}${id}`);
    // Transforma la respuesta. En este caso lo convierte a JSON
    const json = await miFetch.json();
    singleTitleDOM.textContent = json.title;
    singleContentDOM.textContent = json.body;
    // Al terminar quitar el loading
    // Volver estado inicial
    cambiarEstado("single articulo");
}

// Eventos
botonVolverDOM.addEventListener("click", function (){
    cambiarEstado("listado articulos");
});

// Inicio
obtenerArticulos();
vigilanteDeMarcador();
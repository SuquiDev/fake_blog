// Variables
const listadoArticulosDOM = document.querySelector("#listado-articulos");
const templatePreviaArticulo = document.querySelector("#previa-articulo").content.firstElementChild;
const templateLoading = document.querySelector("#loading").content.firstElementChild;

let articulos = new Array();
let paginaActual = 1;
const numeroArticulosPorPagina = 6;
const marcadorDOM = document.querySelector("#marcador");
const urlAPI ="https://jsonplaceholder.typicode.com/posts/";
let observerCuadrado = null;

// Funciones
function renderizar(){
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
        // Insertamos
        listadoArticulosDOM.appendChild(miArticulo);
    });
}

async function obtenerArticulos(){
    // Mostramos distraccion visual al usuario
    mostrarLoadingEnListadoArticulos();
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
    // Quitar loading
    quitarLoadingEnListadoArticulos();
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

function mostrarLoadingEnListadoArticulos(){
    // Clonamos plantilla
    const miLoading = templateLoading.cloneNode(true);
    listadoArticulosDOM.appendChild(miLoading);
}

function quitarLoadingEnListadoArticulos(){
    marcadorDOM.innerHTML = "";

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


// Eventos

// Inicio
obtenerArticulos();
vigilanteDeMarcador();
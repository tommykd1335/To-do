const textoTarea = document.getElementById("textarea2");
const textoBuscar = document.getElementById("buscarTexto");
const botonAgregar = document.getElementById("agregar");
const botonBuscar = document.getElementById("buscar");
const cuerpoTabla = document.getElementById("lista");

let listaTarea = [];
let filaActual = null;

function crearTabla(datos) {
    let fila = document.createElement('tr');

    datos.forEach(dato => {
        let celda = document.createElement('td');
        celda.innerText = dato;
        celda.classList.add('table-cell');
        fila.appendChild(celda);
    });

    let celdaBotones = document.createElement('td');

    let botonEditar = document.createElement('button');
    botonEditar.innerText = "Editar";
    botonEditar.classList.add('btnEditar');
    botonEditar.addEventListener('click', () => editar(fila, datos));

    let botonEliminar = document.createElement('button');
    botonEliminar.innerText = "Eliminar";
    botonEliminar.classList.add('btnEliminar');
    botonEliminar.addEventListener('click', () => borrar(fila));

    celdaBotones.appendChild(botonEditar);
    celdaBotones.appendChild(botonEliminar);
    fila.appendChild(celdaBotones);
    fila.classList.add('fila');

    cuerpoTabla.appendChild(fila);
}

function agregar() {
    if (textoTarea.value.trim()) {
        let datos = [textoTarea.value.trim()];
        if (filaActual) {
            actualizarFila(filaActual, datos);
            filaActual = null;
            botonAgregar.textContent = "Agregar";
        } else {
            listaTarea.push(datos);
            crearTabla(datos);
        }
        limpiarCampos();
    } else {
        alert("Tienes que agregar una tarea.");
    }
}

function borrar(fila) {
    cuerpoTabla.removeChild(fila);
}

function editar(fila, datos) {
    textoTarea.value = datos[0];
    botonAgregar.textContent = "Guardar";
    filaActual = fila;
}

function actualizarFila(fila, datos) {
    let celdas = fila.getElementsByTagName('td');
    celdas[0].innerText = datos[0];

    // Actualizar en el array también si es necesario
    for (let i = 0; i < listaTarea.length; i++) {
        if (listaTarea[i][0] === celdas[0].innerText) {
            listaTarea[i] = datos;
            break;
        }
    }
}

function buscar() {
    let texto = textoBuscar.value.toLowerCase();
    let filas = cuerpoTabla.getElementsByTagName('tr');
    for (let i = 0; i < filas.length; i++) {
        let celdas = filas[i].getElementsByTagName('td');
        let encontrado = false;
        for (let j = 0; j < celdas.length - 1; j++) { // -1 para no buscar en botones
            if (celdas[j].innerText.toLowerCase().includes(texto)) {
                encontrado = true;
                break;
            }
        }
        filas[i].style.display = encontrado ? '' : 'none';
    }
}

function limpiarCampos() {
    textoTarea.value = '';
}

// EVENTOS
botonAgregar.addEventListener('click', agregar);
botonBuscar.addEventListener('click', buscar);

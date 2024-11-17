const textoTarea = document.getElementById("textarea2")
const textoBuscar = document.getElementById("buscarTexto")
const botonAgregar = document.getElementById("agregar")
const botonBuscar = document.getElementById("buscar")
const cuerpoTabla = document.getElementById("lista")

let listaTarea = []
let filaActual = null;

function crearLista(){
    for (let i = 1; i < listaTarea.length; i++) {
        listaTarea[i];
    }   
}

let lista = crearLista()

function crearTabla(datos){
    let fila = document.createElement('tr');  
    datos.forEach(dato => {
        let celda = document.createElement('td')
        celda.innerText = dato;
        celda.classList.add('table-cell');
        fila.appendChild(celda);
    });
    
    cuerpoTabla.appendChild(fila);

    let botonEditar = document.createElement('button');
    botonEditar.innerText = "Editar";
    botonEditar.classList.add('btnEditar')
    botonEditar.addEventListener('click', () => editar(fila, datos))

    let botonEliminar = document.createElement('button');
    botonEliminar.innerText = "Eliminar";
    botonEliminar.classList.add('btnEliminar');
    botonEliminar.addEventListener('click', () => borrar(fila));

    fila.appendChild(botonEditar)
    fila.appendChild(botonEliminar)
    fila.classList.add('fila');  
}
function agregar(){        
    if(textoTarea.value){
        let datos= [textoTarea.value]; 
        if (filaActual) {
            actualizarFila(filaActual, datos); 
            filaActual = null; 
            botonAgregar.textContent = "Agregar";            
        } else {
            listaTarea.push(datos);
            crearTabla(datos);
        }
        limpiarCampos()
    } else{
        alert("Tienes que agregar una tarea.")
    } 
}
function borrar(fila){
    cuerpoTabla.removeChild(fila);
}
function editar(fila, dato) {
    textoTarea.value = dato
    botonAgregar.textContent = "Guardar";
    filaActual = fila;    
    actualizarTexto(dato)   
}
function actualizarFila(fila, datos) {
    let celda = fila.getElementsByTagName('td')
    for (let i = 0; i < listaTarea.length; i++) {
        celda[i].innerText = datos[i];
    }    
}
function actualizarTexto(datos) {
    textoTarea.value = datos;
}
function limpiarCampos() {
    textoTarea.value = '';
}
botonAgregar.addEventListener('click', agregar)

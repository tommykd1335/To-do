// ============================================
// GESTIÓN DE TRABAJOS - APP FINANCIERA
// ============================================

// Variables globales
let listaTrabajosData = []
let trabajoEditando = null

// Elementos del DOM (inicializados en DOMContentLoaded)
let descripcionTrabajo
let fechaTrabajo
let categoriaTrabajo
let listaIngresos
let listaGastos
let agregarIngresoBtn
let agregarGastoBtn
let guardarTrabajoBtn
let listaTrabajos
let textoBuscar
let limpiarBusquedaBtn
let verHistorialBtn
let editDescripcion
let editFecha
let editCategoria
let editListaIngresos
let editListaGastos
let editAgregarIngresoBtn
let editAgregarGastoBtn
let guardarEdicionBtn
let exportarPDFBtn

// Modales
let modalHistorial
let modalEditar

// ============================================
// FUNCIONES DE NOTIFICACIONES
// ============================================
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notifContainer = document.getElementById('notificacionesContainer') || crearContenedorNotificaciones()
    
    const notif = document.createElement('div')
    notif.className = `alert-notificacion alert-${tipo}`
    notif.innerHTML = `
        <div class="notif-contenido">
            <i class="fas fa-check-circle"></i>
            <span>${mensaje}</span>
        </div>
    `
    notifContainer.appendChild(notif)
    
    setTimeout(() => {
        notif.classList.add('mostrar')
    }, 50)
    
    setTimeout(() => {
        notif.classList.remove('mostrar')
        setTimeout(() => notif.remove(), 300)
    }, 4000)
}

function crearContenedorNotificaciones() {
    const container = document.createElement('div')
    container.id = 'notificacionesContainer'
    container.className = 'notificaciones-container'
    document.body.insertBefore(container, document.body.firstChild)
    return container
}

// ============================================
// FUNCIONES DE ALMACENAMIENTO
// ============================================
function cargarDesdeStorage() {
    const data = localStorage.getItem('listaTrabajosNegocio')
    listaTrabajosData = data ? JSON.parse(data) : []
    mostrarTrabajos(listaTrabajosData)
}

function guardarEnStorage() {
    localStorage.setItem('listaTrabajosNegocio', JSON.stringify(listaTrabajosData))
}

// Funciones para ingresos/gastos dinámicos
function crearCampoIngreso(descripcion = '', monto = '') {
    const div = document.createElement('div')
    div.className = 'input-group mb-2'
    div.innerHTML = `
        <input type="text" class="form-control" placeholder="Descripción" value="${descripcion}">
        <span class="input-group-text">$</span>
        <input type="number" class="form-control" placeholder="0.00" min="0" step="0.01" value="${monto}">
        <button class="btn btn-outline-danger" type="button"><i class="fas fa-trash"></i></button>
    `
    div.querySelector('.btn-outline-danger').addEventListener('click', () => div.remove())
    return div
}

function crearCampoGasto(descripcion = '', monto = '') {
    const div = document.createElement('div')
    div.className = 'input-group mb-2'
    div.innerHTML = `
        <input type="text" class="form-control" placeholder="Descripción" value="${descripcion}">
        <span class="input-group-text">$</span>
        <input type="number" class="form-control" placeholder="0.00" min="0" step="0.01" value="${monto}">
        <button class="btn btn-outline-danger" type="button"><i class="fas fa-trash"></i></button>
    `
    div.querySelector('.btn-outline-danger').addEventListener('click', () => div.remove())
    return div
}

// Crear fila de trabajo
function crearFilaTrabajo(trabajo, index) {
    const fila = document.createElement('tr')
    fila.className = 'fade-in'

    const totalIngresos = trabajo.ingresos.reduce((sum, i) => sum + parseFloat(i.monto || 0), 0)
    const totalGastos = trabajo.gastos.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0)
    const ganancia = totalIngresos - totalGastos

    fila.innerHTML = `
        <td>
            <strong>${trabajo.descripcion}</strong><br>
            <small class="text-muted">${trabajo.categoria}</small>
        </td>
        <td>${trabajo.fecha}</td>
        <td style="color: #10b981; font-weight: bold;">$${totalIngresos.toFixed(2)}</td>
        <td style="color: #ef4444; font-weight: bold;">$${totalGastos.toFixed(2)}</td>
        <td style="color: ${ganancia >= 0 ? '#10b981' : '#ef4444'}; font-weight: bold;">$${ganancia.toFixed(2)}</td>
        <td>
            <button class="btn btn-warning btn-sm me-1" onclick="editarTrabajo(${index})"><i class="fas fa-edit"></i> Editar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarTrabajo(${index})"><i class="fas fa-trash"></i> Eliminar</button>
        </td>
    `
    return fila
}

// Mostrar trabajos
function mostrarTrabajos(trabajos) {
    trabajos.sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
    listaTrabajos.innerHTML = ''
    trabajos.forEach((trabajo, idx) => {
        const realIndex = listaTrabajosData.findIndex(t => t.creadoEn === trabajo.creadoEn)
        listaTrabajos.appendChild(crearFilaTrabajo(trabajo, realIndex))
    })
    actualizarMetricas(trabajos)
}

// Agregar trabajo
function guardarTrabajoNuevo() {
    const descripcion = descripcionTrabajo.value.trim()
    const fecha = fechaTrabajo.value || new Date().toISOString().slice(0, 10)
    const categoria = categoriaTrabajo.value

    if (!descripcion) {
        mostrarNotificacion('Por favor, ingresa la descripción del trabajo', 'error')
        descripcionTrabajo.focus()
        return
    }

    // Recopilar ingresos
    const ingresosInputs = listaIngresos.querySelectorAll('.input-group')
    const ingresos = []
    ingresosInputs.forEach(group => {
        const inputs = group.querySelectorAll('input')
        const desc = inputs[0].value.trim()
        const monto = parseFloat(inputs[1].value) || 0
        if (desc && monto > 0) {
            ingresos.push({ descripcion: desc, monto })
        }
    })

    // Recopilar gastos
    const gastosInputs = listaGastos.querySelectorAll('.input-group')
    const gastos = []
    gastosInputs.forEach(group => {
        const inputs = group.querySelectorAll('input')
        const desc = inputs[0].value.trim()
        const monto = parseFloat(inputs[1].value) || 0
        if (desc && monto > 0) {
            gastos.push({ descripcion: desc, monto })
        }
    })

    if (ingresos.length === 0 && gastos.length === 0) {
        mostrarNotificacion('Agrega al menos un ingreso o gasto', 'error')
        return
    }

    const trabajo = {
        descripcion,
        fecha,
        categoria,
        ingresos,
        gastos,
        estado: 'Registrado',
        creadoEn: new Date().toISOString()
    }

    listaTrabajosData.unshift(trabajo)
    guardarEnStorage()
    mostrarTrabajos(filteredTrabajos())
    limpiarFormulario()
    mostrarNotificacion('Trabajo guardado exitosamente', 'success')
}

// Limpiar formulario
function limpiarFormulario() {
    descripcionTrabajo.value = ''
    fechaTrabajo.value = ''
    categoriaTrabajo.value = 'Instalación'
    listaIngresos.innerHTML = ''
    listaGastos.innerHTML = ''
}

// Editar trabajo
function editarTrabajo(index) {
    trabajoEditando = index
    const trabajo = listaTrabajosData[index]

    editDescripcion.value = trabajo.descripcion
    editFecha.value = trabajo.fecha
    editCategoria.value = trabajo.categoria

    // Cargar ingresos
    editListaIngresos.innerHTML = ''
    trabajo.ingresos.forEach(ing => {
        editListaIngresos.appendChild(crearCampoIngreso(ing.descripcion, ing.monto))
    })

    // Cargar gastos
    editListaGastos.innerHTML = ''
    trabajo.gastos.forEach(gas => {
        editListaGastos.appendChild(crearCampoGasto(gas.descripcion, gas.monto))
    })

    modalEditar.show()
}

// Guardar edición
function guardarEdicionTrabajo() {
    const descripcion = editDescripcion.value.trim()
    const fecha = editFecha.value
    const categoria = editCategoria.value

    if (!descripcion) {
        mostrarNotificacion('Por favor, ingresa la descripción del trabajo', 'error')
        editDescripcion.focus()
        return
    }

    // Recopilar ingresos editados
    const ingresosInputs = editListaIngresos.querySelectorAll('.input-group')
    const ingresos = []
    ingresosInputs.forEach(group => {
        const inputs = group.querySelectorAll('input')
        const desc = inputs[0].value.trim()
        const monto = parseFloat(inputs[1].value) || 0
        if (desc && monto > 0) {
            ingresos.push({ descripcion: desc, monto })
        }
    })

    // Recopilar gastos editados
    const gastosInputs = editListaGastos.querySelectorAll('.input-group')
    const gastos = []
    gastosInputs.forEach(group => {
        const inputs = group.querySelectorAll('input')
        const desc = inputs[0].value.trim()
        const monto = parseFloat(inputs[1].value) || 0
        if (desc && monto > 0) {
            gastos.push({ descripcion: desc, monto })
        }
    })

    if (ingresos.length === 0 && gastos.length === 0) {
        mostrarNotificacion('Agrega al menos un ingreso o gasto', 'error')
        return
    }

    listaTrabajosData[trabajoEditando] = {
        ...listaTrabajosData[trabajoEditando],
        descripcion,
        fecha,
        categoria,
        ingresos,
        gastos
    }

    guardarEnStorage()
    mostrarTrabajos(filteredTrabajos())
    modalEditar.hide()
    mostrarNotificacion('Trabajo actualizado exitosamente', 'success')
}

// Eliminar trabajo
function eliminarTrabajo(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este trabajo?')) {
        listaTrabajosData.splice(index, 1)
        guardarEnStorage()
        mostrarTrabajos(filteredTrabajos())
        mostrarNotificacion('Trabajo eliminado', 'success')
    }
}

// Limpiar búsqueda
function limpiarBusquedaTrabajos() {
    textoBuscar.value = ''
    mostrarTrabajos(filteredTrabajos())
}

// Filtrar trabajos
function filteredTrabajos() {
    const filtro = textoBuscar.value.trim().toLowerCase()
    if (!filtro) return listaTrabajosData
    return listaTrabajosData.filter(t =>
        t.descripcion.toLowerCase().includes(filtro) ||
        t.categoria.toLowerCase().includes(filtro) ||
        t.fecha.includes(filtro) ||
        t.ingresos.some(i => i.descripcion.toLowerCase().includes(filtro)) ||
        t.gastos.some(g => g.descripcion.toLowerCase().includes(filtro))
    )
}

// Actualizar métricas
function actualizarMetricas(trabajos) {
    const hoy = new Date().toISOString().slice(0, 10)
    const primerDiaSemana = new Date()
    primerDiaSemana.setDate(primerDiaSemana.getDate() - primerDiaSemana.getDay())
    const primerDiaSemanaStr = primerDiaSemana.toISOString().slice(0, 10)
    const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const primerDiaMesStr = primerDiaMes.toISOString().slice(0, 10)

    // Función para calcular totales por período
    const calcularTotales = (fechaInicio) => {
        return trabajos
            .filter(t => t.fecha >= fechaInicio)
            .reduce((acc, t) => {
                const ingresos = t.ingresos.reduce((sum, i) => sum + parseFloat(i.monto || 0), 0)
                const gastos = t.gastos.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0)
                return {
                    ingresos: acc.ingresos + ingresos,
                    gastos: acc.gastos + gastos
                }
            }, { ingresos: 0, gastos: 0 })
    }

    const diarios = calcularTotales(hoy)
    const semanales = calcularTotales(primerDiaSemanaStr)
    const mensuales = calcularTotales(primerDiaMesStr)

    // Actualizar DOM
    document.getElementById('ingresosDiarios').textContent = `$${diarios.ingresos.toFixed(2)}`
    document.getElementById('ingresosSemanales').textContent = `$${semanales.ingresos.toFixed(2)}`
    document.getElementById('ingresosMensuales').textContent = `$${mensuales.ingresos.toFixed(2)}`
    document.getElementById('gastosDiarios').textContent = `$${diarios.gastos.toFixed(2)}`
    document.getElementById('gastosSemanales').textContent = `$${semanales.gastos.toFixed(2)}`
    document.getElementById('gastosMensuales').textContent = `$${mensuales.gastos.toFixed(2)}`
    document.getElementById('gananciaDiaria').textContent = `$${(diarios.ingresos - diarios.gastos).toFixed(2)}`
    document.getElementById('gananciaSemanal').textContent = `$${(semanales.ingresos - semanales.gastos).toFixed(2)}`
    document.getElementById('gananciaMensual').textContent = `$${(mensuales.ingresos - mensuales.gastos).toFixed(2)}`
    document.getElementById('totalTrabajos').textContent = trabajos.length
}

// Mostrar historial
function mostrarHistorial() {
    const historialContenido = document.getElementById('historialContenido')
    historialContenido.innerHTML = ''

    if (listaTrabajosData.length === 0) {
        historialContenido.innerHTML = '<p>No hay transacciones registradas.</p>'
        return
    }

    listaTrabajosData.forEach(trabajo => {
        const div = document.createElement('div')
        div.className = 'card mb-3'
        div.innerHTML = `
            <div class="card-header">
                <strong>${trabajo.descripcion}</strong> - ${trabajo.fecha} (${trabajo.categoria})
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6>Ingresos:</h6>
                        <ul>
                            ${trabajo.ingresos.map(i => `<li>${i.descripcion}: $${parseFloat(i.monto).toFixed(2)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6>Gastos:</h6>
                        <ul>
                            ${trabajo.gastos.map(g => `<li>${g.descripcion}: $${parseFloat(g.monto).toFixed(2)}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `
        historialContenido.appendChild(div)
    })

    modalHistorial.show()
}

// Exportar historial a PDF
function exportarHistorialPDF() {
    const element = document.getElementById('historialContenido')
    const opt = {
        margin: 1,
        filename: 'historial-trabajos.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    html2pdf().set(opt).from(element).save()
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Capturar elementos del DOM
    descripcionTrabajo = document.getElementById('descripcionTrabajo')
    fechaTrabajo = document.getElementById('fechaTrabajo')
    categoriaTrabajo = document.getElementById('categoriaTrabajo')
    listaIngresos = document.getElementById('listaIngresos')
    listaGastos = document.getElementById('listaGastos')
    agregarIngresoBtn = document.getElementById('agregarIngreso')
    agregarGastoBtn = document.getElementById('agregarGasto')
    guardarTrabajoBtn = document.getElementById('guardarTrabajo')
    
    listaTrabajos = document.getElementById('listaTrabajos')
    textoBuscar = document.getElementById('buscarTexto')
    limpiarBusquedaBtn = document.getElementById('limpiarBusqueda')
    verHistorialBtn = document.getElementById('verHistorial')
    
    editDescripcion = document.getElementById('editDescripcion')
    editFecha = document.getElementById('editFecha')
    editCategoria = document.getElementById('editCategoria')
    editListaIngresos = document.getElementById('editListaIngresos')
    editListaGastos = document.getElementById('editListaGastos')
    editAgregarIngresoBtn = document.getElementById('editAgregarIngreso')
    editAgregarGastoBtn = document.getElementById('editAgregarGasto')
    guardarEdicionBtn = document.getElementById('guardarEdicion')
    
    exportarPDFBtn = document.getElementById('exportarPDF')
    
    // Inicializar modales
    modalHistorial = new bootstrap.Modal(document.getElementById('modalHistorial'))
    modalEditar = new bootstrap.Modal(document.getElementById('modalEditar'))
    
    // ============================================
    // EVENT LISTENERS - FORMULARIO PRINCIPAL
    // ============================================
    agregarIngresoBtn.addEventListener('click', function() {
        listaIngresos.appendChild(crearCampoIngreso())
    })
    
    agregarGastoBtn.addEventListener('click', function() {
        listaGastos.appendChild(crearCampoGasto())
    })
    
    guardarTrabajoBtn.addEventListener('click', guardarTrabajoNuevo)
    
    // ============================================
    // EVENT LISTENERS - BÚSQUEDA
    // ============================================
    textoBuscar.addEventListener('input', function() {
        mostrarTrabajos(filteredTrabajos())
    })
    
    limpiarBusquedaBtn.addEventListener('click', limpiarBusquedaTrabajos)
    
    // ============================================
    // EVENT LISTENERS - HISTORIAL
    // ============================================
    verHistorialBtn.addEventListener('click', mostrarHistorial)
    exportarPDFBtn.addEventListener('click', exportarHistorialPDF)
    
    // ============================================
    // EVENT LISTENERS - MODAL DE EDICIÓN
    // ============================================
    editAgregarIngresoBtn.addEventListener('click', function() {
        editListaIngresos.appendChild(crearCampoIngreso())
    })
    
    editAgregarGastoBtn.addEventListener('click', function() {
        editListaGastos.appendChild(crearCampoGasto())
    })
    
    guardarEdicionBtn.addEventListener('click', guardarEdicionTrabajo)
    
    // ============================================
    // FUNCIONES GLOBALES
    // ============================================
    window.editarTrabajo = editarTrabajo
    window.eliminarTrabajo = eliminarTrabajo
    
    // ============================================
    // CARGAR DATOS
    // ============================================
    cargarDesdeStorage()
})
'use strict';

const API_URL = 'api/medicamentos.php';
const form = document.getElementById('form');
const lista = document.getElementById('lista');
const vacio = document.getElementById('vacio');
const contador = document.getElementById('contador');
const toast = document.getElementById('toast');
const statusNet = document.getElementById('status');
const formTitulo = document.getElementById('form-titulo');
const btnCancel = document.getElementById('cancel');

let medicamentosCache = [];

// 1. CARGAR MEDICAMENTOS DESDE MYSQL (GET)
async function cargarMedicamentos() {
    try {
        const res = await fetch(API_URL);
        medicamentosCache = await res.json();
        renderizarInventario(medicamentosCache);
    } catch (error) {
        mostrarMensaje('Error al conectar con la base de datos');
    }
}

function renderizarInventario(datos) {
    contador.textContent = datos.length;
    vacio.hidden = datos.length > 0;

    lista.innerHTML = datos.map(m => `
        <div class="item-card">
            <div>
                <strong>${m.nombre}</strong> <small>(${m.codigo})</small><br>
                <small style="color:#64748b">${m.descripcion || 'Sin descripción'}</small><br>
                <span style="color:var(--primary); font-weight:bold">$${parseFloat(m.precio).toFixed(2)}</span> · 
                <small>Stock: <b>${m.stock}</b></small>
            </div>
            <div class="item-actions">
                <button class="btn-sm btn-edit" onclick="editarMedicamento(${m.id})">Editar</button>
                <button class="btn-sm btn-del" onclick="eliminarMedicamento(${m.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// 2. GUARDAR O ACTUALIZAR (POST / PUT)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('med-id').value;

    const payload = {
        id: id || null,
        codigo: form.codigo.value.trim(),
        nombre: form.nombre.value.trim(),
        descripcion: form.descripcion.value.trim(),
        precio: form.precio.value,
        stock: form.stock.value
    };

    if (!payload.codigo || !payload.nombre || !payload.precio || payload.stock === '') {
        mostrarMensaje('Completa todos los campos obligatorios (*)');
        return;
    }

    const metodo = id ? 'PUT' : 'POST';

    const res = await fetch(API_URL, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const resultado = await res.json();
    mostrarMensaje(resultado.message);

    if (resultado.status === 'ok') {
        resetearFormulario();
        cargarMedicamentos();
    }
});

// 3. PREPARAR EDICIÓN
window.editarMedicamento = (id) => {
    const med = medicamentosCache.find(m => m.id == id);
    if (!med) return;

    document.getElementById('med-id').value = med.id;
    form.codigo.value = med.codigo;
    form.nombre.value = med.nombre;
    form.descripcion.value = med.descripcion || '';
    form.precio.value = med.precio;
    form.stock.value = med.stock;

    formTitulo.textContent = 'Editar Medicamento';
    btnCancel.hidden = false;
};

// 4. ELIMINAR (DELETE)
window.eliminarMedicamento = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este medicamento?')) return;

    const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
    const resultado = await res.json();
    mostrarMensaje(resultado.message);
    cargarMedicamentos();
};

function resetearFormulario() {
    form.reset();
    document.getElementById('med-id').value = '';
    formTitulo.textContent = 'Registrar Medicamento';
    btnCancel.hidden = true;
}

btnCancel.addEventListener('click', resetearFormulario);

// Toast y Estado de Red
let temporizadorToast;
function mostrarMensaje(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('visible');
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(() => toast.classList.remove('visible'), 3500);
}

function actualizarEstadoRed() {
    statusNet.textContent = navigator.onLine ? 'En línea' : 'Sin conexión';
}
window.addEventListener('online', actualizarEstadoRed);
window.addEventListener('offline', actualizarEstadoRed);
actualizarEstadoRed();

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(console.error);
    });
}

cargarMedicamentos();
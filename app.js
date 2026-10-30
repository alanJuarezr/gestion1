'use strict';

const CLAVE_PRODUCTOS = 'farmacia_productos';
const form = document.getElementById('form');
const lista = document.getElementById('lista'); 
const vacio = document.getElementById('vacio');
const contador = document.getElementById('contador');
const toast = document.getElementById('toast');
const statusNet = document.getElementById('status');

// -------------------- LECTURA Y GUARDADO (LocalStorage) --------------------
const leerDatos = () => {
    try { return JSON.parse(localStorage.getItem(CLAVE_PRODUCTOS)) || []; }
    catch { return []; }
};

const guardarDatos = (datos) => {
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(datos));
};

// -------------------- VALIDACIONES DEL FORMULARIO --------------------
const reglas = {
    codigo(v) {
        if (!v) return 'El código es obligatorio';
        if (v.length < 3) return 'Debe tener al menos 3 caracteres';
        return '';
    },
    producto(v) {
        if (!v) return 'Ingresa el nombre del producto';
        if (v.length < 3) return 'El nombre es muy corto';
        return '';
    },
    precio(v) {
        if (!v) return 'Ingresa un precio';
        if (isNaN(v) || Number(v) <= 0) return 'Escribe un precio válido';
        return '';
    }
};

function validarCampo(input) {
    const valor = input.value.trim();
    const msj = reglas[input.name] ? reglas[input.name](valor) : '';
    
    const errElement = document.getElementById('err-' + input.name);
    if (errElement) errElement.textContent = msj;

    input.classList.toggle('invalido', !!msj);
    input.classList.toggle('valido', !msj);

    return !msj;
}

// Eventos de validación en tiempo real
form.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => {
        if (input.classList.contains('invalido')) validarCampo(input);
    });
});

// -------------------- REGISTRO DE PRODUCTOS --------------------
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cajas = [...form.querySelectorAll('input')];
    const todoOk = cajas.map(validarCampo).every(Boolean);

    if (!todoOk) {
        const primerInvalido = cajas.find(i => i.classList.contains('invalido'));
        if (primerInvalido) primerInvalido.focus();
        return;
    }

    const nuevoProducto = {
        codigo: form.codigo.value.trim(),
        producto: form.producto.value.trim(),
        precio: parseFloat(form.precio.value.trim()).toFixed(2)
    };

    let datos = leerDatos();
    datos.push(nuevoProducto);
    guardarDatos(datos);

    mostrarMensaje('¡Producto guardado correctamente!');
    form.reset();
    
    // Limpiar clases de validación
    cajas.forEach(i => i.classList.remove('valido', 'invalido'));

    renderizarInventario();
});

// -------------------- RENDERIZAR EN INTERFAZ (UX) --------------------
function escaparHTML(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function renderizarInventario() {
    const datos = leerDatos();
    contador.textContent = datos.length;
    vacio.hidden = datos.length > 0;

    lista.innerHTML = datos.map(e => `
       <li>
            <div>
                <strong>${escaparHTML(e.producto)}</strong><br>
                <small>Cód: ${escaparHTML(e.codigo)}</small>
            </div>
            <span style="font-weight: bold; color: var(--primary);">$${escaparHTML(e.precio)}</span>
       </li>
    `).join('');
}

// -------------------- MENSAJES TOAST (UX) --------------------
let temporizadorToast;
function mostrarMensaje(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('visible');

    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(() => toast.classList.remove('visible'), 4000);
}

// Cargar inventario al iniciar
renderizarInventario();

// -------------------- CONTROL DE CONEXIÓN (ONLINE / OFFLINE) --------------------
function actualizarEstadoRed() {
    if (navigator.onLine) {
        statusNet.textContent = 'En línea';
        statusNet.className = 'status online';
    } else {
        statusNet.textContent = 'Sin conexión';
        statusNet.className = 'status offline';
    }
}

window.addEventListener('online', actualizarEstadoRed);
window.addEventListener('offline', actualizarEstadoRed);
actualizarEstadoRed();

// -------------------- REGISTRO DEL SERVICE WORKER --------------------
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
        .then(res => console.log('Service Worker registrado con éxito:', res.scope))
        .catch(err => console.log('Error al registrar el Service Worker:', err));
    });
}
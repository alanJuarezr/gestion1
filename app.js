'use strict';

const API_URL = 'api/medicamentos.php';
const API_USUARIOS_URL = 'api/usuarios.php';

const form = document.getElementById('form');
const lista = document.getElementById('lista');
const vacio = document.getElementById('vacio');
const contador = document.getElementById('contador');
const toast = document.getElementById('toast');
const statusNet = document.getElementById('status');
const formTitulo = document.getElementById('form-titulo');
const btnCancel = document.getElementById('cancel');

// Elementos del módulo Usuarios
const navBtns = document.querySelectorAll('.nav-btn[data-tab]');
const viewMedicamentos = document.getElementById('view-medicamentos');
const viewUsuarios = document.getElementById('view-usuarios');
const formUsuario = document.getElementById('form-usuario');
const usrLista = document.getElementById('usr-lista');
const usrVacio = document.getElementById('usr-vacio');
const usrContador = document.getElementById('usr-contador');
const usrFormTitulo = document.getElementById('usr-form-titulo');
const usrBtnCancel = document.getElementById('usr-cancel');
const usrPassReq = document.getElementById('usr-pass-req');
const usrPassAyuda = document.getElementById('usr-pass-ayuda');

let medicamentosCache = [];
let usuariosCache = [];

// NAVEGACIÓN ENTRE PESTAÑAS
function cambiarPestana(tab) {
    navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const esUsuarios = tab === 'usuarios';
    viewMedicamentos.hidden = esUsuarios;
    viewUsuarios.hidden = !esUsuarios;

    if (esUsuarios) {
        cargarUsuarios();
    } else {
        cargarMedicamentos();
    }
}

navBtns.forEach(btn => {
    btn.addEventListener('click', () => cambiarPestana(btn.dataset.tab));
});

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

// 2. GUARDAR O ACTUALIZAR MEDICAMENTO (POST / PUT)
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

// 3. PREPARAR EDICIÓN MEDICAMENTO
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

// 4. ELIMINAR MEDICAMENTO (DELETE)
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

// --- CRUD GESTIÓN DE USUARIOS ---

// 1. CARGAR USUARIOS DESDE MYSQL (GET)
async function cargarUsuarios() {
    try {
        const res = await fetch(API_USUARIOS_URL);
        const data = await res.json();

        if (!res.ok || data.status !== 'ok') {
            mostrarMensaje(data.message || 'Error al cargar usuarios');
            return;
        }

        usuariosCache = data.usuarios || [];
        renderizarUsuarios(usuariosCache);
    } catch (error) {
        mostrarMensaje('Error al conectar con la API de usuarios');
    }
}

function renderizarUsuarios(datos) {
    usrContador.textContent = datos.length;
    usrVacio.hidden = datos.length > 0;

    usrLista.innerHTML = datos.map(u => `
        <div class="item-card">
            <div>
                <strong>${u.nombre}</strong> <small>(${u.email})</small><br>
                <span style="color:var(--primary); font-weight:bold; text-transform:capitalize">${u.rol}</span>
                ${u.creado_en ? ` · <small style="color:#64748b">${u.creado_en}</small>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn-sm btn-edit" onclick="editarUsuario(${u.id})">Editar</button>
                <button class="btn-sm btn-del" onclick="eliminarUsuario(${u.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// 2. GUARDAR O ACTUALIZAR USUARIO (POST / PUT)
formUsuario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('usr-id').value;
    const nombre = document.getElementById('usr-nombre').value.trim();
    const email = document.getElementById('usr-email').value.trim();
    const password = document.getElementById('usr-password').value.trim();
    const rol = document.getElementById('usr-rol').value;

    if (!nombre || !email || (!id && !password)) {
        mostrarMensaje('Completa nombre, correo y contraseña');
        return;
    }

    const payload = {
        id: id ? Number(id) : null,
        nombre,
        email,
        rol
    };

    if (password) {
        payload.password = password;
    }

    const metodo = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(API_USUARIOS_URL, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resultado = await res.json();
        mostrarMensaje(resultado.message || 'Operación completada');

        if (res.ok && resultado.status === 'ok') {
            resetearFormularioUsuario();
            cargarUsuarios();
        }
    } catch (error) {
        mostrarMensaje('Error al guardar el usuario');
    }
});

// 3. PREPARAR EDICIÓN USUARIO
window.editarUsuario = (id) => {
    const usr = usuariosCache.find(u => u.id == id);
    if (!usr) return;

    document.getElementById('usr-id').value = usr.id;
    document.getElementById('usr-nombre').value = usr.nombre;
    document.getElementById('usr-email').value = usr.email;
    document.getElementById('usr-password').value = '';
    document.getElementById('usr-rol').value = usr.rol || 'empleado';

    usrFormTitulo.textContent = 'Editar Usuario';
    usrPassReq.textContent = '(opcional)';
    usrPassAyuda.style.display = 'block';
    usrBtnCancel.hidden = false;
};

// 4. ELIMINAR USUARIO (DELETE)
window.eliminarUsuario = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;

    try {
        const res = await fetch(`${API_USUARIOS_URL}?id=${id}`, { method: 'DELETE' });
        const resultado = await res.json();
        mostrarMensaje(resultado.message || 'Usuario eliminado');

        if (res.ok && resultado.status === 'ok') {
            const idActual = document.getElementById('usr-id').value;
            if (idActual && Number(idActual) === Number(id)) {
                resetearFormularioUsuario();
            }
            cargarUsuarios();
        }
    } catch (error) {
        mostrarMensaje('Error al eliminar el usuario');
    }
};

function resetearFormularioUsuario() {
    formUsuario.reset();
    document.getElementById('usr-id').value = '';
    document.getElementById('usr-rol').value = 'empleado';
    usrFormTitulo.textContent = 'Registrar Usuario';
    usrPassReq.textContent = '*';
    usrPassAyuda.style.display = 'none';
    usrBtnCancel.hidden = true;
}

usrBtnCancel.addEventListener('click', resetearFormularioUsuario);

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

// --- CONTROL DE SESIÓN Y LOGIN ---
const loginModal = document.getElementById('login-modal');
const formLogin = document.getElementById('form-login');
const userInfoContainer = document.getElementById('user-info-container');

function verificarSesion() {
    const sesion = localStorage.getItem('farmacia_sesion');
    
    if (sesion) {
        // Si ya inició sesión, ocultamos el modal y mostramos quién entró con un botón de salir
        loginModal.classList.add('oculto');
        const usuario = JSON.parse(sesion);
        
        userInfoContainer.innerHTML = `
            <div style="color: white; font-size: 0.9rem; text-align: right;">
                <span>👤 <b>${usuario.nombre}</b></span><br>
                <button onclick="cerrarSesion()" style="background: #ef4444; color: white; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; margin-top: 3px;">Cerrar Sesión</button>
            </div>
        `;
    } else {
        // Si no hay sesión, mostramos el modal de login
        loginModal.classList.remove('oculto');
        userInfoContainer.innerHTML = '';
    }
}

// Función global para cerrar sesión
window.cerrarSesion = function() {
    localStorage.removeItem('farmacia_sesion');
    mostrarMensaje('Sesión cerrada correctamente');
    verificarSesion();
};

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
        const res = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();

        if (res.ok && data.status === 'ok') {
            localStorage.setItem('farmacia_sesion', JSON.stringify(data.usuario));
            mostrarMensaje(data.message);
            verificarSesion();
        } else {
            mostrarMensaje(data.message || 'Credenciales incorrectas');
        }
    } catch (err) {
        console.error("Error en fetch login:", err);
        mostrarMensaje('Error de conexión con la API de login');
    }

    function cambiarPestana(tab) {
        navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        const esUsuarios = tab === 'usuarios';
        viewMedicamentos.hidden = esUsuarios;
        viewUsuarios.hidden = !esUsuarios;
        viewMedicamentos.style.display = esUsuarios ? 'none' : '';
        viewUsuarios.style.display = esUsuarios ? '' : 'none';

        if (esUsuarios) {
            cargarUsuarios();
        } else {
            cargarMedicamentos();
        }
    }
});

// Ejecutar verificación al cargar
verificarSesion();
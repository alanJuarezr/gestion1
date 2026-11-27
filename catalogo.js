const API_MEDICAMENTOS = 'api/medicamentos.php';
const grid = document.getElementById('grid-medicamentos');
const totalSpan = document.getElementById('total-items');
const inputBuscar = document.getElementById('buscar-medicamento');
const badgeRed = document.getElementById('estado-red');

let medicamentosCache = [];

function actualizarEstadoRed() {
  if (!badgeRed) return;
  if (navigator.onLine) {
    badgeRed.textContent = 'En línea';
    badgeRed.className = 'angel-badge online';
  } else {
    badgeRed.textContent = 'Sin conexión';
    badgeRed.className = 'angel-badge offline';
  }
}

function renderizarMedicamentos(lista) {
  totalSpan.textContent = lista.length;

  if (!Array.isArray(lista) || lista.length === 0) {
    grid.innerHTML = '<p class="mensaje-estado">No hay medicamentos disponibles para mostrar.</p>';
    return;
  }

  grid.innerHTML = lista.map((med) => {
    const stock = Number(med.stock ?? 0);
    const precio = Number(med.precio ?? 0).toFixed(2);
    const disponibilidad = stock > 0 ? `Disponible (${stock} pzas)` : 'Agotado';
    const claseStock = stock > 0 ? 'stock-ok' : 'stock-agotado';

    return `
      <article class="item-card solo-lectura">
        <div class="card-top">
          <h3>${escapeHTML(med.nombre)}</h3>
          <span class="codigo-tag">${escapeHTML(med.codigo || '')}</span>
        </div>
        <p class="descripcion">${escapeHTML(med.descripcion || 'Sin descripción adicional')}</p>
        <div class="card-footer">
          <strong class="precio">$${precio}</strong>
          <span class="${claseStock}">${disponibilidad}</span>
        </div>
      </article>
    `;
  }).join('');
}

function escapeHTML(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function cargarCatalogo() {
  try {
    const resp = await fetch(API_MEDICAMENTOS);
    if (!resp.ok) throw new Error('Error al consultar el catálogo');
    const data = await resp.json();

    // Soporta tanto arreglo directo [...] como objeto { data: [...] }
    const lista = Array.isArray(data) ? data : (data.data || data.medicamentos || []);
    medicamentosCache = lista;
    renderizarMedicamentos(medicamentosCache);
  } catch (err) {
    grid.innerHTML = '<p class="mensaje-estado">No se pudo cargar el catálogo en este momento.</p>';
  }
}

inputBuscar.addEventListener('input', (e) => {
  const termino = e.target.value.trim().toLowerCase();
  if (!termino) {
    renderizarMedicamentos(medicamentosCache);
    return;
  }

  const filtrados = medicamentosCache.filter((m) =>
    String(m.nombre || '').toLowerCase().includes(termino) ||
    String(m.codigo || '').toLowerCase().includes(termino) ||
    String(m.descripcion || '').toLowerCase().includes(termino)
  );
  renderizarMedicamentos(filtrados);
});

window.addEventListener('online', actualizarEstadoRed);
window.addEventListener('offline', actualizarEstadoRed);

actualizarEstadoRed();
cargarCatalogo();
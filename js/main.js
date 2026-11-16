// ==========================================================================
// LÓGICA INSTITUCIONAL MULTIPÁGINA - FABIÁN ROBLES | ALCALDÍA DE MONTÚFAR
// COLECTIVO RENOVACIÓN MONTUFAREÑA
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initIntroSplash();
  initMobileMenu();
  initCandidatesSearch();
  initProposalsFilter();
  initLiveSearch();
  initParishesTabs();
  initVolunteerModal();
});

// 0.1 Buscador y Visor de Candidatos (en candidatos.html)
function initCandidatesSearch() {
  const searchInput = document.getElementById('candidateSearch');
  const cards = document.querySelectorAll('.candidate-card');
  if (!searchInput || !cards.length) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    cards.forEach(card => {
      const name = (card.getAttribute('data-name') || card.textContent).toLowerCase();
      if (name.includes(term)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
}

function openCandidateModal(imgUrl, candidateName) {
  const modal = document.getElementById('candidateLightbox');
  const imgEl = document.getElementById('lightboxCandidateImg');
  const nameEl = document.getElementById('lightboxCandidateName');
  if (!modal || !imgEl || !nameEl) return;

  imgEl.src = imgUrl;
  nameEl.textContent = candidateName;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCandidateModal() {
  const modal = document.getElementById('candidateLightbox');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// 0. Animación Espectacular de Entrada con el Logo de Renovación Montufareña
function initIntroSplash() {
  const splash = document.getElementById('introSplash');
  if (!splash) return;

  document.body.style.overflow = 'hidden';

  const closeSplash = () => {
    if (splash.classList.contains('splash-exit')) return;
    splash.classList.add('splash-exit');
    document.body.style.overflow = '';
    setTimeout(() => {
      splash.remove();
    }, 800);
  };

  // Se cierra automáticamente tras completarse la presentación formal
  setTimeout(closeSplash, 2000);
  splash.addEventListener('click', closeSplash);
}

// 1. Menú Móvil
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('closeMobileMenu');

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  }
}

// 2. Filtro de Propuestas por Eje Temático (en propuestas.html)
function initProposalsFilter() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const proposalCards = document.querySelectorAll('.proposal-card');

  if (!filterPills.length) return;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const category = pill.getAttribute('data-category');
      const searchInput = document.getElementById('proposalSearch');
      if (searchInput) searchInput.value = '';

      proposalCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      updateProposalCount();
    });
  });
}

// 3. Buscador en Tiempo Real (en propuestas.html)
function initLiveSearch() {
  const searchInput = document.getElementById('proposalSearch');
  const proposalCards = document.querySelectorAll('.proposal-card');
  const clearBtn = document.getElementById('clearSearch');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();

    if (clearBtn) {
      if (term.length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }

    proposalCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(term)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });

    updateProposalCount();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.classList.add('hidden');
      proposalCards.forEach(card => card.classList.remove('hidden'));
      updateProposalCount();
      searchInput.focus();
    });
  }
}

function updateProposalCount() {
  const visibleCards = document.querySelectorAll('.proposal-card:not(.hidden)');
  const countDisplay = document.getElementById('proposalsCount');
  const noResults = document.getElementById('noResultsMsg');

  if (countDisplay) {
    countDisplay.textContent = visibleCards.length;
  }

  if (noResults) {
    if (visibleCards.length === 0) {
      noResults.classList.remove('hidden');
    } else {
      noResults.classList.add('hidden');
    }
  }
}

// 4. Planificación Territorial por Parroquias de Montúfar (en parroquias.html)
const parishData = {
  'san-gabriel': {
    title: 'San Gabriel — Cabecera Cantonal y Pueblo Mágico',
    subtitle: 'Eje Administrativo, Comercial, Patrimonial y Urbano de Montúfar',
    description: 'Ejecutaremos un plan integral de ordenamiento urbano, modernización definitiva de las redes de agua potable y alcantarillado, recuperación del patrimonio arquitectónico y reactivación comercial ordenada.',
    commitments: [
      'Ejecución del Plan Maestro de Agua Potable continua las 24 horas y sustitución técnica de redes de alcantarillado obsoletas.',
      'Rehabilitación integral del Centro Histórico Patrimonial con iluminación y ordenamiento urbano.',
      'Modernización del Mercado Municipal con áreas dignas, higiénicas y parqueadero para productores y ciudadanía.',
      'Recuperación ambiental del Parque Lineal del Río San Gabriel y fortalecimiento de escenarios deportivos barriales.',
      'Implementación de la Central Municipal de Monitoreo y Seguridad Ciudadana en articulación con la Policía Nacional.'
    ],
    highlightTag: 'Infraestructura Urbana, Agua Potable y Comercio'
  },
  'piartal': {
    title: 'Parroquia Rural de Piartal',
    subtitle: 'Zona de Alta Producción Agrícola e Hídrica',
    description: 'Fortaleceremos la infraestructura productiva de Piartal garantizando vías de primer orden para la salida de cosechas, tecnificación del riego parcelario y asistencia técnica agropecuaria permanente.',
    commitments: [
      'Mantenimiento vial permanente, lastrado técnico y obras de drenaje en los caminos vecinales y vías interparroquiales.',
      'Construcción de reservorios comunitarios y optimización de los canales de riego para garantizar producción todo el año.',
      'Programa municipal de provisión de semillas certificadas e insumos agrícolas en convenio con asociaciones de productores.',
      'Mejoramiento de la infraestructura pública parroquial y brigadas médicas y odontológicas permanentes.'
    ],
    highlightTag: 'Desarrollo Agrícola, Riego Tecnificado y Vialidad'
  },
  'chitan': {
    title: 'Parroquia Rural de Chitán de Navarretes',
    subtitle: 'Cuenca Lechera, Ganadera y Productiva del Cantón',
    description: 'Impulsaremos la cadena de valor láctea y ganadera mediante infraestructura vial rural garantizada, centros de enfriamiento y acopio comunitario, y programas de mejoramiento genético.',
    commitments: [
      'Creación del Centro Parroquial de Acopio Lechero y programa municipal de asistencia veterinaria y mejoramiento genético.',
      'Intervención integral y afirmado técnico de los caminos de acceso a fincas y sectores de ordeño.',
      'Establecimiento de canales de comercialización directa para proteger el trabajo del productor lechero.',
      'Brigadas de salud y cuidado integral para niños, familias y adultos mayores de la parroquia.'
    ],
    highlightTag: 'Fomento Ganadero, Cadena Láctea y Caminos Vecinales'
  },
  'fernandez': {
    title: 'Parroquia Rural de Fernández Salvador',
    subtitle: 'Reserva Hídrica, Producción Sostenible y Frontera Agrícola',
    description: 'Articularemos la protección estricta de nuestros páramos y fuentes de agua con el respaldo técnico al productor ganadero y agrícola, asegurando vías transitables durante todo el año.',
    commitments: [
      'Asignación programada del equipo caminero municipal para el mantenimiento continuo de las vías rurales de la parroquia.',
      'Programa de conservación de fuentes hídricas, naturaleza y páramos con incentivos productivos para las comunidades.',
      'Apoyo técnico a emprendimientos de derivados lácteos y asociaciones de mujeres productoras.',
      'Adecuación de canchas y escenarios deportivos para el fomento del fútbol y la recreación de la juventud.'
    ],
    highlightTag: 'Conservación Hídrica, Vialidad Rural y Producción'
  },
  'la-paz': {
    title: 'Parroquia Rural de La Paz',
    subtitle: 'Patrimonio Espiritual, Turístico, Termal y Productivo del Norte del País',
    description: 'Consolidaremos a La Paz como el principal destino de turismo religioso, termal y ecológico de la provincia del Carchi, generando plazas de trabajo digno y fortaleciendo su sector agropecuario.',
    commitments: [
      'Plan de regeneración vial, señalización turística y embellecimiento de los accesos al Santuario de la Gruta de La Paz.',
      'Fomento y capacitación para prestadores de servicios gastronómicos, turísticos y artesanales de la parroquia.',
      'Obras de saneamiento básico, agua potable y seguridad permanente para habitantes y visitantes.',
      'Mantenimiento vial hacia las comunidades agrícolas de la parroquia y apoyo directo al pequeño productor.'
    ],
    highlightTag: 'Desarrollo Turístico, Vialidad y Reactivación Económica'
  },
  'cristobal-colon': {
    title: 'Parroquia Rural de Cristóbal Colón',
    subtitle: 'Fuerza Productiva, Tradición Artesanal y Desarrollo Comunitario',
    description: 'Trabajaremos en unidad con sus barrios y comunidades para modernizar los sistemas de agua de consumo y riego, mejorar la conectividad vial y potenciar el talento deportivo y cultural.',
    commitments: [
      'Ampliación y mejoramiento técnico de los sistemas de agua potable y conducción de agua de riego para las comunidades.',
      'Rehabilitación integral de la infraestructura deportiva parroquial y creación de escuelas formativas permanentes de fútbol.',
      'Plan anual de adoquinado en el centro parroquial y mantenimiento técnico de caminos hacia los caseríos.',
      'Instalación de sistemas de iluminación pública eficiente, alarmas comunitarias y brigadas de acción social.'
    ],
    highlightTag: 'Obras Sanitarias, Riego, Deporte y Seguridad'
  }
};

function initParishesTabs() {
  const tabs = document.querySelectorAll('.parish-tab');
  const titleEl = document.getElementById('parishTitle');
  const subtitleEl = document.getElementById('parishSubtitle');
  const descEl = document.getElementById('parishDescription');
  const listEl = document.getElementById('parishCommitments');
  const tagEl = document.getElementById('parishTag');

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const parishKey = tab.getAttribute('data-parish');
      const data = parishData[parishKey];

      if (data) {
        if (titleEl) titleEl.textContent = data.title;
        if (subtitleEl) subtitleEl.textContent = data.subtitle;
        if (descEl) descEl.textContent = data.description;
        if (tagEl) tagEl.textContent = data.highlightTag;

        if (listEl) {
          listEl.innerHTML = data.commitments.map(item => `
            <li class="flex items-start gap-3.5 py-1">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-[#008D36] text-white flex items-center justify-center font-bold text-xs mt-0.5 shadow-sm">✓</span>
              <span class="text-slate-700 font-medium text-sm md:text-base leading-relaxed">${item}</span>
            </li>
          `).join('');
        }
      }
    });
  });
}

// ==========================================================================
// 5. Configuración y Conexión a Supabase (Registro de Voluntarios)
// ==========================================================================
const SUPABASE_URL = 'https://agqrytictqmjzupqrnqp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RuhFkhy2RrVwu4ZYbLZOGw_be0S_rDf';

async function guardarEnSupabase(datos) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/voluntarios`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(datos)
    });
    return res.ok;
  } catch (error) {
    console.error('Error al conectar con Supabase:', error);
    return false;
  }
}

// Modal de Adhesión Ciudadana y Voluntariado (presente en todas las páginas)
function initVolunteerModal() {
  const openButtons = document.querySelectorAll('.open-volunteer-modal');
  const modal = document.getElementById('volunteerModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const form = document.getElementById('volunteerForm');
  const modalForm = document.getElementById('modalVolunteerForm');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Registrando...';
      }

      const name = document.getElementById('volName')?.value.trim() || 'Ciudadano/a';
      const phone = document.getElementById('volPhone')?.value.trim() || '';
      const parish = document.getElementById('volParish')?.value || 'San Gabriel';

      // 1. Guardar en la base de datos de Supabase
      await guardarEnSupabase({
        nombre: name,
        telefono: phone,
        parroquia: parish,
        rol: 'Voluntariado General',
        origen: 'pagina_contacto'
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }

      showToast(`¡Registro guardado con éxito! Redirigiendo al grupo oficial de WhatsApp.`);

      // 2. Redirección al grupo oficial de WhatsApp de Renovación Montufareña
      const whatsappGroupUrl = 'https://chat.whatsapp.com/K8MoGQyFzeyKqJVoEqNKnU?s=cl&p=i&iam=2';

      setTimeout(() => {
        window.open(whatsappGroupUrl, '_blank');
      }, 1000);

      form.reset();
    });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Registrando...';
      }

      const name = document.getElementById('modalVolName')?.value.trim() || 'Ciudadano/a';
      const phone = document.getElementById('modalVolPhone')?.value.trim() || '';
      const parish = document.getElementById('modalVolParish')?.value || 'San Gabriel';

      // 1. Guardar en la base de datos de Supabase
      await guardarEnSupabase({
        nombre: name,
        telefono: phone,
        parroquia: parish,
        rol: 'Súmate al Equipo (Modal)',
        origen: 'modal_header'
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }

      closeModal();
      showToast(`¡Registro guardado con éxito! Redirigiendo al grupo oficial de WhatsApp.`);

      // 2. Redirección al grupo oficial de WhatsApp de Renovación Montufareña
      const whatsappGroupUrl = 'https://chat.whatsapp.com/K8MoGQyFzeyKqJVoEqNKnU?s=cl&p=i&iam=2';

      setTimeout(() => {
        window.open(whatsappGroupUrl, '_blank');
      }, 1000);

      modalForm.reset();
    });
  }
}

// 6. Notificación Institucional
function showToast(message) {
  let toast = document.getElementById('campaignToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'campaignToast';
    toast.className = 'fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#151E5A] text-white font-semibold py-3.5 px-6 rounded-lg shadow-2xl z-[9999] transition-all duration-300 flex items-center gap-3 border-l-4 border-[#008D36] text-sm';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-[#008D36]"></span> <span>${message}</span>`;
  toast.style.opacity = '1';
  toast.style.bottom = '24px';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.bottom = '-60px';
  }, 4000);
}

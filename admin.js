// =========================================
// CONFIGURACIÓN DE SUPABASE
// =========================================
const SUPABASE_URL = 'https://agqrytictqmjzupqrnqp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RuhFkhy2RrVwu4ZYbLZOGw_be0S_rDf';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const proposalForm = document.getElementById('proposal-form');

    // --- 1. GESTIÓN DE AUTENTICACIÓN ---
    // Verificar sesión al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            showDashboard();
        }
    });

    // Escuchar cambios de autenticación
    supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            showDashboard();
        } else {
            showLogin();
        }
    });

    // Login Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-pass').value;
        const errorEl = document.getElementById('login-error');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        // 1. Mostrar estado de carga
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'VERIFICANDO...';
        submitBtn.disabled = true;

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        // 2. Restaurar botón
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;

        if (error) {
            // Mostrar el error exacto que envía Supabase
            errorEl.innerText = 'Error: ' + (error.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : error.message);
            errorEl.style.display = 'block';
        } else if (data.session) {
            errorEl.style.display = 'none';
            showDashboard();
        } else {
            errorEl.innerText = 'Error: Tu cuenta necesita confirmación en Supabase.';
            errorEl.style.display = 'block';
        }
    });

    // Logout
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
    });

    function showDashboard() {
        loginView.style.display = 'none';
        dashboardView.style.display = 'flex';
        loadAdminProposals(); // Cargar datos al entrar
    }

    function showLogin() {
        loginView.style.display = 'flex';
        dashboardView.style.display = 'none';
    }

    // --- 2. GESTIÓN DE PROPUESTAS (CRUD) ---
    async function loadAdminProposals() {
        const container = document.getElementById('admin-proposals-list');
        container.innerHTML = '<p>Cargando propuestas...</p>';

        const { data, error } = await supabase.from('propuestas').select('*').order('id', { ascending: false });
        
        if (error) {
            container.innerHTML = `<p class="text-red">Error al conectar con la base de datos: ${error.message}</p>`;
            return;
        }

        if (data && data.length > 0) {
            container.innerHTML = '';
            data.forEach(p => {
                const div = document.createElement('div');
                div.className = 'p-20 bg-light-gray rounded-40 flex-row justify-between align-center';
                div.innerHTML = `
                    <div>
                        <span class="prop-badge bg-${p.category}">${p.category}</span>
                        <h4 style="margin: 5px 0;">${p.title}</h4>
                        <p style="font-size: 0.9rem; color: #666;">${p.desc_text}</p>
                    </div>
                    <span style="color: ${p.is_active ? 'green' : 'red'}; font-weight: bold;">${p.is_active ? 'ACTIVO' : 'INACTIVO'}</span>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<p>No hay propuestas registradas. Agrega una usando el formulario superior.</p>';
        }
    }

    // Agregar nueva propuesta
    proposalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const category = document.getElementById('prop-cat').value;
        const title = document.getElementById('prop-title').value;
        const desc_text = document.getElementById('prop-desc').value;

        const { data, error } = await supabase.from('propuestas').insert([{ category, title, desc_text }]);
        if (!error) {
            proposalForm.reset();
            loadAdminProposals(); // Recargar lista
            alert('¡Propuesta agregada exitosamente!');
        } else {
            alert('Error al guardar propuesta: ' + error.message);
        }
    });
});
// =========================================
// CONFIGURACIÓN DE SUPABASE
// =========================================
const SUPABASE_URL = 'https://agqrytictqmjzupqrnqp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RuhFkhy2RrVwu4ZYbLZOGw_be0S_rDf';
const supabase = (window.supabase && window.supabase.createClient)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

// =========================================
// CREDENCIALES MAESTRA DE ADMINISTRADOR
// =========================================
const ADMIN_EMAIL = 'dilancoronado358@gmail.com';
const ADMIN_PASS  = 'Dilan123';

// =========================================
// INICIO DE LA APP
// =========================================
document.addEventListener('DOMContentLoaded', () => {

    const loginView    = document.getElementById('login-view');
    const dashView     = document.getElementById('dashboard-view');
    const loginForm    = document.getElementById('login-form');
    const logoutBtn    = document.getElementById('logout-btn');
    const proposalForm = document.getElementById('proposal-form');
    const errorEl      = document.getElementById('login-error');

    // ---- Verificar sesión al cargar ----
    if (localStorage.getItem('admin_session') === 'true') {
        showDashboard();
    } else {
        showLogin();
    }

    // ---- Manejo del formulario de login ----
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email    = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-pass').value.trim();
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        // Limpiar errores previos
        errorEl.style.display = 'none';
        errorEl.innerText = '';

        if (!email || !password) {
            showError('Por favor, ingresa tu correo y contraseña.');
            return;
        }

        // Estado de carga
        submitBtn.innerText = 'VERIFICANDO...';
        submitBtn.disabled  = true;

        try {
            // Credencial maestra (sin base de datos)
            if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS) {
                localStorage.setItem('admin_session', 'true');
                document.getElementById('admin-pass').value = '';
                showDashboard();
                return;
            }

            // Verificar en Supabase si hay otro usuario
            let loginOk = false;
            if (supabase) {
                const { data, error } = await supabase
                    .from('usuarios_admin')
                    .select('id')
                    .eq('email', email)
                    .eq('password', password)
                    .maybeSingle();

                if (!error && data) loginOk = true;
            }

            if (loginOk) {
                localStorage.setItem('admin_session', 'true');
                document.getElementById('admin-pass').value = '';
                showDashboard();
            } else {
                showError('Correo o contraseña incorrectos.');
            }

        } catch (err) {
            showError('Error de conexión: ' + err.message);
        } finally {
            submitBtn.innerText = 'INICIAR SESIÓN';
            submitBtn.disabled  = false;
        }
    });

    // ---- Cerrar sesión ----
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('admin_session');
            showLogin();
        });
    }

    // ---- Guardar propuesta ----
    if (proposalForm) {
        proposalForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!supabase) {
                alert('Error: Conexión a base de datos no disponible.');
                return;
            }
            const category  = document.getElementById('prop-cat').value;
            const title     = document.getElementById('prop-title').value;
            const desc_text = document.getElementById('prop-desc').value;

            const { error } = await supabase
                .from('propuestas')
                .insert([{ category, title, desc_text }]);

            if (!error) {
                proposalForm.reset();
                loadAdminProposals();
                alert('¡Propuesta guardada correctamente!');
            } else {
                alert('Error al guardar: ' + error.message);
            }
        });
    }

    // ---- Funciones auxiliares ----
    function showDashboard() {
        loginView.style.display  = 'none';
        dashView.style.display   = 'flex';
        loadAdminProposals();
    }

    function showLogin() {
        loginView.style.display = 'flex';
        dashView.style.display  = 'none';
    }

    function showError(msg) {
        errorEl.innerText      = msg;
        errorEl.style.display  = 'block';
    }

    async function loadAdminProposals() {
        const container = document.getElementById('admin-proposals-list');
        if (!container) return;
        container.innerHTML = '<p>Cargando propuestas...</p>';

        if (!supabase) {
            container.innerHTML = '<p style="color:red;">Sin conexión a la base de datos.</p>';
            return;
        }

        const { data, error } = await supabase
            .from('propuestas')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            container.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
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
                    <span style="color: ${p.is_active ? 'green' : 'red'}; font-weight: bold;">
                        ${p.is_active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<p>No hay propuestas registradas todavía.</p>';
        }
    }
});
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

    // Protector global de errores de Javascript
    window.onerror = function(msg) {
        const errorEl = document.getElementById('login-error');
        if (errorEl) {
            errorEl.innerText = "Error del navegador: " + msg;
            errorEl.style.display = 'block';
        }
    };

    // --- 1. GESTIÓN DE AUTENTICACIÓN PERSONALIZADA ---
    try {
        if (localStorage.getItem('admin_session') === 'true') {
            showDashboard();
        } else {
            showLogin();
        }
    } catch (e) {
        console.error("Supabase no pudo inicializarse correctamente:", e);
    }

    // Login Submit
    if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-pass').value.trim();
        const errorEl = document.getElementById('login-error');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        errorEl.style.display = 'none';
        errorEl.innerText = '';
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'VERIFICANDO...';
        submitBtn.disabled = true;

        try {
            // --- LLAVE MAESTRA INFALIBLE ---
            // Verifica tus datos directamente. Es imposible que falle o se quede cargando.
            if (email.toLowerCase() === 'dilancoronado358@gmail.com' && password === 'Dilan123') {
                localStorage.setItem('admin_session', 'true');
                document.getElementById('admin-pass').value = '';
                showDashboard();
                return; // Corta la función aquí y te deja entrar de inmediato
            }

            // Consultar a nuestra tabla personalizada
            const { data, error } = await supabase
                .from('usuarios_admin')
                .select('*')
                .eq('email', email)
                .eq('password', password);
            
            if (error) throw error;

            if (data && data.length > 0) {
                // Login exitoso, guardamos sesión manual
                localStorage.setItem('admin_session', 'true');
                document.getElementById('admin-pass').value = '';
                showDashboard();
            } else {
                errorEl.innerText = 'Error: Correo o contraseña incorrectos.';
                errorEl.style.display = 'block';
            }
        } catch (err) {
            errorEl.innerText = 'Error crítico de conexión: ' + err.message;
            alert('Error crítico de conexión: ' + err.message);
            errorEl.style.display = 'block';
        } finally {
            // 2. Restaurar botón siempre, sin importar lo que pase
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
    }

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('admin_session');
        showLogin();
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
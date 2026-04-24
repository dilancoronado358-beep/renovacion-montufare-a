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

        // 1. Limpiar errores previos y mostrar estado de carga
        errorEl.style.display = 'none';
        errorEl.innerText = '';
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'VERIFICANDO...';
        submitBtn.disabled = true;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            
            if (error) {
                // Si hay error en las credenciales (Supabase puede enviar varios tipos de mensajes)
                if (error.message.toLowerCase().includes('credential') || error.message.toLowerCase().includes('invalid')) {
                    errorEl.innerText = 'Error: El correo o la contraseña son incorrectos. Por favor, verifica tus datos.';
                } else {
                    errorEl.innerText = 'Error del sistema: ' + error.message;
                }
                errorEl.style.display = 'block';
            } else if (data && data.session) {
                // Login exitoso
                document.getElementById('admin-pass').value = ''; // Limpiar contraseña por seguridad
                showDashboard();
            } else {
                // Si entra aquí es porque el usuario existe pero falta marcar la opción "Auto Confirm" en Supabase
                errorEl.innerText = 'Atención: Tu usuario existe pero NO está confirmado. Ve a Supabase -> Authentication -> Users, borra tu usuario y vuelve a crearlo ASEGURÁNDOTE de marcar la casilla "Auto Confirm User".';
                errorEl.style.display = 'block';
            }
        } catch (err) {
            errorEl.innerText = 'Error crítico de conexión: ' + err.message;
            errorEl.style.display = 'block';
        } finally {
            // 2. Restaurar botón siempre, sin importar lo que pase
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
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
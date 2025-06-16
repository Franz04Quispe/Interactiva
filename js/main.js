
(() => {
    /**/
    // Elements for login/register modals and header controls
    const headerRight = document.getElementById('headerRight');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Input fields with error divs
    const loginEmail = document.getElementById('loginEmail');
    const loginEmailError = document.getElementById('loginEmailError');
    const loginPassword = document.getElementById('loginPassword');
    const loginPasswordError = document.getElementById('loginPasswordError');

    const registerName = document.getElementById('registerName');
    const registerNameError = document.getElementById('registerNameError');
    const registerEmail = document.getElementById('registerEmail');
    const registerEmailError = document.getElementById('registerEmailError');
    const registerPassword = document.getElementById('registerPassword');
    const registerPasswordError = document.getElementById('registerPasswordError');
    const registerConfirmPassword = document.getElementById('registerConfirmPassword');
    const registerConfirmPasswordError = document.getElementById('registerConfirmPasswordError');

    // Buttons to switch modals
    const switchToRegisterBtn = document.getElementById('switchToRegister');
    const switchToLoginBtn = document.getElementById('switchToLogin');

    // Close modal buttons
    const closeLoginModalBtn = document.getElementById('closeLoginModal');
    const closeRegisterModalBtn = document.getElementById('closeRegisterModal');

    // LocalStorage keys
    const USERS_KEY = 'digitalWhiteboardUsers';
    const SESSION_KEY = 'digitalWhiteboardSession';

    // Simple password hashing - for demo only (not secure)
    function simpleHash(str) {
        let hash = 0, i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash.toString();
    }

    // Read users array from localStorage or create empty
    function getUsers() {
        const usersJson = localStorage.getItem(USERS_KEY);
        try {
            return usersJson ? JSON.parse(usersJson) : [];
        } catch {
            return [];
        }
    }

    // Save users array to localStorage
    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Save session user email (simple)
    function setSession(email) {
        sessionStorage.setItem(SESSION_KEY, email);
    }

    // Clear session
    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    // Get session email or null
    function getSession() {
        return sessionStorage.getItem(SESSION_KEY);
    }

    // Show modal helper, trap focus inside modal for accessibility
    function showModal(modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        // Focus first focusable element inside modal
        const focusable = modal.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
        // Trap focus
        trapFocus(modal);
    }

    // Hide modal helper
    function hideModal(modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        releaseFocusTrap();
    }

    // Focus trap implementation
    let focusTrapElement = null;
    function trapFocus(element) {
        focusTrapElement = element;
        document.addEventListener('focusin', enforceFocusTrap);
        // Escape key also closes modal
        document.addEventListener('keydown', handleEscapeKey);
    }
    function releaseFocusTrap() {
        focusTrapElement = null;
        document.removeEventListener('focusin', enforceFocusTrap);
        document.removeEventListener('keydown', handleEscapeKey);
    }
    function enforceFocusTrap(e) {
        if (focusTrapElement && !focusTrapElement.contains(e.target)) {
            e.stopPropagation();
            focusTrapElement.focus();
        }
    }
    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            if (loginModal.classList.contains('active')) {
                hideModal(loginModal);
            }
            if (registerModal.classList.contains('active')) {
                hideModal(registerModal);
            }
        }
    }

    // Toggle header UI for logged in/logged out
    function updateHeaderUI() {
        const loggedInEmail = getSession();
        headerRight.innerHTML = '';
        if (!loggedInEmail) {
            // Show login and register buttons
            const loginBtn = document.createElement('button');
            loginBtn.className = 'header-btn';
            loginBtn.textContent = 'Iniciar Sesión';
            loginBtn.type = 'button';
            loginBtn.addEventListener('click', () => {
                showModal(loginModal);
            });

            const registerBtn = document.createElement('button');
            registerBtn.className = 'header-btn';
            registerBtn.textContent = 'Regístrate';
            registerBtn.type = 'button';
            registerBtn.addEventListener('click', () => {
                showModal(registerModal);
            });

            headerRight.appendChild(loginBtn);
            headerRight.appendChild(registerBtn);
        } else {
            // Show user info and logout
            const users = getUsers();
            const user = users.find(u => u.email === loggedInEmail);

            // If user not found (possibly deleted), clear session
            if (!user) {
                clearSession();
                updateHeaderUI();
                return;
            }

            const userDiv = document.createElement('div');
            userDiv.className = 'user-info';
            const avatar = document.createElement('img');
            avatar.src = user.avatar || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c6ab6ea4-6643-4905-b8a4-809149726424.png).toUpperCase()}`;
            avatar.alt = `Avatar de ${user.name}`;
            avatar.className = 'user-avatar';
            userDiv.appendChild(avatar);

            const userNameSpan = document.createElement('span');
            userNameSpan.textContent = user.name;
            userDiv.appendChild(userNameSpan);

            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'logout-btn';
            logoutBtn.type = 'button';
            logoutBtn.textContent = 'Cerrar Sesión';
            logoutBtn.addEventListener('click', () => {
                clearSession();
                updateHeaderUI();
                showToast('Sesión cerrada');
            });

            headerRight.appendChild(userDiv);
            headerRight.appendChild(logoutBtn);
        }
    }

    // Validate email format basic
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    }

    // Clear form errors helper
    function clearFormErrors(form) {
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(elem => { elem.textContent = ''; });
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => { input.setAttribute('aria-invalid', 'false'); });
    }

    // Show error message helper
    function showError(inputElem, errorElem, message) {
        errorElem.textContent = message;
        inputElem.setAttribute('aria-invalid', 'true');
    }

    // Hash password helper for demo
    function hashPassword(password) {
        return simpleHash(password);
    }

    // Form submit handlers
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        clearFormErrors(loginForm);
        let valid = true;

        const emailVal = loginEmail.value.trim();
        const passVal = loginPassword.value;

        if (!emailVal) {
            showError(loginEmail, loginEmailError, 'El correo es obligatorio');
            valid = false;
        } else if (!validateEmail(emailVal)) {
            showError(loginEmail, loginEmailError, 'Formato de correo inválido');
            valid = false;
        }
        if (!passVal) {
            showError(loginPassword, loginPasswordError, 'La contraseña es obligatoria');
            valid = false;
        }
        if (!valid) return;

        // Check credentials
        const users = getUsers();
        const user = users.find(u => u.email.toLowerCase() === emailVal.toLowerCase());
        if (!user) {
            showToast('Usuario no encontrado', 4000);
            return;
        }
        if (user.password !== hashPassword(passVal)) {
            showToast('Contraseña incorrecta', 4000);
            return;
        }

        // Successful login
        setSession(user.email);
        updateHeaderUI();
        hideModal(loginModal);
        loginForm.reset();
        showToast(`Bienvenido, ${user.name}`);

    });

    registerForm.addEventListener('submit', e => {
        e.preventDefault();
        clearFormErrors(registerForm);
        let valid = true;

        const nameVal = registerName.value.trim();
        const emailVal = registerEmail.value.trim();
        const passVal = registerPassword.value;
        const confirmPassVal = registerConfirmPassword.value;

        if (!nameVal) {
            showError(registerName, registerNameError, 'El nombre es obligatorio');
            valid = false;
        } else if (nameVal.length < 2) {
            showError(registerName, registerNameError, 'El nombre debe tener al menos 2 caracteres');
            valid = false;
        }
        if (!emailVal) {
            showError(registerEmail, registerEmailError, 'El correo es obligatorio');
            valid = false;
        } else if (!validateEmail(emailVal)) {
            showError(registerEmail, registerEmailError, 'Formato de correo inválido');
            valid = false;
        }
        if (!passVal) {
            showError(registerPassword, registerPasswordError, 'La contraseña es obligatoria');
            valid = false;
        } else if (passVal.length < 6) {
            showError(registerPassword, registerPasswordError, 'La contraseña debe tener al menos 6 caracteres');
            valid = false;
        }
        if (!confirmPassVal) {
            showError(registerConfirmPassword, registerConfirmPasswordError, 'Confirme su contraseña');
            valid = false;
        } else if (confirmPassVal !== passVal) {
            showError(registerConfirmPassword, registerConfirmPasswordError, 'Las contraseñas no coinciden');
            valid = false;
        }

        if (!valid) return;

        // Check email already exists
        const users = getUsers();
        if (users.some(u => u.email.toLowerCase() === emailVal.toLowerCase())) {
            showToast('Ya existe un usuario registrado con este correo', 4000);
            return;
        }

        // Register user: add to localStorage with simple hash password and default avatar
        const newUser = {
            id: Date.now(),
            name: nameVal,
            email: emailVal,
            password: hashPassword(passVal),
            avatar: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/be54077b-71a9-467a-bf8f-aed36d44bf01.png).toUpperCase()}`,
        };
        users.push(newUser);
        saveUsers(users);

        // Auto-login
        setSession(newUser.email);
        updateHeaderUI();
        hideModal(registerModal);
        registerForm.reset();
        showToast('Registro exitoso, bienvenido/a!');

    });

    // Modal switching buttons
    switchToRegisterBtn.addEventListener('click', e => {
        e.preventDefault();
        hideModal(loginModal);
        showModal(registerModal);
    });
    switchToLoginBtn.addEventListener('click', e => {
        e.preventDefault();
        hideModal(registerModal);
        showModal(loginModal);
    });

    // Modal close buttons
    closeLoginModalBtn.addEventListener('click', () => hideModal(loginModal));
    closeRegisterModalBtn.addEventListener('click', () => hideModal(registerModal));

    // Accessibility: close modal when clicking backdrop
    loginModal.addEventListener('click', e => {
        if (e.target === loginModal) hideModal(loginModal);
    });
    registerModal.addEventListener('click', e => {
        if (e.target === registerModal) hideModal(registerModal);
    });

    // Initialize header UI on load
    updateHeaderUI();
    /**/

    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const detailPanel = document.getElementById('detailPanel');
    const btnInicio = document.getElementById('btnInicio');
    const btnCapas = document.getElementById('btnCapas');
    const btnHerramientas = document.getElementById('btnHerramientas');
    const btnColaboradores = document.getElementById('btnColaboradores');
    const btnConfiguracion = document.getElementById('btnConfiguracion');
    const buttons = [btnInicio, btnCapas, btnHerramientas, btnColaboradores, btnConfiguracion];
    const body = document.body;

    // Theme state
    let isDarkTheme = false;

    // Manage sidebar toggle on mobile
    menuToggle.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!expanded));
        sidebar.classList.toggle('open');
    });

    // Close sidebar on outside click mobile
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Keyboard: Escape closes sidebar if open (mobile)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.focus();
        }
    });

    // Clear active state from all buttons
    const clearActive = () => {
        buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
    };

    // Render detail panel content depending on selection
    function renderDetailPanel(section) {
        detailPanel.innerHTML = ''; // Clear
        switch (section) {
            case 'inicio':
                renderInicio();
                break;
            case 'capas':
                renderCapas();
                break;
            case 'herramientas':
                renderHerramientas();
                break;
            case 'colaboradores':
                renderColaboradores();
                break;
            case 'configuracion':
                renderConfiguracion();
                break;
            default:
                detailPanel.textContent = '';
        }
    }

    function renderInicio() {
        const container = document.createElement('div');
        container.setAttribute('tabindex', '0');
        container.innerHTML = `
        <h2>Bienvenido a la Pizarra Digital Interactiva</h2>
        <p>Puede trazar lineas o formas.</p>
        <p>Use la barra lateral izquierda para seleccionar herramientas y opciones.</p>
        <p>En el área central puede dibujar y organizar su trabajo.</p>
        <p style="color: green; ";>"Esto es una maquetacion o idea de lo que puede ser mi proyecto de grado".</p>
    `;
        detailPanel.appendChild(container);
    }

    // Dummy layers with toggle visibility
    let layers = [
        { id: 1, name: 'Fondo', visible: true },
        { id: 2, name: 'Dibujos', visible: true },
        { id: 3, name: 'Anotaciones', visible: true }
    ];

    function renderCapas() {
        const container = document.createElement('div');
        container.setAttribute('tabindex', '0');
        container.innerHTML = `<h2>Capas</h2>`;
        const list = document.createElement('div');
        list.id = 'layersList';

        layers.forEach(layer => {
            const label = document.createElement('label');
            label.htmlFor = `layer-${layer.id}`;
            label.textContent = layer.name;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `layer-${layer.id}`;
            checkbox.checked = layer.visible;
            checkbox.setAttribute('aria-label', `Mostrar/ocultar capa ${layer.name}`);

            checkbox.addEventListener('change', () => {
                layer.visible = checkbox.checked;
                updateLayerVisibility();
            });

            label.prepend(checkbox);
            list.appendChild(label);
        });
        container.appendChild(list);
        detailPanel.appendChild(container);
    }

    function updateLayerVisibility() {
        // For the demonstration, no real layering in canvas.
        // Would integrate with Canvas layers in real app.
        // Placeholder: log layers visibility
        console.log('Layer visibility updated:', layers);
    }

    // Drawing tools state
    const tools = [
        { id: 'pen', name: 'Lápiz', icon: 'edit' },
        { id: 'eraser', name: 'Borrador', icon: 'backspace' }
    ];
    let currentTool = 'pen';
    let currentColor = '#000000';
    let currentSize = 4;

    function renderHerramientas() {
        const container = document.createElement('div');
        container.setAttribute('tabindex', '0');
        container.innerHTML = `<h2>Herramientas</h2>`;
        const toolsPanel = document.createElement('div');
        toolsPanel.id = 'toolsPanel';

        tools.forEach(tool => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.title = tool.name;
            btn.setAttribute('aria-pressed', (currentTool === tool.id).toString());
            btn.className = currentTool === tool.id ? 'active' : '';
            btn.innerHTML = `<span class="material-icons" aria-hidden="true">${tool.icon}</span> ${tool.name}`;
            btn.addEventListener('click', () => {
                currentTool = tool.id;
                renderHerramientas(); // re-render to update active button
            });
            toolsPanel.appendChild(btn);
        });

        // Color and brush size controls
        const controls = document.createElement('div');
        controls.style.marginTop = '16px';

        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Color: ';
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = currentColor;
        colorInput.addEventListener('input', () => {
            currentColor = colorInput.value;
        });
        colorLabel.appendChild(colorInput);
        controls.appendChild(colorLabel);

        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = ' Tamaño: ';
        const sizeInput = document.createElement('input');
        sizeInput.type = 'range';
        sizeInput.min = '1';
        sizeInput.max = '40';
        sizeInput.value = currentSize;
        sizeInput.style.verticalAlign = 'middle';
        sizeInput.addEventListener('input', () => {
            currentSize = sizeInput.value;
        });
        sizeLabel.appendChild(sizeInput);
        controls.appendChild(sizeLabel);

        container.appendChild(toolsPanel);
        container.appendChild(controls);
        detailPanel.appendChild(container);
    }

    // Dummy collaborators data
    const collaborators = [
        {
            id: 1,
            name: 'Franz Quispe',
            avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/32774dcd-e9ef-4832-87f9-2154cb2d9447.png',
            status: 'En línea'
        },
        {
            id: 2,
            name: 'Luis Martínez',
            avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d330809b-e64a-4d3a-922d-e7f957cc12e0.png',
            status: 'Ausente'
        },
        {
            id: 3,
            name: 'María Pérez',
            avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d2dec7a4-ff98-441c-9e67-e41b5b529cd5.png',
            status: 'Ocupado'
        }
    ];

    function renderColaboradores() {
        const container = document.createElement('div');
        container.setAttribute('tabindex', '0');
        container.innerHTML = `
        <h2>Colaboradores</h2>
        <div id="collaboratorsList"></div>
      `;
        const list = container.querySelector('#collaboratorsList');

        collaborators.forEach(collab => {
            const div = document.createElement('div');
            div.className = 'collaborator';
            div.tabIndex = 0;
            div.setAttribute('aria-label', `Colaborador ${collab.name}, estado ${collab.status}`);

            const img = document.createElement('img');
            img.src = collab.avatar;
            img.alt = `Avatar de ${collab.name}`;
            img.loading = 'lazy';

            const info = document.createElement('div');
            info.className = 'collaborator-info';

            const nameEl = document.createElement('div');
            nameEl.className = 'collaborator-name';
            nameEl.textContent = collab.name;

            const statusEl = document.createElement('div');
            statusEl.className = 'collaborator-status';
            statusEl.textContent = collab.status;

            info.appendChild(nameEl);
            info.appendChild(statusEl);
            div.appendChild(img);
            div.appendChild(info);
            list.appendChild(div);
        });
        detailPanel.appendChild(container);
    }

    // Configuracion panel with theme toggle
    function renderConfiguracion() {
        const container = document.createElement('div');
        container.setAttribute('tabindex', '0');
        container.innerHTML = `<h2>Configuración</h2>`;

        // Theme toggle
        const themeLabel = document.createElement('label');
        themeLabel.innerHTML = 'Modo Oscuro: ';
        const themeToggle = document.createElement('input');
        themeToggle.type = 'checkbox';
        themeToggle.checked = isDarkTheme;
        themeToggle.setAttribute('aria-checked', isDarkTheme.toString());

        themeToggle.addEventListener('change', () => {
            isDarkTheme = themeToggle.checked;
            updateTheme();
        });

        themeLabel.appendChild(themeToggle);
        container.appendChild(themeLabel);

        detailPanel.appendChild(container);
    }

    function updateTheme() {
        if (isDarkTheme) {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
        // Also update aria-checked on the toggle
        const chk = detailPanel.querySelector('#settingsPanel input[type="checkbox"]');
        if (chk) {
            chk.setAttribute('aria-checked', isDarkTheme.toString());
        }
    }

    // Handle sidebar button clicks and rendering
    function handleSidebarClick(selectedId) {
        clearActive();
        buttons.forEach(btn => {
            if (btn.id === selectedId) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            }
        });
        sidebar.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');

        // render detail panel content
        switch (selectedId) {
            case 'btnInicio': renderDetailPanel('inicio'); break;
            case 'btnCapas': renderDetailPanel('capas'); break;
            case 'btnHerramientas': renderDetailPanel('herramientas'); break;
            case 'btnColaboradores': renderDetailPanel('colaboradores'); break;
            case 'btnConfiguracion': renderDetailPanel('configuracion'); break;
        }
    }

    // Initial render
    renderDetailPanel('inicio');

    // Attach event listeners
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            handleSidebarClick(btn.id);
        });
    });

    // --- Whiteboard canvas drawing logic ---
    const canvas = document.getElementById('whiteboardCanvas');
    const ctx = canvas.getContext('2d');

    // Resize canvas to container size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Drawing variables
    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    // Functions to start, draw, and stop drawing
    function startDrawing(e) {
        drawing = true;
        const pos = getEventPos(e);
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault();
    }
    function draw(e) {
        if (!drawing) return;
        const pos = getEventPos(e);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = currentSize;

        if (currentTool === 'pen') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
        }
        else if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        }

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault();
    }
    function stopDrawing(e) {
        if (!drawing) return;
        drawing = false;
        ctx.globalCompositeOperation = 'source-over';
        e.preventDefault();
    }

    // Get mouse or touch position relative to canvas
    function getEventPos(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    // Event listeners for mouse and touch
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

})();

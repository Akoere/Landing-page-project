/* =========================================
   1. CONFIGURATION
   ========================================= */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-csy7jG_f5gzSXCnL3WcfYNfXH6byk0SnwL0CeVLq6Xh974Bg7y5tniJkEDcIpjpBwg/exec"; 

/* =========================================
   2. APP LOGIC
   ========================================= */
const app = {
    user: null,

    init: function() {
        this.checkSession();
        this.checkTheme();
        this.setupEventListeners();
    },

    checkSession: function() {
        const savedUser = localStorage.getItem('session_user');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
            this.showPage('home');
        } else {
            // New: Default to Landing Page
            this.showPage('landing'); 
        }
    },

    showPage: function(pageId) {
        // Hide all pages
        document.querySelectorAll('.card').forEach(el => el.classList.add('hidden'));
        
        // Show target page
        const target = document.getElementById(`${pageId}-page`);
        if(target) target.classList.remove('hidden');

        // Update Home Dashboard if applicable
        if (pageId === 'home' && this.user) {
            document.getElementById('user-greeting').textContent = `Hello, ${this.user.name}!`;
        }
        
        this.clearForms();
    },

    logout: function() {
        localStorage.removeItem('session_user');
        this.user = null;
        this.showPage('landing'); // Return to landing on logout
    },

    clearForms: function() {
        document.querySelectorAll('input').forEach(i => i.value = '');
        document.querySelectorAll('.message').forEach(m => {
            m.textContent = '';
            m.className = 'message hidden';
        });
    },

    checkTheme: function() {
        const isDark = localStorage.getItem('theme') === 'dark';
        if (isDark) document.body.classList.add('dark-mode');
        this.updateThemeIcon(isDark);
    },

    toggleTheme: function() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateThemeIcon(isDark);
    },

    updateThemeIcon: function(isDark) {
        if (isDark) {
            document.getElementById('sun-icon').classList.add('hidden');
            document.getElementById('moon-icon').classList.remove('hidden');
        } else {
            document.getElementById('sun-icon').classList.remove('hidden');
            document.getElementById('moon-icon').classList.add('hidden');
        }
    }
};

/* =========================================
   3. AUTH API
   ========================================= */

async function hashPassword(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleAuth(action, name, email, password) {
    const btn = document.querySelector(`#${action}-form button`);
    const loader = btn.querySelector('.loader');
    const text = btn.querySelector('.btn-text');
    const msgBox = document.getElementById(`${action}-message`);

    btn.disabled = true;
    loader.classList.remove('hidden');
    text.classList.add('hidden');
    msgBox.classList.add('hidden');

    try {
        const hashedPassword = await hashPassword(password);
        
        const payload = {
            action: action,
            email: email.toLowerCase(),
            password: hashedPassword,
            name: name
        };

        let result;

        if (GOOGLE_SCRIPT_URL) {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            result = await response.json();
        } else {
            // DEMO MODE
            await new Promise(r => setTimeout(r, 1000)); 
            const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
            
            if (action === 'signup') {
                if (users.find(u => u.email === payload.email)) {
                    result = { success: false, message: "Email already exists (Demo)" };
                } else {
                    users.push(payload);
                    localStorage.setItem('mock_users', JSON.stringify(users));
                    result = { success: true, message: "Account created!" };
                }
            } else { 
                const user = users.find(u => u.email === payload.email && u.password === payload.password);
                if (user) result = { success: true, user: { name: user.name, email: user.email } };
                else result = { success: false, message: "Invalid credentials (Demo)" };
            }
        }

        if (result.success || result.status === 'success') {
            msgBox.textContent = result.message || "Success!";
            msgBox.className = "message success";
            msgBox.classList.remove('hidden');

            if (action === 'signup') {
                setTimeout(() => app.showPage('login'), 1500);
            } else {
                localStorage.setItem('session_user', JSON.stringify(result.user));
                app.user = result.user;
                setTimeout(() => app.showPage('home'), 50);
            }
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        msgBox.textContent = error.message || "An error occurred.";
        msgBox.className = "message error";
        msgBox.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        loader.classList.add('hidden');
        text.classList.remove('hidden');
    }
}

 /*
   4. EVENTS
    */

app.setupEventListeners = function() {
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleAuth('login', null, document.getElementById('login-email').value, document.getElementById('login-password').value);
    });

    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleAuth('signup', document.getElementById('signup-name').value, document.getElementById('signup-email').value, document.getElementById('signup-password').value);
    });
};

app.init();
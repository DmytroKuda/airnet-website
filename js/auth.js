import { updateHeaderAuthButton, renderCabinetData } from './cabinet.js';

export function initAuth() {
    /* tabs */
    const tabButtonsAuth = document.querySelectorAll('.auth-tab-btn');
    const tabPanesAuth = document.querySelectorAll('.auth-form');

    tabButtonsAuth.forEach(button => {
        button.addEventListener('click', () => {
            tabButtonsAuth.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const targetTabId = button.getAttribute('data-auth-tab');
            tabPanesAuth.forEach(pane => {
                if (pane.id === targetTabId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });

    /* login and register forms */
    const loginForm = document.querySelector('#tab-login');
    const registerForm = document.querySelector('#tab-register');

    const loginModal = document.querySelector('#modal-success-login');
    const loginModalTitle = document.querySelector('#modal-success-login #modal-title');
    const loginModalInfo = document.querySelector('#modal-success-login #modal-info');
    const loginModalCloseBtn = document.querySelector('#modal-close-btn-login');

    const signUpModalSuccess = document.querySelector('#modal-success-sign-up');
    const signUpModalCloseBtn = document.querySelector('#modal-close-btn-signup');

    function showLoginModal(title, text) {
        if (loginModal) {
            if (loginModalTitle) loginModalTitle.textContent = title;
            if (loginModalInfo) loginModalInfo.textContent = text;
            loginModal.classList.add('active');
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const inputAccount = document.querySelector('#login-account').value.trim();
            const inputPass = document.querySelector('#login-password').value.trim();

            const usersList = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            const oldSingleUser = JSON.parse(localStorage.getItem('registeredUser'));

            if (oldSingleUser && !usersList.some(u => u.account === oldSingleUser.account)) {
                usersList.push(oldSingleUser);
            }

            if (usersList.length === 0) {
                showLoginModal("Помилка", "Зареєстрованих користувачів ще немає!");
                return;
            }

            const foundUser = usersList.find(u => 
                (u.account === inputAccount || u.phone === inputAccount || u.email === inputAccount) && u.pass === inputPass
            );

            if (foundUser) {
                localStorage.setItem('currentUser', JSON.stringify(foundUser));
                updateHeaderAuthButton();
                renderCabinetData();
                
                showLoginModal("Успішно!", "Ви ввійшли в кабінет.");
            } else {
                showLoginModal("Помилка авторизації", "Неправильний особовий рахунок/телефон/email або пароль!");
                loginForm.reset();
            }
        });
    }

    if (loginModalCloseBtn && loginModal) {
        loginModalCloseBtn.addEventListener('click', () => {
            loginModal.classList.remove('active');
            if (localStorage.getItem('currentUser')) {
                window.location.href = 'cabinet.html';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newAccountNum = Math.floor(100000 + Math.random() * 900000).toString();

            const newUser = {
                account: newAccountNum,
                pass: document.querySelector('#reg-password').value.trim(),
                name: document.querySelector('#reg-name').value.trim(),
                surname: document.querySelector('#reg-surname').value.trim(),
                phone: document.querySelector('#reg-phone').value.trim(),
                email: document.querySelector('#reg-email').value.trim(),
                balance: 0,
                daysLeft: "30 днів",
                services: { staticIp: false, vacationPause: false }
            };

            const usersList = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            usersList.push(newUser);

            localStorage.setItem('registeredUsers', JSON.stringify(usersList));
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            updateHeaderAuthButton();
            renderCabinetData();

            if (signUpModalSuccess) {
                const accountNumberModal = document.querySelector('#account-number-modal');
                if (accountNumberModal) {
                    accountNumberModal.textContent = newUser.account;
                }
                signUpModalSuccess.classList.add('active');
            } else {
                window.location.href = 'cabinet.html';
            }
        });
    }

    if (signUpModalCloseBtn && signUpModalSuccess) {
        signUpModalCloseBtn.addEventListener('click', () => {
            signUpModalSuccess.classList.remove('active');
            window.location.href = 'cabinet.html';
        });
    }
}
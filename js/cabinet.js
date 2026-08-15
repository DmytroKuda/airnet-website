import { initToCopy, setElementValue } from './main.js';

export function getCurrentUserData() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return null;
    
    try {
        return JSON.parse(currentUser);
    } catch (e) {
        console.error("Помилка парсингу даних користувача:", e);
        return null;
    }
}

export function updateHeaderAuthButton() {
    const authBtn = document.querySelector('.btn-cabinet');
    const logOutBtn = document.querySelector('.log-out');

    if (!authBtn || !logOutBtn) return;

    const currentUser = getCurrentUserData();

    if (currentUser) {
        authBtn.textContent = 'Особистий кабінет';
        authBtn.href = 'cabinet.html';
        logOutBtn.classList.add('active');
    } else {
        authBtn.textContent = 'Вхід/Реєстрація';
        authBtn.href = 'login.html';
        logOutBtn.classList.remove('active');
    }
}

export const defaultUser = {
    userNameDisplay: "Користувач",
    status: "● В мережі",
    accountNumber: "000000",
    address: "не вказано",
    phone: "0000000000",
    balance: 0,
    daysLeft: "0 днів"
};

export function renderCabinetData() {
    const userNameElem = document.querySelector('#user-name-display');
    const networkStatusElem = document.querySelector('#network-status');
    const accountNumberElem = document.querySelector('#account-number');
    const userAddressElem = document.querySelector('#user-address');
    const userPhoneElem = document.querySelector('#user-phone');
    const userBalanceElem = document.querySelector('#user-balance');
    const daysLeftElem = document.querySelector('#days-left');

    if (!userNameElem) return;

    const currentUser = getCurrentUserData();
    const data = currentUser || defaultUser;

    const fullName = data.surname ? `${data.name || ''} ${data.surname}`.trim() : (data.name || data.userNameDisplay);

    userNameElem.textContent = fullName;
    networkStatusElem.textContent = data.status || defaultUser.status;
    accountNumberElem.textContent = data.account || data.accountNumber;
    if (userAddressElem) userAddressElem.textContent = data.address || defaultUser.address;
    userPhoneElem.textContent = data.phone || defaultUser.phone;
    userBalanceElem.textContent = data.balance ?? defaultUser.balance;
    daysLeftElem.textContent = data.daysLeft || defaultUser.daysLeft;
}

export function initLogoutEvent() {
    const logOutBtn = document.querySelector('.log-out');
    if (logOutBtn) {
        logOutBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            localStorage.removeItem('currentUser');
            localStorage.removeItem('selectedTariffId');
            updateHeaderAuthButton();
            renderCabinetData();
            window.location.href = 'index.html';
        });
    }
}

export function autofillOrderForm() {
    const currentUser = getCurrentUserData();
    if (!currentUser) return;

    setElementValue('#user-name-order', currentUser.name || '');
    setElementValue('#userName', currentUser.name || '');
    setElementValue('#userLastName', currentUser.surname || '');
    setElementValue('#user-phone-order', currentUser.phone || '');
    setElementValue('#userPhone', currentUser.phone || '');
    setElementValue('#userEmail', currentUser.email || '');

    if (currentUser.address) {
        setElementValue('#street', currentUser.address || '');
    }
}

export function initTransactions() {
    const transCont = document.querySelector('#history-list');
    if (!transCont) return;

    async function loadTrans() {
        try {
            const response = await fetch('json/transactionsHistory.json');
            if (!response.ok) throw new Error('Помилка файлу');
            
            const currentUser = getCurrentUserData();
            if (!currentUser) {
                transCont.innerHTML = '<tr><td colspan="3" style="text-align:center;">Авторизуйтесь для перегляду історії</td></tr>';
                return;
            }

            const accountNumber = currentUser.account || currentUser.accountNumber;
            const userPhone = currentUser.phone;
            const allData = await response.json();

            const transData = allData.filter(item => 
                (accountNumber && item.accountNumber === accountNumber) ||
                (userPhone && item.phone === userPhone)
            );

            if (!transData || transData.length === 0) {
                transCont.innerHTML = '<tr><td colspan="3" style="text-align:center;">Транзакцій ще не проводилося</td></tr>';
                return;
            }

            let transHTML = '';
            transData.forEach((el) => {
                if (el.inOrOut === false) {
                    transHTML += `
                        <tr>
                            <td>${el.date}</td>
                            <td>${el.description}</td>
                            <td class="minus">-${el.sum} грн</td>
                        </tr>`;
                } else {
                    transHTML += `
                        <tr>
                            <td>${el.date}</td>
                            <td>${el.description}</td>
                            <td class="plus">+${el.sum} грн</td>
                        </tr>`;
                }
            });
                    
            transCont.innerHTML = transHTML;
        } catch (error) {
            console.error(error);
            transCont.innerHTML = '<tr><td colspan="3" style="text-align:center;">Помилка завантаження транзакцій</td></tr>';
        }
    }

    loadTrans();
}

export function initCabinetPage() {
    updateHeaderAuthButton(); 
    initLogoutEvent(); 
    renderCabinetData(); 
    autofillOrderForm(); 
    initTransactions();
    initToCopy('#copy-account-btn', '#account-number');
}
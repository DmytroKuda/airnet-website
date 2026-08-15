import { getCurrentUserData } from './cabinet.js';

export function initTelegramForms() {
    const AIRNET_MANAGER = '8781158568:AAHGqZTVTULR8s_Baf8NvDc9tAqu8BeIGR8';
    const AIRNET_BOT_CHAT = '-1003939286716'; 
    const APPL_TOPIC_ID = 2;
    const ORDER_TOPIC_ID = 9;

    function buildApplMessage(data) {
        return `🚀 **Нова заявка AirNet!**\n\n👤 **Ім'я:** ${data.name}\n📞 **Телефон:** ${data.phone}`;
    }

    function buildOrderMessage(data) {
        const addressParts = [
            data.region ? `Область: ${data.region}` : '',
            data.city ? `м. ${data.city}` : '',
            data.street ? `Адреса: ${data.street}` : ''
        ].filter(Boolean).join(', ');

        const currentUser = getCurrentUserData();
        const accountStr = currentUser ? `\n💳 **Особовий рахунок:** ${currentUser.account || currentUser.accountNumber}` : '';

        const fullAddress = addressParts ? addressParts : 'Не вказано';
        const tariffInfo = data.tarTitle 
            ? `📦 **Обраний тариф:** ${data.tarTitle} (${data.tarPrice})` 
            : '📦 **Обраний тариф:** Не обрано';

        return `🚀 **Нове замовлення AirNet!**

    ${tariffInfo}${accountStr}

    👤 **Клієнт:** ${data.name} ${data.surname || ''}
    📞 **Телефон:** ${data.phone}
    ✉️ **Email:** ${data.email || 'Не вказано'}
    💬 **Зв'язок через:** ${data.contactMethod || 'Дзвінок'}
    📍 **Адреса:** ${fullAddress}`;
    }

    async function sendToTelegram(data, messageBuilder, bot_token, chat_id, topic_id) {
        const textMessage = messageBuilder(data);
        const url = `https://api.telegram.org/bot${bot_token}/sendMessage`;

        try {
            const response = await fetch(url, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    chat_id: chat_id,
                    message_thread_id: topic_id,
                    text: textMessage,
                    parse_mode: 'Markdown'
                })
            });

            const result = await response.json(); 
            if (!response.ok) {
                console.error('Telegram API повернув помилку:', result);
            }
        } catch (error) {
            console.error('Помилка мережі:', error);
        }
    }

    function showError(inputElement, message) {
        if (!inputElement) return;
        const formGroup = inputElement.parentElement;
        const errorText = formGroup ? formGroup.querySelector('.error-msg') : null;
        inputElement.classList.add('invalid');
        if (errorText) errorText.textContent = message;
    }
    
    function clearError(inputElement) {
        if (!inputElement) return;
        const formGroup = inputElement.parentElement;
        const errorText = formGroup ? formGroup.querySelector('.error-msg') : null;
        inputElement.classList.remove('invalid');
        if (errorText) errorText.textContent = '';
    }
    
    function checkName(inputElement) {
        if (!inputElement) return false;
        const val = inputElement.value.trim();
        if (val === '' || val.length < 2) {
            showError(inputElement, "Перевірте ім'я");
            return false;
        }
        return true;
    }
    
    function checkPhone(inputElement) {
        if (!inputElement) return false;
        const val = inputElement.value.trim();
        if (val === '' || val.length < 10) {
            showError(inputElement, "Перевірте телефон");
            return false;
        }
        return true;
    }
    
    function checkEmail(inputElement) {
        if (!inputElement) return false;
        const val = inputElement.value.trim();
        if (val === '' || !val.includes('@')) {
            showError(inputElement, "Перевірте email");
            return false;
        }
        return true;
    }

    /* quick order form */
    const applForm = document.querySelector('.appl-form');
    const applNameInput = document.querySelector('#user-name-appl');
    const applPhoneInput = document.querySelector('#user-phone-appl');
    const applModalSuccess = document.querySelector('#modal-success-appl');
    const applModalCloseBtn = document.querySelector('#modal-close-btn-appl');

    if (applForm) {
        applForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearError(applNameInput);
            clearError(applPhoneInput);

            if (!checkName(applNameInput) || !checkPhone(applPhoneInput)) return;

            const formData = {
                name: applNameInput.value.trim(),
                phone: applPhoneInput.value.trim()
            };

            sendToTelegram(formData, buildApplMessage, AIRNET_MANAGER, AIRNET_BOT_CHAT, APPL_TOPIC_ID);
            applForm.reset();

            if (applModalSuccess) applModalSuccess.classList.add('active');
        });
    }

    if (applModalCloseBtn && applModalSuccess) {
        applModalCloseBtn.addEventListener('click', () => {
            applModalSuccess.classList.remove('active');
        });
    }

    /* full order form */
    const orderForm = document.querySelector('.ordering-form') || document.querySelector('#orderForm');
    const orderNameInput = document.querySelector('#user-name-order') || document.querySelector('#userName');
    const orderSurnameInput = document.querySelector('#user-surname-order') || document.querySelector('#userLastName');
    const orderPhoneInput = document.querySelector('#user-phone-order') || document.querySelector('#userPhone');
    const orderEmailInput = document.querySelector('#user-email-order') || document.querySelector('#userEmail');
    const orderRegionInput = document.querySelector('#region');
    const orderCityInput = document.querySelector('#city');
    const orderStreetInput = document.querySelector('#street');
    const orderModalSuccess = document.querySelector('#modal-success-order');
    const orderModalCloseBtn = document.querySelector('#modal-close-btn-order');

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearError(orderNameInput);
            clearError(orderPhoneInput);
            clearError(orderEmailInput);

            if (!checkName(orderNameInput) || !checkPhone(orderPhoneInput) || !checkEmail(orderEmailInput)) return;

            const selectedContactMethod = document.querySelector('input[name="contact_method"]:checked')?.value || 'Не обрано';
            const currentTariffTitle = document.querySelector('#tar-title')?.textContent || 'Не обрано';
            const currentTariffPrice = document.querySelector('.tar-price')?.textContent || '0';

            const formData = {
                name: orderNameInput ? orderNameInput.value.trim() : '',
                surname: orderSurnameInput ? orderSurnameInput.value.trim() : '',
                phone: orderPhoneInput ? orderPhoneInput.value.trim() : '',
                email: orderEmailInput ? orderEmailInput.value.trim() : '',
                contactMethod: selectedContactMethod,
                region: orderRegionInput ? orderRegionInput.value.trim() : '',
                city: orderCityInput ? orderCityInput.value.trim() : '',
                street: orderStreetInput ? orderStreetInput.value.trim() : '',
                tarTitle: currentTariffTitle,
                tarPrice: currentTariffPrice
            };

            sendToTelegram(formData, buildOrderMessage, AIRNET_MANAGER, AIRNET_BOT_CHAT, ORDER_TOPIC_ID);
            orderForm.reset();
            
            if (orderModalSuccess) orderModalSuccess.classList.add('active');
        });
    }

    if (orderModalCloseBtn && orderModalSuccess) {
        orderModalCloseBtn.addEventListener('click', () => {
            orderModalSuccess.classList.remove('active');
        });
    }
}
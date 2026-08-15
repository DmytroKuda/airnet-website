import { initCabinetPage, updateHeaderAuthButton, initLogoutEvent } from './cabinet.js';
import { initNews } from './news.js';
import { initTariffs } from './tariffs.js';
import { initTelegramForms } from './telegram.js';
import { initAuth } from './auth.js';

export function setElementValue(selector, text) {
    const elem = document.querySelector(selector);
    if (!elem) return;
    if (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA') {
        elem.value = text;
    } else {
        elem.textContent = text;
    }
}

async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) return;
        const htmlContent = await response.text();
        const container = document.getElementById(elementId);
        if (container) {
            container.innerHTML = htmlContent;
            
            if (elementId === "header-placeholder") {
                updateHeaderAuthButton();
                initLogoutEvent();
                updateThemeIcon();
            }
        }
    } catch (error) {
        console.error(`Помилка завантаження компонента ${filePath}:`, error);
    }
}

function initCabinetTabs() {
    const tabButtonsCbnt = document.querySelectorAll('.tab-btn');
    const tabPanesCbnt = document.querySelectorAll('.tab-pane');

    tabButtonsCbnt.forEach(button => {
        button.addEventListener('click', () => {
            tabButtonsCbnt.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const targetTabId = button.getAttribute('data-tab');
            tabPanesCbnt.forEach(pane => {
                if (pane.id === targetTabId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });
}

export function initToCopy(btnSelector, elementSelector) {
    const copyBtn = document.querySelector(btnSelector);
    const element = document.querySelector(elementSelector);
    const toast = document.querySelector('.copy-toast');
    
    if (copyBtn && element) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = element.textContent.trim();
            
            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                if (toast) {
                    toast.classList.add('active');
                    setTimeout(() => {
                        toast.classList.remove('active');
                    }, 2000);
                }
            });
        });
    }
}

function updateThemeIcon() {
    const icon = document.querySelector('#theme-toggle .theme-icon');
    if (!icon) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    icon.textContent = isDark ? '☀️' : '🌙';
}

export function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    
    updateThemeIcon();

    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('#theme-toggle');
        if (!toggleBtn) return;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
        
        updateThemeIcon();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    
    loadComponent("header-placeholder", "components/header.html");
    loadComponent("footer-placeholder", "components/footer.html");
    
    initNews();
    initTariffs(setElementValue);
    initTelegramForms();
    initAuth();
    initCabinetPage();
});
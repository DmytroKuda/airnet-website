export function initTariffs(setElementValue) {
    const flatGroup = document.querySelector('#flatTariffs');
    const houseGroup = document.querySelector('#houseTariffs');

    async function loadTariffsAndSetOrder() {
        let tarData = [];
        try {
            const response = await fetch('json/tariffs.json');
            if (response.ok) {
                tarData = await response.json();
            }
        } catch (error) {
            console.error('Помилка завантаження тарифів:', error);
        }

        if (flatGroup && houseGroup) {
            if (!tarData || tarData.length === 0) {
                flatGroup.innerHTML = '<p class="no-tariffs">Немає</p>';
                houseGroup.innerHTML = '<p class="no-tariffs">Немає</p>';
            } else {
                let flatHTML = '';
                let houseHTML = '';
        
                tarData.forEach((el) => {
                    const featuresListHTML = el.features.map(feat => `<li>${feat}</li>`).join('');
                    const cardClass = el.isFeatured ? "tariff-card featured" : "tariff-card";
                    const badgeHTML = el.isFeatured ? `<div class="badge">${el.badgeText}</div>` : "";
        
                    const cardHTML = `
                        <div class="${cardClass}">
                            ${badgeHTML}
                            <h3>${el.title}</h3>
                            <p class="speed">${el.speed}</p>
                            <p class="price">${el.sum} <span>${el.currency}</span></p>
                            <ul>${featuresListHTML}</ul>
                            <a href="order.html?tariff=${el.id}" class="btn-order">Замовити</a>
                        </div>`;
        
                    if (el.category === "flat") flatHTML += cardHTML;
                    else if (el.category === "house") houseHTML += cardHTML;
                });
        
                flatGroup.innerHTML = flatHTML;
                houseGroup.innerHTML = houseHTML;
            }
        }

        const urlParams = new URLSearchParams(window.location.search);
        let selectedId = urlParams.get('tariff');

        if (selectedId) {
            localStorage.setItem('selectedTariffId', selectedId);
        } else {
            selectedId = localStorage.getItem('selectedTariffId');
        }

        const foundTariff = tarData.find(item => item.id === selectedId);

        const selectedCard = document.querySelector('#selected-tariff-card');
        if (selectedCard) {
            if (foundTariff) {
                const featuresHTML = foundTariff.features ? foundTariff.features.map(f => `<li>${f}</li>`).join('') : '';
                selectedCard.innerHTML = `
                    <h3>${foundTariff.title}</h3>
                    <p class="speed">${foundTariff.speed || ''}</p>
                    <p class="price">${foundTariff.sum} <span>${foundTariff.currency}</span></p>
                    <ul>${featuresHTML}</ul>
                    <span id="tar-title" style="display:none">${foundTariff.title}</span>
                    <span class="tar-price" style="display:none">${foundTariff.sum} ${foundTariff.currency}</span>
                `;
            } else {
                selectedCard.innerHTML = `<h3>Тариф не обрано</h3><p class="price">0 грн</p>`;
            }
        }

        if (foundTariff) {
            setElementValue('#tar-title', foundTariff.title);
            setElementValue('.tar-price', `${foundTariff.sum} ${foundTariff.currency}`);
        } else {
            setElementValue('#tar-title', 'Немає');
            setElementValue('.tar-price', '');
        }
    }

    loadTariffsAndSetOrder();
}
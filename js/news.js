import { getCurrentUserData } from './cabinet.js';

export function initNews() {
    const newsCont = document.querySelector('.news-scroll-container');
    if (!newsCont) return;

    async function loadNews() {
        try {
            const response = await fetch('json/news.json');
            if (!response.ok) throw new Error('Помилка завантаження файлу новин');
            
            const newsData = await response.json();
            const savedLikes = JSON.parse(localStorage.getItem('newsLikes')) || {};

            if (!newsData || newsData.length === 0) {
                newsCont.innerHTML = '<p class="no-news">Новин ще немає</p>';
                return;
            }

            const currentUser = getCurrentUserData();
            const userAccountId = currentUser ? (currentUser.account || currentUser.accountNumber) : null;

            let newsHTML = '';
            newsData.forEach((el) => {
                let likedByArray = savedLikes[el.id];
                if (!Array.isArray(likedByArray)) likedByArray = [];

                const totalLikes = likedByArray.length;
                const isLikedByMe = userAccountId && likedByArray.includes(userAccountId);
                const activeClass = isLikedByMe ? 'liked' : '';

                if (el.type === "tiktok") {
                    newsHTML += `
                    <article class="news-card tiktok-card" data-id="${el.id}">
                        <button class="like-btn ${activeClass}">${el.emj} <span class="like-count">${totalLikes}</span></button>
                        <iframe src="${el.tiktokUrl}" allow="fullscreen" class="tiktok-iframe"></iframe>
                    </article>`;
                } else {
                    newsHTML += `
                    <article class="news-card" data-id="${el.id}">
                        <button class="like-btn ${activeClass}">${el.emj} <span class="like-count">${totalLikes}</span></button>
                        <div class="news-content">
                            <span class="news-date">${el.date}</span>
                            <h3>${el.title}</h3>
                            <p>${el.info}</p>
                        </div>
                    </article>`;
                }
            });
                    
            newsCont.innerHTML = newsHTML;

            const likeBtns = newsCont.querySelectorAll('.like-btn');
            likeBtns.forEach((btn) => {
                btn.addEventListener("click", function() {
                    const activeUser = getCurrentUserData();
                    if (!activeUser) {
                        alert('Будь ласка, увійдіть у кабінет, щоб ставити лайки!');
                        return;
                    }

                    const accountId = activeUser.account || activeUser.accountNumber;
                    const card = btn.closest('.news-card');
                    const newsId = card.getAttribute('data-id');
                    const countSpan = btn.querySelector('.like-count');
                    
                    const currentSavedLikes = JSON.parse(localStorage.getItem('newsLikes')) || {};
                    let likedBy = currentSavedLikes[newsId];
                    if (!Array.isArray(likedBy)) likedBy = [];

                    if (likedBy.includes(accountId)) {
                        likedBy = likedBy.filter(id => id !== accountId);
                        btn.classList.remove('liked');
                    } else {
                        likedBy.push(accountId);
                        btn.classList.add('liked');

                        const originalBg = btn.style.backgroundColor;
                        btn.style.backgroundColor = '#e63946';
                        setTimeout(() => {
                            btn.style.backgroundColor = originalBg;
                        }, 150);
                    }

                    currentSavedLikes[newsId] = likedBy;
                    localStorage.setItem('newsLikes', JSON.stringify(currentSavedLikes));

                    countSpan.textContent = likedBy.length;
                });
            });

        } catch (error) {
            console.error(error);
            newsCont.innerHTML = '<p class="no-news">Новин ще немає</p>';
        }
    }

    loadNews();
}
// --- 1. ФОН (Тусклый и ненавязчивый) ---
if (typeof particlesJS !== 'undefined') {
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 40, "density": { "enable": true, "value_area": 1000 } }, // Меньше частиц
            "color": { "value": "#00f3ff" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.15, "random": true }, // Почти прозрачные
            "size": { "value": 2, "random": true },
            "line_linked": { "enable": true, "distance": 120, "color": "#00f3ff", "opacity": 0.05, "width": 1 }, // Еле заметные линии
            "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "straight": false, "out_mode": "out" }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } },
            "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.2 } } }
        },
        "retina_detect": true
    });
}

// --- 2. ПЕРЕМЕННЫЕ ---
const marketGrid = document.getElementById('market-grid');
const itemForm = document.getElementById('item-form');
const fileInput = document.getElementById('item-image');
const fileNameDisplay = document.getElementById('file-name');
const chatModal = document.getElementById('chat-modal');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const closeChatBtn = document.getElementById('close-chat');

let items = JSON.parse(localStorage.getItem('marketItems')) || [];
let currentImageBase64 = "";
let activeChatId = null;
let editingIndex = -1; // Для редактирования

// --- 3. ЗАГРУЗКА ФОТО ---
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
        const reader = new FileReader();
        reader.onload = function(event) { currentImageBase64 = event.target.result; };
        reader.readAsDataURL(file);
    }
});

// --- 4. ОТРИСОВКА ТОВАРОВ ---
function renderMarket() {
    marketGrid.innerHTML = '';
    if (items.length === 0) {
        marketGrid.innerHTML = '<div class="empty-msg glass-panel" style="grid-column:1/-1; padding:20px; text-align:center;">Товаров пока нет.</div>';
        return;
    }
    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        const imgSrc = item.image || 'https://placehold.co/300x200?text=No+Image';
        
        // Контакты
        let contactsHTML = '';
        if (item.phone) {
            contactsHTML += `<button class="buy-btn" onclick="showPhone(${index})" id="phone-btn-${index}">📞 Показать телефон</button>`;
        }
        if (item.vk) contactsHTML += `<a href="${item.vk}" target="_blank" class="buy-btn" style="display:block; margin-top:5px; text-decoration:none;">ВКонтакте</a>`;
        if (item.tg) contactsHTML += `<a href="${item.tg}" target="_blank" class="buy-btn" style="display:block; margin-top:5px; text-decoration:none;">Telegram</a>`;

        card.innerHTML = `
            <img src="${imgSrc}" class="item-image">
            <div class="item-info">
                <h3>${item.name}</h3>
                <div class="price">${item.price} ₽</div>
                <div class="desc">${item.desc}</div>
                <div style="display:flex; gap:5px; margin-top:10px;">
                    <button class="buy-btn" onclick="openChat(${index})">💬 Написать</button>
                    <button class="buy-btn" style="border-color:#ff0; color:#ff0;" onclick="editItem(${index})">✏️</button>
                    <button class="buy-btn" style="border-color:#f00; color:#f00;" onclick="deleteItem(${index})">🗑️</button>
                </div>
                <div style="margin-top:10px;">${contactsHTML}</div>
            </div>
        `;
        marketGrid.appendChild(card);
    });
}

// --- 5. ПОКАЗ ТЕЛЕФОНА ---
window.showPhone = (index) => {
    const item = items[index];
    const btn = document.getElementById(`phone-btn-${index}`);
    if (btn && item.phone) {
        btn.innerHTML = `<a href="tel:${item.phone}" style="color:inherit; text-decoration:none;">${item.phone}</a>`;
        btn.style.borderColor = '#0f0'; btn.style.color = '#0f0';
    }
};

// --- 6. УДАЛЕНИЕ / РЕДАКТИРОВАНИЕ ---
window.deleteItem = (index) => {
    if (confirm('Удалить объявление?')) {
        items.splice(index, 1);
        localStorage.setItem('marketItems', JSON.stringify(items));
        renderMarket();
    }
};

window.editItem = (index) => {
    editingIndex = index;
    const item = items[index];
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-desc').value = item.desc;
    document.getElementById('item-phone').value = item.phone || '';
    document.getElementById('item-vk').value = item.vk || '';
    document.getElementById('item-tg').value = item.tg || '';
    
    const submitBtn = itemForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Сохранить изменения';
    submitBtn.style.background = '#ff0'; submitBtn.style.color = '#000';
    
    document.getElementById('add-item').scrollIntoView({ behavior: 'smooth' });
};

// --- 7. СОХРАНЕНИЕ ---
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value;
    const price = document.getElementById('item-price').value;
    const desc = document.getElementById('item-desc').value;
    const phone = document.getElementById('item-phone').value;
    const vk = document.getElementById('item-vk').value;
    const tg = document.getElementById('item-tg').value;

    const newItem = { name, price, desc, phone, vk, tg, image: currentImageBase64 };

    if (editingIndex > -1) {
        if (!currentImageBase64) newItem.image = items[editingIndex].image;
        items[editingIndex] = newItem;
        editingIndex = -1;
        const submitBtn = itemForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Опубликовать';
        submitBtn.style.background = ''; submitBtn.style.color = '';
    } else {
        items.push(newItem);
    }
    
    localStorage.setItem('marketItems', JSON.stringify(items));
    renderMarket();
    
    itemForm.reset();
    currentImageBase64 = "";
    fileNameDisplay.textContent = "Файл не выбран";
    alert('Сохранено!');
});

// --- 8. ЧАТ ---
window.openChat = (index) => { activeChatId = index; chatModal.classList.remove('hidden'); renderChat(); };
closeChatBtn.addEventListener('click', () => { chatModal.classList.add('hidden'); activeChatId = null; });

function renderChat() {
    chatMessages.innerHTML = '';
    const allMessages = JSON.parse(localStorage.getItem('allChats')) || {};
    if (!allMessages[activeChatId]) allMessages[activeChatId] = [];

    allMessages[activeChatId].forEach(msg => {
        const div = document.createElement('div');
        div.className = `msg ${msg.sender === 'me' ? 'self' : 'other'}`;
        div.textContent = msg.text;
        chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const text = chatInput.value.trim();
    if (text === '' || activeChatId === null) return;

    const allMessages = JSON.parse(localStorage.getItem('allChats')) || {};
    if (!allMessages[activeChatId]) allMessages[activeChatId] = [];

    allMessages[activeChatId].push({ text: text, sender: 'me' });
    localStorage.setItem('allChats', JSON.stringify(allMessages));
    
    chatInput.value = '';
    renderChat();

    setTimeout(() => {
        if (activeChatId === null) return;
        const updatedMessages = JSON.parse(localStorage.getItem('allChats'));
        updatedMessages[activeChatId].push({ text: "Здравствуйте! Да, товар в наличии.", sender: 'seller' });
        localStorage.setItem('allChats', JSON.stringify(updatedMessages));
        renderChat();
    }, 1500);
}

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

renderMarket();
document.getElementById('applyButton').addEventListener('click', function() {
    const formContainer = document.getElementById('insuranceForm');
    const heroSection = document.getElementById('heroSection');

    heroSection.style.transition = 'opacity 0.5s';
    heroSection.style.opacity = '0';

    setTimeout(() => {
        heroSection.style.display = 'none';
        formContainer.style.display = 'block'; // 顯示表單區域
    }, 500);
});

document.getElementById('vehicleForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 防止表單提交
    const vehicleInfoForm = document.getElementById('vehicleInfoForm');
    const insuranceTypeForm = document.getElementById('insuranceTypeForm');

    vehicleInfoForm.classList.add('hidden');
    insuranceTypeForm.classList.remove('hidden'); // 顯示保險類型表單
});

const insuranceCards = document.querySelectorAll('.insurance-card');
const priceInput = document.getElementById('priceInput');

insuranceCards.forEach(card => {
    card.querySelector('.select-insurance').addEventListener('click', function() {
        const type = card.getAttribute('data-type');
        alert(`You have selected ${type} insurance.`);

        if (type === 'comprehensive') {
            priceInput.classList.remove('hidden'); // 顯示價格輸入框
        } else {
            priceInput.classList.add('hidden'); // 隱藏價格輸入框
        }

        document.getElementById('insuranceTypeForm').classList.add('hidden'); // 隱藏保險類型表單
        document.getElementById('driverInfoForm').classList.remove('hidden'); // 顯示駕駛者信息表單
    });
});

// 提交駕駛者信息並顯示聯絡資料表單
document.getElementById('nextToContactInfo').addEventListener('click', function(event) {
    event.preventDefault(); // 防止按鈕默認行為
    document.getElementById('driverInfoForm').classList.add('hidden'); // 隱藏駕駛者信息表單
    document.getElementById('contactInfoForm').classList.remove('hidden'); // 顯示聯絡資料表單
});

// 提交聯絡信息
document.getElementById('submitContactInfo').addEventListener('click', function() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    if (name && phone && email) {
        document.getElementById('contactInfoForm').classList.add('hidden'); // 隱藏聯絡資料表單
        document.getElementById('confirmationMessage').classList.remove('hidden'); // 顯示確認信息
    } else {
        alert('請填寫所有必填欄位！');
    }
});

// 頁面加載時隱藏表單
window.onload = function() {
    document.getElementById('insuranceForm').style.display = 'none'; // 開始時隱藏表單

    const driverAgeSelect = document.getElementById('driverAge');
    for (let age = 18; age <= 80; age++) {
        const option = document.createElement('option');
        option.value = (age === 80) ? '80+' : age.toString();
        option.textContent = option.value; // 顯示年齡
        driverAgeSelect.appendChild(option);
    }
};

window.onload = function() {
    document.getElementById('insuranceForm').style.display = 'none'; // 開始時隱藏表單

    const driverAgeSelect = document.getElementById('driverAge');
    // 生成年齡選項
    for (let age = 18; age <= 80; age++) {
        const option = document.createElement('option');
        option.value = (age === 80) ? '80+' : age.toString();
        option.textContent = option.value; // 顯示年齡
        driverAgeSelect.appendChild(option);
    }
};
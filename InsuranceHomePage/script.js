document.getElementById('applyButton').addEventListener('click', function() {
    const formContainer = document.getElementById('insuranceForm');
    const heroSection = document.getElementById('heroSection');
    
    // 動畫轉場
    heroSection.style.transition = 'opacity 0.5s';
    heroSection.style.opacity = '0';

    setTimeout(() => {
        heroSection.style.display = 'none';
        formContainer.classList.remove('hidden'); // 移除 hidden 類
        formContainer.style.display = 'block'; // 顯示表單區域
    }, 500); // 等待動畫完成
});

// 表單提交事件
document.getElementById('vehicleForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // 在這裡處理表單提交，例如發送到伺服器
    alert('We have received your application!', 'Our staff will contact you soon.');
});

window.onload = function() {
    document.getElementById('insuranceForm').classList.add('hidden');
};
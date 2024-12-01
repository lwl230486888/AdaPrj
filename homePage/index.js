// 保留原有嘅scroll效果代碼
window.addEventListener('scroll', function() {
    var scrollPosition = window.pageYOffset;
    var windowHeight = window.innerHeight;
    var fstCar = document.getElementById('fstCar');
    var secCar = document.getElementById('secCar');
    var thirdCar = document.getElementById('thirdCar');

    if (scrollPosition > windowHeight * 1.5) {
        fstCar.style.opacity = '0';
        secCar.style.opacity = '0';
        thirdCar.style.opacity = '1';
    } else if (scrollPosition > windowHeight / 3) {
        fstCar.style.opacity = '0';
        secCar.style.opacity = '1';
        thirdCar.style.opacity = '0';
    } else {
        fstCar.style.opacity = '1';
        secCar.style.opacity = '0';
        thirdCar.style.opacity = '0';
    }
});

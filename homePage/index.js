window.addEventListener('scroll', function() {
    var scrollPosition = window.pageYOffset;
    var windowHeight = window.innerHeight;
    var fstCar = document.getElementById('fstCar');
    var secCar = document.getElementById('secCar');

    if (scrollPosition > windowHeight / 2) {
        fstCar.style.opacity = '0';
        secCar.style.opacity = '1';
    } else {
        fstCar.style.opacity = '1';
        secCar.style.opacity = '0';
    }
});
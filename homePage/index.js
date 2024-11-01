window.addEventListener('scroll', function() {
    var scrollPosition = window.pageYOffset;
    var windowHeight = window.innerHeight;
    var fstCar = document.getElementById('fstCar');
    var secCar = document.getElementById('secCar');
    var thirdCar = document.getElementById('thirdCar'); // 修正為 "thirdCar"

    if (scrollPosition > windowHeight * 1.5) { // 滾動超過1.5倍視口高度時顯示第三個畫面
        fstCar.style.opacity = '0';
        secCar.style.opacity = '0';
        thirdCar.style.opacity = '1';
    } else if (scrollPosition > windowHeight / 3) { // 滾動超過一半時顯示第二個畫面
        fstCar.style.opacity = '0';
        secCar.style.opacity = '1';
        thirdCar.style.opacity = '0';
    } else {
        fstCar.style.opacity = '1';
        secCar.style.opacity = '0';
        thirdCar.style.opacity = '0';
    }
});

window.onload = function() {
    const user = localStorage.getItem('user');
    if (user) {
        // Redirect based on user role if user is logged in
        const parsedUser = JSON.parse(user);
        if (parsedUser.role === 'sales') {
            window.location.href = '../DashBordPage/SalesDashBord.html';
        } else {
            window.location.href = '../DashBordPage/CustomerDashBord.html';
        }
    }
};
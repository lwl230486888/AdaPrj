// auth.js
function checkLoginStatus() {
    return fetch('../check_login_status.php')
        .then(response => response.json())
        .then(data => {
            const userIcon = document.querySelector('.nav-icon a');
            const iconElement = userIcon.querySelector('i');
            
            if (data.isLoggedIn) {
                iconElement.className = 'fas fa-user-check';
                userIcon.title = `Welcome, ${data.userName}`;
                
                if (data.userType === 'staff') {
                    userIcon.href = '../DashBordPage/insdashboard.html';
                } else {
                    userIcon.href = '../DashBordPage/dashboard.html';
                }
                
                return {
                    isLoggedIn: true,
                    userData: data
                };
            } else {
                iconElement.className = 'fas fa-user';
                userIcon.title = 'Login';
                userIcon.href = '../loginPage/loginPage.html';
                
                return {
                    isLoggedIn: false,
                    userData: null
                };
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
            return {
                isLoggedIn: false,
                userData: null,
                error: error
            };
        });
}

// 定期檢查登入狀態
function initAuthCheck() {
    checkLoginStatus();
    setInterval(checkLoginStatus, 300000); // 每5分鐘檢查一次
}
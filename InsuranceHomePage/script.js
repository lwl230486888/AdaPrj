window.onload = function() {
    console.log('Initial login status:', window.userLoggedIn);
    
    if (typeof window.userLoggedIn !== 'undefined' && window.userLoggedIn === true) {
        console.log('User is logged in via PHP session');
        initializeForm(window.userData);
    } else {
        fetch('../check_login_status.php', {  // 修改路徑
            credentials: 'include',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            console.log('Login check response:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Login check data:', data);
            if (data.isLoggedIn) {
                initializeForm(data);
            } else {
                alert('Please login to apply for insurance.');
                window.location.href = '../loginPage/loginPage.html';
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
            alert('Error checking login status. Please try again.');
        });
    }
};

function initializeForm(userData) {
    console.log('Initializing form with user data:', userData);
    
    const insuranceForm = document.getElementById("insuranceForm");
    insuranceForm.style.display = "none";

    const driverAgeSelect = document.getElementById("driverAge");
    if (driverAgeSelect) {
        for (let age = 18; age <= 80; age++) {
            const option = document.createElement("option");
            option.value = age === 80 ? "80+" : age.toString();
            option.textContent = option.value;
            driverAgeSelect.appendChild(option);
        }
    }

    if (userData) {
        if (document.getElementById("name")) {
            document.getElementById("name").value = userData.userName || '';
        }
        if (document.getElementById("email")) {
            document.getElementById("email").value = userData.email || '';
        }
    }

    setupFormEvents();
}

function setupFormEvents() {
    const applyButton = document.getElementById("applyButton");
    if (applyButton) {
        applyButton.addEventListener("click", function() {
            const heroSection = document.getElementById("heroSection");
            if (heroSection) {
                heroSection.style.transition = "opacity 0.5s";
                heroSection.style.opacity = "0";

                setTimeout(() => {
                    heroSection.style.display = "none";
                    const insuranceForm = document.getElementById("insuranceForm");
                    insuranceForm.style.display = "block";
                    const vehicleInfoForm = document.getElementById("vehicleInfoForm");
                    if (vehicleInfoForm) {
                        vehicleInfoForm.classList.remove("hidden");
                    }
                }, 500);
            }
        });
    }

    const vehicleForm = document.getElementById("vehicleForm");
    if (vehicleForm) {
        vehicleForm.addEventListener("submit", function(event) {
            event.preventDefault();
            document.getElementById("vehicleInfoForm").classList.add("hidden");
            document.getElementById("driverInfoForm").classList.remove("hidden");
        });
    }

    const driverForm = document.getElementById("driverForm");
    if (driverForm) {
        driverForm.addEventListener("submit", function(event) {
            event.preventDefault();
            document.getElementById("driverInfoForm").classList.add("hidden");
            document.getElementById("contactInfoForm").classList.remove("hidden");
        });
    }

    const submitContactInfo = document.getElementById("submitContactInfo");
    if (submitContactInfo) {
        submitContactInfo.addEventListener("click", function(event) {
            event.preventDefault();
            submitForm();
        });
    }
}

function submitForm() {
    const formData = {
        vehicleYear: document.getElementById("vehicleYear").value,
        cc: document.getElementById("cc").value,
        vehicleModel: document.getElementById("vehicleModel").value,
        driverAge: document.getElementById("driverAge").value,
        driverOccupation: document.getElementById("driverOccupation").value,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value
    };

    if (validateFormData(formData)) {
        submitInsuranceRequest(formData);
    }
}

function validateFormData(formData) {
    for (let key in formData) {
        if (!formData[key]) {
            alert('Please fill in all required fields!');
            return false;
        }
    }
    return true;
}

function submitInsuranceRequest(formData) {
    fetch('submitData.php', {  // 修改路徑
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("contactInfoForm").classList.add("hidden");
            document.getElementById("confirmationMessage").classList.remove("hidden");
        } else {
            if (data.message === "Please login first") {
                alert('Your session has expired. Please login again.');
                window.location.href = '../loginPage/loginPage.html';
            } else {
                alert(data.message);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to submit application. Please try again later.");
    });
}

function checkLoginStatus() {
    return fetch('check_login_status.php', {  // 修改這裡
        credentials: 'include',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Login status response:', data);
        return {
            isLoggedIn: data.isLoggedIn,
            userData: {
                name: data.userName,
                email: data.email,
                userId: data.userId,
                userType: data.userType
            }
        };
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

function checkLoginAndRedirect() {
    fetch('../check_login_status.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.isLoggedIn) {
            window.location.href = '../loginPage/loginPage.html';
        }
    })
    .catch(error => {
        console.error('Error checking login status:', error);
    });
}

// 修改提交成功後的行為
function submitInsuranceRequest(formData) {
    fetch('submitData.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("contactInfoForm").classList.add("hidden");
            document.getElementById("confirmationMessage").classList.remove("hidden");
            
            // 添加延遲跳轉
            setTimeout(() => {
                goToDashboard();  // 使用上面定義的導航函數
            }, 3000);  // 3秒後跳轉
        } else {
            if (data.message === "Please login first") {
                alert('Your session has expired. Please login again.');
                window.location.href = '../loginPage/loginPage.html';
            } else {
                alert(data.message);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to submit application. Please try again later.");
    });
}
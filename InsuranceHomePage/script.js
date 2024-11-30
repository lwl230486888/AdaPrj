window.onload = function () {
    // 初始时隐藏整个保险表单区域
    const insuranceForm = document.getElementById("insuranceForm");
    insuranceForm.style.display = "none";

    // 生成年龄选项
    const driverAgeSelect = document.getElementById("driverAge");
    for (let age = 18; age <= 80; age++) {
        const option = document.createElement("option");
        option.value = age === 80 ? "80+" : age.toString();
        option.textContent = option.value; // 显示年龄
        driverAgeSelect.appendChild(option);
    }

    // 事件绑定 - 申请保险按钮
    document.getElementById("applyButton").addEventListener("click", function () {
        const heroSection = document.getElementById("heroSection");

        // 隐藏英雄部分并显示表单
        heroSection.style.transition = "opacity 0.5s";
        heroSection.style.opacity = "0";

        setTimeout(() => {
            heroSection.style.display = "none";
            insuranceForm.style.display = "block"; // 显示表单区域
            document.getElementById("vehicleInfoForm").classList.remove("hidden"); // 显示车辆信息表单
        }, 500);
    });

    // 表单提交事件 - 车辆信息表单
    document.getElementById("vehicleForm").addEventListener("submit", function (event) {
        event.preventDefault(); // 防止表单提交
        document.getElementById("vehicleInfoForm").classList.add("hidden"); // 隐藏车辆信息表单
        document.getElementById("driverInfoForm").classList.remove("hidden"); // 显示驾驶者信息表单
    });

    // 表单提交事件 - 驾驶者信息表单
    document.getElementById("driverForm").addEventListener("submit", function (event) {
        event.preventDefault(); // 防止表单提交
        document.getElementById("driverInfoForm").classList.add("hidden"); // 隐藏驾驶者信息表单
        document.getElementById("contactInfoForm").classList.remove("hidden"); // 显示联系资料表单
    });

    // 提交联系信息
    document.getElementById("submitContactInfo").addEventListener("click", function (event) {
        event.preventDefault(); // 防止表单的默认提交行为

        // 收集客户信息
        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const driverAge = document.getElementById("driverAge").value;
        const driverOccupation = document.getElementById("driverOccupation").value;
        const vehicleYear = document.getElementById("vehicleYear").value;
        const cc = document.getElementById("cc").value;
        const vehicleModel = document.getElementById("vehicleModel").value;
        const customerId = localStorage.getItem('customerId'); // 获取客户ID
        
        if (name && phone && email && driverAge && driverOccupation && vehicleYear && cc && vehicleModel) {
            // 准备要发送的数据
            const data = {
                name: name,
                phone: phone,
                email: email,
                driverAge: driverAge,
                driverOccupation: driverOccupation,
                vehicleYear: vehicleYear,
                cc: cc,
                vehicleModel: vehicleModel,
                customerId: customerId // 包含客户ID
            };

            // 发送数据到服务器
            fetch('submitData.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                if (data.success) {
                    // 隐藏联系资料表单并显示确认信息
                    document.getElementById("contactInfoForm").classList.add("hidden");
                    document.getElementById("confirmationMessage").classList.remove("hidden");
                } else {
                    alert(data.message); // 显示错误信息
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert("提交失败，请稍后再试。");
            });
        } else {
            alert("请填写所有必填字段！");
        }
    });

    // 检查用户登录状态
    const user = localStorage.getItem('user');
    if (user) {
        const parsedUser = JSON.parse(user);
        // 假设在用户登录后获取到的用户信息
        const userInfo = {
            customerId: parsedUser.customerId || 'defaultCustomerId' // 从解析的用户数据中获取客户ID
        };
        
        // 存储客户ID
        localStorage.setItem('customerId', userInfo.customerId); 
        document.getElementById('customerId').value = userInfo.customerId; // 设置隐藏输入

        // 根据角色重定向
        if (parsedUser.role === 'sales') {
            window.location.href = '../DashBordPage/SalesDashBord.html';
        } else {
            window.location.href = '../DashBordPage/CustomerDashBord.html';
        }
    }
};
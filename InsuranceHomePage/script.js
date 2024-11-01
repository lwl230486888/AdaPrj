window.onload = function () {
  // 初始時隱藏整個保險表單區域
  const insuranceForm = document.getElementById("insuranceForm");
  insuranceForm.style.display = "none";

  // 生成年齡選項
  const driverAgeSelect = document.getElementById("driverAge");
  for (let age = 18; age <= 80; age++) {
      const option = document.createElement("option");
      option.value = age === 80 ? "80+" : age.toString();
      option.textContent = option.value; // 顯示年齡
      driverAgeSelect.appendChild(option);
  }

  // 事件綁定 - 申請保險按鈕
  document.getElementById("applyButton").addEventListener("click", function () {
      const heroSection = document.getElementById("heroSection");

      // 隱藏英雄部分並顯示表單
      heroSection.style.transition = "opacity 0.5s";
      heroSection.style.opacity = "0";

      setTimeout(() => {
          heroSection.style.display = "none";
          insuranceForm.style.display = "block"; // 顯示表單區域
          document.getElementById("vehicleInfoForm").classList.remove("hidden"); // 顯示車輛信息表單
      }, 500);
  });

  // 車輛表單提交事件
  document.getElementById("vehicleForm").addEventListener("submit", function (event) {
      event.preventDefault(); // 防止表單提交
      document.getElementById("vehicleInfoForm").classList.add("hidden"); // 隱藏車輛信息表單
      document.getElementById("driverInfoForm").classList.remove("hidden"); // 顯示駕駛者信息表單
  });

  // 駕駛者表單提交事件
  document.getElementById("driverForm").addEventListener("submit", function (event) {
      event.preventDefault(); // 防止表單提交
      document.getElementById("driverInfoForm").classList.add("hidden"); // 隱藏駕駛者信息表單
      document.getElementById("contactInfoForm").classList.remove("hidden"); // 顯示聯絡資料表單
  });

  // 提交聯絡信息
  document.getElementById("submitContactInfo").addEventListener("click", function (event) {
      event.preventDefault(); // 防止表單的默認提交行為
      const name = document.getElementById("name").value;
      const phone = document.getElementById("phone").value;
      const email = document.getElementById("email").value;

      // 收集駕駛者信息
      const driverAge = document.getElementById("driverAge").value;
      const driverOccupation = document.getElementById("driverOccupation").value;

      // 收集車輛信息
      const vehicleYear = document.getElementById("vehicleYear").value;
      const cc = document.getElementById("cc").value;
      const vehicleModel = document.getElementById("vehicleModel").value;

      if (name && phone && email && driverAge && driverOccupation && vehicleYear && cc && vehicleModel) {
          // 隱藏聯絡資料表單
          document.getElementById("contactInfoForm").classList.add("hidden");
          // 顯示確認信息
          document.getElementById("confirmationMessage").classList.remove("hidden");

          // 準備要發送的資料
          const data = {
              name: name,
              phone: phone,
              email: email,
              driverAge: driverAge,
              driverOccupation: driverOccupation,
              vehicleYear: vehicleYear,
              cc: cc,
              vehicleModel: vehicleModel
          };

          // 發送資料到伺服器
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
              // 可以在這裡顯示成功訊息或進一步處理
              alert(data.message);
          })
          .catch((error) => {
              console.error('Error:', error);
          });
      } else {
          alert("請填寫所有必填欄位！");
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
};


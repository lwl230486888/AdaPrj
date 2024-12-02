<?php
// login.php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL));
    $input_password = $_POST['password'];

    error_log("Login attempt - Email: " . $email); // Debug log

    $conn = new mysqli("localhost", "root", "", "ins");
    $conn->set_charset("utf8mb4");

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // 檢查customer表
    $stmt = $conn->prepare("SELECT * FROM customer WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($input_password, $user['password'])) {
            // 統一 session 變數名稱
            $_SESSION['user_id'] = $user['customer_ID'];
            $_SESSION['role'] = 'customer';
            $_SESSION['email'] = $user['email'];
            $_SESSION['name'] = $user['firstName'] . ' ' . $user['lastName'];
            
            // Debug log
            error_log("Customer login successful - ID: " . $_SESSION['user_id']);
            error_log("Session data: " . print_r($_SESSION, true));

            // 轉頁前先確保 session 已經寫入
            session_write_close();
            
            echo "<script>
                localStorage.setItem('userRole', 'customer');
                alert('Login successful!'); 
                window.location.href = '../DashBordpage/dashboard.html';
            </script>";
            exit;
        }
    }

    // 如果唔係客戶，就檢查 staff 表
    $stmt = $conn->prepare("SELECT * FROM staff WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($input_password, $user['password'])) {
            $_SESSION['user_id'] = $user['userID'];
            $_SESSION['role'] = 'staff';
            $_SESSION['email'] = $user['email'];
            $_SESSION['name'] = $user['first_name'] . ' ' . $user['last_name'];
            $_SESSION['staff_type'] = $user['staffType'];
            
            // Debug log
            error_log("Staff login successful - ID: " . $_SESSION['user_id']);
            
            session_write_close();

            if ($user['staffType'] === 'insuranceS') {
                echo "<script>
                    localStorage.setItem('userRole', 'insuranceStaff');
                    window.location.href = '../DashBordpage/insdashboard.html';
                </script>";
            } else if ($user['staffType'] === 'CarStaff') {
                echo "<script>
                    localStorage.setItem('userRole', 'carStaff');
                    window.location.href = '../DashBordpage/cardashboard.html';
                </script>";
            }
            exit;
        }
    }

    // 登入失敗
    echo "<script>alert('Invalid email or password'); window.location.href = '../loginPage/loginPage.html';</script>";
    
    $stmt->close();
    $conn->close();
}
?>
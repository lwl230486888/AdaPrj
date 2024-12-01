<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ins";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // 清理輸入數據
    $email = trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL));
    $input_password = $_POST['password'];

    // Debug信息
    error_log("Login attempt - Email: " . $email);

    // 檢查staff表
    $stmt = $conn->prepare("SELECT * FROM staff WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($input_password, $user['password'])) {
            // 設置session
            $_SESSION['email'] = $user['email'];
            $_SESSION['userid'] = $user['userID'];
            $_SESSION['role'] = 'staff';
            $_SESSION['staff_type'] = $user['staffType'];
            $_SESSION['name'] = $user['first_name'] . ' ' . $user['last_name'];
            
            // Debug信息
            error_log("Staff login successful - Type: " . $user['staffType']);
            
            // 根據員工類型重定向
            if ($user['staffType'] === 'insuranceS') {
                echo "<script>
                    localStorage.setItem('userRole', 'insuranceStaff');
                    alert('Insurance Staff login successful!'); 
                    window.location.href = '../DashBordpage/insdashboard.html';
                </script>";
            } else if ($user['staffType'] === 'CarStaff') {
                echo "<script>
                    localStorage.setItem('userRole', 'carStaff');
                    alert('Car Staff login successful!'); 
                    window.location.href = '../DashBordpage/cardashboard.html';
                </script>";
            } else {
                // 未知的員工類型
                error_log("Unknown staff type: " . $user['staffType']);
                echo "<script>alert('Invalid staff type'); window.location.href = 'loginPage.html';</script>";
            }
            exit;
        }
    }

    // 檢查customer表
    $stmt = $conn->prepare("SELECT * FROM customer WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($input_password, $user['password'])) {
            $_SESSION['email'] = $user['email'];
            $_SESSION['userid'] = $user['customer_ID'];
            $_SESSION['role'] = 'customer';
            $_SESSION['name'] = $user['firstName'] . ' ' . $user['lastName'];
            
            echo "<script>
                localStorage.setItem('userRole', 'customer');
                alert('Customer login successful!'); 
                window.location.href = '../DashBordpage/dashboard.html';
            </script>";
            exit;
        }
    }

    // 登入失敗
    error_log("Login failed for email: " . $email);
    echo "<script>alert('Invalid email or password'); window.location.href = 'login/loginPage.html';</script>";
    
    $stmt->close();
    $conn->close();
} else {
    // 非POST請求
    header("Location: loginPage.html");
    exit;
}
?>
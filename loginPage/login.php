<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ins";

// 登入嘗試次數限制配置
$MAX_LOGIN_ATTEMPTS = 3;
$LOGIN_TIMEOUT = 1800; // 30分鐘

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 檢查是否被鎖定
function isLocked() {
    if (!isset($_SESSION['login_attempts']) || !isset($_SESSION['last_login_attempt'])) {
        return false;
    }
    
    global $MAX_LOGIN_ATTEMPTS, $LOGIN_TIMEOUT;
    $time_passed = time() - $_SESSION['last_login_attempt'];
    
    if ($_SESSION['login_attempts'] >= $MAX_LOGIN_ATTEMPTS && $time_passed < $LOGIN_TIMEOUT) {
        return true;
    }
    
    if ($time_passed >= $LOGIN_TIMEOUT) {
        $_SESSION['login_attempts'] = 0;
        return false;
    }
    
    return false;
}

// 記錄登入嘗試
function recordLoginAttempt($success) {
    if ($success) {
        $_SESSION['login_attempts'] = 0;
        unset($_SESSION['last_login_attempt']);
    } else {
        if (!isset($_SESSION['login_attempts'])) {
            $_SESSION['login_attempts'] = 0;
        }
        $_SESSION['login_attempts']++;
        $_SESSION['last_login_attempt'] = time();
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // 檢查是否被鎖定
    if (isLocked()) {
        $remaining_time = $LOGIN_TIMEOUT - (time() - $_SESSION['last_login_attempt']);
        echo "<script>alert('Too many failed attempts. Please try again after " . 
             ceil($remaining_time/60) . " minutes.'); window.location.href = 'loginPage.html';</script>";
        exit;
    }

    $email = trim($_POST['email']);
    $input_password = $_POST['password'];

    if (empty($email) || empty($input_password)) {
        echo "<script>alert('Please enter both email and password.'); window.location.href = 'loginPage.html';</script>";
        exit;
    }

    // 檢查customer表
    $stmt = $conn->prepare("SELECT * FROM customer WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($input_password, $user['password'])) {
            // 登入成功
            recordLoginAttempt(true);
            $_SESSION['email'] = $user['email'];
            $_SESSION['userid'] = $user['customer_ID'];
            $_SESSION['role'] = 'customer';
            $_SESSION['name'] = $user['firstName'] . ' ' . $user['lastName'];
            
            // 設置安全的cookie
            setcookie("loggedin", "true", [
                'expires' => time() + 86400,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            
            echo "<script>alert('Login successful!'); window.location.href = '../homePage/homePage.html';</script>";
            exit;
        }
    }

    // 檢查staff表
    $stmt = $conn->prepare("SELECT * FROM staff WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($input_password, $user['password'])) {
            // 登入成功
            recordLoginAttempt(true);
            $_SESSION['email'] = $user['email'];
            $_SESSION['userid'] = $user['userID'];
            $_SESSION['role'] = 'staff';
            $_SESSION['name'] = $user['first_name'] . ' ' . $user['last_name'];
            
            // 設置安全的cookie
            setcookie("loggedin", "true", [
                'expires' => time() + 86400,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            
            echo "<script>alert('Staff login successful!'); window.location.href = '../homePage/homePage.html';</script>";
            exit;
        }
    }

    // 登入失敗
    recordLoginAttempt(false);
    echo "<script>alert('Invalid email or password'); window.location.href = 'loginPage.html';</script>";
    
    $stmt->close();
    $conn->close();
} else {
    header("Location: loginPage.html");
    exit;
}
// 登入成功後
session_regenerate_id(true); // 重新生成 session id
$_SESSION['last_activity'] = time(); // 記錄最後活動時間
?>
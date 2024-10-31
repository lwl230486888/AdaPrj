<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

// 数据库连接
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ins";

$conn = new mysqli($servername, $username, $password, $dbname);

// 检查连接
if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]);
    exit;
}

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // 获取表单数据
    $email = $_POST['email'];
    $password = $_POST['password'];

    // 防止SQL注入
    $email = $conn->real_escape_string($email);

    // 首先查找 staff 表
    $sql = "SELECT id, first_name, last_name, email, password, 'staff' AS role FROM staff WHERE email = '$email'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        // 获取用户数据
        $user = $result->fetch_assoc();

        // 验证密码
        if (password_verify($password, $user['password'])) {
            // 登录成功
            $_SESSION['email'] = $user['email'];
            $_SESSION['first_name'] = $user['first_name'];
            $_SESSION['last_name'] = $user['last_name'];
            $_SESSION['role'] = $user['role'];

            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'user' => $user]);
            exit;
        } else {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Invalid password or email!']);
            exit;
        }
    } else {
        // 如果在 staff 表中没有找到用户，则查找 customer 表
        $sql = "SELECT id, first_name, last_name, email, password, 'customer' AS role FROM customer WHERE email = '$email'";
        $result = $conn->query($sql);

        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();

            if (password_verify($password, $user['password'])) {
                $_SESSION['email'] = $user['email'];
                $_SESSION['first_name'] = $user['first_name'];
                $_SESSION['last_name'] = $user['last_name'];
                $_SESSION['role'] = $user['role'];

                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'user' => $user]);
                exit;
            } else {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Invalid password or email!']);
                exit;
            }
        } else {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'No user found with this email!']);
            exit;
        }
    }
}

$conn->close();
?>
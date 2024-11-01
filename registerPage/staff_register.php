<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ins";

// 启用错误报告
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 创建连接
$conn = new mysqli($servername, $username, $password, $dbname);

// 检查连接
if ($conn->connect_error) {
    die('Connet Eorr: ' . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // 获取表单数据
    $firstName = $_POST['firstName'];
    $lastName = $_POST['lastName'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirmPassword'];
    $staffType = $_POST['staffType'];

    // 验证密码是否匹配
    if ($password !== $confirmPassword) {
        echo 'Password does not match';
        exit;
    }

    // 插入数据
    $stmt = $conn->prepare("INSERT INTO staff (first_name, last_name, email, password, staffType) VALUES (?, ?, ?, ?, ?)");
    
    // 确保密码是使用 hash 函数处理的
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // 正确绑定参数
    $stmt->bind_param("sssss", $firstName, $lastName, $email, $hashedPassword, $staffType);

    if ($stmt->execute()) {
        echo 'success';
    } else {
        echo 'Err: ' . $stmt->error;
    }

    $stmt->close();
}
$conn->close();
?>
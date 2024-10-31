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
    die("Connection failed: " . $conn->connect_error);
}

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // 获取表单数据
    $email = $_POST['email'];
    $password = $_POST['password'];

    // 防止SQL注入
    $email = $conn->real_escape_string($email);

    // 查找数据库中的用户
    $sql = "SELECT id, first_name, last_name, email, password FROM users WHERE email = '$email'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // 获取用户数据
        $user = $result->fetch_assoc();

        // 验证密码
        if (password_verify($password, $user['password'])) {
            // 登录成功
            $_SESSION['email'] = $user['email'];
            $_SESSION['first_name'] = $user['first_name'];
            $_SESSION['last_name'] = $user['last_name'];

            // 返回成功响应
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name']
                ]
            ]);
        } else {
            // 密码不正确
            echo json_encode(['success' => false, 'message' => 'Invalid password or email!']);
        }
    } else {
        // 没有找到用户
        echo json_encode(['success' => false, 'message' => 'No user found with this email!']);
    }

    $conn->close();
}
?>
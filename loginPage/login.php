<?php
// 开启错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

// 数据库连接设置
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ins";

// 创建数据库连接
$conn = new mysqli($servername, $username, $password, $dbname);

// 检查连接
if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
}

// 处理 POST 请求
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    // 确保输入不为空
    if (empty($email) || empty($password)) {
        echo "<script>alert('请输入邮箱和密码。'); window.location.href = 'loginPage.html';</script>";
        exit;
    }

    // 处理 SQL 注入
    $email = $conn->real_escape_string($email);

    // 查询 staff 表
    $staff_sql = "SELECT * FROM staff WHERE email = '$email'";
    $staff_result = $conn->query($staff_sql);

    // 检查查询是否成功
    if (!$staff_result) {
        echo "错误: " . $conn->error;
        exit;
    }

    // 检查员工用户是否存在
    if ($staff_result->num_rows > 0) {
        $user = $staff_result->fetch_assoc();

        // 验证密码
        if (password_verify($password, $user['password'])) {
            // 登录成功，设置会话
            $_SESSION['email'] = $user['email'];
            $_SESSION['userid'] = $user['userID'];
            $_SESSION['role'] = 'staff';
            setcookie("loggedin", "true", time() + (86400 * 1), "/");
            echo "<script>alert('员工登录成功'); window.location.href = '../homePage/homePage.html';</script>";
            exit;
        } else {
            echo "<script>alert('无效的密码！'); window.location.href = 'loginPage.html';</script>";
            exit;
        }
    }

    // 如果没有在员工表中找到，检查客户表
    $customer_sql = "SELECT * FROM customer WHERE email = '$email'";
    $customer_result = $conn->query($customer_sql);

    // 检查查询是否成功
    if (!$customer_result) {
        echo "错误: " . $conn->error;
        exit;
    }

    // 检查客户用户是否存在
    if ($customer_result->num_rows > 0) {
        $user = $customer_result->fetch_assoc();

        // 验证密码
        if (password_verify($password, $user['password'])) {
            // 登录成功，设置会话
            $_SESSION['email'] = $user['email'];
            $_SESSION['userid'] = $user['customer_ID'];
            $_SESSION['role'] = 'customer';
            setcookie("loggedin", "true", time() + (86400 * 1), "/");
            echo "<script>alert('客户登录成功'); window.location.href = '../homePage/homePage.html';</script>";
            exit;
        } else {
            echo "<script>alert('无效的密码！'); window.location.href = 'loginPage.html';</script>";
            exit;
        }
    } else {
        echo "<script>alert('邮箱未找到！'); window.location.href = 'loginPage.html';</script>";
    }

    // 关闭连接
    $conn->close();
} else {
    echo "<script>alert('无效的请求。'); window.location.href = 'loginPage.html';</script>";
}
?>
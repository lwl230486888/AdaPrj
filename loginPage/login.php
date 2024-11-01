<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ins";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $email = $conn->real_escape_string($email);

    // 查询 staff 表
    $staff_sql = "SELECT * FROM staff WHERE email = '$email'";
    $staff_result = $conn->query($staff_sql);

    if ($staff_result->num_rows > 0) {
        $user = $staff_result->fetch_assoc();

        if (password_verify($password, $user['password'])) {
            $_SESSION['email'] = $user['email'];
            $_SESSION['userid'] = $user['userID']; // 假设 userID 是 staff 表中的字段
            $_SESSION['role'] = 'staff';
            setcookie("loggedin", "true", time() + (86400 * 1), "/"); 
            echo "<script>alert('Login Success'); window.location.href = '../homePage/homePage.html';</script>";
            exit;
        } else {
            echo "<script>alert('Invaild Password or Email!');window.location.href = 'loginPage.html';</script>";
        }
    } else {
        // 查询 customer 表
        $customer_sql = "SELECT * FROM customer WHERE email = '$email'";
        $customer_result = $conn->query($customer_sql);

        if ($customer_result->num_rows > 0) {
            $user = $customer_result->fetch_assoc();

            if (password_verify($password, $user['passWd'])) {
                $_SESSION['email'] = $user['email'];
                $_SESSION['userid'] = $user['cusID']; // 假设 cusID 是 customer 表中的字段
                $_SESSION['role'] = 'customer';
                setcookie("loggedin", "true", time() + (86400 * 1), "/"); 
                echo "<script>alert('Login Success'); window.location.href = '../homePage/homePage.html';</script>";
                exit;
            } else {
                echo "<script>alert('Invaild Password or Email!'); window.location.href = 'loginPage.html';</script>";
            }
        } else {
            echo "<script>alert('Email Not Found!');window.location.href = 'loginPage.html';</script>";
        }
    }

    $conn->close();
}
?>
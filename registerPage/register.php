<?php
// 数据库连接
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "lmdatabase";

$conn = new mysqli($servername, $username, $password, $dbname);

// 检查连接
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 获取表单数据
$region = $_POST['region'];
$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT); // 对密码进行哈希处理

// 使用 prepared statements 插入数据
$stmt = $conn->prepare("INSERT INTO users (region, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $region, $firstName, $lastName, $email, $password);

// After successful execution of your database insert
if ($stmt->execute()) {
    echo "success"; // Send back a success message
} else {
    echo "Error: " . $stmt->error; // Send back an error message
}


$stmt->close();
$conn->close();
?>

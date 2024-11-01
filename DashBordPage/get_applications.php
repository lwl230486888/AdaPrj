<?php
$host = 'localhost';
$user = 'root'; // 请替换为您的数据库用户名
$password = ''; // 请替换为您的数据库密码
$database = 'ins'; // 请替换为您的数据库名

// 创建数据库连接
$conn = new mysqli($host, $user, $password, $database);

// 检查连接
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


$sql = "SELECT * FROM insurance_requests";
$result = $conn->query($sql);

$applications = [];

if ($result->num_rows > 0) {
    // 输出数据
    while ($row = $result->fetch_assoc()) {
        $applications[] = $row;
    }
}

echo json_encode($applications);
$conn->close();
?>
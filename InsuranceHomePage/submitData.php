<?php
header('Content-Type: application/json');

// 读取 POST 请求的原始数据
$data = json_decode(file_get_contents('php://input'), true);

// 检查数据是否有效
if ($data) {
    // 从请求中获取数据
    $name = $data['name'];
    $phone = $data['phone'];
    $email = $data['email'];
    $customerId = $data['customerId'] ?? null; // 客户ID
    $driverAge = $data['driverAge'];
    $driverOccupation = $data['driverOccupation'];
    $vehicleYear = $data['vehicleYear'];
    $cc = $data['cc'];
    $vehicleModel = $data['vehicleModel'];

    // 数据库连接设置
    $servername = "localhost"; // 根据你的设置修改
    $username = "root"; // 根据你的设置修改
    $password = ""; // 根据你的设置修改
    $dbname = "ins"; // 根据你的设置修改

    // 数据库连接
    $conn = new mysqli($servername, $username, $password, $dbname);

    // 检查连接
    if ($conn->connect_error) {
        echo json_encode(["success" => false, "message" => "连接失败: " . $conn->connect_error]);
        exit();
    }

    // 插入数据
    $stmt = $conn->prepare("INSERT INTO insurance_requests (name, phone, email, driver_age, driver_occupation, vehicle_year, cc, vehicle_model, customer_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssss", $name, $phone, $email, $driverAge, $driverOccupation, $vehicleYear, $cc, $vehicleModel, $customerId);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "成功提交申请"]); 
    } else {
        echo json_encode(["success" => false, "message" => "错误: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "无效数据"]);
}
?>
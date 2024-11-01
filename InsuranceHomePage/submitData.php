<?php
header('Content-Type: application/json');

// 讀取 POST 請求的原始數據
$data = json_decode(file_get_contents('php://input'), true);

// 檢查數據是否有效
if ($data) {
    $name = $data['name'];
    $phone = $data['phone'];
    $email = $data['email'];
    $driverAge = $data['driverAge'];
    $driverOccupation = $data['driverOccupation'];
    $vehicleYear = $data['vehicleYear'];
    $cc = $data['cc'];
    $vehicleModel = $data['vehicleModel'];

    // 數據庫連接設置
    $servername = "localhost"; // 根據你的設置修改
    $username = "root"; // 根據你的設置修改
    $password = ""; // 根據你的設置修改
    $dbname = "ins"; // 根據你的設置修改

    // 數據庫連接
    $conn = new mysqli($servername, $username, $password, $dbname);

    // 檢查連接
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // 插入數據
    $stmt = $conn->prepare("INSERT INTO insurance_requests (name, phone, email, driver_age, driver_occupation, vehicle_year, cc, vehicle_model) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssss", $name, $phone, $email, $driverAge, $driverOccupation, $vehicleYear, $cc, $vehicleModel);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "新記錄插入成功"]);
    } else {
        echo json_encode(["success" => false, "message" => "錯誤: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "無效的數據"]);
}
?>
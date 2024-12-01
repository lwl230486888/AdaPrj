<?php
session_start();
header('Content-Type: application/json');

// 檢查登入狀態
if (!isset($_SESSION['userid'])) {
    echo json_encode(["success" => false, "message" => "Please login first"]);
    exit;
}

// 讀取POST數據
$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $customer_ID = $_SESSION['userid']; // 使用session中的用戶ID
    
    // 從請求中獲取數據
    $name = $data['name'];
    $phone = $data['phone'];
    $email = $data['email'];
    $driverAge = $data['driverAge'];
    $driverOccupation = $data['driverOccupation'];
    $vehicleYear = $data['vehicleYear'];
    $cc = $data['cc'];
    $vehicleModel = $data['vehicleModel'];

    // 資料庫連接設置
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "ins";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
        exit();
    }

    // 插入數據，包含customer_ID和request狀態
    $stmt = $conn->prepare("INSERT INTO insurance_requests (
        customer_ID, name, phone, email, driver_age, 
        driver_occupation, vehicle_year, cc, vehicle_model, 
        status, request_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())");
    
    $stmt->bind_param("sssssssss", 
        $customer_ID, $name, $phone, $email, $driverAge, 
        $driverOccupation, $vehicleYear, $cc, $vehicleModel
    );

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true, 
            "message" => "Application submitted successfully"
        ]); 
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "Error: " . $stmt->error
        ]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid data"]);
}
?>
<?php
session_start();
header('Content-Type: application/json');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ins";

$conn = new mysqli($servername, $username, $password, $dbname);

// 檢查連接
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// 基本查詢
$sql = "SELECT 
            ir.*, 
            c.name as customer_name 
        FROM insurance_requests ir 
        LEFT JOIN customer c ON ir.customer_ID = c.customer_ID";

// 執行查詢
$result = $conn->query($sql);

// Debug信息
error_log("SQL Query: " . $sql);
error_log("Number of rows: " . $result->num_rows);

$orders = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
}

// 輸出結果
echo json_encode([
    'success' => true,
    'data' => $orders,
    'count' => count($orders)
]);

$conn->close();
?>
<?php
session_start();
header('Content-Type: application/json');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ins";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Connection failed']);
    exit;
}

// 獲取篩選條件
$type = $_GET['type'] ?? 'all';
$status = $_GET['status'] ?? 'all';

// 構建SQL查詢
$sql = "SELECT 
            ir.*, 
            c.name as customer_name 
        FROM insurance_requests ir 
        LEFT JOIN customer c ON ir.customer_ID = c.customer_ID 
        WHERE 1=1";

if ($type !== 'all') {
    $sql .= " AND ir.type = ?";
}

if ($status !== 'all') {
    $sql .= " AND ir.status = ?";
}

$sql .= " ORDER BY ir.request_date DESC";

// Debug信息
error_log("SQL Query: " . $sql);

$result = $conn->query($sql);
$orders = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
}

echo json_encode([
    'success' => true,
    'data' => $orders,
    'count' => count($orders)
]);

$conn->close();
?>
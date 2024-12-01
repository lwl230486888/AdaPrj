<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 檢查權限
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'staff' || $_SESSION['staff_type'] !== 'insuranceS') {
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized access'
    ]);
    exit;
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ins";

try {
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // 獲取狀態篩選
    $status = isset($_GET['status']) ? $_GET['status'] : 'all';

    // 構建查詢
    $sql = "SELECT 
                ir.insuranceID,
                ir.request_date,
                ir.vehicle_model,
                ir.cc,
                ir.status,
                ir.customer_ID,
                c.firstName as customer_name
            FROM insurance_requests ir 
            LEFT JOIN customer c ON ir.customer_ID = c.customer_ID";

    // 添加狀態篩選
    if ($status !== 'all') {
        $sql .= " WHERE ir.status = ?";
    }

    $sql .= " ORDER BY ir.request_date DESC";

    $stmt = $conn->prepare($sql);
    
    if ($status !== 'all') {
        $stmt->bind_param("s", $status);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            'insuranceID' => $row['insuranceID'],
            'request_date' => $row['request_date'],
            'customer_name' => $row['customer_name'],
            'vehicle_model' => $row['vehicle_model'],
            'cc' => $row['cc'],
            'status' => $row['status']
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $orders
    ]);

} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>
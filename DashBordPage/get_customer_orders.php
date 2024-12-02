<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // 改用 user_id
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Please login first');
    }

    // 檢查角色
    if ($_SESSION['role'] !== 'customer') {
        throw new Exception('Unauthorized access');
    }

    $customerId = $_SESSION['user_id'];
    error_log("Fetching orders for customer ID: " . $customerId);

    $conn = new mysqli("localhost", "root", "", "ins");
    $conn->set_charset("utf8mb4");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $sql = "SELECT * FROM insurance_requests WHERE customer_ID = ? ORDER BY request_date DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $customerId);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            'insuranceID' => $row['insuranceID'],
            'request_date' => $row['request_date'],
            'vehicle_model' => $row['vehicle_model'],
            'cc' => $row['cc'],
            'status' => $row['status'],
            'driver_age' => $row['driver_age'],
            'driver_occupation' => $row['driver_occupation']
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $orders
    ]);

} catch (Exception $e) {
    error_log("Error in get_customer_orders: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>
<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Please login first');
    }

    if ($_SESSION['role'] !== 'customer') {
        throw new Exception('Unauthorized access');
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['requestId'])) {
        throw new Exception("Request ID is required");
    }

    $conn = new mysqli("localhost", "root", "", "ins");
    $conn->set_charset("utf8mb4");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // 檢查訂單狀態同埋所選計劃
    $checkSql = "SELECT ir.status, ir.selected_plan_id 
                FROM insurance_requests ir
                WHERE ir.insuranceID = ? 
                AND ir.customer_ID = ?";
    
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("ii", $data['requestId'], $_SESSION['user_id']);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Order not found");
    }

    $order = $result->fetch_assoc();

    if (!$order['selected_plan_id']) {
        throw new Exception("No plan selected for this order");
    }

    if ($order['status'] !== 'processing') {
        throw new Exception("Quote cannot be accepted in current status: " . $order['status']);
    }

    // 移除 accepted_date 欄位，只更新狀態
    $updateSql = "UPDATE insurance_requests 
                  SET status = 'accepted'
                  WHERE insuranceID = ? 
                  AND customer_ID = ?
                  AND status = 'processing'";
                  
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("ii", $data['requestId'], $_SESSION['user_id']);

    if (!$updateStmt->execute()) {
        throw new Exception("Failed to accept quote");
    }

    if ($updateStmt->affected_rows === 0) {
        throw new Exception("No changes made to the order");
    }

    echo json_encode([
        'success' => true,
        'message' => 'Quote accepted successfully'
    ]);

} catch (Exception $e) {
    error_log("Error accepting quote: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($checkStmt)) $checkStmt->close();
    if (isset($updateStmt)) $updateStmt->close();
    if (isset($conn)) $conn->close();
}
?>
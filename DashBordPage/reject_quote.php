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

    // 先檢查訂單狀態同埋所有權
    $checkSql = "SELECT status, selected_plan_id 
                FROM insurance_requests 
                WHERE insuranceID = ? 
                AND customer_ID = ?
                AND status = 'processing'";
    
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("ii", $data['requestId'], $_SESSION['user_id']);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Quote not found or not authorized");
    }

    $order = $result->fetch_assoc();

    // 確保有揀咗計劃先可以拒絕
    if (!$order['selected_plan_id']) {
        throw new Exception("No plan selected for this quote");
    }

    // 更新訂單狀態
    $updateSql = "UPDATE insurance_requests 
                  SET status = 'rejected'
                  WHERE insuranceID = ? 
                  AND customer_ID = ?
                  AND status = 'processing'";
                  
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("ii", $data['requestId'], $_SESSION['user_id']);

    if (!$updateStmt->execute()) {
        throw new Exception("Failed to reject quote");
    }

    if ($updateStmt->affected_rows === 0) {
        throw new Exception("No changes made to the quote");
    }

    echo json_encode([
        'success' => true,
        'message' => 'Quote rejected successfully'
    ]);

} catch (Exception $e) {
    error_log("Error rejecting quote: " . $e->getMessage());
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
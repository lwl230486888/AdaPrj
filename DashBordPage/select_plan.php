<?php
session_start();
header('Content-Type: application/json');
header('Accept: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        throw new Exception('Please login first');
    }

    if ($_SESSION['role'] !== 'customer') {
        http_response_code(403);
        throw new Exception('Unauthorized access');
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    if (!isset($data['requestId']) || !isset($data['planId'])) {
        throw new Exception('Missing required data');
    }

    $requestId = intval($data['requestId']);
    $planId = intval($data['planId']);

    $conn = new mysqli("localhost", "root", "", "ins");
    $conn->set_charset("utf8mb4");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // 檢查訂單狀態
    $checkSql = "SELECT insuranceID, status FROM insurance_requests 
                WHERE insuranceID = ? AND customer_ID = ? AND status = 'processing'";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("ii", $requestId, $_SESSION['user_id']);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Order not found or cannot be modified");
    }

    // 檢查計劃是否存在
    $checkPlanSql = "SELECT plan_id FROM insurance_plans WHERE insurance_id = ? AND plan_id = ?";
    $checkPlanStmt = $conn->prepare($checkPlanSql);
    $checkPlanStmt->bind_param("ii", $requestId, $planId);
    $checkPlanStmt->execute();
    
    if ($checkPlanStmt->get_result()->num_rows === 0) {
        throw new Exception("Selected plan not found");
    }

    // 更新所選計劃 - 移除 plan_selected_date 欄位
    $updateSql = "UPDATE insurance_requests 
                  SET selected_plan_id = ?
                  WHERE insuranceID = ? AND customer_ID = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("iii", $planId, $requestId, $_SESSION['user_id']);

    if (!$updateStmt->execute()) {
        throw new Exception("Failed to update plan selection: " . $conn->error);
    }

    if ($updateStmt->affected_rows === 0) {
        throw new Exception("No changes made to the order");
    }

    echo json_encode([
        'success' => true,
        'message' => 'Plan selected successfully'
    ]);

} catch (Exception $e) {
    error_log("Error in select_plan.php: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($checkStmt)) $checkStmt->close();
    if (isset($checkPlanStmt)) $checkPlanStmt->close();
    if (isset($updateStmt)) $updateStmt->close();
    if (isset($conn)) $conn->close();
}
?>
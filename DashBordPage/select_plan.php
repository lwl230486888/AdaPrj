<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'customer') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

try {
    require_once 'db_config.php';
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['requestId']) || !isset($data['planId'])) {
        throw new Exception('Missing required fields');
    }
    
    // 驗證保險請求和計劃
    $sql = "SELECT ir.* FROM insurance_requests ir 
            INNER JOIN insurance_plans ip ON ip.insurance_id = ir.insuranceID 
            WHERE ir.insuranceID = ? AND ir.customer_ID = ? 
            AND ip.plan_id = ? AND ir.status = 'processing'";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iii', $data['requestId'], $_SESSION['userid'], $data['planId']);
    $stmt->execute();
    
    if ($stmt->get_result()->num_rows === 0) {
        throw new Exception('Invalid request or plan selection');
    }
    
    // 更新選擇的計劃
    $sql = "UPDATE insurance_requests 
            SET selected_plan_id = ? 
            WHERE insuranceID = ? AND customer_ID = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iii', $data['planId'], $data['requestId'], $_SESSION['userid']);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to select plan');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Plan selected successfully'
    ]);

} catch (Exception $e) {
    error_log("Error selecting plan: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>
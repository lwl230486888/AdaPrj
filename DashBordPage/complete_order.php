<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'staff' || $_SESSION['staff_type'] !== 'insuranceS') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
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

    $data = json_decode(file_get_contents('php://input'), true);
    
    // 檢查訂單狀態
    $checkSql = "SELECT status FROM insurance_requests WHERE insuranceID = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("i", $data['requestId']);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Order not found");
    }
    
    $orderStatus = $result->fetch_assoc()['status'];
    if ($orderStatus !== 'accepted' && $orderStatus !== 'rejected') {
        throw new Exception("Order can only be completed after being accepted or rejected");
    }

    // 更新狀態為 completed
    $sql = "UPDATE insurance_requests 
            SET status = 'completed',
                completed_date = NOW(),
                completed_by = ?
            WHERE insuranceID = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $_SESSION['userid'], $data['requestId']);

    if (!$stmt->execute()) {
        throw new Exception("Failed to complete order");
    }

    echo json_encode([
        'success' => true,
        'message' => 'Order completed successfully'
    ]);

} catch (Exception $e) {
    error_log("Error completing order: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($checkStmt)) $checkStmt->close();
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>
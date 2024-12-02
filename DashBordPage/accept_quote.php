<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'customer') {
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
    
    // 先檢查訂單狀態係咪 processing
    $checkSql = "SELECT status FROM insurance_requests 
                WHERE insuranceID = ? AND customer_ID = ? AND status = 'processing'";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("ii", $data['requestId'], $_SESSION['userid']);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Quote not found or cannot be accepted in current status");
    }

    // 更新狀態為 accepted
    $sql = "UPDATE insurance_requests 
            SET status = 'accepted' 
            WHERE insuranceID = ? AND customer_ID = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $data['requestId'], $_SESSION['userid']);

    if (!$stmt->execute()) {
        throw new Exception("Failed to accept quote");
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
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>
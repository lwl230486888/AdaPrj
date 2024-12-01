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
    
    // 更新狀態為 rejected 同 closed
    $sql = "UPDATE insurance_requests 
            SET status = 'rejected' 
            WHERE insuranceID = ? AND customer_ID = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $data['requestId'], $_SESSION['userid']);

    if (!$stmt->execute()) {
        throw new Exception("Failed to reject quote");
    }

    if ($stmt->affected_rows === 0) {
        throw new Exception("Quote not found or not authorized");
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
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>
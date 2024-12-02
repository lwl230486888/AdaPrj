<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// DEBUG: 輸出 session 內容
error_log('Session contents: ' . print_r($_SESSION, true));

// 檢查登入狀態
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Please login first',
        'redirect' => 'login.php',
        'session_debug' => $_SESSION
    ]);
    exit;
}

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['requestId']) || !isset($data['message'])) {
        throw new Exception('Missing required parameters');
    }

    $requestId = intval($data['requestId']);
    $message = trim($data['message']);
    $senderId = intval($_SESSION['user_id']);
    $senderType = $_SESSION['role'];

    // 資料庫連接
    $conn = new mysqli("localhost", "root", "", "ins");
    $conn->set_charset("utf8mb4");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // 插入訊息
    $sql = "INSERT INTO insurance_messages (insurance_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isis", $requestId, $senderType, $senderId, $message);
    
    if (!$stmt->execute()) {
        throw new Exception("Error sending message: " . $stmt->error);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully'
    ]);

} catch (Exception $e) {
    error_log("Error in send_message.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>
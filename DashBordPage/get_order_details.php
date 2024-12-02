<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // 檢查登入狀態同角色
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Please login first');
    }

    $conn = new mysqli("localhost", "root", "", "ins");
    $conn->set_charset("utf8mb4");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $orderId = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$orderId) {
        throw new Exception("Order ID is required");
    }

    // 根據角色決定 SQL 查詢
    if ($_SESSION['role'] === 'customer') {
        // 客戶只能睇自己嘅訂單
        $sql = "SELECT ir.*, 
                c.firstName,
                c.lastName,
                c.email,
                c.region,
                CONCAT(c.firstName, ' ', c.lastName) as customer_name
                FROM insurance_requests ir 
                LEFT JOIN customer c ON ir.customer_ID = c.customer_ID 
                WHERE ir.insuranceID = ? AND ir.customer_ID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $orderId, $_SESSION['user_id']);
    } else if ($_SESSION['role'] === 'staff' && $_SESSION['staff_type'] === 'insuranceS') {
        // 保險員工可以睇所有訂單
        $sql = "SELECT ir.*, 
                c.firstName,
                c.lastName,
                c.email,
                c.region,
                CONCAT(c.firstName, ' ', c.lastName) as customer_name
                FROM insurance_requests ir 
                LEFT JOIN customer c ON ir.customer_ID = c.customer_ID 
                WHERE ir.insuranceID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $orderId);
    } else {
        throw new Exception('Unauthorized access');
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Order not found or access denied");
    }

    $order = $result->fetch_assoc();

    // 獲取保險計劃
    $plansSql = "SELECT * FROM insurance_plans WHERE insurance_id = ?";
    $plansStmt = $conn->prepare($plansSql);
    $plansStmt->bind_param("i", $orderId);
    $plansStmt->execute();
    $plansResult = $plansStmt->get_result();
    $order['plans'] = [];
    while ($plan = $plansResult->fetch_assoc()) {
        $order['plans'][] = $plan;
    }

    // 獲取訊息
    $messagesSql = "SELECT m.*, 
            CASE 
                WHEN m.sender_type = 'customer' THEN CONCAT(c.firstName, ' ', c.lastName)
                ELSE CONCAT(s.first_name, ' ', s.last_name)
            END as sender_name
            FROM insurance_messages m
            LEFT JOIN customer c ON m.sender_type = 'customer' AND m.sender_id = c.customer_ID
            LEFT JOIN staff s ON m.sender_type = 'staff' AND m.sender_id = s.userID
            WHERE m.insurance_id = ?
            ORDER BY m.created_at ASC";
    $messagesStmt = $conn->prepare($messagesSql);
    $messagesStmt->bind_param("i", $orderId);
    $messagesStmt->execute();
    $messagesResult = $messagesStmt->get_result();
    $order['messages'] = [];
    while ($message = $messagesResult->fetch_assoc()) {
        $order['messages'][] = $message;
    }

    echo json_encode([
        'success' => true,
        'data' => $order
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log("Error in get_order_details: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($plansStmt)) $plansStmt->close();
    if (isset($messagesStmt)) $messagesStmt->close();
    if (isset($conn)) $conn->close();
}
?>
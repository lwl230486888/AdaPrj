<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 檢查是否已登入，允許客戶或保險員工存取
if (!isset($_SESSION['role']) || ($_SESSION['role'] !== 'customer' && $_SESSION['role'] !== 'staff')) {
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

    $orderId = isset($_GET['id']) ? $_GET['id'] : null;

    if (!$orderId) {
        throw new Exception("Order ID is required");
    }

    // 根據用戶角色設置不同嘅查詢條件
    $sql = "SELECT ir.*, c.firstName as customer_name 
            FROM insurance_requests ir 
            LEFT JOIN customer c ON ir.customer_ID = c.customer_ID 
            WHERE ir.insuranceID = ?";

    // 如果係客戶，加入客戶ID限制
    if ($_SESSION['role'] === 'customer') {
        $sql .= " AND ir.customer_ID = ?";
    }

    $stmt = $conn->prepare($sql);

    // 根據角色綁定參數
    if ($_SESSION['role'] === 'customer') {
        $stmt->bind_param("ii", $orderId, $_SESSION['userid']);
    } else {
        $stmt->bind_param("i", $orderId);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Order not found or access denied");
    }

    $order = $result->fetch_assoc();

    echo json_encode([
        'success' => true,
        'data' => $order
    ]);

} catch (Exception $e) {
    error_log("Error loading order details: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>
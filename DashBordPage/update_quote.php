<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 檢查權限
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

    $conn->begin_transaction();

    try {
        // 獲取 POST 數據
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data received');
        }

        // Debug log
        error_log("Received data: " . print_r($data, true));
        error_log("Staff ID: " . $_SESSION['userid']);

        // 檢查訂單是否存在且狀態為 pending
        $checkSql = "SELECT status FROM insurance_requests WHERE insuranceID = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $data['requestId']);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("Order not found");
        }
        
        $orderStatus = $result->fetch_assoc()['status'];
        if ($orderStatus !== 'pending') {
            throw new Exception("Order cannot be modified in current status");
        }

        // 更新報價同狀態
        $sql = "UPDATE insurance_requests 
                SET status = 'processing',
                    premium_amount = ?,
                    ncd_percentage = ?,
                    tppd_limit = ?,
                    tpbi_limit = ?,
                    excess_tppd = ?,
                    excess_young_driver = ?,
                    excess_inexperienced = ?,
                    excess_unnamed = ?,
                    remarks = ?,
                    StaffID = ?
                WHERE insuranceID = ?";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }

        $stmt->bind_param(
            "diddddddsis",
            $data['premiumAmount'],
            $data['ncdPercentage'],
            $data['tppdLimit'],
            $data['tpbiLimit'],
            $data['tppdExcess'],
            $data['youngDriverExcess'],
            $data['inexperiencedExcess'],
            $data['unnamedExcess'],
            $data['remarks'],
            $_SESSION['userid'],
            $data['requestId']
        );

        if (!$stmt->execute()) {
            throw new Exception("Update failed: " . $stmt->error);
        }

        if ($stmt->affected_rows === 0) {
            throw new Exception("No records were updated");
        }

        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Quote updated successfully'
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Error updating quote: " . $e->getMessage());
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
<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'staff' || $_SESSION['staff_type'] !== 'insuranceS') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$staff_id = $_SESSION['userid'];

try {
    $conn = new mysqli("localhost", "root", "", "ins");
    
    $stmt = $conn->prepare("INSERT INTO insurance_details 
        (insurance_request_id, premium_amount, deductible, coverage_details, terms_conditions, staff_id) 
        VALUES (?, ?, ?, ?, ?, ?)");
        
    $stmt->bind_param("iddssі", 
        $data['requestId'],
        $data['premiumAmount'],
        $data['deductible'],
        $data['coverageDetails'],
        $data['termsConditions'],
        $staff_id
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception("Failed to save details");
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
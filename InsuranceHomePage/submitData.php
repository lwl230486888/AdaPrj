<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

error_log('Session data in submitData: ' . print_r($_SESSION, true));

// 改用 user_id
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Please login first"
    ]);
    exit;
}


$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $customer_ID = $_SESSION['user_id'];  // 使用 user_id
    
    try {
        $conn = new mysqli("localhost", "root", "", "ins");
        $conn->set_charset("utf8mb4");

        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }

        $stmt = $conn->prepare("INSERT INTO insurance_requests (
            customer_ID, name, phone, email, driver_age, 
            driver_occupation, vehicle_year, cc, vehicle_model, 
            status, request_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())");
        
        $stmt->bind_param("issssssss", 
            $customer_ID,
            $data['name'],
            $data['phone'],
            $data['email'],
            $data['driverAge'],
            $data['driverOccupation'],
            $data['vehicleYear'],
            $data['cc'],
            $data['vehicleModel']
        );

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Application submitted successfully"
            ]);
        } else {
            throw new Exception("Error executing query: " . $stmt->error);
        }

    } catch (Exception $e) {
        error_log("Error in submitData.php: " . $e->getMessage());
        echo json_encode([
            "success" => false,
            "message" => "An error occurred while processing your request"
        ]);
    } finally {
        if (isset($stmt)) $stmt->close();
        if (isset($conn)) $conn->close();
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Invalid data received"
    ]);
}
?>
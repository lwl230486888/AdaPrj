<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'staff') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

function calculatePremium($basePremium, $cc, $driverAge, $occupation) {
    // CC 係數
    $ccMultiplier = 1.0;
    if ($cc <= 1500) {
        $ccMultiplier = 1.0;
    } elseif ($cc <= 2000) {
        $ccMultiplier = 1.2;
    } elseif ($cc <= 3000) {
        $ccMultiplier = 1.4;
    } else {
        $ccMultiplier = 1.6;
    }
    
    // 年齡係數
    $ageMultiplier = 1.0;
    if ($driverAge < 25) {
        $ageMultiplier = 1.5;
    } elseif ($driverAge < 30) {
        $ageMultiplier = 1.3;
    } elseif ($driverAge < 40) {
        $ageMultiplier = 1.1;
    }
    
    // 職業係數
    $occupationMultiplier = 1.0;
    switch(strtolower($occupation)) {
        case 'student':
            $occupationMultiplier = 1.3;
            break;
        case 'teacher':
            $occupationMultiplier = 0.9;
            break;
        case 'driver':
            $occupationMultiplier = 1.4;
            break;
    }
    
    return $basePremium * $ccMultiplier * $ageMultiplier * $occupationMultiplier;
}

try {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "ins";

    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8mb4");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $insuranceId = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$insuranceId) {
        throw new Exception("Insurance ID is required");
    }

    // 獲取保險申請詳情
    $sql = "SELECT * FROM insurance_requests WHERE insuranceID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $insuranceId);
    $stmt->execute();
    $request = $stmt->get_result()->fetch_assoc();

    if (!$request) {
        throw new Exception("Insurance request not found");
    }

    // 定義三個計劃模板
    $plans = [
        [
            'template_id' => 1,
            'base_premium' => 5000,
            'ncd_percentage' => 0,
            'tppd_limit' => 100000,
            'tpbi_limit' => 1000000,
            'excess_tppd' => 2000,
            'excess_young_driver' => 5000,
            'excess_inexperienced' => 3000,
            'excess_unnamed' => 3000
        ],
        [
            'template_id' => 2,
            'base_premium' => 8000,
            'ncd_percentage' => 10,
            'tppd_limit' => 200000,
            'tpbi_limit' => 2000000,
            'excess_tppd' => 1500,
            'excess_young_driver' => 4000,
            'excess_inexperienced' => 2500,
            'excess_unnamed' => 2500
        ],
        [
            'template_id' => 3,
            'base_premium' => 12000,
            'ncd_percentage' => 20,
            'tppd_limit' => 500000,
            'tpbi_limit' => 5000000,
            'excess_tppd' => 1000,
            'excess_young_driver' => 3000,
            'excess_inexperienced' => 2000,
            'excess_unnamed' => 2000
        ]
    ];

    // 刪除現有計劃
    $sql = "DELETE FROM insurance_plans WHERE insurance_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $insuranceId);
    $stmt->execute();

    // 為每個計劃計算實際保費並插入數據庫
    foreach ($plans as $plan) {
        $premium = calculatePremium(
            $plan['base_premium'],
            $request['cc'],
            $request['driver_age'],
            $request['driver_occupation']
        );

        $sql = "INSERT INTO insurance_plans (
                    insurance_id,
                    template_id,
                    premium_amount,
                    ncd_percentage,
                    tppd_limit,
                    tpbi_limit,
                    excess_tppd,
                    excess_young_driver,
                    excess_inexperienced,
                    excess_unnamed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "iididddddd",
            $insuranceId,
            $plan['template_id'],
            $premium,
            $plan['ncd_percentage'],
            $plan['tppd_limit'],
            $plan['tpbi_limit'],
            $plan['excess_tppd'],
            $plan['excess_young_driver'],
            $plan['excess_inexperienced'],
            $plan['excess_unnamed']
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting plan: " . $stmt->error);
        }
    }

    // 更新申請狀態
    $sql = "UPDATE insurance_requests SET status = 'processing' WHERE insuranceID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $insuranceId);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Insurance quotes generated successfully'
    ]);

} catch (Exception $e) {
    error_log("Error generating quotes: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>
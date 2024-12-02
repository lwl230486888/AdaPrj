<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

error_log('Session data in check_login_status: ' . print_r($_SESSION, true));

$response = [
    'isLoggedIn' => false,
    'userType' => '',
    'userName' => '',
    'userId' => '',
    'email' => ''
];

// 改用 user_id
if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
    $response = [
        'isLoggedIn' => true,
        'userType' => $_SESSION['role'] ?? 'customer',
        'userName' => $_SESSION['name'] ?? '',
        'userId' => $_SESSION['user_id'],  // 使用 user_id
        'email' => $_SESSION['email'] ?? ''
    ];
}

error_log('Response data: ' . print_r($response, true));
echo json_encode($response);
?>
<?php
session_start();
header('Content-Type: application/json');

function checkLoginStatus() {
    $response = [
        'isLoggedIn' => false,
        'userType' => '',
        'userName' => '',
        'userId' => '',
        'email' => ''
    ];

    if (isset($_SESSION['userid']) && !empty($_SESSION['userid'])) {
        $response['isLoggedIn'] = true;
        $response['userType'] = $_SESSION['role'] ?? 'customer';
        $response['userName'] = $_SESSION['name'] ?? '';
        $response['userId'] = $_SESSION['userid'];
        $response['email'] = $_SESSION['email'] ?? '';
    }

    return $response;
}

// 如果直接訪問這個文件，返回JSON響應
if (basename($_SERVER['PHP_SELF']) == 'check_login_status.php') {
    echo json_encode(checkLoginStatus());
}
?>
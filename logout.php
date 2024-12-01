<?php
session_start();

// 清除所有session變數
$_SESSION = array();

// 如果有設置cookie，也清除
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time()-3600, '/');
}

// 銷毀session
session_destroy();

// 返回JSON響應
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
?>
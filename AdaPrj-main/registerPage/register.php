<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "lmdatabase";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$region = $_POST['region'];
$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT); 

$stmt = $conn->prepare("INSERT INTO users (region, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $region, $firstName, $lastName, $email, $password);

if ($stmt->execute()) {
    echo "success";
} else {
    echo "Error: " . $stmt->error; 
}


$stmt->close();
$conn->close();
?>

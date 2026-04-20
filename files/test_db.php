<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "leohub_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => $conn->connect_error]);
    exit();
}

$result = $conn->query("SELECT COUNT(*) as count FROM social_posts_new");
$row = $result->fetch_assoc();

echo json_encode([
    "status" => "success",
    "message" => "Database connected",
    "posts_count" => $row['count']
]);

$conn->close();
?>
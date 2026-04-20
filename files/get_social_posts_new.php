<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "leohub_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connection failed"]);
    exit();
}

$sql = "SELECT id, user_id, username, user_avatar, title, body, category, image_url, likes, comments, shares, is_trending, 
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at 
        FROM social_posts_new 
        ORDER BY is_trending DESC, created_at DESC";

$result = $conn->query($sql);
$posts = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $posts[] = $row;
    }
}

echo json_encode(["success" => true, "data" => $posts]);
$conn->close();
?>
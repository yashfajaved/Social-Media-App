<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

error_reporting(0);
ini_set('display_errors', 0);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "leohub_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connection failed"]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$post_id = isset($data['post_id']) ? intval($data['post_id']) : 0;

if ($post_id <= 0) {
    echo json_encode(["success" => false, "error" => "Invalid post ID"]);
    exit();
}

$sql = "UPDATE social_posts_new SET likes = likes + 1 WHERE id = $post_id";
if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "Post liked!"]);
} else {
    echo json_encode(["success" => false, "error" => "Failed to like post"]);
}

$conn->close();
?>
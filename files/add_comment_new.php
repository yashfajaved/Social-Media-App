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
$user_id = isset($data['user_id']) ? $data['user_id'] : 'guest_user';
$username = isset($data['username']) ? $data['username'] : 'Guest User';
$comment = isset($data['comment']) ? $data['comment'] : '';

if ($post_id <= 0 || empty($comment)) {
    echo json_encode(["success" => false, "error" => "Invalid data"]);
    exit();
}

$stmt = $conn->prepare("INSERT INTO post_comments_new (post_id, user_id, username, comment) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $post_id, $user_id, $username, $comment);

if ($stmt->execute()) {
    $conn->query("UPDATE social_posts_new SET comments = comments + 1 WHERE id = $post_id");
    echo json_encode(["success" => true, "message" => "Comment added!"]);
} else {
    echo json_encode(["success" => false, "error" => "Failed to add comment"]);
}

$stmt->close();
$conn->close();
?>
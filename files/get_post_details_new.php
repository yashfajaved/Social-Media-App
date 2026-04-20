<?php
// Turn off error reporting to prevent HTML errors
error_reporting(0);
ini_set('display_errors', 0);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "leohub_db";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode([
        "success" => false, 
        "error" => "Database connection failed: " . $conn->connect_error
    ]);
    exit();
}

// Get post ID
$post_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($post_id <= 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Invalid post ID. Please provide a valid ID."
    ]);
    $conn->close();
    exit();
}

// Get post details
$post_sql = "SELECT id, user_id, username, user_avatar, title, body, category, image_url, likes, comments, shares, is_trending,
             DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             DATE_FORMAT(created_at, '%M %d, %Y') as formatted_date
             FROM social_posts_new WHERE id = $post_id";

$post_result = $conn->query($post_sql);

if ($post_result->num_rows == 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Post not found with ID: " . $post_id
    ]);
    $conn->close();
    exit();
}

$post = $post_result->fetch_assoc();

// Get comments
$comments_sql = "SELECT id, user_id, username, comment, 
                 DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at 
                 FROM post_comments_new WHERE post_id = $post_id ORDER BY created_at DESC";

$comments_result = $conn->query($comments_sql);
$comments = [];

if ($comments_result->num_rows > 0) {
    while($row = $comments_result->fetch_assoc()) {
        $comments[] = $row;
    }
}

// Return success response
echo json_encode([
    "success" => true, 
    "post" => $post, 
    "comments" => $comments
]);

$conn->close();
?>
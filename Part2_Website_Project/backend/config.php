<?php
// Database configuration settings
define('DB_HOST', 'localhost');        // Database server address
define('DB_USER', 'root');             // Database username (usually 'root' for XAMPP)
define('DB_PASS', '');                 // Database password (empty for XAMPP)
define('DB_NAME', 'eventx_db');        // Database name

// Create database connection
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set character encoding to UTF-8
    $conn->set_charset("utf8mb4");
    
} catch (Exception $e) {
    // Handle connection error
    die(json_encode([
        'success' => false,
        'message' => 'Database connection error'
    ]));
}

// Function to clean and sanitize user input
function clean_input($data) {
    global $conn;
    $data = trim($data);                          // Remove whitespace
    $data = stripslashes($data);                  // Remove backslashes
    $data = htmlspecialchars($data);              // Convert special characters to HTML entities
    return $conn->real_escape_string($data);      // Escape SQL special characters
}

// Function to send JSON response
function send_response($success, $message, $data = null) {
    header('Content-Type: application/json');     // Set response header to JSON
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}
?>

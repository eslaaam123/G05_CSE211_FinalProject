<?php
// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow CORS (Cross-Origin Resource Sharing)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Include database configuration
require_once '../config.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_response(false, 'Invalid request method. Use POST.');
}

// Get JSON input from request body
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['email']) || empty($input['password'])) {
    send_response(false, 'Email and password are required.');
}

// Clean and sanitize inputs
$email = clean_input($input['email']);
$password = $input['password'];

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_response(false, 'Invalid email format.');
}

// Query to find user by email
$query = "SELECT id, name, email, password, phone FROM users WHERE email = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// Check if user exists
if ($result->num_rows === 0) {
    send_response(false, 'Invalid email or password.');
}

// Get user data
$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    send_response(false, 'Invalid email or password.');
}

// Login successful - return user data (without password)
send_response(true, 'Login successful!', [
    'id' => $user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'phone' => $user['phone']
]);

// Close connection
$stmt->close();
$conn->close();
?>
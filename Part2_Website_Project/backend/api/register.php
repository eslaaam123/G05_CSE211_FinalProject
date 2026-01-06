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
if (empty($input['name']) || empty($input['email']) || empty($input['password']) || empty($input['phone'])) {
    send_response(false, 'All fields are required.');
}

// Clean and sanitize inputs
$name = clean_input($input['name']);
$email = clean_input($input['email']);
$password = $input['password'];
$phone = clean_input($input['phone']);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_response(false, 'Invalid email format.');
}

// Validate Egyptian phone number (01XXXXXXXXX)
if (!preg_match('/^01[0-2,5]{1}[0-9]{8}$/', str_replace(' ', '', $phone))) {
    send_response(false, 'Invalid Egyptian phone number format.');
}

// Check if email already exists
$check_query = "SELECT id FROM users WHERE email = ?";
$stmt = $conn->prepare($check_query);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    send_response(false, 'Email already registered.');
}

// Hash password for security
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert new user into database
$insert_query = "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($insert_query);
$stmt->bind_param("ssss", $name, $email, $hashed_password, $phone);

if ($stmt->execute()) {
    // Get the newly created user ID
    $user_id = $stmt->insert_id;
    
    // Return success response with user data
    send_response(true, 'Registration successful!', [
        'id' => $user_id,
        'name' => $name,
        'email' => $email,
        'phone' => $phone
    ]);
} else {
    send_response(false, 'Registration failed. Please try again.');
}

// Close connection
$stmt->close();
$conn->close();
?>
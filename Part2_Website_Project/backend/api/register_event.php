<?php
// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow CORS (Cross-Origin Resource Sharing)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database configuration
require_once '../config.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_response(false, 'Invalid request method. Use POST.');
}

// Get JSON input from request body
$inputRaw = file_get_contents('php://input');
error_log("Raw input: " . $inputRaw);

$input = json_decode($inputRaw, true);

// Check if JSON decode was successful
if (json_last_error() !== JSON_ERROR_NONE) {
    send_response(false, 'Invalid JSON data: ' . json_last_error_msg());
}

error_log("Decoded input: " . print_r($input, true));

// Validate required fields
if (empty($input['user_id'])) {
    send_response(false, 'User ID is required.');
}

if (empty($input['event_id'])) {
    send_response(false, 'Event ID is required.');
}

if (empty($input['tickets']) && $input['tickets'] !== 0) {
    send_response(false, 'Number of tickets is required.');
}

// Clean and sanitize inputs
$user_id = (int)$input['user_id'];
$event_id = (int)$input['event_id'];
$tickets = (int)$input['tickets'];
$notes = isset($input['notes']) ? clean_input($input['notes']) : '';

error_log("Processed values - user_id: $user_id, event_id: $event_id, tickets: $tickets");

// Validate tickets number
if ($tickets < 1) {
    send_response(false, 'Number of tickets must be at least 1.');
}

// Validate user_id and event_id are positive integers
if ($user_id <= 0) {
    send_response(false, 'Invalid User ID.');
}

if ($event_id <= 0) {
    send_response(false, 'Invalid Event ID.');
}

// Check if user exists
$user_check = "SELECT id FROM users WHERE id = ?";
$stmt = $conn->prepare($user_check);

if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    send_response(false, 'Database error: Failed to prepare user check statement.');
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$user_result = $stmt->get_result();

if ($user_result->num_rows === 0) {
    send_response(false, 'User not found. Please login again.');
}
$stmt->close();

// Check if event exists
$event_check = "SELECT id, name, cost FROM events WHERE id = ?";
$stmt = $conn->prepare($event_check);

if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    send_response(false, 'Database error: Failed to prepare event check statement.');
}

$stmt->bind_param("i", $event_id);
$stmt->execute();
$event_result = $stmt->get_result();

if ($event_result->num_rows === 0) {
    send_response(false, 'Event not found. Please select a valid event.');
}

$event = $event_result->fetch_assoc();
$stmt->close();

// Note: User can register multiple times for the same event
// No check for duplicate registrations - this allows multiple bookings

// Insert registration into database
$insert_query = "INSERT INTO registrations (user_id, event_id, tickets, notes) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($insert_query);

if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    send_response(false, 'Database error: Failed to prepare insert statement.');
}

$stmt->bind_param("iiis", $user_id, $event_id, $tickets, $notes);

if ($stmt->execute()) {
    // Calculate total cost
    $total_cost = $event['cost'] * $tickets;
    
    // Return success response with registration details
    send_response(true, 'Registration successful!', [
        'registration_id' => $stmt->insert_id,
        'event_name' => $event['name'],
        'tickets' => $tickets,
        'total_cost' => number_format($total_cost, 2),
        'notes' => $notes
    ]);
} else {
    error_log("Execute failed: " . $stmt->error);
    send_response(false, 'Registration failed. Please try again. Error: ' . $stmt->error);
}

// Close connection
$stmt->close();
$conn->close();
?>
<?php
// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow CORS (Cross-Origin Resource Sharing)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Include database configuration
require_once '../config.php';

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_response(false, 'Invalid request method. Use GET.');
}

// Get query parameters for filtering (optional)
$search = isset($_GET['search']) ? clean_input($_GET['search']) : '';
$category = isset($_GET['category']) ? clean_input($_GET['category']) : '';
$date = isset($_GET['date']) ? clean_input($_GET['date']) : '';

// Build SQL query with filters
$query = "SELECT id, name, date, location, cost, category, image, description FROM events WHERE 1=1";

// Add search filter if provided
if (!empty($search)) {
    $query .= " AND (name LIKE '%$search%' OR location LIKE '%$search%')";
}

// Add category filter if provided
if (!empty($category)) {
    $query .= " AND category = '$category'";
}

// Add date filter if provided
if (!empty($date)) {
    $query .= " AND date = '$date'";
}

// Order by date ascending
$query .= " ORDER BY date ASC";

// Execute query
$result = $conn->query($query);

// Check if query was successful
if (!$result) {
    send_response(false, 'Failed to fetch events.');
}

// Fetch all events as associative array
$events = [];
while ($row = $result->fetch_assoc()) {
    $events[] = [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'date' => $row['date'],
        'location' => $row['location'],
        'cost' => (float)$row['cost'],
        'category' => $row['category'],
        'image' => $row['image'],
        'description' => $row['description']
    ];
}

// Return success response with events data
send_response(true, 'Events fetched successfully.', $events);

// Close connection
$conn->close();
?>
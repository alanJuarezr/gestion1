<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$host = "127.0.0.1";
$port = 3307; // Tu puerto configurado en XAMPP
$user = "root";
$pass = "";
$db   = "farmacia_db";

$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error de conexión a la base de datos: " . $conn->connect_error
    ]);
    exit();
}

$conn->set_charset("utf8mb4");
?>
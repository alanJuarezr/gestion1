<?php

/**
 * Copyright (c) 2026 Farmacia "El Ángel". Todos los derechos reservados.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$host = "127.0.0.1";
// <<<<<<< Updated upstream
$port = 3306; // Tu puerto configurado en XAMPP.
$user = "root"; // Usuario para acceder a la BD.
$pass = ""; // La contraseña para acceder al usuario.
// =======
$port = 3307; // Tu puerto configurado en XAMPP
$user = "root";
$pass = "";
// >>>>>>> Stashed changes
$db   = "farmacia_db";

$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "ERROR: Al conectar o contactar a la base de datos:" . $conn->connect_error
    ]);
    exit();
}

$conn->set_charset("utf8mb4");
?>
<?php

/**
 * Copyright (c) 2026 Farmacia "El Ángel". Todos los derechos reservados.
 */

require_once 'conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    // Leer el cuerpo de la petición JSON de manera segura
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);

    if (!$data || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Datos incompletos en la petición"]);
        exit();
    }

    $email = $conn->real_escape_string(trim($data['email']));
    $password = trim($data['password']);

    $sql = "SELECT id, nombre, email, password, rol FROM usuarios WHERE email = '$email'";
    $res = $conn->query($sql);

    if ($res && $res->num_rows === 1) {
        $usuario = $res->fetch_assoc();
        
        // Validación directa de contraseña
        if ($password === $usuario['password']) {
            echo json_encode([
                "status" => "ok",
                "message" => "Bienvenido, " . $usuario['nombre'],
                "usuario" => [
                    "id" => $usuario['id'],
                    "nombre" => $usuario['nombre'],
                    "email" => $usuario['email'],
                    "rol" => $usuario['rol']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Contraseña incorrecta"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "El correo no está registrado"]);
    }
}
?>
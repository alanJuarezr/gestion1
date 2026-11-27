<?php

/**
 * Copyright (c) 2026 Farmacia "El Ángel". Todos los derechos reservados.
 */

require_once 'conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $sql = "SELECT id, nombre, telefono, email, direccion, creado_en FROM clientes ORDER BY id DESC";
    $res = $conn->query($sql);
    $datos = [];
    while ($fila = $res->fetch_assoc()) {
        $datos[] = $fila;
    }
    echo json_encode($datos);
    exit();
}

elseif ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $nombre = $conn->real_escape_string(trim($data['nombre'] ?? ''));
    $telefono = $conn->real_escape_string(trim($data['telefono'] ?? ''));
    $email = $conn->real_escape_string(trim($data['email'] ?? ''));
    $direccion = $conn->real_escape_string(trim($data['direccion'] ?? ''));

    if ($nombre === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El nombre del cliente es obligatorio"]);
        exit();
    }

    $sql = "INSERT INTO clientes (nombre, telefono, email, direccion) 
            VALUES ('$nombre', '$telefono', '$email', '$direccion')";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "ok", "message" => "Cliente registrado correctamente"]);
        exit();
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Error al guardar cliente: " . $conn->error]);
        exit();
    }
}

elseif ($metodo === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    $nombre = $conn->real_escape_string(trim($data['nombre'] ?? ''));
    $telefono = $conn->real_escape_string(trim($data['telefono'] ?? ''));
    $email = $conn->real_escape_string(trim($data['email'] ?? ''));
    $direccion = $conn->real_escape_string(trim($data['direccion'] ?? ''));

    if ($id <= 0 || $nombre === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Datos inválidos para actualizar"]);
        exit();
    }

    $sql = "UPDATE clientes 
            SET nombre='$nombre', telefono='$telefono', email='$email', direccion='$direccion' 
            WHERE id=$id";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "ok", "message" => "Cliente actualizado correctamente"]);
        exit();
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Error al actualizar: " . $conn->error]);
        exit();
    }
}

elseif ($metodo === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ID de cliente inválido"]);
        exit();
    }

    $sql = "DELETE FROM clientes WHERE id=$id";
    if ($conn->query($sql)) {
        echo json_encode(["status" => "ok", "message" => "Cliente eliminado"]);
        exit();
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Error al eliminar: " . $conn->error]);
        exit();
    }
}
?>
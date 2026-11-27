<?php

/**
 * Copyright (c) 2026 Farmacia "El Ángel". Todos los derechos reservados.
 */

require_once 'conexion.php';

// header('Content-Type: application/json; charset=utf-8');

$metodo = $_SERVER['REQUEST_METHOD'];

// 1. LEER (GET) - Obtener todas las ventas
if ($metodo === 'GET') {
    $sql = "SELECT id, usuario_id, total, fecha FROM ventas ORDER BY id DESC"; //Obtiene los datos de ventas y los ordena por ID
    
    $res = $conn->query($sql); //Ejecuta el query

    $ventas = [];
    
    while ($fila = $res->fetch_assoc()) {
        $ventas[] = $fila;
    }

    echo json_encode($ventas);
    exit();
}

// 2. CREAR (POST) - Insertar una venta nueva
elseif ($metodo === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $usuarioId = (int) ($data['usuario_id'] ?? 0);
    $total = (float) ($data['total'] ?? -1);
    $fecha = $conn->real_escape_string(trim($data['fecha'] ?? ''));

    $sql = "INSERT INTO ventas (usuario_id, total, fecha) VALUES ($usuarioId, $total, '$fecha')";

    if ($conn->query($sql)) {
        echo json_encode(['status' => 'ok', 'message' => 'Venta registrada']);
        exit();
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar la evnta']);
        exit();
    }
}

// 4. ELIMINAR (DELETE) - Borrar por ID
elseif ($metodo === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $usuarioId = (int) ($data['usuario_id'] ?? 0);
    $total = (float) ($data['total'] ?? -1);
    $fecha = $conn->real_escape_string(trim($data['fecha'] ?? ''));

    $sql = "UPDATE ventas SET usuario_id=$usuarioId, total=$total, fecha='$fecha' WHERE id=$id";

    if ($conn->query($sql)) {
        echo json_encode(['status' => 'ok', 'message' => 'Venta actualizada']);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $conn->error]);
        exit();
    }
}

// 4. ELIMINAR (DELETE) - Borrar por ID
elseif ($metodo === 'DELETE') {
    $id = intval($_GET['id']);

    if ($conn->query("DELETE FROM ventas WHERE id=$id")) {
        echo json_encode(['status' => 'ok', 'message' => 'Venta eliminada']);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $conn->error]);
        exit();
    }
}
?>
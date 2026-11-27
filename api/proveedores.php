<?php

/**
 * Copyright (c) 2026 Farmacia "El Ángel". Todos los derechos reservados.
 */

require_once 'conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

// 1. LISTAR PROVEEDORES (GET)
if ($metodo === 'GET') {
    $sql = "SELECT id, empresa, contacto, telefono, email, creado_en FROM proveedores ORDER BY id DESC";
    $res = $conn->query($sql);
    $datos = [];
    while ($fila = $res->fetch_assoc()) {
        $datos[] = $fila;
    }
    echo json_encode($datos);
    exit();
}

// 2. REGISTRAR PROVEEDOR (POST)
elseif ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $empresa = $conn->real_escape_string(trim($data['empresa'] ?? ''));
    $contacto = $conn->real_escape_string(trim($data['contacto'] ?? ''));
    $telefono = $conn->real_escape_string(trim($data['telefono'] ?? ''));
    $email = $conn->real_escape_string(trim($data['email'] ?? ''));

    if ($empresa === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El nombre de la empresa es obligatorio"]);
        exit();
    }

    $sql = "INSERT INTO proveedores (empresa, contacto, telefono, email) 
            VALUES ('$empresa', '$contacto', '$telefono', '$email')";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "ok", "message" => "Proveedor registrado correctamente"]);
        exit();
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Error al guardar proveedor: " . $conn->error]);
        exit();
    }
}

// 3. ACTUALIZAR PROVEEDOR (PUT)
elseif ($metodo === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id'] ?? 0);
    $empresa = $conn->real_escape_string(trim($data['empresa'] ?? ''));
    $contacto = $conn->real_escape_string(trim($data['contacto'] ?? ''));
    $telefono = $conn->real_escape_string(trim($data['telefono'] ?? ''));
    $email = $conn->real_escape_string(trim($data['email'] ?? ''));

    if ($id <= 0 || $empresa === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Datos inválidos para actualizar"]);
        exit();
    }

    $sql = "UPDATE proveedores 
            SET empresa='$empresa', contacto='$contacto', telefono='$telefono', email='$email' 
            WHERE id=$id";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "ok", "message" => "Proveedor actualizado correctamente"]);
        exit();
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Error al actualizar: " . $conn->error]);
        exit();
    }
}

// 4. ELIMINAR PROVEEDOR (DELETE)
elseif ($metodo === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ID de proveedor inválido"]);
        exit();
    }

    $sql = "DELETE FROM proveedores WHERE id=$id";
    if ($conn->query($sql)) {
        echo json_encode(["status" => "ok", "message" => "Proveedor eliminado"]);
        exit();
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Error al eliminar: " . $conn->error]);
        exit();
    }
}
?>
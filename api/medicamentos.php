<?php
require_once 'conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

// 1. LEER (GET) - Obtener todos los medicamentos
if ($metodo === 'GET') {
    $sql = "SELECT id, codigo, nombre, descripcion, precio, stock FROM medicamentos ORDER BY id DESC";
    $res = $conn->query($sql);
    $datos = [];
    while ($fila = $res->fetch_assoc()) {
        $datos[] = $fila;
    }
    echo json_encode($datos);
}

// 2. CREAR (POST) - Insertar un medicamento nuevo
elseif ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $codigo = $conn->real_escape_string($data['codigo']);
    $nombre = $conn->real_escape_string($data['nombre']);
    $descripcion = $conn->real_escape_string($data['descripcion']);
    $precio = floatval($data['precio']);
    $stock = intval($data['stock']);

    $sql = "INSERT INTO medicamentos (codigo, nombre, descripcion, precio, stock) 
            VALUES ('$codigo', '$nombre', '$descripcion', $precio, $stock)";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "ok", "message" => "Medicamento registrado correctamente"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Error al guardar (¿código duplicado?): " . $conn->error]);
    }
}

// 3. ACTUALIZAR (PUT) - Editar medicamento existente
elseif ($metodo === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id']);
    $codigo = $conn->real_escape_string($data['codigo']);
    $nombre = $conn->real_escape_string($data['nombre']);
    $descripcion = $conn->real_escape_string($data['descripcion']);
    $precio = floatval($data['precio']);
    $stock = intval($data['stock']);

    $sql = "UPDATE medicamentos SET codigo='$codigo', nombre='$nombre', descripcion='$descripcion', precio=$precio, stock=$stock WHERE id=$id";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "ok", "message" => "Medicamento actualizado"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}

// 4. ELIMINAR (DELETE) - Borrar por ID
elseif ($metodo === 'DELETE') {
    $id = intval($_GET['id']);
    $sql = "DELETE FROM medicamentos WHERE id=$id";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "ok", "message" => "Medicamento eliminado"]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}
?>
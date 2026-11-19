<?php
require_once 'conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        // Consultar un usuario por id o listar todos sin exponer password
        if (isset($_GET['id']) && is_numeric($_GET['id'])) {
            $id = (int) $_GET['id'];
            $sql = "SELECT id, nombre, email, rol, creado_en FROM usuarios WHERE id = $id";
            $res = $conn->query($sql);

            if ($res && $res->num_rows === 1) {
                echo json_encode([
                    "status" => "ok",
                    "usuario" => $res->fetch_assoc()
                ]);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Usuario no encontrado"]);
            }
        } else {
            $sql = "SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY id DESC";
            $res = $conn->query($sql);

            if ($res) {
                $usuarios = [];
                while ($row = $res->fetch_assoc()) {
                    $usuarios[] = $row;
                }
                echo json_encode([
                    "status" => "ok",
                    "usuarios" => $usuarios
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Error al consultar usuarios"]);
            }
        }
        break;

    case 'POST':
        // Crear nuevo usuario
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        if (
            !$data ||
            empty(trim($data['nombre'] ?? '')) ||
            empty(trim($data['email'] ?? '')) ||
            empty(trim($data['password'] ?? ''))
        ) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Nombre, correo y contraseña son obligatorios"]);
            exit();
        }

        $nombre = $conn->real_escape_string(trim($data['nombre']));
        $email = $conn->real_escape_string(trim($data['email']));
        $password = $conn->real_escape_string(trim($data['password']));
        $rolInput = $data['rol'] ?? 'empleado';
        $rol = in_array($rolInput, ['admin', 'empleado'], true) ? $rolInput : 'empleado';

        // Verificar si el correo ya existe
        $checkSql = "SELECT id FROM usuarios WHERE email = '$email'";
        $checkRes = $conn->query($checkSql);
        if ($checkRes && $checkRes->num_rows > 0) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "El correo electrónico ya está registrado"]);
            exit();
        }

        $sql = "INSERT INTO usuarios (nombre, email, password, rol) VALUES ('$nombre', '$email', '$password', '$rol')";
        if ($conn->query($sql)) {
            $nuevoId = $conn->insert_id;
            http_response_code(201);
            echo json_encode([
                "status" => "ok",
                "message" => "Usuario registrado correctamente",
                "usuario" => [
                    "id" => $nuevoId,
                    "nombre" => trim($data['nombre']),
                    "email" => trim($data['email']),
                    "rol" => $rol
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error al registrar usuario"]);
        }
        break;

    case 'PUT':
        // Actualizar usuario existente
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        $id = isset($data['id']) ? (int) $data['id'] : (isset($_GET['id']) ? (int) $_GET['id'] : 0);

        if ($id <= 0 || !$data || empty(trim($data['nombre'] ?? '')) || empty(trim($data['email'] ?? ''))) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID, nombre y correo son obligatorios"]);
            exit();
        }

        $nombre = $conn->real_escape_string(trim($data['nombre']));
        $email = $conn->real_escape_string(trim($data['email']));
        $rolInput = $data['rol'] ?? 'empleado';
        $rol = in_array($rolInput, ['admin', 'empleado'], true) ? $rolInput : 'empleado';

        // Verificar que el usuario exista
        $existeRes = $conn->query("SELECT id FROM usuarios WHERE id = $id");
        if (!$existeRes || $existeRes->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Usuario no encontrado"]);
            exit();
        }

        // Verificar duplicidad de correo en otro usuario
        $dupRes = $conn->query("SELECT id FROM usuarios WHERE email = '$email' AND id != $id");
        if ($dupRes && $dupRes->num_rows > 0) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Ese correo ya pertenece a otro usuario"]);
            exit();
        }

        // Solo actualizar password si se envía no vacío
        if (!empty(trim($data['password'] ?? ''))) {
            $password = $conn->real_escape_string(trim($data['password']));
            $sql = "UPDATE usuarios SET nombre = '$nombre', email = '$email', password = '$password', rol = '$rol' WHERE id = $id";
        } else {
            $sql = "UPDATE usuarios SET nombre = '$nombre', email = '$email', rol = '$rol' WHERE id = $id";
        }

        if ($conn->query($sql)) {
            echo json_encode([
                "status" => "ok",
                "message" => "Usuario actualizado correctamente"
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error al actualizar usuario"]);
        }
        break;

    case 'DELETE':
        // Eliminar usuario por id (desde query ?id= o cuerpo JSON {"id": ...})
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);
        $id = isset($_GET['id']) ? (int) $_GET['id'] : (isset($data['id']) ? (int) $data['id'] : 0);

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID de usuario inválido"]);
            exit();
        }

        $existeRes = $conn->query("SELECT id FROM usuarios WHERE id = $id");
        if (!$existeRes || $existeRes->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Usuario no encontrado"]);
            exit();
        }

        if ($conn->query("DELETE FROM usuarios WHERE id = $id")) {
            echo json_encode([
                "status" => "ok",
                "message" => "Usuario eliminado correctamente"
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error al eliminar usuario"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Método HTTP no permitido"]);
        break;
}
?>
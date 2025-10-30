<?php
/**
 * submit_contact.php - Enregistre les coordonnées des participants
 * 
 * Utilisé pour envoyer certificat et inclure dans remerciements
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Répondre aux preflight requests (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoriser uniquement POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit();
}

// Récupérer les données
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validation des données
if (!$data || !isset($data['session_id']) || !isset($data['name']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Données invalides']);
    exit();
}

// Validation email
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email invalide']);
    exit();
}

// Créer le répertoire de sauvegarde s'il n'existe pas
$dataDir = '../data/responses';
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Nettoyer les données
$sessionId = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['session_id']);
$name = htmlspecialchars(trim($data['name']), ENT_QUOTES, 'UTF-8');
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$affiliation = isset($data['affiliation']) ? htmlspecialchars(trim($data['affiliation']), ENT_QUOTES, 'UTF-8') : 'Non spécifié';

// Générer nom de fichier unique
$timestamp = date('Y-m-d_H-i-s');
$filename = $dataDir . '/contact_' . $timestamp . '_' . $sessionId . '.json';

// Ajouter métadonnées
$contactData = [
    'session_id' => $sessionId,
    'name' => $name,
    'email' => $email,
    'affiliation' => $affiliation,
    'timestamp' => $data['timestamp'],
    'server_timestamp' => date('c'),
    'ip_hash' => hash('sha256', $_SERVER['REMOTE_ADDR'])
];

// Sauvegarder JSON
$success = file_put_contents($filename, json_encode($contactData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if ($success === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la sauvegarde']);
    exit();
}

// Également sauvegarder dans un fichier consolidé (CSV)
$csvFile = $dataDir . '/contacts_consolidated.csv';
$csvExists = file_exists($csvFile);

$csvHandle = fopen($csvFile, 'a');

// Écrire l'en-tête si nouveau fichier
if (!$csvExists) {
    fputcsv($csvHandle, [
        'session_id',
        'timestamp',
        'name',
        'email',
        'affiliation',
        'ip_hash'
    ]);
}

// Écrire les données
fputcsv($csvHandle, [
    $sessionId,
    $data['timestamp'],
    $name,
    $email,
    $affiliation,
    $contactData['ip_hash']
]);

fclose($csvHandle);

// Log (optionnel)
$logFile = $dataDir . '/contacts.log';
file_put_contents(
    $logFile,
    date('Y-m-d H:i:s') . " - Session: {$sessionId} - Name: {$name} - Email: {$email}\n",
    FILE_APPEND
);

// Réponse succès
http_response_code(200);
echo json_encode([
    'success' => true,
    'session_id' => $sessionId,
    'message' => 'Coordonnées enregistrées avec succès'
]);
?>

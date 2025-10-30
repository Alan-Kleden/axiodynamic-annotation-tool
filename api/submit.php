<?php
/**
 * submit.php - Endpoint pour sauvegarder les annotations
 * 
 * SÉCURITÉ :
 * - N'accepte que les requêtes POST
 * - Valide les données reçues
 * - Protège contre injections
 * - Enregistre dans fichiers JSON horodatés
 * 
 * VERSION CORRIGÉE : 2025-10-26
 * - Validation flexible du nombre d'annotations (1-30 au lieu de strictement 20)
 * - Amélioration des messages d'erreur pour diagnostic
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
if (!$data || !isset($data['session_id']) || !isset($data['annotations'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Données invalides - session_id ou annotations manquant']);
    exit();
}

// ✅ CORRECTION : Validation flexible du nombre d'annotations (1-30)
// Permet de gérer différents nombres d'excerpts (12, 20, etc.)
$annotationCount = count($data['annotations']);
if ($annotationCount < 1 || $annotationCount > 30) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Nombre d\'annotations invalide',
        'received' => $annotationCount,
        'expected' => '1-30'
    ]);
    exit();
}

// Validation de chaque annotation
foreach ($data['annotations'] as $annotation) {
    if (!isset($annotation['excerpt_id']) || 
        !isset($annotation['fc']) || 
        !isset($annotation['fi']) ||
        $annotation['fc'] < 0 || $annotation['fc'] > 5 ||
        $annotation['fi'] < 0 || $annotation['fi'] > 5) {
        http_response_code(400);
        echo json_encode(['error' => 'Annotation invalide - vérifier fc/fi (0-5)']);
        exit();
    }
}

// Créer le répertoire de sauvegarde s'il n'existe pas
$dataDir = '../data/responses';
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Générer nom de fichier unique
$sessionId = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['session_id']);
$timestamp = date('Y-m-d_H-i-s');
$filename = $dataDir . '/' . $timestamp . '_' . $sessionId . '.json';

// Ajouter métadonnées
$data['server_timestamp'] = date('c');
$data['ip_hash'] = hash('sha256', $_SERVER['REMOTE_ADDR']); // IP anonymisée
$data['saved'] = true;

// Sauvegarder
$success = file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if ($success === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la sauvegarde JSON']);
    exit();
}

// Également sauvegarder dans un fichier consolidé (CSV)
$csvFile = $dataDir . '/annotations_consolidated.csv';
$csvExists = file_exists($csvFile);

$csvHandle = fopen($csvFile, 'a');

if ($csvHandle === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de l\'ouverture du CSV']);
    exit();
}

// Écrire l'en-tête si nouveau fichier
if (!$csvExists) {
    fputcsv($csvHandle, [
        'session_id',
        'timestamp',
        'excerpt_id',
        'actor',
        'fc',
        'fi',
        'duration_seconds',
        'comment',
        'ip_hash'
    ]);
}

// Écrire chaque annotation
foreach ($data['annotations'] as $annotation) {
    fputcsv($csvHandle, [
        $data['session_id'],
        $annotation['timestamp'] ?? $data['timestamp'] ?? date('c'),
        $annotation['excerpt_id'],
        $annotation['actor'] ?? $annotation['author'] ?? 'Unknown',  // ✅ Support actor OU author
        $annotation['fc'],
        $annotation['fi'],
        $annotation['duration_seconds'] ?? 0,
        $annotation['comment'] ?? '',
        $data['ip_hash']
    ]);
}

fclose($csvHandle);

// Réponse succès
http_response_code(200);
echo json_encode([
    'success' => true,
    'session_id' => $data['session_id'],
    'message' => 'Annotations enregistrées avec succès',
    'filename' => basename($filename),
    'annotations_count' => $annotationCount
]);

// Log (optionnel)
$logFile = $dataDir . '/submissions.log';
file_put_contents(
    $logFile,
    date('Y-m-d H:i:s') . " - Session: {$data['session_id']} - Annotations: " . count($data['annotations']) . " - SUCCESS\n",
    FILE_APPEND
);
?>

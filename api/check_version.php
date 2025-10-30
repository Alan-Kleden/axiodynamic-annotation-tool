<?php
// check_version.php - Vérifier quelle version est installée
header('Content-Type: text/html; charset=utf-8');
echo "<h2>Version installée</h2>";
echo "<pre>";

$file = __DIR__ . '/send_certificate.php';

if (file_exists($file)) {
    $content = file_get_contents($file);
    
    echo "Taille: " . filesize($file) . " octets\n\n";
    
    // Vérifier version
    if (strpos($content, 'Version 8.0 avec PDF') !== false) {
        echo "✅ Version 8.0 (PDF)\n";
    } else {
        echo "❌ Version ancienne\n";
    }
    
    // Vérifier CORS
    if (strpos($content, "if (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS')") !== false) {
        echo "✅ Gestion CORS OPTIONS présente\n";
    } else {
        echo "❌ Gestion CORS OPTIONS ABSENTE\n";
    }
    
    // Vérifier FPDF
    if (strpos($content, 'fpdf.php') !== false) {
        echo "✅ FPDF requis\n";
    } else {
        echo "❌ FPDF non requis\n";
    }
    
    // Vérifier SMTP_USER
    if (strpos($content, 'ak@alankleden.com') !== false) {
        echo "✅ SMTP_USER correct (ak@alankleden.com)\n";
    } else {
        echo "❌ SMTP_USER incorrect\n";
    }
    
    // Afficher les 50 premières lignes
    echo "\n\n=== 50 PREMIÈRES LIGNES ===\n\n";
    $lines = explode("\n", $content);
    echo implode("\n", array_slice($lines, 0, 50));
    
} else {
    echo "❌ Fichier non trouvé !";
}
echo "</pre>";
?>
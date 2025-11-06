<?php
// test_auth.php - Test authentification SMTP
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Test Authentification SMTP</h2>";

$passwords = [
    'Version 1 (simple backslash)' => 'BByD2X\Tvp3gB',
    'Version 2 (double backslash)' => 'BByD2X\\Tvp3gB',
    'Version 3 (raw string)' => 'BByD2X\Tvp3gB', // Exactement comme tapé
];

foreach ($passwords as $label => $password) {
    echo "<h3>$label</h3>";
    echo "Mot de passe: <code>" . htmlspecialchars($password) . "</code><br>";
    echo "Longueur: " . strlen($password) . " caractères<br>";
    echo "Base64: <code>" . base64_encode($password) . "</code><br>";
    echo "Hex: <code>" . bin2hex($password) . "</code><br><br>";
}

echo "<hr><h3>Test connexion SMTP</h3>";

$smtp = @fsockopen('ssl://smtp.hostinger.com', 465, $errno, $errstr, 30);
if (!$smtp) {
    die("Erreur connexion: $errstr");
}

echo "✅ Connecté<br>";

// Lire bannière
$response = fgets($smtp, 515);
echo "Banner: " . htmlspecialchars($response) . "<br>";

// EHLO
fputs($smtp, "EHLO smtp.hostinger.com\r\n");
while (true) {
    $response = fgets($smtp, 515);
    echo "EHLO: " . htmlspecialchars($response) . "<br>";
    if ($response[3] != '-') break;
}

// AUTH LOGIN
fputs($smtp, "AUTH LOGIN\r\n");
$response = fgets($smtp, 515);
echo "<strong>AUTH:</strong> " . htmlspecialchars($response) . "<br>";

// Username
$username = 'noreply@alankleden.com';
echo "Envoi username: <code>" . $username . "</code> (base64: " . base64_encode($username) . ")<br>";
fputs($smtp, base64_encode($username) . "\r\n");
$response = fgets($smtp, 515);
echo "<strong>User response:</strong> " . htmlspecialchars($response) . "<br>";

// Password - TESTEZ AVEC LE BON MOT DE PASSE
$password = 'BByD2X\\Tvp3gB'; // Version avec double backslash
echo "Envoi password: <code>" . htmlspecialchars($password) . "</code> (base64: " . base64_encode($password) . ")<br>";
fputs($smtp, base64_encode($password) . "\r\n");
$response = fgets($smtp, 515);
echo "<strong>Pass response:</strong> " . htmlspecialchars($response) . "<br>";

if (substr($response, 0, 3) == '235') {
    echo "<h2 style='color:green'>✅ AUTHENTIFICATION RÉUSSIE !</h2>";
} else {
    echo "<h2 style='color:red'>❌ AUTHENTIFICATION ÉCHOUÉE</h2>";
    echo "<p>Code erreur: " . substr($response, 0, 3) . "</p>";
}

fputs($smtp, "QUIT\r\n");
fclose($smtp);

echo "<hr>";
echo "<h3>Action à faire :</h3>";
echo "<ol>";
echo "<li>Vérifiez sur Hostinger que le compte <strong>noreply@alankleden.com</strong> est actif</li>";
echo "<li>Réinitialisez le mot de passe si nécessaire</li>";
echo "<li>Testez de vous connecter au webmail avec ce mot de passe</li>";
echo "<li>OU utilisez directement <strong>ak@alankleden.com</strong> (dont le mot de passe fonctionne)</li>";
echo "</ol>";
?>
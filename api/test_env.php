<?php
// test_env.php - Tester si les variables d'environnement fonctionnent

echo "<h2>Test Variables d'Environnement</h2>";
echo "<style>body{font-family:monospace;padding:20px}.ok{color:green}.error{color:red}</style>";

echo "<h3>1. Variables depuis .htaccess</h3>";

$smtpUser = getenv('SMTP_USER');
$smtpPass = getenv('SMTP_PASSWORD');

if ($smtpUser) {
    echo "<div class='ok'>✅ SMTP_USER: " . htmlspecialchars($smtpUser) . "</div>";
} else {
    echo "<div class='error'>❌ SMTP_USER: NON DÉFINI</div>";
}

if ($smtpPass) {
    echo "<div class='ok'>✅ SMTP_PASSWORD: ****** (défini, " . strlen($smtpPass) . " caractères)</div>";
} else {
    echo "<div class='error'>❌ SMTP_PASSWORD: NON DÉFINI</div>";
}

echo "<h3>2. Alternative avec \$_SERVER</h3>";

$smtpUser2 = $_SERVER['SMTP_USER'] ?? null;
$smtpPass2 = $_SERVER['SMTP_PASSWORD'] ?? null;

if ($smtpUser2) {
    echo "<div class='ok'>✅ \$_SERVER['SMTP_USER']: " . htmlspecialchars($smtpUser2) . "</div>";
} else {
    echo "<div class='error'>❌ \$_SERVER['SMTP_USER']: NON DÉFINI</div>";
}

if ($smtpPass2) {
    echo "<div class='ok'>✅ \$_SERVER['SMTP_PASSWORD']: ****** (défini)</div>";
} else {
    echo "<div class='error'>❌ \$_SERVER['SMTP_PASSWORD']: NON DÉFINI</div>";
}

echo "<h3>3. Fichier .htaccess</h3>";

$htaccess = $_SERVER['DOCUMENT_ROOT'] . '/.htaccess';
if (file_exists($htaccess)) {
    echo "<div class='ok'>✅ .htaccess existe</div>";
    $content = file_get_contents($htaccess);
    if (strpos($content, 'SetEnv SMTP_') !== false) {
        echo "<div class='ok'>✅ Contient 'SetEnv SMTP_'</div>";
    } else {
        echo "<div class='error'>❌ Ne contient PAS 'SetEnv SMTP_'</div>";
    }
} else {
    echo "<div class='error'>❌ .htaccess n'existe pas dans " . htmlspecialchars($htaccess) . "</div>";
}

echo "<h3>4. Solution</h3>";

if (!$smtpUser && !$smtpUser2) {
    echo "<div class='error'>";
    echo "<strong>Les variables d'environnement ne fonctionnent pas !</strong><br><br>";
    echo "Options :<br>";
    echo "1. Vérifiez que .htaccess est bien dans /public_html/<br>";
    echo "2. Vérifiez que mod_env est activé sur le serveur<br>";
    echo "3. OU utilisez un fichier config.php séparé<br>";
    echo "</div>";
} else {
    echo "<div class='ok'>✅ Les variables fonctionnent !</div>";
}

echo "<hr>";
echo "<p><small>Test généré le " . date('Y-m-d H:i:s') . "</small></p>";
?>
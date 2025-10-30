<?php
// send_certificate.php - Version SMTP manuel (sans dépendances)
// Version 7.3 FINAL - 2025-10-29

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration SMTP Hostinger
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 465); // SSL
define('SMTP_USER', 'noreply@alankleden.com');
define('SMTP_PASS', 'BByD2X\Tvp3gB');
define('SMTP_FROM', 'noreply@alankleden.com');
define('SMTP_FROM_NAME', 'Alan Kleden - Axiodynamics Research');
define('ADMIN_EMAIL', 'ak@alankleden.com');

// Vérifier méthode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Lire les données
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Valider
$required = ['name', 'email', 'session_id', 'language'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing field: $field"]);
        exit;
    }
}

$name = htmlspecialchars($data['name']);
$email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
$sessionId = htmlspecialchars($data['session_id']);
$language = htmlspecialchars($data['language']);
$affiliation = htmlspecialchars($data['affiliation'] ?? 'Non spécifié');

if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email']);
    exit;
}

// Générer certificat
$certificateUrl = generateCertificate($name, $sessionId, $language, $affiliation);

// Envoyer email avec SMTP
$result = sendEmailSMTP($email, $name, $language, $certificateUrl);

if ($result['success']) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Certificate sent successfully',
        'certificate_url' => $certificateUrl
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $result['error']
    ]);
}

// Fonction SMTP manuelle (connexion SSL)
function sendEmailSMTP($to, $name, $language, $certificateUrl) {
    $subject = getSubject($language);
    $htmlBody = getEmailBody($name, $language, $certificateUrl);
    
    // Connexion SSL sur port 465
    $smtp = @fsockopen('ssl://' . SMTP_HOST, SMTP_PORT, $errno, $errstr, 30);
    
    if (!$smtp) {
        return ['success' => false, 'error' => "Connection failed: $errstr ($errno)"];
    }
    
    // Lire bannière serveur
    $response = fgets($smtp, 515);
    if (substr($response, 0, 3) != '220') {
        fclose($smtp);
        return ['success' => false, 'error' => 'Server not ready: ' . $response];
    }
    
    // EHLO
    fputs($smtp, "EHLO " . SMTP_HOST . "\r\n");
    $response = fgets($smtp, 515);
    
    // AUTH LOGIN
    fputs($smtp, "AUTH LOGIN\r\n");
    $response = fgets($smtp, 515);
    if (substr($response, 0, 3) != '334') {
        fclose($smtp);
        return ['success' => false, 'error' => 'AUTH not supported: ' . $response];
    }
    
    // Username
    fputs($smtp, base64_encode(SMTP_USER) . "\r\n");
    $response = fgets($smtp, 515);
    
    // Password
    fputs($smtp, base64_encode(SMTP_PASS) . "\r\n");
    $response = fgets($smtp, 515);
    
    if (substr($response, 0, 3) != '235') {
        fclose($smtp);
        return ['success' => false, 'error' => 'Authentication failed: ' . $response];
    }
    
    // MAIL FROM
    fputs($smtp, "MAIL FROM: <" . SMTP_FROM . ">\r\n");
    $response = fgets($smtp, 515);
    if (substr($response, 0, 3) != '250') {
        fclose($smtp);
        return ['success' => false, 'error' => 'MAIL FROM failed: ' . $response];
    }
    
    // RCPT TO
    fputs($smtp, "RCPT TO: <$to>\r\n");
    $response = fgets($smtp, 515);
    if (substr($response, 0, 3) != '250') {
        fclose($smtp);
        return ['success' => false, 'error' => 'RCPT TO failed: ' . $response];
    }
    
    // DATA
    fputs($smtp, "DATA\r\n");
    $response = fgets($smtp, 515);
    if (substr($response, 0, 3) != '354') {
        fclose($smtp);
        return ['success' => false, 'error' => 'DATA failed: ' . $response];
    }
    
    // Headers et corps
    $message = "From: " . SMTP_FROM_NAME . " <" . SMTP_FROM . ">\r\n";
    $message .= "To: <$to>\r\n";
    $message .= "Reply-To: " . ADMIN_EMAIL . "\r\n";
    $message .= "Subject: $subject\r\n";
    $message .= "MIME-Version: 1.0\r\n";
    $message .= "Content-Type: text/html; charset=UTF-8\r\n";
    $message .= "\r\n";
    $message .= $htmlBody . "\r\n";
    $message .= ".\r\n";
    
    fputs($smtp, $message);
    $response = fgets($smtp, 515);
    
    // QUIT
    fputs($smtp, "QUIT\r\n");
    fclose($smtp);
    
    if (substr($response, 0, 3) == '250') {
        return ['success' => true];
    } else {
        return ['success' => false, 'error' => 'Send failed: ' . $response];
    }
}

function getSubject($language) {
    $subjects = [
        'en' => 'Your Participation Certificate - Axiodynamics Research',
        'fr' => 'Votre Certificat de Participation - Recherche Axiodynamique',
        'es' => 'Su Certificado de Participacion - Investigacion Axiodynamica',
        'zh' => 'Your Participation Certificate - Axiodynamics Research'
    ];
    return $subjects[$language] ?? $subjects['en'];
}

function generateCertificate($name, $sessionId, $language, $affiliation) {
    $certDir = __DIR__ . '/../certificates/';
    if (!file_exists($certDir)) {
        mkdir($certDir, 0755, true);
    }
    
    $filename = 'certificate_' . $sessionId . '.html';
    $filepath = $certDir . $filename;
    
    $html = generateCertificateHTML($name, $sessionId, $language, $affiliation);
    file_put_contents($filepath, $html);
    
    return 'https://alankleden.com/annotation-tool-multilingual/certificates/' . $filename;
}

function generateCertificateHTML($name, $sessionId, $language, $affiliation) {
    $date = date('d/m/Y');
    
    $texts = [
        'en' => ['title' => 'CERTIFICATE OF PARTICIPATION', 'text1' => 'This certifies that', 'text2' => 'has participated in the research project', 'text3' => 'Computational Validation of Axiodynamics Concepts', 'text4' => 'Affiliation:', 'text5' => 'Session ID:', 'text6' => 'Date:', 'text7' => 'OSF Project:', 'signature' => 'Alan Kleden, Researcher'],
        'fr' => ['title' => 'CERTIFICAT DE PARTICIPATION', 'text1' => 'Certifie que', 'text2' => 'a participe au projet de recherche', 'text3' => 'Validation Computationnelle des Concepts de l\'Axiodynamique', 'text4' => 'Affiliation :', 'text5' => 'ID Session :', 'text6' => 'Date :', 'text7' => 'Projet OSF :', 'signature' => 'Alan Kleden, Chercheur'],
        'es' => ['title' => 'CERTIFICADO DE PARTICIPACION', 'text1' => 'Certifica que', 'text2' => 'ha participado en el proyecto de investigacion', 'text3' => 'Validacion Computacional de Conceptos Axiodinamicos', 'text4' => 'Afiliacion:', 'text5' => 'ID Sesion:', 'text6' => 'Fecha:', 'text7' => 'Proyecto OSF:', 'signature' => 'Alan Kleden, Investigador'],
        'zh' => ['title' => 'CERTIFICATE OF PARTICIPATION', 'text1' => 'This certifies that', 'text2' => 'has participated in the research project', 'text3' => 'Computational Validation of Axiodynamics Concepts', 'text4' => 'Affiliation:', 'text5' => 'Session ID:', 'text6' => 'Date:', 'text7' => 'OSF Project:', 'signature' => 'Alan Kleden, Researcher']
    ];
    
    $t = $texts[$language] ?? $texts['en'];
    
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' . $t['title'] . '</title><style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:40px;border:3px solid #003366;background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)}.certificate{background:white;padding:60px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.1)}.logo{margin-bottom:30px}h1{color:#003366;font-size:32px;margin-bottom:40px;border-bottom:2px solid #003366;padding-bottom:20px}.participant-name{font-size:28px;font-weight:bold;color:#003366;margin:30px 0;text-decoration:underline}.project-title{font-size:20px;font-style:italic;color:#555;margin:20px 0}.details{margin:40px 0;text-align:left;font-size:14px;color:#666}.signature{margin-top:60px;font-size:16px;font-style:italic}.signature-line{width:300px;margin:40px auto 10px;border-top:2px solid #003366}</style></head><body><div class="certificate"><div class="logo"><img src="https://alankleden.com/annotation-tool-multilingual/logo.png" alt="Logo" height="80"></div><h1>' . $t['title'] . '</h1><p>' . $t['text1'] . '</p><div class="participant-name">' . htmlspecialchars($name) . '</div><p>' . $t['text2'] . '</p><div class="project-title">' . $t['text3'] . '</div><div class="details"><p><strong>' . $t['text4'] . '</strong> ' . htmlspecialchars($affiliation) . '</p><p><strong>' . $t['text5'] . '</strong> ' . htmlspecialchars($sessionId) . '</p><p><strong>' . $t['text6'] . '</strong> ' . $date . '</p><p><strong>' . $t['text7'] . '</strong> <a href="https://osf.io/rm42h">https://osf.io/rm42h</a></p></div><div class="signature-line"></div><div class="signature">' . $t['signature'] . '</div></div></body></html>';
}

function getEmailBody($name, $language, $certificateUrl) {
    $texts = [
        'en' => ['greeting' => 'Dear', 'thanks' => 'Thank you for your participation!', 'certificate' => 'Your certificate:', 'button' => 'View Certificate', 'note' => 'This confirms your contribution.', 'contact' => 'Questions:', 'best' => 'Best regards,', 'signature' => 'Alan Kleden<br>Researcher'],
        'fr' => ['greeting' => 'Cher/Chere', 'thanks' => 'Merci pour votre participation !', 'certificate' => 'Votre certificat :', 'button' => 'Voir le Certificat', 'note' => 'Ceci confirme votre contribution.', 'contact' => 'Questions :', 'best' => 'Cordialement,', 'signature' => 'Alan Kleden<br>Chercheur'],
        'es' => ['greeting' => 'Estimado/a', 'thanks' => 'Gracias por su participacion!', 'certificate' => 'Su certificado:', 'button' => 'Ver Certificado', 'note' => 'Esto confirma su contribucion.', 'contact' => 'Preguntas:', 'best' => 'Saludos,', 'signature' => 'Alan Kleden<br>Investigador'],
        'zh' => ['greeting' => 'Dear', 'thanks' => 'Thank you for your participation!', 'certificate' => 'Your certificate:', 'button' => 'View Certificate', 'note' => 'This confirms your contribution.', 'contact' => 'Questions:', 'best' => 'Best regards,', 'signature' => 'Alan Kleden<br>Researcher']
    ];
    
    $t = $texts[$language] ?? $texts['en'];
    
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center}.content{background:#f9f9f9;padding:30px}.button{display:inline-block;background:#667eea;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;margin:20px 0}.footer{text-align:center;padding:20px;color:#666;font-size:12px}</style></head><body><div class="container"><div class="header"><h1>Axiodynamic Tool</h1></div><div class="content"><p><strong>' . $t['greeting'] . ' ' . htmlspecialchars($name) . ',</strong></p><p>' . $t['thanks'] . '</p><p>' . $t['certificate'] . '</p><p style="text-align:center;"><a href="' . htmlspecialchars($certificateUrl) . '" class="button">' . $t['button'] . '</a></p><p><em>' . $t['note'] . '</em></p><p>' . $t['contact'] . ' <a href="mailto:ak@alankleden.com">ak@alankleden.com</a></p><p>' . $t['best'] . '<br>' . $t['signature'] . '</p></div><div class="footer"><p>OSF: <a href="https://osf.io/rm42h">https://osf.io/rm42h</a></p></div></div></body></html>';
}
?>

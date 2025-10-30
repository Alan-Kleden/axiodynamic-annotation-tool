<?php
// send_certificate.php - Version 8.2 FINAL
// 2025-10-29 - 16:10

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log de debug
$logFile = __DIR__ . '/debug_method.log';
file_put_contents($logFile, date('Y-m-d H:i:s') . " - Version 8.2 - Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents($logFile, "OPTIONS handled, exiting with 200\n", FILE_APPEND);
    http_response_code(200);
    exit;
}

// Configuration SMTP - depuis variables d'environnement
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 465);
define('SMTP_USER', getenv('SMTP_USER') ?: 'ak@alankleden.com'); // Fallback si pas défini
define('SMTP_PASS', getenv('SMTP_PASSWORD') ?: ''); // Mot de passe depuis .htaccess
define('SMTP_FROM', 'noreply@alankleden.com');
define('SMTP_FROM_NAME', 'Alan Kleden - Axiodynamics Research');
define('ADMIN_EMAIL', 'ak@alankleden.com');

// Debug : vérifier que les credentials sont chargés
file_put_contents($logFile, "SMTP_USER: " . SMTP_USER . "\n", FILE_APPEND);
file_put_contents($logFile, "SMTP_PASS length: " . strlen(SMTP_PASS) . " chars\n", FILE_APPEND);

if (empty(SMTP_PASS)) {
    file_put_contents($logFile, "ERROR: SMTP_PASS is empty!\n", FILE_APPEND);
    throw new Exception('SMTP password not configured');
}

file_put_contents($logFile, "Configuration SMTP OK\n", FILE_APPEND);

try {
    file_put_contents($logFile, "Entering try block\n", FILE_APPEND);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        file_put_contents($logFile, "ERROR: Method is not POST: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
        throw new Exception('Method not allowed');
    }
    
    file_put_contents($logFile, "Method is POST, continuing...\n", FILE_APPEND);
    
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        throw new Exception('Invalid JSON');
    }
    
    $required = ['name', 'email', 'session_id', 'language'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing field: $field");
        }
    }
    
    $name = htmlspecialchars($data['name']);
    $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
    $sessionId = htmlspecialchars($data['session_id']);
    $language = htmlspecialchars($data['language']);
    $affiliation = htmlspecialchars($data['affiliation'] ?? 'Non specifie');
    
    if (!$email) {
        throw new Exception('Invalid email');
    }
    
    // Générer PDF
    $pdfPath = generateCertificatePDF($name, $sessionId, $language, $affiliation);
    
    // Envoyer email avec PDF en pièce jointe
    $result = sendEmailWithAttachment($email, $name, $language, $pdfPath);
    
    if ($result['success']) {
        // Nettoyer le PDF temporaire (optionnel)
        // unlink($pdfPath);
        
        echo json_encode([
            'success' => true,
            'message' => 'Certificate sent successfully'
        ]);
    } else {
        throw new Exception($result['error']);
    }
    
} catch (Exception $e) {
    file_put_contents($logFile, "EXCEPTION CAUGHT: " . $e->getMessage() . "\n", FILE_APPEND);
    file_put_contents($logFile, "Trace: " . $e->getTraceAsString() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Fonction pour générer le PDF
function generateCertificatePDF($name, $sessionId, $language, $affiliation) {
    require_once(__DIR__ . '/fpdf.php');
    
    $texts = [
        'en' => ['title' => 'CERTIFICATE OF PARTICIPATION', 'text1' => 'This certifies that', 'text2' => 'has participated in the research project', 'text3' => 'Computational Validation of Axiodynamics Concepts', 'text4' => 'Affiliation:', 'text5' => 'Session ID:', 'text6' => 'Date:', 'text7' => 'OSF Project:', 'signature' => 'Alan Kleden, Researcher'],
        'fr' => ['title' => 'CERTIFICAT DE PARTICIPATION', 'text1' => 'Certifie que', 'text2' => 'a participe au projet de recherche', 'text3' => 'Validation Computationnelle des Concepts de l\'Axiodynamique', 'text4' => 'Affiliation :', 'text5' => 'ID Session :', 'text6' => 'Date :', 'text7' => 'Projet OSF :', 'signature' => 'Alan Kleden, Chercheur'],
        'es' => ['title' => 'CERTIFICADO DE PARTICIPACION', 'text1' => 'Certifica que', 'text2' => 'ha participado en el proyecto de investigacion', 'text3' => 'Validacion Computacional de Conceptos Axiodinamicos', 'text4' => 'Afiliacion:', 'text5' => 'ID Sesion:', 'text6' => 'Fecha:', 'text7' => 'Proyecto OSF:', 'signature' => 'Alan Kleden, Investigador'],
        'zh' => ['title' => 'CERTIFICATE OF PARTICIPATION', 'text1' => 'This certifies that', 'text2' => 'has participated in the research project', 'text3' => 'Computational Validation of Axiodynamics Concepts', 'text4' => 'Affiliation:', 'text5' => 'Session ID:', 'text6' => 'Date:', 'text7' => 'OSF Project:', 'signature' => 'Alan Kleden, Researcher']
    ];
    
    $t = $texts[$language] ?? $texts['en'];
    $date = date('d/m/Y');
    
    $pdf = new FPDF('P', 'mm', 'A4');
    $pdf->AddPage();
    $pdf->SetFont('Arial', '', 12); // Force Arial au démarrage
    
    // Bordure
    $pdf->SetLineWidth(1);
    $pdf->SetDrawColor(0, 51, 102); // #003366
    $pdf->Rect(10, 10, 190, 277, 'D');
    
    $pdf->Ln(10);
    
    // Logo (réduit, centré)
    $logoPath = __DIR__ . '/Logo.jpg';
    if (file_exists($logoPath)) {
        try {
            $imageInfo = @getimagesize($logoPath);
            if ($imageInfo && ($imageInfo[2] == IMAGETYPE_PNG || $imageInfo[2] == IMAGETYPE_JPEG)) {
                $pdf->Image($logoPath, 90, 25, 25); // Réduit de 40 à 25mm
            }
        } catch (Exception $e) {
            // Continuer sans logo
        }
    }
    
    $pdf->SetY(55); // Position après logo
    
    // Titre
    $pdf->SetFont('Arial', 'B', 20);
    $pdf->SetTextColor(0, 51, 102);
    $pdf->Cell(0, 10, utf8_decode($t['title']), 0, 1, 'C');
    $pdf->Ln(8);
    
    // Texte 1
    $pdf->SetFont('Arial', '', 13);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(0, 8, utf8_decode($t['text1']), 0, 1, 'C');
    $pdf->Ln(3);
    
    // Nom participant
    $pdf->SetFont('Arial', 'BU', 18);
    $pdf->SetTextColor(0, 51, 102);
    $pdf->Cell(0, 10, utf8_decode($name), 0, 1, 'C');
    $pdf->Ln(3);
    
    // Texte 2
    $pdf->SetFont('Arial', '', 13);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(0, 8, utf8_decode($t['text2']), 0, 1, 'C');
    $pdf->Ln(3);
    
    // Titre projet
    $pdf->SetFont('Arial', 'I', 14);
    $pdf->SetTextColor(85, 85, 85);
    $pdf->MultiCell(0, 8, utf8_decode($t['text3']), 0, 'C');
    $pdf->Ln(8);
    
    // Détails
    $pdf->SetFont('Arial', '', 12);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(60, 8, utf8_decode($t['text4']), 0, 0, 'R');
    $pdf->SetFont('Arial', '', 12);
    $pdf->Cell(0, 8, utf8_decode($affiliation), 0, 1, 'L');
    
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(60, 8, utf8_decode($t['text5']), 0, 0, 'R');
    $pdf->SetFont('Arial', '', 12);
    $pdf->Cell(0, 8, $sessionId, 0, 1, 'L');
    
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(60, 8, utf8_decode($t['text6']), 0, 0, 'R');
    $pdf->SetFont('Arial', '', 12);
    $pdf->Cell(0, 8, $date, 0, 1, 'L');
    
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(60, 8, utf8_decode($t['text7']), 0, 0, 'R');
    $pdf->SetFont('Arial', 'U', 12);
    $pdf->SetTextColor(0, 0, 255);
    $pdf->Cell(0, 8, 'https://osf.io/rm42h', 0, 1, 'L');
    
    // Signature
    $pdf->Ln(15);
    
    // Image signature (si disponible)
    $signaturePath = __DIR__ . '/Signature_Alan_Kleden.jpg';
    if (file_exists($signaturePath)) {
        try {
            $imageInfo = @getimagesize($signaturePath);
            if ($imageInfo && ($imageInfo[2] == IMAGETYPE_PNG || $imageInfo[2] == IMAGETYPE_JPEG)) {
                // Signature centrée, 40mm de large
                $pdf->Image($signaturePath, 85, $pdf->GetY(), 40);
                $pdf->Ln(20); // Espace après signature
            }
        } catch (Exception $e) {
            // Continuer sans signature image
            $pdf->Ln(5);
        }
    } else {
        // Ligne de signature si pas d'image
        $pdf->SetDrawColor(0, 51, 102);
        $pdf->Line(85, $pdf->GetY(), 125, $pdf->GetY());
        $pdf->Ln(5);
    }
    
    // Nom signature
    $pdf->SetFont('Arial', 'I', 12);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(0, 10, utf8_decode($t['signature']), 0, 1, 'C');
    
    // Sauvegarder
    $pdfDir = __DIR__ . '/../certificates/';
    if (!file_exists($pdfDir)) {
        mkdir($pdfDir, 0755, true);
    }
    
    $filename = 'certificate_' . $sessionId . '.pdf';
    $filepath = $pdfDir . $filename;
    $pdf->Output('F', $filepath);
    
    return $filepath;
}

// Fonction pour envoyer email avec pièce jointe
function sendEmailWithAttachment($to, $name, $language, $pdfPath) {
    $subject = getSubject($language);
    $htmlBody = getEmailBody($name, $language);
    
    // Lire le PDF
    $pdfContent = file_get_contents($pdfPath);
    $pdfBase64 = chunk_split(base64_encode($pdfContent));
    $pdfFilename = basename($pdfPath);
    
    // Boundary pour multipart
    $boundary = md5(time());
    
    // Connexion SMTP
    $smtp = @fsockopen('ssl://' . SMTP_HOST, SMTP_PORT, $errno, $errstr, 30);
    if (!$smtp) {
        return ['success' => false, 'error' => "Connection failed: $errstr"];
    }
    
    // Bannière
    fgets($smtp, 515);
    
    // EHLO
    fputs($smtp, "EHLO " . SMTP_HOST . "\r\n");
    while (true) {
        $response = fgets($smtp, 515);
        if ($response[3] != '-') break;
    }
    
    // AUTH LOGIN
    fputs($smtp, "AUTH LOGIN\r\n");
    fgets($smtp, 515);
    fputs($smtp, base64_encode(SMTP_USER) . "\r\n");
    fgets($smtp, 515);
    fputs($smtp, base64_encode(SMTP_PASS) . "\r\n");
    $response = fgets($smtp, 515);
    
    if (substr($response, 0, 3) != '235') {
        fclose($smtp);
        return ['success' => false, 'error' => 'Auth failed'];
    }
    
    // MAIL FROM
    fputs($smtp, "MAIL FROM: <" . SMTP_FROM . ">\r\n");
    fgets($smtp, 515);
    
    // RCPT TO
    fputs($smtp, "RCPT TO: <$to>\r\n");
    fgets($smtp, 515);
    
    // DATA
    fputs($smtp, "DATA\r\n");
    fgets($smtp, 515);
    
    // Headers et corps avec pièce jointe
    $message = "From: " . SMTP_FROM_NAME . " <" . SMTP_FROM . ">\r\n";
    $message .= "To: <$to>\r\n";
    $message .= "Subject: $subject\r\n";
    $message .= "MIME-Version: 1.0\r\n";
    $message .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
    $message .= "\r\n";
    
    // Partie HTML
    $message .= "--$boundary\r\n";
    $message .= "Content-Type: text/html; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n";
    $message .= "\r\n";
    $message .= $htmlBody . "\r\n";
    
    // Pièce jointe PDF
    $message .= "--$boundary\r\n";
    $message .= "Content-Type: application/pdf; name=\"$pdfFilename\"\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n";
    $message .= "Content-Disposition: attachment; filename=\"$pdfFilename\"\r\n";
    $message .= "\r\n";
    $message .= $pdfBase64 . "\r\n";
    
    $message .= "--$boundary--\r\n";
    $message .= ".\r\n";
    
    fputs($smtp, $message);
    $response = fgets($smtp, 515);
    
    fputs($smtp, "QUIT\r\n");
    fclose($smtp);
    
    return ['success' => true];
}

function getSubject($language) {
    $subjects = [
        'en' => 'Your Participation Certificate - Axiodynamics Research',
        'fr' => 'Votre Certificat de Participation - Recherche Axiodynamique',
        'es' => 'Su Certificado de Participacion - Investigacion Axiodi namica',
        'zh' => 'Your Participation Certificate - Axiodynamics Research'
    ];
    return $subjects[$language] ?? $subjects['en'];
}

function getEmailBody($name, $language) {
    $texts = [
        'en' => ['greeting' => 'Dear', 'thanks' => 'Thank you for your participation!', 'attached' => 'Your certificate is attached to this email.', 'note' => 'This confirms your contribution.', 'best' => 'Best regards,'],
        'fr' => ['greeting' => 'Cher/Chere', 'thanks' => 'Merci pour votre participation !', 'attached' => 'Votre certificat est en piece jointe de cet email.', 'note' => 'Ceci confirme votre contribution.', 'best' => 'Cordialement,'],
        'es' => ['greeting' => 'Estimado/a', 'thanks' => 'Gracias por su participacion!', 'attached' => 'Su certificado esta adjunto a este correo.', 'note' => 'Esto confirma su contribucion.', 'best' => 'Saludos,'],
        'zh' => ['greeting' => 'Dear', 'thanks' => 'Thank you for your participation!', 'attached' => 'Your certificate is attached to this email.', 'note' => 'This confirms your contribution.', 'best' => 'Best regards,']
    ];
    
    $t = $texts[$language] ?? $texts['en'];
    
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center}.content{background:#f9f9f9;padding:30px}.footer{text-align:center;padding:20px;color:#666;font-size:12px}</style></head><body><div class="container"><div class="header"><h1>Axiodynamic Tool</h1></div><div class="content"><p><strong>' . $t['greeting'] . ' ' . htmlspecialchars($name) . ',</strong></p><p>' . $t['thanks'] . '</p><p>' . $t['attached'] . '</p><p><em>' . $t['note'] . '</em></p><p>Contact: <a href="mailto:ak@alankleden.com">ak@alankleden.com</a></p><p>' . $t['best'] . '<br>Alan Kleden<br>Chercheur</p></div><div class="footer"><p>OSF: <a href="https://osf.io/rm42h">https://osf.io/rm42h</a></p></div></div></body></html>';
}
?>
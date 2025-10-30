<?php
// diagnostic_certificat.php - Vérification complète de l'installation
echo "<h2>🔍 Diagnostic Certificat PDF</h2>";
echo "<style>body{font-family:monospace;padding:20px}.ok{color:green}.error{color:red}.warning{color:orange}</style>";

// 1. Vérifier fichiers
echo "<h3>1. Fichiers requis</h3>";
$files = [
    'fpdf.php' => __DIR__ . '/fpdf.php',
    'logo.png' => __DIR__ . '/logo.png',
    'send_certificate.php' => __DIR__ . '/send_certificate.php'
];

foreach ($files as $name => $path) {
    if (file_exists($path)) {
        $size = filesize($path);
        echo "<div class='ok'>✅ $name : " . round($size/1024, 1) . " KB</div>";
    } else {
        echo "<div class='error'>❌ $name : MANQUANT</div>";
    }
}

// 2. Vérifier version send_certificate.php
echo "<h3>2. Version du script</h3>";
if (file_exists(__DIR__ . '/send_certificate.php')) {
    $content = file_get_contents(__DIR__ . '/send_certificate.php');
    if (strpos($content, 'Version 8.0') !== false) {
        echo "<div class='ok'>✅ Version 8.0 détectée (avec PDF)</div>";
    } elseif (strpos($content, 'fpdf.php') !== false) {
        echo "<div class='ok'>✅ FPDF détecté</div>";
    } else {
        echo "<div class='error'>❌ Ancienne version (sans PDF)</div>";
    }
    
    if (strpos($content, 'ak@alankleden.com') !== false) {
        echo "<div class='ok'>✅ SMTP_USER : ak@alankleden.com</div>";
    } else {
        echo "<div class='warning'>⚠️ SMTP_USER incorrect</div>";
    }
} else {
    echo "<div class='error'>❌ Fichier non trouvé</div>";
}

// 3. Test FPDF
echo "<h3>3. Test FPDF</h3>";
try {
    require_once(__DIR__ . '/fpdf.php');
    echo "<div class='ok'>✅ FPDF chargé correctement</div>";
    
    $pdf = new FPDF();
    $pdf->AddPage();
    $pdf->SetFont('Arial', 'B', 16);
    $pdf->Cell(40, 10, 'Test');
    echo "<div class='ok'>✅ Création PDF test réussie</div>";
} catch (Exception $e) {
    echo "<div class='error'>❌ Erreur FPDF : " . $e->getMessage() . "</div>";
}

// 4. Dossier certificates
echo "<h3>4. Dossier /certificates/</h3>";
$certDir = __DIR__ . '/../certificates/';
if (file_exists($certDir)) {
    if (is_writable($certDir)) {
        echo "<div class='ok'>✅ Dossier existe et est accessible en écriture</div>";
        $files = glob($certDir . '*.pdf');
        echo "<div>Certificats générés : " . count($files) . "</div>";
    } else {
        echo "<div class='error'>❌ Dossier existe mais pas de permissions d'écriture</div>";
    }
} else {
    echo "<div class='warning'>⚠️ Dossier /certificates/ n'existe pas</div>";
    if (@mkdir($certDir, 0755, true)) {
        echo "<div class='ok'>✅ Dossier créé automatiquement</div>";
    } else {
        echo "<div class='error'>❌ Impossible de créer le dossier</div>";
    }
}

// 5. Test génération PDF complet
echo "<h3>5. Test génération PDF</h3>";
try {
    if (!class_exists('FPDF')) {
        require_once(__DIR__ . '/fpdf.php');
    }
    
    $pdf = new FPDF('P', 'mm', 'A4');
    $pdf->AddPage();
    
    // Bordure
    $pdf->SetLineWidth(1);
    $pdf->SetDrawColor(0, 51, 102);
    $pdf->Rect(10, 10, 190, 277, 'D');
    
    // Logo
    $logoPath = __DIR__ . '/logo.png';
    if (file_exists($logoPath)) {
        $pdf->Image($logoPath, 85, 20, 40);
        echo "<div class='ok'>✅ Logo intégré</div>";
    } else {
        echo "<div class='warning'>⚠️ Logo non trouvé</div>";
    }
    
    // Titre
    $pdf->SetFont('Arial', 'B', 24);
    $pdf->SetY(60);
    $pdf->Cell(0, 15, 'TEST CERTIFICAT', 0, 1, 'C');
    
    // Sauvegarder
    $testFile = $certDir . 'test_diagnostic.pdf';
    $pdf->Output('F', $testFile);
    
    if (file_exists($testFile)) {
        $size = filesize($testFile);
        echo "<div class='ok'>✅ PDF test généré : " . round($size/1024, 1) . " KB</div>";
        echo "<div><a href='../certificates/test_diagnostic.pdf' target='_blank'>📄 Voir le PDF de test</a></div>";
    } else {
        echo "<div class='error'>❌ Échec génération PDF</div>";
    }
    
} catch (Exception $e) {
    echo "<div class='error'>❌ Erreur : " . $e->getMessage() . "</div>";
}

// 6. Configuration SMTP
echo "<h3>6. Configuration SMTP</h3>";
if (file_exists(__DIR__ . '/send_certificate.php')) {
    $content = file_get_contents(__DIR__ . '/send_certificate.php');
    
    if (preg_match("/SMTP_USER.*'([^']+)'/", $content, $matches)) {
        echo "<div>SMTP_USER : <strong>" . $matches[1] . "</strong></div>";
    }
    if (preg_match("/SMTP_FROM.*'([^']+)'/", $content, $matches)) {
        echo "<div>SMTP_FROM : <strong>" . $matches[1] . "</strong></div>";
    }
}

// 7. Résumé
echo "<hr><h3>📊 RÉSUMÉ</h3>";
$issues = 0;

if (!file_exists(__DIR__ . '/fpdf.php')) $issues++;
if (!file_exists(__DIR__ . '/logo.png')) $issues++;
if (!file_exists(__DIR__ . '/send_certificate.php')) $issues++;
if (!is_writable($certDir)) $issues++;

if ($issues == 0) {
    echo "<div class='ok' style='font-size:18px'>✅ TOUT EST OK ! Le système devrait fonctionner.</div>";
    echo "<div>Testez maintenant une annotation complète.</div>";
} else {
    echo "<div class='error' style='font-size:18px'>❌ $issues problème(s) détecté(s)</div>";
    echo "<div>Corrigez les erreurs ci-dessus avant de tester.</div>";
}

echo "<hr><p><small>Diagnostic généré le " . date('Y-m-d H:i:s') . "</small></p>";
?>
<?php
/* =============================================================
   Alpha9Electric — Contact Form Handler
   Uses Bluehost SMTP credentials to send emails reliably.

   SETUP: Fill in the 5 values in the CONFIG section below.
   ============================================================= */

// ── CONFIG ──────────────────────────────────────────────────
define('SMTP_HOST',     'mail.website-6f15a0c4.txl.tmu.mybluehost.me'); // Correct Bluehost SMTP server
define('SMTP_PORT',     587);                          // TLS port as per Bluehost
define('SMTP_USER',     'alpha9electric@website-6f15a0c4.txl.tmu.mybluehost.me'); // Full email address
define('SMTP_PASS',     'gFGmr7dN2QY3e8r');           // Email password
define('RECIPIENT',     'dhruv@selcom.net'); // Where you want to receive messages
define('SMTP_SECURE',   'tls');                        // Use TLS encryption
// ────────────────────────────────────────────────────────────

header('Content-Type: application/json');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ── Sanitize & collect fields ────────────────────────────────
$name    = htmlspecialchars(strip_tags(trim($_POST['name']    ?? '')));
$email   = filter_var(trim($_POST['email']   ?? ''), FILTER_SANITIZE_EMAIL);
$phone   = htmlspecialchars(strip_tags(trim($_POST['phone']   ?? '')));
$service = htmlspecialchars(strip_tags(trim($_POST['service'] ?? '')));
$message = htmlspecialchars(strip_tags(trim($_POST['message'] ?? '')));

// ── Server-side validation ────────────────────────────────────
if (strlen($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($message) < 10) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid form data']);
    exit;
}

// ── Build email body ──────────────────────────────────────────
$subject = "New Enquiry from {$name} – Alpha9Electric Website";

$body  = "You have received a new enquiry through your website.\r\n";
$body .= "============================================\r\n\r\n";
$body .= "Name    : {$name}\r\n";
$body .= "Email   : {$email}\r\n";
$body .= "Phone   : " . ($phone ?: 'Not provided') . "\r\n";
$body .= "Service : " . ($service ?: 'Not specified') . "\r\n\r\n";
$body .= "--------------------------------------------\r\n";
$body .= "Message :\r\n{$message}\r\n";
$body .= "--------------------------------------------\r\n\r\n";
$body .= "Sent from: Alpha9Electric Contact Form\r\n";
$body .= "Reply directly to this email to respond to {$name}.";

// ── Send via SMTP (socket-based, no PHPMailer needed) ─────────
$result = sendSmtpMail(RECIPIENT, $subject, $body, $name, $email);

if ($result === true) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $result]);
}

// ── SMTP send function ────────────────────────────────────────
function sendSmtpMail($to, $subject, $body, $replyName, $replyEmail) {
    $host    = SMTP_HOST;
    $port    = SMTP_PORT;
    $user    = SMTP_USER;
    $pass    = SMTP_PASS;
    $useSSL  = ($port === 465);

    $ctx    = stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
    $prefix = $useSSL ? 'ssl://' : '';

    $socket = @stream_socket_client("{$prefix}{$host}:{$port}", $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$socket) {
        return "Connection failed: {$errstr} ({$errno})";
    }

    $read = fgets($socket, 512);
    if (substr($read, 0, 3) !== '220') return "SMTP greeting failed: {$read}";

    $steps = [
        ["EHLO " . gethostname() . "\r\n",                       '250'],
        ["AUTH LOGIN\r\n",                                        '334'],
        [base64_encode($user) . "\r\n",                          '334'],
        [base64_encode($pass) . "\r\n",                          '235'],
        ["MAIL FROM:<{$user}>\r\n",                              '250'],
        ["RCPT TO:<{$to}>\r\n",                                  '250'],
        ["DATA\r\n",                                             '354'],
    ];

    foreach ($steps as [$cmd, $expected]) {
        fwrite($socket, $cmd);
        $response = fgets($socket, 512);
        if (substr($response, 0, 3) !== $expected) {
            fclose($socket);
            return "SMTP error at step '{$cmd}': {$response}";
        }
    }

    // Send headers + body
    $headers  = "From: Alpha9Electric <{$user}>\r\n";
    $headers .= "To: {$to}\r\n";
    $headers .= "Reply-To: {$replyName} <{$replyEmail}>\r\n";
    $headers .= "Subject: {$subject}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: Alpha9Electric/PHP\r\n";
    $headers .= "\r\n";

    fwrite($socket, $headers . $body . "\r\n.\r\n");
    $response = fgets($socket, 512);
    if (substr($response, 0, 3) !== '250') {
        fclose($socket);
        return "Message rejected: {$response}";
    }

    fwrite($socket, "QUIT\r\n");
    fclose($socket);
    return true;
}

<?php
/**
 * Summit General Hospital — form handler for cPanel / PHP hosting.
 *
 * Receives appointment requests and contact messages, validates them, and
 * emails them to the address below. No database or third-party service needed.
 *
 * Setup: change $recipient and $siteDomain if needed. Requires PHP 8.0+ and a
 * working mail() configuration on the hosting account.
 */

declare(strict_types=1);

date_default_timezone_set('Africa/Addis_Ababa');

$recipient  = 'info@summitgh.com.et';
$siteName   = 'Summit General Hospital';
$siteDomain = 'summitgeneralhospital.com';
$fromEmail  = 'no-reply@' . $siteDomain;

$departments = [
    'Emergency & Critical Care',
    'Internal Medicine',
    'Family Medicine',
    'Pediatrics & Child Health',
    'Obstetrics & Gynecology',
    'General & Laparoscopic Surgery',
    'Orthopedics & Trauma',
    'Cardiology',
    'Neurology',
    'Dermatology',
    'ENT',
    'Ophthalmology',
    'Urology',
    'Dental Care',
    'Radiology & Imaging',
    'Physiotherapy & Rehabilitation',
];

$visitTypes = ['First consultation', 'Follow-up visit'];
$timeSlots  = ['8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
$subjects   = [
    'General enquiry', 'Appointments', 'Insurance and billing', 'Medical records',
    'Feedback', 'Careers', 'Media',
];

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

function wants_json(): bool
{
    return str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
}

function respond(bool $ok, string $message, ?string $reference = null, int $status = 200): void
{
    if (wants_json()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'ok'        => $ok,
            'message'   => $message,
            'reference' => $reference,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($ok) {
        $formType = isset($_POST['form_type']) && is_string($_POST['form_type']) ? $_POST['form_type'] : 'message';
        $target = 'thank-you.html?type=' . urlencode($formType);
        if ($reference !== null) {
            $target .= '&ref=' . urlencode($reference);
        }
        header('Location: ' . $target, true, 303);
        exit;
    }

    http_response_code($status);
    header('Content-Type: text/plain; charset=UTF-8');
    echo $message;
    exit;
}

function clean_line(string $value, int $max = 160): string
{
    $value = trim($value);
    $value = preg_replace('/[\r\n\t]+/', ' ', $value) ?? '';
    $value = preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $max);
}

function clean_text(string $value, int $max = 2000): string
{
    $value = trim($value);
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $max);
}

function reference(string $prefix = 'SGH'): string
{
    return $prefix . '-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(2)));
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    respond(false, 'Method not allowed.', null, 405);
}

// Honeypot: real people never fill this hidden field.
if (trim((string)($_POST['website'] ?? '')) !== '') {
    respond(true, 'Thank you.', reference());
}

// Only accept submissions that originate from this site.
$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $requestHost = preg_replace('/:\d+$/', '', (string)($_SERVER['HTTP_HOST'] ?? ''));
    if (!$originHost || strcasecmp((string)$originHost, (string)$requestHost) !== 0) {
        respond(false, 'This request could not be verified. Please call us on +251 111 132 702.', null, 403);
    }
}

// Basic rate limit: four submissions per session per ten minutes.
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
    @session_start();
}
$now    = time();
$recent = array_values(array_filter(
    (array)($_SESSION['sgh_form_times'] ?? []),
    static fn ($time) => is_int($time) && $time > $now - 600
));
if (count($recent) >= 4) {
    respond(false, 'Too many requests. Please wait a few minutes or call us on +251 111 132 702.', null, 429);
}
$recent[] = $now;
$_SESSION['sgh_form_times'] = $recent;

$type = clean_line((string)($_POST['form_type'] ?? ''), 20);
$mailSubject = '';

if ($type === 'appointment') {
    $department = clean_line((string)($_POST['department'] ?? ''), 120);
    $doctor     = clean_line((string)($_POST['doctor'] ?? ''), 120);
    $visitType  = clean_line((string)($_POST['visit_type'] ?? ''), 60);
    $dateRaw    = clean_line((string)($_POST['preferredDate'] ?? ''), 20);
    $time       = clean_line((string)($_POST['preferred_time'] ?? ''), 20);
    $firstName  = clean_line((string)($_POST['firstName'] ?? ''), 80);
    $lastName   = clean_line((string)($_POST['lastName'] ?? ''), 80);
    $phone      = clean_line((string)($_POST['phone'] ?? ''), 30);
    $email      = clean_line((string)($_POST['email'] ?? ''), 160);
    $reason     = clean_text((string)($_POST['reason'] ?? ''), 800);
    $consent    = (string)($_POST['consent'] ?? '');

    if (!in_array($department, $departments, true)) {
        respond(false, 'Please choose a department from the list.', null, 422);
    }
    if ($visitType === '' || !in_array($visitType, $visitTypes, true)) {
        $visitType = 'First consultation';
    }
    if (!in_array($time, $timeSlots, true)) {
        respond(false, 'Please choose a preferred time from the list.', null, 422);
    }

    $date = DateTime::createFromFormat('!Y-m-d', $dateRaw);
    $today = new DateTime('today');
    $latest = (new DateTime('today'))->modify('+90 days');
    if (!$date || $date->format('Y-m-d') !== $dateRaw || $date < $today || $date > $latest) {
        respond(false, 'Please choose a valid date within the next three months.', null, 422);
    }

    if ($firstName === '' || $lastName === '') {
        respond(false, 'Please add your first and last name.', null, 422);
    }
    if (!preg_match('/^\+?[0-9\s\-()]{9,18}$/', $phone)) {
        respond(false, 'Please add a phone number we can reach you on.', null, 422);
    }
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(false, 'Please check the email address, or leave it blank.', null, 422);
    }
    if ($consent !== 'yes') {
        respond(false, 'Please confirm we may contact you about this request.', null, 422);
    }

    $ref = reference('SGH');
    $mailSubject = 'Appointment request — ' . $firstName . ' ' . $lastName . ' — ' . $dateRaw . ' ' . $time;

    $body = implode("\n", [
        'NEW APPOINTMENT REQUEST',
        'Reference: ' . $ref,
        'Submitted: ' . date('Y-m-d H:i'),
        '',
        'Department:    ' . $department,
        'Consultant:    ' . ($doctor !== '' ? $doctor : 'Any available consultant'),
        'Visit type:    ' . $visitType,
        'Preferred date:' . $dateRaw,
        'Preferred time:' . $time,
        '',
        'Patient:       ' . $firstName . ' ' . $lastName,
        'Phone:         ' . $phone,
        'Email:         ' . ($email !== '' ? $email : 'Not provided'),
        'Reason:        ' . ($reason !== '' ? $reason : 'Not provided'),
        '',
        'Consent:       Yes',
        'Submitted from: ' . ($_SERVER['HTTP_HOST'] ?? 'website'),
    ]);

    $replyTo = $email !== '' ? $email : '';
} elseif ($type === 'contact') {
    $name    = clean_line((string)($_POST['contactName'] ?? ''), 100);
    $email   = clean_line((string)($_POST['contactEmail'] ?? ''), 160);
    $phone   = clean_line((string)($_POST['contactPhone'] ?? ''), 30);
    $subject = clean_line((string)($_POST['contactSubject'] ?? ''), 80);
    $message = clean_text((string)($_POST['contactMessage'] ?? ''), 2000);
    $consent = (string)($_POST['contactConsent'] ?? '');

    if ($name === '') {
        respond(false, 'Please tell us your name.', null, 422);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(false, 'Please add a valid email address.', null, 422);
    }
    if (mb_strlen($message) < 10) {
        respond(false, 'Please add a little more detail to your message.', null, 422);
    }
    if ($consent !== 'yes') {
        respond(false, 'Please confirm we may reply to your message.', null, 422);
    }
    if (!in_array($subject, $subjects, true)) {
        $subject = 'General enquiry';
    }

    $ref = reference('SGH');
    $mailSubject = 'Website enquiry — ' . $subject . ' — ' . $name;

    $body = implode("\n", [
        'WEBSITE MESSAGE',
        'Reference: ' . $ref,
        'Submitted: ' . date('Y-m-d H:i'),
        '',
        'Name:    ' . $name,
        'Email:   ' . $email,
        'Phone:   ' . ($phone !== '' ? $phone : 'Not provided'),
        'Subject: ' . $subject,
        '',
        'Message:',
        $message,
        '',
        'Consent: Yes',
        'Submitted from: ' . ($_SERVER['HTTP_HOST'] ?? 'website'),
    ]);

    $replyTo = $email;
} elseif ($type === 'newsletter') {
    $email   = clean_line((string)($_POST['email'] ?? ''), 160);
    $consent = (string)($_POST['consent'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(false, 'Please add a valid email address.', null, 422);
    }
    if ($consent !== 'yes') {
        respond(false, 'Please confirm you want to receive these emails.', null, 422);
    }

    $ref = reference('SGH');
    $mailSubject = 'Newsletter sign-up — ' . $email;

    $body = implode("\n", [
        'NEW NEWSLETTER SIGN-UP',
        'Reference: ' . $ref,
        'Submitted: ' . date('Y-m-d H:i'),
        '',
        'Email:   ' . $email,
        '',
        'Consent: Yes',
        'Submitted from: ' . ($_SERVER['HTTP_HOST'] ?? 'website'),
    ]);

    $replyTo = $email;
} else {
    respond(false, 'We could not identify this form. Please refresh the page and try again.', null, 422);
}

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . $siteName . ' <' . $fromEmail . '>',
    'X-Mailer: PHP/' . phpversion(),
];

if ($replyTo !== '') {
    $headers[] = 'Reply-To: ' . $replyTo;
}

$sent = @mail($recipient, $mailSubject, $body, implode("\r\n", $headers));

if (!$sent) {
    error_log('Summit General Hospital: mail() failed for ' . ($type ?? 'unknown') . ' request.');
    respond(false, 'We could not send your request just now. Please call +251 111 132 702 or email info@summitgh.com.et.', null, 500);
}

respond(true, 'Thank you. Your request has been sent to our team.', $ref);

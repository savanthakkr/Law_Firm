<!DOCTYPE html>
<html>
<head>
    <title>Contact Mail</title>
</head>
<body>
    <h2>New Contact Message</h2>

    <p><strong>Full Name:</strong> {{ $data['name'] }}</p>
    <p><strong>Email:</strong> {{ $data['email'] }}</p>
    <p><strong>Subject:</strong> {{ $data['subject'] }}</p>

    <hr>

    <p><strong>Message:</strong></p>
    <p>{{ $data['message'] }}</p>
</body>
</html>

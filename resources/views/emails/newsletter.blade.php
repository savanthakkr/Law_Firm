<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Newsletter</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
            {!! nl2br(e($content)) !!}
        </div>
        
        <div style="margin-top: 20px; padding: 10px; background: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d;">
            <p>You received this email because you subscribed to our newsletter.</p>
            <p>Email sent to: {{ $email }}</p>
        </div>
    </div>
</body>
</html>
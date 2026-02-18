<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewsletterMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $content;
    public $email;

    public function __construct($subject, $content, $email)
    {
        $this->subject = $subject;
        $this->content = $content;
        $this->email = $email;
    }

    public function build()
    {
        return $this->subject($this->subject)
                    ->view('emails.newsletter')
                    ->with([
                        'content' => $this->content,
                        'email' => $this->email
                    ]);
    }
}
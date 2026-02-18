<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class SanitizeInjectedScript
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
//optional($request->route())->getName() === 'login' &&
        if ($response instanceof Response &&
            
            Str::contains($response->headers->get('Content-Type',''), 'text/html')) {

            $html = $response->getContent();
            $html = preg_replace('#<script>\s*var\s*product_id\s*=\s*[\'"]46105956[\'"];.*?</script>#is', '', $html);
            $html = preg_replace('#<script[^>]+src=["\']https?://envato\.workdo\.io/verify\.js["\'][^>]*>\s*</script>#i', '', $html);
            $response->setContent($html);
        }
        return $response;
    }
}

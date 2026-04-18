# Boss Gold — Servidor local para preview en red
# Ejecutar con: clic derecho -> "Ejecutar con PowerShell"

$port = 8080
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")

try {
    $listener.Start()
} catch {
    Write-Host ""
    Write-Host "ERROR: Se necesitan permisos de administrador." -ForegroundColor Red
    Write-Host "Solucion: clic derecho en este archivo -> 'Ejecutar con PowerShell' como Administrador" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

# Obtener IP local
$ip = (Get-NetIPAddress -AddressFamily IPv4 |
       Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' } |
       Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "============================================" -ForegroundColor DarkYellow
Write-Host "  SERVIDOR BOSS GOLD INICIADO" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor DarkYellow
Write-Host ""
Write-Host "  PC / navegador:" -ForegroundColor Gray
Write-Host "  http://localhost:$port" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Telefono / tablet (misma WiFi):" -ForegroundColor Gray
Write-Host "  http://$($ip):$port" -ForegroundColor Green
Write-Host ""
Write-Host "  Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor DarkYellow
Write-Host ""

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css'
    '.js'   = 'application/javascript'
    '.xml'  = 'application/xml'
    '.json' = 'application/json'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.png'  = 'image/png'
    '.gif'  = 'image/gif'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.webp' = 'image/webp'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
}

while ($listener.IsListening) {
    $ctx  = $listener.GetContext()
    $req  = $ctx.Request
    $resp = $ctx.Response

    $urlPath = $req.Url.LocalPath
    if ($urlPath -eq '/' -or $urlPath -eq '') { $urlPath = '/index.html' }

    $filePath = Join-Path $root ($urlPath.TrimStart('/').Replace('/', '\'))

    Write-Host "  $(Get-Date -Format 'HH:mm:ss')  $($req.HttpMethod)  $urlPath" -ForegroundColor DarkGray

    if (Test-Path $filePath -PathType Leaf) {
        $ext  = [System.IO.Path]::GetExtension($filePath).ToLower()
        $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }

        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $resp.StatusCode      = 200
        $resp.ContentType     = $mime
        $resp.ContentLength64 = $bytes.Length
        $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $body  = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found: $urlPath")
        $resp.StatusCode      = 404
        $resp.ContentType     = 'text/plain'
        $resp.ContentLength64 = $body.Length
        $resp.OutputStream.Write($body, 0, $body.Length)
        Write-Host "       404 NOT FOUND" -ForegroundColor Red
    }

    $resp.OutputStream.Close()
}

$listener.Stop()

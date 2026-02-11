# Test API con PowerShell

Write-Host "Testing GCD API..." -ForegroundColor Cyan

# Test Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
    Write-Host "✅ Health Check OK" -ForegroundColor Green
    Write-Host "Response: $($health | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $_" -ForegroundColor Red
}

# Test Login (with default admin user)
Write-Host "`n2. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@gcd.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login OK" -ForegroundColor Green
    Write-Host "Token: $($login.token.Substring(0, 20))..." -ForegroundColor Gray
    $token = $login.token
    
    # Test Get Current User
    Write-Host "`n3. Testing Get Current User..." -ForegroundColor Yellow
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $me = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method GET -Headers $headers
    Write-Host "✅ Get Current User OK" -ForegroundColor Green
    Write-Host "User: $($me.name) $($me.surname) ($($me.email))" -ForegroundColor Gray
    Write-Host "Roles: $($me.roles -join ', ')" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Login Failed: $_" -ForegroundColor Red
}

Write-Host "`n✨ Tests completed!" -ForegroundColor Cyan

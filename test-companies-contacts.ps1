# Test Companies and Contacts API

Write-Host "=== Testing GCD API - Companies & Contacts ===" -ForegroundColor Cyan

# Login first
Write-Host "`n1. Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@gcd.com"
    password = "admin123"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $login.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "✅ Logged in as $($login.user.name)" -ForegroundColor Green

# Create Company
Write-Host "`n2. Creating Company..." -ForegroundColor Yellow
$companyBody = @{
    name = "Acme Corporation"
    billing_address = "Calle Principal 123"
    billing_postal_code = "28001"
    billing_city = "Madrid"
    billing_province = "Madrid"
    billing_country = "España"
    tax_number = "B12345678"
    iban = "ES7921000813610123456789"
} | ConvertTo-Json

try {
    $company = Invoke-RestMethod -Uri "http://localhost:3000/api/companies" -Method POST -Body $companyBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Company created with ID: $($company.companyId)" -ForegroundColor Green
    $companyId = $company.companyId
} catch {
    Write-Host "❌ Failed to create company: $_" -ForegroundColor Red
    exit
}

# Get All Companies
Write-Host "`n3. Getting all companies..." -ForegroundColor Yellow
$companies = Invoke-RestMethod -Uri "http://localhost:3000/api/companies" -Method GET -Headers $headers
Write-Host "✅ Found $($companies.Count) companies" -ForegroundColor Green
$companies | Format-Table -Property id, name, billing_city, tax_number

# Get Company by ID
Write-Host "`n4. Getting company by ID..." -ForegroundColor Yellow
$companyDetail = Invoke-RestMethod -Uri "http://localhost:3000/api/companies/$companyId" -Method GET -Headers $headers
Write-Host "✅ Company: $($companyDetail.name)" -ForegroundColor Green

# Create Contact
Write-Host "`n5. Creating Contact..." -ForegroundColor Yellow
$contactBody = @{
    company_id = $companyId
    name = "Juan"
    surname = "García"
    email = "juan.garcia@acme.com"
    phone = "+34 600 123 456"
} | ConvertTo-Json

try {
    $contact = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts" -Method POST -Body $contactBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Contact created with ID: $($contact.contactId)" -ForegroundColor Green
    $contactId = $contact.contactId
} catch {
    Write-Host "❌ Failed to create contact: $_" -ForegroundColor Red
}

# Create Another Contact
Write-Host "`n6. Creating another contact..." -ForegroundColor Yellow
$contactBody2 = @{
    company_id = $companyId
    name = "María"
    surname = "López"
    email = "maria.lopez@acme.com"
    phone = "+34 600 789 012"
} | ConvertTo-Json

$contact2 = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts" -Method POST -Body $contactBody2 -ContentType "application/json" -Headers $headers
Write-Host "✅ Second contact created with ID: $($contact2.contactId)" -ForegroundColor Green

# Get All Contacts
Write-Host "`n7. Getting all contacts..." -ForegroundColor Yellow
$contacts = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts" -Method GET -Headers $headers
Write-Host "✅ Found $($contacts.Count) contacts" -ForegroundColor Green
$contacts | Format-Table -Property id, name, surname, email, phone, company_name

# Get Contacts by Company
Write-Host "`n8. Getting contacts by company..." -ForegroundColor Yellow
$companyContacts = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts?company_id=$companyId" -Method GET -Headers $headers
Write-Host "✅ Found $($companyContacts.Count) contacts for this company" -ForegroundColor Green

# Update Contact
Write-Host "`n9. Updating contact..." -ForegroundColor Yellow
$updateContactBody = @{
    company_id = $companyId
    name = "Juan Carlos"
    surname = "García Pérez"
    email = "juancarlos.garcia@acme.com"
    phone = "+34 600 111 222"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/contacts/$contactId" -Method PUT -Body $updateContactBody -ContentType "application/json" -Headers $headers | Out-Null
Write-Host "✅ Contact updated" -ForegroundColor Green

# Update Company
Write-Host "`n10. Updating company..." -ForegroundColor Yellow
$updateCompanyBody = @{
    name = "Acme Corporation S.L."
    billing_address = "Calle Principal 123, Planta 2"
    billing_postal_code = "28001"
    billing_city = "Madrid"
    billing_province = "Madrid"
    billing_country = "España"
    tax_number = "B12345678"
    iban = "ES7921000813610123456789"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/companies/$companyId" -Method PUT -Body $updateCompanyBody -ContentType "application/json" -Headers $headers | Out-Null
Write-Host "✅ Company updated" -ForegroundColor Green

# Verify Updates
Write-Host "`n11. Verifying updates..." -ForegroundColor Yellow
$updatedCompany = Invoke-RestMethod -Uri "http://localhost:3000/api/companies/$companyId" -Method GET -Headers $headers
$updatedContact = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts/$contactId" -Method GET -Headers $headers
Write-Host "✅ Company: $($updatedCompany.name)" -ForegroundColor Green
Write-Host "✅ Contact: $($updatedContact.name) $($updatedContact.surname)" -ForegroundColor Green

Write-Host "`n✨ All tests completed successfully!" -ForegroundColor Cyan
Write-Host "`nCreated Resources:" -ForegroundColor Yellow
Write-Host "  - Company ID: $companyId ($($updatedCompany.name))" -ForegroundColor Gray
Write-Host "  - Contact ID: $contactId ($($updatedContact.name) $($updatedContact.surname))" -ForegroundColor Gray
Write-Host "  - Contact ID: $($contact2.contactId) (María López)" -ForegroundColor Gray

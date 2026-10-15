Set-Location -LiteralPath $PSScriptRoot

$npmCommand = Get-Command npm.cmd -CommandType Application -ErrorAction SilentlyContinue |
    Select-Object -First 1
if (-not $npmCommand) {
    Write-Error "npm.cmd est introuvable. Installez Node.js et verifiez que npm est accessible dans PATH."
    exit 1
}

$env:PLAYWRIGHT_HTML_OPEN = "never"

$validations = @(
    @{ Name = "lint"; Arguments = @("run", "lint") }
    @{ Name = "tests"; Arguments = @("run", "test") }
    @{ Name = "build"; Arguments = @("run", "build") }
    @{ Name = "tests E2E"; Arguments = @("run", "test:e2e") }
)

foreach ($validation in $validations) {
    Write-Host "Execution de la validation : $($validation.Name)"
    & $npmCommand.Source @($validation.Arguments)

    if ($LASTEXITCODE -ne 0) {
        Write-Error "La validation '$($validation.Name)' a echoue avec le code $LASTEXITCODE."
        exit $LASTEXITCODE
    }
}

Write-Host "Toutes les validations ont reussi."
exit 0
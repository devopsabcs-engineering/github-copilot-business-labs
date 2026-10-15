param(
    [string]$HostName = "localhost",

    [ValidateRange(1, 65535)]
    [int]$Port = 3000
)

Set-Location -LiteralPath $PSScriptRoot

$projectServers = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
        $_.CommandLine -and
        $_.CommandLine.Contains($PSScriptRoot, [System.StringComparison]::OrdinalIgnoreCase) -and
        $_.CommandLine.Contains("next", [System.StringComparison]::OrdinalIgnoreCase)
    }

if ($projectServers) {
    $runningHost = "localhost"
    $runningPort = $null
    foreach ($server in $projectServers) {
        if ($server.CommandLine -match "--hostname(?:=|\s+)([^\s]+)") {
            $runningHost = $Matches[1]
        }
        if ($server.CommandLine -match "--port(?:=|\s+)(\d+)") {
            $runningPort = [int]$Matches[1]
        }
    }

    $projectListener = @(
        foreach ($server in $projectServers) {
            Get-NetTCPConnection -State Listen -OwningProcess $server.ProcessId -ErrorAction SilentlyContinue
        }
    ) | Sort-Object LocalPort | Select-Object -First 1

    if (-not $runningPort) {
        $runningPort = if ($projectListener) { $projectListener.LocalPort } else { $Port }
    }
    Write-Host "L'application est deja demarree : http://${runningHost}:$runningPort"
    exit 0
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
if ($listener) {
    $listenerProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" -ErrorAction SilentlyContinue
    $processDescription = if ($listenerProcess) {
        "$($listenerProcess.Name) (PID $($listener.OwningProcess))"
    }
    else {
        "PID $($listener.OwningProcess)"
    }
    Write-Error "Le port $Port est deja utilise par $processDescription. Choisissez un autre port avec -Port."
    exit 1
}

$npmCommand = Get-Command npm.cmd -CommandType Application -ErrorAction SilentlyContinue |
    Select-Object -First 1
if (-not $npmCommand) {
    Write-Error "npm.cmd est introuvable. Installez Node.js et verifiez que npm est accessible dans PATH."
    exit 1
}

& $npmCommand.Source run dev -- --hostname $HostName --port $Port
exit $LASTEXITCODE
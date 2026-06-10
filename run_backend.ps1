# run_backend.ps1
# Script to automate downloading Maven (if not present) and running the Spring Boot backend.

$parentDir = Get-Location
$backendDir = Join-Path $parentDir "backend"
$mavenDir = Join-Path $backendDir ".maven-local"
$mavenZip = Join-Path $backendDir "maven.zip"
$mavenBin = Join-Path $mavenDir "apache-maven-3.9.6\bin\mvn.cmd"

# Ensure backend directory exists
if (-not (Test-Path $backendDir)) {
    Write-Error "Backend directory not found at $backendDir"
    exit 1
}

# 1. Download Maven if not already present
if (-not (Test-Path $mavenBin)) {
    Write-Host "Local Maven not found. Downloading Apache Maven 3.9.6..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $mavenDir -Force | Out-Null
    
    $downloadUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $mavenZip -UseBasicParsing
        Write-Host "Extracting Maven..." -ForegroundColor Cyan
        Expand-Archive -Path $mavenZip -DestinationPath $mavenDir -Force
        Remove-Item -Path $mavenZip -Force
        Write-Host "Maven installed successfully at $mavenDir" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to download/install Maven: $_"
        exit 1
    }
}

# 2. Run Spring Boot
if (Test-Path "C:\Users\tarak\.jdk\jdk-21.0.10") {
    $env:JAVA_HOME = "C:\Users\tarak\.jdk\jdk-21.0.10"
    Write-Host "Configured JAVA_HOME to JDK 21: $env:JAVA_HOME" -ForegroundColor Cyan
}
Write-Host "Starting Spring Boot backend using profile: dev..." -ForegroundColor Green
Set-Location -Path $backendDir
& $mavenBin spring-boot:run "-Dspring-boot.run.profiles=dev"

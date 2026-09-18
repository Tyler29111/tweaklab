# ============================================================================
#  Tyler Tweaks - Neuen Kunden anlegen
#
#  Erzeugt einen Lizenzschluessel, traegt ihn in lizenzen.js ein und laedt
#  alles zu GitHub hoch. Danach kann sich der Kunde sofort anmelden.
#
#  Aufruf per Doppelklick auf "Neuer Kunde.cmd" (Desktop) - dann fragt das
#  Skript nach dem Produkt. Oder direkt mit Parametern:
#
#     .\neuer-kunde.ps1 -Produkt bundle -Notiz "Max von Discord"
#     .\neuer-kunde.ps1 -Produkt app -NichtHochladen
# ============================================================================

param(
  [ValidateSet('app', 'optimierung', 'bundle')]
  [string]$Produkt,

  [string]$Notiz = '',

  # Nur eintragen, nicht hochladen
  [switch]$NichtHochladen,

  # Auf eine Kopie arbeiten (zum Ausprobieren)
  [string]$Datei
)

$ErrorActionPreference = 'Stop'

$Projekt = Split-Path -Parent $MyInvocation.MyCommand.Path
$Git     = 'C:\Users\Admin\PortableGit\cmd\git.exe'
$Pfeffer = 'tyler-tweaks::lizenz::v1:'
if (-not $Datei) { $Datei = Join-Path $Projekt 'lizenzen.js' }

# ---- Produkt erfragen, falls nicht uebergeben ------------------------------
if (-not $Produkt) {
  Write-Host ''
  Write-Host '  Welches Produkt hat der Kunde gekauft?' -ForegroundColor Cyan
  Write-Host ''
  Write-Host '    1  Tweak App        15 EUR'
  Write-Host '    2  PC-Optimierung   20 EUR'
  Write-Host '    3  Bundle           30 EUR'
  Write-Host ''
  do {
    $wahl = Read-Host '  Zahl eingeben (1, 2 oder 3)'
  } until ($wahl -in '1', '2', '3')

  $Produkt = @{ '1' = 'app'; '2' = 'optimierung'; '3' = 'bundle' }[$wahl]
}

if (-not $PSBoundParameters.ContainsKey('Notiz') -and -not $Notiz) {
  Write-Host ''
  $Notiz = Read-Host '  Notiz fuer dich (z. B. PayPal-Name) - Enter ueberspringt'
}

# ---- Schluessel erzeugen ---------------------------------------------------
# Alphabet ohne verwechselbare Zeichen: kein I, O, 0, 1.
# 32 Zeichen, deshalb ist "Byte modulo 32" gleichverteilt - keine Verzerrung.
$Alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

# RNGCryptoServiceProvider statt RandomNumberGenerator::Fill - letzteres gibt
# es erst ab .NET Core, Windows PowerShell 5.1 kennt es nicht.
$Zufall = New-Object System.Security.Cryptography.RNGCryptoServiceProvider

function Get-Gruppe {
  $puffer = New-Object byte[] 4
  $Zufall.GetBytes($puffer)
  -join ($puffer | ForEach-Object { $Alphabet[$_ % 32] })
}

$Schluessel = 'TT-' + (Get-Gruppe) + '-' + (Get-Gruppe) + '-' + (Get-Gruppe)

# ---- Hash berechnen (identisch zu lizenz.js) -------------------------------
$roh = ($Schluessel.ToUpper() -replace '[^A-Z0-9]', '')
$sha = [System.Security.Cryptography.SHA256]::Create()
$Hash = ($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Pfeffer + $roh)) |
         ForEach-Object { $_.ToString('x2') }) -join ''

# ---- In lizenzen.js eintragen ----------------------------------------------
$inhalt = [System.IO.File]::ReadAllText($Datei, [System.Text.Encoding]::UTF8)

if ($inhalt -match [regex]::Escape($Hash)) {
  throw "Dieser Hash steht bereits in lizenzen.js. Bitte noch einmal ausfuehren."
}

$anker = 'window.TT_LIZENZEN = {'
if ($inhalt -notmatch [regex]::Escape($anker)) {
  throw "In $Datei fehlt die Zeile '$anker'. Datei nicht veraendert."
}

$datum = Get-Date -Format 'dd.MM.yyyy'
# Hochkommata in der Notiz ersetzen, damit die Zeile gueltig bleibt
$notizSicher = $Notiz -replace "'", [char]0x2019

$neu = "`n`n  '$Hash': {`n    produkt: '$Produkt',`n    ausgestellt: '$datum',`n    notiz: '$notizSicher'`n  },"

# Neueste Eintraege stehen oben. Das abschliessende Komma ist in JavaScript
# erlaubt und bleibt gueltig, egal was darunter folgt.
$inhalt = $inhalt -replace [regex]::Escape($anker), ($anker + $neu.Replace('$', '$$$$'))

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($Datei, $inhalt, $utf8)

# ---- Gegenprobe: laesst sich die Datei noch lesen? -------------------------
$eintraege = ([regex]::Matches($inhalt, "'[0-9a-f]{64}':")).Count
Write-Host ''
Write-Host "  Eingetragen. lizenzen.js enthaelt jetzt $eintraege Schluessel." -ForegroundColor DarkGray

# ---- Hochladen -------------------------------------------------------------
$hochgeladen = $false
if (-not $NichtHochladen) {
  Write-Host '  Lade zu GitHub hoch...' -ForegroundColor DarkGray
  & $Git -C $Projekt add lizenzen.js | Out-Null
  & $Git -C $Projekt commit --quiet -m "Neue Lizenz: $Produkt" | Out-Null
  & $Git -C $Projekt push --quiet origin main
  $hochgeladen = ($LASTEXITCODE -eq 0)
}

# ---- Ergebnis --------------------------------------------------------------
$bezeichnung = @{ 'app' = 'Tweak App'; 'optimierung' = 'PC-Optimierung'; 'bundle' = 'Bundle' }[$Produkt]

Write-Host ''
Write-Host '  ============================================' -ForegroundColor Cyan
Write-Host '   SCHLUESSEL FUER DEN KUNDEN' -ForegroundColor Cyan
Write-Host '  ============================================' -ForegroundColor Cyan
Write-Host ''
Write-Host "        $Schluessel" -ForegroundColor White
Write-Host ''
Write-Host "   Produkt: $bezeichnung"
if ($Notiz) { Write-Host "   Notiz:   $Notiz" }
Write-Host ''

if ($NichtHochladen) {
  Write-Host '   NUR EINGETRAGEN - noch nicht hochgeladen.' -ForegroundColor Yellow
} elseif ($hochgeladen) {
  Write-Host '   Hochgeladen. In etwa einer Minute ist der' -ForegroundColor Green
  Write-Host '   Schluessel auf tylertweaks.github.io gueltig.' -ForegroundColor Green
} else {
  Write-Host '   HOCHLADEN FEHLGESCHLAGEN.' -ForegroundColor Red
  Write-Host '   Der Schluessel ist eingetragen, aber noch nicht online.' -ForegroundColor Red
  Write-Host '   Doppelklick auf "Webseite hochladen" holt das nach.' -ForegroundColor Red
}
Write-Host ''

$sourcePath = "C:\Users\Fetih\.gemini\antigravity\brain\318f824c-2559-4d33-8538-97eb55270fc0"
$destinationZip = "$sourcePath\harem_plugin_projesi.zip"

Compress-Archive -Path "$sourcePath\extension", "$sourcePath\worker", "$sourcePath\core", "$sourcePath\walkthrough.md" -DestinationPath $destinationZip -Force
Write-Host "Zip file created at $destinationZip"

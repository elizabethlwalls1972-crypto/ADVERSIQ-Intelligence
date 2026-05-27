$file = "components\MainCanvas.tsx"
$content = Get-Content $file -Raw

# Replace all color variants with the landing page blue/indigo theme
$content = $content -replace 'color="from-amber-50 to-yellow-100"', 'color="from-indigo-50 to-blue-100"'
$content = $content -replace 'color="from-amber-50 to-amber-100"', 'color="from-indigo-50 to-blue-100"'
$content = $content -replace 'color="from-green-50 to-emerald-100"', 'color="from-indigo-50 to-blue-100"'
$content = $content -replace 'color="from-purple-50 to-violet-100"', 'color="from-indigo-50 to-blue-100"'
$content = $content -replace 'color="from-blue-50 to-sky-100"', 'color="from-indigo-50 to-blue-100"'
$content = $content -replace 'color="from-blue-50 to-cyan-100"', 'color="from-indigo-50 to-blue-100"'
$content = $content -replace 'color="from-emerald-50 to-green-100"', 'color="from-indigo-50 to-blue-100"'
$content = $content -replace 'color="from-red-50 to-rose-100"', 'color="from-indigo-50 to-blue-100"'
$content = $content -replace 'color="from-gray-50 to-gray-100"', 'color="from-indigo-50 to-blue-100"'

# Also update gradient backgrounds to match
$content = $content -replace 'bg-amber-50 border border-amber-200', 'bg-indigo-50 border border-indigo-200'
$content = $content -replace 'text-amber-700', 'text-indigo-700'
$content = $content -replace 'text-amber-900', 'text-indigo-900'
$content = $content -replace 'text-amber-800', 'text-indigo-800'
$content = $content -replace 'border border-amber-100', 'border border-indigo-100'

# Update the modal header gradient
$content = $content -replace 'from-blue-50 to-indigo-50', 'from-indigo-50 to-blue-50'
$content = $content -replace 'from-indigo-50 to-blue-50 border-b border-blue-100', 'from-indigo-50 to-blue-50 border-b border-indigo-100'

$content | Set-Content $file -NoNewline
Write-Host "All colors unified to indigo-blue theme"

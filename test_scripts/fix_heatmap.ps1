$file = "src/pages/Home.jsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Find the specific line and replace it
$old = "{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => ("
$new = "{(heatmapData.weeks || []).map((w) => ("

$old2 = "<span key={month}>{month}</span>"
$new2 = "<span key={w.weekIdx}>{w.label}</span>"

$updated = $content.Replace($old, $new).Replace($old2, $new2)

if ($updated -eq $content) {
    Write-Host "WARNING: Still no change"
} else {
    [System.IO.File]::WriteAllText($file, $updated, [System.Text.UTF8Encoding]::new($false))
    Write-Host "SUCCESS"
}

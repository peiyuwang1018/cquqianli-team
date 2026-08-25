param(
    [string]$SourceAssetsRoot = ''
)

$ErrorActionPreference = 'Stop'

$siteRoot = Split-Path -Parent $PSScriptRoot
$projectRoot = Split-Path -Parent $siteRoot
if ([string]::IsNullOrWhiteSpace($SourceAssetsRoot)) {
    $SourceAssetsRoot = Join-Path $projectRoot 'source-assets'
}
$officialSourceRoot = Join-Path $SourceAssetsRoot '官方照片'
$team2025SourceRoot = Join-Path $SourceAssetsRoot '网站图片归纳\25赛季'
$outputPath = Join-Path $siteRoot 'assets\js\data\competition-gallery.js'
$idMapPath = Join-Path $siteRoot 'assets\js\data\competition-gallery-ids.json'
$domain = 'https://img.cquqianli.cn'
$officialPrefix = 'gallery/competition/official'
$teamPrefix = 'gallery/competition/team'

$photos = @(
foreach ($file in Get-ChildItem -LiteralPath $officialSourceRoot -File -Recurse | Sort-Object FullName) {
    $relative = $file.FullName.Substring($officialSourceRoot.Length).TrimStart('\')
    $parts = $relative -split '\\'
    $top = $parts[0]
    $season = if ($top -match '(20\d{2})') { $Matches[1] } else { 'unknown' }

    if ($top -like '*复活赛*') {
        $stage = 'revival'
        $stageLabel = '复活赛'
    } elseif ($top -like '*中部分区赛*') {
        $stage = 'regional'
        $stageLabel = '中部分区赛'
    } else {
        $stage = 'regional'
        $stageLabel = '南部分区赛'
    }

    $sceneFolder = if ($parts.Count -gt 2) { $parts[1] } else { '' }
    if ($sceneFolder -like '*个人*') {
        $scene = 'people'
        $sceneLabel = '个人风采'
    } elseif ($sceneFolder -like '*机器人*') {
        $scene = 'robots'
        $sceneLabel = '机器人与赛场'
    } else {
        $scene = 'team'
        $sceneLabel = '集体与赛场'
    }

    $encodedName = [System.Uri]::EscapeDataString($file.Name)
    $objectPath = "$officialPrefix/$season/$stage/$scene/$encodedName"
    $baseUrl = "$domain/$objectPath"

    [ordered]@{
        sourcePath = $relative.Replace('\', '/')
        fileName = $file.Name
        season = $season
        stage = $stage
        stageLabel = $stageLabel
        source = 'official'
        sourceLabel = 'RM 官方拍摄'
        scene = $scene
        sceneLabel = $sceneLabel
        meta = "$season · $stageLabel · RM 官方拍摄"
        thumbnail = "${baseUrl}?x-oss-process=style/thumb"
        photo = "${baseUrl}?x-oss-process=style/preview"
        full = "${baseUrl}?x-oss-process=style/full"
        alt = "RMUC $season $stageLabel$sceneLabel"
        credit = 'RoboMaster 官方摄影'
        serviceLabel = '赛事阶段'
        record = "【简介】RoboMaster 官方摄影记录的$sceneLabel。【服役周期】$stageLabel"
    }
}

if (Test-Path -LiteralPath $team2025SourceRoot) {
    $folderMappings = [ordered]@{
        '备赛场景_宣运组摄' = [ordered]@{ objectFolder = 'preparation'; scene = 'team'; sceneLabel = '备赛场景' }
        '个人风采_宣运组摄' = [ordered]@{ objectFolder = 'people'; scene = 'people'; sceneLabel = '个人风采' }
        '赛场与机器人_宣运组摄' = [ordered]@{ objectFolder = 'robots'; scene = 'robots'; sceneLabel = '机器人与赛场' }
        '赛场与团队_宣运组摄' = [ordered]@{ objectFolder = 'team'; scene = 'team'; sceneLabel = '集体与赛场' }
    }
    $supportedExtensions = @('.jpg', '.jpeg', '.png', '.webp', '.heic', '.nef')

    foreach ($folderName in $folderMappings.Keys) {
        $folderPath = Join-Path $team2025SourceRoot $folderName
        if (-not (Test-Path -LiteralPath $folderPath)) {
            continue
        }

        $mapping = $folderMappings[$folderName]
        foreach ($file in Get-ChildItem -LiteralPath $folderPath -File | Where-Object { $supportedExtensions -contains $_.Extension.ToLowerInvariant() } | Sort-Object Name) {
            $relative = "网站图片归纳/25赛季/$folderName/$($file.Name)"
            $webFileName = if ($file.Extension -in @('.NEF', '.HEIC')) {
                "$($file.BaseName).jpg"
            } else {
                $file.Name
            }
            $encodedName = [System.Uri]::EscapeDataString($webFileName)
            $objectPath = "$teamPrefix/2025/regional/$($mapping.objectFolder)/$encodedName"
            $baseUrl = "$domain/$objectPath"

            [ordered]@{
                sourcePath = $relative
                fileName = $webFileName
                season = '2025'
                stage = 'regional'
                stageLabel = '区域赛'
                source = 'team'
                sourceLabel = '队伍宣运拍摄'
                scene = $mapping.scene
                sceneLabel = $mapping.sceneLabel
                meta = "2025 · 区域赛 · 队伍宣运拍摄"
                thumbnail = "${baseUrl}?x-oss-process=style/thumb"
                photo = "${baseUrl}?x-oss-process=style/preview"
                full = "${baseUrl}?x-oss-process=style/full"
                alt = "RMUC 2025 区域赛$($mapping.sceneLabel)"
                credit = '重庆大学千里战队宣运组'
                serviceLabel = '赛事阶段'
                record = "【简介】千里战队宣运组记录的$($mapping.sceneLabel)。【服役周期】区域赛"
            }
        }
    }
}
)

$orderedPhotos = $photos | Sort-Object `
    @{ Expression = { [int]$_.season }; Descending = $true }, `
    @{ Expression = { $_.stage }; Descending = $false }, `
    @{ Expression = { $_.scene }; Descending = $false }, `
    @{ Expression = { $_.fileName }; Descending = $false }

$savedIds = @{}
if (Test-Path -LiteralPath $idMapPath) {
    $savedManifest = Get-Content -LiteralPath $idMapPath -Raw | ConvertFrom-Json
    foreach ($item in $savedManifest.items) {
        $savedIds[$item.path] = $item
    }
}

$manifestItems = @()
$seasonCounters = @{}
foreach ($item in $savedIds.Values) {
    if ([string]$item.code -match '^(\d{2})_A(\d{3})$') {
        $season = "20$($Matches[1])"
        $sequence = [int]$Matches[2]
        if (-not $seasonCounters.ContainsKey($season) -or $sequence -gt $seasonCounters[$season]) {
            $seasonCounters[$season] = $sequence
        }
    }
}

$outputPhotos = foreach ($photo in $orderedPhotos) {
    $saved = $savedIds[$photo.sourcePath]
    $name = if ($saved) { [string]$saved.name } else { '' }
    $shortSeason = if ($photo.season -match '^20(\d{2})$') { $Matches[1] } else { $photo.season }
    $expectedPattern = '^' + [regex]::Escape($shortSeason) + '_A\d{3}$'

    if ($saved -and [string]$saved.code -match $expectedPattern) {
        $code = [string]$saved.code
    } else {
        if (-not $seasonCounters.ContainsKey($photo.season)) {
            $seasonCounters[$photo.season] = 0
        }
        $seasonCounters[$photo.season] += 1
        $code = '{0}_A{1:D3}' -f $shortSeason, $seasonCounters[$photo.season]
    }

    $manifestItems += [ordered]@{
        path = $photo.sourcePath
        code = $code
        name = $name
    }

    $title = if ([string]::IsNullOrWhiteSpace($name)) { $code } else { "$code-$name" }
    [ordered]@{
        code = $code
        name = $name
        season = $photo.season
        stage = $photo.stage
        stageLabel = $photo.stageLabel
        source = $photo.source
        sourceLabel = $photo.sourceLabel
        scene = $photo.scene
        sceneLabel = $photo.sceneLabel
        title = $title
        meta = "$($photo.season) · $($photo.stageLabel) · $($photo.sceneLabel) · $($photo.sourceLabel)"
        thumbnail = $photo.thumbnail
        photo = $photo.photo
        full = $photo.full
        alt = "$title · $($photo.sceneLabel) · RMUC $($photo.season) $($photo.stageLabel)"
        credit = $photo.credit
        serviceLabel = $photo.serviceLabel
        record = $photo.record
    }
}

$manifest = [ordered]@{
    version = 2
    format = 'YY_A000'
    prefixes = [ordered]@{
        A = '赛场时刻'
        B = '日常风采'
        C = '活动交流'
    }
    items = $manifestItems
}

$manifestJson = $manifest | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText(
    $idMapPath,
    "$manifestJson`n",
    [System.Text.UTF8Encoding]::new($false)
)

$json = $outputPhotos | ConvertTo-Json -Depth 5
$content = "window.QIANLI_COMPETITION_GALLERY = {`n  photos: $json`n};`n"

[System.IO.File]::WriteAllText(
    $outputPath,
    $content,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Output "Generated $($outputPhotos.Count) records at $outputPath"
Write-Output "Updated stable photo IDs at $idMapPath"

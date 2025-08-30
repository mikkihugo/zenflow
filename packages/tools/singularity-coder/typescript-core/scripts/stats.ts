#!/usr/bin/env bun

interface Asset {
  name:string
  download_count:number
}

interface Release {
  tag_name:string
  name:string
  assets:Asset[]
}

interface NpmDownloadsRange {
  start:string
  end:string
  package:string
  downloads:Array<{
    downloads:number
    day:string
}>
}

async function fetchNpmDownloads(packageName:string): Promise<number> {
  try {
    // Use a range from 2020 to current year + 5 years to ensure it works forever
    const currentYear = new Date().getFullYear()
    const endYear = currentYear + 5
    const response = await fetch(`https://api.npmjs.org/downloads/range/2020-01-01:${endYear}-12-31/${packageName}`)
    if (!response.ok) {
      logger.warn(`Failed to fetch npm downloads for ${packageName}: ${response.status}`);
      return 0
}
    const data:NpmDownloadsRange = await response.json()
    return data.downloads.reduce((total, day) => total + day.downloads, 0)
} catch (error) {
    logger.warn(`Error fetching npm downloads for ${packageName}:`, error)
    return 0
}
}

async function fetchReleases():Promise<Release[]> {
  const releases:Release[] = []
  let page = 1
  const per = 100

  while (true) {
    const url = `https://api.github.com/repos/sst/opencode/releases?page=${page}&per_page=${per}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`GitHub API error:${response.status} ${response.statusText}`)
}

    const batch:Release[] = await response.json()
    if (batch.length === 0) break

    releases.push(...batch)
  logger.info(`Fetched page ${page} with ${batch.length} releases`)

    if (batch.length < per) break
    page++
    await new Promise((resolve) => setTimeout(resolve, 1000))
}

  return releases
}

function calculate(releases:Release[]) {
  let total = 0
  const stats: Array<{ tag: string; name: string; downloads: number; assets: Array<{ name: string; downloads: number }> }> = []

  for (const release of releases) {
    let downloads = 0
    const assets = []

    for (const asset of release.assets) {
      downloads += asset.download_count
      assets.push({
        name:asset.name,
        downloads:asset.download_count,
})
}

    total += downloads
    stats.push({
      tag:release.tag_name,
      name:release.name,
      downloads,
      assets,
})
}

  return { total, stats}
}

async function saveStats(githubTotal:number, npmDownloads:number) {
  const file = "STATS.md"
  const date = new Date().toISOString().split("T")[0]
  const total = githubTotal + npmDownloads

  let previousGithub = 0
  let previousNpm = 0
  let previousTotal = 0
  let content = ""

  try {
    content = await Bun.file(file).text()
    const lines = content.trim().split("\n")

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (line.startsWith("|") && !line.includes("Date") && !line.includes("---")) {
        const match = line.match(
          /\|\s*[\d-]+\s*\|\s*(\d+)\s*(?:\([^)]*\))?\s*\|\s*(\d+)\s*(?:\([^)]*\))?\s*\|\s*(\d+)\s*(?:\([^)]*\))?\s*\|/,
        )
        if (match) {
          previousGithub = parseInt(match[1].replace(/,/g, ""), 10)
          previousNpm = parseInt(match[2].replace(/,/g, ""), 10)
          previousTotal = parseInt(match[3].replace(/,/g, ""), 10)
          break
}
}
}
} catch {
    content =
      "# Download Stats\n\n| Date | GitHub Downloads | npm Downloads | Total |\n|------|------------------|---------------|-------|\n"
}

  const githubChange = githubTotal - previousGithub
  const npmChange = npmDownloads - previousNpm
  const totalChange = total - previousTotal

  const githubChangeStr =
    githubChange > 0
      ? ` (+${githubChange.toLocaleString()})`
      : githubChange < 0
        ? ` (${githubChange.toLocaleString()})`
        : " (+0)"
  const npmChangeStr =
    npmChange > 0
      ? ` (+${npmChange.toLocaleString()})`
      : npmChange < 0
        ? ` (${npmChange.toLocaleString()})`
        : " (+0)"
  const totalChangeStr =
    totalChange > 0
      ? ` (+${totalChange.toLocaleString()})`
      : totalChange < 0
        ? ` (${totalChange.toLocaleString()})`
        : " (+0)"
  const line = `| ${date} | ${githubTotal.toLocaleString()}${githubChangeStr} | ${npmDownloads.toLocaleString()}${npmChangeStr} | ${total.toLocaleString()}${totalChangeStr} |\n`

  if (!content.includes("# Download Stats")) {
    content =
      "# Download Stats\n\n| Date | GitHub Downloads | npm Downloads | Total |\n|------|------------------|---------------|-------|\n"
}

  await Bun.write(file, content + line)
  await Bun.spawn(["bunx", "prettier", "--write", file]).exited

  logger.info(
    `\nAppended stats to ${file}: GitHub ${githubTotal.toLocaleString()}${githubChangeStr}, npm ${npmDownloads.toLocaleString()}${npmChangeStr}, Total ${total.toLocaleString()}${totalChangeStr}`,
  )
}

logger.info("Fetching GitHub releases for sst/opencode...\n")

const releases = await fetchReleases()
logger.info(`\nFetched ${releases.length} releases total\n`)

const { total: githubTotal, stats } = calculate(releases)

logger.info("Fetching npm all-time downloads for opencode-ai...\n")
const npmDownloads = await fetchNpmDownloads("opencode-ai")
logger.info(`Fetched npm all-time downloads: ${npmDownloads.toLocaleString()}\n`)

await saveStats(githubTotal, npmDownloads)

const totalDownloads = githubTotal + npmDownloads

logger.info("=".repeat(60))
logger.info(`TOTAL DOWNLOADS: ${totalDownloads.toLocaleString()}`)
logger.info(`  GitHub: ${githubTotal.toLocaleString()}`)
logger.info(`  npm: ${npmDownloads.toLocaleString()}`)
logger.info("=".repeat(60))

logger.info("\nDownloads by release:")
logger.info("-".repeat(60))

for (const release of stats.sort((a, b) => b.downloads - a.downloads)) {
  logger.info(`${release.tag.padEnd(15)} ${release.downloads.toLocaleString().padStart(10)} downloads`)

  if (release.assets.length > 1) {
    for (const asset of release.assets.sort((a, b) => b.downloads - a.downloads)) {
      logger.info(`  └─ ${asset.name.padEnd(25)} ${asset.downloads.toLocaleString().padStart(8)}`)
    }
  }
}

logger.info("-".repeat(60))
logger.info(`GitHub Total: ${githubTotal.toLocaleString()} downloads across ${releases.length} releases`)
logger.info(`npm Total: ${npmDownloads.toLocaleString()} downloads`)
logger.info(`Combined Total: ${totalDownloads.toLocaleString()} downloads`)

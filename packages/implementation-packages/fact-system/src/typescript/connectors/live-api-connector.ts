/**
 * @fileoverview Live API Connector for FACT System
 *
 * Fetches real-time data from NPM, GitHub, Hex.pm, and security APIs
 * when facts are not cached. Implements the wait-for-fact pattern.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  NPMFactResult,
  GitHubFactResult,
  HexFactResult,
  SecurityFactResult,
  RustCrateFactResult,
  GoModuleFactResult,
  PerlPackageFactResult,
  JavaPackageFactResult,
  GitLabRepoFactResult,
  BitbucketRepoFactResult,
} from '../types';

const logger = getLogger('LiveAPIConnector');

/**
 * Live API connector that fetches real-time data from external APIs
 */
export class LiveAPIConnector {
  private readonly npmRegistryBase = 'https://registry.npmjs.org';
  private readonly githubApiBase = 'https://api.github.com';
  private readonly hexApiBase = 'https://hex.pm/api';
  private readonly nvdApiBase = 'https://services.nvd.nist.gov/rest/json';
  private readonly cratesApiBase = 'https://crates.io/api/v1';
  private readonly goProxyBase = 'https://proxy.golang.org';
  private readonly cpanApiBase = 'https://fastapi.metacpan.org/v1';
  private readonly mavenApiBase = 'https://search.maven.org/solrsearch';
  private readonly gitlabApiBase = 'https://gitlab.com/api/v4';
  private readonly bitbucketApiBase = 'https://api.bitbucket.org/2.0';

  /**
   * Get cache TTL based on fact type and version specificity
   * Version-specific facts: 30 days (2592000000ms)
   * Non-version-specific facts: 14 days (1209600000ms)
   */
  getCacheTTL(factType: string, hasVersion: boolean): number {
    if (hasVersion) {
      return 30 * 24 * 60 * 60 * 1000; // 30 days for version-specific
    } else {
      return 14 * 24 * 60 * 60 * 1000; // 14 days for non-version-specific
    }
  }

  /**
   * Fetch live NPM package data from registry
   * @param packageName - NPM package name
   * @param version - Specific version (if not provided, fetches latest stable)
   */
  async fetchNPMPackage(
    packageName: string,
    version?: string
  ): Promise<NPMFactResult> {
    const requestedVersion = version || 'latest stable';
    logger.info(
      `Fetching live NPM data for ${packageName}@${requestedVersion}`
    );

    try {
      // Fetch package metadata
      const packageUrl = `${this.npmRegistryBase}/${encodeURIComponent(packageName)}`;
      const packageResponse = await fetch(packageUrl);

      if (!packageResponse.ok) {
        throw new Error(
          `NPM API error: ${packageResponse.status} ${packageResponse.statusText}`
        );
      }

      const packageData = await packageResponse.json();

      // Determine which version to fetch
      let targetVersion: string;
      if (version) {
        // User specified exact version
        targetVersion = version;
        if (!packageData.versions[version]) {
          throw new Error(`Version ${version} not found for ${packageName}`);
        }
      } else {
        // Fetch latest stable (prefer 'latest' tag, fallback to highest version)
        targetVersion =
          packageData['dist-tags']?.latest || Object.keys(packageData.versions).pop()!;
        logger.info(
          `ℹ️ No version specified for ${packageName}, using latest stable: ${targetVersion}`
        );
      }

      const versionData = packageData.versions[targetVersion];

      // Fetch download statistics
      const downloadsUrl = `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`;
      const downloadsResponse = await fetch(downloadsUrl);
      const downloadsData = downloadsResponse.ok
        ? await downloadsResponse.json()
        : null;

      return {
        name: packageData.name,
        version: targetVersion, // Always show the actual version that was fetched
        description: versionData.description || packageData.description || '',
        dependencies: Object.keys(versionData.dependencies || {}),
        devDependencies: Object.keys(versionData.devDependencies || {}),
        repository: this.extractRepositoryUrl(
          versionData.repository || packageData.repository
        ),
        homepage: versionData.homepage || packageData.homepage,
        license: versionData.license || packageData.license,
        downloads: downloadsData
          ? {
              weekly: downloadsData.downloads || 0,
              monthly: downloadsData.downloads * 4,
              yearly: downloadsData.downloads * 52,
            }
          : undefined,
        maintainers:
          packageData.maintainers?.map((m: any) => m.name || m.email) || [],
        keywords: versionData.keywords || packageData.keywords || [],
        publishedAt:
          packageData.time[versionData.version] || packageData.time.created,
        confidence: 1.0, // Live data has highest confidence
        source:'npm-registry-api',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Failed to fetch NPM package ${packageName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch live GitHub repository data using REST API
   */
  async fetchGitHubRepository(
    owner: string,
    repo: string
  ): Promise<GitHubFactResult> {
    logger.info(`Fetching live GitHub data for ${owner}/${repo}`);

    try {
      // Fetch repository data
      const repoUrl = `${this.githubApiBase}/repos/${owner}/${repo}`;
      const repoResponse = await fetch(repoUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'claude-code-zen-fact-system',
        },
      });

      if (!repoResponse.ok) {
        throw new Error(
          `GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`
        );
      }

      const repoData = await repoResponse.json();

      // Fetch languages data
      const languagesResponse = await fetch(
        `${this.githubApiBase}/repos/${owner}/${repo}/languages`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'claude-code-zen-fact-system',
          },
        }
      );
      const languagesData = languagesResponse.ok
        ? await languagesResponse.json()
        : {};

      // Calculate language percentages
      const totalBytes = Object.values(languagesData).reduce(
        (sum: number, bytes: any) => sum + bytes,
        0
      );
      const languages = Object.entries(languagesData).reduce(
        (acc: Record<string, number>, [lang, bytes]: [string, any]) => {
          acc[lang] =
            totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0;
          return acc;
        },
        {}
      );

      // Fetch recent releases
      const releasesResponse = await fetch(
        `${this.githubApiBase}/repos/${owner}/${repo}/releases?per_page=5`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'claude-code-zen-fact-system',
          },
        }
      );
      const releasesData = releasesResponse.ok
        ? await releasesResponse.json()
        : [];

      return {
        owner: repoData.owner.login,
        repo: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description || '',
        url: repoData.html_url,
        language: repoData.language || 'Unknown',
        languages,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        license: repoData.license?.name,
        topics: repoData.topics || [],
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        pushedAt: repoData.pushed_at,
        archived: repoData.archived,
        private: repoData.private,
        defaultBranch: repoData.default_branch,
        releases: releasesData.map((release: any) => ({
          name: release.name || release.tag_name,
          tagName: release.tag_name,
          publishedAt: release.published_at,
          prerelease: release.prerelease,
        })),
        confidence: 1.0,
        source:'github-rest-api',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(
        `Failed to fetch GitHub repository ${owner}/${repo}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Fetch live Hex package data from Hex.pm API
   */
  async fetchHexPackage(
    packageName: string,
    version?: string
  ): Promise<HexFactResult> {
    logger.info(
      `Fetching live Hex data for ${packageName}${version ? `@${version}` : ''}`
    );

    try {
      // Fetch package data
      const packageUrl = `${this.hexApiBase}/packages/${encodeURIComponent(packageName)}`;
      const packageResponse = await fetch(packageUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'claude-code-zen-fact-system',
        },
      });

      if (!packageResponse.ok) {
        throw new Error(
          `Hex API error: ${packageResponse.status} ${packageResponse.statusText}`
        );
      }

      const packageData = await packageResponse.json();

      // Get the specified version or latest
      const targetVersion =
        version || packageData.latest_stable_version || packageData.latest_version;

      // Fetch specific version data if available
      let versionData: any = null;
      if (targetVersion) {
        try {
          const versionUrl = `${this.hexApiBase}/packages/${encodeURIComponent(packageName)}/releases/${targetVersion}`;
          const versionResponse = await fetch(versionUrl, {
            headers: {
              Accept:'application/json',
              'User-Agent': 'claude-code-zen-fact-system',
            },
          });

          if (versionResponse.ok) {
            versionData = await versionResponse.json();
          }
        } catch (versionError) {
          logger.warn(
            `Could not fetch version data for ${packageName}@${targetVersion}:`,
            versionError
          );
        }
      }

      // Parse dependencies if available
      const dependencies = versionData?.requirements
        ? Object.entries(versionData.requirements).map(
            ([name, req]: [string, any]) => ({
              name,
              requirement: req.requirement || req.app || req,
              optional: req.optional || false,
            })
          )
        : [];

      return {
        name: packageData.name,
        version: targetVersion, // Always show the actual version that was fetched
        description: packageData.meta?.description || '',
        owner: packageData.owners?.[0]?.username || 'unknown',
        repository:
          packageData.meta?.links?.github || packageData.meta?.links?.repository,
        homepage: packageData.meta?.links?.homepage,
        license: packageData.meta?.licenses?.[0] || 'Unknown',
        downloads: {
          total: packageData.downloads?.all || 0,
          recent: packageData.downloads?.recent || 0,
          day: packageData.downloads?.day || 0,
          week: packageData.downloads?.week || 0,
        },
        maintainers:
          packageData.owners?.map((owner: any) => owner.username) || [],
        elixirVersion: versionData?.meta?.elixir,
        otpVersion: versionData?.meta?.otp_app,
        dependencies,
        documentation: packageData.docs_html_url,
        publishedAt: packageData.inserted_at,
        updatedAt: packageData.updated_at,
        config: versionData?.meta?.app
          ? {
              consolidateProtocols: versionData.meta.app.consolidate_protocols,
              buildEmbedded: versionData.meta.app.build_embedded,
              startPermanent: versionData.meta.app.start_permanent,
            }
          : undefined,
        confidence: 1.0,
        source:'hex-pm-api',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Failed to fetch Hex package ${packageName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch live security advisory data from NVD
   */
  async fetchSecurityAdvisory(cveId: string): Promise<SecurityFactResult> {
    logger.info(`Fetching live security data for ${cveId}`);

    try {
      // Fetch CVE data from NVD
      const cveUrl = `${this.nvdApiBase}/cves/2.0?cveId=${encodeURIComponent(cveId)}`;
      const cveResponse = await fetch(cveUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'claude-code-zen-fact-system',
        },
      });

      if (!cveResponse.ok) {
        throw new Error(
          `NVD API error: ${cveResponse.status} ${cveResponse.statusText}`
        );
      }

      const cveData = await cveResponse.json();

      if (!cveData.vulnerabilities || cveData.vulnerabilities.length === 0) {
        throw new Error(`CVE ${cveId} not found`);
      }

      const vuln = cveData.vulnerabilities[0].cve;
      const metrics =
        vuln.metrics?.cvssMetricV31?.[0] || vuln.metrics?.cvssMetricV30?.[0] || vuln.metrics?.cvssMetricV2?.[0];

      // Determine severity
      const score = metrics?.cvssData?.baseScore || 0;
      let severity:'low|medium|high|critical';
      if (score >= 9.0) severity = 'critical';
      else if (score >= 7.0) severity = 'high';
      else if (score >= 4.0) severity = 'medium';
      else severity = 'low';

      return {
        id: vuln.id,
        description:
          vuln.descriptions?.find((d: any) => d.lang === 'en')?.value || 'No description available',
        severity,
        score,
        vector: metrics?.cvssData?.vectorString || 'N/A',
        published: vuln.published,
        lastModified: vuln.lastModified,
        references: vuln.references?.map((ref: any) => ref.url) || [],
        affectedProducts:
          vuln.configurations?.nodes?.flatMap(
            (node: any) => node.cpeMatch?.map((cpe: any) => cpe.criteria) || []
          ) || [],
        mitigation: vuln.solutions?.[0]?.value,
        confidence: 1.0,
        source:'nvd-api',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Failed to fetch security advisory ${cveId}:`, error);
      throw error;
    }
  }

  /**
   * Extract clean repository URL from NPM repository field
   */
  private extractRepositoryUrl(repository: any): string | undefined {
    if (!repository) return undefined;

    if (typeof repository ==='string') {
      return repository;
    }

    if (repository.url) {
      // Clean up git+https:// URLs
      return repository.url.replace(/^git\+/, ').replace(/\.git$/, ');
    }

    return undefined;
  }

  /**
   * Fetch live Rust crate data from crates.io API
   */
  async fetchRustCrate(
    crateName: string,
    version?: string
  ): Promise<RustCrateFactResult> {
    const requestedVersion = version || 'latest stable';
    logger.info(
      `Fetching live Rust crate data for ${crateName}@${requestedVersion}`
    );

    try {
      // Fetch crate metadata
      const crateUrl = `${this.cratesApiBase}/crates/${encodeURIComponent(crateName)}`;
      const crateResponse = await fetch(crateUrl);

      if (!crateResponse.ok) {
        throw new Error(
          `Crates.io API error: ${crateResponse.status} ${crateResponse.statusText}`
        );
      }

      const crateData = await crateResponse.json();
      const crate = crateData.crate;

      // Get target version
      let targetVersion: string;
      if (version) {
        targetVersion = version;
      } else {
        // Get latest stable version
        const versionsUrl = `${this.cratesApiBase}/crates/${encodeURIComponent(crateName)}/versions`;
        const versionsResponse = await fetch(versionsUrl);
        const versionsData = versionsResponse.ok
          ? await versionsResponse.json()
          : null;

        if (versionsData) {
          const stableVersions = versionsData.versions.filter(
            (v: any) => !v.prerelease
          );
          targetVersion = stableVersions[0]?.num || crate.newest_version;
        } else {
          targetVersion = crate.newest_version;
        }
        logger.info(
          `ℹ️ No version specified for ${crateName}, using latest stable: ${targetVersion}`
        );
      }

      // Fetch specific version data
      const versionUrl = `${this.cratesApiBase}/crates/${encodeURIComponent(crateName)}/${targetVersion}`;
      const versionResponse = await fetch(versionUrl);
      const versionData: any = versionResponse.ok
        ? await versionResponse.json()
        : null;

      return {
        name: crate.name,
        version: targetVersion,
        description: crate.description || '',
        authors: versionData?.version?.authors || [],
        repository: crate.repository,
        homepage: crate.homepage,
        license: versionData?.version?.license,
        keywords: crate.keywords || [],
        categories: crate.categories || [],
        downloads: {
          total: crate.downloads,
          recent: crate.recent_downloads || 0,
        },
        dependencies:
          versionData?.dependencies?.map((dep: any) => ({
            name: dep.crate_id,
            version: dep.req,
            kind: dep.kind,
            optional: dep.optional,
          })) || [],
        features: versionData?.version?.features || {},
        rustVersion: versionData?.version?.rust_version,
        documentation:
          crate.documentation || `https://docs.rs/${crateName}/${targetVersion}`,
        docsSites: {
          docsRs: `https://docs.rs/${crateName}/${targetVersion}`,
          repository: crate.repository,
          homepage: crate.homepage,
        },
        publishedAt: crate.created_at,
        updatedAt: crate.updated_at,
        confidence: 1.0,
        source:'crates-io-api',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Failed to fetch Rust crate ${crateName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch live Go module data from Go proxy and pkg.go.dev
   */
  async fetchGoModule(
    modulePath: string,
    version?: string
  ): Promise<GoModuleFactResult> {
    const requestedVersion = version || 'latest';
    logger.info(
      `Fetching live Go module data for ${modulePath}@${requestedVersion}`
    );

    try {
      // Get module info from Go proxy
      const targetVersion = version || 'latest';
      const infoUrl = `${this.goProxyBase}/${encodeURIComponent(modulePath)}/@v/${targetVersion}.info`;
      const infoResponse = await fetch(infoUrl);

      if (!infoResponse.ok) {
        throw new Error(
          `Go proxy API error: ${infoResponse.status} ${infoResponse.statusText}`
        );
      }

      const moduleInfo = await infoResponse.json();

      // Get module content from pkg.go.dev API (unofficial)
      const pkgUrl = `https://api.pkg.go.dev/${encodeURIComponent(modulePath)}@${moduleInfo.Version}`;
      let pkgData: any = null;
      try {
        const pkgResponse = await fetch(pkgUrl);
        if (pkgResponse.ok) {
          pkgData = await pkgResponse.json();
        }
      } catch (error) {
        logger.warn(
          `Could not fetch pkg.go.dev data for ${modulePath}:`,
          error
        );
      }

      return {
        path: modulePath,
        version: moduleInfo.Version,
        description: pkgData?.Synopsis || ',
        license: pkgData?.License || ',
        repository: pkgData?.Repository || `https://${modulePath}`,
        homepage: `https://pkg.go.dev/${modulePath}`,
        goVersion: pkgData?.GoVersion,
        imports: pkgData?.Imports || [],
        packages:
          pkgData?.Packages?.map((pkg: any) => ({
            path: pkg.Path,
            name: pkg.Name,
            synopsis: pkg.Synopsis,
          })) || [],
        docsSites: {
          pkgGoDev: `https://pkg.go.dev/${modulePath}@${moduleInfo.Version}`,
          repository: pkgData?.Repository || `https://${modulePath}`,
          homepage: `https://pkg.go.dev/${modulePath}`,
        },
        publishedAt: moduleInfo.Time,
        confidence: pkgData ? 0.9 : 0.7,
        source:'go-proxy-api',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Failed to fetch Go module ${modulePath}:`, error);
      throw error;
    }
  }

  /**
   * Fetch live Perl package data from MetaCPAN API
   */
  async fetchPerlPackage(
    packageName: string,
    version?: string
  ): Promise<PerlPackageFactResult> {
    const requestedVersion = version || 'latest';
    logger.info(
      `Fetching live Perl package data for ${packageName}@${requestedVersion}`
    );

    try {
      // Search for the module
      const searchUrl = `${this.cpanApiBase}/module/${encodeURIComponent(packageName)}`;
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        throw new Error(
          `MetaCPAN API error: ${searchResponse.status} ${searchResponse.statusText}`
        );
      }

      const moduleData = await searchResponse.json();

      // Get release information
      const releaseUrl = `${this.cpanApiBase}/release/${moduleData.author}/${moduleData.release}`;
      const releaseResponse = await fetch(releaseUrl);
      const releaseData = releaseResponse.ok
        ? await releaseResponse.json()
        : null;

      return {
        name: moduleData.module[0].name,
        version: version || moduleData.version,
        description: releaseData?.abstract || moduleData.abstract || '',
        author: moduleData.author,
        authorEmail: releaseData?.author?.find((a: any) => a.email)?.email,
        license: releaseData?.license?.[0],
        repository: releaseData?.resources?.repository?.url,
        homepage: releaseData?.resources?.homepage,
        dependencies:
          releaseData?.dependency?.map((dep: any) => ({
            module: dep.module,
            version: dep.version,
            phase: dep.phase,
            relationship: dep.relationship,
          })) || [],
        keywords: [],
        abstract: releaseData?.abstract,
        publishedAt: releaseData?.date || moduleData.date,
        confidence: 1.0,
        source:'metacpan-api',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Failed to fetch Perl package ${packageName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch live Java package data from Maven Central
   */
  async fetchJavaPackage(
    groupId: string,
    artifactId: string,
    version?: string
  ): Promise<JavaPackageFactResult> {
    const packageName = `${groupId}:${artifactId}`;
    const requestedVersion = version || 'latest';
    logger.info(
      `Fetching live Java package data for ${packageName}@${requestedVersion}`
    );

    try {
      // Search Maven Central
      const searchQuery = `g:"${groupId}" AND a:"${artifactId}"`;
      const searchUrl = `${this.mavenApiBase}/select?q=${encodeURIComponent(searchQuery)}&rows=1&wt=json`;
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        throw new Error(
          `Maven Central API error: ${searchResponse.status} ${searchResponse.statusText}`
        );
      }

      const searchData = await searchResponse.json();

      if (!searchData.response.docs.length) {
        throw new Error(`Package not found: ${packageName}`);
      }

      const artifact = searchData.response.docs[0];
      const targetVersion = version || artifact.latestVersion;

      // Get POM information (simplified - would need XML parsing for full details)
      return {
        groupId: artifact.g,
        artifactId: artifact.a,
        version: targetVersion,
        name: packageName,
        description:',
        license: ',
        repository: ',
        homepage: ',
        packaging: artifact.p || 'jar',
        dependencies: [], // Would require POM parsing
        javaVersion: '',
        publishedAt: new Date(artifact.timestamp).toISOString(),
        updatedAt: new Date(artifact.timestamp).toISOString(),
        confidence: 0.8, // Lower due to limited data without POM parsing
        source: 'maven-central-api',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Failed to fetch Java package ${packageName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch live GitLab repository data
   */
  async fetchGitLabRepository(
    projectPath: string
  ): Promise<GitLabRepoFactResult> {
    logger.info(`Fetching live GitLab data for ${projectPath}`);

    try {
      // URL encode the project path
      const encodedPath = encodeURIComponent(projectPath);
      const projectUrl = `${this.gitlabApiBase}/projects/${encodedPath}`;

      const response = await fetch(projectUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'claude-code-zen-fact-system',
        },
      });

      if (!response.ok) {
        throw new Error(
          `GitLab API error: ${response.status} ${response.statusText}`
        );
      }

      const project = await response.json();

      return {
        id: project.id,
        name: project.name,
        path: project.path,
        pathWithNamespace: project.path_with_namespace,
        description: project.description || '',
        url: project.web_url,
        sshUrl: project.ssh_url_to_repo,
        httpUrl: project.http_url_to_repo,
        language: project.default_branch,
        stars: project.star_count,
        forks: project.forks_count,
        openIssues: project.open_issues_count,
        visibility: project.visibility,
        topics: project.topics || [],
        defaultBranch: project.default_branch,
        createdAt: project.created_at,
        updatedAt: project.last_activity_at,
        lastActivityAt: project.last_activity_at,
        archived: project.archived,
        avatarUrl: project.avatar_url,
        namespace: {
          id: project.namespace.id,
          name: project.namespace.name,
          path: project.namespace.path,
          kind: project.namespace.kind,
          fullPath: project.namespace.full_path,
        },
        confidence: 1.0,
        source:'gitlab-api',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Failed to fetch GitLab repository ${projectPath}:`, error);
      throw error;
    }
  }

  /**
   * Fetch live Bitbucket repository data
   */
  async fetchBitbucketRepository(
    workspace: string,
    repoSlug: string
  ): Promise<BitbucketRepoFactResult> {
    const fullName = `${workspace}/${repoSlug}`;
    logger.info(`Fetching live Bitbucket data for ${fullName}`);

    try {
      const repoUrl = `${this.bitbucketApiBase}/repositories/${workspace}/${repoSlug}`;

      const response = await fetch(repoUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'claude-code-zen-fact-system',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Bitbucket API error: ${response.status} ${response.statusText}`
        );
      }

      const repo = await response.json();

      return {
        uuid: repo.uuid,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        url: repo.links.html.href,
        cloneUrls: {
          https:
            repo.links.clone.find((link: any) => link.name === 'https')?.href || '',
          ssh:
            repo.links.clone.find((link: any) => link.name === 'ssh')?.href || '',
        },
        language: repo.language,
        size: repo.size,
        private: repo.is_private,
        forkPolicy: repo.fork_policy,
        hasIssues: repo.has_issues,
        hasWiki: repo.has_wiki,
        project: repo.project
          ? {
              key: repo.project.key,
              name: repo.project.name,
              uuid: repo.project.uuid,
            }
          : undefined,
        workspace: {
          uuid: repo.workspace.uuid,
          name: repo.workspace.name,
          slug: repo.workspace.slug,
        },
        mainBranch: {
          name: repo.mainbranch?.name || 'main',
          type: repo.mainbranch?.type || 'branch',
        },
        createdAt: repo.created_on,
        updatedAt: repo.updated_on,
        confidence: 1.0,
        source: 'bitbucket-api',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`Failed to fetch Bitbucket repository ${fullName}:`, error);
      throw error;
    }
  }
}

/**
 * Export singleton instance
 */
export const liveAPIConnector = new LiveAPIConnector();

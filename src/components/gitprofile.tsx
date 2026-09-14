import { useCallback, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { formatDistance } from 'date-fns';
import {
  CustomError,
  GENERIC_ERROR,
  INVALID_CONFIG_ERROR,
  INVALID_GITHUB_USERNAME_ERROR,
  setTooManyRequestError,
} from '../constants/errors';
import '../assets/index.css';
import { getInitialTheme, getSanitizedConfig, setupHotjar } from '../utils';
import { SanitizedConfig } from '../interfaces/sanitized-config';
import ErrorPage from './error-page';
import { BG_COLOR } from '../constants';
import { Profile } from '../interfaces/profile';
import { LanguageProvider } from '../i18n/language-context';
import ProfileIntro from './profile-intro';
import SidebarProfile from './sidebar-profile';
import TopControls from './top-controls';
import ExperienceCard from './experience-card';
import EducationCard from './education-card';
import CertificationCard from './certification-card';
import { GithubProject } from '../interfaces/github-project';
import GithubProjectCard from './github-project-card';
import ExternalProjectCard from './external-project-card';
import BlogCard from './blog-card';
import Footer from './footer';
import PublicationCard from './publication-card';

const GITHUB_API_BASE = import.meta.env.DEV
  ? '/api/github'
  : 'https://api.github.com';

interface BuildTimeGithubData {
  profile: Profile;
  projects: GithubProject[];
}

const applyProfileOverrides = (profile: Profile): Profile => ({
  ...profile,
  name: CONFIG.profile?.name || profile.name,
});

const loadBuildTimeGithubData =
  async (): Promise<BuildTimeGithubData | null> => {
    if (!import.meta.env.PROD) {
      return null;
    }

    try {
      const response = await fetch(
        `${import.meta.env.BASE_URL}github-data.json`,
      );

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as BuildTimeGithubData;
    } catch {
      return null;
    }
  };

/**
 * Formats the GitHub rate limit reset time for display.
 *
 * The `x-ratelimit-reset` header is not always readable (it requires
 * `Access-Control-Expose-Headers` cross-origin, and is absent on non-rate-limit
 * responses), so this returns null rather than throwing when it is unusable.
 *
 * @param {AxiosError} error - the axios error carrying the response headers
 * @return {string | null} humanized reset time, or null when unavailable
 */
const formatRateLimitReset = (error: AxiosError): string | null => {
  const rawReset = error.response?.headers?.['x-ratelimit-reset'];

  if (rawReset === undefined || rawReset === null || rawReset === '') {
    return null;
  }

  const resetTimestamp = Number(rawReset);

  if (!Number.isFinite(resetTimestamp)) {
    return null;
  }

  try {
    return formatDistance(new Date(resetTimestamp * 1000), new Date(), {
      addSuffix: true,
    });
  } catch {
    return null;
  }
};

/**
 * Renders the profile once the config is known to be valid.
 *
 * Receiving an already-sanitized config means every read below is safe, so the
 * hooks here never have to defend against a missing config.
 *
 * @param {Object} sanitizedConfig - the validated configuration object
 * @return {JSX.Element} the rendered profile
 */
const GitProfileContent = ({
  sanitizedConfig,
}: {
  sanitizedConfig: SanitizedConfig;
}) => {
  const [theme, setTheme] = useState<string>(() =>
    getInitialTheme(sanitizedConfig.themeConfig),
  );
  const [error, setError] = useState<CustomError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [githubProjects, setGithubProjects] = useState<GithubProject[]>([]);

  const getGithubProjects = useCallback(
    async (publicRepoCount: number): Promise<GithubProject[]> => {
      if (sanitizedConfig.projects.github.mode === 'automatic') {
        if (publicRepoCount === 0) {
          return [];
        }

        const excludeRepo =
          sanitizedConfig.projects.github.automatic.exclude.projects
            .map((project) => `+-repo:${project}`)
            .join('');

        const query = `user:${sanitizedConfig.github.username}+fork:${!sanitizedConfig.projects.github.automatic.exclude.forks}${excludeRepo}`;
        const url = `${GITHUB_API_BASE}/search/repositories?q=${query}&sort=${sanitizedConfig.projects.github.automatic.sortBy}&per_page=${sanitizedConfig.projects.github.automatic.limit}&type=Repositories`;

        const repoResponse = await axios.get(url, {
          headers: { 'Content-Type': 'application/vnd.github.v3+json' },
        });
        const repoData = repoResponse.data;

        return repoData.items;
      } else {
        if (sanitizedConfig.projects.github.manual.projects.length === 0) {
          return [];
        }
        const repos = sanitizedConfig.projects.github.manual.projects
          .map((project) => `+repo:${project}`)
          .join('');

        const url = `${GITHUB_API_BASE}/search/repositories?q=${repos}+fork:true&type=Repositories`;

        const repoResponse = await axios.get(url, {
          headers: { 'Content-Type': 'application/vnd.github.v3+json' },
        });
        const repoData = repoResponse.data;

        return repoData.items;
      }
    },
    [
      sanitizedConfig.github.username,
      sanitizedConfig.projects.github.mode,
      sanitizedConfig.projects.github.manual.projects,
      sanitizedConfig.projects.github.automatic.sortBy,
      sanitizedConfig.projects.github.automatic.limit,
      sanitizedConfig.projects.github.automatic.exclude.forks,
      sanitizedConfig.projects.github.automatic.exclude.projects,
    ],
  );

  const handleError = useCallback((error: AxiosError | Error): void => {
    console.error('Error:', error);

    if (!(error instanceof AxiosError)) {
      setError(GENERIC_ERROR);
      return;
    }

    switch (error.response?.status) {
      case 403:
      case 429:
        setError(setTooManyRequestError(formatRateLimitReset(error)));
        break;
      case 404:
        setError(INVALID_GITHUB_USERNAME_ERROR);
        break;
      default:
        setError(GENERIC_ERROR);
        break;
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const buildTimeData = await loadBuildTimeGithubData();
      if (buildTimeData) {
        setProfile(applyProfileOverrides(buildTimeData.profile));

        if (sanitizedConfig.projects.github.display) {
          setGithubProjects(buildTimeData.projects);
        }

        return;
      }

      const response = await axios.get(
        `${GITHUB_API_BASE}/users/${sanitizedConfig.github.username}`,
      );
      const data = response.data;

      setProfile(
        applyProfileOverrides({
          avatar: data.avatar_url,
          name: data.name || ' ',
          bio: data.bio || '',
          location: data.location || '',
          company: data.company || '',
        }),
      );

      if (!sanitizedConfig.projects.github.display) {
        return;
      }

      setGithubProjects(await getGithubProjects(data.public_repos));
    } catch (error) {
      handleError(error as AxiosError | Error);
    } finally {
      setLoading(false);
    }
  }, [
    sanitizedConfig.github.username,
    sanitizedConfig.projects.github.display,
    getGithubProjects,
    handleError,
  ]);

  useEffect(() => {
    setupHotjar(sanitizedConfig.hotjar);
    // loadData is an async fetch that sets state. Satisfying set-state-in-effect
    // here means moving data fetching out of the effect entirely (a data library
    // or `use()`), which is a separate change from deriving theme/error above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [sanitizedConfig, loadData]);

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <div className="fade-in min-h-screen">
      {error ? (
        <ErrorPage
          status={error.status}
          title={error.title}
          subTitle={error.subTitle}
        />
      ) : (
        <>
          <TopControls
            theme={theme}
            setTheme={setTheme}
            loading={loading}
            themeConfig={sanitizedConfig.themeConfig}
          />
          <div className={`portfolio-layout ${BG_COLOR}`}>
            <SidebarProfile
              profile={profile}
              loading={loading}
              github={sanitizedConfig.github}
              social={sanitizedConfig.social}
              themeConfig={sanitizedConfig.themeConfig}
            />

            <main className="portfolio-main">
              <ProfileIntro
                profile={profile}
                loading={loading}
                skills={sanitizedConfig.skills}
              />

              <div className="portfolio-content-grid">
                {sanitizedConfig.experiences.length !== 0 && (
                  <ExperienceCard
                    loading={loading}
                    experiences={sanitizedConfig.experiences}
                  />
                )}
                {sanitizedConfig.educations.length !== 0 && (
                  <EducationCard
                    loading={loading}
                    educations={sanitizedConfig.educations}
                  />
                )}
                {sanitizedConfig.certifications.length !== 0 && (
                  <CertificationCard
                    loading={loading}
                    certifications={sanitizedConfig.certifications}
                  />
                )}
                {sanitizedConfig.projects.github.display && (
                  <GithubProjectCard
                    header={sanitizedConfig.projects.github.header}
                    limit={sanitizedConfig.projects.github.automatic.limit}
                    githubProjects={githubProjects}
                    loading={loading}
                    googleAnalyticsId={sanitizedConfig.googleAnalytics.id}
                  />
                )}
                {sanitizedConfig.projects.external.projects.length !== 0 && (
                  <ExternalProjectCard
                    loading={loading}
                    header={sanitizedConfig.projects.external.header}
                    externalProjects={
                      sanitizedConfig.projects.external.projects
                    }
                    googleAnalyticId={sanitizedConfig.googleAnalytics.id}
                  />
                )}
                {sanitizedConfig.publications.length !== 0 && (
                  <PublicationCard
                    loading={loading}
                    publications={sanitizedConfig.publications}
                  />
                )}
                {sanitizedConfig.blog.display && (
                  <BlogCard
                    loading={loading}
                    googleAnalyticsId={sanitizedConfig.googleAnalytics.id}
                    blog={sanitizedConfig.blog}
                  />
                )}
              </div>
            </main>
          </div>
          {sanitizedConfig.footer && (
            <footer
              className={`p-4 footer ${BG_COLOR} text-base-content footer-center border-t border-base-300`}
            >
              <div className="card card-sm bg-base-100 shadow-sm">
                <Footer content={sanitizedConfig.footer} loading={loading} />
              </div>
            </footer>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Narrows a sanitized config to its populated form.
 *
 * `getSanitizedConfig` returns an empty object when the supplied config is
 * unusable, which is the only signal that validation failed.
 *
 * @param {Object} config - the result of getSanitizedConfig
 * @return {boolean} whether the config is populated
 */
const isValidConfig = (
  config: SanitizedConfig | Record<string, never>,
): config is SanitizedConfig => Object.keys(config).length !== 0;

/**
 * Renders the GitProfile component.
 *
 * Validation happens here so that an invalid config short-circuits to the error
 * page before any hook that assumes a populated config is ever created.
 *
 * @param {Object} config - the configuration object
 * @return {JSX.Element} the rendered GitProfile component
 */
const GitProfile = ({ config }: { config: Config }) => {
  const [sanitizedConfig] = useState<SanitizedConfig | Record<string, never>>(
    getSanitizedConfig(config),
  );

  if (!isValidConfig(sanitizedConfig)) {
    return (
      <ErrorPage
        status={INVALID_CONFIG_ERROR.status}
        title={INVALID_CONFIG_ERROR.title}
        subTitle={INVALID_CONFIG_ERROR.subTitle}
      />
    );
  }

  return (
    <LanguageProvider>
      <GitProfileContent sanitizedConfig={sanitizedConfig} />
    </LanguageProvider>
  );
};

export default GitProfile;

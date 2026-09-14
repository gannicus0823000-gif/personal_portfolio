import { Fragment } from 'react';
import {
  AiFillGithub,
  AiFillInstagram,
  AiFillMediumSquare,
} from 'react-icons/ai';
import { CgDribbble } from 'react-icons/cg';
import {
  FaBehanceSquare,
  FaBuilding,
  FaDev,
  FaFacebook,
  FaGlobe,
  FaLinkedin,
  FaMastodon,
  FaReddit,
  FaStackOverflow,
  FaTelegram,
  FaYoutube,
} from 'react-icons/fa';
import { FaSquareThreads } from 'react-icons/fa6';
import { MdLocationOn } from 'react-icons/md';
import { RiDiscordFill, RiMailFill, RiPhoneFill } from 'react-icons/ri';
import { SiResearchgate, SiX, SiUdemy } from 'react-icons/si';
import { useLanguage } from '../../i18n/use-language';
import { TranslationKey } from '../../i18n/translations';
import { Profile } from '../../interfaces/profile';
import {
  SanitizedGithub,
  SanitizedSocial,
} from '../../interfaces/sanitized-config';
import { skeleton } from '../../utils';

type Props = {
  profile: Profile | null;
  loading: boolean;
  social: SanitizedSocial;
  github: SanitizedGithub;
  variant?: 'card' | 'sidebar';
};

const isCompanyMention = (company: string): boolean => {
  return company.startsWith('@') && !company.includes(' ');
};

const companyLink = (company: string): string => {
  return `https://github.com/${company.substring(1)}`;
};

const getFormattedMastodonValue = (
  mastodonValue: string,
  isLink: boolean,
): string => {
  const [username, server] = mastodonValue.split('@');

  if (isLink) {
    return `https://${server}/@${username}`;
  } else {
    return `${username}@${server}`;
  }
};

const ListItem: React.FC<{
  icon: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
  link?: string;
  skeleton?: boolean;
  variant?: 'card' | 'sidebar';
}> = ({ icon, title, value, link, skeleton = false, variant = 'card' }) => {
  if (variant === 'sidebar' && link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="portfolio-nav-link"
      >
        <span className="portfolio-nav-link-icon">{icon}</span>
        <span>{title}</span>
      </a>
    );
  }

  return (
    <div className="flex justify-start py-2 px-1 items-center">
      <div className="grow font-medium gap-2 flex items-center my-1">
        {icon} {title}
      </div>
      <div
        className={`${
          skeleton ? 'grow' : ''
        } text-sm font-normal text-right mr-2 ml-3 ${link ? 'truncate' : ''}`}
        style={{
          wordBreak: 'break-word',
        }}
      >
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="flex justify-start py-2 px-1 items-center"
        >
          {value}
        </a>
      </div>
    </div>
  );
};

const OrganizationItem: React.FC<{
  icon: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode | string;
  link?: string;
  skeleton?: boolean;
}> = ({ icon, title, value, link, skeleton = false }) => {
  const renderValue = () => {
    if (typeof value === 'string') {
      return value.split(' ').map((company) => {
        company = company.trim();
        if (!company) return null;

        if (isCompanyMention(company)) {
          return (
            <a
              href={companyLink(company)}
              target="_blank"
              rel="noreferrer"
              key={company}
            >
              {company}
            </a>
          );
        } else {
          return <span key={company}>{company}</span>;
        }
      });
    }
    return value;
  };

  return (
    <div className="flex justify-start py-2 px-1 items-center">
      <div className="grow font-medium gap-2 flex items-center my-1">
        {icon} {title}
      </div>
      <div
        className={`${
          skeleton ? 'grow' : ''
        } text-sm font-normal text-right mr-2 ml-3 space-x-2 ${link ? 'truncate' : ''}`}
        style={{
          wordBreak: 'break-word',
        }}
      >
        {renderValue()}
      </div>
    </div>
  );
};

/**
 * Renders the details card component.
 *
 * @param {Object} profile - The profile object.
 * @param {boolean} loading - Indicates whether the data is loading.
 * @param {Object} social - The social object.
 * @param {Object} github - The GitHub object.
 * @return {JSX.Element} The details card component.
 */
const DetailsCard = ({
  profile,
  loading,
  social,
  github,
  variant = 'card',
}: Props) => {
  const { t } = useLanguage();

  const label = (key: TranslationKey) =>
    variant === 'sidebar' ? t(key) : `${t(key)}:`;

  const renderSkeleton = () => {
    const array = [];
    for (let index = 0; index < 4; index++) {
      array.push(
        <ListItem
          key={index}
          skeleton={true}
          variant={variant}
          icon={skeleton({ widthCls: 'w-4', heightCls: 'h-4' })}
          title={skeleton({ widthCls: 'w-24', heightCls: 'h-4' })}
          value={skeleton({ widthCls: 'w-full', heightCls: 'h-4' })}
        />,
      );
    }

    return array;
  };

  const content = (
    <div className="text-base-content">
      {loading || !profile ? (
        renderSkeleton()
      ) : (
        <Fragment>
          {variant === 'card' && profile.location && (
            <ListItem
              icon={<MdLocationOn />}
              title={label('basedIn')}
              value={profile.location}
              variant={variant}
            />
          )}
          {variant === 'card' && profile.company && (
            <OrganizationItem
              icon={<FaBuilding />}
              title={label('organization')}
              value={profile.company}
              link={
                isCompanyMention(profile.company.trim())
                  ? companyLink(profile.company.trim())
                  : undefined
              }
            />
          )}
          <ListItem
            icon={<AiFillGithub />}
            title={label('github')}
            value={github.username}
            link={`https://github.com/${github.username}`}
            variant={variant}
          />
          {social?.researchGate && (
            <ListItem
              icon={<SiResearchgate />}
              title={label('researchGate')}
              value={social.researchGate}
              link={`https://www.researchgate.net/profile/${social.researchGate}`}
              variant={variant}
            />
          )}
          {social?.x && (
            <ListItem
              icon={<SiX />}
              title={label('x')}
              value={social.x}
              link={`https://x.com/${social.x}`}
              variant={variant}
            />
          )}
          {social?.mastodon && (
            <ListItem
              icon={<FaMastodon />}
              title={label('mastodon')}
              value={getFormattedMastodonValue(social.mastodon, false)}
              link={getFormattedMastodonValue(social.mastodon, true)}
              variant={variant}
            />
          )}
          {social?.linkedin && (
            <ListItem
              icon={<FaLinkedin />}
              title={label('linkedin')}
              value={social.linkedin}
              link={`https://www.linkedin.com/in/${social.linkedin}`}
              variant={variant}
            />
          )}
          {social?.dribbble && (
            <ListItem
              icon={<CgDribbble />}
              title={label('dribbble')}
              value={social.dribbble}
              link={`https://dribbble.com/${social.dribbble}`}
              variant={variant}
            />
          )}
          {social?.behance && (
            <ListItem
              icon={<FaBehanceSquare />}
              title={label('behance')}
              value={social.behance}
              link={`https://www.behance.net/${social.behance}`}
              variant={variant}
            />
          )}
          {social?.facebook && (
            <ListItem
              icon={<FaFacebook />}
              title={label('facebook')}
              value={social.facebook}
              link={`https://www.facebook.com/${social.facebook}`}
              variant={variant}
            />
          )}
          {social?.instagram && (
            <ListItem
              icon={<AiFillInstagram />}
              title={label('instagram')}
              value={social.instagram}
              link={`https://www.instagram.com/${social.instagram}`}
              variant={variant}
            />
          )}
          {social?.reddit && (
            <ListItem
              icon={<FaReddit />}
              title={label('reddit')}
              value={social.reddit}
              link={`https://www.reddit.com/user/${social.reddit}`}
              variant={variant}
            />
          )}
          {social?.threads && (
            <ListItem
              icon={<FaSquareThreads />}
              title={label('threads')}
              value={social.threads}
              link={`https://www.threads.net/@${social.threads.replace('@', '')}`}
              variant={variant}
            />
          )}
          {social?.youtube && (
            <ListItem
              icon={<FaYoutube />}
              title={label('youtube')}
              value={`@${social.youtube}`}
              link={`https://www.youtube.com/@${social.youtube}`}
              variant={variant}
            />
          )}
          {social?.udemy && (
            <ListItem
              icon={<SiUdemy />}
              title={label('udemy')}
              value={social.udemy}
              link={`https://www.udemy.com/user/${social.udemy}`}
              variant={variant}
            />
          )}
          {social?.medium && (
            <ListItem
              icon={<AiFillMediumSquare />}
              title={label('medium')}
              value={social.medium}
              link={`https://medium.com/@${social.medium}`}
              variant={variant}
            />
          )}
          {social?.dev && (
            <ListItem
              icon={<FaDev />}
              title={label('dev')}
              value={social.dev}
              link={`https://dev.to/${social.dev}`}
              variant={variant}
            />
          )}
          {social?.stackoverflow && (
            <ListItem
              icon={<FaStackOverflow />}
              title={label('stackOverflow')}
              value={social.stackoverflow.split('/').slice(-1)}
              link={`https://stackoverflow.com/users/${social.stackoverflow}`}
              variant={variant}
            />
          )}
          {social?.website && (
            <ListItem
              icon={<FaGlobe />}
              title={label('website')}
              value={social.website
                .replace('https://', '')
                .replace('http://', '')}
              link={
                !social.website.startsWith('http')
                  ? `http://${social.website}`
                  : social.website
              }
              variant={variant}
            />
          )}
          {social?.telegram && (
            <ListItem
              icon={<FaTelegram />}
              title={t('telegram')}
              value={social.telegram}
              link={`https://t.me/${social.telegram}`}
              variant={variant}
            />
          )}
          {social?.phone && (
            <ListItem
              icon={<RiPhoneFill />}
              title={label('phone')}
              value={social.phone}
              link={`tel:${social.phone}`}
              variant={variant}
            />
          )}
          {social?.email && (
            <ListItem
              icon={<RiMailFill />}
              title={label('email')}
              value={social.email}
              link={`mailto:${social.email}`}
              variant={variant}
            />
          )}
          {social?.discord && (
            <ListItem
              icon={<RiDiscordFill />}
              title={label('discord')}
              value={social.discord}
              link={`https://discord.com/app`}
              variant={variant}
            />
          )}
        </Fragment>
      )}
    </div>
  );

  if (variant === 'sidebar') {
    return <nav className="portfolio-sidebar-nav">{content}</nav>;
  }

  return (
    <div className="card shadow-lg card-sm bg-base-100">
      <div className="card-body">{content}</div>
    </div>
  );
};

export default DetailsCard;

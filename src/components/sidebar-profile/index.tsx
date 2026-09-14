import { FALLBACK_IMAGE } from '../../constants';
import { Profile } from '../../interfaces/profile';
import {
  SanitizedGithub,
  SanitizedSocial,
} from '../../interfaces/sanitized-config';
import { skeleton } from '../../utils';
import LazyImage from '../lazy-image';
import DetailsCard from '../details-card';

const SidebarProfile = ({
  profile,
  loading,
  github,
  social,
  themeConfig,
}: {
  profile: Profile | null;
  loading: boolean;
  github: SanitizedGithub;
  social: SanitizedSocial;
  themeConfig: { displayAvatarRing: boolean };
}) => {
  return (
    <aside className="portfolio-sidebar">
      <div className="flex flex-col items-center text-center">
        {loading || !profile ? (
          <div className="avatar mb-5">
            <div className="w-24 h-24 rounded-full">
              {skeleton({ widthCls: 'w-full', heightCls: 'h-full', shape: '' })}
            </div>
          </div>
        ) : (
          <div className="avatar mb-5">
            <div
              className={`w-24 h-24 rounded-full ${
                themeConfig.displayAvatarRing
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
                  : ''
              }`}
            >
              <LazyImage
                src={profile.avatar || FALLBACK_IMAGE}
                alt={profile.name}
                placeholder={skeleton({
                  widthCls: 'w-full',
                  heightCls: 'h-full',
                  shape: '',
                })}
              />
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold text-base-content">
          {loading || !profile
            ? skeleton({ widthCls: 'w-28', heightCls: 'h-7' })
            : profile.name?.trim() || github.username}
        </h2>

        <p className="mt-3 text-sm text-base-content/60 leading-relaxed">
          {loading || !profile
            ? skeleton({ widthCls: 'w-full', heightCls: 'h-12' })
            : profile.bio || `@${github.username}`}
        </p>
      </div>

      <div className="portfolio-sidebar-divider" />

      <DetailsCard
        profile={profile}
        loading={loading}
        social={social}
        github={github}
        variant="sidebar"
      />
    </aside>
  );
};

export default SidebarProfile;

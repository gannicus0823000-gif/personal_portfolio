import { useLanguage } from '../../i18n/use-language';
import { Profile } from '../../interfaces/profile';
import { skeleton } from '../../utils';

const ProfileIntro = ({
  profile,
  loading,
  skills,
}: {
  profile: Profile | null;
  loading: boolean;
  skills: string[];
}) => {
  const { t } = useLanguage();

  return (
    <section className="portfolio-section">
      <div className="mb-2 text-sm text-base-content/50">
        {loading
          ? skeleton({ widthCls: 'w-40', heightCls: 'h-4' })
          : t('about')}
      </div>
      <h1 className="text-3xl lg:text-4xl font-bold text-base-content mb-4 leading-tight">
        {loading || !profile
          ? skeleton({ widthCls: 'w-64', heightCls: 'h-10' })
          : profile.name?.trim() || 'Portfolio'}
      </h1>
      <p className="text-base lg:text-lg text-base-content/70 leading-relaxed max-w-3xl">
        {loading || !profile
          ? skeleton({ widthCls: 'w-full', heightCls: 'h-20' })
          : profile.bio || t('welcome')}
      </p>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index}>
                  {skeleton({ widthCls: 'w-16', heightCls: 'h-7' })}
                </div>
              ))
            : skills.map((skill) => (
                <span
                  key={skill}
                  className="portfolio-tag px-3 py-1 text-sm text-base-content/70"
                >
                  {skill}
                </span>
              ))}
        </div>
      )}
    </section>
  );
};

export default ProfileIntro;

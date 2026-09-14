import { RiTranslate } from 'react-icons/ri';
import { useLanguage } from '../../i18n/use-language';
import { Language } from '../../i18n/translations';
import { SanitizedThemeConfig } from '../../interfaces/sanitized-config';
import { skeleton } from '../../utils';
import ThemeChanger from '../theme-changer';

const LanguageSwitcher = ({ loading }: { loading: boolean }) => {
  const { language, setLanguage, t } = useLanguage();

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
  };

  return (
    <div title={t('language')} className="dropdown dropdown-end">
      <div
        tabIndex={0}
        className="btn btn-ghost btn-sm gap-1 normal-case opacity-80 text-base-content"
      >
        {loading ? (
          skeleton({ widthCls: 'w-10', heightCls: 'h-5' })
        ) : (
          <>
            <RiTranslate className="w-4 h-4" />
            <span className="text-sm">{language === 'zh' ? '中文' : 'EN'}</span>
          </>
        )}
      </div>
      <div
        tabIndex={0}
        className="dropdown-content z-50 mt-2 min-w-28 rounded-lg bg-base-200 p-2 shadow-xl"
      >
        <ul className="menu menu-sm p-0">
          <li>
            <button
              type="button"
              className={language === 'zh' ? 'active' : ''}
              onClick={() => changeLanguage('zh')}
            >
              {t('chinese')}
            </button>
          </li>
          <li>
            <button
              type="button"
              className={language === 'en' ? 'active' : ''}
              onClick={() => changeLanguage('en')}
            >
              {t('english')}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

const TopControls = ({
  theme,
  setTheme,
  loading,
  themeConfig,
}: {
  theme: string;
  setTheme: (theme: string) => void;
  loading: boolean;
  themeConfig: SanitizedThemeConfig;
}) => {
  return (
    <div className="portfolio-top-controls">
      <LanguageSwitcher loading={loading} />
      {!themeConfig.disableSwitch && (
        <ThemeChanger
          theme={theme}
          setTheme={setTheme}
          loading={loading}
          themeConfig={themeConfig}
          variant="toolbar"
        />
      )}
    </div>
  );
};

export default TopControls;

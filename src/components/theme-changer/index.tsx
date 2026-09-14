import { RiDice4Line } from 'react-icons/ri';
import { useLanguage } from '../../i18n/use-language';
import { SanitizedThemeConfig } from '../../interfaces/sanitized-config';
import { LOCAL_STORAGE_KEY_NAME } from '../../constants';
import { skeleton } from '../../utils';
import { MouseEvent } from 'react';

const ThemeChanger = ({
  theme,
  setTheme,
  loading,
  themeConfig,
  variant = 'card',
}: {
  theme: string;
  setTheme: (theme: string) => void;
  loading: boolean;
  themeConfig: SanitizedThemeConfig;
  variant?: 'card' | 'toolbar';
}) => {
  const { t } = useLanguage();

  const changeTheme = (
    e: MouseEvent<HTMLAnchorElement>,
    selectedTheme: string,
  ) => {
    e.preventDefault();

    document.querySelector('html')?.setAttribute('data-theme', selectedTheme);

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_NAME, selectedTheme);
    }

    setTheme(selectedTheme);
  };

  const themeLabel = theme === themeConfig.defaultTheme ? t('default') : theme;

  const dropdown = (
    <div title={t('changeTheme')} className="dropdown dropdown-end">
      <div
        tabIndex={0}
        className={
          variant === 'toolbar'
            ? 'btn btn-ghost btn-sm gap-1 normal-case opacity-80 text-base-content'
            : 'btn btn-ghost m-1 normal-case opacity-50 text-base-content flex items-center whitespace-nowrap'
        }
      >
        {loading ? (
          skeleton({ widthCls: 'w-10', heightCls: 'h-5' })
        ) : (
          <>
            <RiDice4Line className="inline-block w-4 h-4 stroke-current" />
            {variant === 'toolbar' && (
              <span className="text-sm capitalize">{themeLabel}</span>
            )}
          </>
        )}
      </div>
      <div
        tabIndex={0}
        className="dropdown-content z-50 mt-2 max-h-96 min-w-max overflow-y-auto rounded-lg bg-base-200 p-2 shadow-xl"
      >
        <ul className="menu menu-sm p-0">
          {[
            themeConfig.defaultTheme,
            ...themeConfig.themes.filter(
              (item) => item !== themeConfig.defaultTheme,
            ),
          ].map((item, index) => (
            <li key={index}>
              <a
                onClick={(e) => changeTheme(e, item)}
                className={`${theme === item ? 'active' : ''}`}
              >
                <span className="opacity-80 capitalize">
                  {item === themeConfig.defaultTheme ? t('default') : item}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  if (variant === 'toolbar') {
    return dropdown;
  }

  return (
    <div className="card overflow-visible shadow-lg card-sm bg-base-100">
      <div className="flex-row items-center space-x-4 flex pl-6 pr-2 py-4">
        <div className="flex-1">
          <h5 className="card-title">
            {loading ? (
              skeleton({
                widthCls: 'w-20',
                heightCls: 'h-8',
                className: 'mb-1',
              })
            ) : (
              <span className="text-base-content opacity-70">{t('theme')}</span>
            )}
          </h5>
          <span className="text-base-content/50 capitalize text-sm">
            {loading
              ? skeleton({ widthCls: 'w-16', heightCls: 'h-5' })
              : themeLabel}
          </span>
        </div>
        <div className="flex-0">{dropdown}</div>
      </div>
    </div>
  );
};

export default ThemeChanger;

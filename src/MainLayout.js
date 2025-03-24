import { createWithRemoteLoader } from '@kne/remote-loader';
import { Outlet, useNavigate } from 'react-router-dom';
import { Select } from 'antd';

const LangSelect = createWithRemoteLoader({
  modules: ['components-core:Global@useGlobalContext']
})(({ remoteModules }) => {
  const [useGlobalContext] = remoteModules;
  const { global: lang, setGlobal: setLang } = useGlobalContext('lang');
  const nav = useNavigate();
  return (
    <Select
      value={lang}
      onChange={currentLang => {
        setLang(currentLang);
        window.localStorage.setItem('lang', currentLang);
        nav('/document');
      }}
      style={{ width: '100px' }}
      options={[
        { label: '中文', value: 'zh' },
        { label: 'English', value: 'en' }
      ]}
    />
  );
});

const MainLayout = createWithRemoteLoader({
  modules: ['components-core:Global', 'components-core:Layout']
})(({ remoteModules, paths, preset, ...props }) => {
  const [Global, Layout] = remoteModules;
  return (
    <Global {...props} preset={preset}>
      <Layout
        navigation={{
          defaultTitle: 'Product documentation',
          showIndex: false,
          headerLogo: { src: window.PUBLIC_URL + '/logo.png' },
          list: paths,
          rightOptions: <LangSelect />
        }}
      >
        <Outlet />
      </Layout>
    </Global>
  );
});

export default MainLayout;

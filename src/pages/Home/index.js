import { createWithRemoteLoader } from '@kne/remote-loader';

const Home = createWithRemoteLoader({
  modules: ['components-document:MarkdownPage', 'components-core:Global@useGlobalContext']
})(({ remoteModules }) => {
  const [MarkdownPage, useGlobalContext] = remoteModules;
  const { global: currentLang } = useGlobalContext('lang');

  return (
    <MarkdownPage
      url="https://leapin-ai.github.io/product-doc"
      params={{ lang: currentLang, timestamp: Date.now() }}
      transformResponse={response => {
        return {
          data: {
            code: 200,
            results: response.data.filter(item => {
              const [, lang] = item.path.split('/');
              return response.config.params.lang === lang;
            })
          }
        };
      }}
      transformMenuData={data => {
        return data.map(item => {
          return Object.assign({}, item, { path: '/' + item.path.split('/').slice(2).join('/') });
        }).sort((a, b) => a.index - b.index);
      }}
      name="product-doc"
      contentClassName="md-content"
      baseUrl={'/document'}
      assetsPath={'https://leapin-ai.github.io/product-doc/assets'}
    />
  );
});

export default Home;

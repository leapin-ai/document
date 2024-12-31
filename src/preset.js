import React from 'react';
import { preset as fetchPreset } from '@kne/react-fetch';
import { Spin, Empty, message } from 'antd';
import axios from 'axios';
import { preset as remoteLoaderPreset } from '@kne/remote-loader';
import omit from 'lodash/omit';

window.PUBLIC_URL = window.runtimePublicUrl || process.env.PUBLIC_URL;

export const globalInit = async () => {
  const ajax = (() => {
    const instance = axios.create({
      validateStatus: function () {
        return true;
      }
    });

    instance.interceptors.response.use(
      response => {
        if (response.status !== 200) {
          response.showError !== false && response.config.showError !== false && message.error(response?.data?.msg || '请求发生错误');
        }
        return response;
      },
      error => {
        message.error(error.message || '请求发生错误');
        return Promise.reject(error);
      }
    );

    return params => {
      if (params.hasOwnProperty('loader') && typeof params.loader === 'function') {
        return Promise.resolve(params.loader(omit(params, ['loader'])))
          .then(data => ({
            data: {
              code: 0,
              data
            }
          }))
          .catch(err => {
            message.error(err.message || '请求发生错误');
            return { data: { code: 500, msg: err.message } };
          });
      }

      return instance(params);
    };
  })();
  fetchPreset({
    ajax,
    loading: (
      <Spin
        delay={500}
        style={{
          position: 'absolute',
          left: '50%',
          padding: '10px',
          transform: 'translateX(-50%)'
        }}
      />
    ),
    error: null,
    empty: <Empty />,
    transformResponse: response => {
      const { data } = response;
      response.data = {
        code: data.code === 0 ? 200 : data.code,
        msg: data.msg,
        results: data.data
      };
      return response;
    }
  });
  const registry = {
    url: 'https://cdn.jsdelivr.net',
    tpl: '{{url}}/npm/@kne-components/{{remote}}@{{version}}/build'
  };

  const componentsCoreRemote = {
    ...registry,
    remote: 'components-core',
    defaultVersion: '0.2.85'
  };
  remoteLoaderPreset({
    remotes: {
      default: componentsCoreRemote,
      'components-core': componentsCoreRemote,
      'components-iconfont': {
        ...registry,
        remote: 'components-iconfont',
        defaultVersion: '0.1.8'
      },
      'components-document': {
        ...registry,
        //url: 'http://localhost:3001',
        //tpl: '{{url}}',
        remote: 'components-document',
        defaultVersion: '0.1.6'
      },
      document:
        process.env.NODE_ENV === 'development'
          ? {
              remote: 'document',
              url: '/',
              tpl: '{{url}}'
            }
          : {
              ...registry,
              remote: 'document',
              defaultVersion: process.env.DEFAULT_VERSION
            }
    }
  });

  return {
    ajax,
    global: { lang: window.localStorage.getItem('lang') || window.navigator.language.split('-')[0] },
    themeToken: {
      colorPrimary: '#2257bf'
    }
  };
};

import os from 'os';

import cacache from 'cacache';
import findCacheDir from 'find-cache-dir';
import serialize from 'serialize-javascript';

export default class Webpack4Cache {
  constructor(compilation, options, weakCache) {
    this.cache =
      options.cache === true
        ? Webpack4Cache.getCacheDirectory()
        : options.cache;
    this.weakCache = weakCache;
  }

  static getCacheDirectory() {
    return (
      findCacheDir({ name: 'json-minimizer-webpack-plugin' }) || os.tmpdir()
    );
  }

  async get(cacheData, sources) {
    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    const weakOutput = this.weakCache.get(cacheData.inputSource);

    if (weakOutput) {
      return weakOutput;
    }

    // eslint-disable-next-line no-param-reassign
    cacheData.cacheIdent =
      cacheData.cacheIdent || serialize(cacheData.cacheKeys);

    let cachedResult;

    try {
      cachedResult = await cacache.get(this.cache, cacheData.cacheIdent);
    } catch (ignoreError) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    cachedResult.source = new sources.RawSource(JSON.parse(cachedResult.data));

    return cachedResult;
  }

  async store(cacheData) {
    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    if (!this.weakCache.has(cacheData.inputSource)) {
      this.weakCache.set(cacheData.inputSource, cacheData);
    }

    const { cacheIdent, source } = cacheData;

    return cacache.put(this.cache, cacheIdent, JSON.stringify(source.source()));
  }
}

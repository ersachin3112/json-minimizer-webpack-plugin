export default class Cache {
  // eslint-disable-next-line no-unused-vars
  constructor(compilation) {
    this.cache = compilation.getCache('JsonMinimizerWebpackPlugin');
  }

  async get(cacheData) {
    // eslint-disable-next-line no-param-reassign
    cacheData.eTag =
      cacheData.eTag || this.cache.getLazyHashedEtag(cacheData.assetSource);

    return this.cache.getPromise(cacheData.assetName, cacheData.eTag);
  }

  async store(cacheData) {
    const { source } = cacheData;

    return this.cache.storePromise(cacheData.assetName, cacheData.eTag, {
      source,
    });
  }
}

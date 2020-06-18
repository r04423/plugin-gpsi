'use strict';

const validUrl = require('valid-url')
const querystring = require('querystring')
const request = require('request')

const getResults = (options, proxy) => {
  return new Promise((resolve, reject) => {
    request({
      url: `${options.apiUrl}?${querystring.stringify(options.qs)}`,
      proxy
    }, (error, response, body) => {
      if (error) {
        return reject(error)
      } else {
        return resolve(JSON.parse(body))
      }
    })
  })
}

const psi = async (options, proxy) => {
  if (!options.key && !options.nokey) {
    const error = new Error('Missing required param: key')
    throw error
  }

  if (!options.url) {
    const error = new Error('Missing required param: url')
    throw error
  }

  if (options.url && !validUrl.isWebUri(options.url)) {
    const error = new Error('Invalid url')
    throw error
  }

  const apiVersion = options.apiversion || 'v5'

  const pagespeedUrl = `https://www.googleapis.com/pagespeedonline/${apiVersion}/runPagespeed`
  const data = await getResults({ apiUrl: pagespeedUrl, qs: options }, proxy)
  return data
}

module.exports = {
  async analyzeUrl(url, log, options, proxy) {
    log.info('Using proxy URL: ' + proxy);
    log.info('Sending url ' + url + ' to test on Page Speed Insights');
    const args = { url };

    if (options.gpsi && options.gpsi.key) {
      args.key = options.gpsi.key;
    } else {
      args.nokey = true;
    }

    args.strategy = 'desktop';

    if (options.mobile) {
      args.strategy = 'mobile';
    }

    args.category = [
      'seo',
      'accessibility',
      'pwa',
      'best-practices',
      'performance'
    ];

    return psi(args, proxy);
  }
};

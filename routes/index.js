var express = require('express')
var router = express.Router()
var request = require('request'),
  cachedRequest = require('cached-request')(request),
  cacheDirectory = '/tmp/cache'

cachedRequest.setCacheDirectory(cacheDirectory)
var _ = require('lodash')

var katieNid = 1108386
var julietNid = 4951256
var elleNid = 4951256
var lisaAndBrianNid = 1637877
var lisa = 1108617
var brian = 1108385
var jackAndLucyNid = 5116371
var allSites = [katieNid, julietNid, elleNid, lisaAndBrianNid, lisa, brian, jackAndLucyNid]
var url = 'http://api.popsugar.com/m/api/v2'
// var limit = 200
var limit = 2
// var postCount = 4000
var postCount = 40


router.get('/', function (req, res, next) {
  // don't have to move these here, but not sure why you have in outer scope...'
  var promises = []
  var page = 0
  var posts = []

  while (page * limit < postCount) {
    promises.push(getPosts(page * limit));
    page = page + 1
  }
  Promise.all(promises).then(function (posts) {
    // posts is an array of arrays.  the next two lines flatten.
    // not sure how you want to handle, so have at it...
    posts = [].concat.apply([], posts);
    posts = [].concat.apply([], posts);
    res.render('index', {
      title: 'Team Sugar',
      posts,
    })
  // putting this error catcher here will catch errors in the preceding then
  }).then(null, e => {
    console.error('an error occurred');
    console.error(e);
  });
})

function getPosts(offset) {
  var qs = {
    offset: offset,
    limit: limit,
    sites: allSites.join(',')
  }
  var options = {
    url: url + '/posts?' + toQueryString(qs),
    ttl: 1000 * 60 * 60 * 24
  }
  // this was your problem.  request wasn't returning
  // a promise.  So this is making a promise.
  return new Promise((resolve, reject) => {
    // just bypass the cache for my testing...
    // cachedRequest(options, function (error, response, body) {
    request(options, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        return reject(msg);
      }
      return resolve(JSON.parse(body));
    })
  })
}

function toQueryString (obj) {
  return _.map(obj, function (v, k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(v)
  }).join('&')
}

function getParameterByName (name, url) {
  if (!url) url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

module.exports = router

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
var limit = 200
var postCount = 4000
var page = 0
var posts = []
var promises = []

router.get('/', function (req, res, next) {
  
  while (page * limit < postCount) {
    promises.push(getPosts(page * limit));
    page = page + 1
    console.log(page)
  }
  Promise.all(promises).then(function (results) {
      console.log(results)
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
  return cachedRequest(options, function (error, response, body) {
    return JSON.parse(body)
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

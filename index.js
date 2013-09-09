var marked = require('marked');
var hljs = require('highlight.js');
var math = require('ascii-math');

var exports = module.exports = supermarked;
supermarked.parse = supermarked;
function supermarked(src, options) {
  options = options || {};
  options.gfm = options.gfm !== false;
  options.highlight = options.highlight || function (code, lang) {
    return hljs.highlightAuto(code).value;
  }
  var result = src;
  if (!options.ignoreMentions) {
    var services = options.services || exports.services;
    result = result.replace(/([^ >]+): *@([A-Za-z0-9_-]+)/, function (_, service, user) {
        service = service.toLowerCase();
        if (services[service]) {
          return '<a href="'
           + services[service].replace(':user:', user)
           + '" class="user-profile user-profile-'
           + service 
           + '">' 
           + user 
           + '</a>';
        } else {
          return _;
        }
      })
      .replace(/ @([A-Za-z0-9_-]+)/, function (_, user) {
        if (services['@']) {
          return ' <a href="'
           + services['@'].replace(':user:', user)
           + '" class="user-profile">' 
           + user 
           + '</a>';
        } else {
          return _;
        }
      });;
  }
  if (!options.ignoreMath) {
    result = src.replace(/\\\$/g, '__DOLLAR_SIGN__').split('$$');
    for (var i = 1; i < result.length; i += 2) { // $$ blocks
      result[i] = math(result[i].trim());
      result[i].setAttribute('class', 'block');
      result[i] = result[i].toString();
    }
    for (var i = 0; i < result.length; i += 2) {
      splt = result[i].split('$');
      for(var j = 1; j < splt.length; j += 2){ // $ blocks
        splt[j] = math(splt[j].trim());
        splt[j].setAttribute('class', 'inline');
        splt[j] = splt[j].toString();
      }
      result[i] = splt.join('');
    }
    result = result.join('').replace(/__DOLLAR_SIGN__/g, '$');
  }
  var tokens = marked.lexer(result, options);
  var result = marked.parser(tokens, options);
  return result;
}

var services = exports.services = {
  'twitter': 'https://twitter.com/:user:',
  'github': 'https://github.com/:user:',
  'npm': 'https://npmjs.org/~:user:',
  'facebook': 'https://www.facebook.com/:user:',
  'wikipedia': 'https://en.wikipedia.org/wiki/:user:',
  'local': '/user/:user:'
};
services['@'] = services.local;//set the default here

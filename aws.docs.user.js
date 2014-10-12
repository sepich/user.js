// ==UserScript==
// @name        AWS Docs Column Reader
// @description Display AWS docs in multiple columns for wide monitors
// @namespace   sepa.spb.ru
// @version     2014.10.12
// @include     http://docs.aws.amazon.com/*
// @include     https://*.docs.aws.amazon.com/*
// @icon        http://media.amazonwebservices.com/favicon.ico
// @grant       GM_getResourceText
// @require     http://code.jquery.com/jquery-latest.min.js
// @author      i@sepa.spb.ru
// ==/UserScript==

//heredoc js wrapper ;)
function hereDoc(f) {
  return f.toString().
      replace(/^[^\/]+\/\*!?/, '').
      replace(/\*\/[^\/]+$/, '');
}

//css
var css = hereDoc(function() {/*!
.d-col {
  -moz-column-count: 3;
  -moz-column-gap: 30px;
  column-count: 3;
  column-gap: 30px;
  text-align: justify;
}
*/}); 

//apply custom CSS
var s = document.createElement('style');
s.type = 'text/css';
s.innerHTML = css;
document.documentElement.appendChild(s);

var n=$('h2.title').closest('div.titlepage');
for(var i=0; i<n.length; i++){
  $(n[i]).after("<div class='d-col'/>");
  $("div.d-col").last().append( $(n[i]).siblings() );
}

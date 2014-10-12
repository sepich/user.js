// ==UserScript==
// @name        AWS Docs Column Reader
// @description Display AWS docs in multiple columns for wide monitors
// @namespace   sepa.spb.ru
// @version     2014.10.12
// @include     http://docs.aws.amazon.com/*
// @include     https://docs.aws.amazon.com/*
// @icon        http://media.amazonwebservices.com/favicon.ico
// @grant       GM_getResourceText
// @updateURL   https://openuserjs.org/install/sepich/aws.docs.user.js
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

.d-col p {
  margin: 3px 0;
  text-indent: 20px;
}
*/}); 

//apply custom CSS
var s = document.createElement('style');
s.type = 'text/css';
s.innerHTML = css;
document.documentElement.appendChild(s);

var d,
    n=$('h1.topictitle, h2.title').closest('div.titlepage');
for(var i=0; i<n.length; i++){
  $(n[i]).after("<div class='d-col'/>");
  d=$("div.d-col").last();
  
  $(n[i]).siblings().each(function(){
         if(this.nodeName=="DIV" && $(this).hasClass('section') && $(this).has('h2').length ) return false; //break
    else if(this.nodeName=="DIV" && $(this).hasClass('d-col'))   return true;  //continue
    else if(this.nodeName=="TABLE" || 
           (this.nodeName=="DIV" && ( $(this).hasClass('mediaobject') || $(this).has('img').length ))           
           ){
      $(this).after("<div class='d-col'/>");
      d=$("div.d-col").last();
    }
    else {
      $(d).append(this);
    }
  }); 
}

// ==UserScript==
// @name        FP
// @description Minor Footprints improvements
// @namespace   sepa.spb.ru
// @version     2014.10.12
// @include     https://footprints.intermedia.net/MRcgi/MRTicketPage.pl*
// @icon        https://footprints.intermedia.net/MRimg/uni.ico
// @grant       unsafeWindow
// @run-at      document-end
// @updateURL   https://openuserjs.org/install/sepich/FP.user.js
// @downloadURL https://openuserjs.org/install/sepich/FP.user.js
// @author      i@sepa.spb.ru
// ==/UserScript==
console.log('started');
var   $,
    	setTimeoutCount = 0,
    	setTimeoutCountMax = 60000,
    	setTimeoutDelay = 500,
    	hereDoc;

// a function that loads jQuery and calls a callback function when jQuery has finished loading
function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "//code.jquery.com/jquery-2.1.0.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "window.jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}

// the guts of this userscript
function main() {
  function hereDoc(f) { return f.toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, ''); }
  var css = hereDoc(function() {/*!
    textarea { resize: both;}
    #esc_notes{
     height: 300px;
     overflow: auto;
     border: 1px solid #AAA;
     width: 90%;
     white-space: pre-line;
    }
    b.esc_user {
     border-top: 1px solid #CCC;
     display: block;
    }
    u { font-family: monospace; text-decoration:none;}
  */});

  jQ('head').append('<style type="text/css" id="tbl-css">');
  jQ('#tbl-css').html(css);    
  jQ('#assgnee').css('height','300px');
  jQ('#pmember').css('height','300px');
    
  //change control editing
  if(jQ('select#Impacted__bServices').length){
    jQ('select#Impacted__bServices').css('height','300px');
    jQ('select#Impacted__bProduction__bUnit').css('height','300px');
  }
  
  //view case
  if(jQ('div#ESC__bNotes textarea').length){
    var id;
    console.log('view case');
    if(jQ('input#Account__bNotes').length){
      var notes=jQ('input#Account__bNotes').val().replace(/\r\n|\n/g,'<br>');
      jQ('div#Account__bNotes').html(notes);
    }  
    jQ('div#HP__bUsername').contents().each(function() {
      if(this.nodeType == 3) {
        jQ(this).after(')');
        if( /^S[EW]H$/.test(jQ('#HP__bProduct').text()) ) jQ(this).after('/<a href="https://hosting.intermedia.net/asp/User/LoginToAccount.asp?accountID='+jQ('#Organization').text()+'" target="_blank">Login</a>');
        if(/al-[0-9]+/.test(jQ(this).text()) ) jQ(this).after('/<a href="https://eiger.accessline.com/atlas/page/enterprise/lf/view/'+jQ(this).text().replace(/^al-/,'')+'" target="_blank">Atlas</a>');
        jQ(this).after(' (<a href="https://hosting.intermedia.net/asp/Administrator/ViewAccounts.asp?Where=Accounts.userName%20LIKE%20%27'+jQ(this).text()+'%25%27" target="_blank">HP</a>');
      }
    });    
    
    var t=jQ('div#ESC__bNotes textarea'),
        esc="\n"+jQ('input#ESC__bNotes').val();       
    esc=esc.replace(/<!--defang_/g,'&lt;');
    esc=esc.replace(/</g,'&lt;');
    esc=esc.replace(/-->/g,'&gt;');
    esc=esc.replace(/>/g,'&gt;');
    esc=esc.replace(/defang_@/g,'@');
    esc=esc.replace(/\n(Entered on [0-9\-]+ at [0-9\:]+ by .*?)\n/mg,"\n<b class='esc_user'>\$1</b>");
    esc=esc.replace(/\r\n|\n/g,'<br>');
    esc=esc.replace(/(http[s]?:\/\/[^ )\n\r"<>]+)/g,'<a href="'+"$1"+'" target="_blank">'+"$1</a>");
    esc=esc.replace(/ (gid:)(\S+) /g,' <a href="http://eiger.accessline.com/sw/SmartWatcher.html?type=gid&gid='+"$2"+'&internal=true" target="_blank">'+"$1</a> <u>$2</u> ");
    t.css('display','none');
    jQ('label#ESC__bNotes_label').css('display','none');
    jQ('div#ESC__bNotes').after('<div id="esc_note">'+esc+'</div>');
  }  
  //or view archive case
  else if(jQ('div#ESC__bNotes input#ESC__bNotes').length){
    console.log('view archive case');
    if(jQ('input#Account__bNotes').length){
      var notes=jQ('input#Account__bNotes').val().replace(/\r\n|\n/g,'<br>');
      jQ('div#Account__bNotes').html(notes);
    }
    jQ('div#HP__bUsername').contents().each(function() {
      if(this.nodeType == 3) {
        jQ(this).after(')');
        if( /^S[EW]H$/.test(jQ('#HP__bProduct').text()) ) jQ(this).after('/<a href="https://hosting.intermedia.net/asp/User/LoginToAccount.asp?accountID='+jQ('#Organization').text()+'" target="_blank">Login</a>');        
        if(/al-[0-9]+/.test(jQ(this).text()) ) jQ(this).after('/<a href="https://eiger.accessline.com/atlas/page/enterprise/lf/view/'+jQ(this).text().replace(/^al-/,'')+'" target="_blank">Atlas</a>');
        jQ(this).after(' (<a href="https://hosting.intermedia.net/asp/Administrator/ViewAccounts.asp?Where=Accounts.userName%20LIKE%20%27'+jQ(this).text()+'%25%27" target="_blank">HP</a>');
      }
    });
    
    var t=jQ('div#ESC__bNotes'),
        esc="\n"+jQ('input#ESC__bNotes').val();       
    esc=esc.replace(/<!--defang_/g,'&lt;');
    esc=esc.replace(/</g,'&lt;');
    esc=esc.replace(/-->/g,'&gt;');
    esc=esc.replace(/>/g,'&gt;');
    esc=esc.replace(/defang_@/g,'@');
    esc=esc.replace(/\n(Entered on [0-9\-]+ at [0-9\:]+ by .*?)\n/mg,"\n<b class='esc_user'>\$1</b>");
    esc=esc.replace(/\r\n|\n/g,'<br>');
    esc=esc.replace(/(http[s]?:\/\/[^ )\n\r"<>]+)/g,'<a href="'+"$1"+'" target="_blank">'+"$1</a>");
    esc=esc.replace(/ (gid:)(\S+) /g,' <a href="http://eiger.accessline.com/sw/SmartWatcher.html?type=gid&gid='+"$2"+'&internal=true" target="_blank">'+"$1</a> <u>$2</u> ");
    t.css('display','none');
    jQ('label#ESC__bNotes_label').css('display','none');
    jQ('div#ESC__bNotes').after('<div id="esc_note">'+esc+'</div>');
  }
  
  //edit case
  if(jQ('#ESC__bNotes_originalData').length){
    console.log('edit case');
    var esc="\n"+jQ('#ESC__bNotes_originalData').val();
    esc=esc.replace(/<!--defang_/g,'&lt;');
    esc=esc.replace(/</g,'&lt;');
    esc=esc.replace(/-->/g,'&gt;');
    esc=esc.replace(/>/g,'&gt;');
    esc=esc.replace(/defang_@/g,'@');
    esc=esc.replace(/\n(Entered on [0-9\-]+ at [0-9\:]+ by .*?)\n/mg,"<b class='esc_user'>\$1</b>");
    esc=esc.replace(/\r\n|\n/g,'<br>');
    esc=esc.replace(/(http[s]?:\/\/[^ )\n\r"<>]+)/g,'<a href="'+"$1"+'" target="_blank">'+"$1</a>");
    esc=esc.replace(/ (gid:)(\S+) /g,' <a href="http://eiger.accessline.com/sw/SmartWatcher.html?type=gid&gid='+"$2"+'&internal=true" target="_blank">'+"$1</a> <u>$2</u> ");
    jQ('textarea#ESC__bNotes').css('width','90%');
    jQ('div#ESC__bNotes_originalDataDiv').parent('div').append('<div id="esc_notes">'+esc+'</div>');
  }
  
  //view GIRR
  if(jQ('#Root__bCause').length){
    console.log('view GIRR');
    var t=jQ('div#Notes textarea'),
        esc="\n"+jQ('input#Notes').val();       
    esc=esc.replace(/<!--defang_/g,'&lt;');
    esc=esc.replace(/</g,'&lt;');
    esc=esc.replace(/-->/g,'&gt;');
    esc=esc.replace(/>/g,'&gt;');
    esc=esc.replace(/defang_@/g,'@');
    esc=esc.replace(/\n(Entered on [0-9\-]+ at [0-9\:]+ by .*?)\n/mg,"\n<b class='esc_user'>\$1</b>");
    esc=esc.replace(/\r\n|\n/g,'<br>');
    esc=esc.replace(/(http[s]?:\/\/[^ )\n\r"<>]+)/g,'<a href="'+"$1"+'" target="_blank">'+"$1</a>");
    esc=esc.replace(/ (gid:)(\S+) /g,' <a href="http://eiger.accessline.com/sw/SmartWatcher.html?type=gid&gid='+"$2"+'&internal=true" target="_blank">'+"$1</a> <u>$2</u> ");
    t.css('display','none');
    jQ('div#Notes').after('<div id="esc_note">'+esc+'</div>');   
  }
}

// load jQuery and execute the main function
addJQuery(main);

// ==UserScript==
// @name        HPforLSA
// @description Minor HostPilot improvements for LSAs
// @namespace   sepa.spb.ru
// @version     2014.10.08
// @include     https://hosting.intermedia.net/asp/Administrator/Tools/LinuxBoxes/Configuration.asp*
// @include     https://hosting.intermedia.net/asp/Administrator/Tools/LinuxBoxes/RunCommand.asp*
// @include     https://hosting.intermedia.net/asp/Administrator/Tools/LinuxBoxes/ConfigurationFileView.asp*
// @include     https://hosting.intermedia.net/asp/Administrator/ViewAccounts.asp*
// @include     https://hosting.intermedia.net/asp/Administrator/Menu.asp
// @include     https://hosting.qaintermedia.net/asp/Administrator/Tools/LinuxBoxes/Configuration.asp*
// @include     https://hosting.qaintermedia.net/asp/Administrator/Tools/LinuxBoxes/RunCommand.asp*
// @include     https://hosting.qaintermedia.net/asp/Administrator/Tools/LinuxBoxes/ConfigurationFileView.asp*
// @include     https://hosting.qaintermedia.net/asp/Administrator/ViewAccounts.asp*
// @include     https://hosting.qaintermedia.net/asp/Administrator/Menu.asp
// @icon        http://www.intermedia.net/apple-touch-icon-57-precomposed.png
// @grant       unsafeWindow
// @run-at      document-start
// @updateURL   https://i.sepa.spb.ru/_/imedia/hplsa.user.js
// @downloadURL https://i.sepa.spb.ru/_/imedia/hplsa.user.js
// @author      i@sepa.spb.ru
// ==/UserScript==
console.log('started');
var     $,
    	setTimeoutCount = 0,
    	setTimeoutCountMax = 6000,
    	setTimeoutDelay = 100,
    	hereDoc;

//heredoc js wrapper ;)
function hereDoc(f) { return f.toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, ''); }

//css
var css = hereDoc(function() {/*!
#editor {border: 1px solid #CCCCCC;}

.srv tr.sel {background: #DFD;}
.srv tr:hover {background: #BFB;}

.ace-tm span.ace_string { color: rgb(170, 85, 0); }
.ace-tm span.ace_invisible { color: #FFF; }
.ace-tm .ace_marker-layer div.ace_selected-word { background: #8F8; border: none; }
div.ace_scrollbar {bottom: 16px !important;}

#resize {
    width: 15px;
    height: 15px;
    position: absolute;
    bottom: 0;
    right: 0;
    background: url("http://i.sepa.spb.ru/_/imedia/resizer.gif") no-repeat;
    cursor: n-resize;
    z-index: 9;
}
*/}); 

console.log(window.location.pathname);
//Run-Command
if(window.location.pathname=='/asp/Administrator/Tools/LinuxBoxes/RunCommand.asp'){
    var init,
        lastChecked = null;
    
    init = function () {
        setTimeoutCount += 1;
        console.log('init-'+setTimeoutCount);

    	$ = unsafeWindow.jQuery;
    	if (typeof($)=='function' && $('#boxesCountSpan').length) {
          $('head').append('<style type="text/css" id="tbl-css">');
          $('#tbl-css').html(css);
          $('form').attr('target','_blank');
          $('#boxesCountSpan').closest('table').addClass('srv');
          $('input[name=command]').css('font-family','monospace');
          $('input[name=command]').css('width','100%');

          $('input[value=Run]').mousedown( function(){
            setTimeout(function(){
                $('input[name=runButton]').removeAttr('disabled');
            }, 5000);
          });

          $('input[id^=checkbox_]').change(function(){ 
              if(this.checked) { $(this).closest('tr').addClass('sel'); }
              else { $(this).closest('tr').removeClass('sel'); }
          });
          var $chkboxes = $('input[id^=checkbox_]');
          $chkboxes.click(function(e){              
                if(!lastChecked) {
                    lastChecked = this;
                    return;
                }          
                if(e.shiftKey) {
                    var start = $chkboxes.index(this);
                    var end = $chkboxes.index(lastChecked);

                    $chkboxes.slice(Math.min(start,end), Math.max(start,end)+ 1).each(function() {
                        if($(this).closest('tr').css('display') != "none") {
                            $(this).attr('checked', lastChecked.checked);
                            $(this).trigger('change');
                        }
                    });

                }

                lastChecked = this;                
          });

          $('input[name=allBoxes]').change(function(){ 
              if(this.checked) { 
                //todo can be faster
                $('input[id^=checkbox_]').trigger('change'); 
              }
              else{ $('.srv tr').removeClass('sel'); } 
          });          
          $('#rolesSelector').change(function(){ 
              $('input[id^=checkbox_]').trigger('change'); 
          });          
          $('input[name=nameFilter]').change(function(){ 
              $('input[id^=checkbox_]').trigger('change'); 
          });         
          
          $('input[id^=checkbox_]').trigger('change');

          setTimeoutCount=setTimeoutCountMax;
        }
        else if (document.readyState == "complete") { setTimeoutCount=setTimeoutCountMax; }
        else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(init, setTimeoutDelay); }
    }
    setTimeout(init, setTimeoutDelay);
}
//Configurator
else if(window.location.pathname=='/asp/Administrator/Tools/LinuxBoxes/Configuration.asp') { 

    var $,
        t,
        lastChecked = null,
    	init, initDiv, initEditor, initTbl, initTbl2;
    
    //wait for jquery and preload Ace
    init = function () {
        setTimeoutCount += 1;
        console.log('init-'+setTimeoutCount);
        
    	// only load editor when there is editing field
    	$ = unsafeWindow.jQuery;
    	if (typeof($)=='function') {
            $('head').append('<script src="//cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/ace.js" type="text/javascript">');
            $('head').append('<script src="https://threedubmedia.googlecode.com/files/jquery.event.drag-2.0.js">');
            $('head').append('<style type="text/css" id="ace-css">');
            $('#ace-css').html(css);
            setTimeout(initDiv, setTimeoutDelay);
    	}
        else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(init, setTimeoutDelay); }	
    }
    
    //wait for textarea and replace it
    initDiv =function(){
        setTimeoutCount += 1;
        console.log('initDiv-'+setTimeoutCount);
        
        t = $('textarea[name=content]');
        if (t.length) {
            t.css('visibility', 'hidden');
            t.css('height', '0px');            
            $('form table')[1].setAttribute('width','100%');
                
            var editDiv = $('<div>', {
                position: 'absolute',
                width: '100%',
                height: '700px',
                id: 'editor'
            }).insertBefore(t);
            
            setTimeout(initEditor, setTimeoutDelay);
        }
        else if (document.readyState == "complete") { setTimeoutCount=setTimeoutCountMax; }
        else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(initDiv, setTimeoutDelay); }	
    }
    
    //wait for Ace load and init it
    initEditor = function () {
        setTimeoutCount += 1;
        console.log('initEd-'+setTimeoutCount);
        
        if(typeof(unsafeWindow.ace)=="object"){
            var editor = unsafeWindow.ace.edit("editor"),
                ed=$("#editor");
            editor.getSession().setValue(t.val());
            editor.getSession().setMode("ace/mode/sh");
            //editor.setTheme("ace/theme/textmate");
            editor.getSession().setTabSize(2);
            editor.getSession().setUseWrapMode(true);
            editor.setShowPrintMargin(true);
            editor.renderer.setShowInvisibles(true); 
    
            var newHeight = editor.getSession().getScreenLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth();
            if(newHeight < 300) newHeight=300;
            if(newHeight > 700) newHeight=700;
            $('#editor').height(newHeight.toString() + "px");
            editor.resize();
            
            $('#editor').append('<div id="resize">');
            $("#resize").attr('draggable','true');
            $("#resize").bind('dragstart', function(event) {
                ed.data("height", ed.height());
                ed.data("y", event.pageY);            
            }).bind("drag", function(event) {                 
                ed.height(Math.max(ed.data("height") - ed.data("y") + event.pageY, 300)+ "px");
            }).bind('dragend', function(event) {
                editor.resize();
            }); 
            
            editor.commands.addCommands([{            
                name: "increaseFontSize",
                bindKey: "Ctrl-=",
                exec: function(editor) {
                    var size = parseInt(editor.getFontSize(), 10) || 12;
                    editor.setFontSize(size + 1);
                }
            }, {
                name: "decreaseFontSize",
                bindKey: "Ctrl+-",
                exec: function(editor) {
                    var size = parseInt(editor.getFontSize(), 10) || 12;
                    editor.setFontSize(Math.max(size - 1 || 1));
                }
            }, {
                name: "save",
                bindKey: {win: "Ctrl-S", mac: "Command-S"},
                exec: function(arg) {
                    var session = editor.session;
                    var name = $('select[name=configFile] :selected').text(); //.match(/[^\/]+$/);
                    localStorage.setItem(
                        "saved_file:" + name,
                        session.getValue()
                    );
                    console.log("saved "+ name);
                } 
            }, {
                name: "load",
                bindKey: {win: "Ctrl-O", mac: "Command-O"},
                exec: function(arg) {
                    var session = editor.session;
                    var name = $('select[name=configFile] :selected').text();//.match(/[^\/]+$/);
                    var value = localStorage.getItem("saved_file:" + name);
                    if (typeof value == "string") {
                        session.setValue(value);
                        console.log("loaded "+ name);
                    } else {
                        console.log("no previuos value saved for "+ name);
                    }
                }              
            }]); 

            $('input[value="Save This Version To DB"]').mousedown(function(){
              t.val(editor.getSession().getValue());            
            });            
            
            setTimeout(initTbl, setTimeoutDelay);
        }
        else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(initEditor, setTimeoutDelay); }	
    }
 
     //wait for Table load and fix it
    initTbl = function () {
        setTimeoutCount += 1;
        console.log('initEd-'+setTimeoutCount);
        
        if ($('#uploadButton').length) {
            $('input[name=uploadCheckAll]').closest('table').addClass('srv');
            $('input[id$=_checkbox]').removeAttr('disabled');
            $('input[id$=_checkbox]').change(function(){ 
                if(this.checked) { $(this).closest('tr').addClass('sel'); }
                else { $(this).closest('tr').removeClass('sel'); }
            });
            
            var $chkboxes = $('input[id$=_checkbox]');
            $chkboxes.click(function(e){              
                if(!lastChecked) {
                    lastChecked = this;
                    return;
                }          
                if(e.shiftKey) {
                    var start = $chkboxes.index(this);
                    var end = $chkboxes.index(lastChecked);

                    $chkboxes.slice(Math.min(start,end), Math.max(start,end)+ 1).each(function() {
                        $(this).attr('checked', lastChecked.checked);
                        $(this).trigger('change');
                    });
                }

                lastChecked = this;                
            });            
            
            
            $('input[name=uploadCheckAll]').change(function(){ 
                if(this.checked) { $('input[id$=_checkbox]').trigger('change'); }
                else{ $('.srv tr').removeClass('sel'); } 
            });            
            
            $('#uploadButton').removeAttr('disabled');
            
            var $ahash = $('table.srv tr a');
            $ahash.attr('href','')
            $ahash.click(function(){
                return false;
            })
            
            setTimeout(initTbl2, setTimeoutDelay);
        }
        else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(initTbl, setTimeoutDelay); }
    }
    
     //wait for Table stops load and fix it
    initTbl2 = function () {
        setTimeoutCount += 1;
        console.log('initEd-'+setTimeoutCount);
        
        if ( $('#countTotal').text() != '?' ) {
            var $ahash = $('table.srv tr a[href=#]');
            $ahash.attr('href','')
            $ahash.click(function(){
                return false;
            })
        }
        else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(initTbl2, setTimeoutDelay); }        
    }
    
    setTimeout(init, setTimeoutDelay);
}
//FileHistory compare or FileContenet view (ReadOnly)
else if(window.location.pathname=='/asp/Administrator/Tools/LinuxBoxes/ConfigurationFileView.asp') {
    var $,
        t,
        lastChecked = null,
    	init, initDiv, initEditor;
    
    //wait for jquery and preload Ace
    init = function () {
        setTimeoutCount += 1;
        console.log('init-'+setTimeoutCount);
        
    	// only load editor when there is editing field
    	$ = unsafeWindow.jQuery;
    	if (typeof($)=='function') {	
            $('head').append('<script src="//cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/ace.js" type="text/javascript">');
            $('head').append('<script src="https://threedubmedia.googlecode.com/files/jquery.event.drag-2.0.js">');
            $('head').append('<style type="text/css" id="ace-css">');
            $('#ace-css').html(css);
            setTimeout(initDiv, setTimeoutDelay);
    	}
        else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(init, setTimeoutDelay); }	
    }
    
    //wait for textarea and replace it
    initDiv =function(){
        setTimeoutCount += 1;
        console.log('initDiv-'+setTimeoutCount);
        
        t = $('textarea[name=content]');
        if (t.length) {
            t.css('visibility', 'hidden');
            t.css('height', '0px');            
                
            var editDiv = $('<div>', {
                position: 'absolute',
                width: '100%',
                height: '620px',
                id: 'editor'
            }).insertBefore(t);
            
            setTimeout(initEditor, setTimeoutDelay);
        }
        else if (document.readyState == "complete") { setTimeoutCount=setTimeoutCountMax; }
        else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(initDiv, setTimeoutDelay); }	
    }
    
    //wait for Ace load and init it
    initEditor = function () {
        setTimeoutCount += 1;
        console.log('initEd-'+setTimeoutCount);
        
        if(typeof(unsafeWindow.ace)=="object"){
            var editor = unsafeWindow.ace.edit("editor"),
                ed=$("#editor");
            editor.getSession().setValue(t.val());
            editor.getSession().setTabSize(2);
            editor.renderer.setShowInvisibles(true);
            editor.setReadOnly(true);
            if ( $('input[value=change]').length > 0) {
                if ( $('input[name^=diff]').val().indexOf("y") > -1 ){
                    editor.getSession().setTabSize(8);
                    editor.getSession().setMode("ace/mode/sh");
                }
                else {
                    editor.getSession().setMode("ace/mode/diff");
                    editor.getSession().setUseWrapMode(false);
                    editor.renderer.setShowGutter(false);
                    editor.setTheme("ace/theme/clouds");
                    editor.setShowPrintMargin(false);
                }
            }            
            else {            
                editor.getSession().setMode("ace/mode/sh");
                editor.getSession().setUseWrapMode(true);
                editor.setShowPrintMargin(true);
            }
            
            $('#editor').append('<div id="resize">');
            $("#resize").attr('draggable','true');
            $("#resize").bind('dragstart', function(event) {
                ed.data("height", ed.height());
                ed.data("y", event.pageY);            
            }).bind("drag", function(event) {                 
                ed.height(Math.max(ed.data("height") - ed.data("y") + event.pageY, 300)+ "px");
            }).bind('dragend', function(event) {
                editor.resize();
            });           
            
            setTimeout(initTbl, setTimeoutDelay);
        }
        else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(initEditor, setTimeoutDelay); }	
    }    
    
    setTimeout(init, setTimeoutDelay);
}
//Search for account
else if(window.location.pathname=='/asp/Administrator/ViewAccounts.asp') {
    var init,
        lastChecked = null;
    
    init = function () {
        setTimeoutCount += 1;
        console.log('init-'+setTimeoutCount);

    	$ = unsafeWindow.jQuery;
    	if (typeof($)=='function' && $("b:contains('Dedicated Exchange')").length) {
          var tr=$("b:contains('Exchange Hosting')").closest('table').find('tr'),
              h=window.location.hostname.replace('hosting','exchange');
            
          if (tr[3].cells.length>1){
              console.log('Adding links');
              for (i=3;i<tr.length-2;i++){
                  tr[i].cells[1].innerHTML="<a href='https://"+h+"/asp/Administrator/ModifyAccount.asp?accountID="+tr[i].cells[0].textContent+"'>"+tr[i].cells[1].textContent+"</a>";
              }
          }
          
          setTimeoutCount=setTimeoutCountMax;
        }
        else if (document.readyState == "complete") { setTimeoutCount=setTimeoutCountMax; }
        else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(init, setTimeoutDelay); }
    }
    setTimeout(init, setTimeoutDelay);    
}
//Ping each 15min for cookie keepalive
else if(window.location.pathname=='/asp/Administrator/Menu.asp') {
  ping = function(){
    if(document.readyState == "complete"){
      $ = unsafeWindow.jQuery;
      $.ajax('/asp/Administrator/Menu.asp');
    }
    setTimeout(ping, 1000*60*15);
  }    
  setTimeout(ping, 1000*60*15);
}

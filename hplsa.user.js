// ==UserScript==
// @name        HPforLSA
// @description Minor HostPilot improvements for LSAs
// @namespace   sepa.spb.ru
// @version     2017.04.08
// @require     https://code.jquery.com/jquery-2.1.1.min.js
// @resource ace    https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/ace.js
// @resource sh     https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/mode-sh.js
// @resource diff   https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/mode-diff.js
// @resource theme  https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/theme-clouds.js
// @resource search https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/ext-searchbox.js
// @include     https://hosting.intermedia.net/asp/Administrator/Tools/LinuxBoxes/Configuration.asp*
// @include     https://hosting.intermedia.net/asp/Administrator/Tools/LinuxBoxes/RunCommand.asp*
// @include     https://hosting.intermedia.net/asp/Administrator/Tools/LinuxBoxes/ConfigurationFileView.asp*
// @include     https://hosting.intermedia.net/asp/Administrator/Tools/DnsServer/DatabaseDomain.asp*
// @include     https://hosting.intermedia.net/asp/Administrator/ViewAccounts.asp*
// @include     https://hosting.intermedia.net/asp/Administrator/Menu.asp
// @include     https://hosting.qaintermedia.net/asp/Administrator/Tools/LinuxBoxes/Configuration.asp*
// @include     https://hosting.qaintermedia.net/asp/Administrator/Tools/LinuxBoxes/RunCommand.asp*
// @include     https://hosting.qaintermedia.net/asp/Administrator/Tools/LinuxBoxes/ConfigurationFileView.asp*
// @include     https://hosting.qaintermedia.net/asp/Administrator/Tools/DnsServer/DatabaseDomain.asp*
// @include     https://hosting.qaintermedia.net/asp/Administrator/ViewAccounts.asp*
// @include     https://hosting.qaintermedia.net/asp/Administrator/Menu.asp
// @icon        http://intermedia.net/assets/tracked/img/favicon.ico
// @run-at      document-start
// @grant       GM_getResourceText
// @updateURL   https://openuserjs.org/install/sepich/HPforLSA.user.js
// @downloadURL https://openuserjs.org/install/sepich/HPforLSA.user.js
// @author      i@sepa.spb.ru
// ==/UserScript==
console.log('started');
var $ = jQuery,
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
input.sm {padding: 3px !important; margin-right: 0; border-right: 1px solid #ccc;}

#resize {
  width: 15px;
  height: 15px;
  position: absolute;
  bottom: 0;
  right: 0;
  background: url("https://i.sepa.spb.ru/_/imedia/resizer.gif") no-repeat;
  cursor: n-resize;
  z-index: 9;
}
*/});

//use cached ace edit
function insertCached(m){
  var res = ['ace', 'sh', 'search'],
      s;
  //addons for diff display
  if(m == 'diff') {
    res.push('diff');
    res.push('theme');
  }
  //injecting resourses to page
  console.log('inject: '+res);
  for (var i in res) {
    s = document.createElement("script");
    s.textContent = GM_getResourceText(res[i]);
    document.head.appendChild(s);
  }
}

console.log(window.location.pathname);
//Run-Command
if(window.location.pathname=='/asp/Administrator/Tools/LinuxBoxes/RunCommand.asp'){
  var init,
      lastChecked = null;

  init = function () {
    setTimeoutCount += 1;
    console.log('init-'+setTimeoutCount);

    if ($('#boxesCountSpan').length) {
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
              this.checked=lastChecked.checked;
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
  var t,
      ed,
      lastChecked = null,
      init, initDiv, initEditor, initTbl, initTbl2;

  //wait for jquery and preload Ace
  init = function () {
      setTimeoutCount += 1;
      console.log('init-'+setTimeoutCount);

    // only load editor when there is editing field
    if (typeof($)=='function') {
      insertCached();
      $('head').append('<style type="text/css" id="ace-css">');
      $('#ace-css').html(css);
      setTimeout(initDiv, setTimeoutDelay);
    }
    else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(init, setTimeoutDelay); }
  }

  //wait for boxType select and sort it
  $('select[name=boxType]').ready(function() {
    console.log('sort boxType')
    var t = $('select[name=boxType]'),
        selected = $(t).val(); /* preserving original selection, step 1 */
    $(t).append(
      $(t).find("option").remove().sort(function(a, b) {
        var at = $(a).text().toLowerCase(),
            bt = $(b).text().toLowerCase();
        return (at == '[linux]' || at < bt)? -1 : ((at > bt )?1:0);
      })
    );
    $(t).val(selected); /* preserving original selection, step 2 */
  });

  //wait for textarea and replace it
  initDiv =function(){
    setTimeoutCount += 1;
    console.log('initDiv-'+setTimeoutCount);

    t = $('textarea[name=content]');
    if (t.length) {
      t.css('visibility', 'hidden');
      t.css('height', '0px');
      $('form table')[1].setAttribute('width','100%');

      $('<div>', {
          position: 'absolute',
          width: '100%',
          height: '700px',
          id: 'editor'
      }).insertBefore(t);

      //add buttons for next/prev  files and reload
      var cf=$("select[name=configFile]"),
          i=cf.children().index(cf.children().filter(":selected"));
      if(i>2) {
        cf.before('<input type="button" class="sm" id="prev" value="&lt;" title="Go to previous file">');
        $("#prev").click(function() {
          cf.val(cf.children().eq(i-1).val());
          cf.trigger("change");
        });
      }
      if(i<cf.children().length-1) {
        cf.after('<input type="button" class="sm" id="next" value="&gt;" title="Go to next file">');
        $("#next").click(function() {
          cf.val(cf.children().eq(i+1).val());
          cf.trigger("change");
        });
      }

      $('select[name=version]').after('<input type="button" class="sm" id="reload" value="&#8634" title="Reload status of selected file">');
      $("#reload").click(function() {
        cf.trigger("change");
      });

      //add copy button
      cf.parent('td').children().last().after('<input type="button" class="sm" id="copy" value="&#0169" title="Copy filename to buffer">');
      $('#copy').click(function() {
        var fileName = $('select[name=configFile] option:selected').text();
        window.prompt("Copy to clipboard: Ctrl+C, Enter", fileName);
      });

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
      unsafeWindow.ace.config.set("basePath", "https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/");
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
      $("#resize").mousedown(function(e){
        e.preventDefault();
        ed.data("height", ed.height());
        ed.data("y", e.pageY);
        $(document).mousemove(function(e){
          ed.height(Math.max(ed.data("height") - ed.data("y") + e.pageY, 300)+ "px");
       })
      });
      $(document).mouseup(function(e){
        if(ed.data("height")){
          ed.data("height", 0);
          $(document).unbind('mousemove');
          editor.resize();
        }
      });

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
    console.log('initTbl-'+setTimeoutCount);

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
            this.checked=lastChecked.checked;
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
    console.log('initTbl2-'+setTimeoutCount);

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
    var t,
        lastChecked = null,
        init, initDiv, initEditor;

    //wait for jquery and preload Ace
    init = function () {
      setTimeoutCount += 1;
      console.log('init-'+setTimeoutCount);

      // only load editor when there is editing field
      if (typeof($)=='function') {
        $('head').append('<style type="text/css" id="ace-css">');
        insertCached('diff');
        $('#ace-css').html(css);
        setTimeout(initDiv, setTimeoutDelay);
      }
      else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(init, setTimeoutDelay); }
    }

    //wait for textarea and replace it
    initDiv =function(){
      setTimeoutCount += 1;
      console.log('initDiv-'+setTimeoutCount);

      //change Configuration File View to add boxname
      var boxName=/box=([^&]+)/.exec(location)[1],
          configFile=/configFile=([^&]+)/.exec(location)[1].replace(/%2F/g, '/'),
          boxType=/boxType=([^&]+)/.exec(location)[1],
          version=location.href.match('version=([^&]+)');
          version=version ? "v"+version[1]+" &lt;&gt; " : version='';
      $('.header:first').html(unescape(boxType) + ":" + configFile + ' ' + version + "file on "+boxName);

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
        unsafeWindow.ace.config.set("basePath", "https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/");
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
        $("#resize").mousedown(function(e){
          e.preventDefault();
          ed.data("height", ed.height());
          ed.data("y", e.pageY);
          $(document).mousemove(function(e){
            ed.height(Math.max(ed.data("height") - ed.data("y") + e.pageY, 300)+ "px");
         })
        });
        $(document).mouseup(function(e){
          if(ed.data("height")){
            ed.data("height", 0);
            $(document).unbind('mousemove');
            editor.resize();
          }
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
//DNS Manager
else if (window.location.pathname == '/asp/Administrator/Tools/DnsServer/DatabaseDomain.asp') {
  var lastChecked=null,
  init=function(){
    setTimeoutCount += 1;
    console.log('init-' + setTimeoutCount);
    // only edit buttons when they all are loaded
    if ($('input[value="Reload domain on dnscache servers"]').length) {
      $('head').append('<style type="text/css" id="tbl-css">');
      $('#tbl-css').html(css);
      $('form[name=EditRecordsForm] table').addClass('srv');

      //add checkboxes
      $('form[name=EditRecordsForm] table tr').each(function(){
        var btn = $(this).find('input[value=Delete]');
        if($(btn).length){
          var id=$(btn).attr('onclick').match(/recordToDelete.value="(\d*)"/)[1];
          $(this).children().first().prepend(
            $('<input type="checkbox">').data('id',id).addClass('massDelete').change(function(){
              if(this.checked) $(this).closest('tr').addClass('sel');
              else $(this).closest('tr').removeClass('sel');
              var num=$('.sel').length;
              if(num) $('#delSelected').attr("disabled", false).val("Delete Selected ("+num+")");
              else $('#delSelected').attr("disabled", true).val("Delete Selected");
            })
          )
        }
      })
      //shift-click for checkboxes
      var $chkboxes = $('input.massDelete');
      $chkboxes.click(function(e){
        if(e.shiftKey && lastChecked){
          var start = $chkboxes.index(this);
          var end = $chkboxes.index(lastChecked);

          $chkboxes.slice(Math.min(start,end), Math.max(start,end)+ 1).each(function() {
            if($(this).closest('tr').css('display') != "none") {
              this.checked=lastChecked.checked;
              $(this).trigger('change');
            }
          });
        }
        lastChecked = this;
      })

      //add Delete button
      $('form[name=EditRecordsForm] table').find('td').last().append(
        $('<input type="button" id="delSelected">').val("Delete Selected").attr("disabled",true).click(function(){
          var data=$('form[name=EditRecordsForm]').serializeArray().reduce(function(obj, item) {
                obj[item.name] = item.value;
                return obj;
            }, {});
          data['action']='deleteRecord';
          $('#delSelected').attr("disabled", true);

          $('.massDelete:checked').each(function(){
            var id=$(this).data('id'),
                tr=$(this).closest('tr');

            data['recordToDelete']=id;
            $.ajax({
              type: 'POST',
              url: $('form[name=EditRecordsForm]').attr('action'),
              data: data,
              success: function(data){
                $(tr).remove();
                var num=$('.sel').length;
                if(num) $('#delSelected').val("Deleting Selected ("+num+")...");
                else window.location=window.location; //reload page after mass deletion
              },
              error: function(xhr, status, err){ console.log(status+err); }
            })

          })
        })
      )

      //filter records
      $('form[name=EditRecordsForm] table').find('td').first().html(
        $('<input type="text" style="width:100%;">').on('change keyup', function () {
          var filter=$(this).val().toLowerCase();
              trs=$('form[name=EditRecordsForm] table tr');

          $(trs).each(function(i,tr){
            if(i==0 || i>$(trs).length-5) return true; //skip headers/footers
            if(filter==='' || $(tr).children('td').first().text().toLowerCase().includes(filter) ) $(tr).show();
            else $(tr).hide();
          })
        })
      );

      setTimeoutCount=setTimeoutCountMax;
    }
    else if (document.readyState == "complete") { setTimeoutCount=setTimeoutCountMax; }
    else if (setTimeoutCount < setTimeoutCountMax) { setTimeout(init, setTimeoutDelay); }
  }
  setTimeout(init, setTimeoutDelay);
}
//Ping each 5min for cookie keepalive
else if(window.location.pathname=='/asp/Administrator/Menu.asp') {
  ping = function(){
    if(document.readyState == "complete"){
      $.ajax('https://hosting.intermedia.net/asp/Administrator/LookupAccounts.asp');
      $.ajax('https://exchange.intermedia.net/asp/Administrator/LookupAccounts.asp');
    }
  }
  setInterval(ping, 1000*60*5);
}

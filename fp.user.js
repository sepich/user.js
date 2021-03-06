// ==UserScript==
// @name        FP
// @description Minor Footprints improvements
// @namespace   sepa.spb.ru
// @version     2016.03.25
// @include     https://footprints.intermedia.net/MRcgi/MRTicketPage.pl*
// @icon        https://footprints.intermedia.net/MRimg/uni.ico
// @require     https://code.jquery.com/jquery-2.1.1.min.js
// @grant       unsafeWindow
// @run-at      document-end
// @updateURL   https://openuserjs.org/install/sepich/FP.user.js
// @downloadURL https://openuserjs.org/install/sepich/FP.user.js
// @author      i@sepa.spb.ru
// ==/UserScript==
console.log('started');
this.$ = this.jQuery = jQuery.noConflict(true);
var jQ = this.$,
    setTimeoutCount = 0,
    setTimeoutCountMax = 60000,
    setTimeoutDelay = 500,
    hereDoc;

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
   cursor: pointer;
  }
  b.esc_user::before {
    background: rgba(0, 0, 0, 0) url("/MRimg/minus.gif") no-repeat;
    content: "";
    display: block;
    float: left;
    height: 20px;
    width: 16px;
    margin: 3px 0 0;
  }
  b.esc_user.collapsed::before {
    background: rgba(0, 0, 0, 0) url("/MRimg/plus.gif") no-repeat;
    content: "";
    display: block;
    float: left;
    height: 20px;
    width: 16px;
    margin: 3px 0 0;
  }
  div.collapsed {
    max-height: 203px;
    overflow: auto;
    background: rgba(0, 0, 0, 0) linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%) repeat scroll 0 0;
  }
  div.descShowAll div.descriptionTimestamp {border-top: 1px solid #CCC;}
  u { font-family: monospace; text-decoration:none;}
  label#Root__bCause_label {margin-top: 20px;}
  .ctlbut {
    padding: 3px 4px;
    color: #006699;
  }
  .ctlbut:hover {
    border: 2px outset threedhighlight;
    padding: 1px 2px;
    color: #006699;
  }

*/});

//htmlizer for plain text in escalation notes
function escnotes(txt){
  txt=txt.replace(/<!--defang_/g,'&lt;');
  txt=txt.replace(/</g,'&lt;');
  txt=txt.replace(/-->/g,'&gt;');
  txt=txt.replace(/>/g,'&gt;');
  txt=txt.replace(/defang_@/g,'@');
  txt='<div>'+txt.replace(/\n(Entered on [0-9\-]+ at [0-9\:]+ by .*?)\n/mg,"</div>\n<b class='esc_user'>\$1</b><div class='collapsible'>");
  txt=txt.replace(/\r\n|\n/g,'<br>');
  txt=txt.replace(/(http[s]?:\/\/[^ )\n\r"<>]+)/g,'<a href="'+"$1"+'" target="_blank">'+"$1</a>");
  txt=txt.replace(/ (gid:)(\S+) /g,' <a href="http://eiger.accessline.com/sw/SmartWatcher.html?type=gid&gid='+"$2"+'&internal=true" target="_blank">'+"$1</a> <u>$2</u> ");
  return txt+'</div>';
}

//general css preparations
jQ('head').append('<style type="text/css" id="tbl-css">');
jQ('#tbl-css').html(css);
jQ('#assgnee').css('height','300px');
jQ('#pmember').css('height','300px');

//change control editing
if(jQ('select#Impacted__bServices').length){
  console.log('edit change control');
  jQ('select#Impacted__bServices').css('height','300px');
  jQ('select#Impacted__bProduction__bUnit').css('height','300px');
  jQ('#DATE_S_DayInput_Maintenance__bDate_S_Day').attr('onchange','');
  jQ('#DATE_S_DayInput_Maintenance__bDate_S_Day').change(function(){
    SetImpDate();
  });
  jQ('#Maintenance__bWindow').change(function(){
    SetImpDate();
  });
  //set implementation date based on Maintenance Date and MW
  function SetImpDate(){
    var month=jQ('#DATE_S_MonthInput_Maintenance__bDate_S_Month').val(),
        day=jQ('#DATE_S_DayInput_Maintenance__bDate_S_Day').val(),
        year=jQ('#DATE_S_YearInput_Maintenance__bDate_S_Year').val(),
        beginning=jQ('#Maintenance__bWindow option:selected').text().match(/[0-9]*[ap]m/g)[0].replace(/([0-9]*)([ap]m)/,"$1:00 $2").toUpperCase(),
        end=jQ('#Maintenance__bWindow option:selected').text().match(/[0-9]*[ap]m/g)[1].replace(/([0-9]*)([ap]m)/,"$1:00 $2").toUpperCase();
        shift= (beginning.match(/PM/)&&end.match(/AM/)) ? 1 : 0;

    if (month&&day&&year) { //if dates are not set, we should not use them
      var to = new Date(year, (month-1), day); //month -1, because in JS monthes start from 0, and in FP - from 1
      to.setDate(to.getDate()+shift); //calculate month overlap
      if (jQ("#Maintenance__bDate table th:first").text()=='Mon') {
        jQ("input[name='Implementation__bStart__bTime_datetime']" ).val(month+'/'+day+'/'+year+' '+beginning);
        jQ("input[name='Implementation__bEnd__bTime_datetime']" ).val((to.getMonth()+1)+'/'+to.getDate()+'/'+to.getFullYear()+' '+end);
      }
      else{
        jQ("input[name='Implementation__bStart__bTime_datetime']" ).val(day+'/'+month+'/'+year+' '+beginning);
        jQ("input[name='Implementation__bEnd__bTime_datetime']" ).val(to.getDate()+'/'+(to.getMonth()+1)+'/'+to.getFullYear()+' '+end);
      }
    }
  };
  //check for field change by js
  var interval;
  function chckPop(){
    var e=jQ('#DATE_S_DayInput_Maintenance__bDate_S_Day'),
        lastVal = e.data('last-value');
    if (lastVal !== e.val()) {
      e.change();
      clearInterval(interval);
    }
  }
  jQ('a[title=Calendar]').click(function(){
    var e=jQ('#DATE_S_DayInput_Maintenance__bDate_S_Day');
    e.data('last-value', e.val());
    interval=setInterval(chckPop, 100);
  });
}

//change control view
if(jQ('div#Technical__bInformation').length){
  console.log('view change control');
}

//view case
else if(/^Case.*Intermedia Support$/.test(document.title)){
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
      if( /^SWH$/.test(jQ('#HP__bProduct').text()) ) jQ(this).after('/<a href="https://hosting.intermedia.net/asp/Administrator/ModifyAccount.asp?accountID='+jQ('#Organization').text()+'" target="_blank">Modify</a>');
      if( /^SEH$/.test(jQ('#HP__bProduct').text()) ) jQ(this).after('/<a href="https://exchange.intermedia.net/asp/Administrator/ModifyAccount.asp?accountID='+jQ('#Organization').text()+'" target="_blank">Modify</a>');
      jQ(this).after(' (<a href="https://hosting.intermedia.net/asp/Administrator/ViewAccounts.asp?Where=Accounts.userName%20LIKE%20%27'+jQ(this).text()+'%25%27" target="_blank">HP</a>');
    }
  });

  var t=jQ('div#ESC__bNotes textarea'),
      esc="\n"+jQ('input#ESC__bNotes').val();
  esc=escnotes(esc);
  t.css('display','none');
  jQ('label#ESC__bNotes_label').css('display','none');
  jQ('div#ESC__bNotes').after('<div id="esc_note">'+esc+'</div>');
  jQ('div#reportButton').closest('table').parent().after('<td><a class="ctlbut" href="#Description_ecHeading">Description</a></td>');
  jQ('b.esc_user').click(function(){
    if(jQ(this).next().height() > 200) jQ(this).toggleClass('collapsed').next().toggleClass('collapsed');
  });
  jQ('b.esc_user').each(function() {
    if(jQ(this).next().height() > 600) jQ(this).addClass('collapsed').next().addClass('collapsed');
  });
}

//edit case
else if(jQ('#ESC__bNotes_originalData').length){
  console.log('edit case');
  var esc="\n"+jQ('#ESC__bNotes_originalData').val();
  esc=escnotes(esc);
  jQ('textarea#ESC__bNotes').css('width','90%');
  jQ('div#ESC__bNotes_originalDataDiv').parent('div').append('<div id="esc_notes">'+esc+'</div>');
  jQ('div#ESC__bNotes_originalDataDiv').css('display','none');
  jQ('b.esc_user').click(function(){
    if(jQ(this).next().height() > 200) jQ(this).toggleClass('collapsed').next().toggleClass('collapsed');
  });
  jQ('b.esc_user').each(function() {
    if(jQ(this).next().height() > 600) jQ(this).addClass('collapsed').next().addClass('collapsed');
  });
}

//view GIRR
else if(jQ('#Root__bCause').length || jQ('div#Notes textarea').length){
  console.log('view GIRR');
  //notes
  var t=jQ('div#Notes textarea'),
      esc="\n"+jQ('input#Notes').val();
  esc=escnotes(esc);
  t.css('display','none');
  jQ('div#Notes').after('<div id="esc_note">'+esc+'</div>');
  //rootcause
  t=jQ('div#Root__bCause textarea');
  esc="\n"+jQ('input#Root__bCause').val();
  esc=escnotes(esc);
  t.css('display','none');
  jQ('div#Root__bCause').after('<div id="esc_root">'+esc+'</div>');
}

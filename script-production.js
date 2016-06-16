const BACKSPACE_CHAR = 8;
const COLON_CHAR = 58;
const SPACE_CHAR = 32;
const ESCAPE_CHAR = 27;

const TEXTAREA = "#gene_list";
const MENU = "#primary";
const HELPER_MENU = "#helper";

var disabled = false; // OQL Helper disabled or not

// DEBUGGING ONLY/ Adapted from stackoverflow user "Eric Muyser"
function censor(censor) {
  var i = 0;
  return function(key, value) {
    if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) 
      return '[Circular]'; 
    if(i >= 29)
      return '[Unknown]';
    ++i;
    return value;  
  }
}

// Adapted from https://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area#answer-499158
function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}

function setCaretToPos (input, pos) {
  setSelectionRange(input, pos, pos);
}

function getCursorIndex(){
  return $(TEXTAREA).prop("selectionStart");
}

function getLineHeight(el){
  var fontSize = $(el).css('font-size');
  var lineHeight = Math.floor(parseInt(fontSize.replace('px','')) * 1.5);
  return lineHeight
}

// Return textarea text embedded with keyword val
function getTextToAdd(val){
  var pos = getCursorIndex();
  var text = $(TEXTAREA).val();
  return text.substring(0, pos) + val + text.substring(pos, text.length);
}

// Get absolute position of caret in textarea
function getCaretPosition(){
  var caretPos =  $(TEXTAREA).textareaHelper('caretPos');
  var elemPos = $(TEXTAREA).offset();
  caretPos.top += elemPos.top;
  caretPos.top += getLineHeight(TEXTAREA);
  caretPos.left += elemPos.left;
  return caretPos;
}
 
// Show a menu at caret position in textarea
function showMenu(selector){
  $(selector).css(getCaretPosition());
  $(selector).css("display", "inline-block");
}

function removeMenu(selector){
  $(selector).css("display", "none");
}

function addText(text){
  var caretPos = getCursorIndex() + 1 + text.length;
  $(TEXTAREA).val(getTextToAdd(" " + text));
  //if (text.slice(-1) == "x")
  //  $(TEXTAREA)[0].setSelectionRange(caretPos-1, caretPos);
  //else 
    $(TEXTAREA)[0].setSelectionRange(caretPos, caretPos);
}

function generateList() {

  // 1st level of menu 
  var items = [
    {id:"1", val:"", name: "CNA", desc:"Copy Number Alterations"},
    {id:"2", val:"", name: "MUT", desc:"Mutations"},
    {id:"3", val:"", name: "EXP", desc:"mRNA Expression"},
    {id:"4", val:"", name: "PROT", desc:"Protein/phosphoprotein level (RPPA)"}
  ]

  // 2nd level of CNA
  items[0].items = CNA_items = [
    {id:"11", val:"CNA", name: "Default", desc:"AMP and HOMDEL"},
    {id:"12", val:"AMP", name: "AMP", desc:"Amplified"},
    {id:"13", val:"HOMDEL", name: "HOMDEL", desc:"Deep Deletion"},
    {id:"14", val:"GAIN", name: "GAIN", desc:"Gained"},
    {id:"15", val:"HETLOSS", name: "HETLOSS", desc:"Shallow Deletion"}
  ]

  // 2nd level of MUT
  items[1].items = MUT_items = [
    {id:"21", val:"MUT", name: "Default", desc:"All somatic nonsyn. mutations"},
    {id:"22", val:"", name: "Type", desc:""},
    {id:"23", val:"", name: "Specific", desc:""}
  ] 

  // 2nd level of EXP
  items[2].items = EXP_items = [
    {id:"31", val:"EXP", name: "Default", desc:"At least 2 SD from mean"},
    {id:"32", val:"EXP < -x", name: "< -x", desc:"Less than x SD below mean"},
    {id:"33", val:"EXP <= -x", name: "<= -x", desc:"Less than or equal to x SD below mean"},
    {id:"34", val:"EXP > x", name: "> x", desc:"More than x SD above mean"},
    {id:"35", val:"EXP >= x", name: ">= x", desc:"More than or equal to x SD above mean"}
  ]

  // 2nd level of PROT
  items[3].items = PROT_items = [
    {id:"41", val:"PROT", name: "Default", desc:"At least 2 SD from mean"},
    {id:"42", val:"PROT < -x", name: "< -x", desc:"Less than x SD below mean"},
    {id:"43", val:"PROT <= -x", name: "<= -x", desc:"Less than or equal to x SD below mean"},
    {id:"44", val:"PROT > x", name: "> x", desc:"More than x SD above mean"},
    {id:"45", val:"PROT >= x", name: ">= x", desc:"More than or equal to x SD above mean"}
  ]
    

  // 3rd level MUT>Type
  items[1].items[1].items = [
    {id:"221", val:'MUT = MISSENSE', name: "MISSENSE", desc:""},
    {id:"222", val:"MUT = NONSENSE", name: "NONSENSE", desc:""},
    {id:"223", val:"MUT = NONSTART", name: "NONSTART", desc:""},
    {id:"224", val:"MUT = NONSTOP", name: "NONSTOP", desc:""},
    {id:"225", val:"MUT = FRAMESHIFT", name: "FRAMESHIFT", desc:""},
    {id:"226", val:"MUT = INFRAME", name: "INFRAME", desc:""},
    {id:"227", val:"MUT = SPLIC", name: "SPLIC", desc:""},
    {id:"228", val:"MUT = TRUNC", name: "TRUNC", desc:""}
  ]
  
  console.log(JSON.stringify(items[1].items[1].items))

  //TODO
  // 3rd level MUT>Specific 
  items[1].items[2] = []

  
  var main = Handlebars.compile($("#oql-menu-placeholder").html());
  Handlebars.registerPartial("oql-menu", $("#oql-menu").html());
  $("#placeholder").html(main({items: items}));
  
}

$(document).ready(function(){

  generateList();

  // Enter chosen text into textarea
  $(MENU).menu({
    select: function(event, ui){
      if (ui.item.attr("data-val") !== ""){
        addText(ui.item.attr("data-val"));
      }
    }
  });

  // Show menu after typing ':'
  $(TEXTAREA).on("keypress", function(event){
    // Check for disable checkbox
    if ( $("#disable-helper").is(":checked"))
      return;
    
    if(event.keyCode == COLON_CHAR){
      showMenu(MENU);
    }
  });
    
  // Remove menu on backspace/space/escape
  $(TEXTAREA).on("keyup", function (event){
    if (event.keyCode == BACKSPACE_CHAR || event.keyCode == SPACE_CHAR || event.keyCode == ESCAPE_CHAR){
      $(".hidden-menu").css("display", "none");
    }
  });
  
  // Remove menu when out of focus
  $(TEXTAREA).focusout(function () {
    $(".hidden-menu").css("display", "none");
  });
  
  // Remove/Disable menu when disabled is checked
  $("#disable-helper").change(function() {
    if ($(this).is(":checked")){
      $(".hidden-menu").css("display", "none");
      $("#oql-instruct").css("display", "none");
    }
    else{
      $(".hidden-menu").css("display", "none");
      $("#oql-instruct").css("display", "inline");
    }
  });

});

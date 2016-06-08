
const BACKSPACE_CHAR = 8;
const COLON_CHAR = 58;
const SPACE_CHAR = 32;

const TEXTAREA = "textarea";
const MENU = "#primary";
const HELPER_MENU = "#helper";

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

// Get position of caret in textarea
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


$(document).ready(function(){

  // Enter chosen text into textarea
  $(MENU).menu({
    select: function(event, ui){
      if (ui.item.attr("data-id") > 10){
        console.log(ui.item.attr("data-val"));
        $(TEXTAREA).val(getTextToAdd(" " + ui.item.attr("data-val")));
        removeMenu(MENU);
        showMenu(HELPER_MENU);
      }
    }
  });
  
  $(HELPER_MENU).menu({
    select: function(event, ui){
      console.log(ui.item.attr("data-id"));
      switch(ui.item.attr("data-id")){
        case "1":
          console.log("here");
          removeMenu(HELPER_MENU);
          showMenu(MENU);
          break;
        case "2":
          $(TEXTAREA).val(getTextToAdd(";"));
          removeMenu(HELPER_MENU);
          break;
      }
    }
  
  });
    

  // Show menu after typing ':'
  $(TEXTAREA).on("keypress", function(event){
    if(event.keyCode == COLON_CHAR){
      showMenu(MENU);
    }
  });
    
  // Remove menu on backspace or space  
  $(TEXTAREA).on("keyup", function (event){
    if (event.keyCode == BACKSPACE_CHAR || event.keyCode == SPACE_CHAR){
      $(MENU).css("display", "none");
    }
  });
    
});

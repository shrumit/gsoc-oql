const BACKSPACE_CHAR = 8;
const COLON_CHAR = 58;
const SPACE_CHAR = 32;
const ESCAPE_CHAR = 27;
const LINE_FEED = "&#10;";

const TEXTAREA = "textarea";
const MENU = "#primary";
const HELPER_MENU = "#helper";

var disabled = false; // OQL Helper disabled flag

function generateList() {
  // 1st level of menu
  var items = [
    {val:"", name: "CNA", desc:"Copy Number Alterations"},
    {val:"", name: "MUT", desc:"Mutations"},
    {val:"", name: "EXP", desc:"mRNA Expression"},
    {val:"", name: "PROT", desc:"Protein/phosphoprotein level (RPPA)"}
  ]

  // 2nd level of CNA
  items[0].items = CNA_items = [
    {val:"CNA", name: "Default", desc:"AMP and HOMDEL"},
    {val:"AMP", name: "AMP", desc:"Amplified"},
    {val:"HOMDEL", name: "HOMDEL", desc:"Deep Deletion"},
    {val:"GAIN", name: "GAIN", desc:"Gained"},
    {val:"HETLOSS", name: "HETLOSS", desc:"Shallow Deletion"}
  ]

  // 2nd level of MUT
  items[1].items = MUT_items = [
    {val:"MUT", name: "Default", desc:"All somatic nonsyn. mutations"},
    {val:"", name: "Type", desc:""},
    {val:"", name: "Specific", desc:""}
  ]

  // 2nd level of EXP
  items[2].items = EXP_items = [
    {val:"EXP", name: "Default", desc:"At least 2 SD from mean"},
    {val:"EXP < -x", name: "< -x", desc:"Less than x SD below mean"},
    {val:"EXP <= -x", name: "<= -x", desc:"Less than or equal to x SD below mean"},
    {val:"EXP > x", name: "> x", desc:"More than x SD above mean"},
    {val:"EXP >= x", name: ">= x", desc:"More than or equal to x SD above mean"}
  ]

  // 2nd level of PROT
  items[3].items = PROT_items = [
    {val:"PROT", name: "Default", desc:"At least 2 SD from mean"},
    {val:"PROT < -x", name: "< -x", desc:"Less than x SD below mean"},
    {val:"PROT <= -x", name: "<= -x", desc:"Less than or equal to x SD below mean"},
    {val:"PROT > x", name: "> x", desc:"More than x SD above mean"},
    {val:"PROT >= x", name: ">= x", desc:"More than or equal to x SD above mean"}
  ]


  // 3rd level MUT>Type
  items[1].items[1].items = [
    {val:'MUT = MISSENSE', name: "MISSENSE", desc:""},
    {val:"MUT = NONSENSE", name: "NONSENSE", desc:""},
    {val:"MUT = NONSTART", name: "NONSTART", desc:""},
    {val:"MUT = NONSTOP", name: "NONSTOP", desc:""},
    {val:"MUT = FRAMESHIFT", name: "FRAMESHIFT", desc:""},
    {val:"MUT = INFRAME", name: "INFRAME", desc:""},
    {val:"MUT = SPLIC", name: "SPLIC", desc:""},
    {val:"MUT = TRUNC", name: "TRUNC", desc:""}
  ]

  console.log(JSON.stringify(items[1].items[1].items))

  //TODO
  // 3rd level MUT>Specific
  items[1].items[2].items = []

  // Handlerbars.js
  var main = Handlebars.compile($("#oql-menu-placeholder").html());
  Handlebars.registerPartial("oql-menu", $("#oql-menu").html());
  $("#placeholder").html(main({items: items}));

}

//-----------------------------------------------------------
// FOR DEBUGGING: to print objects with circular references
// Adapted from http://stackoverflow.com/questions/4816099/chrome-sendrequest-error-typeerror-converting-circular-structure-to-json#9653082
function censor(censor) {
	var i = 0;
	return function(key, value) {
		if (i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
			return '[Circular]';
		if (i >= 29)
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
	} else if (input.createTextRange) {
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	}
}

function setCaretToPos(input, pos) {
	setSelectionRange(input, pos, pos);
}

function getCursorIndex() {
	return $(TEXTAREA).prop("selectionStart");
}

function getLineHeight(el) {
	var fontSize = $(el).css('font-size');
	var lineHeight = Math.floor(parseInt(fontSize.replace('px', '')) * 1.5);
	return lineHeight
}


// Get absolute position of caret in textarea
function getCaretPosition() {
	var caretPos = $(TEXTAREA).textareaHelper('caretPos');
	var elemPos = $(TEXTAREA).offset();
	caretPos.top += elemPos.top;
	caretPos.top += getLineHeight(TEXTAREA);
	caretPos.left += elemPos.left;
	return caretPos;
}

// Show a menu at caret position in textarea
function showMenu(selector) {
	$(selector).css(getCaretPosition());
	$(selector).css("display", "inline-block");
}

function removeMenu(selector) {
	$(selector).css("display", "none");
}

// Adds text at specified pos; if none specified then at current
// if cursorAtOriginal is true then cursor is restored to original position
// else cursor moved to end of addition
function addText(text, pos, cursorAtOriginal, adjust) {
	var cursorPos = getCursorIndex();
	if (pos == null)
		pos = cursorPos;
		
	var oldVal = $(TEXTAREA).val();
	var newVal = oldVal.substring(0, pos) + text + oldVal.substring(pos, oldVal.length);
	
	$(TEXTAREA).val(newVal);
	
	
	if (!adjust)
	{
		adjust = 0;
	}
	
	if (cursorAtOriginal)
		newPos = cursorPos + adjust;
	else
		var newPos = pos + text.length;
	$(TEXTAREA)[0].setSelectionRange(newPos, newPos);
}

function indexOfLine(text){
	var index = 0;
	var re = /([\s\S]*)^(.*)$/m;
	var res = re.exec(text);
	if (res)
		return res[1].length;
	else
		return 0;
}

$(document).ready(function() {

	generateList();

	// Enter chosen text into textarea
	$(MENU).menu({
		select: function(event, ui) {
			if (ui.item.attr("data-val") !== "") {
				removeMenu(MENU);
				addText(" " + ui.item.attr("data-val"));
				showMenu(MENU);
			}
		}
	});
	
	// DISPLAYING MENU

	// Show menu after typing ':'
	$(TEXTAREA).on("keypress", function(event) {
		
		// Check for disable checkbox
		if ($("#disable-helper").is(":checked"))
			return;
		
		// User typed :
		if (event.keyCode == COLON_CHAR) {
			text = $(TEXTAREA).val();
			cur = getCursorIndex();
			
			//remove space before :
			t = text.substring(0, cur);
			re = /.*\w+([ \t]+)$/
			a = re.exec(t);
			if (a && a[1])
				$(TEXTAREA)[0].setSelectionRange(cur-a[1].length, cur-a[1].length);
			
			// add newline before gene if necessary
			t1 = text.substring(0, cur) + '~!';
			r1 = /^(.+)[ \t]+(\w+)\s*~!/m;
			a1 = r1.exec(t1);
			// console.log(a1);
			if (a1){
				r11 = /([\s\S]*\s+)(\w+)\s*~!/;
				a11 = r11.exec(t1);
				addText("\n", a11[1].length, true, 1)
			}
			
			//add newline after gene if necessary
			text = $(TEXTAREA).val();
			cur = getCursorIndex();
			t2 = '~!' + text.substring(cur, text.length);
			console.log(t2);
			r2 = /~!([ \t]*)(\w+.*$)/m;
			a2 = r2.exec(t2);
			if (a2){
				console.log(a2);
				console.log(a2[1])
				addText("\n", cur+a2[1].length, true);
			}
			
			showMenu(MENU);
		}
	});

	// REMOVING/DISABLING
	
	// Remove menu on backspace/escape
	$(TEXTAREA).on("keyup", function(event) {
		if (event.keyCode == BACKSPACE_CHAR || event.keyCode == ESCAPE_CHAR) {
			$(".hidden-menu").css("display", "none");
		}
	});

	// Remove menu when out of focus
	$(TEXTAREA).focusout(function() {
		$(".hidden-menu").css("display", "none");
	});

	// Remove/Disable menu when disabled is checked
	$("#disable-helper").change(function() {
		if ($(this).is(":checked")) {
			$(".hidden-menu").css("display", "none");
			$("#oql-instruct").css("display", "none");
		} else {
			$(".hidden-menu").css("display", "none");
			$("#oql-instruct").css("display", "inline");
		}
	});

});

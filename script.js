$(document).ready(function() {

	const BACKSPACE_CHAR = 8;
	const COLON_CHAR = 58;
	const SPACE_CHAR = 32;
	const ESCAPE_CHAR = 27;
	const UP_CHAR = 38;
	const DOWN_CHAR = 40;
	const ENTER_CHAR = 13;
	const LINE_FEED = '&#10;';
	
	const disabled = false; // OQL Helper disabled flag

	generateList();
	
	const $TA = $('#gene_list');
	const $ME = $('#oql-menu');

	// jQueryUI menu setup, action on input
	$ME.menu({
		select: function(event, ui) {
			if (ui.item.attr('data-val') !== '') {
				removeMenu();
				$TA.insert(' ' + ui.item.attr('data-val'));
				showMenu();
			}
		}
	});
	
	// Show menu after typing ':'
	$TA.on('keypress', function(event) {
		
		// Check for disable checkbox
		if ($('#disable-helper').is(':checked'))
			return;
		
		// User typed :
		if (event.which == COLON_CHAR) {
			var text = $TA.val();
			var cur = $TA.getCaretIndex();
			console.log('keypress');
			
			//remove space before :
			var t = text.substring(0, cur);
			var re = /.*\w+([ \t]+)$/
			var a = re.exec(t);
			if (a && a[1])
				$TA[0].setSelectionRange(cur-a[1].length, cur-a[1].length);
				
			text = $TA.val();
			cur = $TA.getCaretIndex();

			curLine = $TA.getLine(null, {getBeforeOnly: true});
			// move gene symbol to new line if other symbol before it on line
			re = /^(\w+[ \t]+)+(\w+)$/
			ar = re.exec(curLine);
			if (ar){
				console.log(ar[2].length)
				$TA.val(text.substring(0, cur-ar[2].length) + text.substring(cur, text.length) + '\n' + ar[2]);
			} else {
			// put \n in front of gene symbol if genes in front of it
				re = /(([ \t]+)\w+)+/
				curLine = $TA.getLine(null, {getAfterOnly: true});
				console.log("else" + curLine + re);
				ar = re.exec(curLine);
				console.log(ar);
				if (ar){
					$TA.insert('\n', cur + ar[2].length, {caretAtOriginal: true});
				}
			}
			showMenu();
		}
	});

	// REMOVING/DISABLING
	
	// Remove menu on backspace/escape
	$TA.on('keyup', function(event) {
		if ($ME.css('display') !== 'none') {
			if (event.which === BACKSPACE_CHAR || event.which === ESCAPE_CHAR) {
				$ME.css('display', 'none');
			}
			else if (event.which === UP_CHAR || event.which === DOWN_CHAR || event.which === ENTER_CHAR) {
				removeMenu();
				showMenu();
			}
		}
	});

	// Remove menu when textarea out of focus
	$TA.focusout(function() {
		$ME.css('display', 'none');
	});

	// Remove/Disable menu when disabled is checked
	$('#disable-helper').change(function() {
		if ($(this).is(':checked')) {
			$ME.css('display', 'none');
			$('#oql-instruct').css('display', 'none');
		} else {
			$ME.css('display', 'none');
			$('#oql-instruct').css('display', 'inline');
		}
	});
	
	function showMenu() {
	  $ME.css($TA.getCaretPosition());
	  $ME.css('display', 'inline-block');
	}

	function removeMenu() {
	  $ME.css('display', 'none');
	}

}); //end of document.ready

function generateList() {
  // 1st level of menu
  var items = [
    {val:'', name: 'CNA', desc:'Copy Number Alterations'},
    {val:'', name: 'MUT', desc:'Mutations'},
    {val:'', name: 'EXP', desc:'mRNA Expression'},
    {val:'', name: 'PROT', desc:'Protein/phosphoprotein level (RPPA)'}
  ]

  // 2nd level of CNA
  items[0].items = CNA_items = [
    {val:'CNA', name: 'Default', desc:'AMP and HOMDEL'},
    {val:'AMP', name: 'AMP', desc:'Amplified'},
    {val:'HOMDEL', name: 'HOMDEL', desc:'Deep Deletion'},
    {val:'GAIN', name: 'GAIN', desc:'Gained'},
    {val:'HETLOSS', name: 'HETLOSS', desc:'Shallow Deletion'}
  ]

  // 2nd level of MUT
  items[1].items = MUT_items = [
    {val:'MUT', name: 'Default', desc:'All somatic nonsyn. mutations'},
    {val:'', name: 'Type', desc:''},
    {val:'', name: 'Specific', desc:''}
  ]

  // 2nd level of EXP
  items[2].items = EXP_items = [
    {val:'EXP', name: 'Default', desc:'At least 2 SD from mean'},
    {val:'EXP < -x', name: '< -x', desc:'Less than x SD below mean'},
    {val:'EXP <= -x', name: '<= -x', desc:'Less than or equal to x SD below mean'},
    {val:'EXP > x', name: '> x', desc:'More than x SD above mean'},
    {val:'EXP >= x', name: '>= x', desc:'More than or equal to x SD above mean'}
  ]

  // 2nd level of PROT
  items[3].items = PROT_items = [
    {val:'PROT', name: 'Default', desc:'At least 2 SD from mean'},
    {val:'PROT < -x', name: '< -x', desc:'Less than x SD below mean'},
    {val:'PROT <= -x', name: '<= -x', desc:'Less than or equal to x SD below mean'},
    {val:'PROT > x', name: '> x', desc:'More than x SD above mean'},
    {val:'PROT >= x', name: '>= x', desc:'More than or equal to x SD above mean'}
  ]


  // 3rd level MUT>Type
  items[1].items[1].items = [
    {val:'MUT = MISSENSE', name: 'MISSENSE', desc:''},
    {val:'MUT = NONSENSE', name: 'NONSENSE', desc:''},
    {val:'MUT = NONSTART', name: 'NONSTART', desc:''},
    {val:'MUT = NONSTOP', name: 'NONSTOP', desc:''},
    {val:'MUT = FRAMESHIFT', name: 'FRAMESHIFT', desc:''},
    {val:'MUT = INFRAME', name: 'INFRAME', desc:''},
    {val:'MUT = SPLIC', name: 'SPLIC', desc:''},
    {val:'MUT = TRUNC', name: 'TRUNC', desc:''}
  ]

  //TODO
  // 3rd level MUT>Specific
  items[1].items[2].items = []

  // Handlerbars.js
  var main = Handlebars.compile($('#oql-menu-placeholder').html());
  Handlebars.registerPartial('oql-menu-template', $('#oql-menu-template').html());
  $('#placeholder').html(main({items: items}));

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

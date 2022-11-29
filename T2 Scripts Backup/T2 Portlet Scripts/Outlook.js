/**
* @NApiVersion 2.x
* @NScriptType Portlet
* @NModuleScope SameAccount
*/

define( [], main );

function main() {
	
    return {
        render: renderContent
    }

}

function renderContent( params ) {

	params.portlet.title = 'Website';

	var content = '<iframe class="airtable-embed" src="https://outlook.office.com/mail/sentitems" frameborder="0" onmousewheel="" width="100%" height="533" style="background: transparent; border: 1px solid #ccc;"></iframe>';
	
	params.portlet.html = content;

}
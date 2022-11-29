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

	params.portlet.title = 'Profit By Country' ;
	
  var content = '<iframe class="airtable-embed" src="https://2338541.app.netsuite.com/app/site/hosting/scriptlet.nl?script=154&deploy=1" frameborder="0" onmousewheel="" width="100%" height="650px" style="background: transparent; border: 0px solid #ccc;"></iframe>';
	
	params.portlet.html = content;

}
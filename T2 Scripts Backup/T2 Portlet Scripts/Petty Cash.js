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

	params.portlet.title = 'Vendor Statement' ;
	
  var content = '<iframe class="airtable-embed" src="https://2338541.app.netsuite.com/app/site/hosting/scriptlet.nl?script=243&deploy=1&compid=2338541&script=243&deploy=1&compid=2338541&whence=&whence=" frameborder="0" onmousewheel="" width="100%" height="1000px" style="background: transparent; border: 1px solid #ccc;"></iframe>';
	params.portlet.html = content;
  

}
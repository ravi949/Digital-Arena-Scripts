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

	params.portlet.title = 'Organisational Chart' ;
    var content = src="https://2128892.app.netsuite.com/core/media/media.nl?id=538&c=2128892&h=48bf54ad54073ea1e6a6"
    params.portlet.html = content;
	var content = '<iframe class="airtable-embed" src="https://2128892.app.netsuite.com/app/site/hosting/scriptlet.nl?script=322&deploy=1"" width="100%" height="700px" style="background: transparent; border: 5px solid #ccc;"></iframe>';
	
	params.portlet.html = content;

}
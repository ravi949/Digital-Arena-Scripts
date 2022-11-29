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

	params.portlet.title = 'Wix' ;
	
  var content = '<iframe class="airtable-embed" src="https://editor.wix.com/website/builder?referral=split%20page&vertical=online-store&structureId=073bd83d054dcff87fa0ef50&industryId=087d714d5f85b09c65b51e28&categoryName=Online%20Store#!/intro" frameborder="0" onmousewheel="" width="100%" height="1000px" style="background: transparent; border: 1px solid #ccc;"></iframe>';
	
	params.portlet.html = content;

}
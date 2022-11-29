/**
 *@NApiVersion 2.x
 *@NScriptType Portlet
 */

// This sample creates a portlet that displays simple HTML
define(['N/url'], function(url) {
  function render(params) {
    try
    {
	var content;	
    var scriptLink = url.resolveScript({
    scriptId: 'customscript_da_employee_country',
    deploymentId: 'customdeploy_da_employee',
    returnExternalUrl: true
});
    log.debug('scriptLink',scriptLink);
    var portlet = params.portlet;
       content = '<iframe scrolling="no" align="center" width="100%" height="550px" src="'+scriptLink+'" style="margin:0px; border:0px; padding:0px"></iframe>';
    portlet.title = 'Employees by Home Country';
	portlet.html = content;
    }
    catch (ex) {
        log.error(ex.name, ex.message);
            }	
    }

    return {
        render:render
    };
});
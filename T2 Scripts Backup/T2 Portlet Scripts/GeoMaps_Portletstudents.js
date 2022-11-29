function portletGeoCoding(portlet, column) {
	var content;	
	content = '<iframe scrolling="no" align="center" width="100%" height="550px" src="https://2338541.app.netsuite.com/app/site/hosting/scriptlet.nl?script=431&deploy=1&compid=2338541" style="margin:0px; border:0px; padding:0px"></iframe>';
	
	//show the content of the portlet on the screen
	portlet.setTitle('Sales by Country of Birth');
	portlet.setHtml(content);	
}

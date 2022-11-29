function orgChartSuiteletNUI(request, response)
{
	response.write(getOrgChart(getEmployeeTable()));
}

function orgChartPortlet(portlet, column)
{
	portlet.setTitle('Organisational Chart');
	/*
		display orgChartSuiteletNUI suitelet in iframe
	*/
	var content = '<iframe allowtransparency="true" marginwidth="3" marginheight="3" hspace="0" vspace="3" frameborder="3" scrolling="yes" '
		+ 'src="/app/site/hosting/scriptlet.nl?script=322&deploy=1" '
		+ 'width="100%" height="400px"></iframe>';
	content = '<td><span>'+ content + '</span></td>';
	portlet.setHtml(content);	
}
function orgChartBeforeLoad(type, form)
{
	if (type != 'create')
	{
		form.addTab('custpage_orgcharttab', 'Org Chart');
		//form.addSubTab('custpage_orgcharttab', 'Org Chart', 'general');	// uncomment to add org chart in subtab
		form.addField('custpage_orgcharthtml', 'inlinehtml', null, null, 'custpage_orgcharttab').setDefaultValue(getOrgChart(getContactTable(nlapiGetRecordId())));
	}
}

function orgChartSuitelet(request, response)
{
	var form = nlapiCreateForm('Organisational Chart');
	form.addField('custpage_org_chart', 'inlinehtml', null, null, null).setDefaultValue(getOrgChart(getEmployeeTable()));
	response.writePage(form);
}

function getOrgChart(employeetable)
{
	var content = "<script type='text/javascript' src='https://www.gstatic.com/charts/loader.js'></script><script type='text/javascript'>"
		+ "google.load('visualization', '1', {packages:['orgchart'], callback:drawChart});"
		+ "function drawChart() {var data = new google.visualization.DataTable();"
		+ "data.addColumn('string', 'Name');data.addColumn('string', 'Manager');data.addColumn('string', 'ToolTip');"
		+ "data.addRows(["
		+ employeetable
		+ "]);var chart = new google.visualization.OrgChart(document.getElementById('chart_div'));"
		+ "chart.draw(data, {allowHtml:true});}</script>"
		+ "<body><div id='chart_div'></div></body>";
	return content;
}

function getEmployeeTable()
{
	var results = nlapiSearchRecord('employee', null, new nlobjSearchFilter('isinactive', null, 'is', 'F')
		, [new nlobjSearchColumn('entityid'), new nlobjSearchColumn('title'),new nlobjSearchColumn('custentity_da_oc_title'), new nlobjSearchColumn('supervisor'), new nlobjSearchColumn('email'),new nlobjSearchColumn('custentity_da_dept_oc')]);
	var content = '';
	if (results)
	{
		for (var i = 0; i < results.length; i++)
		{
			content += "[{v:'" + results[i].getId() + "',f:'" +"<div style=\"color:black; font-style:bold\">"+ results[i].getValue('entityid')
				+ "<div style=\"color:red; font-style:italic\">" + results[i].getValue('custentity_da_oc_title') +"<div style=\"color:blue; font-style:italic\">" + results[i].getValue('custentity_da_dept_oc')+ "<div style=\"color:green; font-style:italic\">" + results[i].getValue('email')+ "</div>'}, '"
				+ results[i].getValue('supervisor') + "', '" + results[i].getValue('email') + "'],";
		}
		return content.substring(0, content.length-1);
	}
	else
		return content;
}

function getContactTable(id)
{
	var results = nlapiSearchRecord(nlapiGetRecordType(), null, new nlobjSearchFilter('internalid', null, 'is', id)
		, [new nlobjSearchColumn('internalid', 'contact'), new nlobjSearchColumn('entityid', 'contact'), new nlobjSearchColumn('title', 'custentity_da_dept_oc', 'contact')
		 , new nlobjSearchColumn('custentity_supervisor', 'contact'), new nlobjSearchColumn('email', 'contact')]);
	var content = '';
	if (results)
	{
		for (var i = 0; i < results.length; i++)
		{
			content += "[{v:'" + results[i].getValue('internalid', 'contact') + "',f:'" + results[i].getValue('entityid', 'contact')
				+ "<div style=\"color:blue; font-style:italic\">" + results[i].getValue('title','custentity_da_dept_oc', 'contact') + "</div>'}, '"
				+ results[i].getValue('custentity_supervisor', 'contact') + "', '" + results[i].getValue('email', 'contact') + "'],";
		}
		return content.substring(0, content.length-1);
	}
	else
		return content;
}

function supervisorFieldChanged(type, name)
{
	if (name == 'supervisor')
		nlapiSetFieldValue('custentity_supervisor', nlapiGetFieldValue('supervisor'), false);
}

// Following for Org Chart Portlet, need to change script id after install

function orgChartSuiteletNUI(request, response)
{
	response.write(getOrgChart(getEmployeeTable()));
}

function orgChartPortlet(portlet, column)
{
	portlet.setTitle('Google Org Chart');
	/*
		display orgChartSuiteletNUI suitelet in iframe
	*/
	var content = '<iframe allowtransparency="true" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" scrolling="yes" '
		+ 'src="/app/site/hosting/scriptlet.nl?script=211&deploy=1" '
		+ 'width="800px" height="400px"></iframe>';
	content = '<td><span>'+ content + '</span></td>';
	portlet.setHtml(content);	
}
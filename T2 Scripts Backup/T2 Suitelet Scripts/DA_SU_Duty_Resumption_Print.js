/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/render', 'N/record', 'N/runtime', 'N/format', 'N/file','N/search','N/email'],

		function(render, record, runtime, format, file,search,email) {

	/**
	 * Definition of the Suitelet script trigger point.
	 *
	 * @param {Object} context
	 * @param {ServerRequest} context.request - Encapsulation of the incoming request
	 * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
	 * @Since 2015.2
	 */
	function onRequest(context) {
		try {
			var params = context.request.parameters;
			log.debug('params', params);
			var myTemplate = render.create();
			// if(params.formid == '112'){
			myTemplate.setTemplateByScriptId({
				scriptId: "CUSTTMPL_DA_DUTY_RESUMPTION"
			});
			
			var employeeRecord = record.load({
				type:'customrecord_da_leaves',
				id: params.recid
			});
			myTemplate.addRecord('record', employeeRecord);
			var objj = {};
			myTemplate.addCustomDataSource({
				format: render.DataSource.OBJECT,
				alias: "objj",
				data: objj
			});

			log.debug('template', myTemplate);
			var template = myTemplate.renderAsPdf();
			log.debug('template', template);			
			context.response.writeFile(template, true);

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}



	return {
		onRequest: onRequest
	};

});
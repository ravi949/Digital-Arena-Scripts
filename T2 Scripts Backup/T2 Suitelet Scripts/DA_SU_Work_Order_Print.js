/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define([ 'N/render', 'N/record', 'N/file', 'N/search', 'N/format' ],

function(render, record, file, search, format) {

	/**
	 * Definition of the Suitelet script trigger point.
	 * 
	 * @param {Object}
	 *            context
	 * @param {ServerRequest}
	 *            context.request - Encapsulation of the incoming request
	 * @param {ServerResponse}
	 *            context.response - Encapsulation of the Suitelet response
	 * @Since 2015.2
	 */
	function onRequest(context) {
		try {
			var params = context.request.parameters;
			
			var myTemplate = render.create();
			myTemplate.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_WORK_ORDER_TEMP"
			});
          log.debug('template',myTemplate);
			var objRec = record.load({
				type : 'workorder',
				id :params.id
			});
          log.debug('objRec', objRec);
			myTemplate.addRecord('record', objRec);
			
			var template = myTemplate.renderAsPdf();
			log.debug('template', template);
			context.response.writeFile(template, true);
    

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	return {
		onRequest : onRequest
	};

});

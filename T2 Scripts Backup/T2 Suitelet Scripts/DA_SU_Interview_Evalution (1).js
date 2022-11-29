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
			log.debug('params',params);
			
			var interviewEvalution = render.create();
			interviewEvalution.setTemplateByScriptId({
				scriptId : "CUSTTMPL_145_6465771_395"
			});
			
          log.debug('template',interviewEvalution)
			var objRec = record.load({
				type : 'customrecord_da_job_offer',
				id :params.id
			});
          log.debug('objRec', objRec);
			interviewEvalution.addRecord('record', objRec);

			var template = interviewEvalution.renderAsPdf();
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
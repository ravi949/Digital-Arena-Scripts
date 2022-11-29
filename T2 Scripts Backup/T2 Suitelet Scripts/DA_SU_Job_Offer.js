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
			
			var jobOffer = render.create();
			jobOffer.setTemplateByScriptId({
				scriptId : "CUSTTMPL_144_6465771_451"
			});
			
          log.debug('template',jobOffer)
			var objRec = record.load({
				type : 'customrecord_da_job_offer',
				id :params.id
			});
          log.debug('objRec', objRec);
			jobOffer.addRecord('record', objRec);

			var template = jobOffer.renderAsPdf();
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
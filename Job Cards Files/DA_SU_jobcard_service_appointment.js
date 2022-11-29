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
			
			var myTemplate1 = render.create();
			myTemplate1.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_SERVICE_APPOINTMENT_TEMP"
			});
         // "CUSTTMPLDA_SERVICE_APPOINTMENT_TEMP" 
          log.debug('template1',myTemplate1)
			var objRec = record.load({
				type : 'customrecord_da_b2b_job_card',
				id :params.recordId
			});
          log.debug('objRec', objRec);
			myTemplate1.addRecord('record', objRec);

	
          
            
			var template1 = myTemplate1.renderAsPdf();
			log.debug('template2', template1);
			context.response.writeFile(template1, true);
    

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	return {
		onRequest : onRequest
	};

});
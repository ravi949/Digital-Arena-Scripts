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
			
			var customerdepositTemplate = render.create();
			customerdepositTemplate.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_CUSTOMER_DEPOSIT_PRINT"
			});
          log.debug('template',customerdepositTemplate)
			var customerdepositRec = record.load({
				type : 'customerdeposit',
				id :params.id
			});
          log.debug('billRec', customerdepositRec);
			customerdepositTemplate.addRecord('record', customerdepositRec);

	
          
            
			var template = customerdepositTemplate.renderAsPdf();
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
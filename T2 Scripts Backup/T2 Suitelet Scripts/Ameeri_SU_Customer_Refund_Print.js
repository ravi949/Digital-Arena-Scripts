/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/render', 'N/record', 'N/file', 'N/search', 'N/format'],

		function(render, record, file, search, format) {

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
			myTemplate.setTemplateByScriptId({
				scriptId: "CUSTTMPL_CUST_REFUND_TEMPLATE"
			});
			var checkRec = record.load({
				type: 'customerrefund',
				id: params.recordId
			});
            myTemplate.addRecord('record', checkRec);
			var subsidiaryId = checkRec.getValue('subsidiary');
            var subsidiaryRecord = record.load({
				type: 'subsidiary',
				id: subsidiaryId
			})
			log.debug('fieldLookUp', subsidiaryRecord.getValue('logo'));
            var logourl = "";
          
			if (subsidiaryRecord.getValue('logo')) {
				var fieldLookUpForUrl = search.lookupFields({
					type: 'file',
					id: subsidiaryRecord.getValue('logo'),
					columns: ['url']
				});
				log.debug('fieldLookUpurl', fieldLookUpForUrl.url);
				logourl = params.urlorigin + "" + fieldLookUpForUrl.url;
			
          log.debug('logourl',logourl);
           
           }
          logourl = logourl.split('&');
			log.debug('logourl', logourl);
          var objj = {					
					"img_logo1": logourl[0],
					"img_logo2": logourl[1],
					"img_logo3": logourl[2],
					//"subaddress":subsidiaryRecord.getValue('mainaddress_text'),
					//"date": kuwait
			}
          log.debug("objj",objj);
          
          myTemplate.addCustomDataSource({
				format: render.DataSource.OBJECT,
				alias: "objj",
				data: objj
			});

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
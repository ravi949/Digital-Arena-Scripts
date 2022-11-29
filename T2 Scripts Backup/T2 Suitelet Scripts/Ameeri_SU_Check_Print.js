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
				scriptId: "CUSTTMPL_157_5740514_148"//"CUSTTMPL_CHECK_TEMPLATE_SCRIPT"
			});
			var checkRec = record.load({
				type: 'check',
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
			}


			log.debug('add', subsidiaryRecord.getValue('mainaddress_text'));

			//log.debug('values', quantity + '' + landedcost + '' + rate);

			var date = new Date(); //Mon Aug 24 2015 17:27:16 GMT-0700 (Pacific Daylight Time)
			var kuwait = format.format({
				value: date,
				type: format.Type.DATETIME,
				timezone: format.Timezone.ASIA_RIYADH
			});

			//			var glImpactObj = [];

			var logourl = logourl.split('&');
			log.debug('logourl', logourl);
			//log.debug('glImpactObjvv',glImpactObj.line1.account);

			var objj = {					
					"img_logo1": logourl[0],
					"img_logo2": logourl[1],
					"img_logo3": logourl[2],
					//"subaddress":subsidiaryRecord.getValue('mainaddress_text'),
					"date": kuwait
			}

			//log.debug('glImpactObj',glImpactObj);
			log.debug('objj', objj);
			log.debug('myTemplate', myTemplate);

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
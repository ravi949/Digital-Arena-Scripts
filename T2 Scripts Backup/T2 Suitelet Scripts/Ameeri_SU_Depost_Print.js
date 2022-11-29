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
				scriptId: "CUSTTMPL_DEPOSIT_PDF_TEMP"
			});
			var checkRec = record.load({
				type: 'deposit',
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
				log.debug('logourl',logourl);

			
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

			var linesObj = {};var i =1;
          
			var customerpaymentSearchObj = search.create({
				type: "transaction",
				filters:
					[
						["mainline","is","T"], 
						"AND", 
						["deposittransaction","anyof",params.recordId],"AND", 
						["amount","greaterthan","0.00"]
						],
						columns:
							[
								search.createColumn({
									name: "ordertype",
									sort: search.Sort.ASC,
									label: "Order Type"
								}),
								search.createColumn({name: "trandate", label: "Date"}),
								search.createColumn({name: "type", label: "Type"}),
								search.createColumn({name: "tranid", label: "Document Number"}),
								search.createColumn({name: "entity", label: "Name"}),
								search.createColumn({name: "account", label: "Account"}),
								search.createColumn({name: "memo", label: "Memo"}),
								search.createColumn({name: "amount", label: "Amount"})
								]
			});
			var searchResultCount = customerpaymentSearchObj.runPaged().count;
			log.debug("customerpaymentSearchObj result count",searchResultCount);

			customerpaymentSearchObj.run().each(function(result){
				var entity = result.getText('entity');
				var memo = result.getValue('memo');

				var matched = memo.match('&');

				if(matched){
					memo = memo.replace(/&/g, "&amp;");
				}
				var matched = entity.match('&');

				if(matched){
					entity = entity.replace(/&/g, "&amp;");
				}
				linesObj["line"+i] = {
						'paymentdate':result.getValue('trandate'),
						'paymentamount':result.getValue('amount'),
						'type':result.getText('type'),
						'tranid':result.getValue('tranid'),
						'entity':entity,
						'memo':memo
				};
				i++;
				return true;
			});

			log.debug('linesObj',linesObj);
			myTemplate.addCustomDataSource({
				format: render.DataSource.OBJECT,
				alias: "objj",
				data: objj
			});
			myTemplate.addCustomDataSource({
				format: render.DataSource.OBJECT,
				alias: "linesObj",
				data: linesObj
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
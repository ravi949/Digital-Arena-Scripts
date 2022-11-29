/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/render','N/record','N/file','N/search','N/config'],

		function(render,record,file,search, config) {

	/**
	 * Definition of the Suitelet script trigger point.
	 *
	 * @param {Object} context
	 * @param {ServerRequest} context.request - Encapsulation of the incoming request
	 * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
	 * @Since 2015.2
	 */
	function onRequest(context) {
		try{
			var params = context.request.parameters;
			log.debug('params',params);
			var myTemplate = render.create();
          
          if(params.print == 1){
            myTemplate.setTemplateByScriptId({
				scriptId: "CUSTTMPL_119_5374245_SB1_960"
			});
          }else{
            myTemplate.setTemplateByScriptId({
				scriptId: "CUSTTMPL_119_5374245_SB1_960"
			});
          }
			
			var jobOrderRec = record.load({
				type: 'customrecord_job_order',
				id: params.recordId
			});
			myTemplate.addRecord('record', jobOrderRec);
            log.debug('jobOrderRec',jobOrderRec);

			var subSidiary = jobOrderRec.getValue('custrecord_jo_subsidiary');
			var logourl = "";
          var configRecObj = config.load({
					type: config.Type.COMPANY_INFORMATION
				});
          var accountId = configRecObj.getValue('companyid');
              	accountId = accountId.replace(/_/g, '-');
				var logourl = "";
				var origin = "https://" + accountId + ".app.netsuite.com";
          
          var subsidiaryRecord = record.load({
						type: 'subsidiary',
						id: subSidiary
					});
					if (subsidiaryRecord.getValue('logo')) {
						var fieldLookUpForUrl = search.lookupFields({
							type: 'file',
							id: subsidiaryRecord.getValue('logo'),
							columns: ['url']
						});
						log.debug('fieldLookUpurl', fieldLookUpForUrl.url);
						logourl = origin + "" + fieldLookUpForUrl.url;
					}

			
			var logourl = logourl.split('&');
			log.debug('logourl',logourl);

			var linesObj = {};var i =1;
			var customrecord_jo_particularsSearchObj = search.create({
				type: "customrecord_jo_particulars",
				filters:
					[
						["custrecord_jo_particulars_job_order","anyof",params.recordId]
						],
						columns:
							[
								search.createColumn({name: "custrecord_jo_particulars_product", label: "Product"}),
                                search.createColumn({name: "custrecord_jo_particulars_description", label: "Description"}),
								search.createColumn({name: "custrecord_jo_particulars_qty", label: "Qty"}),
								search.createColumn({name: "custrecord_jo_particulars_unit_price", label: "Unit Price"}),
								search.createColumn({name: "custrecord_jo_particulars_total", label: "Total"}),
                                search.createColumn({name: "custrecord_is_vendor_approved", label: "Total"})
								]
			});
			var searchResultCount = customrecord_jo_particularsSearchObj.runPaged().count;
			log.debug("customrecord_jo_particularsSearchObj result count",searchResultCount);

            var amount = 0;
			customrecord_jo_particularsSearchObj.run().each(function(result){
				var product = result.getText('custrecord_jo_particulars_product');
                var description = result.getValue('custrecord_jo_particulars_description');
				var qty = result.getValue('custrecord_jo_particulars_qty');
				var unitrate = result.getValue('custrecord_jo_particulars_unit_price');
				var total = result.getValue('custrecord_jo_particulars_total');
                var isVendorApproved = result.getValue("custrecord_is_vendor_approved");
                if(isVendorApproved){
                  total = 0;
                }
				amount = parseFloat(total)+parseFloat(amount);
				linesObj["line"+i] = {
                        'sno':i,
						'product':product,
                        'description':description,
                        'underwarranty':isVendorApproved,
						'qty':qty,
						'unitrate':addZeroes(unitrate.toString()),
						'total':addZeroes(total.toString())
				};
				i++;
				return true;
			});

			log.debug('linesObj',linesObj);
            var objj = {
              'total':addZeroes(amount.toString()),
              "img_logo1":logourl[0],
						"img_logo2":logourl[1],
						"img_logo3":logourl[2]
            };

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
			log.debug('template',template);
			context.response.writeFile(template,true);

		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}
  
  function addZeroes( num ) {
    var value = Number(num);
    var res = num.split(".");
    if(res.length == 1 || (res[1].length < 3)) {
        value = value.toFixed(2);
    }
    return value
}

	return {
		onRequest: onRequest
	};

});

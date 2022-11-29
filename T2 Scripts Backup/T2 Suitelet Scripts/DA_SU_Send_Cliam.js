/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define([ 'N/render', 'N/record', 'N/file', 'N/search', 'N/format', 'N/email'],

function(render, record, file, search, format, email) {

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
			
			
			var jobCardRec = record.load({
				type : 'customrecord_da_job_cards',
				id :params.recordId
			});

			var customer = jobCardRec.getText('custrecord_da_customer');
			var jobCardId = jobCardRec.getText('name');
			var Location = jobCardRec.getText('custrecord_da_workshop_location_2');
			var warrenty = jobCardRec.getValue('custrecord_da_job_card_warranty_status');
         var warrantyRec  = record.load({
            type :'customrecord_da_job_card_warranty',
            id : warrenty
          })
             var vendor = warrantyRec.getValue('custrecord_da_warranty_company');
             log.debug('vendor',vendor);
             var vendorText = warrantyRec.getText('custrecord_da_warranty_company');
             log.debug('vendorText',vendorText);
			var templateLink = warrantyRec.getValue('custrecord_da_template_link_id');
			log.debug('templateLink',templateLink);
          log.debug('jobCardRec',jobCardRec);
          var myTemplate = render.create();
          log.debug('template',myTemplate)
          if(warrenty==2)
          {
          	myTemplate.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_5YEARS_WARRENTY"
			});
          }
          else{
          	myTemplate.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_1YEAR_WARRENTY"
			});
          }
			myTemplate.addRecord('record', jobCardRec);

			var adjustMentArr = [];
			var lineCount = jobCardRec.getLineCount({
				sublistId:'recmachcustrecord_da_spare_part_job_card'
			});
			
			for(var i = 0; i < lineCount ;i++){
				var item =  jobCardRec.getSublistText({sublistId: 'recmachcustrecord_da_spare_part_job_card',fieldId: 'custrecord_da_spare_part_item',line: i});
				var itemType =  jobCardRec.getSublistText({sublistId: 'recmachcustrecord_da_spare_part_job_card',fieldId: 'custrecord_da_spare_part_item_type',line: i});
				var description =  jobCardRec.getSublistText({sublistId: 'recmachcustrecord_da_spare_part_job_card',fieldId: 'custrecord_da_spare_part_description',line: i});
				var price =  jobCardRec.getSublistText({sublistId: 'recmachcustrecord_da_spare_part_job_card',fieldId: 'custrecord_da_spare_part_price',line: i});
                var warrentyStatus = jobCardRec.getSublistText({sublistId: 'recmachcustrecord_da_spare_part_job_card',fieldId: 'custrecord_da_item_warranty_status',line: i});
               log.debug('warrentyStatus',warrentyStatus);
              
				adjustMentArr.push({'item':item,'itemType': itemType,'description':description,'price':price,'warrentyStatus':warrentyStatus}); 
			   
			}
			var obj = {customer:customer,jobCardId:jobCardId,Location:Location};
            log.debug('obj',obj);
			
			
			var adjustMentObj = {
					'adjustMentArr':adjustMentArr
			};
			
			log.debug('adjustMentObj',adjustMentObj);

			myTemplate.addCustomDataSource({
				format : render.DataSource.OBJECT,
				alias : "objj",
				data : adjustMentObj
			});
          
            myTemplate.addCustomDataSource({
              format: render.DataSource.OBJECT,
             alias: "obj",
             data:obj
              });
			var template = myTemplate.renderAsPdf();
			template.name = jobCardId+".pdf";
			log.debug('template',template);
			var  folderId = -12;
			template.folder = folderId;
				var id = template.save();
           var fileObj = file.load({
					id: id
				});
           var maintanceRec = record.load({
           	type:'customrecord_da_maintenance_settings',
           	id:1
           });
           var author = maintanceRec.getValue('custrecord_da_email_author');
           var message = maintanceRec.getText('custrecord_da_claim_message');
           var replaceVendor = message.replace("##VendorName##", vendorText);
           var replaceCustomer = replaceVendor.replace("##customerName##", customer);
           log.debug('replaceCustomer',replaceCustomer);
           log.debug('author',author);
           log.debug('message',message);
				if (vendor) {
					log.debug('email sending');
					email.send({
						author: author,
						recipients: vendor,
						subject: 'Claim Request ',
						body: replaceCustomer,
						attachments: [fileObj]
					});
				}
				
			
			log.debug('template', template);
			//context.response.writeFile(template, true);
    

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	return {
		onRequest : onRequest
	};

});
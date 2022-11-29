/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task','N/search','N/record','N/render','N/file','N/email'],

		function(task,search,record,render,file,email) {

	/**
	 * Definition of the Suitelet script trigger point.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @Since 2016.1
	 */
	function onAction(scriptContext) {
		try{ 

		       var recId = scriptContext.newRecord.id;
                var type = scriptContext.newRecord.type;
                var jobCardRec = scriptContext.newRecord;
			
			var jobCardId = jobCardRec.getText('name');
			var warrenty = jobCardRec.getValue('custrecord_da_job_card_warranty_status');
         var warrantyRec  = record.load({
            type :'customrecord_da_job_card_warranty',
            id : warrenty
          });
         var maintanceRec = record.load({
           	type:'customrecord_da_maintenance_settings',
           	id:1
           });
             var vendor = warrantyRec.getValue('custrecord_da_warranty_company');
             log.debug('vendor',vendor);
             var vendorText = warrantyRec.getText('custrecord_da_warranty_company');
             log.debug('vendorText',vendorText);
			var templateLink = warrantyRec.getValue('custrecord_da_template_link_id');
			log.debug('templateLink',templateLink);
          //log.debug('jobCardRec',jobCardRec);
          var myTemplate = render.create();
          myTemplate.setTemplateById(templateLink);
          /*log.debug('template',myTemplate)
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
          }*/
			myTemplate.addRecord('record', jobCardRec);

			var adjustMentArr = [];
			var lineCount = jobCardRec.getLineCount({
				sublistId:'recmachcustrecord_da_spare_part_job_card'
			});
			var total =0;
			
			for(var i = 0; i < lineCount ;i++){
				var requiredPart =  jobCardRec.getSublistText({sublistId: 'recmachcustrecord_da_spare_part_job_card',fieldId: 'custrecord_da_spare_part_item',line: i});				
				var cost =  jobCardRec.getSublistValue({sublistId: 'recmachcustrecord_da_spare_part_job_card',fieldId: 'custrecord_da_spare_part_price',line: i});
                total = parseFloat(total)+parseFloat(cost);
				adjustMentArr.push({'requiredPart':requiredPart,'cost':cost}); 
			   
			}
			var customer = jobCardRec.getText('custrecord_da_customer');
			var productName = jobCardRec.getText('custrecord_da_item');
			var serialNo = jobCardRec.getValue('custrecord_da_serial_number');
			var workshopManager = maintanceRec.getText('custrecord_da_jobcard_workshop_manager');
			var obj = {customer:customer,productName:productName,serialNo:serialNo,total:total,workshopManager:workshopManager};
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
    
		}catch(ex){

			log.error(ex.name,ex.message);
		}
	}

	return {
		onAction : onAction
	};

});

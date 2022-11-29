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
				scriptId : "CUSTTMPL_DA_RECEIPT_VOUCHER_TEMP"
			});
          //CUSTTMPL_172_5740514_SB1_236
          log.debug('template1',myTemplate1)
			var objRec = record.load({
				type : 'customrecord_da_b2b_job_card',
				id :params.recordId
			});
          log.debug('objRec', objRec);
			myTemplate1.addRecord('record', objRec);
            var firstlinesObj = {};
var firstLinesArr = [];
	var customrecord_da_btob_items_to_be_serviceSearchObj = search.create({
                   type: "customrecord_da_btob_items_to_be_service",
                   filters:
                   [
                      ["custrecord_da_btob_parent1","anyof",params.recordId]
                   ],
                   columns:
                   [
                      search.createColumn({
                         name: "scriptid",
                         sort: search.Sort.ASC,
                         label: "Script ID"
                      }),
                      search.createColumn({name: "custrecord_da_btob_parent1", label: "Parent"}),
                      search.createColumn({name: "custrecord_da_btob_item", label: "Item"}),
                      search.createColumn({name: "custrecord_da_btob_item_description", label: "Item Description"}),
                      search.createColumn({name: "custrecord_da_btob_item_model", label: "Item Model"}),
                      search.createColumn({name: "custrecord_da_btob_color", label: "Color"}),
                      search.createColumn({name: "custrecord_da_btob_serial_no", label: "Serial No"}),
                      search.createColumn({name: "custrecord_da_btob_invoice_date", label: "Invoice Date"}),
                      search.createColumn({name: "custrecord_da_btob_warranty", label: "Is It Under Warranty?"}),
                      search.createColumn({name: "custrecord_da_items_to_be_serv_comments", label: "Comments"}),
                      search.createColumn({name: "custrecord_da_commission_and_train", label: "Commissioning & Training"}),
                      search.createColumn({name: "custrecord_da_googs_remove_from_site", label: "Goods Removal From Site"}),
                      search.createColumn({name: "custrecord_da_instal_or_assemble", label: "Installation / Assemblage"}),
                      search.createColumn({name: "custrecord_da_maintenance_repair", label: "Maintenance & Repair Services"}),
                      search.createColumn({name: "custrecord_da_services_completed", label: "Services Completed"}),
                      search.createColumn({name: "custrecord_da_site_survey", label: "Site Survey(Pre-Installation)"}),
                      search.createColumn({name: "custrecord_da_warranty", label: "Warranty"}),
                      search.createColumn({name: "custrecord_da_aj_actual_serial_no", label: "Warranty"})
                   ]
                });
                var searchResultCount = customrecord_da_btob_items_to_be_serviceSearchObj.runPaged().count;
                log.debug("customrecord_da_btob_items_to_be_serviceSearchObj result count",searchResultCount);
               
                customrecord_da_btob_items_to_be_serviceSearchObj.run().each(function(result){
                   var item = result.getText('custrecord_da_btob_item');
                   var description = result.getValue('custrecord_da_btob_item_description');
                   var model = result.getValue('custrecord_da_btob_item_model');
                   var colour = result.getValue('custrecord_da_btob_color');
                   var underwarranty = result.getValue('custrecord_da_btob_warranty');
                   var jobtype = '';
                   var comments = result.getText('custrecord_da_items_to_be_serv_comments');
                   var matched = item.match('&');
                    if (matched) {
                        item = item.replace(/&/g, "&amp;");
                    }
                    var matched1 = description.match('&');
                    if (matched1) {
                        description = description.replace(/&/g, "&amp;");
                    }
                    
                    firstLinesArr.push({
                        'sno': i,
                        'item': item,
                        'description': description,
                        "model": model,
                        'colour': colour,
                        'underwarranty' : underwarranty,
                        'jobtype' : jobtype,
                        'comments' : comments,
                        'ct': result.getValue('custrecord_da_commission_and_train'),
                      'gr': result.getValue('custrecord_da_googs_remove_from_site'),
                      'ia': result.getValue('custrecord_da_instal_or_assemble'),
                      'mrs': result.getValue('custrecord_da_maintenance_repair'),
                      'sc': result.getValue('custrecord_da_services_completed'),
                      'ss': result.getValue('custrecord_da_site_survey'),
                      'serialNo': result.getValue('custrecord_da_aj_actual_serial_no')
                    });
                    i++;
                   return true;
                });
           var firstlinesObj = {
                    'firstlinesArr': firstLinesArr
                };
          log.debug('firstlinesObj', firstlinesObj);
           myTemplate1.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: "firstlinesObj",
                    data: firstlinesObj
                });
            
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
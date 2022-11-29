	/**
	 * @NApiVersion 2.x
	 * @NScriptType UserEventScript
	 * @NModuleScope TargetAccount
	 */
	define(['N/runtime', 'N/record', 'N/search'],

	    function(runtime, record, search) {

	        /**
	         * Function definition to be triggered before record is loaded.
	         *
	         * @param {Object} scriptContext
	         * @param {Record} scriptContext.newRecord - New record
	         * @param {string} scriptContext.type - Trigger type
	         * @param {Form} scriptContext.form - Current form
	         * @Since 2015.2
	         */
	        function beforeLoad(scriptContext) {
	            try {

	            } catch (ex) {
	                log.error(ex.name, ex.message);
	            }

	        }

	        /**
	         * Function definition to be triggered before record is loaded.
	         *
	         * @param {Object} scriptContext
	         * @param {Record} scriptContext.newRecord - New record
	         * @param {Record} scriptContext.oldRecord - Old record
	         * @param {string} scriptContext.type - Trigger type
	         * @Since 2015.2
	         */
	        function beforeSubmit(scriptContext) {

	        }

	        /**
	         * Function definition to be triggered before record is loaded.
	         *
	         * @param {Object} scriptContext
	         * @param {Record} scriptContext.newRecord - New record
	         * @param {Record} scriptContext.oldRecord - Old record
	         * @param {string} scriptContext.type - Trigger type
	         * @Since 2015.2
	         */
	        function afterSubmit(scriptContext) {

	            try {
                  
                  var customrecord_da_gl_data_baseSearchObj = search.create({
					   type: "customrecord_da_gl_data_base",
					   filters:
					   [
					      ["custrecord_da_gl_impact_created_from","anyof",scriptContext.newRecord.id]
					   ],
					   columns:
					   ['internalid']
					});
					var searchResultCount = customrecord_da_gl_data_baseSearchObj.runPaged().count;
					log.debug("customrecord_da_gl_data_baseSearchObj result count",searchResultCount);
					customrecord_da_gl_data_baseSearchObj.run().each(function(result){
                      log.debug('deleting', result.id);
                      	record.delete({
                          type:'customrecord_da_gl_data_base',
                          id : result.id
                        });
                      return true;
                      
                    });
                  
                  var JvRec = record.load({
                    type:'journalentry',
                    id: scriptContext.newRecord.id
                  })

	            	  var createdFrom = JvRec.getValue('createdfrom');
	            	  var createdFromType = JvRec.getText('createdfrom');

	            	//  log.debug('createdfrom',createdFrom +"createdFromType"+ createdFromType.split(" ")[0]);

	            	  var type = createdFromType.split(" ")[0];
	            	  var typeId = 1;
	            	  
	            	  if(createdFrom){
	            	  		var customrecord_da_gl_data_baseSearchObj = search.create({
					   type: "customrecord_da_gl_data_base",
					   filters:
					   [
					      ["custrecord_da_gl_impact_created_from","anyof",createdFrom]
					   ],
					   columns:
					   [
					      search.createColumn({
					         name: "scriptid",
					         sort: search.Sort.ASC,
					         label: "Script ID"
					      }),
					      search.createColumn({name: "custrecord_da_gl_account", label: "GL Account"}),
					      search.createColumn({name: "custrecord_da_gl_debit", label: "GL Debit"}),
					      search.createColumn({name: "custrecord_da_gl_credit", label: "GL Credit"}),
					      search.createColumn({name: "custrecord_da_gl_date", label: "GL Date"}),
					      search.createColumn({name: "custrecord_da_gl_memo", label: "GL Memo"}),
					      search.createColumn({name: "custrecord_da_gl_subsidiary", label: "GL Subsidiary"}),
					      search.createColumn({name: "custrecord_da_gl_location", label: "GL Location"}),
					      search.createColumn({name: "custrecord_da_gl_department", label: "GL Department"}),
					      search.createColumn({name: "custrecord_da_gl_class", label: "GL Class"}),
					      search.createColumn({name: "custrecord_da_gl_name", label: "GL Name"}),
					      search.createColumn({name: "custrecord_da_gl_impact_created_from", label: "GL Impact Created From"}),
					      search.createColumn({name: "custrecord_da_gl_impact_transaction_type", label: "GL Impact Transaction Type"})
					   ]
					});
					var searchResultCount = customrecord_da_gl_data_baseSearchObj.runPaged().count;
					log.debug("customrecord_da_gl_data_baseSearchObj result count",searchResultCount);
					customrecord_da_gl_data_baseSearchObj.run().each(function(result){
					   var account = result.getValue('custrecord_da_gl_account');
					   var creditAmount = result.getValue('custrecord_da_gl_credit');
					   var debitAmount = result.getValue('custrecord_da_gl_debit');
					   var subsidairy = result.getValue('custrecord_da_gl_subsidiary');
					   var postingPeriod = result.getValue('postingperiod');
					   var vendor = result.getValue('entity');
					   var createdFrom = result.getValue('custrecord_da_gl_impact_created_from');
					   var glDataBaseRec = record.create({
					   	 type :'customrecord_da_gl_data_base'
					   });
                      glDataBaseRec.setValue('custrecord_da_gl_date', result.getText('custrecord_da_gl_date'));
					   glDataBaseRec.setValue('custrecord_da_gl_account', account);
                       log.debug('creditAmount', creditAmount);
					   if(creditAmount > 0){
                         log.debug('setting');
					   		glDataBaseRec.setValue('custrecord_da_gl_debit', creditAmount);
					   }
					   if(debitAmount > 0){
					   	   glDataBaseRec.setValue('custrecord_da_gl_credit', debitAmount);
					   }
					   glDataBaseRec.setValue('custrecord_da_gl_subsidiary', subsidairy);
                       
                       glDataBaseRec.setValue('custrecord_da_gl_memo', "Voiding "+type);
					   glDataBaseRec.setValue('custrecord_da_gl_vendor', vendor);
					   glDataBaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
					   glDataBaseRec.setValue('custrecord_da_gl_impact_transaction_type', typeId);
					  var id =  glDataBaseRec.save();
                      log.debug('id', id);
					   return true;
					});
	            	  }

	            	  

	            } catch (ex) {
	                log.error(ex.name, ex.message);
	            }

	        }

	        return {
	            beforeLoad: beforeLoad,
	            beforeSubmit: beforeSubmit,
	            afterSubmit: afterSubmit
	        };

	    });
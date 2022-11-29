/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime'],
	function(record, search, runtime) {
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {string} scriptContext.type - Trigger type
		 * @param {Form} scriptContext.form - Current form
		 * @Since 2015.2
		 */
		function beforeLoad(scriptContext) {}
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		function beforeSubmit(scriptContext) {}
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
				var scriptObj = runtime.getCurrentScript();
              	log.debug('scriptObj',scriptObj.deploymentId);
				if (scriptObj.deploymentId == "customdeploy_da_ue_je_database_creation") {
                  
                  var createdFrom =  scriptContext.newRecord.getValue('createdfrom');

	            	 
	            	  
	            	  if(!createdFrom){

					var createGlImpact = scriptContext.newRecord.getValue('custbody_da_create_gl_impact');
					var exchangeRate = scriptContext.newRecord.getValue('exchangerate');
					var customrecord_da_gl_data_baseSearchObj = search.create({
						type: "customrecord_da_gl_data_base",
						filters: [
							["custrecord_da_gl_impact_created_from", "anyof", scriptContext.newRecord.id]
						],
						columns: [
							search.createColumn({
								name: "internalid",
								label: "Internal ID"
							})
						]
					});
					var searchResultCount = customrecord_da_gl_data_baseSearchObj.runPaged().count;
					log.debug("customrecord_da_gl_data_baseSearchObj result count", searchResultCount);
					customrecord_da_gl_data_baseSearchObj.run().each(function(result) {
						record.delete({
							type: 'customrecord_da_gl_data_base',
							id: result.id
						})
						return true;
					});
					if (createGlImpact) {
						var lineCount = scriptContext.newRecord.getLineCount({
							sublistId: 'line'
						});
						log.debug('lineCount', lineCount);
						for (var i = 0; i < lineCount; i++) {
							var account = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'account',
								line: i
							});
							var memo = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'memo',
								line: i
							});
							log.debug('memo 11',memo);
							if((memo == "Amortization Destination") || (memo == "Amortization Source")){
								var debitAmount = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'debit',
								line: i
							});
							//log.debug('debitAmount 1',debitAmount);
							var creditAmount = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'credit',
								line: i
							});
							//log.debug('creditAmount 1',creditAmount);
						    } else {
						    	var debitAmount = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'custcol_da_dr_3_decimal',
								line: i
							});
							//log.debug('debitAmount 11',debitAmount);
							var creditAmount = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'custcol_da_cr_3_decimal',
								line: i
							});
							//log.debug('creditAmount 11',creditAmount);
						    }
							var location = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'location',
								line: i
							});
							var subsidiary = scriptContext.newRecord.getValue({
								fieldId: 'subsidiary'
							});
							var department = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'department',
								line: i
							});
							var classId = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'class',
								line: i
							});
							var entityId = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'entity',
								line: i
							});
								var glDatabaseRec = record.create({
								type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', account);
							glDatabaseRec.setValue('custrecord_da_gl_date', scriptContext.newRecord.getValue('trandate'));
							if (debitAmount > 0) {
								glDatabaseRec.setValue('custrecord_da_gl_debit', debitAmount * exchangeRate);
							}
							if (creditAmount > 0) {
								glDatabaseRec.setValue('custrecord_da_gl_credit', creditAmount * exchangeRate);
							}
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 1);
							glDatabaseRec.setValue('custrecord_da_gl_department', department);
							glDatabaseRec.setValue('custrecord_da_gl_class', classId);
							glDatabaseRec.setValue('custrecord_da_gl_name', entityId);
							glDatabaseRec.save();
						}
					}
                      }
				}

				if(scriptObj.deploymentId == "customdeploy_da_adv_je_database_creation"){
					var createGlImpact = scriptContext.newRecord.getValue('custbody_da_create_gl_impact');
					var customrecord_da_gl_data_baseSearchObj = search.create({
						type: "customrecord_da_gl_data_base",
						filters: [
							["custrecord_da_gl_impact_created_from", "anyof", scriptContext.newRecord.id]
						],
						columns: [
							search.createColumn({
								name: "internalid",
								label: "Internal ID"
							})
						]
					});
					var searchResultCount = customrecord_da_gl_data_baseSearchObj.runPaged().count;
					log.debug("customrecord_da_gl_data_baseSearchObj result count", searchResultCount);
					customrecord_da_gl_data_baseSearchObj.run().each(function(result) {
						record.delete({
							type: 'customrecord_da_gl_data_base',
							id: result.id
						})
						return true;
					});
					if (createGlImpact) {
						var lineCount = scriptContext.newRecord.getLineCount({
							sublistId: 'line'
						});
						log.debug('lineCount', lineCount);
						for (var i = 0; i < lineCount; i++) {
							var exchangeRate = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'linefxrate',
								line: i
							});
							var account = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'account',
								line: i
							});
							var memo = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'memo',
								line: i
							});
                           // log.debug('memo 22',memo);
							if((memo == "Amortization Destination") || (memo == "Amortization Source")){
								var debitAmount = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'debit',
								line: i
							});
                           // log.debug('debitAmount 2',debitAmount);
							var creditAmount = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'credit',
								line: i
							});
							//log.debug('creditAmount 2',creditAmount);
						} else {
							var debitAmount = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'custcol_da_dr_3_decimal',
								line: i
							});
                            //log.debug('debitAmount 22',debitAmount);
							var creditAmount = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'custcol_da_cr_3_decimal',
								line: i
							});
							//log.debug('creditAmount 22',creditAmount);
						}
							var location = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'location',
								line: i
							});
							var subsidiary = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'linesubsidiary',
								line: i
							});
							var department = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'department',
								line: i
							});
							var classId = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'class',
								line: i
							});
							var entityId = scriptContext.newRecord.getSublistValue({
								sublistId: 'line',
								fieldId: 'entity',
								line: i
							});
							
								var glDatabaseRec = record.create({
								type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', account);
							glDatabaseRec.setValue('custrecord_da_gl_date', scriptContext.newRecord.getValue('trandate'));
							if (debitAmount > 0) {
                               log.debug();
								glDatabaseRec.setValue('custrecord_da_gl_debit', debitAmount * exchangeRate);
							}
							if (creditAmount > 0) {
								glDatabaseRec.setValue('custrecord_da_gl_credit', creditAmount * exchangeRate);
							}
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', subsidiary);
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', 1);
							glDatabaseRec.setValue('custrecord_da_gl_department', department);
							glDatabaseRec.setValue('custrecord_da_gl_class', classId);
							glDatabaseRec.setValue('custrecord_da_gl_name', entityId);
							glDatabaseRec.save();
						}
					}
				}
			} catch (ex) {
				log.error(ex.name, ex.message);
			}
		}
		return {
			// beforeLoad: beforeLoad,
			//  beforeSubmit: beforeSubmit,
			afterSubmit: afterSubmit
		};
	});
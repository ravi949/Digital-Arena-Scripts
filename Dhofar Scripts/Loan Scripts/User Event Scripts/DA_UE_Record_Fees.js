	/**
	 * @NApiVersion 2.x
	 * @NScriptType UserEventScript
	 * @NModuleScope TargetAccount
	 */
	define(['N/runtime', 'N/record', 'N/search'],
		function(runtime, record, search) {
			var loanUpfrontFeesRecId, bondUpfrontFeesRecId;
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
				try {} catch (ex) {
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
                    log.debug('Deployment Id: ' + scriptObj.deploymentId);
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
					    loanUpfrontFeesRecId = record.create({
	                        type: 'custompurchase_da_loan_upfront_fees'
	                    }).getValue('customtype');
	                    log.debug('loanUpfrontFeesRecId', loanUpfrontFeesRecId);
	                    bondUpfrontFeesRecId = record.create({
	                        type: 'custompurchase_da_bond_upfront_fees'
	                    }).getValue('customtype');
	                    log.debug('bondUpfrontFeesRecId', bondUpfrontFeesRecId);

					
						var transactionSearchObj = search.create({
					   type: "transaction",
					   filters:
					   [
					      ["internalid","anyof",scriptContext.newRecord.id]
					   ],
					   columns:
					   [
					      search.createColumn({name: "trandate", label: "Date"}),
					      search.createColumn({name: "type", label: "Type"}),
					      search.createColumn({name: "tranid", label: "Document Number"}),
					      search.createColumn({name: "entity", label: "Name"}),
					      search.createColumn({name: "account", label: "Account"}),
					      search.createColumn({name: "memo", label: "Memo"}),
					      search.createColumn({name: "amount", label: "Amount"}),
					      search.createColumn({name: "creditamount", label: "Amount (Credit)"}),
					      search.createColumn({name: "debitamount", label: "Amount (Debit)"}),
					      search.createColumn({name: "location", label: "Location"})
					   ]
					});
					var searchResultCount = transactionSearchObj.runPaged().count;
					log.debug("transactionSearchObj result count",searchResultCount);
					transactionSearchObj.run().each(function(result){
					   var debitAmount = result.getValue('debitamount');
					   var creditAmount = result.getValue('creditamount');

					   var account = result.getValue('account');
					   var memo = result.getValue('memo');

					   var location = result.getValue('location');

					   if(debitAmount > 0){
					   	  var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', account);
							glDatabaseRec.setValue('custrecord_da_gl_date', scriptContext.newRecord.getValue('trandate'));
							glDatabaseRec.setValue('custrecord_da_gl_debit', debitAmount);
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', scriptContext.newRecord.getValue('subsidiary'));
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);
							if(scriptObj.deploymentId == 'customdeploy_da_ue_record_fees_bond_upfr'){
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', bondUpfrontFeesRecId);
							}
							else{
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', loanUpfrontFeesRecId);
							}
							//glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();
					   }

					   if(creditAmount > 0){
					   		var glDatabaseRec = record.create({
							type: 'customrecord_da_gl_data_base'
							});
							glDatabaseRec.setValue('custrecord_da_gl_account', account);
							glDatabaseRec.setValue('custrecord_da_gl_date', scriptContext.newRecord.getValue('trandate'));
							glDatabaseRec.setValue('custrecord_da_gl_credit', creditAmount);
							glDatabaseRec.setValue('custrecord_da_gl_memo', memo);
							glDatabaseRec.setValue('custrecord_da_gl_subsidiary', scriptContext.newRecord.getValue('subsidiary'));
							glDatabaseRec.setValue('custrecord_da_gl_impact_created_from', scriptContext.newRecord.id);if(scriptObj.deploymentId == 'customdeploy_da_ue_record_fees_bond_upfr'){
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', bondUpfrontFeesRecId);
							}
							else{
								glDatabaseRec.setValue('custrecord_da_gl_impact_transaction_type', loanUpfrontFeesRecId);
							} 
							//glDatabaseRec.setValue('custrecord_da_gl_name', scriptContext.newRecord.getValue('entity'));
							glDatabaseRec.setValue('custrecord_da_gl_location', location);
							glDatabaseRec.save();
					   }
					   return true;
					});
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
	/**
	 * @NApiVersion 2.x
	 * @NScriptType UserEventScript
	 * @NModuleScope TargetAccount
	 */
	define(['N/runtime', 'N/record', 'N/search', 'N/format'],

	    function(runtime, record, search, format) {

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
                      	record.delete({
                          type:'customrecord_da_gl_data_base',
                          id : result.id
                        });
                      return true;
                      
                    });
                    
	            	var internalId = scriptContext.newRecord.id;
	            	log.debug('internalId',internalId);
                  	          var customTransSearch = search.create({
                    type: 'TRANSACTION',
                    columns: [
                        'account', 'creditamount', 'debitamount', 'trandate', 'subsidiary', 'custbody_da_created_from_bank_loan', 'custcol_da_dr_3_decimal', 'custcol_da_cr_3_decimal'
                    ],
                    filters: [
                        ['internalid', 'anyof', internalId]
                        ]
                });
                  	customTransSearch.run().each(function(result) {
                    var account = result.getValue('account');
                    log.debug('account',account);
                    var creditAmount = result.getValue('creditamount');
                    log.debug('creditAmount',creditAmount);
                    var debitAmount = result.getValue('debitamount');
                    log.debug('debitAmount',debitAmount);
                    var date = result.getValue('trandate');
                    log.debug('date',date);
                    var subsidiary = result.getValue('subsidiary');
                    log.debug('subsidiary',subsidiary);
                    var creditAmount3d = result.getValue('custcol_da_cr_3_decimal');
                    log.debug('creditAmount3d',creditAmount3d);
                    var debitAmount3d = result.getValue('custcol_da_dr_3_decimal');
                    log.debug('debitAmount3d',debitAmount3d);

					if((debitAmount > 0) || (creditAmount > 0)){
                    var trialBalRec = record.create({
						type: "customrecord_da_gl_data_base",
						isDynamic: true
					});
					trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
					var parsedDate = format.parse({
						value: date,
						type: format.Type.DATE
					});
					trialBalRec.setValue('custrecord_da_gl_date',parsedDate);
					trialBalRec.setValue('custrecord_da_gl_account',account);
					trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                      if(debitAmount> 0){
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(debitAmount3d).toFixed(3));
                      }else{
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(creditAmount3d).toFixed(3));
                      }
					var trialBalRecord = trialBalRec.save();
					log.debug('trialBalRecord',trialBalRecord);
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
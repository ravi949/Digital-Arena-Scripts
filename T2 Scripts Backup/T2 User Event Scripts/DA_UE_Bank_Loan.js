/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record'],
	function(search, record) {
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
			log.debug('beforeSubmit', 'beforeSubmit');
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
			try{

				var bankLoanRec = record.load({
					type :'customrecord_da_bank_loan',
					id: scriptContext.newRecord.id
				});

				

				

				var customrecord_da_bank_loan_agreementSearchObj = search.create({
				   type: "customrecord_da_bank_loan_agreement",
				   filters:
				   [
				      ["custrecord_da_created_from_loan_agree","anyof",scriptContext.newRecord.id], 
				      "AND", 
				      ["custrecord_da_loan_pay_tran_no","anyof","@NONE@"]
				   ],
				   columns:
				   [
				      search.createColumn({
				         name: "custrecord_da_loan_payment",
				         summary: "SUM",
				         label: "Loan Payment"
				      })
				   ]
				});
				var searchResultCount = customrecord_da_bank_loan_agreementSearchObj.runPaged().count;
				log.debug("customrecord_da_bank_loan_agreementSearchObj result count",searchResultCount);

				var amount = 0;

				if(searchResultCount > 0){
					customrecord_da_bank_loan_agreementSearchObj.run().each(function(result){
					   amount = result.getValue({
					   	   name:'custrecord_da_loan_payment',
					   	   summary: search.Summary.SUM
					   })
					   return true;
					});
				}else{
					amount = scriptContext.newRecord.getValue('custrecord_da_total_amount_of_loan');
				}
              
             // log.debug('amount', amount);
              
              if(!amount){
                amount = 0;
              }

				var bankLoanRec = record.load({
					type:'customrecord_da_bank_loan',
					id : scriptContext.newRecord.id,
					isDynamic: true
				})

				var lineCount = bankLoanRec.getLineCount({
					sublistId:'recmachcustrecord_da_created_from_loan_agree'
				});

				bankLoanRec.setValue('custrecord_da_outstanding_bl_amount', amount);

				var totalAmount = 0;
				var flag = false;
				var totalLoanAmount = scriptContext.newRecord.getValue('custrecord_da_total_amount_of_loan');

				for(var i = 0; i < lineCount ; i++){
					if(i == 0){

						bankLoanRec.selectLine({
							sublistId :'recmachcustrecord_da_created_from_loan_agree',
							line: i
						})

						var currentLineAmount = bankLoanRec.getCurrentSublistValue({
							sublistId :'recmachcustrecord_da_created_from_loan_agree',
							fieldId:'custrecord_da_loan_payment',
							line: i
						});

						log.debug('currentLineAmount', currentLineAmount);
						var excludeFirstDay = bankLoanRec.getCurrentSublistValue({
							sublistId :'recmachcustrecord_da_created_from_loan_agree',
							fieldId:'custrecord_da_excl_first_day',
							line: i
						});

						log.debug('excludeFirstDay', excludeFirstDay);
						
							flag = excludeFirstDay;
						totalAmount = parseFloat(totalAmount) + parseFloat(currentLineAmount);
						bankLoanRec.setCurrentSublistValue({
							sublistId :'recmachcustrecord_da_created_from_loan_agree',
							fieldId:'custrecord_da_current_outstanding_balanc',
							value: totalLoanAmount
						});
                      bankLoanRec.setCurrentSublistValue({
							sublistId :'recmachcustrecord_da_created_from_loan_agree',
							fieldId:'custrecord_da_first_bl_agreement',
							value: true
						});
						bankLoanRec.commitLine({
							sublistId:'recmachcustrecord_da_created_from_loan_agree'
						})
					}else{

					    bankLoanRec.selectLine({
							sublistId :'recmachcustrecord_da_created_from_loan_agree',
							line: i
						});

						bankLoanRec.setCurrentSublistValue({
							sublistId :'recmachcustrecord_da_created_from_loan_agree',
							fieldId:'custrecord_da_current_outstanding_balanc',
							value: parseFloat(totalLoanAmount) - parseFloat(totalAmount)
						});
						if(i == lineCount-1){
						bankLoanRec.setCurrentSublistValue({
							sublistId :'recmachcustrecord_da_created_from_loan_agree',
							fieldId:'custrecord_da_excl_first_day',
							value: flag
						});			
					}

						var currentLineAmount = bankLoanRec.getCurrentSublistValue({
							sublistId :'recmachcustrecord_da_created_from_loan_agree',
							fieldId:'custrecord_da_loan_payment'
						});

						log.debug('currentLineAmount', currentLineAmount);

						totalAmount = parseFloat(totalAmount) + parseFloat(currentLineAmount);

						log.debug('totalAmount', totalAmount);

						
						bankLoanRec.commitLine({
							sublistId:'recmachcustrecord_da_created_from_loan_agree'
						});

					}
				}

				bankLoanRec.save({
					enableSourcing: false,
					ignoreMandatoryFields : true
				});
				



			}catch(ex){
				log.error(ex.name, ex.message);
			}
		}
		return {
			beforeLoad: beforeLoad,
			//beforeSubmit: beforeSubmit,
			afterSubmit: afterSubmit
		};
	});
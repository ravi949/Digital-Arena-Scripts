/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message','N/ui/serverWidget','N/search','N/runtime','N/record'],

		function(message,serverWidget,search,runtime,record) {

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
		try{ 
          
          var processing = scriptContext.newRecord.getValue('custrecord_da_ic_processing');
			if(processing){
				var msgText = message.create({
					title: "Process is in Progress", 
					message: "You will be notified by email once the process is completed, Thank You!",  
					type: message.Type.INFORMATION
				});
				scriptContext.form.addPageInitMessage({message: msgText});
			}

		}catch(ex){
			log.error(ex.name,ex.message);
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
		try{
			//setting employees list
			var customrecord_da_pay_run_itemsSearchObj = search.create({
				type: "customrecord_da_ic_pay_run_items",
				filters: [
					["custrecordda_ic_payroll_parent", "anyof", scriptContext.newRecord.id]
					],
					columns: [
						search.createColumn({
							name: "id",
							sort: search.Sort.ASC,
							label: "ID"
						}),
						search.createColumn({
							name: 'custrecord_da_ic_payrun_employee'
						})
						]
			});
			var arr = [];
			var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
			log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
			customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
				log.debug('Emppppid', result.getValue('custrecord_da_ic_payrun_employee'));
				arr.push(result.getValue('custrecord_da_ic_payrun_employee'));
				return true;
			});
			log.debug('arr', arr);
			var empArr = removeDuplicateUsingFilter(arr);

			log.debug('empArr', empArr);


			//getting the total line amount
			var customrecord_da_pay_run_itemsSearchObj = search.create({
				type: "customrecord_da_ic_pay_run_items",
				filters: [
					["custrecordda_ic_payroll_parent", "anyof", scriptContext.newRecord.id]
					],
					columns: [
						search.createColumn({
							name: "custrecord_da_ic_payrun_decducted_amt",
							summary: "SUM",
							label: "Deducted Amount"
						})
						]
			});
			var searchResultCount = customrecord_da_pay_run_itemsSearchObj.runPaged().count;
			log.debug("customrecord_da_pay_run_itemsSearchObj result count", searchResultCount);
			var total = 0;
			customrecord_da_pay_run_itemsSearchObj.run().each(function(result) {
				log.debug(result.getValue({
					name: 'custrecord_da_ic_payrun_decducted_amt',
					summary: search.Summary.SUM
				}));
				total = result.getValue({
					name: 'custrecord_da_ic_payrun_decducted_amt',
					summary: search.Summary.SUM
				});
				return true;
			});
			var payrunSchRecord = record.load({
				type: 'customrecord_da_intercompany_payroll',
				id: scriptContext.newRecord.id,
				isDynamic: true
			});
			payrunSchRecord.setValue('custrecord_da_ic_total_amount', Math.round(total));
			payrunSchRecord.setValue('custrecord_da_ic_employees_array',JSON.stringify(empArr));
			payrunSchRecord.save();			

		}catch(ex){
			log.error(ex.name,ex.message);
		}
	}
	
	function removeDuplicateUsingFilter(arr) {
        var unique_array = arr.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        });
        return unique_array
    }

	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});
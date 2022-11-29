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
			var id = scriptContext.newRecord.id;
            var type = scriptContext.newRecord.type;
				var form = scriptContext.form;
				var button = form.addButton({
					id: 'custpage_job_offer',
					label: 'Job Offer',
                    functionName:"OpenPrint("+id+")"
				});
          var button = form.addButton({
					id: 'custpage_interview_evalution',
					label: 'Interview Evalution',
                    functionName:"OpenPrint1("+id+")"
				});
				
          form.clientScriptModulePath = './DA_CS_Job_Offer.js';

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
			try{
    }
		catch(ex){
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
	function afterSubmit(scriptContext) {
	var id = scriptContext.newRecord.id;
        var customrecord_da_allowance_joSearchObj = search.create({
           type: "customrecord_da_job_offer_allowance",
           filters:
           [
              ["custrecord_da_job_offer_link","anyof",id]
           ],
           columns:
           [

              search.createColumn({name: "custrecord_da_allowance_name", label: "Allowance Name"}),
              search.createColumn({name: "custrecord_da_allowance_amount", label: "Amount"}),
              search.createColumn({
                 name: "custrecord_da_payrol_item_category",
                 join: "custrecord_da_allowance_name",
                 label: "Item Category"
              })
           ]
        });
        var searchResultCount = customrecord_da_allowance_joSearchObj.runPaged().count;
        log.debug("customrecord_da_allowance_joSearchObj result count",searchResultCount);
      
      var housingAlloAmount = 0;
      var transportAmount = 0;
      var total = 0;
        customrecord_da_allowance_joSearchObj.run().each(function(result){
			var payrollItemactegoryId = result.getValue({
              name :'custrecord_da_payrol_item_category',
              join :'custrecord_da_allowance_name'
            });
          var amount = result.getValue('custrecord_da_allowance_amount');
          
          if(payrollItemactegoryId == 28){
            housingAlloAmount = amount;
          }
          total = parseFloat(total) + parseFloat(amount);
          
          if(payrollItemactegoryId == 40){
            transportAmount = amount;
          }
          log.debug('transportAmount',transportAmount);
          
           return true;
        });
      
      var basic = scriptContext.newRecord.getValue('custrecord_da_cand_basic_salary');
      
      total = parseFloat(total) + parseFloat(basic);
      
      record.load({
        type :scriptContext.newRecord.type,
        id : scriptContext.newRecord.id
      }).setValue('custrecord_da_housing_allowance', housingAlloAmount).setValue('custrecord_da_transport_allowance', transportAmount).setValue('custrecord_da_total_amt',total).save();
		

		}
	

	return {
		beforeLoad: beforeLoad,
		//beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});
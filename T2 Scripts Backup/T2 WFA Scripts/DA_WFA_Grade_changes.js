/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search','N/record','N/task','N/format'],

		function(search,record, task, format) {

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
			var employee =  scriptContext.newRecord.getValue('custrecord_grade_change_employee');
			var newSalary  = scriptContext.newRecord.getValue('custrecord_grade_change_new_basic_salary');
			
			var newGrade =  scriptContext.newRecord.getValue('custrecord_emp_new_grade');

			var effectiveDate = scriptContext.newRecord.getValue('custrecord_da_grade_effective_date');

			var yesterday = new Date(effectiveDate)
			yesterday.setDate(yesterday.getDate() - 1);


			var customrecord_da_emp_earningsSearchObj = search.create({
			   type: "customrecord_da_emp_earnings",
			   filters:
			   [
			      ["custrecord_da_earnings_employee","anyof",employee], 
			      "AND", 
			      ["custrecord_da_eearning_end_date","isempty",""]
			   ],
			   columns:
			   [
			      'internalid'
			   ]
			});
			var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
			log.debug("customrecord_da_emp_earningsSearchObj result count",searchResultCount);
			customrecord_da_emp_earningsSearchObj.run().each(function(result){
			   record.submitFields({
						type:'customrecord_da_emp_earnings',
						id:result.id,
						values:{
							'custrecord_da_eearning_end_date': yesterday
						},
                        options:{
                          'enableSourcing':false,
                          'ignoreMandatoryFields':true
                        }
				})
			   return true;
			});

			
			var empRecord = record.load({
				type:'employee',
				id: employee
			});
			empRecord.setValue('custentity_da_emp_basic_salary',newSalary);
			empRecord.setValue('custentity_da_employee_grade',newGrade);
			empRecord.save();
			
			var sublistCount = scriptContext.newRecord.getLineCount({
				sublistId:'recmachcustrecord_grade_change_parent'
			});
            log.debug('sublistCount',sublistCount);
          if(sublistCount > 0){
            for(var i = 0; i < sublistCount; i++){
				var allowancesId = scriptContext.newRecord.getSublistValue({
					sublistId: 'recmachcustrecord_grade_change_parent',
					fieldId: 'custrecord_org_allowances_id',
                    line:i
				});
				log.debug('allowancesId',allowancesId);
				if(allowancesId){
					var newIncrementAmount = scriptContext.newRecord.getSublistValue({
						sublistId: 'recmachcustrecord_grade_change_parent',
						fieldId: 'custrecord_allow_increment_amount',
                        line:i
					});
                    log.debug('newIncrementAmount',newIncrementAmount);
					record.submitFields({
						type:'customrecord_da_emp_earnings',
						id:allowancesId,
						values:{
							'custrecord_da_earnings_amount': newIncrementAmount
						},
                        options:{
                          'enableSourcing':false,
                          'ignoreMandatoryFields':true
                        }
					})
				}else{
					
					var payrollItem = scriptContext.newRecord.getSublistValue({
						sublistId: 'recmachcustrecord_grade_change_parent',
						fieldId: 'custrecord_allow_inc_payroll_item',
                        line:i
					});
					var newIncrementAmount = scriptContext.newRecord.getSublistValue({
						sublistId: 'recmachcustrecord_grade_change_parent',
						fieldId: 'custrecord_allow_increment_amount',
                        line:i
					});
					var earningRec = record.create({
						type:'customrecord_da_emp_earnings'
					});
					earningRec.setValue('custrecord_da_earnings_employee',employee);
					earningRec.setValue('custrecord_da_earining_start_date',effectiveDate);
					earningRec.setValue('custrecord_da_earnings_payroll_item',payrollItem);
					earningRec.setValue('custrecord_da_earnings_amount',newIncrementAmount);
					earningRec.save();					
				}
			}
          }
			
			
          
           var mrTask = task.create({
				taskType: task.TaskType.MAP_REDUCE,
				scriptId: 'customscript_da_mr_flight_ticket_calcula',
				deploymentId: 'customdeploy_da_mr_flight_ticket_calcula',
                params:{
                  'custscript_flight_ticket_emp_id': employee
                }
			}).submit();
			
			//scriptContext.newRecord.setValue('custrecord_sal_inc_approval_status',2);
			
		}catch(ex){
			log.error(ex.name,ex.message);
		}

	}

	return {
		onAction : onAction
	};

});
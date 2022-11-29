/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search','N/record'],

		function(search,record) {

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
			var employee =  scriptContext.newRecord.getValue('custrecord_da_sal_inc_employee');
			var newSalary  = scriptContext.newRecord.getValue('custrecord_new_basic_salary');
            var newDepartment = scriptContext.newRecord.getValue('custrecord_da_emp_new_department');
            var newjobTitle = scriptContext.newRecord.getValue('custrecord_new_emp_job_title');
            var newGrade = scriptContext.newRecord.getValue('custrecord_da_emp_new_grade');
            var newSupervisor = scriptContext.newRecord.getValue('custrecord_da_employee_new_supervisor');
          
			var empRecord = record.load({
				type:'employee',
				id: employee
			});
			empRecord.setValue('custentity_da_emp_basic_salary',newSalary);
            empRecord.setValue('supervisor',newSupervisor);
            empRecord.setValue('custentity_da_employee_grade',newGrade);
            empRecord.setValue('custentity_da_emp_job_title',newjobTitle);
            empRecord.setValue('department',newDepartment);
			empRecord.save();
			
			var sublistCount = scriptContext.newRecord.getLineCount({
				sublistId:'recmachcustrecord_salary_increment_parent'
			});
         log.debug('employee',employee);
          
          if(sublistCount > 0){
            for(var i = 0; i < sublistCount; i++){
				var allowancesId = scriptContext.newRecord.getSublistValue({
					sublistId: 'recmachcustrecord_salary_increment_parent',
					fieldId: 'custrecord_org_allowances_id',
                    line:i
				});
				log.debug('allowancesId',allowancesId);
				if(allowancesId){
					var newIncrementAmount = scriptContext.newRecord.getSublistValue({
						sublistId: 'recmachcustrecord_salary_increment_parent',
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
						sublistId: 'recmachcustrecord_salary_increment_parent',
						fieldId: 'custrecord_allow_inc_payroll_item',
                        line:i
					});
					var newIncrementAmount = scriptContext.newRecord.getSublistValue({
						sublistId: 'recmachcustrecord_salary_increment_parent',
						fieldId: 'custrecord_allow_increment_amount',
                        line:i
					});
					var earningRec = record.create({
						type:'customrecord_da_emp_earnings'
					});
					earningRec.setValue('custrecord_da_earnings_employee',employee);
					earningRec.setValue('custrecord_da_earnings_payroll_item',payrollItem);
					earningRec.setValue('custrecord_da_earnings_amount',newIncrementAmount);
					earningRec.save();					
				}
			}
          }
			
			
			
			scriptContext.newRecord.setValue('custrecord_sal_inc_approval_status',2);
			
		}catch(ex){
			log.error(ex.name,ex.message);
		}

	}

	return {
		onAction : onAction
	};

});
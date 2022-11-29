/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task','N/search','N/record'],

		function(task,search,record) {

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

			var recId = scriptContext.newRecord.id;
			var approvalStatus = scriptContext.newRecord.getValue('custrecord_da_leave_aproval_status');
			
			var leaveDays = scriptContext.newRecord.getValue('custrecord_da_leave_days');
			
			var supervisorId = scriptContext.newRecord.getValue('custrecord_da_leave_supervisor');
          
          log.debug('supervisorId',supervisorId);


			var employeeId = scriptContext.newRecord.getValue('custrecord_da_leave_employee');


			var customrecord_emp_leave_balanceSearchObj = search.create({
				type: "customrecord_emp_leave_balance",
				filters:
					[
						["custrecord_employee_id","anyof",employeeId]
						],
						columns:
							[
								search.createColumn({name: "custrecord_employee_id", label: "Employee"}),
								search.createColumn({name: "custrecord_emp_leave_balance", label: "Leave Balance"})
								]
			});
			var searchResultCount = customrecord_emp_leave_balanceSearchObj.runPaged().count;
			if(searchResultCount > 0){
				customrecord_emp_leave_balanceSearchObj.run().each(function(result){
						if(approvalStatus == 1 && supervisorId != "") {
							var leaveBalance = result.getValue('custrecord_emp_leave_balance');
							var total  = parseFloat(leaveBalance) - parseFloat(leaveDays);
							record.load({
								type:'customrecord_emp_leave_balance',
								id:result.id
							}).setValue("custrecord_emp_leave_balance",total).save();
						}
						
						if(approvalStatus == 4 && supervisorId == "") {
							var leaveBalance = result.getValue('custrecord_emp_leave_balance');
							var total  = parseFloat(leaveBalance) - parseFloat(leaveDays);
							record.load({
								type:'customrecord_emp_leave_balance',
								id:result.id
							}).setValue("custrecord_emp_leave_balance",total).save();
						}
						
						if(approvalStatus == 5 || approvalStatus == 3){
							var leaveBalance = result.getValue('custrecord_emp_leave_balance');
							var total  = parseFloat(leaveBalance) + parseFloat(leaveDays);
							record.load({
								type:'customrecord_emp_leave_balance',
								id:result.id
							}).setValue("custrecord_emp_leave_balance",total).save();
						}
				});
			}


		}catch(ex){

			log.error(ex.name,ex.message);
		}
	}

	return {
		onAction : onAction
	};

});

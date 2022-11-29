/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task'],

		function(task) {

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
          
          var type = scriptContext.newRecord.getValue('custrecord_da_attendance_type');
          
          if(type == 1){
            var mrTask = task.create({
				taskType: task.TaskType.MAP_REDUCE,
				scriptId: 'customscript_da_mr_att_time_sheet_create',
				deploymentId: 'customdeploy_da_mr_att_time_sheet_create',
				params: {'custscript_da_attaendance_id': recId}
			}).submit();
          }

			

		}catch(ex){

			log.error(ex.name,ex.message);
		}
	}

	return {
		onAction : onAction
	};

});

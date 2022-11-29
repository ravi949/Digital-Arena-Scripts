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
		

			var postingPeriod = scriptContext.newRecord.getText('custrecord_da_sch_pay_run_period');
			log.debug('postingPeriod',postingPeriod);
			var userId = scriptContext.newRecord.getValue('custrecord_da_sch_createdby');
			var recId = scriptContext.newRecord.id;
			if(scriptContext.newRecord.getValue('custrecord_da_sch_payrun_processing')){
              
              try{ 
				var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_payrun_scheduling',
					deploymentId: 'customdeploy_da_mr_payrun_scheduling',
					params: {'custscript_da_mr_posting_period': postingPeriod,'custscript_da_mr_userid':userId,'custscript_da_sch_pay_run_recid':recId}
				}).submit();
               log.debug('mrTask',mrTask);
                }catch(ex){

                    log.error(ex.name,ex.message);
                    if(ex.name == "MAP_REDUCE_ALREADY_RUNNING"){
            try{
               var mrTask = task.create({
          taskType: task.TaskType.MAP_REDUCE,
          scriptId: 'customscript_da_mr_payrun_scheduling',
          deploymentId: 'customdeploy_da_mr_payrun_scheduling_1',
          params: {'custscript_da_mr_posting_period': postingPeriod,'custscript_da_mr_userid':userId,'custscript_da_sch_pay_run_recid':recId}
        }).submit();
               log.debug('mrTask',mrTask);
            }catch(ex){
              log.error(ex.name,ex.message);
               if(ex.name == "MAP_REDUCE_ALREADY_RUNNING"){
                  var mrTask = task.create({
          taskType: task.TaskType.MAP_REDUCE,
          scriptId: 'customscript_da_mr_payrun_scheduling',
          deploymentId: 'customdeploy_da_mr_payrun_scheduling_2',
          params: {'custscript_da_mr_posting_period': postingPeriod,'custscript_da_mr_userid':userId,'custscript_da_sch_pay_run_recid':recId}
        }).submit();
               log.debug('mrTask',mrTask);
               }
            }
           
          }
                }
			}else{              
            try{
              log.debug('approved');
				var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_create_paycheck_journ',
					deploymentId: 'customdeploy_da_mr_create_paycheck_journ',
					params: {'custscript_da_sch_payrun_recid':recId}
				}).submit();
            }catch(ex){
              log.error(ex.name,ex.message);
               if(ex.name == "MAP_REDUCE_ALREADY_RUNNING"){
                 try{
                   var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_create_paycheck_journ',
					deploymentId: 'customdeploy_da_mr_create_paycheck_jou_1',
					params: {'custscript_da_sch_payrun_recid':recId}
				}).submit();
               log.debug('mrTask',mrTask);
                 }catch(ex){
                     if(ex.name == "MAP_REDUCE_ALREADY_RUNNING"){
                        var mrTask = task.create({
					taskType: task.TaskType.MAP_REDUCE,
					scriptId: 'customscript_da_mr_create_paycheck_journ',
					deploymentId: 'customdeploy_da_mr_create_paycheck_jou_2',
					params: {'custscript_da_sch_payrun_recid':recId}
				}).submit();
               log.debug('mrTask',mrTask);
                     }
                 }
                 
               }
            }
           
          }
		
	}

	return {
		onAction : onAction
	};

});

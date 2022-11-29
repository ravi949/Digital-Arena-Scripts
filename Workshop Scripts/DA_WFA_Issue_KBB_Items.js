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
          var appleSalesOrder = scriptContext.newRecord.getValue('custrecord_da_issue_kbb_apple_invoice');
          var laborCostSalesOrder = scriptContext.newRecord.getValue('custrecord_da_kbb_labor_cost_invoice');

            var mrTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_da_mr_job_kbb_receiving',
                deploymentId: 'customdeploy_da_mr_job_kbb_receiving',
                params: {'custscript_receive_record_id':recId,'custscript_da_apple_sales_order':appleSalesOrder,'custscript_da_labor_cost_sales_order':laborCostSalesOrder,'custscript_da_script_kbb_issuing': true}
            }).submit();

        }catch(ex){

            log.error(ex.name,ex.message);
        }
    }

    return {
        onAction : onAction
    };

});
/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task', 'N/search', 'N/record'],

    function(task, search, record) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
                var recType = scriptContext.newRecord.type;
                log.debug('recType', recType);
                var recId = scriptContext.newRecord.id;
                log.debug('recId', recId);

                var lineCount = scriptContext.newRecord.getLineCount('item');
                log.debug('lineCount',lineCount);
                for(var i = 0; i < lineCount; i++){
                    var quantity = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });
                    log.debug('quantity',quantity);
                    var availQty = scriptContext.newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantityavailable',
                        line: i
                    });
                    log.debug('availQty',availQty);
                    if(quantity > availQty){
                        quantity = parseFloat(quantity) - parseFloat(availQty);
                        log.debug('quantity',quantity);
                       scriptContext.newRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'backordered',
                        line: i,
                        value: quantity
                    }); 
                    }
                }
                    var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_da_mr_create_work_order_pr',
                        deploymentId: 'customdeploy_da_mr_create_work_order_pro',
                        params: {
                            'custscript_da_record_type': recType,
                            'custscript_da_record_id': recId
                        }
                    }).submit();
                    log.debug('mrTask', mrTask);
            } catch (ex) {

                log.error(ex.name, ex.message);
            }
        }

        return {
            onAction: onAction
        };
    });
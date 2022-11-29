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
            log.debug('recId',recId);
         var lineCount = scriptContext.newRecord.getLineCount({
                            sublistId:'recmachcustrecord_da_allocated_lcm_onbill'
                        });
            log.debug('lineCount',lineCount);
            for(var i = 0; i < lineCount; i++){
                var lcmAllocIR = scriptContext.newRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                    fieldId: 'custrecord_da_lcm_allocate_ir',
                    line: i
                });
                log.debug('lcmAllocIR',lcmAllocIR);
                var lcmAllocLandedCost = scriptContext.newRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                    fieldId: 'custrecord_da_landed_cost_lcm',
                    line: i
                });
                log.debug('lcmAllocLandedCost',lcmAllocLandedCost);
                var amountAfterPercent = scriptContext.newRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                    fieldId: 'custrecord_da_amount_percent',
                    line: i
                });
                log.debug('amountAfterPercent',amountAfterPercent);
                var lcmAllocated = scriptContext.newRecord.getSublistValue({
                    sublistId: 'recmachcustrecord_da_allocated_lcm_onbill',
                    fieldId: 'custrecord_da_lcm_allocate',
                    line: i
                });
                log.debug('lcmAllocated',lcmAllocated);
                
                if(lcmAllocIR && lcmAllocated){
                var irRecord = record.load({
                    type: 'itemreceipt',
                    id: lcmAllocIR,
                    isDynamic: true
                });
                irRecord.setValue('custbody_da_lcm_status',"2");
                irRecord.setValue('landedcostmethod',"VALUE");
                irRecord.setValue('landedcostsource' + lcmAllocLandedCost,"MANUAL");
                irRecord.setValue('landedcostamount' + lcmAllocLandedCost,amountAfterPercent);
                    
                var irRec = irRecord.save();
                }
                
            }
                //log.debug('irRec',irRec);
        }catch(ex){

            log.error(ex.name,ex.message);
        }
    }

    return {
        onAction : onAction
    };
});
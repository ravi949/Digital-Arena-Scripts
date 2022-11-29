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

            var quotationRec = scriptContext.newRecord.getValue('custrecord_da_job_card_quotation');

             var salesOrderRec = record.transform({
                fromType: record.Type.ESTIMATE,
                fromId: quotationRec,
                toType: record.Type.SALES_ORDER
            });
          salesOrderRec.setValue('orderstatus', "B");

             salesOrderRec.save();


        }catch(ex){

            log.error(ex.name,ex.message);
        }
    }

    return {
        onAction : onAction
    };

});
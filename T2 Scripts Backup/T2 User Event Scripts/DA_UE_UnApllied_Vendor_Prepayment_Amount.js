/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/ui/serverWidget','N/record'],

        function(search,serverWidget,record) {

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
        log.debug('beforeSubmit','beforeSubmit');

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
        try{
          
          var exchangeRate = scriptContext.newRecord.getValue('exchangerate');
          exchangeRate = exchangeRate.toFixed(2);

            var vendorPrepaymentRecId = scriptContext.newRecord.getValue('vendorprepayment');
            log.debug('vendorPrepaymentRecId', vendorPrepaymentRecId);

            var prepaymentRec = record.load({
              type :'vendorprepayment',
              id: vendorPrepaymentRecId
            })
            var prepaymentAmount = prepaymentRec.getValue('payment');

            var totalAmount= 0;

            var vendorprepaymentapplicationSearchObj = search.create({
             type: "vendorprepaymentapplication",
             filters:
             [
                ["type","anyof","VPrepApp"], 
                "AND", 
                ["appliedtotransaction","anyof",vendorPrepaymentRecId]
             ],
             columns:
             [
                search.createColumn({name: "amount", label: "Amount"}) ,
               search.createColumn({name: "fxamount", label: "Amount (Foreign Currency)"}),
             ]
          });
          var searchResultCount = vendorprepaymentapplicationSearchObj.runPaged().count;
          log.debug("vendorprepaymentapplicationSearchObj result count",searchResultCount);
          vendorprepaymentapplicationSearchObj.run().each(function(result){
            var amount = -(result.getValue('fxamount'));
            totalAmount = parseFloat(totalAmount) + parseFloat(amount);
             // .run().each has a limit of 4,000 results
             return true;
          });

            log.debug('totalAmount', totalAmount);
          
        // totalAmount =  (totalAmount/exchangeRate).toFixed(2)

            var remainingAmount = parseFloat(prepaymentAmount) - parseFloat(totalAmount);

            prepaymentRec.setValue('custbody_da_vp_unapplied_amount', (remainingAmount));
            prepaymentRec.save();

            
        }catch(ex){
            log.error(ex.name,ex.message);
        }
    }

    return {
        beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };

});
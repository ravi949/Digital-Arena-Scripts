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

            if(scriptContext.type == "create"){

                var custPayment = scriptContext.newRecord.getValue('custbody_da_created_from_cust_pay');
                

                var custPaymentRec = record.load({
                    type:'customerpayment',
                    id : custPayment
                });

                var pdcRecord = custPaymentRec.getValue('custbody_da_created_from');

                var paymentAmount = custPaymentRec.getValue('payment');

                if(pdcRecord){
                     var pdcRec = record.load({
                        type :'customtransaction_da_post_dated_check',
                        id : pdcRecord
                    });

                    var remaining = pdcRec.getValue('custbody_da_remaining_amount_to_encash');
                    remaining = parseFloat(remaining) + parseFloat(paymentAmount);
                  log.debug(remaining);

                    var chequeAmount = pdcRec.getValue('custbody_da_cheque_amount');

                    if(chequeAmount == remaining){
                        pdcRec.setValue('custbody_da_cheque_status', 1);
                    }else{
                        pdcRec.setValue('custbody_da_cheque_status', 2);
                    }
                    pdcRec.setValue('custbody_da_remaining_amount_to_encash', remaining);
                    pdcRec.save();
                }

                custPaymentRec.setValue('custbody_da_cus_pay_status', 2);
                custPaymentRec.save();

            }

            if(scriptContext.type == "delete"){
                var custPayment = scriptContext.newRecord.getValue('custbody_da_created_from_cust_pay');
                

                var custPaymentRec = record.load({
                    type:'customerpayment',
                    id : custPayment
                });

                var pdcRecord = custPaymentRec.getValue('custbody_da_created_from');

                var paymentAmount = custPaymentRec.getValue('payment');

                if(pdcRecord){
                     var pdcRec = record.load({
                        type :'customtransaction_da_post_dated_check',
                        id : pdcRecord
                    });

                    var remaining = pdcRec.getValue('custbody_da_remaining_amount_to_encash');
                    remaining = parseFloat(remaining) - parseFloat(paymentAmount);

                    var chequeAmount = pdcRec.getValue('custbody_da_cheque_amount');

                    if(chequeAmount == remaining){
                        pdcRec.setValue('custbody_da_cheque_status', 1);
                    }else{
                        pdcRec.setValue('custbody_da_cheque_status', 2);
                    }
                    pdcRec.setValue('custbody_da_remaining_amount_to_encash', remaining);
                    pdcRec.save();
                }

                custPaymentRec.setValue('custbody_da_cus_pay_status', 1);
                custPaymentRec.save();

            }

                


        }catch(ex){
            log.error(ex.name,ex.message);
        }
    }

    return {
        //beforeLoad: beforeLoad,
        //beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };

});
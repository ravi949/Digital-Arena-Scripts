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

            if(scriptContext.type == "delete"){
                var createdFrom = scriptContext.newRecord.getValue('custbody_da_created_from');
                if(createdFrom){
                    var amount = scriptContext.newRecord.getValue('payment');
                    var pdcRec = record.load({
                        type :'customtransaction_da_post_dated_check',
                        id : createdFrom
                    });

                    var remaining = pdcRec.getValue('custbody_da_remaining_amount_to_encash');
                    remaining = parseFloat(remaining) + parseFloat(amount);

                    var chequeAmount = pdcRec.getValue('custbody_da_cheque_amount');

                    if(chequeAmount == remaining){
                        pdcRec.setValue('custbody_da_cheque_status', 1);
                    }else{
                        pdcRec.setValue('custbody_da_cheque_status', 2);
                    }
                    pdcRec.setValue('custbody_da_remaining_amount_to_encash', remaining);
                    pdcRec.save();
                }
            }

                var createdFrom = scriptContext.newRecord.getValue('custbody_da_created_from');

                if(createdFrom){
                    var checkAmount = scriptContext.newRecord.getValue('custbody_da_cheque_amount');

                    var customerpaymentSearchObj = search.create({
                       type: "customerpayment",
                       filters:
                       [
                          ["type","anyof","CustPymt"], 
                          "AND", 
                          ["custbody_da_created_from","anyof",createdFrom], 
                          "AND", 
                          ["mainline","is","T"]
                       ],
                       columns:
                       [
                          search.createColumn({
                             name: "amount",
                             summary: "SUM",
                             label: "Amount"
                          })
                       ]
                    });
                    var searchResultCount = customerpaymentSearchObj.runPaged().count;
                    log.debug("customerpaymentSearchObj result count",searchResultCount);

                    var total = 0;
                    customerpaymentSearchObj.run().each(function(result){
                       total = result.getValue({
                         name : 'amount',
                         summary : search.Summary.SUM
                       });
                       return true;
                    });

                    if(total > 0){
                        var remainingAmount = parseFloat(checkAmount) - parseFloat(total);
                      
                      if(remainingAmount == 0){
                        record.submitFields({
                            type : 'customtransaction_da_post_dated_check',
                            id : createdFrom,
                            values : {
                                'custbody_da_remaining_amount_to_encash' : remainingAmount,
                                'custbody_da_cheque_status': 3
                            },
                            enableSourcing : false,
                            ignoreMandatoryFileds : true
                        });
                      }else{
                        record.submitFields({
                            type : 'customtransaction_da_post_dated_check',
                            id : createdFrom,
                            values : {
                                'custbody_da_remaining_amount_to_encash' : remainingAmount,
                                'custbody_da_cheque_status': 2
                            },
                            enableSourcing : false,
                            ignoreMandatoryFileds : true
                        });
                      }
                        
                    }
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
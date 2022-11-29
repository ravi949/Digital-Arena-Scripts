/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search','N/record','N/task','N/format'],

        function(search,record, task, format) {

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

          var employeeId = scriptContext.newRecord.getValue('custrecord_da_hold_loan_employee');

          var periodId = scriptContext.newRecord.getValue('custrecord_da_loan_period');


          var customrecord_da_hr_loan_installmentSearchObj = search.create({
             type: "customrecord_da_hr_loan_installment",
             filters:
             [
                ["custrecord_da_hr_loan_id.custrecord_da_employee_loan","anyof",employeeId], 
                "AND", 
                ["custrecord_da_posting_period1","anyof",periodId]
             ],
             columns:
             [
                search.createColumn({
                   name: "id",
                   sort: search.Sort.ASC,
                   label: "ID"
                }),
                search.createColumn({name: "scriptid", label: "Script ID"}),
                search.createColumn({name: "custrecord_da_loan_sequence", label: "Sequence"}),
                search.createColumn({name: "custrecord_da_installment_date", label: "Installment Date "}),
                search.createColumn({name: "custrecord_da_installment_amount_hr", label: "Installment Amount"}),
                search.createColumn({name: "custrecord_da_hr_hold_loan", label: "Hold Loan"}),
                search.createColumn({name: "custrecord_da_hr_loan_paid", label: "Paid"}),
                search.createColumn({name: "custrecord_da_posting_period1", label: "Posting Period"}),
                search.createColumn({
                   name: "custrecord_da_payroll_item_loan",
                   join: "CUSTRECORD_DA_HR_LOAN_ID",
                   label: "Payroll Item"
                })
             ]
          });
          var searchResultCount = customrecord_da_hr_loan_installmentSearchObj.runPaged().count;
          log.debug("customrecord_da_hr_loan_installmentSearchObj result count",searchResultCount);
          customrecord_da_hr_loan_installmentSearchObj.run().each(function(result){
             record.submitFields({
               type :'customrecord_da_hr_loan_installment',
               id : result.id,
               values :{
                'custrecord_da_hr_hold_loan': true
               }
             })
             return true;
          });


            
        }catch(ex){
            log.error(ex.name,ex.message);
        }

    }

    return {
        onAction : onAction
    };

});
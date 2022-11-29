/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search','N/record'],

        function(search,record) {

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
        


      var periodsLength = scriptContext.newRecord.getValue('custrecord_da_update_previous_periods');
            log.debug('periodsLength', periodsLength.length);
          var len = periodsLength.length;
         

            var lc = scriptContext.newRecord.getLineCount({
                sublistId :'recmachcustrecord_salary_increment_parent'
            });

            var employeeId = scriptContext.newRecord.getValue('custrecord_da_sal_inc_employee');

            var postingPeriodId = scriptContext.newRecord.getValue('custrecord_da_payroll_effective_period');

            var rec = scriptContext.newRecord;

            for(var i = 0 ; i < lc ; i++){
                var incAmount = rec.getSublistValue({
                    sublistId :'recmachcustrecord_salary_increment_parent',
                    fieldId :'custrecord_allow_increment_amount',
                    line : i
                });

                var currentAmount = rec.getSublistValue({
                    sublistId :'recmachcustrecord_salary_increment_parent',
                    fieldId :'custrecord_all_inc_current_amount',
                    line : i
                });
                log.debug('currentAmount', currentAmount);

                var payrollItemId = rec.getSublistValue({
                    sublistId :'recmachcustrecord_salary_increment_parent',
                    fieldId :'custrecord_allow_inc_payroll_item',
                    line : i
                });

                var allowId =  rec.getSublistValue({
                    sublistId :'recmachcustrecord_salary_increment_parent',
                    fieldId :'custrecord_org_allowances_id',
                    line : i
                });

                if(allowId){
                    var value = parseFloat(incAmount) - parseFloat(currentAmount);
                }else{
                    var value = incAmount;
                }
                var addRec = record.create({
                    type :'customrecord_monthly_add_and_deductions'
                });
                addRec.setValue('custrecord_da_addition_employee', employeeId);
                addRec.setValue('custrecord_da_add_or_ded_type', 1);
                addRec.setValue('custrecord_da_addition_type', payrollItemId);
                addRec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
              addRec.setValue('custrecord_da_created_from_promotion', true);
                addRec.setValue('custrecord_da_additional_amount', (value * len).toFixed(2));
                var id = addRec.save();
                log.debug('id', id);
            }

            var currentBasicSalary = scriptContext.newRecord.getValue('custrecord_emp_previous_salary');
            var incrementBasicSalalry = scriptContext.newRecord.getValue('custrecord_new_basic_salary');

            if(incrementBasicSalalry > currentBasicSalary){

                var customrecord_da_payroll_itemsSearchObj = search.create({
                   type: "customrecord_da_payroll_items",
                   filters:
                   [
                      ["custrecord_da_payroll_item_subsidiary","anyof",scriptContext.newRecord.getValue('custrecord_employee_subsidiary')], 
                      "AND", 
                      ["custrecord_da_payrol_item_category","anyof","1"]
                   ],
                   columns:
                   [
                      search.createColumn({
                         name: "name",
                         sort: search.Sort.ASC,
                         label: "Name"
                      }),
                      search.createColumn({name: "scriptid", label: "Script ID"}),
                      search.createColumn({name: "custrecord_da_payroll_item_subsidiary", label: "Subsidiary"}),
                      search.createColumn({name: "custrecord_da_main_item_type", label: "Item Type"}),
                      search.createColumn({name: "custrecord_da_payroll_sub_item", label: "Sub Item"}),
                      search.createColumn({name: "custrecord_da_payroll_recurring", label: "Recurring Element?"}),
                      search.createColumn({name: "custrecord_da_standarad_payroll_item_id", label: "Standarad payroll Item ID"}),
                      search.createColumn({name: "custrecord_da_item_expense_account", label: "Account"})
                   ]
                });
                var searchResultCount = customrecord_da_payroll_itemsSearchObj.runPaged().count;
                log.debug("customrecord_da_payroll_itemsSearchObj result count",searchResultCount);
                customrecord_da_payroll_itemsSearchObj.run().each(function(result){
                    var value = parseFloat(incrementBasicSalalry) - parseFloat(currentBasicSalary);
                    var addRec = record.create({
                        type :'customrecord_monthly_add_and_deductions'
                    });
                    addRec.setValue('custrecord_da_addition_employee', employeeId);
                    addRec.setValue('custrecord_da_add_or_ded_type', 1);
                    addRec.setValue('custrecord_da_addition_type', result.id);
                    addRec.setValue('custrecord_da_addition_posting_period', postingPeriodId);
                    addRec.setValue('custrecord_da_additional_amount', (value * len).toFixed(2));
                   addRec.setValue('custrecord_da_created_from_promotion', true);
                    addRec.save();
                });
            }
           scriptContext.newRecord.setValue('custrecord_da_promotion_updated', true);
            
        }catch(ex){
            log.error(ex.name,ex.message);
        }

    }

    return {
        onAction : onAction
    };

});
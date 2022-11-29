/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/record','N/search'],

function(record, search) {
   
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

            var currentBasicSalary = scriptContext.newRecord.getValue('custrecord_emp_previous_salary');
            var newBasicSalalry = scriptContext.newRecord.getValue('custrecord_new_basic_salary');

            var empId = scriptContext.newRecord.getValue('custrecord_da_sal_inc_employee');


            var promotionRec = record.load({
                type :scriptContext.newRecord.type,
                id : scriptContext.newRecord.id,
                isDynamic : true
            })

            if(newBasicSalalry > currentBasicSalary){
                var customrecord_da_payroll_itemsSearchObj = search.create({
                   type: "customrecord_da_payroll_items",
                   filters:
                   [
                      ["custrecord_da_payrol_item_category","anyof","28","40"], 
                      "AND", 
                      ["custrecord_da_payroll_recurring","is","T"]
                   ],
                   columns:
                   [
                      search.createColumn({name: "internalid", label: "Internal ID"}),
                      search.createColumn({name: "custrecord_da_payrol_item_category", label: "custrecord_da_payrol_item_category"})
                   ]
                });
                var searchResultCount = customrecord_da_payroll_itemsSearchObj.runPaged().count;
                log.debug("customrecord_da_payroll_itemsSearchObj result count",searchResultCount);
                customrecord_da_payroll_itemsSearchObj.run().each(function(result){

                  var itemCategory = result.getValue('custrecord_da_payrol_item_category');
                  var customrecord_da_emp_earningsSearchObj = search.create({
                       type: "customrecord_da_emp_earnings",
                       filters:
                       [
                          ["custrecord_da_earnings_employee","anyof",empId], 
                          "AND", 
                          ["custrecord_da_earnings_payroll_item","anyof",result.id]
                       ],
                       columns:
                       [
                          search.createColumn({name: "custrecord_da_earnings_employee", label: "Employee"}),
                          search.createColumn({name: "custrecord_da_earnings_payroll_item", label: "Payroll Item"}),
                          search.createColumn({name: "custrecord_da_earnings_amount", label: "Amount"})
                       ]
                    });
                    var searchResultCount = customrecord_da_emp_earningsSearchObj.runPaged().count;
                    log.debug("customrecord_da_emp_earningsSearchObj result count",searchResultCount);

                    if(searchResultCount > 0){
                        customrecord_da_emp_earningsSearchObj.run().each(function(result){
                           promotionRec.selectNewLine({
                             sublistId :'recmachcustrecord_salary_increment_parent'
                           });
                           promotionRec.setCurrentSublistValue({
                             sublistId :'recmachcustrecord_salary_increment_parent',
                             fieldId : 'custrecord_allow_inc_payroll_item',
                             value : result.getValue('custrecord_da_earnings_payroll_item')
                           });
                           promotionRec.setCurrentSublistValue({
                             sublistId :'recmachcustrecord_salary_increment_parent',
                             fieldId : 'custrecord_all_inc_current_amount',
                             value : result.getValue('custrecord_da_earnings_amount')
                           });
                           promotionRec.setCurrentSublistValue({
                             sublistId :'recmachcustrecord_salary_increment_parent',
                             fieldId : 'custrecord_org_allowances_id',
                             value : result.id
                           });

                           if(itemCategory== 28){
                            var value = Number(((25/100)* newBasicSalalry)).toFixed(2);
                           }else{
                            var value = Number(((10/100)* newBasicSalalry)).toFixed(2);
                           }
                           promotionRec.setCurrentSublistValue({
                             sublistId :'recmachcustrecord_salary_increment_parent',
                             fieldId : 'custrecord_allow_increment_amount',
                             value : value
                           });
                           promotionRec.commitLine({
                             sublistId :'recmachcustrecord_salary_increment_parent'
                           });
                           return true;
                        });
                    }else{

                         promotionRec.selectNewLine({
                             sublistId :'recmachcustrecord_salary_increment_parent'
                           });
                           promotionRec.setCurrentSublistValue({
                             sublistId :'recmachcustrecord_salary_increment_parent',
                             fieldId : 'custrecord_allow_inc_payroll_item',
                             value : result.id
                           });                           

                           if(itemCategory== 28){
                            var value = Number(((25/100)* newBasicSalalry)).toFixed(2);
                           }else{
                            var value = Number(((10/100)* newBasicSalalry)).toFixed(2);
                           }
                           promotionRec.setCurrentSublistValue({
                             sublistId :'recmachcustrecord_salary_increment_parent',
                             fieldId : 'custrecord_allow_increment_amount',
                             value : value
                           });
                           promotionRec.commitLine({
                             sublistId :'recmachcustrecord_salary_increment_parent'
                           });

                    }
                    
                   return true;
                });
            }

            promotionRec.save();


        }catch(ex){
            log.error(ex.name,ex.message);
        }

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
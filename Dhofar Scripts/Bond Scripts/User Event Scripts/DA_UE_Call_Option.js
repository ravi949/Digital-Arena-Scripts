/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/record','N/format'],
  function(search, record, format) {
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
      try {
        
      } catch (ex) {
        log.error(ex.name, ex.message);
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
      log.debug('beforeSubmit', 'beforeSubmit');
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
        
        var customrecord_bond_accrued_interest_schedSearchObj = search.create({
   type: "customrecord_bond_accrued_interest_sched",
   filters:
   [
      ["custrecord_da_bond_accrued_call_option","anyof",scriptContext.newRecord.id]
   ],
   columns:
   [
      search.createColumn({
         name: "id",
         sort: search.Sort.ASC,
         label: "ID"
      })
   ]
});
var searchResultCount = customrecord_bond_accrued_interest_schedSearchObj.runPaged().count;
log.debug("customrecord_bond_accrued_interest_schedSearchObj result count",searchResultCount);
customrecord_bond_accrued_interest_schedSearchObj.run().each(function(result){
   record.submitFields({
     type :'customrecord_bond_accrued_interest_sched',
     id : result.id,
     values :{
       'custrecord_da_bond_accrued_call_option':' '
     }
   })
   return true;
});

      
          var date = scriptContext.newRecord.getValue('trandate');

          var bondId = scriptContext.newRecord.getValue('custbody_da_created_from_bond');

          log.debug('date', date);

          var customrecord_bond_accrued_interest_schedSearchObj = search.create({
             type: "customrecord_bond_accrued_interest_sched",
             filters:
             [
                ["custrecord_da_created_from_bond_accr","anyof",bondId]
             ],
             columns:
             [
                search.createColumn({
                   name: "id",
                   sort: search.Sort.ASC,
                   label: "ID"
                }),
                search.createColumn({name: "custrecord_da_bond_accrued_f", label: "From"}),
                search.createColumn({name: "custrecord_da_bond_accrued_to", label: "To"}),
                search.createColumn({name: "custrecord_da_bond_accrued_release_date", label: "Release Date"}),
                search.createColumn({name: "custrecord_da_bond_accrued_bond_amt", label: "Accrued Amount"}),
                search.createColumn({name: "custrecord_da_bond_accrued_trans_no", label: "Transaction#"}),
                search.createColumn({name: "custrecord_da_accured_no_of_days", label: "Number of Days for Calculation"}),
                search.createColumn({name: "custrecord_da_bond_accrued_call_option", label: "Call Option"})
             ]
          });
          var searchResultCount = customrecord_bond_accrued_interest_schedSearchObj.runPaged().count;
          log.debug("customrecord_bond_accrued_interest_schedSearchObj result count",searchResultCount);
          customrecord_bond_accrued_interest_schedSearchObj.run().each(function(result){
             var fromDate = result.getValue('custrecord_da_bond_accrued_f');
             var toDate = result.getValue('custrecord_da_bond_accrued_to');

             fromDate = format.parse({
                  value: fromDate,
                  type: format.Type.DATE
              });
              toDate = format.parse({
                  value: toDate,
                  type: format.Type.DATE
              });             

             if(fromDate <= date && date < toDate){
              log.debug('fromDate', fromDate +"toDate"+ toDate);
              log.debug('true');

              var noOfDays = calculateNoOfDays(date, toDate); 
              log.debug('noOfDays', noOfDays);
               log.debug(result.id);
              record.submitFields({
                type :'customrecord_bond_accrued_interest_sched',
                id : result.id,
                values :{
                  'custrecord_da_bond_accrued_call_option': scriptContext.newRecord.id,
                  'custrecord_da_bond_acc_call_opt_days': noOfDays,
                  'custrecord_da_bond_acc_call_opt_amt': scriptContext.newRecord.getValue('custbody_da_amount_of_bond_redeemed')
                }
              })
             }
             return true;
          });
        

      }catch(ex){
        log.error(ex.name, ex.message);
      }
    }

    function calculateNoOfDays(date1, date2) {
            // The number of milliseconds in one day
            var ONEDAY = 1000 * 60 * 60 * 24;
            // Convert both dates to milliseconds
            var date1_ms = date1.getTime();
            var date2_ms = date2.getTime();
            // Calculate the difference in milliseconds
            var difference_ms = Math.abs(date1_ms - date2_ms);

            // Convert back to days and return
            return Math.round(difference_ms/ONEDAY);
        }
    return {
      beforeLoad: beforeLoad,
      //beforeSubmit: beforeSubmit,
      afterSubmit: afterSubmit
    };
  });
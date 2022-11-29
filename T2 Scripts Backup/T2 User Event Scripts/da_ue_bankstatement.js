/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/format'],

  function(runtime, record, search, format) {
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
      try {
        var internalId = scriptContext.newRecord.id;
        var rType = scriptContext.newRecord.type;
        var bankstate;
       
        var credit_add=0.0;
        
        log.debug('internalId', internalId);
        var customTransSearch = search.create({
          type: 'TRANSACTION',
          columns: ['account','creditamount', 'debitamount', 'custcol_da_dr_3_decimal', 'custcol_da_cr_3_decimal'  ],
          filters: [
            ['internalid', 'anyof', internalId],
            "AND",
            ['AccountType', 'anyof','Bank']
          ]
        });
        customTransSearch.run().each(function(result){
          var bankaccount= result.getValue('account');
          log.debug('bankaccount',bankaccount);
          
          var creditAmount= result.getValue('creditamount');
          log.debug('creditAmount', creditAmount);
          var debitAmount = result.getValue('debitamount');
          log.debug('debitAmount', debitAmount);

          var creditAmount3d = result.getValue('custcol_da_cr_3_decimal');
          log.debug('creditAmount3d', creditAmount3d);
          var debitAmount3d = result.getValue('custcol_da_dr_3_decimal');
          log.debug('debitAmount3d', debitAmount3d);

          var load_so = record.load({
                           type: rType,
                           id: internalId,
                           isDynamic: false,
                       });
               
               bankstate=load_so.setValue(
                 {
                   fieldId:'custbody_dabankstatementamount',
                   value: creditAmount3d,
                 });
               load_so.save();
               log.debug('Bankstatement', bankstate);
          
          return true;
            });
      //  log.debug('creditadd', credit_add);
        
        
    //    return true;
        

      } catch (ex) {
        log.error(ex.name, ex.message);
      }
    }

    return {
      beforeLoad: beforeLoad,
      beforeSubmit: beforeSubmit,
     afterSubmit: afterSubmit
    };
  });

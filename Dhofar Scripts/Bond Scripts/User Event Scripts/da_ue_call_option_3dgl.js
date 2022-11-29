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

           var customrecord_da_gl_data_baseSearchObj = search.create({
           type: "customrecord_da_gl_data_base",
           filters:
           [
              ["custrecord_da_gl_impact_created_from","anyof",scriptContext.newRecord.id]
           ],
           columns:
           ['internalid']
        });
        var searchResultCount = customrecord_da_gl_data_baseSearchObj.runPaged().count;
        log.debug("customrecord_da_gl_data_baseSearchObj result count",searchResultCount);
        customrecord_da_gl_data_baseSearchObj.run().each(function(result){
                      record.delete({
                        type:'customrecord_da_gl_data_base',
                        id : result.id
                      });
                    return true;

                  });

              var internalId = scriptContext.newRecord.id;
              log.debug('internalId',internalId);

              var exchangerate = scriptContext.newRecord.getValue('exchangerate');
              log.debug('exchangerate', exchangerate);
              var subsidiary = scriptContext.newRecord.getValue('subsidiary');
              log.debug('exchangerate', exchangerate);

              var calloption = parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_bond_redee'))*scriptContext.newRecord.getValue('exchangerate')*parseFloat(scriptContext.newRecord.getValue('custbody_da_bond_face_value'));
                  log.debug('calloption',calloption );

                  var Liabaccount = scriptContext.newRecord.getValue('custbody_da__cobond_liability_account');
              		log.debug('Liabaccount',Liabaccount);

                  var Bankaccount = scriptContext.newRecord.getValue('custbody_da_cobond_bank_account');
              		log.debug('Bankaccount',Bankaccount);

                  var calloptionvalue = scriptContext.newRecord.getValue('custbody_da_amount_of_bond_redeemed');

                  if (calloption>0){

                    var trialBalRec = record.create({
                    type: "customrecord_da_gl_data_base",
                    isDynamic: true
                  });
     			       trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                trialBalRec.setValue('custrecord_da_gl_debit',Number(calloption).toFixed(3));
                trialBalRec.setValue('custrecord_da_gl_account',Liabaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();
                    
                    var trialBalRec = record.create({
                    type: "customrecord_da_gl_data_base",
                    isDynamic: true
                  		});
     			              trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);    			    trialBalRec.setValue('custrecord_da_gl_credit',Number(calloption).toFixed(3));
         				       trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                       trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                       var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);

                  }


                      return true;
                          }
                     catch (ex) {
                log.error(ex.name, ex.message);
            }

        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });

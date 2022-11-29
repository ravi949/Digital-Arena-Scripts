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

              var DIVIDamount = parseFloat(scriptContext.newRecord.getValue('custbody_da_dividend_received'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));
              log.debug('DIVIDamount', DIVIDamount);

              var DIVIDARacc = parseFloat(scriptContext.newRecord.getValue('custbody_da_dividend_ar_acc'));
              log.debug('DIVIDARacc', DIVIDARacc);

              var DIVIDEquityChangeacc = parseFloat(scriptContext.newRecord.getValue('custbody_da_changes_in_equity_acc'));
              log.debug('DIVIDEquityChangeacc', DIVIDEquityChangeacc);

              var Investmentcategory = scriptContext.newRecord.getValue('custbody_da_investment_category');
              log.debug('Investmentcategory', Investmentcategory);

              var DIVIDIncomeacc = parseFloat(scriptContext.newRecord.getValue('custbody_da_dividends_income'));
              log.debug('DIVIDIncomeacc', DIVIDIncomeacc);

              var Equitycheck = scriptContext.newRecord.getValue('custbody_da_equity_method');
              log.debug('Equitycheck',Equitycheck);

              var subsidiary = scriptContext.newRecord.getValue('subsidiary');
              log.debug('subsidiary',subsidiary);
              var date1 = scriptContext.newRecord.getValue('trandate');
              log.debug('Date',date1);
              var memo= scriptContext.newRecord.getValue('memo');
              log.debug('Memo',memo);
              var trantype = '176';
              log.debug('Transaction Type',trantype);

              var Fairvaluecheck = scriptContext.newRecord.getValue('custbody_da_fair_value_method');
              log.debug('FairValue',Fairvaluecheck);

                  var customrecord_da_investment_accouning_setSearch = search.create({
                          type: "customrecord_da_investment_accouning_set",
                              filters:
                                [
                                    ["custrecord_da_investment_subsidiary","anyof",subsidiary]
                                ],
                                      columns:
                                    ['internalid','custrecord_da_stock_investment_fee','custrecord_da_dividendd_receivable','custrecord_da_investment_dividend_rev']
                              });

                   /*   customrecord_da_investment_accouning_setSearch.run().each(function(result){
                        var Feesaccount=result.getValue('custrecord_da_stock_investment_fee');
                        var DIVIDREC = result.getValue('customtransaction_da_dividends_receivabl');
                        var DIVIDREV= result.getValue('custrecord_da_investment_dividend_rev');

                      });
                      log.debug('DIVIDREC',DIVIDREC);
                      log.debug('DIVIDREV',DIVIDREV);*/


                if (DIVIDamount > 0 &&  Investmentcategory == 1 && Equitycheck == true) {
                    //log.debug('if 1',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(DIVIDamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',DIVIDARacc);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(DIVIDamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',DIVIDEquityChangeacc);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (DIVIDamount > 0 &&  Investmentcategory == 2 && Equitycheck == true) {
                    
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(DIVIDamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',DIVIDARacc);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(DIVIDamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',DIVIDEquityChangeacc);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (DIVIDamount > 0 &&  Investmentcategory == 3 && Fairvaluecheck == true) {
                   
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(DIVIDamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',DIVIDARacc);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                   trialBalRec.setValue('custrecord_da_gl_credit',Number(DIVIDamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',DIVIDIncomeacc);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (DIVIDamount > 0 &&  Investmentcategory == 4 && Fairvaluecheck == true) {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(DIVIDamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',DIVIDARacc);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(DIVIDamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',DIVIDIncomeacc);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }
                    return true;


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

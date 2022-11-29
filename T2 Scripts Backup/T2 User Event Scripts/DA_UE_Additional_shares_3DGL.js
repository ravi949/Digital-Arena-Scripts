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

              var TotalValue = parseFloat(scriptContext.newRecord.getValue('custbody_da_investment_unrealised_gain'))* parseFloat(scriptContext.newRecord.getValue('custbody_da_par_value_per_sahare'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));
              log.debug('TotalValue', TotalValue);

                  var Invtaccount= scriptContext.newRecord.getValue('custbody_da_investment_asset_account');
                  log.debug('Invtaccount',Invtaccount );

                    var Equitycheck = scriptContext.newRecord.getValue('custbody_da_equity_method');
                    log.debug('Equitycheck',Equitycheck);

                    var Investmentcategory= scriptContext.newRecord.getValue('custbody_da_investment_category');
                  log.debug('Investmentcategory',Investmentcategory);

                    var brokerageamount = parseFloat(scriptContext.newRecord.getValue('custbody_da_brokerage_commission_per_s'))* parseFloat(scriptContext.newRecord.getValue('custbody_da_investment_unrealised_gain'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));
                  log.debug('brokerageamount',brokerageamount);

                  var exchangerate = scriptContext.newRecord.getValue('exchangerate');
                  log.debug('exchangerate',exchangerate);

                    var brokeragepayable = scriptContext.newRecord.getValue('custbody_da_brokers_payable_acc');
                  log.debug('brokeragepayable',brokeragepayable);

                    var brokerageexpense = scriptContext.newRecord.getValue('custbody_da_brok_expense_account');
                    log.debug('brokerageexpense', brokerageexpense);

                  var bankamount = parseFloat(scriptContext.newRecord.getValue('custbody_da_brokerage_commission_per_s'))* parseFloat(scriptContext.newRecord.getValue('custbody_da_investment_unrealised_gain'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))+ parseFloat(scriptContext.newRecord.getValue('custbody_da_investment_unrealised_gain'))* parseFloat(scriptContext.newRecord.getValue('custbody_da_par_value_per_sahare'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))+ parseFloat(scriptContext.newRecord.getValue('custbody_da_changes_in_equity_persha'))* parseFloat(scriptContext.newRecord.getValue('custbody_da_investment_unrealised_gain'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));
                  log.debug('bankamount',bankamount);

                  var bankamountexcludingbrokerage = parseFloat(scriptContext.newRecord.getValue('custbody_da_investment_unrealised_gain'))* parseFloat(scriptContext.newRecord.getValue('custbody_da_par_value_per_sahare'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))+ parseFloat(scriptContext.newRecord.getValue('custbody_da_changes_in_equity_persha'))* parseFloat(scriptContext.newRecord.getValue('custbody_da_investment_unrealised_gain'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));
                  log.debug('bankamountexcludingbrokerage',bankamountexcludingbrokerage);

                  var bankamountexcludingchangesinequity = parseFloat(scriptContext.newRecord.getValue('custbody_da_brokerage_commission_per_s'))* parseFloat(scriptContext.newRecord.getValue('custbody_da_investment_unrealised_gain'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))+ parseFloat(scriptContext.newRecord.getValue('custbody_da_investment_unrealised_gain'))* parseFloat(scriptContext.newRecord.getValue('custbody_da_par_value_per_sahare'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));
                  log.debug('bankamountexcludingchangesinequity',bankamountexcludingchangesinequity);

                  var changesinequityaccount =scriptContext.newRecord.getValue('custbody_da_changes_in_equity_acc');
                  log.debug('changesinequityaccount',changesinequityaccount);

                    var changesinequityamount = parseFloat(scriptContext.newRecord.getValue('custbody_da_changes_in_equity_persha'))* parseFloat(scriptContext.newRecord.getValue('custbody_da_investment_unrealised_gain'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));
                  log.debug('changesinequityamount',changesinequityamount);

                    var accruecheck = scriptContext.newRecord.getValue('custbody_da_accrue_broker_liability');
                  log.debug('accruecheck',accruecheck);

                    var investamount = parseFloat(scriptContext.newRecord.getValue('custbody_da_investment_unrealised_gain'))* parseFloat(scriptContext.newRecord.getValue('custbody_da_par_value_per_sahare'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));;
                  log.debug('investamount',investamount);

                  var subsidiary = scriptContext.newRecord.getValue('subsidiary');
                  log.debug('subsidiary',subsidiary);
                  var date1 = scriptContext.newRecord.getValue('trandate');
                  log.debug('Date',date1);
                  var memo= scriptContext.newRecord.getValue('memo');
                  log.debug('Memo',memo);
                  var trantype = '167';
                  log.debug('Transaction Type',trantype);
                    var Bankaccount = scriptContext.newRecord.getValue('custbody_da_invt_cash_bank_account');
            		  log.debug('Bankaccount',Bankaccount);

                  var Fairvaluecheck = scriptContext.newRecord.getValue('custbody_da_fair_value_method');
            		    log.debug('FairValue',Fairvaluecheck);

                    var customrecord_da_investment_accouning_setSearch = search.create({
                          type: "customrecord_da_investment_accouning_set",
                              filters:
                                [
                                    ["custrecord_da_investment_subsidiary","anyof",subsidiary]
                                ],
                                      columns:
                                    ['internalid','custrecord_da_stock_investment_fee']
                              });
						var Feesaccount;
                      customrecord_da_investment_accouning_setSearch.run().each(function(result){
                        Feesaccount=result.getValue('custrecord_da_stock_investment_fee');

                      });
                      log.debug('Feesaccount',Feesaccount);

                  if (brokerageamount > 0 && changesinequityamount > 0 && accruecheck == false &&  Investmentcategory == 2 && Equitycheck == true) {
                    log.debug('if 1',brokerageamount);

                    var trialBalRec = record.create({
                    type: "customrecord_da_gl_data_base",
                    isDynamic: true
                  });
     			       trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                 trialBalRec.setValue('custrecord_da_gl_date',date1);
                 trialBalRec.setValue('custrecord_da_gl_memo',memo);
                 trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
         			          trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
         				       trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
          trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamount).toFixed(3));
          trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
          trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
          var trialBalRecord = trialBalRec.save();
          log.debug('trialBalRecord',trialBalRecord);
                          }
                  if (brokerageamount > 0 && changesinequityamount > 0 && accruecheck == true &&  Investmentcategory == 2 && Equitycheck == true){
                    //  log.debug('if 2',brokerageamount);
                    var trialBalRec = record.create({
                type: "customrecord_da_gl_data_base",
                isDynamic: true
              });
            trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
            trialBalRec.setValue('custrecord_da_gl_date',date1);
            trialBalRec.setValue('custrecord_da_gl_memo',memo);
            trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
              trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
              trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
              trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
              trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
              trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
              trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingbrokerage).toFixed(3));
              trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
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
              trialBalRec.setValue('custrecord_da_gl_credit',Number(brokerageamount).toFixed(3));
              trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);
              trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
              var trialBalRecord = trialBalRec.save();

              log.debug('trialBalRecord',trialBalRecord);
          }
                  if (brokerageamount > 0 && changesinequityamount > 0 && accruecheck == false &&  Investmentcategory == 1 && Equitycheck == true){
                      log.debug('if 3',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (brokerageamount > 0 && changesinequityamount > 0 && accruecheck == true &&  Investmentcategory == 1 && Equitycheck == true) {
                    //  log.debug('if 4',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);


                  }
                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == true &&  Investmentcategory == 4 && Fairvaluecheck == true) {
                    //log.debug('if 5',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);

                  }
                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == false &&  Investmentcategory == 4 && Fairvaluecheck == true) {
                    log.debug('if 6',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingchangesinequity).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }

                  //Pnl without brokerage
                  if (brokerageamount == 0 && changesinequityamount == 0 && accruecheck == true &&  Investmentcategory == 4 && Fairvaluecheck == true) {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();


                  }

                  if (brokerageamount == 0 && changesinequityamount == 0 && accruecheck == false &&  Investmentcategory == 4 && Fairvaluecheck == true) {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(investamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();


                  }



                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == true &&  Investmentcategory == 3 && Fairvaluecheck == true) {
                    log.debug('if 7',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == false &&  Investmentcategory == 3 && Fairvaluecheck == true) {
                    log.debug('if 8',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingchangesinequity).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }

                      //OCI wihtout Brokerage
                if (brokerageamount == 0 && changesinequityamount == 0 && accruecheck == true &&  Investmentcategory == '3' && Fairvaluecheck == true) {

                  var trialBalRec = record.create({
                    type: "customrecord_da_gl_data_base",
                    isDynamic: true
                  });
                  trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                  trialBalRec.setValue('custrecord_da_gl_date',date1);
                  trialBalRec.setValue('custrecord_da_gl_memo',memo);
                  trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                  trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                  trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                  trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingbrokerage).toFixed(3));
                  trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                  trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                  var trialBalRecord = trialBalRec.save();
                }

                if (brokerageamount == 0 && changesinequityamount == 0 && accruecheck == false &&  Investmentcategory == '3' && Fairvaluecheck == true) {

                  var trialBalRec = record.create({
                    type: "customrecord_da_gl_data_base",
                    isDynamic: true
                  });
                  trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                  trialBalRec.setValue('custrecord_da_gl_date',date1);
                  trialBalRec.setValue('custrecord_da_gl_memo',memo);
                  trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                  trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                  trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                  trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingchangesinequity).toFixed(3));
                  trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                  trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                  var trialBalRecord = trialBalRec.save();

                }



                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == false &&  Investmentcategory == 2 && Equitycheck == true) {
                      log.debug('if 9',brokerageamount);

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });

                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingchangesinequity).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);

                  }

                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == true &&  Investmentcategory == 2 && Equitycheck == true) {
                    log.debug('if 10',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }

                    //Associate
                  if (brokerageamount == 0 && changesinequityamount == 0 && accruecheck == false &&  Investmentcategory == 2 && Equitycheck == true) {

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingchangesinequity).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();
                  }
                  if (brokerageamount == 0 && changesinequityamount == 0 && accruecheck == true &&  Investmentcategory == 2 && Equitycheck == true) {

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();
                  }

                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == false &&  Investmentcategory == 1 && Equitycheck == true) {
                    log.debug('if 11',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingchangesinequity).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }

                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == true &&  Investmentcategory == 1 && Equitycheck == true){
                    log.debug('if 12',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }

                  // Subsidiary without Brokerage START
                  if (brokerageamount == 0 && changesinequityamount == 0 && accruecheck == false &&  Investmentcategory == 1 && Equitycheck == true) {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingchangesinequity).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    }

                    if (brokerageamount == 0 && changesinequityamount == 0 && accruecheck == true &&  Investmentcategory == 1 && Equitycheck == true) {

                      var trialBalRec = record.create({
                        type: "customrecord_da_gl_data_base",
                        isDynamic: true
                      });
                      trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                      trialBalRec.setValue('custrecord_da_gl_date',date1);
                      trialBalRec.setValue('custrecord_da_gl_memo',memo);
                      trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                      trialBalRec.setValue('custrecord_da_gl_debit',Number(TotalValue).toFixed(3));
                      trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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
                      trialBalRec.setValue('custrecord_da_gl_credit',Number(bankamountexcludingbrokerage).toFixed(3));
                      trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                      trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                      var trialBalRecord = trialBalRec.save();

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

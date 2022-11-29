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

              var retainedplaccount = scriptContext.newRecord.getValue('custbody_da_retained_pl_account');
              log.debug('retainedplaccount', retainedplaccount);

              var Realisedgainequity = -((parseFloat(scriptContext.newRecord.getValue('custbody_da_fair_value_amount'))/parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_remaining')))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold')))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))-(parseFloat(scriptContext.newRecord.getValue('custbody_da_changes_in_equity_persha'))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold'))*parseFloat(scriptContext.newRecord.getValue('exchangerate')))+((parseFloat(scriptContext.newRecord.getValue('custbody_da_cash_receive_on_invest_sal'))*scriptContext.newRecord.getValue('exchangerate')+parseFloat(scriptContext.newRecord.getValue('custbody_da_oci_per_share'))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))));
              log.debug('Realisedgainequity', Realisedgainequity);

              var RealisedgainequityPL = -((parseFloat(scriptContext.newRecord.getValue('custbody_da_fair_value_amount'))/parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_remaining')))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold')))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))-(parseFloat(scriptContext.newRecord.getValue('custbody_da_changes_in_equity_persha'))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold'))*parseFloat(scriptContext.newRecord.getValue('exchangerate')))+(parseFloat(scriptContext.newRecord.getValue('custbody_da_cash_receive_on_invest_sal'))*parseFloat(scriptContext.newRecord.getValue('exchangerate')));
              log.debug('RealisedgainequityPL', RealisedgainequityPL);

              var RealisedlossequityPL = ((parseFloat(scriptContext.newRecord.getValue('custbody_da_fair_value_amount'))/parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_remaining')))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold')))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))+(parseFloat(scriptContext.newRecord.getValue('custbody_da_changes_in_equity_persha'))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold'))*parseFloat(scriptContext.newRecord.getValue('exchangerate')))-(parseFloat(scriptContext.newRecord.getValue('custbody_da_cash_receive_on_invest_sal'))*parseFloat(scriptContext.newRecord.getValue('exchangerate')));
              log.debug('RealisedlossequityPL', RealisedlossequityPL);

              var RealisedgainequityOCI = -((parseFloat(scriptContext.newRecord.getValue('custbody_da_fair_value_amount'))/parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_remaining')))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold')))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))+(parseFloat(scriptContext.newRecord.getValue('custbody_da_cash_receive_on_invest_sal'))*parseFloat(scriptContext.newRecord.getValue('exchangerate')));
              log.debug('RealisedgainequityOCI',RealisedgainequityOCI);

              var RealisedlossequityOCI = ((parseFloat(scriptContext.newRecord.getValue('custbody_da_fair_value_amount'))/parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_remaining')))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold')))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))-(parseFloat(scriptContext.newRecord.getValue('custbody_da_cash_receive_on_invest_sal'))*parseFloat(scriptContext.newRecord.getValue('exchangerate')));
              log.debug('RealisedlossequityOCI',RealisedlossequityOCI);

              var exchangerate = scriptContext.newRecord.getValue('exchangerate');

              var changesinFVaccount = scriptContext.newRecord.getValue('custbody_da_changes_fv_acc');
              log.debug('changesinFVaccount',changesinFVaccount);

              var realisedplaccount = scriptContext.newRecord.getValue('custbody_da_realised_pl_acc');
              log.debug('realisedplaccount',realisedplaccount);

              var FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT = scriptContext.newRecord.getValue('custbody_da_fv_change_equity_pl');
              log.debug('FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);

              var OCIreserve = scriptContext.newRecord.getValue('custbody_da_oci_reserve_account');
              log.debug('OCIreserve',OCIreserve);

              var shareofprofitaccount = scriptContext.newRecord.getValue('custbody_da_share_of_profit_acc');
              log.debug('shareofprofitaccount',shareofprofitaccount);

              var Investmentcategory = scriptContext.newRecord.getValue('custbody_da_investment_category');
              log.debug('Investmentcategory',Investmentcategory);

              var ShareofOCIaccount = scriptContext.newRecord.getValue('custbody_da_share_oci_acc');
              log.debug('ShareofOCIaccount',ShareofOCIaccount);

              var ChangesinequityAccount = scriptContext.newRecord.getValue('custbody_da_changes_in_equity_acc');
              log.debug('ChangesinequityAccount',ChangesinequityAccount);

              var changesinequityamount = parseFloat(scriptContext.newRecord.getValue('custbody_da_total_changes_in_equity_va'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));

              var changesinequitygl = parseFloat(scriptContext.newRecord.getValue('custbody_da_changes_in_equity_persha'))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));

              var OCIgl = parseFloat(scriptContext.newRecord.getValue('custbody_da_oci_per_share'))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));

              var Realisedlossequity = ((parseFloat(scriptContext.newRecord.getValue('custbody_da_fair_value_amount'))/parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_remaining')))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold')))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))+(parseFloat(scriptContext.newRecord.getValue('custbody_da_changes_in_equity_persha'))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold'))*parseFloat(scriptContext.newRecord.getValue('exchangerate')))-((parseFloat(scriptContext.newRecord.getValue('custbody_da_cash_receive_on_invest_sal'))*scriptContext.newRecord.getValue('exchangerate')+parseFloat(scriptContext.newRecord.getValue('custbody_da_oci_per_share'))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))));


              var OCIAmount = parseFloat(scriptContext.newRecord.getValue('custbody_da_total_share_of_oci'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));


              var shareofprofitorloss = (parseFloat(scriptContext.newRecord.getValue('custbody_da_total_changes_in_equity_va')) - parseFloat(scriptContext.newRecord.getValue('custbody_da_total_share_of_oci'))) * (parseFloat(scriptContext.newRecord.getValue('exchangerate')));



              var Cashreceivedamount = parseFloat(scriptContext.newRecord.getValue('custbody_da_cash_receive_on_invest_sal'))*scriptContext.newRecord.getValue('exchangerate');
            log.debug('Cashreceivedamount',Cashreceivedamount);

              var FVamount = ((parseFloat(scriptContext.newRecord.getValue('custbody_da_fair_value_amount'))/parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_remaining')))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold')))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));
              log.debug('FVamount',FVamount);

              var Gainamount = parseFloat(scriptContext.newRecord.getValue('custbody_da_cash_receive_on_invest_sal'))-((parseFloat(scriptContext.newRecord.getValue('custbody_da_fair_value_amount'))/parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_remaining')))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold')))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));


              var Lossamount = ((parseFloat(scriptContext.newRecord.getValue('custbody_da_fair_value_amount'))/parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_remaining')))*parseFloat(scriptContext.newRecord.getValue('custbody_da_no_of_shares_sold')))*parseFloat(scriptContext.newRecord.getValue('exchangerate'))-parseFloat(scriptContext.newRecord.getValue('custbody_da_cash_receive_on_invest_sal'));
            //nlapiLogExecution('debug',transactionRecord.getFieldValue('custbody_da_no_of_shares_sold')*transactionRecord.getFieldValue('exchangerate')*transactionRecord.getFieldValue('custbody_da_par_value_per_sahare')- transactionRecord.getFieldValue('custbody_da_cash_receive_on_invest_fun'));

              var Invtaccount = scriptContext.newRecord.getValue('custbody_da_investment_asset_account');
              log.debug('Invtaccount',Invtaccount);

              var Bankaccount = scriptContext.newRecord.getValue('custbody_da_invt_cash_bank_account');

              var Equitycheck = scriptContext.newRecord.getValue('custbody_da_equity_method');
              log.debug('Equitycheck',Equitycheck);

              var subsidiary = scriptContext.newRecord.getValue('subsidiary');
              log.debug('subsidiary',subsidiary);
              var date1 = scriptContext.newRecord.getValue('trandate');
              log.debug('Date',date1);
              var memo= scriptContext.newRecord.getValue('memo');
              log.debug('Memo',memo);
              var trantype = '166';
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
                                    ['internalid','custrecord_da_investment_gain_on_sale','custrecord_da_investment_loss_on_sale']
                              });
						var Gainaccount;
                      customrecord_da_investment_accouning_setSearch.run().each(function(result){
                        var settingsRec=result.id;
                        Gainaccount = result.getValue('custrecord_da_investment_gain_on_sale');
                        var Lossaccount= result.getValue('custrecord_da_investment_loss_on_sale');

                      });
                      log.debug('Gainaccount',Gainaccount);



                      if (RealisedgainequityPL > 0 && OCIAmount == 0  && changesinequityamount !== 0 &&  Investmentcategory == 4 && Fairvaluecheck == true) {
                    //log.debug('if 1',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);              trialBalRec.setValue('custrecord_da_gl_debit',Number(Cashreceivedamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(RealisedgainequityPL).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',realisedplaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequitygl).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',ChangesinequityAccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(FVamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }

                  if (RealisedgainequityPL < 0 && OCIAmount == 0 && changesinequityamount !== 0 &&  Investmentcategory == 4 && Fairvaluecheck == true) {

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(Cashreceivedamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(RealisedlossequityPL).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',realisedplaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequitygl).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',ChangesinequityAccount);
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(FVamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                      }

                      if (RealisedgainequityOCI > 0 && OCIAmount == 0 && changesinequityamount !== 0 &&  Investmentcategory == 3 && Fairvaluecheck == true) {

                        var trialBalRec = record.create({
                          type: "customrecord_da_gl_data_base",
                          isDynamic: true
                        });
                        trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                        trialBalRec.setValue('custrecord_da_gl_date',date1);
                        trialBalRec.setValue('custrecord_da_gl_memo',memo);
                        trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(Cashreceivedamount).toFixed(3));
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(RealisedgainequityOCI).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',retainedplaccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequitygl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',changesinFVaccount);
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
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequitygl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',OCIreserve);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(FVamount).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                        trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                        var trialBalRecord = trialBalRec.save();

                      }

                      if (RealisedgainequityOCI < 0 && OCIAmount == 0 && changesinequityamount !== 0 &&  Investmentcategory == 3 && Fairvaluecheck == true) {

                        var trialBalRec = record.create({
                          type: "customrecord_da_gl_data_base",
                          isDynamic: true
                        });
                        trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                        trialBalRec.setValue('custrecord_da_gl_date',date1);
                        trialBalRec.setValue('custrecord_da_gl_memo',memo);
                        trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(Cashreceivedamount).toFixed(3));
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
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(RealisedlossequityOCI).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',retainedplaccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequitygl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',changesinFVaccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequitygl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',OCIreserve);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(FVamount).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                        trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                        var trialBalRecord = trialBalRec.save();

                      }

                      if (Realisedgainequity > 0 && OCIAmount !== 0 && changesinequityamount !== 0 &&  Investmentcategory == 2 && Equitycheck == true) {

                        var trialBalRec = record.create({
                          type: "customrecord_da_gl_data_base",
                          isDynamic: true
                        });
                        trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                        trialBalRec.setValue('custrecord_da_gl_date',date1);
                        trialBalRec.setValue('custrecord_da_gl_memo',memo);
                        trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(Cashreceivedamount).toFixed(3));
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
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(OCIgl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',ShareofOCIaccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequitygl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',ChangesinequityAccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(Realisedgainequity).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',realisedplaccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(FVamount).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                        trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                        var trialBalRecord = trialBalRec.save();

                      }

                      if (Realisedgainequity < 0 && OCIAmount !== 0 && changesinequityamount !== 0 &&  Investmentcategory == 2 && Equitycheck == true) {

                        var trialBalRec = record.create({
                          type: "customrecord_da_gl_data_base",
                          isDynamic: true
                        });
                        trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                        trialBalRec.setValue('custrecord_da_gl_date',date1);
                        trialBalRec.setValue('custrecord_da_gl_memo',memo);
                        trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(Cashreceivedamount).toFixed(3));
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(OCIgl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',ShareofOCIaccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequitygl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',ChangesinequityAccount);
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
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(Realisedlossequity).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',realisedplaccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(FVamount).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                        trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                        var trialBalRecord = trialBalRec.save();
                      }

                      if (Realisedgainequity > 0 && OCIAmount !== 0 && changesinequityamount !== 0 &&  Investmentcategory == 1 && Equitycheck == true) {

                        var trialBalRec = record.create({
                          type: "customrecord_da_gl_data_base",
                          isDynamic: true
                        });
                        trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                        trialBalRec.setValue('custrecord_da_gl_date',date1);
                        trialBalRec.setValue('custrecord_da_gl_memo',memo);
                        trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(Cashreceivedamount).toFixed(3));
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
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(OCIgl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',ShareofOCIaccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequitygl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',ChangesinequityAccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(Realisedgainequity).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',realisedplaccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(FVamount).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                        trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                        var trialBalRecord = trialBalRec.save();

                      }

                      if (Realisedgainequity < 0 && OCIAmount !== 0 && changesinequityamount !== 0 &&  Investmentcategory == 1 && Equitycheck == true) {
                        var trialBalRec = record.create({
                          type: "customrecord_da_gl_data_base",
                          isDynamic: true
                        });
                        trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                        trialBalRec.setValue('custrecord_da_gl_date',date1);
                        trialBalRec.setValue('custrecord_da_gl_memo',memo);
                        trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(Cashreceivedamount).toFixed(3));
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
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(OCIgl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',ShareofOCIaccount);
                        trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                        var trialBalRecord = trialBalRec.save();

                        var trialBalRec = record.create({
                          type: "customrecord_da_gl_data_base",
                          isDynamic: true
                        });
                        trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);trialBalRec.setValue('custrecord_da_gl_date',date1);
                        trialBalRec.setValue('custrecord_da_gl_memo',memo);
                        trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequitygl).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',ChangesinequityAccount);
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
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(Realisedlossequity).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',realisedplaccount);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(FVamount).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
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

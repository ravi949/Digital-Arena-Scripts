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
                            var customTransSearch = search.create({
                  type: 'TRANSACTION',
                  columns: [
                      'exchangerate','custbody_da_equity_method','custbody_da_fair_value_method','custbody_da_brokers_payable_acc','custbody_da_brok_expense_account','custbody_da_investment_category','custbody_da_changes_in_equity_acc','custbody_da_accrue_broker_liability','custbody_da_investment_asset_account','custbody_da_investment_asset_account','custbody_da_invt_cash_bank_account','custbody_da_invt_cash_bank_account','custbody_da_brokerage_commission_per_s','custbody_da_investment_unrealised_gain','custbody_da_ia_investment_total_amount','custbody_da_changes_in_equity_persha'
                  ],
                  filters: [
                      ['internalid', 'anyof', internalId],
                      ]
              });
                  customTransSearch.run().each(function(result) {
                  var Invtaccount= result.getValue('custbody_da_investment_asset_account');

                  var Investmentcategory= result.getValue('custbody_da_investment_category');
                  var brokerageamount = parseFloat(result.getValue('custbody_da_brokerage_commission_per_s'))* parseFloat(result.getValue('custbody_da_investment_unrealised_gain'))*parseFloat(result.getValue('exchangerate'));
                  var brokeragepayable = result.getValue('custbody_da_brokers_payable_acc');

                  var bankamount = parseFloat(result.getValue('custbody_da_brokerage_commission_per_s'))* parseFloat(result.getValue('custbody_da_investment_unrealised_gain'))*parseFloat(result.getValue('exchangerate'))+ parseFloat(result.getValue('custbody_da_ia_investment_total_amount'))* parseFloat(result.getValue('exchangerate'))+ parseFloat(result.getValue('custbody_da_changes_in_equity_persha'))* parseFloat(result.getValue('custbody_da_investment_unrealised_gain'))*parseFloat(result.getValue('exchangerate'));
                  var bankamountexcludingbrokerage = parseFloat(result.getValue('custbody_da_ia_investment_total_amount'))* parseFloat(result.getValue('exchangerate'))+ parseFloat(result.getValue('custbody_da_changes_in_equity_persha'))* parseFloat(result.getValue('custbody_da_investment_unrealised_gain'))*parseFloat(result.getValue('exchangerate'));

                  var changesinequityaccount =result.getValue('custbody_da_changes_in_equity_acc');

                  var changesinequityamount = parseFloat(result.getValue('custbody_da_changes_in_equity_persha'))* parseFloat(result.getValue('custbody_da_investment_unrealised_gain'))*parseFloat(result.getValue('exchangerate'));
                  var accruecheck = result.getValue('custbody_da_accrue_broker_liability');
                  var investamount = parseFloat(result.getValue('custbody_da_ia_investment_total_amount'))* parseFloat(result.getFieldValue('exchangerate'));



                  if (brokerageamount > 0 && changesinequityamount > 0 && accruecheck == 'F' &&  Investmentcategory == '2' && Equitycheck == 'T') {
                    var trialBalRec = record.create({
            type: "customrecord_da_gl_data_base",
            isDynamic: true
          });
          trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
          var parsedDate = format.parse({
            value: date,
            type: format.Type.DATE
          });
          trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
          trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
          trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(changesinequityamount).toFixed(3));
          trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
          trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
          trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
          trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamount).toFixed(3));
          trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);

          trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

          var trialBalRecord = trialBalRec.save();
          log.debug('trialBalRecord',trialBalRecord);
                          }
                  if (brokerageamount > 0 && changesinequityamount > 0 && accruecheck == 'T' &&  Investmentcategory == '2' && Equitycheck == 'T'){
              var trialBalRec = record.create({
                type: "customrecord_da_gl_data_base",
                isDynamic: true
              });
              trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
              var parsedDate = format.parse({
                value: date,
                type: format.Type.DATE
              });
              trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
              trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
              trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(changesinequityamount).toFixed(3));
              trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
              trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
              trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
              trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamount).toFixed(3));
              trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
              trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(brokerageamount).toFixed(3));
              trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);

              trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

              var trialBalRecord = trialBalRec.save();
              log.debug('trialBalRecord',trialBalRecord);
          }
                  if (brokerageamount > 0 && changesinequityamount > 0 && accruecheck == 'F' &&  Investmentcategory == '1' && Equitycheck == 'T'){
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    var parsedDate = format.parse({
                      value: date,
                      type: format.Type.DATE
                    });
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(changesinequityamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);

                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (brokerageamount > 0 && changesinequityamount > 0 && accruecheck == 'T' &&  Investmentcategory == '1' && Equitycheck == 'T') {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    var parsedDate = format.parse({
                      value: date,
                      type: format.Type.DATE
                    });
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(changesinequityamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinequityaccount);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);

                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == 'T' &&  Investmentcategory == '4' && Fairvaluecheck == 'T') {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    var parsedDate = format.parse({
                      value: date,
                      type: format.Type.DATE
                    });
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);

                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == 'F' &&  Investmentcategory == '4' && Fairvaluecheck == 'T') {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    var parsedDate = format.parse({
                      value: date,
                      type: format.Type.DATE
                    });
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamountexcludingchangesinequity).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);

                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == 'T' &&  Investmentcategory == '3' && Fairvaluecheck == 'T') {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    var parsedDate = format.parse({
                      value: date,
                      type: format.Type.DATE
                    });
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);

                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == 'F' &&  Investmentcategory == '3' && Fairvaluecheck == 'T') {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    var parsedDate = format.parse({
                      value: date,
                      type: format.Type.DATE
                    });
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamountexcludingchangesinequity).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);


                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == 'F' &&  Investmentcategory == '2' && Equitycheck == 'T') {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    var parsedDate = format.parse({
                      value: date,
                      type: format.Type.DATE
                    });
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamountexcludingchangesinequity).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);


                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == 'T' &&  Investmentcategory == '2' && Equitycheck == 'T') {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    var parsedDate = format.parse({
                      value: date,
                      type: format.Type.DATE
                    });
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);


                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == 'F' &&  Investmentcategory == '1' && Equitycheck == 'T') {
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    var parsedDate = format.parse({
                      value: date,
                      type: format.Type.DATE
                    });
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamountexcludingchangesinequity).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);



                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (brokerageamount > 0 && changesinequityamount == 0 && accruecheck == 'T' &&  Investmentcategory == '1' && Equitycheck == 'T'){
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    var parsedDate = format.parse({
                      value: date,
                      type: format.Type.DATE
                    });
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(investamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_debitAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokerageexpense);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(bankamountexcludingbrokerage).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Bankaccount);
                    trialBalRec.setValue('custrecord_da_gl_creditAmount',Number(brokerageamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',brokeragepayable);

                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);

                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }


                  });
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

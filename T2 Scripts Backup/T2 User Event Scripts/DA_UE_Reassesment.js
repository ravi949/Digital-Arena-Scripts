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
                  log.debug('exchangerate',exchangerate);

                  var PorLOCI = scriptContext.newRecord.getValue('custbody_da_share_of_profit_loss');
                  log.debug('PorLOCI',PorLOCI);

                  var PorLCE = scriptContext.newRecord.getValue('custbody_da_share_of_profit_changes_in');
                  log.debug('PorLCE',PorLCE);

                  var changesinFVaccount = scriptContext.newRecord.getValue('custbody_da_changes_fv_acc');
                  log.debug('changesinFVaccount',changesinFVaccount);

                  var FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT = scriptContext.newRecord.getValue('custbody_da_fv_change_equity_pl');
                  log.debug('FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);

                  var OCIreserve = scriptContext.newRecord.getValue('custbody_da_oci_reserve_account');
                  log.debug('OCIreserve', OCIreserve);

                  var shareofprofitaccount = scriptContext.newRecord.getValue('custbody_da_share_of_profit_acc');
                  log.debug('shareofprofitaccount',shareofprofitaccount);

                  var ShareofOCIaccount = scriptContext.newRecord.getValue('custbody_da_share_oci_acc');
                  log.debug('ShareofOCIaccount',ShareofOCIaccount);

                  var ChangesinequityAccount = scriptContext.newRecord.getValue('custbody_da_changes_in_equity_acc');
                  log.debug('ChangesinequityAccount',ChangesinequityAccount);

                  var LastValue= scriptContext.newRecord.getValue('custbody_da_fair_value_amount')*scriptContext.newRecord.getValue('exchangerate');
                  log.debug('LastValue',LastValue);

                  var CurrentFV= scriptContext.newRecord.getValue('custbody_da_current_fv')*scriptContext.newRecord.getValue('exchangerate');
                  log.debug('CurrentFV',CurrentFV);

                  var ReassessAmt = scriptContext.newRecord.getValue('custbody_da_ureal_gain_loss')*scriptContext.newRecord.getValue('exchangerate');
                  log.debug('ReassessAmt',ReassessAmt);

                  var Variance = parseFloat(scriptContext.newRecord.getValue('custbody_da_current_fv'))- parseFloat(scriptContext.newRecord.getValue('custbody_da_fair_value_amount'));
                  log.debug('Variance',Variance);

                  var Invtaccount = scriptContext.newRecord.getValue('custbody_da_investment_asset_account');
                  log.debug('Invtaccount',Invtaccount);

                  var subsidiary = scriptContext.newRecord.getValue('subsidiary');
                  log.debug('subsidiary',subsidiary);
                  var date1 = scriptContext.newRecord.getValue('trandate');
                  log.debug('Date',date1);
                  var memo= scriptContext.newRecord.getValue('memo');
                  log.debug('Memo',memo);
                  var trantype = '170';
                  log.debug('Transaction Type',trantype);

                  var Fairvaluecheck = scriptContext.newRecord.getValue('custbody_da_fair_value_method');
            		    log.debug('FairValue',Fairvaluecheck);

              var Equitycheck = scriptContext.newRecord.getValue('custbody_da_equity_method');
                    log.debug('Equitycheck',Equitycheck);


                    var changesinequityamount = parseFloat(scriptContext.newRecord.getValue('custbody_da_total_changes_in_equity_va'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));
                    log.debug('changesinequityamount',changesinequityamount);

                    var OCIAmount = parseFloat(scriptContext.newRecord.getValue('custbody_da_total_share_of_oci'))*parseFloat(scriptContext.newRecord.getValue('exchangerate'));
                    log.debug(OCIAmount,OCIAmount);

                    var shareofprofitorloss = (parseFloat(scriptContext.newRecord.getValue('custbody_da_total_changes_in_equity_va')) - parseFloat(scriptContext.newRecord.getValue('custbody_da_total_share_of_oci'))) * (parseFloat(scriptContext.newRecord.getValue('exchangerate')));
                    log.debug('shareofprofitorloss',shareofprofitorloss);

              			var Investmentcategory = scriptContext.newRecord.getValue('custbody_da_investment_category');
                 		log.debug('Investmentcategory',Investmentcategory);


                    var customrecord_da_investment_accouning_setSearch = search.create({
                          type: "customrecord_da_investment_accouning_set",
                              filters:
                                [
                                    ["custrecord_da_investment_subsidiary","anyof",subsidiary]
                                ],
                                      columns:
                                    ['internalid','custrecord_da_unrealised_loss_investment','custrecord_da_unrealised_gain_investment']
                              });

              			var UnreGain;
              			var UnreLoss;
                      customrecord_da_investment_accouning_setSearch.run().each(function(result){
                        UnreGain=result.getValue('custrecord_da_unrealised_gain_investment');
                        UnreLoss = result.getValue('custrecord_da_unrealised_loss_investment');

                      });
                      log.debug('UnreGain',UnreGain);

                      if (Variance < 0 && OCIAmount == 0 && changesinequityamount == 0 &&  Investmentcategory == 4 && Fairvaluecheck == true) {
                  //  log.debug('if 1',brokerageamount);

                    var trialBalRec = record.create({
                    type: "customrecord_da_gl_data_base",
                    isDynamic: true
                  });
     			       trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                 trialBalRec.setValue('custrecord_da_gl_date',date1);
                 trialBalRec.setValue('custrecord_da_gl_memo',memo);
                 trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
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
         			          trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
         				       trialBalRec.setValue('custrecord_da_gl_account',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);
                       trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                       var trialBalRecord = trialBalRec.save();

                      log.debug('trialBalRecord',trialBalRecord);
                  }

                  if (Variance > 0 && OCIAmount == 0 && changesinequityamount == 0 &&  Investmentcategory == 4 && Fairvaluecheck == true) {
                    //  log.debug('if 2',brokerageamount);
                    var trialBalRec = record.create({
                type: "customrecord_da_gl_data_base",
                isDynamic: true
              });
            trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
            trialBalRec.setValue('custrecord_da_gl_date',date1);
            trialBalRec.setValue('custrecord_da_gl_memo',memo);
            trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
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
              trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
              trialBalRec.setValue('custrecord_da_gl_account',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);
              trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
              var trialBalRecord = trialBalRec.save();



              log.debug('trialBalRecord',trialBalRecord);
          }

                  if (Variance < 0 && OCIAmount == 0 && changesinequityamount == 0 &&  Investmentcategory == 3 && Fairvaluecheck == true) {
                      log.debug('if 3',ReassessAmt);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',changesinFVaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (Variance > 0 && OCIAmount == 0 && changesinequityamount == 0 &&  Investmentcategory == 3 && Fairvaluecheck == true) {
                    //  log.debug('if 4',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',OCIreserve);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();


                    log.debug('trialBalRecord',trialBalRecord);


                  }
                  if (OCIAmount > 0 && changesinequityamount > 0 &&  Investmentcategory == 2 && Equitycheck == true && PorLOCI == true && PorLCE == true) {
                    //log.debug('if 5',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(OCIAmount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(shareofprofitorloss).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();


                    log.debug('trialBalRecord',trialBalRecord);

                  }
                  if (OCIAmount > 0 && changesinequityamount > 0 &&  Investmentcategory == 2 && Equitycheck == true && PorLOCI == false && PorLCE == false) {
                //    log.debug('if 6',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(OCIAmount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(shareofprofitorloss).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (OCIAmount > 0 && changesinequityamount > 0 &&  Investmentcategory == 2 && Equitycheck ==true  && PorLOCI ==true && PorLCE == false) {
//                    log.debug('if 7',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(shareofprofitorloss).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(OCIAmount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    /*var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();*/

                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (OCIAmount > 0 && changesinequityamount > 0 &&  Investmentcategory == 2 && Equitycheck == true && PorLOCI == false && PorLCE == true) {
//                    log.debug('if 8',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(OCIAmount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(OCIAmount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (OCIAmount == 0 && changesinequityamount > 0 &&  Investmentcategory == 2 && Equitycheck == true && PorLCE == true) {


                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });

                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
					          trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);

                  }

                  if (OCIAmount == 0 && changesinequityamount > 0 &&  Investmentcategory == 2 && Equitycheck == true && PorLCE == false) {
                   log.debug('if 10',Investmentcategory);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }

                  if (OCIAmount > 0 && changesinequityamount > 0 &&  Investmentcategory == 1 && Equitycheck == true && PorLOCI == true && PorLCE == true) {
//                    log.debug('if 11',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(OCIAmount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(shareofprofitorloss).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                  }
                  if (OCIAmount > 0 && changesinequityamount > 0 &&  Investmentcategory == 1 && Equitycheck == true && PorLOCI == false && PorLCE == false) {
                //    log.debug('if 12',brokerageamount);
                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(OCIAmount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(shareofprofitorloss).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();
                    log.debug('trialBalRecord',trialBalRecord);
                  }

                  if (OCIAmount > 0 && changesinequityamount > 0 &&  Investmentcategory == 1 && Equitycheck == true && PorLOCI == true && PorLCE == false) {

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(OCIAmount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(shareofprofitorloss).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',Invtaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();



                  }

                  if (OCIAmount > 0 && changesinequityamount > 0 &&  Investmentcategory == 1 && Equitycheck == true && PorLOCI == false && PorLCE == true) {

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(OCIAmount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(OCIAmount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);


                  }

                  if (OCIAmount == 0 && changesinequityamount > 0 &&  Investmentcategory == 1 && Equitycheck == true && PorLCE == true) {

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);

                    }

                    if (OCIAmount == 0 && changesinequityamount > 0 &&  Investmentcategory == 1 && Equitycheck == true && PorLCE == false) {

                      var trialBalRec = record.create({
                        type: "customrecord_da_gl_data_base",
                        isDynamic: true
                      });
                      trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                      trialBalRec.setValue('custrecord_da_gl_date',date1);
                      trialBalRec.setValue('custrecord_da_gl_memo',memo);
                      trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                      trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                      trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                      trialBalRec.setValue('custrecord_da_gl_account',shareofprofitaccount);
                      trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                      var trialBalRecord = trialBalRec.save();

                      log.debug('trialBalRecord',trialBalRecord);

                      }

                      //if profit and loss variance and CE >/<0

                      if (Variance < 0 && OCIAmount == 0 && changesinequityamount < 0 &&  Investmentcategory == 4 && Fairvaluecheck == true) {

                        var trialBalRec = record.create({
                          type: "customrecord_da_gl_data_base",
                          isDynamic: true
                        });
                        trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                        trialBalRec.setValue('custrecord_da_gl_date',date1);
                        trialBalRec.setValue('custrecord_da_gl_memo',memo);
                        trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
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
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);
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
                        trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                        trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                        trialBalRec.setValue('custrecord_da_gl_account',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);
                        trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                        var trialBalRecord = trialBalRec.save();

                        log.debug('trialBalRecord',trialBalRecord);
                        }

                        if (Variance < 0 && OCIAmount == 0 && changesinequityamount > 0 &&  Investmentcategory == 4 && Fairvaluecheck == true) {

                          var trialBalRec = record.create({
                            type: "customrecord_da_gl_data_base",
                            isDynamic: true
                          });
                          trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                          trialBalRec.setValue('custrecord_da_gl_date',date1);
                          trialBalRec.setValue('custrecord_da_gl_memo',memo);
                          trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                          trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
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
                          trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
                          trialBalRec.setValue('custrecord_da_gl_account',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);
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
                          trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
                          trialBalRec.setValue('custrecord_da_gl_account',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);
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
                          trialBalRec.setValue('custrecord_da_gl_account',ChangesinequityAccount);
                          trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                          var trialBalRecord = trialBalRec.save();

                          log.debug('trialBalRecord',trialBalRecord);
                          }


                          if (Variance > 0 && OCIAmount == 0 && changesinequityamount > 0 &&  Investmentcategory == 4 && Fairvaluecheck == true) {

                            var trialBalRec = record.create({
                              type: "customrecord_da_gl_data_base",
                              isDynamic: true
                            });
                            trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                            trialBalRec.setValue('custrecord_da_gl_date',date1);
                            trialBalRec.setValue('custrecord_da_gl_memo',memo);
                            trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                            trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
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
                            trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
                            trialBalRec.setValue('custrecord_da_gl_account',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);
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
                            trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
                            trialBalRec.setValue('custrecord_da_gl_account',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);
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
                            trialBalRec.setValue('custrecord_da_gl_account',ChangesinequityAccount);
                            trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                            var trialBalRecord = trialBalRec.save();

                            log.debug('trialBalRecord',trialBalRecord);
                            }

                            if (Variance > 0 && OCIAmount == 0 && changesinequityamount < 0 &&  Investmentcategory == 4 && Fairvaluecheck == true) {

                              var trialBalRec = record.create({
                                type: "customrecord_da_gl_data_base",
                                isDynamic: true
                              });
                              trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                              trialBalRec.setValue('custrecord_da_gl_date',date1);
                              trialBalRec.setValue('custrecord_da_gl_memo',memo);
                              trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                              trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
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
                              trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
                              trialBalRec.setValue('custrecord_da_gl_account',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);
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
                              trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                              trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                              trialBalRec.setValue('custrecord_da_gl_account',FAIRVALUECHANGEEQUITYINVESTMENTSPLACCOUNT);
                              trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                              var trialBalRecord = trialBalRec.save();
                              log.debug('trialBalRecord',trialBalRecord);
                              }

              // if OCI Variance and CE > / < 0
              if (Variance < 0 && OCIAmount == 0 && changesinequityamount < 0 &&   Investmentcategory == 3 && Fairvaluecheck == true) {

                var trialBalRec = record.create({
                  type: "customrecord_da_gl_data_base",
                  isDynamic: true
                });
                trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                trialBalRec.setValue('custrecord_da_gl_date',date1);
                trialBalRec.setValue('custrecord_da_gl_memo',memo);
                trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
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
                trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
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
                trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                trialBalRec.setValue('custrecord_da_gl_account',OCIreserve);
                trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                var trialBalRecord = trialBalRec.save();

                log.debug('trialBalRecord',trialBalRecord);
                }

                if (Variance < 0 && OCIAmount == 0 && changesinequityamount > 0 &&  Investmentcategory == 3 && Fairvaluecheck == true) {

                  var trialBalRec = record.create({
                    type: "customrecord_da_gl_data_base",
                    isDynamic: true
                  });
                  trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                  trialBalRec.setValue('custrecord_da_gl_date',date1);
                  trialBalRec.setValue('custrecord_da_gl_memo',memo);
                  trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                  trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
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
                  trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
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
                  trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                  trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                  trialBalRec.setValue('custrecord_da_gl_account',changesinFVaccount);
                  trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                  var trialBalRecord = trialBalRec.save();

                  log.debug('trialBalRecord',trialBalRecord);
                  }


                  if (Variance > 0 && OCIAmount == 0 && changesinequityamount < 0 &&  Investmentcategory == 3 && Fairvaluecheck == true) {

                    var trialBalRec = record.create({
                      type: "customrecord_da_gl_data_base",
                      isDynamic: true
                    });
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                    trialBalRec.setValue('custrecord_da_gl_date',date1);
                    trialBalRec.setValue('custrecord_da_gl_memo',memo);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                    trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                    trialBalRec.setValue('custrecord_da_gl_account',OCIreserve);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',internalId);
                    var trialBalRecord = trialBalRec.save();

                    log.debug('trialBalRecord',trialBalRecord);
                    }

                    if (Variance > 0 && OCIAmount == 0 && changesinequityamount > 0 &&  Investmentcategory == 3 && Fairvaluecheck == true) {

                      var trialBalRec = record.create({
                        type: "customrecord_da_gl_data_base",
                        isDynamic: true
                      });
                      trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiary);
                      trialBalRec.setValue('custrecord_da_gl_date',date1);
                      trialBalRec.setValue('custrecord_da_gl_memo',memo);
                      trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',trantype);
                      trialBalRec.setValue('custrecord_da_gl_debit',Number(ReassessAmt).toFixed(3));
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
                      trialBalRec.setValue('custrecord_da_gl_credit',Number(ReassessAmt).toFixed(3));
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
                      trialBalRec.setValue('custrecord_da_gl_credit',Number(changesinequityamount).toFixed(3));
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
                      trialBalRec.setValue('custrecord_da_gl_debit',Number(changesinequityamount).toFixed(3));
                      trialBalRec.setValue('custrecord_da_gl_account',changesinFVaccount);
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
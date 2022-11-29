/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/record'],

    function(message, serverWidget, search, runtime, record) {

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
                var id = scriptContext.newRecord.id;
                var type = scriptContext.newRecord.type;
                var form = scriptContext.newRecord.getValue('customform');
                var subsidiary = scriptContext.newRecord.getValue('subsidiary');
                var date = scriptContext.newRecord.getValue('trandate');
                var postingPeriod = scriptContext.newRecord.getValue('postingperiod');
                var status = scriptContext.newRecord.getValue('transtatus');
                var currency = scriptContext.newRecord.getValue('currency');
                var fcAmount = scriptContext.newRecord.getValue('custbody_da_fc_amount');
                var exchangeRate = scriptContext.newRecord.getValue('exchangerate');
                var amountKD = scriptContext.newRecord.getValue('custbody_da_amt_kd');
                 var memo = scriptContext.newRecord.getValue('memo');

                var createdFrom = scriptContext.newRecord.getValue('custbody_da_created_from_ref');

                if(createdFrom){
                    var customrecord_da_gl_data_baseSearchObj = search.create({
                        type: "customrecord_da_gl_data_base",
                        filters: [
                            ["custrecord_da_gl_impact_created_from", "anyof", createdFrom]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_gl_data_baseSearchObj.runPaged().count;
                    log.debug("customrecord_da_gl_data_baseSearchObj result count", searchResultCount);
                    customrecord_da_gl_data_baseSearchObj.run().each(function(result) {
                        record.delete({
                            type: 'customrecord_da_gl_data_base',
                            id: result.id
                        })
                        return true;
                    });

                    /*record.delete({
                        type :'customtransaction_da_journal_voucher',
                        id : createdFrom
                    });*/
                }
                //create Jv Record
                if(createdFrom){
                    var journalVoucherRec = record.load({
                    type: 'customtransaction_da_journal_voucher',
                    id:createdFrom,
                    isDynamic: true
                });
                    var jvLineCount =journalVoucherRec.getLineCount({
                     sublistId: "line"
                 });
                for(var j=jvLineCount-1;j>=0;j--)
                {
                    journalVoucherRec.removeLine({
                    sublistId: 'line',
                    line: j
                    });
                }
                } 
                else
                {
                var journalVoucherRec = record.create({
                    type: 'customtransaction_da_journal_voucher',
                    isDynamic: true
                });
                }
                journalVoucherRec.setValue('subsidiary', subsidiary);
                journalVoucherRec.setValue('trandate', date);
                journalVoucherRec.setValue('postingperiod', postingPeriod);
                journalVoucherRec.setValue('transtatus', status);
                journalVoucherRec.setValue('currency', currency);
                journalVoucherRec.setValue('memo', memo);
                journalVoucherRec.setValue('custbody_da_fc_amount', fcAmount);
                journalVoucherRec.setValue('exchangerate', exchangeRate);
                journalVoucherRec.setValue('custbody_da_amt_kd', amountKD);
                journalVoucherRec.setValue('custbody_da_created_from_ref', id);
               /* var jvLineCount =journalVoucherRec.getLineCount({
                     sublistId: "line"
                 });
                log.debug('jvLineCount',jvLineCount);
                for(var j=jvLineCount-1;j=0;j--)
                {
                    log.debug('dfgdfhgfhgh');
                    journalVoucherRec.removeLine({
                    sublistId: 'line',
                    line: j
                    });
                }*/

                var lineCount = scriptContext.newRecord.getLineCount({
                    sublistId: "line"
                });
                for (var i = 0; i < lineCount; i++) {
                    var account = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "account",
                        line: i
                    });
                    log.debug('account', account);
                    var lineAmount = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "custcol_da_dr_3_decimal",
                        line: i
                    });
                    var department = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "department",
                        line: i
                    });
                    var allocation = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "custcol_da_allocate_amt",
                        line: i
                    });
                    var creditCheck = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "custcol_da_tran_nature",
                        line: i
                    });
                    var memo = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "memo",
                        line: i
                    });
                    var amount = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "amount",
                        line: i
                    });
                    var flagSubledger = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "custcol_da_tran_flg_sublgr",
                        line: i
                    });
                    journalVoucherRec.selectNewLine({
                        sublistId: 'line'
                    })
                    journalVoucherRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: account
                    });
                    if (creditCheck == true) {
                        journalVoucherRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_da_cr_3_decimal',
                            value: lineAmount
                        });
                        journalVoucherRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: amount
                        });
                    } else {
                        journalVoucherRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_da_dr_3_decimal',
                            value: lineAmount
                        });
                        journalVoucherRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: amount
                        });
                    }
                    if(memo){
                         journalVoucherRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: memo
                        });
                    }
                    if(flagSubledger){
                        journalVoucherRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_da_tran_flg_sublgr',
                            value: flagSubledger
                        });
                    }
                    if(department){
                         journalVoucherRec.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            value: department
                        });
                    }
                    journalVoucherRec.commitLine({
                        sublistId: 'line'
                    });
                }
                var journalVoucherRecId = journalVoucherRec.save();
                log.debug('journalVoucherRec', journalVoucherRec);
                
              
                 for (var i = 0; i < lineCount; i++) {
                     var glRec = record.create({
                        type :'customrecord_da_gl_data_base'
                    });

                     var account = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "account",
                        line: i
                    });
                    glRec.setValue('custrecord_da_gl_account', account);
                    glRec.setValue('custrecord_da_gl_subsidiary', scriptContext.newRecord.getValue('subsidiary'));
                    glRec.setValue('custrecord_da_gl_date', scriptContext.newRecord.getValue('trandate'));
                    glRec.setValue('custrecord_da_posting_period', scriptContext.newRecord.getValue('postingperiod'));
                    glRec.setValue('custrecord_da_gl_impact_created_from', journalVoucherRecId);

                     var department = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "department",
                        line: i
                    });
                     if(department){
                         glRec.setValue('custrecord_da_gl_department', department);
                     }
                    
                     var creditCheck = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "custcol_da_tran_nature",
                        line: i
                    });
                     var lineAmount = scriptContext.newRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "custcol_da_dr_3_decimal",
                        line: i
                    });

                     if(creditCheck){
                        glRec.setValue('custrecord_da_gl_credit', lineAmount);
                     }else{
                        glRec.setValue('custrecord_da_gl_debit', lineAmount);
                     }
                     glRec.save();

                 }
                 record.submitFields({
                    type : 'customtransaction_da_chq_basic',
                    id : id,
                    values : {
                        'custbody_da_created_from_ref' : journalVoucherRecId
                    }
                   })

                record.submitFields({
                    type : 'customtransaction_da_wt_basic',
                    id : id,
                    values : {
                        'custbody_da_created_from_ref' : journalVoucherRecId
                    }
                })

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
/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task', 'N/search', 'N/record'],

    function(task, search, record) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
                var recType = scriptContext.newRecord.type;
                log.debug('recType', recType);
                var recId = scriptContext.newRecord.id;
                log.debug('recId', recId);
                var eclProvisionRec = record.load({
                    type: recType,
                    id: recId
                });
                var subsidiaryId = scriptContext.newRecord.getValue('custrecord_da_ecl_provision_subsidiary');
                log.debug('subsidiaryId',subsidiaryId);
                var provisionAmount = scriptContext.newRecord.getValue('custrecord_da_ecl_provision_amount');
                log.debug('provisionAmount',provisionAmount);
                var eclSettingsRec = search.create({
                    type: "customrecord_da_ecl_setting",
                    filters:
                            [
                                ["custrecord_da_ecl_subsidiary",'anyof',subsidiaryId]
                                ],
                    columns: [
                             'custrecord_da_ecl_provision_account', 'custrecord_da_ecl_provision_expesne'
                    ]
                });
                var count = eclSettingsRec.runPaged().count;
                log.debug('count',count);
                eclSettingsRec.run().each(function(result){
                    var creditAccount = result.getValue('custrecord_da_ecl_provision_account');
                    log.debug('creditAccount',creditAccount);
                    var debitAccount = result.getValue('custrecord_da_ecl_provision_expesne');
                    log.debug('debitAccount',debitAccount);

                    var journalEntryRec = record.create({
                            type: 'customtransaction_da_ecl_provision_journ',
                            isDynamic: true
                        });
                    journalEntryRec.setValue('subsidiary',subsidiaryId);
                    journalEntryRec.setValue('custbody_da_created_from_lclg',recId);
                   journalEntryRec.setValue('trandate',scriptContext.newRecord.getValue('custrecord_da_ecl_date'));
                  
                     journalEntryRec.selectNewLine({
                        sublistId: 'line'
                    });
                    journalEntryRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: debitAccount
                    });
                    journalEntryRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        value: Number(provisionAmount).toFixed(2)
                    });
                    journalEntryRec.commitLine({
                        sublistId: 'line'
                    });

                    journalEntryRec.selectNewLine({
                        sublistId: 'line'
                    });
                    journalEntryRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: creditAccount
                    });
                    journalEntryRec.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        value: Number(provisionAmount).toFixed(2)
                    });
                    journalEntryRec.commitLine({
                        sublistId: 'line'
                    });

                 
                    var journalEntryRecId = journalEntryRec.save({
                        ignoreMandatoryFields: true
                    });
                    log.debug('journalEntryRecId',journalEntryRecId);
                    
                    eclProvisionRec.setValue('custrecord_da_ecl_gl_reference',journalEntryRecId);
                    var recordID = eclProvisionRec.save();
                    log.debug('recordID',recordID);
                    return true;
                });
            } catch (ex) {

                log.error(ex.name, ex.message);
            }
        }

        return {
            onAction: onAction
        };
    });
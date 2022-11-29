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
                var newAmount = 0;
                var glAccountDebit = scriptContext.newRecord.getValue('account');
                log.debug('glAccountDebit',glAccountDebit);
                var glAccountCredit = scriptContext.newRecord.getValue('custbody_da_rounding_gain_loss');
                log.debug('glAccountCredit',glAccountCredit);
                var amountDue = scriptContext.newRecord.getValue('custbody_da_amount_due');
                log.debug('amountDue',amountDue);
                var billDate = scriptContext.newRecord.getValue('trandate');
                log.debug('billDate',billDate);
                var subsidiaryID = scriptContext.newRecord.getValue('subsidiary');
                log.debug('subsidiaryID',subsidiaryID);
                var poPeriod = scriptContext.newRecord.getValue('postingperiod');
                log.debug('poPeriod',poPeriod);
                var locationID = scriptContext.newRecord.getValue('location');
                log.debug('locationID',locationID);
                var departmentID = scriptContext.newRecord.getValue('department');
                log.debug('departmentID',departmentID);
                var classID = scriptContext.newRecord.getValue('class');
                log.debug('classID',classID);
                if(amountDue < 0){
                    newAmount = -(amountDue).toFixed(3);
                    log.debug('newAmount',newAmount);
                    var trialBalRec = record.create({
                            type: 'customrecord_da_gl_data_base',
                            isDynamic: true
                        });
                    trialBalRec.setValue('custrecord_da_gl_account',glAccountDebit);
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiaryID);
                    trialBalRec.setValue('custrecord_da_gl_debit',newAmount);
                    trialBalRec.setValue('custrecord_da_gl_date',billDate);
                    trialBalRec.setValue('custrecord_da_posting_period',poPeriod);
                    trialBalRec.setValue('custrecord_da_gl_memo',"Currency Revaluation");
                    trialBalRec.setValue('custrecord_da_gl_location',locationID);
                    trialBalRec.setValue('custrecord_da_gl_department',departmentID);
                    trialBalRec.setValue('custrecord_da_gl_class',classID);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',17);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',recId);
                    var trialBalRecId = trialBalRec.save();
                    log.debug('trialBalRecId',trialBalRecId);

                    var trialBalRecord = record.create({
                            type: 'customrecord_da_gl_data_base',
                            isDynamic: true
                        });
                    trialBalRecord.setValue('custrecord_da_gl_account',glAccountCredit);
                    trialBalRecord.setValue('custrecord_da_gl_subsidiary',subsidiaryID);
                    trialBalRecord.setValue('custrecord_da_gl_credit',newAmount);
                    trialBalRecord.setValue('custrecord_da_gl_date',billDate);
                    trialBalRecord.setValue('custrecord_da_posting_period',poPeriod);
                    trialBalRecord.setValue('custrecord_da_gl_memo',"Currency Revaluation");
                    trialBalRecord.setValue('custrecord_da_gl_location',locationID);
                    trialBalRecord.setValue('custrecord_da_gl_department',departmentID);
                    trialBalRecord.setValue('custrecord_da_gl_class',classID);
                    trialBalRecord.setValue('custrecord_da_gl_impact_transaction_type',17);
                    trialBalRecord.setValue('custrecord_da_gl_impact_created_from',recId);
                    var trialBalRecordId = trialBalRecord.save();
                    log.debug('trialBalRecordId',trialBalRecordId);
                }
                if(amountDue > 0){
                    amountDue = amountDue.toFixed(3);
                    log.debug('amountDue',amountDue);
                    var trialBalRec = record.create({
                            type: 'customrecord_da_gl_data_base',
                            isDynamic: true
                        });
                    trialBalRec.setValue('custrecord_da_gl_account',glAccountCredit);
                    trialBalRec.setValue('custrecord_da_gl_subsidiary',subsidiaryID);
                    trialBalRec.setValue('custrecord_da_gl_debit',amountDue);
                    trialBalRec.setValue('custrecord_da_gl_date',billDate);
                    trialBalRec.setValue('custrecord_da_posting_period',poPeriod);
                    trialBalRec.setValue('custrecord_da_gl_memo',"Currency Revaluation");
                    trialBalRec.setValue('custrecord_da_gl_location',locationID);
                    trialBalRec.setValue('custrecord_da_gl_department',departmentID);
                    trialBalRec.setValue('custrecord_da_gl_class',classID);
                    trialBalRec.setValue('custrecord_da_gl_impact_transaction_type',17);
                    trialBalRec.setValue('custrecord_da_gl_impact_created_from',recId);
                    var trialBalRecId = trialBalRec.save();
                    log.debug('trialBalRecId',trialBalRecId);

                    var trialBalRecord = record.create({
                            type: 'customrecord_da_gl_data_base',
                            isDynamic: true
                        });
                    trialBalRecord.setValue('custrecord_da_gl_account',glAccountDebit);
                    trialBalRecord.setValue('custrecord_da_gl_subsidiary',subsidiaryID);
                    trialBalRecord.setValue('custrecord_da_gl_credit',amountDue);
                    trialBalRecord.setValue('custrecord_da_gl_date',billDate);
                    trialBalRecord.setValue('custrecord_da_posting_period',poPeriod);
                    trialBalRecord.setValue('custrecord_da_gl_memo',"Currency Revaluation");
                    trialBalRecord.setValue('custrecord_da_gl_location',locationID);
                    trialBalRecord.setValue('custrecord_da_gl_department',departmentID);
                    trialBalRecord.setValue('custrecord_da_gl_class',classID);
                    trialBalRecord.setValue('custrecord_da_gl_impact_transaction_type',17);
                    trialBalRecord.setValue('custrecord_da_gl_impact_created_from',recId);
                    var trialBalRecordId = trialBalRecord.save();
                    log.debug('trialBalRecordId',trialBalRecordId);
                }
            } catch (ex) {

                log.error(ex.name, ex.message);
            }
        }

        return {
            onAction: onAction
        };
    });
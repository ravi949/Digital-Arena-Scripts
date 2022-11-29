/**
 * Copyright (c) 1998-2015 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
 * (Module description here. Whole header length should not exceed 
 * 100 characters in width. Use another line if needed.)
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Apr 2015     pdeleon   Initial version.
 * 
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @return {void}
 */
function scheduled_Async(type) {
    try {
        nlapiLogExecution('DEBUG','Scheduled Script','***Background Process Scheduled Script - STARTED***');
        
        var stSchedRun = nlapiGetContext().getSetting('SCRIPT',SPARAM_SCHED_RUN);
        var arrParams = [];
        if (stSchedRun == 'T') {
            nlapiLogExecution('debug', 'sched', '');
            arrParams = retrieveTransactionsForScheduledRun();
        } else {
            nlapiLogExecution('debug', 'not sched', '');
            var objParam = {
                    type : nlapiGetContext().getSetting('SCRIPT',SPARAM_TXN_TYP),
                    id : nlapiGetContext().getSetting('SCRIPT',SPARAM_TXN_ID)
            };
            arrParams.push(objParam);
        }

//        var stRecId = nlapiGetContext().getSetting('SCRIPT',SPARAM_TXN_ID);
//        var stRecType = nlapiGetContext().getSetting('SCRIPT',SPARAM_TXN_TYP);
        var arrProcessedIds = [];
        for (var intCtr in arrParams) {
            var objParam = arrParams[intCtr];
            if (!isEmpty(objParam)) {
                try {
                    var stRecId = objParam.id;
                    var stRecType = objParam.type;
                    if (!isNaN(stRecType)) {
                        //If record type is a number, convert to corresponding record type in text
                        stRecType = HC_REBATE_TRAN_TYPE[stRecType];
                    }
    
                    nlapiLogExecution('DEBUG','Scheduled Script', 'stRecId '  + stRecId + ' stRecType : ' + stRecType);
    
                    var recTxn = nlapiLoadRecord(stRecType,stRecId);
                    var blBackgroundProcess = recTxn.getFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND);
    
                    nlapiLogExecution('DEBUG','Scheduled Script','Transaction Type : ' + stRecType +' Transaction Id:  ' + stRecId + '  Background Processing Flag ' + blBackgroundProcess );
    
                    var objError = null;
                    var context = nlapiGetContext();
                    if( blBackgroundProcess =='T') {
    //                    recTxn.setFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND,'F');
                        try{
                            updatedRebateTransactionRecords_Async(recTxn);
                            
                            var intTranId = recTxn.getFieldValue('tranid');
                            var intTranNum = recTxn.getFieldValue('transactionnumber');
                            var stRecType = recTxn.getRecordType();
                            var stEntityText = recTxn.getFieldText('entity');
                            arrProcessedIds.push({
                                tranID : intTranId,
                                tranNum : intTranNum,
                                recType : stRecType,
                                entity : stEntityText
                            });

                            //SEND NOTIFICATION EMAIL TO USER
                            try {
                                if (!isEmpty(context.getEmail())) {
                                    var intTransNo = (!isEmpty(intTranId)) ? intTranId : intTranNum;
                                    var stTransactionUrl = nlapiResolveURL('RECORD', recTxn.getRecordType(), stRecId, 'VIEW');
                                    nlapiSendEmail(
                                            context.getUser(),
                                            context.getEmail(),
                                            'Background Rebate Calculation is Complete for ' + recTxn.getRecordType() + ' '
                                                    + intTransNo,
                                            'The rebate calculation has been completed.<br>' + 'Click here to view the transaction:  https://system.na1.netsuite.com' + stTransactionUrl);
                                }
                            } catch (error) { 
                                //Do nothing, most likely error encountered when getting email is invalid user or email address
                            }
                        }catch(error){
                            objError = error;
                            if (error.getDetails != undefined) {
                               nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
                            }else {
                               nlapiLogExecution('ERROR', 'Unexpected Error', error.toString());
                            }

                            var arrFields = [FLD_RECALCULATE_REBATES,
                                             FLD_RECALC_REBATES_IN_BACKGROUND,
                                             FLD_CUSTBODY_RM_ER_CODE];
                            var arrValues = ['F',
                                             'F',
                                             error.toString()];

                            nlapiSubmitField(stRecType, stRecId, arrFields, arrValues);

                            //SEND NOTIFICATION EMAIL TO USER
                            if (!isEmpty(context.getEmail())) {
                                var intTransNo = (!isEmpty(recTxn.getFieldValue('tranid'))) ? recTxn.getFieldValue('tranid') : 
                                    recTxn.getFieldValue('transactionnumber');
                                var stTransactionUrl = nlapiResolveURL('RECORD', recTxn.getRecordType(), stRecId, 'VIEW');
                                var stMaxFieldMsg = 'Maximum field length error is encountered for Selected Applicable Rebates. Please check if there are more than 10 applicable Rebate Agreements per line item. Rebate Transaction and Details will be successfully created if there would be 10 or less than 10 Rebate Agreements per line item.<br/>';
                                try {
                                	if(error.getCode() != 'EXCEEDED_MAX_FIELD_LENGTH')
                                		stMaxFieldMsg = '';
                                	var objAttachEmp 					= [];
                                	objAttachEmp['entity'] 			= context.getUser();
                                    nlapiSendEmail(
                                            context.getUser(),
                                            context.getEmail(),
                                            'Background Rebate Calculation has encountered a problem for ' + recTxn.getRecordType() + ' '
                                                    + intTransNo,
                                            'The rebate calculation has encountered a problem.<br>' +stMaxFieldMsg+ 'Click <a  href="'+stTransactionUrl+'">here</a> to view the transaction.',
                                            null,
                                            null,
                                            objAttachEmp);
                                } catch (error) {
                                    if (error.getDetails != undefined) {
                                        nlapiLogExecution('ERROR', 'Error sending email (Background Rebate Calculation)', error.getCode() + ': ' + error.getDetails());
                                        //throw error;
                                     } else {
                                        nlapiLogExecution('ERROR', 'Error sending email (Background Rebate Calculation)', error.toString());
                                        //throw nlapiCreateError('99999', error.toString());
                                     }
                                }
                            }
                            
                        }

                        nlapiLogExecution('DEBUG','Transaction Successfully Saved','***stRecId=' + stRecId + '***');
                    }
                } catch (error) {
                    if (error.getDetails != undefined) {
                        nlapiLogExecution('ERROR', 'Process Error (Scheduled Script)', error.getCode() + ': ' + error.getDetails());
                        //throw error;
                     } else {
                        nlapiLogExecution('ERROR', 'Unexpected Error (Scheduled Script)', error.toString());
                        //throw nlapiCreateError('99999', error.toString());
                     }

                    var arrFields = [FLD_RECALCULATE_REBATES,
                                     FLD_RECALC_REBATES_IN_BACKGROUND,
                                     FLD_CUSTBODY_RM_ER_CODE];
                    var arrValues = ['F',
                                     'F',
                                     error.toString()];
                    
                    nlapiSubmitField(stRecType, stRecId, arrFields, arrValues);
                }
            }
        }
        
        if (stSchedRun == 'T') {
            try {
                var stEmailId = nlapiGetContext().getSetting('SCRIPT',SPARAM_EMAIL_ID);
                var stEmailAdd = nlapiGetContext().getSetting('SCRIPT',SPARAM_EMAIL_ADD);
                
                var stBody = 'The rebate calculation has been completed for the following transactions.<br>';
                for (var intCtr = 0; intCtr < arrProcessedIds.length; intCtr++) {
                    stBody += 'ID: ' + arrProcessedIds[intCtr].tranID 
                    + ' | Number: ' + arrProcessedIds[intCtr].recType + ' ' + arrProcessedIds[intCtr].tranNum 
                    + ' | Entity: ' + arrProcessedIds[intCtr].entity + '<br>';
                }
                
                if(!isEmpty(stEmailId) && !isEmpty(stEmailAdd)){
                	nlapiSendEmail(
                        stEmailId,
                        stEmailAdd,
                        'Scheduled Background Rebate Calculation is Complete for ' + arrProcessedIds.length + ' records',
                        stBody);
                }else{
                	if(isEmpty(stEmailId))
                		nlapiLogExecution('ERROR', 'Error sending email (Scheduled Background Rebate)', 'Scheduled Run Email User ID is not specified.');
                	if(isEmpty(stEmailAdd))
                		nlapiLogExecution('ERROR', 'Error sending email (Scheduled Background Rebate)', 'Schedule Run Email Address is not specified.');
                }
            } catch (error) {
                if (error.getDetails != undefined) {
                    nlapiLogExecution('ERROR', 'Error sending email (Scheduled Background Rebate)', error.getCode() + ': ' + error.getDetails());
                    //throw error;
                 } else {
                    nlapiLogExecution('ERROR', 'Error sending email (Scheduled Background Rebate)', error.toString());
                    //throw nlapiCreateError('99999', error.toString());
                 }
            }
        }
        /*nlapiLogExecution('DEBUG','Scheduled Script', 'stRecId '  + stRecId + ' stRecType : ' + stRecType);

        var recTxn = nlapiLoadRecord(stRecType,stRecId);
        var blBackgroundProcess = recTxn.getFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND);

        nlapiLogExecution('DEBUG','Scheduled Script','Transaction Type : ' + stRecType +' Transaction Id:  ' + stRecId + '  Background Processing Flag ' + blBackgroundProcess );

        var objError = null;
        if( blBackgroundProcess =='T') {
//            recTxn.setFieldValue(FLD_RECALC_REBATES_IN_BACKGROUND,'F');
            var context = nlapiGetContext();

            try{
                updatedRebateTransactionRecords_Async(recTxn);

                //SEND NOTIFICATION EMAIL TO USER
                if (!isEmpty(context.getEmail())) {
                    var intTransNo = (!isEmpty(recTxn.getFieldValue('tranid'))) ? recTxn.getFieldValue('tranid') : 
                        recTxn.getFieldValue('transactionnumber');
                    var stTransactionUrl = nlapiResolveURL('RECORD', recTxn.getRecordType(), stRecId, 'VIEW');
                    nlapiSendEmail(
                            context.getUser(),
                            context.getEmail(),
                            'Background Rebate Calculation is Complete for [' + recTxn.getRecordType() + ' '
                                    + intTransNo + ']',
                            'The rebate calculation has been completed.<br>' + 'Click here to view the transaction:  https://system.na1.netsuite.com' + stTransactionUrl);
                }
            }catch(error){
                objError = error;
                if (error.getDetails != undefined) {
                   nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
                }else {
                   nlapiLogExecution('ERROR', 'Unexpected Error', error.toString());
                }
                //SEND NOTIFICATION EMAIL TO USER
                if (!isEmpty(context.getEmail())) {
                    var intTransNo = (!isEmpty(recTxn.getFieldValue('tranid'))) ? recTxn.getFieldValue('tranid') : 
                        recTxn.getFieldValue('transactionnumber');
                    var stTransactionUrl = nlapiResolveURL('RECORD', recTxn.getRecordType(), stRecId, 'VIEW');
                    nlapiSendEmail(
                            context.getUser(),
                            context.getEmail(),
                            'Background Rebate Calculation has encountered a problem for [' + recTxn.getRecordType() + ' '
                                    + intTransNo + ']',
                            'The rebate calculation has encountered a problem.<br>' + 'Click here to view the transaction:  https://system.na1.netsuite.com' + stTransactionUrl);
                }
            }
        }

        nlapiLogExecution('DEBUG','Transaction Successfully Saved','***stRecId=' + stRecId + '***');*/
        nlapiLogExecution('DEBUG','Scheduled Script','***Background Process Flag Scheduled Script - FINISHED***');
    }
    catch(error)
    {
        if (error.getDetails != undefined) {
           nlapiLogExecution('ERROR', 'Process Error (Background Process)', error.getCode() + ': ' + error.getDetails());
           //throw error;
        } else {
           nlapiLogExecution('ERROR', 'Unexpected Error (Background Process)', error.toString());
           //throw nlapiCreateError('99999', error.toString());
        }
    }
}

/**
 * Creates the Rebate Transaction records for the transaction asynchronously
 * 
 */
function updatedRebateTransactionRecords_Async(recNewRec) {
    updatedRebateTransactionRecords(recNewRec);
}

function retrieveTransactionsForScheduledRun() {
    var stLogTitle = 'Retrieve Transactions For Scheduled Run..';
    var arrTranIds = [];
    
    try{
        var arrTran = retrieveTranTypesForScheduledRun();
        
        if (!isEmpty(arrTran)) {
            arrTranIds = retrieveBGTransactionsFromTranType(arrTran);
        }
        
    } catch (error) {
        if (error.getDetails != undefined)
        {
           nlapiLogExecution('ERROR', stLogTitle, error.getCode() + ': ' + error.getDetails());
           //throw error;
        }
        else
        {
           nlapiLogExecution('ERROR', stLogTitle, error.toString());
           //throw nlapiCreateError('99999', error.toString());
        }
    }
    
    return arrTranIds;
}

function retrieveBGTransactionsFromTranType(arrTran) {
    var stLogTitle = 'Retrieving Transaction Ids from Tran Types for procesing..';
    var arrTranId = [];
    
    var arrSearchTran = [];
    for (var intCtr in arrTran) {
        arrSearchTran.push(HC_TRAN_TYPE_TO_SEARCH_TYPE[HC_REBATE_TRAN_TYPE_NUM[arrTran[intCtr]]]);
    }
    
    var arrParam = [new nlobjSearchFilter(FLD_TYPE, null, 'anyof', arrSearchTran),
                    new nlobjSearchFilter(FLD_RECALC_REBATES_IN_BACKGROUND, null, 'is', 'T')];
    
    var arrCol = [new nlobjSearchColumn(FLD_INTERNAL_ID),
                  new nlobjSearchColumn(FLD_TYPE)];
    
    var arrResults = getAllResults(REC_TRANSACTION, null, arrParam, arrCol);
    arrResults = arrResults.results;
    
    if (!isEmpty(arrResults)) {
        for (var intCtr in arrResults) {
            arrTranId.push({
                type : HC_SEARCH_TYPE_TO_TRAN_TYPE[arrResults[intCtr].getValue(FLD_TYPE)],
                id : arrResults[intCtr].getValue(FLD_INTERNAL_ID)});
        }
    }
    
    return arrTranId;
}
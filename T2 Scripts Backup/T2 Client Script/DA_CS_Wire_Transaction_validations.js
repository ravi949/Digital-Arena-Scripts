/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/url', 'N/currentRecord'],
    /**
     * @param {record}
     *            record
     * @param {search}
     *            search
     */
    function(record, search, url, currentRecord) {

        /**
         * Function to be executed after page is initialized.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.mode - The mode in which the record is
         *            being accessed (create, copy, or edit)
         * 
         * @since 2015.2
         */
        var context;

        function pageInit(scriptContext) {
            // alert("hello");
             if(scriptContext.mode=="create")
               {
           scriptContext.currentRecord.setValue("custbody_da_created_from_ref"," ");
               }
        }

        /**
         * Function to be executed when field is changed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * @param {number}
         *            scriptContext.lineNum - Line number. Will be undefined
         *            if not a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be
         *            undefined if not a matrix field
         * 
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {

            try {

                if (scriptContext.fieldId == "custcol_da_dr_3_decimal") {
                    var threeDecimalValue = scriptContext.currentRecord.getCurrentSublistValue('line', 'custcol_da_dr_3_decimal');

                    
                    if (Number(threeDecimalValue) <=0) {
                        alert('Value must be postive');
                        console.log('threeDecimalValue',threeDecimalValue);

                        if(threeDecimalValue)
                        {
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_da_dr_3_decimal',
                            value: ''
                        });
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'amount',
                            value: ''
                        });
                       }
                        return false;
                    } else {
                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'amount',
                            value: Number(threeDecimalValue).toFixed(2)
                        })
                    }
                }

            } catch (ex) {
                console.log(ex.name, ex.message);
            }


        }

        /**
         * Function to be executed when field is slaved.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * 
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or
         * edited.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @since 2015.2
         */
        function lineInit(scriptContext) {

        }

        /**
         * Validation function to be executed when field is changed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * @param {number}
         *            scriptContext.lineNum - Line number. Will be undefined
         *            if not a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be
         *            undefined if not a matrix field
         * 
         * @returns {boolean} Return true if field is valid
         * 
         * @since 2015.2
         */
        function validateField(scriptContext) {
            try {


            } catch (ex) {
                console.log(ex.name, ex.message);
            }


        }

        /**
         * Validation function to be executed when sublist line is
         * committed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateLine(scriptContext) {
            try {
                if (scriptContext.sublistId == "line") {

                    var flagSubLedger = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: "line",
                        fieldId: 'custcol_da_tran_flg_sublgr'
                    });
                    var subLedgerName = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: "line",
                        fieldId: 'entity'
                    });
                    if (flagSubLedger == 1 && subLedgerName) {
                        var subLedgerName = scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: "line",
                            fieldId: 'entity',
                            value: ""
                        });
                    }
                    if (flagSubLedger == 2 && !subLedgerName) {
                        alert("Please enter Subledger");
                        return false;
                    }
                    return true;
                }

            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }


        /**
         * Validation function to be executed when sublist line is inserted.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         * 
         * @since 2015.2
         */
        function saveRecord(context) {
            try {
                var totalLineAmount = 0;
                var bankAccount =context.currentRecord.getValue('custbody_da_gl_acct_no_');
                var lineCount = context.currentRecord.getLineCount({
                    sublistId: "line"
                });
                var subsidiary = context.currentRecord.getValue('subsidiary');
                var debitAmount = 0;

                for (var i = 0; i < lineCount; i++) {
                    console.log('lineCount',lineCount);
                    var credit = context.currentRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "custcol_da_tran_nature",
                        line: i
                    });
                    var amount = context.currentRecord.getSublistValue({
                            sublistId: "line",
                            fieldId: "custcol_da_dr_3_decimal",
                            line: i
                        });
                    if(credit == true){                        
                        totalLineAmount = parseFloat(totalLineAmount) + parseFloat(amount);


                    }else{
                        debitAmount = parseFloat(debitAmount) + parseFloat(amount);
                    }
                }
                 console.log('totalLineAmount1',totalLineAmount);
                 console.log('debitAmount',debitAmount);
                if(totalLineAmount != debitAmount){
                    //var variance = (parseFloat(totalLineAmount)-parseFloat(debitAmount)).toFixed(3);
                    var variance = parseFloat(debitAmount)-parseFloat(totalLineAmount);
                        console.log('variance',variance);
                        console.log('bankAccount',bankAccount);
                         context.currentRecord.selectNewLine({
                                sublistId: 'line'
                            });
                       context.currentRecord.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: bankAccount
                            });
                       
                        if(debitAmount>totalLineAmount)
                    {
                        context.currentRecord.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'custcol_da_dr_3_decimal',
                                value: variance
                            });
                       context.currentRecord.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'custcol_da_tran_nature',
                                value: true
                            });
                   }
                   else
                   {
                    context.currentRecord.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'custcol_da_dr_3_decimal',
                                value: -(variance)
                            });
                    context.currentRecord.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'custcol_da_tran_nature',
                                value: false
                            });
                }
                        context.currentRecord.commitLine({
                                sublistId: 'line'
                            });
                    return false;
                }
                for (var i = 0; i < lineCount; i++) {
                    console.log('i', i);
                    var lineAmount = context.currentRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "custcol_da_dr_3_decimal",
                        line: i
                    });
                    
                    console.log('lineAmount', lineAmount);
                    var account = context.currentRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "account",
                        line: i
                    });

                    var credit = context.currentRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "custcol_da_tran_nature",
                        line: i
                    });

                    var allocation = context.currentRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "custcol_da_allocate_amt",
                        line: i
                    });
                  
                  var memo = context.currentRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "memo",
                        line: i
                    });

                   

                    var department = context.currentRecord.getSublistValue({
                        sublistId: "line",
                        fieldId: "department",
                        line: i
                    });
                    
                    console.log('allocation', allocation);

                    if (allocation == true) {


                        var allocationSearchObj = search.create({
                            type: "customrecord_da_all_dest",
                            filters: [
                                ['custrecord_da_all_sett.custrecord_da_subs', 'anyof', subsidiary], "AND", ['custrecord_da_all_sett.custrecord_da_allacc', 'anyof', account]
                            ],
                            columns: [

                                search.createColumn({
                                    name: "custrecord_da_all_acc",
                                    label: "accId"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_dest_wght",
                                    label: "weight"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_dest_dept",
                                    label: "Department"
                                }),
                                search.createColumn({
                                    name: "custrecord_da_alloc_prcnt",
                                    join: "CUSTRECORD_DA_ALL_SETT",
                                    label: "Values are Percentage"
                                })
                            ]
                        });
                        var allocationSearchObjCount = allocationSearchObj.runPaged().count;
                        console.log("allocationSearchObj count", allocationSearchObjCount);

                        var weightTotal = 0;
                        allocationSearchObj.run().each(function(result) {

                            var weight = result.getValue('custrecord_da_dest_wght');
                            weightTotal = parseFloat(weightTotal) + parseFloat(weight);
                            return true;
                        });

                        allocationSearchObj.run().each(function(result) {
                            var accountId = result.getValue('custrecord_da_all_acc');
                            console.log('accountId', accountId);
                            var weight = result.getValue('custrecord_da_dest_wght');
                            console.log('weight', weight);
                            var checkPercentage = result.getValue({
                                name: "custrecord_da_alloc_prcnt",
                                join: 'custrecord_da_all_sett'
                            });
                            console.log('checkPercentage', checkPercentage);

                            var value;

                            if (checkPercentage == true) {
                                value = (weight / 100) * lineAmount;
                            } else {
                                value = (weight * lineAmount) / weightTotal;
                            }

                            context.currentRecord.selectNewLine({
                                sublistId: 'line'
                            });
                            context.currentRecord.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: accountId
                            });
                            context.currentRecord.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'custcol_da_dr_3_decimal',
                                value: value.toFixed(3)
                            });
                            context.currentRecord.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'amount',
                                value: value.toFixed(2)
                            });

                            if(credit == true){
                                 context.currentRecord.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'custcol_da_tran_nature',
                                    value: true
                                 });
                            }
                          
                          if(memo){
                                context.currentRecord.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'memo',
                                    value: memo
                                 });
                          }

                            var department = result.getValue('custrecord_da_dest_dept');
                            if (department) {
                                context.currentRecord.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'department',
                                    value: department
                                });
                            }
                            context.currentRecord.commitLine({
                                sublistId: 'line'
                            });

                            return true;
                        });

                        if (allocationSearchObjCount > 0) {
                            context.currentRecord.removeLine({
                                sublistId: 'line',
                                line: i,
                                ignoreRecalc: true
                            });
                        }
                    }
                }

                
                var fcAmount = context.currentRecord.getValue('custbody_da_fc_amount');
                totalLineAmount = totalLineAmount.toFixed(3);
                console.log(fcAmount);
                console.log(totalLineAmount);

                if (totalLineAmount != fcAmount) {
                    var diff =parseFloat(totalLineAmount)-parseFloat(fcAmount);
                    alert('The Total line amount should equal to the FC Amount \n variance:'+diff.toFixed(3)+'');
                    return false;
                } else {
                    return true;
                }
            } catch (ex) {
                console.log(ex.name, ex.message);
            }
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            saveRecord: saveRecord,
            // getSuiteletPage:getSuiteletPage


        };

    });
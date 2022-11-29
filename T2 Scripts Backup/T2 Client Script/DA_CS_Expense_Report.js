/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],

        function(search, record) {

            /**
             * Function to be executed after page is initialized.
             *
             * @param {Object} scriptContext
             * @param {Record} scriptContext.currentRecord - Current form record
             * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
             *
             * @since 2015.2
             */

            function pageInit(scriptContext) {

            }

            /**
             * Function to be executed when field is changed.
             *
             * @param {Object} scriptContext
             * @param {Record} scriptContext.currentRecord - Current form record
             * @param {string} scriptContext.sublistId - Sublist name
             * @param {string} scriptContext.fieldId - Field name
             * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
             * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
             *
             * @since 2015.2
             */
            function fieldChanged(scriptContext) {


                if (scriptContext.fieldId == 'rate') {
                    var debitamount = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate'
                    });
                  
                  if(debitamount){
                      scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'debit',
                        value: debitamount
                    });
                  }

                  
                }

                if (scriptContext.fieldId == 'custcol_da_dr_3_decimal') {
                    var debitamount = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_da_dr_3_decimal'
                    });
  if(debitamount){
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        value: debitamount
                    });
  }
                }

                if (scriptContext.fieldId == 'custcol_da_cr_3_decimal') {
                    var creditamount = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_da_cr_3_decimal'
                    });
  if(creditamount){
                    scriptContext.currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        value: creditamount
                    });
  }
                }

                if(scriptContext.fieldId =="rate"){
                    var project =scriptContext.currentRecord.getValue('job');

                    if(!project){
                         var rate = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate'
                    });

                         scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_da_rate_3_decimal_value',
                            value: Number(rate).toFixed(3)
                        });
                    }
                }


                if (scriptContext.fieldId == 'foreignamount' || scriptContext.fieldId == 'exchangerate') {
                    var amount = scriptContext.currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'foreignamount'
                    });

                    console.log(amount);

                    if(amount) {
                        var exchangeRate = scriptContext.currentRecord.getCurrentSublistValue({
                            sublistId: 'expense',
                            fieldId: 'exchangerate'
                        });

                        console.log(exchangeRate);

                        var finalAmount = (amount * exchangeRate);

                        scriptContext.currentRecord.setCurrentSublistValue({
                            sublistId: 'expense',
                            fieldId: 'custcol_da_amount_3_decimal_expense_r',
                            value: finalAmount.toFixed(3)
                        });
                    }
                }

            }


            /**
             * Function to be executed when field is slaved.
             *
             * @param {Object} scriptContext
             * @param {Record} scriptContext.currentRecord -. Current form record
             * @param {string} scriptContext.sublistId - Sublist name
             * @param {string} scriptContext.fieldId - Field name
             *
             * @since 2015.2
             */
            function postSourcing(scriptContext) {
                try {

                   } catch (ex) {
                        console.log(ex.name, ex.message);
                    }

                }

                /**
                 * Function to be executed after sublist is inserted, removed, or edited.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
                 *
                 * @since 2015.2
                 */
                function sublistChanged(scriptContext) {

                }

                /**
                 * Function to be executed after line is selected.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
                 *
                 * @since 2015.2
                 */
                function lineInit(scriptContext) {
                    try {

                        if(scriptContext.sublistId == 'item') {
                            var projectId = scriptContext.currentRecord.getValue('job');

                            if (projectId) {
                                var itemId = scriptContext.currentRecord.getCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item'
                                });
                                console.log(itemId);

                                if(itemId){
                                var chargeruleSearchObj = search.create({
                                    type: "chargerule",
                                    filters: [
                                        ["project", "anyof", projectId],
                                        "AND",
                                        ["billingitem", "anyof", itemId]
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: "name",
                                            sort: search.Sort.ASC,
                                            label: "Name"
                                        }),
                                        search.createColumn({
                                            name: "frequency",
                                            label: "Frequency"
                                        }),
                                        search.createColumn({
                                            name: "ruleorder",
                                            label: "Rule Order"
                                        }),
                                        search.createColumn({
                                            name: "amount",
                                            label: "Amount"
                                        }),
                                        search.createColumn({
                                            name: "custrecord_charge_decimal_value",
                                            label: "Decimal Amout"
                                        })
                                    ]
                                });
                                var searchResultCount = chargeruleSearchObj.runPaged().count;
                                if (searchResultCount > 0) {
                                    chargeruleSearchObj.run().each(function(result) {
                                        var decimalValue = result.getValue('custrecord_charge_decimal_value');
                                        if (decimalValue) {
                                            scriptContext.currentRecord.setCurrentSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'custcol_da_rate_3_decimal_value',
                                                value: decimalValue
                                            });
                                        }
                                        return true;
                                    });
                                }
                               }

                            }
                        }

                    } catch (ex) {
                        console.log(ex.name, ex.message);
                    }
                }

                /**
                 * Validation function to be executed when field is changed.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
                 * @param {string} scriptContext.fieldId - Field name
                 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
                 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
                 *
                 * @returns {boolean} Return true if field is valid
                 *
                 * @since 2015.2
                 */
                function validateField(scriptContext) {

                }

                /**
                 * Validation function to be executed when sublist line is committed.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
                 *
                 * @returns {boolean} Return true if sublist line is valid
                 *
                 * @since 2015.2
                 */
                function validateLine(scriptContext) {

                }

                /**
                 * Validation function to be executed when sublist line is inserted.
                 *
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
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
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @param {string} scriptContext.sublistId - Sublist name
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
                 * @param {Object} scriptContext
                 * @param {Record} scriptContext.currentRecord - Current form record
                 * @returns {boolean} Return true if record is valid
                 *
                 * @since 2015.2
                 */
                function saveRecord(scriptContext) {
                    try {
                        return true;
                    } catch (ex) {
                        console.log(ex.name, ex.message);
                    }

                }

                return {
                    pageInit: pageInit,
                    fieldChanged: fieldChanged,
                    //      postSourcing: postSourcing,
                    //      sublistChanged: sublistChanged,
                    lineInit: lineInit,
                    //      validateField: validateField,
                    //      validateLine: validateLine,
                    //      validateInsert: validateInsert,
                    //      validateDelete: validateDelete,
                    saveRecord: saveRecord,
                    //      createso:createso,


                };

            });
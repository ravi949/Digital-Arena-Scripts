/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(
    ['N/ui/serverWidget', 'N/search', 'N/runtime', 'N/redirect',
        'N/record', 'N/url', 'N/format'
    ],

    function(ui, search, runtime, redirect, record, url, format) {

        /**
         * Definition of the Suitelet script trigger point.
         * 
         * @param {Object}
         *            context
         * @param {ServerRequest}
         *            context.request - Encapsulation of the incoming
         *            request
         * @param {ServerResponse}
         *            context.response - Encapsulation of the Suitelet
         *            response
         * @Since 2015.2
         */
        function onRequest(context) {
            try {
                var request = context.request;
                var response = context.response;

                if (context.request.method == 'GET') {

                    var recId = request.parameters.recid;

                    var rec = record.load({
                        type: 'customrecord_da_hr_employee_loan',
                        id: recId
                    });



                    var employee = rec.getText('custrecord_da_employee_loan');
                    var totalAmount = rec.getValue('custrecord_da_loan_total_amount');

                    var form = ui.createForm({
                        title: 'Hold Loan'
                    });
                    form.addSubmitButton({
                        label: 'Submit'
                    });
                    var employeeField = form.addField({
                        id: 'custpage_cust_employee',
                        type: ui.FieldType.TEXT,
                        label: 'Employee'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.INLINE
                    }).defaultValue = employee;

                    var amountField = form.addField({
                        id: 'custpage_loan_amount',
                        type: ui.FieldType.CURRENCY,
                        label: 'Amount'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.INLINE
                    }).defaultValue = totalAmount;

                    var loanIdField = form.addField({
                        id: 'custpage_loan_id',
                        type: ui.FieldType.TEXT,
                        label: 'Loan Id'
                    }).updateBreakType({
                        breakType: ui.FieldBreakType.STARTCOL
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.INLINE
                    }).defaultValue = recId;
                    //Report Sublist            
                    var reportInvList = form.addSublist({
                        id: 'custpage_installment_list',
                        type: ui.SublistType.LIST,
                        label: 'Installments',
                        tab: 'custpage_tab'
                    });

                    reportInvList.addField({
                        id: 'custpage_hold_loan',
                        type: ui.FieldType.CHECKBOX,
                        label: 'Hold'
                    });
                    reportInvList.addField({
                        id: 'custpage_loan_date',
                        type: ui.FieldType.DATE,
                        label: 'Date'
                    });
                    reportInvList.addField({
                        id: 'custpage_instal_id',
                        type: ui.FieldType.TEXT,
                        label: 'Installment Id'
                    });
                    reportInvList.addField({
                        id: 'custpage_loan_amount',
                        type: ui.FieldType.CURRENCY,
                        label: 'Amount'
                    });

                    var customrecord_da_hr_loan_installmentSearchObj = search.create({
                        type: "customrecord_da_hr_loan_installment",
                        filters: [
                            ["custrecord_da_hr_loan_id", "anyof", recId], "AND", ["custrecord_da_hr_loan_paid", "is", "F"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "id",
                                sort: search.Sort.ASC,
                                label: "ID"
                            }),
                            search.createColumn({
                                name: "scriptid",
                                label: "Script ID"
                            }),
                            search.createColumn({
                                name: "custrecord_da_loan_sequence",
                                label: "Sequence"
                            }),
                            search.createColumn({
                                name: "custrecord_da_installment_date",
                                label: "Installment Date "
                            }),
                            search.createColumn({
                                name: "custrecord_da_installment_amount_hr",
                                label: "Installment Amount"
                            }),
                            search.createColumn({
                                name: "custrecord_da_hr_hold_loan",
                                label: "Hold Loan"
                            }),
                            search.createColumn({
                                name: "custrecord_da_hr_loan_paid",
                                label: "Paid"
                            })
                        ]
                    });
                    var searchResultCount = customrecord_da_hr_loan_installmentSearchObj.runPaged().count;
                    log.debug("customrecord_da_hr_loan_installmentSearchObj result count", searchResultCount);
                    var k = 0;
                    customrecord_da_hr_loan_installmentSearchObj.run().each(function(result) {

                        reportInvList.setSublistValue({
                            id: 'custpage_instal_id',
                            line: k,
                            value: result.id
                        });
                        reportInvList.setSublistValue({
                            id: 'custpage_loan_date',
                            line: k,
                            value: (result.getValue('custrecord_da_installment_date')) ? result.getValue('custrecord_da_installment_date') : ' '
                        });
                        reportInvList.setSublistValue({
                            id: 'custpage_loan_amount',
                            line: k,
                            value: (result.getValue('custrecord_da_installment_amount_hr')) ? result.getValue('custrecord_da_installment_amount_hr') : ' '
                        });
                        k++;
                        return true;
                    });

                    context.response.writePage(form);


                } else {

                    log.debug('request', request);


                    var numLines = request.getLineCount({
                        group: 'custpage_installment_list'
                    });

                    for (var i = 0; i < numLines; i++) {
                        var checked = request.getSublistValue({
                            group: 'custpage_installment_list',
                            name: 'custpage_hold_loan',
                            line: i
                        });

                        if (checked == "T") {
                            var Id = request.getSublistValue({
                                group: 'custpage_installment_list',
                                name: 'custpage_instal_id',
                                line: i
                            });
                            record.submitFields({
                                type: 'customrecord_da_hr_loan_installment',
                                id: Id,
                                values: {
                                    'custrecord_da_hr_hold_loan': true
                                }
                            })
                        }
                    }

                    if (numLines > 1) {
                        var lasstLoanDate = request.getSublistValue({
                            group: 'custpage_installment_list',
                            name: 'custpage_loan_date',
                            line: (numLines - 1)
                        });

                        log.debug('lasstLoanDate', lasstLoanDate);

                        var amount = request.getSublistValue({
                            group: 'custpage_installment_list',
                            name: 'custpage_loan_amount',
                            line: (numLines - 1)
                        });

                        var parsedDateStringAsRawDateObject = format.parse({
                            value: lasstLoanDate,
                            type: format.Type.DATE
                        });
                        log.debug('parsedDateStringAsRawDateObject', parsedDateStringAsRawDateObject);

                        var formattedDateString = format.format({
                            value: parsedDateStringAsRawDateObject,
                            type: format.Type.DATE
                        });
                        log.debug('formattedDateString', formattedDateString);

                        var now = new Date(formattedDateString.split("/")[1]+"/"+formattedDateString.split("/")[0]+"/"+formattedDateString.split("/")[2]);
                        log.debug('now', now.getDate());
                        if (now.getMonth() == 11) {
                            var current = new Date(now.getFullYear() + 1, 0, 1);
                        } else {
                            var current = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                        }
                        var id = record.create({
                            type: 'customrecord_da_hr_loan_installment'
                        }).setValue('custrecord_da_installment_date', current).setValue('custrecord_da_installment_amount_hr', amount).setValue('custrecord_da_hr_loan_id', request.parameters.custpage_loan_id).save();

                        log.debug(id);


                    }



                    redirect.toRecord({
                        type: 'customrecord_da_hr_employee_loan',
                        id: request.parameters.custpage_loan_id
                    });




                }

                


            } catch (ex) {
                log.error(ex.name, ex.message);
            }

        }

        return {
            onRequest: onRequest
        };

    });
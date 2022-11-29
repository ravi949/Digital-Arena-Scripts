/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', 'N/record', 'N/format'],
    function(search, record, format) {
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
                var loanDateOriginal = scriptContext.newRecord.getValue('custrecord_da_issue_date');
                var loanDate = scriptContext.newRecord.getValue('custrecord_da_issue_date');

                var callOptionDate = scriptContext.newRecord.getText('custrecord_da_call_option');

                var month = loanDate.getMonth() + 1;
                // log.debug('month', month);

                if (month > 6) {
                    var month1 = month;
                    var month2 = parseFloat(month) - parseFloat(6);
                } else {
                    var month1 = month;
                    var month2 = parseFloat(month) + parseFloat(6);
                }

                var loandDateDt = loanDate.getDate();


                var loanLastPaymentDate = scriptContext.newRecord.getValue('custrecord_da_maturity_date');
                //log.debug('loanLastPaymentDate 1', new Date(loanLastPaymentDate).getDate());
                //log.debug('loanLastPaymentDate', new Date(loanLastPaymentDate).getDate());
                var noOfQuarters = noOfquarters(loanDate, loanLastPaymentDate);
                // log.debug('noOfQuarters', noOfQuarters);
                var interestRate = scriptContext.newRecord.getValue('custrecord_da_bond_interest_rate');
                var length = (noOfQuarters.length);
                length = parseFloat(length) - parseFloat(1);
                var outStandingLoanAmount = scriptContext.newRecord.getValue('custrecord_da_total_amount_of_bond');
                //log.debug('subsidiaryId', loanDate.getDate());
                //log.debug('subsidiaryId', loanDate);


                //Accrued Table
                var customrecord_bond_accrued_interest_schedSearchObj = search.create({
                    type: "customrecord_bond_accrued_interest_sched",
                    filters: [
                        ["custrecord_da_created_from_bond_accr", "anyof", scriptContext.newRecord.id]
                    ],
                    columns: [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        }),
                        search.createColumn({
                            name: 'custrecord_da_accured_no_of_days',
                            label: 'no of days'
                        }),
                        search.createColumn({
                            name: 'custrecord_da_bond_acc_call_opt_days',
                            label: 'call Option Days'
                        }),
                        search.createColumn({
                            name: 'custrecord_da_bond_acc_call_opt_amt',
                            label: 'call Option Amount'
                        }),
                        search.createColumn({
                            name: 'custrecord_da_bond_accrued_call_option',
                            label: 'call Option'
                        }),
                        search.createColumn({
                            name: 'custrecord_da_bond_accrued_f',
                            label: 'fromdate'
                        }),
                        search.createColumn({
                            name: 'custrecord_da_comp_to_principal',
                            label: 'Compoundable'
                        }),

                    ]
                });
                var searchResultCount = customrecord_bond_accrued_interest_schedSearchObj.runPaged().count;
                //log.debug("customrecord_da_loan_interest_payment_scSearchObj result count", searchResultCount);
                /*customrecord_bond_accrued_interest_schedSearchObj.run().each(function(result) {
                    record.delete({
                        type: 'customrecord_bond_accrued_interest_sched',
                        id: result.id
                    })
                    return true;
                });*/
                if (searchResultCount == 0) {
                    var noOfMonths = dateRange(loanDateOriginal, loanLastPaymentDate);
                    //log.debug('noOfMonths', noOfMonths);
                    for (var i = 0; i < noOfMonths.length; i++) {
                        if (noOfMonths.length > 1) {
                            if (i == 0 || i == (noOfMonths.length - 1)) {
                                if (i == 0) {
                                    var month = noOfMonths[i].getMonth() + 1;
                                    var year = noOfMonths[i].getFullYear();
                                    var fromDate = new Date(loanDateOriginal);
                                    var toDate;
                                    if (month == month1 || month == month2) {
                                        fromDate = new Date(month + "/" + loandDateDt + "/" + year);
                                        toDate = lastDateOfTheMonth(month, year);
                                    } else {
                                        //fromDate = new Date(month+"01/"+ year);
                                        toDate = lastDateOfTheMonth(month, year);
                                    }
                                    var noOfdays = calculateNoOfDays1(toDate, fromDate);
                                    noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    var loanInteSchRec = record.create({
                                        type: 'customrecord_bond_accrued_interest_sched'
                                    });
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_f', fromDate);
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_release_date', toDate);
                                    loanInteSchRec.setValue('custrecord_da_created_from_bond_accr', scriptContext.newRecord.id);
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_to', toDate);
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_bond_amt', interestAmount.toFixed(3));
                                    loanInteSchRec.setValue('custrecord_da_accured_no_of_days', noOfdays);
                                    loanInteSchRec.save();
                                }
                                if (i == (noOfMonths.length - 1)) {
                                    var month = noOfMonths[i].getMonth() + 1;
                                    var year = noOfMonths[i].getFullYear();
                                    var fromDate;
                                    var toDate = new Date(loanLastPaymentDate);
                                    if (month == month1 || month == month2) {
                                        fromDate = new Date(month + "/" + loandDateDt + "/" + year);
                                        toDate = lastDateOfTheMonth(month, year);
                                    } else {
                                        fromDate = new Date(month + "/01/" + year);
                                        //toDate = lastDateOfTheMonth(month, year);
                                    }
                                    var noOfdays = calculateNoOfDays1(toDate, fromDate);
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    var loanInteSchRec = record.create({
                                        type: 'customrecord_bond_accrued_interest_sched'
                                    });
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_f', fromDate);
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_release_date', toDate);
                                    loanInteSchRec.setValue('custrecord_da_created_from_bond_accr', scriptContext.newRecord.id);
                                    loanInteSchRec.setValue('custrecord_da_accured_no_of_days', noOfdays);
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_to', toDate);
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_bond_amt', interestAmount.toFixed(3));
                                    loanInteSchRec.save();
                                }
                            } else {
                                var month = noOfMonths[i].getMonth() + 1;
                                var year = noOfMonths[i].getFullYear();

                                var create = false;
                                //log.audit('month', month);
                                var fromDate;
                                var toDate;
                                if (month == month1 || month == month2) {
                                    fromDate = new Date(month + "/" + loandDateDt + "/" + year);
                                    toDate = lastDateOfTheMonth(month, year);
                                    var fromDate1 = new Date(month + "/01/" + year);
                                    var toDate1 = new Date(month + "/" + (loandDateDt - 1) + "/" + year);

                                    log.error('fromDatedsfkl', fromDate);
                                    log.error('toDatedtdt', toDate);

                                    var noOfdays = calculateNoOfDays1(toDate1, fromDate1);
                                    if (month == 3) {
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    }
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    var loanInteSchRec = record.create({
                                        type: 'customrecord_bond_accrued_interest_sched'
                                    });
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_f', fromDate1);
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_release_date', toDate1);
                                    loanInteSchRec.setValue('custrecord_da_created_from_bond_accr', scriptContext.newRecord.id);
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_to', toDate1);
                                    loanInteSchRec.setValue('custrecord_da_bond_accrued_bond_amt', interestAmount.toFixed(3));
                                    loanInteSchRec.setValue('custrecord_da_accured_no_of_days', noOfdays);
                                    loanInteSchRec.save();
                                } else {
                                    fromDate = new Date(month + "/01/" + year);
                                    toDate = lastDateOfTheMonth(month, year);
                                }
                                var noOfdays = calculateNoOfDays1(toDate, fromDate);
                                if (month == 3) {
                                    noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                }
                                var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                var loanInteSchRec = record.create({
                                    type: 'customrecord_bond_accrued_interest_sched'
                                });
                                loanInteSchRec.setValue('custrecord_da_bond_accrued_f', fromDate);
                                loanInteSchRec.setValue('custrecord_da_bond_accrued_release_date', toDate);
                                loanInteSchRec.setValue('custrecord_da_created_from_bond_accr', scriptContext.newRecord.id);
                                loanInteSchRec.setValue('custrecord_da_bond_accrued_to', toDate);
                                loanInteSchRec.setValue('custrecord_da_bond_accrued_bond_amt', interestAmount.toFixed(3));
                                loanInteSchRec.setValue('custrecord_da_accured_no_of_days', noOfdays);
                                loanInteSchRec.save();

                                if (create == true) {

                                }
                            }
                        } else {
                            var fromDate = new Date(loanDateOriginal);
                            //var yesterday = new Date(loanLastPaymentDate);
                            var toDate = loanLastPaymentDate;
                            var noOfdays = calculateNoOfDays1(toDate, fromDate);
                            var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                            var loanInteSchRec = record.create({
                                type: 'customrecord_bond_accrued_interest_sched'
                            });
                            loanInteSchRec.setValue('custrecord_da_bond_accrued_f', fromDate);
                            loanInteSchRec.setValue('custrecord_da_bond_accrued_release_date', loanLastPaymentDate);
                            loanInteSchRec.setValue('custrecord_da_created_from_bond_accr', scriptContext.newRecord.id);
                            loanInteSchRec.setValue('custrecord_da_bond_accrued_to', loanLastPaymentDate);
                            loanInteSchRec.setValue('custrecord_da_bond_accrued_bond_amt', interestAmount.toFixed(3));
                            loanInteSchRec.setValue('custrecord_da_accured_no_of_days', noOfdays);
                            loanInteSchRec.save();
                        }
                    }
                } else {

                    var outStandingLoanAmount = scriptContext.newRecord.getValue('custrecord_da_total_amount_of_bond');

                    var totalInterestAmount = 0;

                    customrecord_bond_accrued_interest_schedSearchObj.run().each(function(result) {
                        var fromDate = result.getValue('custrecord_da_bond_accrued_f');
                        //log.error('fromDate', fromDate);

                        // var exists = searchForValue(fromDate, compoundArray);
                        // log.debug('outStandingLoanAmount', outStandingLoanAmount);

                        /* if (exists) {
                             outStandingLoanAmount = exists.value;
                         }*/

                        var noOfdays = result.getValue('custrecord_da_accured_no_of_days');

                        var callOption = result.getValue('custrecord_da_bond_accrued_call_option');

                        var compundable = result.getValue('custrecord_da_comp_to_principal');
                        //log.debug(compundable);

                        if (compundable == true) {
                            outStandingLoanAmount = parseFloat(outStandingLoanAmount) + parseFloat(totalInterestAmount);
                            //log.debug('outStandingLoanAmountlll', outStandingLoanAmount);
                        }
                        // log.debug('callOption', callOption);
                        if (callOption) {
                            // log.debug(true);
                            var callOptionDays = result.getValue('custrecord_da_bond_acc_call_opt_days');
                            var callOptionAmount = result.getValue('custrecord_da_bond_acc_call_opt_amt');
                            var interestAmount1 = (((noOfdays - callOptionDays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                            // log.debug('details', interestAmount1 +"outStandingLoanAmount"+ outStandingLoanAmount);
                            outStandingLoanAmount = parseFloat(outStandingLoanAmount) - parseFloat(callOptionAmount);
                            var interestAmount2 = (((callOptionDays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                            // log.debug('details1', interestAmount2 +"outStandingLoanAmount"+ outStandingLoanAmount);
                            var interestAmount = parseFloat(interestAmount1) + parseFloat(interestAmount2);

                        } else {
                            var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                        }

                        record.submitFields({
                            type: 'customrecord_bond_accrued_interest_sched',
                            id: result.id,
                            values: {
                                'custrecord_da_bond_accrued_bond_amt': interestAmount.toFixed(3),
                                'custrecord_da_bond_acc_prin_amount': outStandingLoanAmount.toFixed(3)
                            }
                        });

                        totalInterestAmount = parseFloat(totalInterestAmount) + parseFloat(interestAmount);

                        return true;
                    });

                }


                //Interest Table


                var customrecord_da_bind_interest_payment_scSearchObj = search.create({
                    type: "customrecord_da_bind_interest_payment_sc",
                    filters: [
                        ["custrecord_da_created_from_bond", "anyof", scriptContext.newRecord.id]
                    ],
                    columns: [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        }),
                        search.createColumn({
                            name: "custrecord_da_loan_compoundable_tp",
                            label: "Compoundable To Principle"
                        }),
                        search.createColumn({
                            name: "custrecord_da_bond_interest_from",
                            label: "From Date"
                        }),
                        search.createColumn({
                            name: "custrecord_da_bond_interest_to",
                            label: "To Date"
                        }),
                        search.createColumn({
                            name: "custrecord_da_bond_interest_bond_amt",
                            label: "Interest Amount"
                        }),
                        search.createColumn({
                            name: "custrecord_da_prior_periods_accrued_amt",
                            label: "Prior Periods Accrued Amt"
                        }),
                        search.createColumn({
                            name: "custrecord_da_no_of_days_for_calc",
                            label: "No Of Days For Calc"
                        }),
                        search.createColumn({
                            name: "custrecord_da_no_of_days_prior",
                            label: "No Of Days For Prior Cal"
                        })
                    ]
                });
                var searchResultCount = customrecord_da_bind_interest_payment_scSearchObj.runPaged().count;
                //log.debug("customrecord_da_loan_interest_payment_scSearchObj result count", searchResultCount);
                /*customrecord_da_bind_interest_payment_scSearchObj.run().each(function(result) {
                   record.delete({
                        type: 'customrecord_da_bind_interest_payment_sc',
                        id: result.id
                    })
                    return true;
                });*/
                // log.audit('length', length);

                var compoundArray = [];
                if (searchResultCount == 0) {
                    for (var i = 0; i < length; i++) {
                        if (length > 1) {
                            if (i == 0 || i == (length - 1)) {
                                if (i == 0) {
                                    // log.debug('noOfQuarters', noOfQuarters[i]);
                                    var year = noOfQuarters[i].split(" ")[0];
                                    var month = noOfQuarters[i].split(" ")[1];
                                    month = month * 6;
                                    //  log.debug('month', month);
                                    //log.debug('year', year);
                                    //log.audit('line 0');
                                    var fromDate = new Date(loanDate);
                                    //log.audit('fromDate', fromDate);
                                    //var fromDate1 = new Date(effectiveDateForReset);
                                    //tomorrow.setDate(tomorrow.getDate() + 1);
                                    var interestDate = lastDateOfTheMonth(month, year);
                                    var toDate = addMonths(loanDate, 6);
                                    //log.audit('toDate', toDate);
                                    //toDate.setDate(toDate.getDate() - 1);
                                    //log.audit('fromDate', fromDate);
                                    //log.debug('dates', toDate + "from" + fromDate + "effectiveDateForReset" + effectiveDateForReset);
                                    //log.debug('noOfdays', noOfdays);
                                    var noOfdays = calculateNoOfDays(toDate, fromDate);
                                    noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(toDate.getDate()) + parseFloat(1);
                                    var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    if (fromDate.getMonth() == toDate.getMonth()) {
                                        interestAmountForAccured = 0;
                                    }
                                    var loanInteSchRec = record.create({
                                        type: 'customrecord_da_bind_interest_payment_sc'
                                    });
                                    loanInteSchRec.setValue('custrecord_da_created_from_bond', scriptContext.newRecord.id);
                                    loanInteSchRec.setValue('custrecord_da_no_of_days_for_calc', noOfdays);
                                    loanInteSchRec.setValue('custrecord_da_no_of_days_prior', noOfDaysForAccured);
                                    //log.audit('fromDate', fromDate);
                                    loanInteSchRec.setValue('custrecord_da_bond_interest_from', fromDate);
                                    //log.audit('toDate', toDate);
                                    loanInteSchRec.setValue('custrecord_da_bond_interest_to', toDate);
                                    loanInteSchRec.setValue('custrecord_da_bond_interest_bond_amt', interestAmount.toFixed(3));
                                    loanInteSchRec.setValue('custrecord_da_prior_periods_accrued_amt', interestAmountForAccured.toFixed(3));
                                    var year = noOfQuarters[i].split(" ")[0];
                                    var month = noOfQuarters[i].split(" ")[1];
                                    month = month * 6;
                                    loanInteSchRec.setValue('custrecord_da_bond_payment_period', getPostingPeriod(month, year));
                                    loanInteSchRec.save();
                                    loanDate = toDate;
                                }
                                if (i == (length - 1)) {
                                    //log.debug('noOfQuarters', noOfQuarters[i]);
                                    var year = noOfQuarters[i].split(" ")[0];
                                    var quarter = noOfQuarters[i].split(" ")[1];
                                    var month;
                                    if (quarter == 1) {
                                        month = 1;
                                    }
                                    if (quarter == 2) {
                                        month = 7;
                                    }
                                    if (quarter == 3) {
                                        month = 7;
                                    }
                                    if (quarter == 4) {
                                        month = 10;
                                    }
                                    //log.debug('month', month);
                                    //log.debug('year', year);
                                    log.error('lastline', loanDate);
                                    var fromDate = loanDate;
                                    var toDate = loanLastPaymentDate;
                                    //toDate.setDate(toDate.getDate() - 1);
                                    // log.debug('dates', toDate + "from" + fromDate);
                                    var noOfdays = calculateNoOfDays(toDate, fromDate);
                                    noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(toDate.getDate()) + parseFloat(1);
                                    var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    var loanInteSchRec = record.create({
                                        type: 'customrecord_da_bind_interest_payment_sc'
                                    });
                                    loanInteSchRec.setValue('custrecord_da_created_from_bond', scriptContext.newRecord.id);
                                    loanInteSchRec.setValue('custrecord_da_no_of_days_for_calc', noOfdays);
                                    loanInteSchRec.setValue('custrecord_da_no_of_days_prior', noOfDaysForAccured);
                                    loanInteSchRec.setValue('custrecord_da_bond_interest_from', fromDate);
                                    loanInteSchRec.setValue('custrecord_da_bond_interest_to', toDate);
                                    loanInteSchRec.setValue('custrecord_da_bond_interest_bond_amt', interestAmount.toFixed(3));
                                    loanInteSchRec.setValue('custrecord_da_prior_periods_accrued_amt', interestAmountForAccured.toFixed(3));
                                    var year = noOfQuarters[i].split(" ")[0];
                                    var month = noOfQuarters[i].split(" ")[1];
                                    month = month * 6;
                                    loanInteSchRec.setValue('custrecord_da_bond_payment_period', getPostingPeriod(month, year));
                                    loanInteSchRec.save();
                                    loanDate = toDate;
                                }
                            } else {
                                var year = noOfQuarters[i].split(" ")[0];
                                var quarter = noOfQuarters[i].split(" ")[1];
                                var month;
                                if (quarter == 1) {
                                    month = 1;
                                }
                                if (quarter == 2) {
                                    month = 7;
                                }
                                if (quarter == 3) {
                                    month = 7;
                                }
                                if (quarter == 4) {
                                    month = 10;
                                }
                                //log.debug('month', month);
                                //log.debug('year', year);
                                log.audit('line ' + i);
                                var monthForPP = quarter * 3;
                                var yearForPP = year;
                                var interestDate = lastDateOfTheMonth(quarter * 6, year);
                                var loanInteSchRec = record.create({
                                    type: 'customrecord_da_bind_interest_payment_sc'
                                });
                                loanInteSchRec.setValue('custrecord_da_created_from_bond', scriptContext.newRecord.id);
                                var a = loanDate;
                                log.debug(a);
                                loanInteSchRec.setValue('custrecord_da_bond_interest_from', a);
                                log.debug(a);
                                var Id = loanInteSchRec.save();
                                var loanInteSchRec = record.load({
                                    type: 'customrecord_da_bind_interest_payment_sc',
                                    id: Id
                                });
                                var fromDateExisted = loanInteSchRec.getText('custrecord_da_bond_interest_from');
                                var lastProcessDateYear = fromDateExisted.split("/")[2];
                                var lastProcessDateMonth = fromDateExisted.split("/")[1];
                                var lastProcessDateDate = fromDateExisted.split("/")[0];
                                fromDateExisted = new Date(lastProcessDateMonth + "/" + lastProcessDateDate + "/" + lastProcessDateYear);
                                var fromDt = loanInteSchRec.getText('custrecord_da_bond_interest_from');
                                var lastProcessDateYear = fromDt.split("/")[2];
                                var lastProcessDateMonth = fromDt.split("/")[1];
                                var lastProcessDateDate = fromDt.split("/")[0];
                                fromDt = new Date(lastProcessDateMonth + "/" + lastProcessDateDate + "/" + lastProcessDateYear);
                                log.audit('to date', fromDt + "fromDateExisted" + fromDateExisted);
                                var noOfdays = calculateNoOfDays(fromDateExisted, addMonths(fromDt, 6));
                                log.audit('noOfdays', noOfdays);
                                //noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                //
                                var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(addMonths(fromDt, 6).getDate()) + parseFloat(1);
                                var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                loanInteSchRec.setValue('custrecord_da_no_of_days_for_calc', noOfdays);
                                loanInteSchRec.setValue('custrecord_da_no_of_days_prior', noOfDaysForAccured);
                                //loanInteSchRec.setValue('custrecord_da_bond_interest_to', addMonths(loanDate, 6));
                                loanInteSchRec.setValue('custrecord_da_bond_interest_bond_amt', interestAmount.toFixed(3));
                                loanInteSchRec.setValue('custrecord_da_prior_periods_accrued_amt', interestAmountForAccured.toFixed(3));
                                var year = noOfQuarters[i].split(" ")[0];
                                var month = noOfQuarters[i].split(" ")[1];
                                month = month * 6;
                                loanInteSchRec.setValue('custrecord_da_bond_payment_period', getPostingPeriod(month, year));
                                log.debug('dates', loanDate);
                                loanInteSchRec.setValue('custrecord_da_bond_interest_to', addMonths(fromDateExisted, 6));
                                loanInteSchRec.save();
                                log.audit('toDate', toDate);
                                loanDate = addMonths(loanDate, 6);
                                log.debug(a);
                                //return false;
                                //log.audit('loanDate', loanDate);
                                //var fromDate = loanDate;
                                //fromDate.setDate(fromDate.getDate() - 1);
                                //var toDate = addMonths(loanDate, 6);
                                //toDate.setDate(toDate.getDate() + 1);
                                //log.debug('toDate', toDate);
                                //var noOfdays = calculateNoOfDays(addMonths(loanDate, 6), loanDate);
                                //log.debug('dates', loanDate);
                            }
                        } else {
                            log.debug('else', 'only 1');
                            var fromDate = new Date(loanDate);
                            fromDate.setDate(fromDate.getDate() + 1);
                            log.debug('fromDate', fromDate);
                            var toDate = new Date(loanLastPaymentDate);
                            toDate.setDate(toDate.getDate() + 1);
                            log.debug('toDate', toDate);
                            var noOfdays = calculateNoOfDays(toDate, fromDate);
                            var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                            var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(toDate.getDate());
                            var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                            var loanInteSchRec = record.create({
                                type: 'customrecord_da_bind_interest_payment_sc'
                            });
                            loanInteSchRec.setValue('custrecord_da_no_of_days_for_calc', noOfdays);
                            loanInteSchRec.setValue('custrecord_da_no_of_days_prior', noOfDaysForAccured);
                            loanInteSchRec.setValue('custrecord_da_created_from_bond', scriptContext.newRecord.id);
                            loanInteSchRec.setValue('custrecord_da_bond_interest_from', fromDate);
                            loanInteSchRec.setValue('custrecord_da_bond_interest_to', toDate);
                            loanInteSchRec.setValue('custrecord_da_bond_interest_bond_amt', interestAmount.toFixed(3));
                            loanInteSchRec.setValue('custrecord_da_prior_periods_accrued_amt', interestAmountForAccured.toFixed(3));
                            var year = noOfQuarters[i].split(" ")[0];
                            var month = noOfQuarters[i].split(" ")[1];
                            month = month * 6;
                            loanInteSchRec.setValue('custrecord_da_bond_payment_period', getPostingPeriod(month, year));
                            loanInteSchRec.save();
                        }
                    }
                } else {



                    var amountForNewOutStanding = 0;

                    customrecord_da_bind_interest_payment_scSearchObj.run().each(function(result) {

                        var fromDate = result.getValue('custrecord_da_bond_interest_from');
                        var toDate = result.getValue('custrecord_da_bond_interest_to');

                       // log.debug('fromdate bond', fromDate);

                        var customrecord_bond_accrued_interest_schedSearchObj = search.create({
                           type: "customrecord_bond_accrued_interest_sched",
                           filters:
                           [
                              ["custrecord_da_created_from_bond_accr","anyof",scriptContext.newRecord.id], 
                              "AND", 
                              ["custrecord_da_bond_accrued_f","onorafter",fromDate], 
                              "AND", 
                              ["custrecord_da_bond_accrued_to","before",toDate]
                           ],
                           columns:
                           [
                              search.createColumn({name: "id", label: "ID"}),
                              search.createColumn({
                                 name: "scriptid",
                                 sort: search.Sort.ASC,
                                 label: "Script ID"
                              }),
                              search.createColumn({name: "custrecord_da_bond_accrued_f", label: "From"}),
                              search.createColumn({name: "custrecord_da_bond_accrued_to", label: "To"}),
                              search.createColumn({name: "custrecord_da_bond_accrued_release_date", label: "Release Date"}),
                              search.createColumn({name: "custrecord_da_bond_accrued_bond_amt", label: "Accrued Amount"}),
                              search.createColumn({name: "custrecord_da_comp_to_principal", label: "Compoundable(Effective From)"}),
                              search.createColumn({name: "custrecord_da_bond_accrued_trans_no", label: "Transaction#"}),
                              search.createColumn({name: "custrecord_da_accured_no_of_days", label: "Number of Days for Calculation"}),
                              search.createColumn({name: "custrecord_da_bond_accrued_call_option", label: "Call Option"}),
                              search.createColumn({name: "custrecord_da_bond_acc_call_opt_days", label: "Call Option Days"}),
                              search.createColumn({name: "custrecord_da_bond_acc_prin_amount", label: "Principal Amount"})
                           ]
                        });
                        var searchResultCount = customrecord_bond_accrued_interest_schedSearchObj.runPaged().count;
                        //log.debug("customrecord_bond_accrued_interest_schedSearchObj result count",searchResultCount);

                        var interestAmount = 0;
                        var priorAccruedAmount = 0;
                        var i = 1;
                        customrecord_bond_accrued_interest_schedSearchObj.run().each(function(result){
                           var accruedAmount = result.getValue('custrecord_da_bond_accrued_bond_amt');
                           interestAmount = parseFloat(interestAmount) + parseFloat(accruedAmount);

                           if(i < searchResultCount){
                            priorAccruedAmount = parseFloat(priorAccruedAmount) + parseFloat(accruedAmount);
                           }
                           i++;
                           return true;
                        });

                        
                        record.submitFields({
                                type: 'customrecord_da_bind_interest_payment_sc',
                                id: result.id,
                                values: {
                                    'custrecord_da_bond_interest_bond_amt': interestAmount.toFixed(3),
                                    'custrecord_da_prior_periods_accrued_amt': priorAccruedAmount.toFixed(3)
                                }
                        });
                        return true;
                });
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function calculateNoOfDays1(date2, date1) {
            var res = Math.abs(date1 - date2) / 1000;
            var days = Math.floor(res / 86400);
            return days + 1;
        }

        /*function calculateNoOfDays(date2, date1) {
            log.audit('noooo', date2 + "date1" + date1);
            var res = Math.abs(date1 - date2) / 1000;
            var days = Math.floor(res / 86400);
            return days + 1;
        }*/

        function searchForValue(nameKey, myArray) {
            for (var i = 0; i < myArray.length; i++) {
                if (myArray[i].date === nameKey) {
                    return myArray[i];
                }
            }
        }

        function calculateNoOfDays(date1, date2) {
            // The number of milliseconds in one day
            var ONEDAY = 1000 * 60 * 60 * 24;
            // Convert both dates to milliseconds
            var date1_ms = date1.getTime();
            var date2_ms = date2.getTime();
            // Calculate the difference in milliseconds
            var difference_ms = Math.abs(date1_ms - date2_ms);

            // Convert back to days and return
            return Math.round(difference_ms / ONEDAY);
        }

        function addMonths(date, months) {
            var ex = date;
            var d = ex.getDate();
            ex.setMonth(ex.getMonth() + +months);
            if (ex.getDate() != d) {
                ex.setDate(0);
            }
            return ex;
        }

        function dateRange(startDate, endDate) {
            //var start      = startDate.split('/');
            //var end        = endDate.split('/');
            var startYear = startDate.getFullYear();
            var endYear = endDate.getFullYear();
            var dates = [];
            var startMonth = startDate.getMonth() + 1;
            var endmonth = endDate.getMonth() + 1;
            for (var i = startYear; i <= endYear; i++) {
                var endMonth = i != endYear ? 11 : endmonth - 1;
                var startMon = i === startYear ? startMonth - 1 : 0;
                for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
                    var month = j + 1;
                    var displayMonth = month < 10 ? '0' + month : month;
                    dates.push(new Date(([displayMonth, '01', i]).join('/')));
                }
            }
            return dates;
        }

        function getDateFormat(month, year, date) {
            return new Date(year, month, date);
        }

        function lastDateOfTheMonth(month, year) {
            log.debug(month, year);
            return new Date(year, month, 0);
        }

        function getQuarter(date) {
            return date.getFullYear() + ' ' + Math.ceil((date.getMonth() + 1) / 6);
        }

        function noOfquarters(sDate, eDate) {
            log.debug('sDate', sDate);
            log.debug('eDate', eDate);
            // Ensure start is the earlier date;
            if (sDate > eDate) {
                var t = eDate;
                eDate = sDate;
                sDate = t;
            }
            // Copy input start date do don't affect original
            sDate = new Date(sDate);
            log.debug('1sDate', sDate);
            log.debug('1eDate', eDate);
            // Set to 2nd of month so adding months doesn't roll over
            // and not affected by daylight saving
            sDate.setDate(2);
            log.debug('2sDate', sDate);
            log.debug('2eDate', eDate);
            // Initialise result array with start quarter
            var startQ = getQuarter(sDate);
            //log.debug();
            var endQ = getQuarter(eDate);
            var result = [startQ];
            // List quarters from start to end
            while (startQ != endQ) {
                sDate.setMonth(sDate.getMonth() + 6);
                startQ = getQuarter(sDate);
                result.push(startQ);
            }
            return result;
        }

        function getPostingPeriod(month, year) {
            var monthsobj = {
                '1': 'Jan',
                '2': 'Feb',
                '3': 'Mar',
                '4': 'Apr',
                '5': 'May',
                '6': 'Jun',
                '7': 'Jul',
                '8': 'Aug',
                '9': 'Sep',
                '10': 'Oct',
                '11': 'Nov',
                '12': 'Dec'
            }
            var postingperiodMonth = monthsobj[month];
            // var year = new Date("06/01/2020").getFullYear();
            if (month == 0 || month == "0") {
                year = year - 1;
            }
            log.debug('postingperiodMonth', postingperiodMonth + " " + year);
            var accountingperiodSearchObj = search.create({
                type: "accountingperiod",
                filters: [
                    ["periodname", "startswith", postingperiodMonth + " " + year]
                ],
                columns: [
                    search.createColumn({
                        name: "periodname",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                ]
            });
            var searchResultCount = accountingperiodSearchObj.runPaged().count;
            log.debug("accountingperiodSearchObj result count", searchResultCount);
            var postingPeriodId;
            accountingperiodSearchObj.run().each(function(result) {
                postingPeriodId = result.id;
                return true;
            });
            return postingPeriodId;
        }
        return {
            onAction: onAction
        };
    });
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
                var loanDate = scriptContext.newRecord.getValue('custrecord_da_loan_payment_date');
                ////log.debug('subsidiaryId', loanDate.getDate());
                log.debug('loanDate', loanDate);
                var customrecord_da_loan_interest_payment_scSearchObj = search.create({
                    type: "customrecord_da_loan_interest_payment_sc",
                    filters: [
                        ["custrecord_da_loan_agrmnt_parent", "anyof", scriptContext.newRecord.id], "AND",
                        ["custrecord_da_loan_interest_trans_no", "anyof", "@NONE@"], "AND",
                        ["custrecord_da_int_sch_reverese_gl", "anyof", "@NONE@"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        })
                    ]
                });
                var searchResultCount = customrecord_da_loan_interest_payment_scSearchObj.runPaged().count;
                ////log.debug("customrecord_da_loan_interest_payment_scSearchObj result count", searchResultCount);
                customrecord_da_loan_interest_payment_scSearchObj.run().each(function(result) {
                    record.delete({
                        type: 'customrecord_da_loan_interest_payment_sc',
                        id: result.id
                    })
                    return true;
                });
                var customrecord_da_loan_interest_payment_scSearchObj = search.create({
                    type: "customrecord_da__loan_accrued_interest_s",
                    filters: [
                        ["custrecord_da_bank_loan_agrmnt_ref", "anyof", scriptContext.newRecord.id], "AND",
                        ["custrecord_da_loan_accrued_trans_no", "anyof", "@NONE@"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        })
                    ]
                });

                var firstLoanAgreement = scriptContext.newRecord.getValue('custrecord_da_first_bl_agreement');
                log.debug('firstLoanAgreement',firstLoanAgreement);
                var excludeFirstDay = scriptContext.newRecord.getValue('custrecord_da_excl_first_day');
                log.debug('excludeFirstDay',excludeFirstDay);
                var searchResultCount = customrecord_da_loan_interest_payment_scSearchObj.runPaged().count;
                ////log.debug("customrecord_da_loan_interest_payment_scSearchObj result count", searchResultCount);
                customrecord_da_loan_interest_payment_scSearchObj.run().each(function(result) {
                    record.delete({
                        type: 'customrecord_da__loan_accrued_interest_s',
                        id: result.id
                    })
                    return true;
                });
                var loanLastPaymentDate = scriptContext.newRecord.getValue('custrecord_da_bank_loan_agrmnt_to');
                var resetInterestRate = scriptContext.newRecord.getValue('custrecord_da_reset_bank_loan_int_rate');
                var loanEndDate = scriptContext.newRecord.getValue('custrecord_da_loan_agree_end_date');
                var effectiveDateForReset = (scriptContext.newRecord.getValue('custrecord_da_reset_int_effective_from'));
                var additionalIntRate = scriptContext.newRecord.getValue('custrecord_da_loan_add_int_rate');
                var additionalEffectiveDateFrom = scriptContext.newRecord.getValue('custrecord_da_loan_add_int_apply_from');
                var additionalEffectiveDateTo = scriptContext.newRecord.getValue('custrecord_da_additional_applicable_to');
                var applyAdditional = scriptContext.newRecord.getValue('custrecord_da_loan_apply_add_int_rate');
                log.debug('loanLastPaymentDate', loanLastPaymentDate);
                log.debug('loanEndDate', loanEndDate);
                log.debug('resetInterestRate', resetInterestRate);
                //log.debug('effectiveDateForReset', effectiveDateForReset);
                ////log.debug('loanLastPaymentDate 1', new Date(loanLastPaymentDate).getDate());
                ////log.debug('loanLastPaymentDate', new Date(loanLastPaymentDate).getDate());
                var noOfQuarters = noOfquarters(loanDate, loanLastPaymentDate);
                ////log.debug('noOfQuarters', noOfQuarters);
                var interestRate = scriptContext.newRecord.getValue('custrecord_da_bank_loan_interest_rate');
                var previousInterestRate = scriptContext.newRecord.getValue('custrecord_da_bla_previous_interest_rate');
                if (previousInterestRate) {
                    interestRate = previousInterestRate;
                }

                var outStandingLoanAmount = scriptContext.newRecord.getValue('custrecord_da_current_outstanding_balanc');
                for (var i = 0; i < noOfQuarters.length; i++) {
                    if (noOfQuarters.length > 1) {
                        if (i == 0 || i == (noOfQuarters.length - 1)) {
                            if (i == 0) {
                                ////log.debug('noOfQuarters', noOfQuarters[i]);
                                var year = noOfQuarters[i].split(" ")[0];
                                var month = noOfQuarters[i].split(" ")[1];
                                month = month * 3;
                                ////log.debug('month', month);
                                ////log.debug('year', year);
                                var fromDate = new Date(loanDate);
                                var fromDate1 = new Date(effectiveDateForReset);
                                //tomorrow.setDate(tomorrow.getDate() + 1);
                                var interestDate = lastDateOfTheMonth(month, year);
                                //log.debug('dd',interestDate);
                                var toDate = new Date(interestDate);
                                if (firstLoanAgreement) {
                                    // fromDate.setDate(fromDate.getDate() + 1);
                                    toDate.setDate(toDate.getDate() - 1);
                                    //log.debug('dd toDate',toDate);
                                }

                                //log.debug('dates', toDate + "from" + fromDate + "effectiveDateForReset" + effectiveDateForReset);
                                ////log.debug('noOfdays', noOfdays);
                                if (effectiveDateForReset) {
                                    if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {

                                        var yesterday = new Date(effectiveDateForReset)
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        var noOfdays = calculateNoOfDays(yesterday, fromDate);
                                        if (excludeFirstDay) {
                                            //log.debug(true);
                                            if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                            log.debug('noOfdays', noOfdays);
                                            noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        }
                                        } else {
                                            // noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        }
                                        
                                        var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                        var noOfdays1 = calculateNoOfDays(effectiveDateForReset, toDate);
                                        var interestAmount1 = (((noOfdays1) * (resetInterestRate / 100) * (outStandingLoanAmount)) / 365);
                                        interestAmount = parseFloat(interestAmount) + parseFloat(interestAmount1);
                                        var noOfDaysForAccured = parseFloat(noOfdays) + parseFloat(noOfdays1) - parseFloat(interestDate.getDate());
                                        if (firstLoanAgreement) {
                                            // log.debug('noOfDaysForAccured first',noOfDaysForAccured);
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                            // log.debug('noOfDaysForAccured first',noOfDaysForAccured);
                                        }
                                        var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    } else {
                                        var noOfdays = calculateNoOfDays(toDate, fromDate);
                                        log.debug('days', toDate + "fromDate" + fromDate);
                                        log.debug('rrr noOfdays', noOfdays);
                                        log.debug('effectiveDateForReset', effectiveDateForReset);
                                        if (effectiveDateForReset < fromDate) {
                                            interestRate = resetInterestRate;
                                        }
                                        //noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                        if (excludeFirstDay) {
                                        noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                    } else {
                                        if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                            log.debug('noOfdays', noOfdays);
                                            noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                        }
                                        else if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                            log.debug('noOfdays', noOfdays);
                                            //noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                        }
                                        else{
                                            //log.debug('noOfdays', noOfdays);
                                            //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        }
                                    }

                                        log.debug('noOfdaysssss', noOfdays);
                                        log.debug('interestRate', interestRate);
                                        log.debug('outStandingLoanAmount', outStandingLoanAmount);
                                        var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                        log.debug('interestAmountttt',interestAmount);
                                        var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(toDate.getDate());
                                        if (firstLoanAgreement) {
                                            // log.debug('noOfDaysForAccured second',noOfDaysForAccured);
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                            // log.debug('noOfDaysForAccured second',noOfDaysForAccured);
                                        } else {
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(2);
                                        }
                                        //log.debug('noOfDaysForAccured fd', noOfDaysForAccured);
                                        var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                        // log.debug('interestAmountForAccured second',interestAmountForAccured);
                                    }
                                } else {
                                    var noOfdays = calculateNoOfDays(toDate, fromDate);
                                    noOfdays = noOfdays - parseFloat(1);
                                    log.debug('i 0', noOfdays);
                                    if (excludeFirstDay) {
                                    if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays', noOfdays);
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    }
                                } else {
                                    if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays', noOfdays);
                                        //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    }
                                    else if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays', noOfdays);
                                        //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    } else {
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    }
                                }
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    log.audit('interestAmount', interestAmount);

                                    var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(toDate.getDate());
                                    if (firstLoanAgreement) {
                                        //   log.debug('noOfDaysForAccured third',noOfDaysForAccured);
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                        //   log.debug('noOfDaysForAccured third',noOfDaysForAccured);
                                    }else {
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                    }
                                    if (excludeFirstDay) {
                                        //   log.debug('noOfDaysForAccured third',noOfDaysForAccured);
                                        //noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                        //   log.debug('noOfDaysForAccured third',noOfDaysForAccured);
                                    }
                                    else {
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                        if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                        //noOfdays = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                    }
                                    else if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                        log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                        //noOfdays = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                    } else {
                                        log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) - parseFloat(1);
                                    }
                                    }

                                    var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    // log.debug('interestAmountForAccured', interestAmountForAccured);
                                }
                                var additionalInterestAmount = 0;
                                if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                        var yesterday = new Date(additionalEffectiveDateFrom);
                                        var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                        //log.debug('noOfdays',noOfdays);
                                        if (excludeFirstDay) {
                                        if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                            log.debug('noOfdays', noOfdays);
                                            noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        }
                                    }
                                        additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        //log.debug('additionalInterestAmount',additionalInterestAmount);
                                    } else {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                            var yesterday = new Date(additionalEffectiveDateFrom);
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, toDate);
                                            //log.debug('noOfdays',noOfdays);
                                            if (excludeFirstDay) {
                                            if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                                log.debug('noOfdays', noOfdays);
                                                noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            }
                                        }
                                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalInterestAmount',additionalInterestAmount);
                                        }

                                    }
                                } else {
                                    if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, fromDate);
                                            //log.debug('noOfdays',noOfdays);
                                            if (firstLoanAgreement) {
                                                noOfdays = parseFloat(noOfdays) + parseFloat(2);
                                            } else {
                                                //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            }
                                            if (excludeFirstDay) {
                                            if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                                log.debug('noOfdays', noOfdays);
                                                noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            }
                                        }
                                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalInterestAmount',additionalInterestAmount);
                                        } else {
                                            if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                                var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                                //log.debug('noOfdays',noOfdays);
                                                if (firstLoanAgreement) {
                                                    noOfdays = parseFloat(noOfdays) + parseFloat(2);
                                                } else {
                                                    //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                                }
                                                if (excludeFirstDay) {
                                                if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                                    log.debug('noOfdays', noOfdays);
                                                    noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                                }
                                            }
                                                additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                                //log.debug('additionalInterestAmount',additionalInterestAmount);
                                            }
                                        }
                                    } else {
                                        if ((fromDate >= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                            //log.debug('noOfdays',noOfdays);
                                            if (firstLoanAgreement) {
                                                noOfdays = parseFloat(noOfdays) + parseFloat(2);
                                            } else {
                                                //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            }
                                            if (excludeFirstDay) {
                                            if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                                log.debug('noOfdays', noOfdays);
                                                noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            }
                                        }
                                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalInterestAmount',additionalInterestAmount);
                                        }
                                    }
                                }
                                var additionalAccuredAmount = 0
                                if (applyAdditional) {

                                    var month = toDate.getMonth();

                                    if (month == 0) {
                                        month = 12;
                                    } else {
                                        month = month;
                                    }

                                    var checkingDate = lastDateOfTheMonth(month, year);
                                    if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= checkingDate)) {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= checkingDate)) {
                                            var yesterday = new Date(additionalEffectiveDateFrom);
                                            //yesterday.setDate(yesterday.getDate() - 1);
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                            if (excludeFirstDay) {
                                            if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                                log.debug('noOfdays', noOfdays);
                                                noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            }
                                        }
                                            additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        } else {
                                            if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                                var yesterday = new Date(additionalEffectiveDateFrom);
                                                //yesterday.setDate(yesterday.getDate() - 1);
                                                var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, checkingDate);
                                                //log.debug('noOfdays',noOfdays);
                                                if (excludeFirstDay) {
                                                if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                                    log.debug('noOfdays', noOfdays);
                                                    noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                                }
                                            }
                                                additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                                //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                            }

                                        }
                                    } else {
                                        if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= checkingDate)) {
                                            if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= checkingDate)) {
                                                var noOfdays = calculateNoOfDays(fromDate, checkingDate);
                                                //log.debug('noOfdays',noOfdays);
                                                if (excludeFirstDay) {
                                                    if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                                    log.debug('noOfdays', noOfdays);
                                                    noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                                }
                                                }
                                                else {
                                                    //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                                } 
                                                if (firstLoanAgreement) {
                                                }else {
                                                    noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                                }
                                                
                                                additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            } else {
                                                if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                                    var noOfdays = calculateNoOfDays(fromDate, checkingDate);
                                                    if (excludeFirstDay) {
                                                        if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                                        log.debug('noOfdays', noOfdays);
                                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                                    }
                                                    } else {
                                                        //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                                    }
                                                    if (firstLoanAgreement) {
                                                }else {
                                                    noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                                }
                                                    
                                                    additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                                    //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                                }
                                            }
                                        }
                                        if ((fromDate >= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                            //log.debug('noOfdays',noOfdays);
                                            if (excludeFirstDay) {
                                                if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                                log.debug('noOfdays', noOfdays);
                                                noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            }
                                            } else {
                                                //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            }
                                            if (firstLoanAgreement) {
                                                }else {
                                                    noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                                }
                                            
                                            additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                        }
                                    }


                                }
                                log.audit('final u=interestAmount', interestAmount);


                                var loanInteSchRec = record.create({
                                    type: 'customrecord_da_loan_interest_payment_sc'
                                });
                                loanInteSchRec.setValue('custrecord_da_created_from_loan', scriptContext.newRecord.getValue('custrecord_da_created_from_loan_agree'));
                                loanInteSchRec.setValue('custrecord_da_loan_interest_from', fromDate);
                                loanInteSchRec.setValue('custrecord_loan_agree_interest_date', interestDate);

                                if (!firstLoanAgreement) {
                                    toDate.setDate(toDate.getDate() - 1);
                                }
                                loanInteSchRec.setValue('custrecord_da_loan_interest_to', toDate);
                                loanInteSchRec.setValue('custrecord_da_loan_interest_loan_amt', interestAmount.toFixed(3));
                                 log.debug('interestAmountForAccured',interestAmountForAccured);
                                loanInteSchRec.setValue('custrecord_da_prior_periods_accrued_loan', interestAmountForAccured.toFixed(3));
                                if (applyAdditional) {
                                    loanInteSchRec.setValue('custrecord_da_additionaal_int_amount', additionalInterestAmount.toFixed(3));
                                    loanInteSchRec.setValue('custrecord_da_add_accrued_amount', additionalAccuredAmount.toFixed(3));
                                }
                                loanInteSchRec.setValue('custrecord_da_loan_agrmnt_parent', scriptContext.newRecord.id);
                                var year = noOfQuarters[i].split(" ")[0];
                                var month = noOfQuarters[i].split(" ")[1];
                                month = month * 3;
                                loanInteSchRec.setValue('custrecord_da_interest_schedule_period', getPostingPeriod(month, year));
                                var id = loanInteSchRec.save();
                                //log.debug('id',id);
                            }
                            if (i == (noOfQuarters.length - 1)) {
                                //log.error('noOfQuarters', noOfQuarters[i]);
                                var year = noOfQuarters[i].split(" ")[0];
                                var quarter = noOfQuarters[i].split(" ")[1];
                                var month;
                                if (quarter == 1) {
                                    month = 1;
                                }
                                if (quarter == 2) {
                                    month = 4;
                                }
                                if (quarter == 3) {
                                    month = 7;
                                }
                                if (quarter == 4) {
                                    month = 10;
                                }
                                ////log.debug('month', month);
                                ////log.debug('year', year);
                                var fromDate = new Date(month + "/01/" + year);

                                //log.debug('fff fromDate', fromDate);
                                // fromDate.setDate(fromDate.getDate() - 1);
                                var toDate = new Date(loanLastPaymentDate);
                                toDate.setDate(toDate.getDate() - 1);
                                //log.debug('tt toDate', toDate);
                                if (firstLoanAgreement) {
                                    //toDate.setDate(toDate.getDate() - 1);
                                } else {
                                    // toDate.setDate(toDate.getDate() - 1);
                                }
                                //toDate.setDate(toDate.getDate() - 1);
                                //log.debug('dates', toDate + "from" + fromDate);

                                if (effectiveDateForReset) {
                                    log.debug('fromDate', fromDate);
                                    log.debug('effectiveDateForReset', effectiveDateForReset);
                                    log.debug('toDate', toDate);
                                    if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                        log.debug(true);
                                        
                                        var yesterday = new Date(effectiveDateForReset);
                                        yesterday.setDate(yesterday.getDate() + 1);
                                        var noOfdays = calculateNoOfDays(yesterday, fromDate);
                                        log.debug('noOOOOOfdays', noOfdays);
                                        if (firstLoanAgreement) {
                                            noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            
                                }
                                        /*else{
                                                                                   noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                                                               }*/
                                        /*if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))){
                                            log.debug('noOfdays',noOfdays);
                                            noOfdays = parseFloat(noOfdays) + parseFloat(2);
                                        }*/
                                        var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                        log.debug('interestAmount', interestAmount);
                                        var noOfdays1 = calculateNoOfDays(effectiveDateForReset, toDate);
                                        log.debug('noOfdays1', noOfdays1);
                                        /*if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))){
                                            noOfdays1 = parseFloat(noOfdays1) + parseFloat(3);
                                        }*/
                                        log.debug('noOfdays1', noOfdays1);
                                        log.debug('interestRate', interestRate);
                                        log.debug('resetInterestRate', resetInterestRate);
                                        var interestAmount1 = (((noOfdays1) * (resetInterestRate / 100) * (outStandingLoanAmount)) / 365);
                                        log.debug('interestAmount1', interestAmount1);
                                        interestAmount = parseFloat(interestAmount) + parseFloat(interestAmount1);
                                        log.debug('interestAmount', interestAmount);
                                        var noOfDaysForAccured = parseFloat(noOfdays) + parseFloat(noOfdays1) - parseFloat(interestDate.getDate());
                                        if (Number(loanEndDate) == Number(loanLastPaymentDate)) {
                                            // log.debug('equal');
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) - parseFloat(1);
                                            // log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                        }
                                        if (excludeFirstDay) {
                                            log.debug('in');
                                           /*if ((!resetInterestRate) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfDaysForAccured1111',noOfDaysForAccured);
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                    }*/

                                    }
                                        var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);


                                    } else {


                                        var noOfdays = calculateNoOfDays(toDate, fromDate);
                                        log.debug('noOffffffdays', noOfdays);
                                        if (effectiveDateForReset < fromDate) {
                                            interestRate = resetInterestRate;
                                        }
                                        if (firstLoanAgreement) {
                                            noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        }
                                        if (excludeFirstDay) {
                                            //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays', noOfdays);
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    }
                                        }
                                        else {
                                            if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                                log.debug('noOfdays', noOfdays);
                                                noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                           }
                                       }
                                        log.debug('interestRate', interestRate);
                                        log.debug('resetInterestRate', resetInterestRate);
                                        var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                        log.debug('interestAmount', interestAmount);
                                        log.debug('noOfdays', noOfdays);
                                        var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(loanLastPaymentDate.getDate());
                                        if (excludeFirstDay) {
                                            log.debug('innnnnn');
                                            if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                    }
                                    else if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                        
                                       // noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                    }
                                    else{
                                        log.debug('noOfDaysForAccureddddd', noOfDaysForAccured);
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                    }
                                        }
                                        else{
                                        if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                            log.debug('noOfDaysForAccurrrrred', noOfDaysForAccured);
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                        } else if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                            log.debug('noOfDaysForAccureeeeeed', noOfDaysForAccured);
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                        } else{
                                            log.debug('noOfDaysForAccuredddddd', noOfDaysForAccured);
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                        }
                                    }
                                        if (Number(loanEndDate) == Number(loanLastPaymentDate)) {
                                            // log.debug('equal');
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) - parseFloat(1);
                                            // log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                        }
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);

                                        //log.debug('noOfDaysForAccured ff', noOfDaysForAccured);
                                        /*if (firstLoanAgreement) {
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                        }*/
                                        /*if (excludeFirstDay) {
                                            log.debug('iiiiin');

                                            if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                    }
                                    else if ((!resetInterestRate) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfDaysForAccured1111',noOfDaysForAccured);
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                    }
                                    else{

                                    }
                                        }*/
                                        log.debug('nnnnoOfDaysForAccured',noOfDaysForAccured);
                                        var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);

                                        


                                    }
                                } else {
                                    var noOfdays = calculateNoOfDays(toDate, fromDate);
                                    if (firstLoanAgreement) {
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        // log.debug('noOfdays',noOfdays);
                                    }
                                    if (excludeFirstDay) {
                                        //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        // log.debug('noOfdays',noOfdays);
                                    }
                                    else {
                                        if ((!resetInterestRate) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays', noOfdays);
                                        //noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                    } 

                                   }
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(loanLastPaymentDate.getDate());
                                    noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                    if (Number(loanEndDate) == Number(loanLastPaymentDate)) {
                                        // log.debug('equal');
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) - parseFloat(1);
                                        // log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                    }
                                    /*if (firstLoanAgreement) {
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                    }*/
                                    if (excludeFirstDay) {
                                        //noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        // log.debug('noOfdays',noOfdays);
                                        /*if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                            log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                        }*/
                                    } else{
                                        if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                            log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) - parseFloat(1);
                                        } else if ((!resetInterestRate) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) - parseFloat(1);
                                    } else{}
                                    }
                                    
                                          
                                    var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                }
                                var additionalInterestAmount = 0;
                                if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                        var yesterday = new Date(additionalEffectiveDateFrom);
                                        //yesterday.setDate(yesterday.getDate() - 1);
                                        var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                        additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                    } else {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                            var yesterday = new Date(additionalEffectiveDateFrom);
                                            //yesterday.setDate(yesterday.getDate() - 1);
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, toDate);
                                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        }

                                    }
                                } else {
                                    if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, fromDate);
                                            if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                                noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                            }
                                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        } else {
                                            if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                                var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                                if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                                    noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                                }
                                                additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            }
                                        }
                                    }
                                }
                                if ((fromDate >= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                    var noOfdays = calculateNoOfDays(fromDate, toDate);
                                    //log.debug('noOfdays',noOfdays);
                                    if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                        noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                    }
                                    additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                    //log.debug('additionalInterestAmount',additionalInterestAmount);

                                }


                                var additionalAccuredAmount = 0;
                                if (applyAdditional) {

                                    var month = toDate.getMonth();

                                    if (month == 0) {
                                        month = 12;
                                    } else {
                                        month = month;
                                    }

                                    var checkingDate = lastDateOfTheMonth(month, year);

                                    if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= checkingDate)) {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= checkingDate)) {
                                            var yesterday = new Date(additionalEffectiveDateFrom);
                                            yesterday.setDate(yesterday.getDate() + 1);
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                            //log.debug('noOfdays',noOfdays);
                                            additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                        } else {
                                            if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                                var yesterday = new Date(additionalEffectiveDateFrom);
                                                yesterday.setDate(yesterday.getDate() + 1);
                                                var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, checkingDate);
                                                //log.debug('noOfdays',noOfdays);
                                                additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                                //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                            }

                                        }
                                    } else {
                                        if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= checkingDate)) {
                                            if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= checkingDate)) {
                                                var noOfdays = calculateNoOfDays(fromDate, checkingDate);
                                                //log.debug('noOfdays',noOfdays);
                                                additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                                //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                            } else {
                                                if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                                    var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                                    //log.debug('noOfdays',noOfdays);
                                                    additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                                    //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                                }
                                            }
                                        }
                                        if ((fromDate >= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                            //log.debug('noOfdays',noOfdays);
                                            additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                        }


                                    }
                                }
                                var loanInteSchRec = record.create({
                                    type: 'customrecord_da_loan_interest_payment_sc'
                                });
                                // log.debug('loanEndDate final', loanEndDate);
                                // log.debug('loanLastPaymentDate final', loanLastPaymentDate);

                                loanInteSchRec.setValue('custrecord_da_created_from_loan', scriptContext.newRecord.getValue('custrecord_da_created_from_loan_agree'));
                                loanInteSchRec.setValue('custrecord_da_loan_interest_from', fromDate);
                                loanInteSchRec.setValue('custrecord_loan_agree_interest_date', loanLastPaymentDate);
                                loanInteSchRec.setValue('custrecord_da_loan_agrmnt_parent', scriptContext.newRecord.id);
                                if (applyAdditional) {
                                    loanInteSchRec.setValue('custrecord_da_additionaal_int_amount', additionalInterestAmount.toFixed(3));
                                    loanInteSchRec.setValue('custrecord_da_add_accrued_amount', additionalAccuredAmount.toFixed(3));
                                }
                                loanInteSchRec.setValue('custrecord_da_loan_interest_to', toDate);
                                loanInteSchRec.setValue('custrecord_da_loan_interest_loan_amt', interestAmount.toFixed(3));
                                var year = noOfQuarters[i].split(" ")[0];
                                var month = noOfQuarters[i].split(" ")[1];
                                month = month * 3;
                                loanInteSchRec.setValue('custrecord_da_interest_schedule_period', getPostingPeriod(month, year));
                                loanInteSchRec.setValue('custrecord_da_prior_periods_accrued_loan', interestAmountForAccured.toFixed(3));
                                var newRec = loanInteSchRec.save();
                                //log.debug('newRec', newRec);
                            }
                        } else {
                            var year = noOfQuarters[i].split(" ")[0];
                            var quarter = noOfQuarters[i].split(" ")[1];
                            var month;
                            if (quarter == 1) {
                                month = 1;
                            }
                            if (quarter == 2) {
                                month = 4;
                            }
                            if (quarter == 3) {
                                month = 7;
                            }
                            if (quarter == 4) {
                                month = 10;
                            }
                            ////log.debug('month', month);
                            ////log.debug('year', year);
                            var fromDate = new Date(month + "/01/" + year);
                            //fromDate.setDate(fromDate.getDate() - 1);
                            var monthForPP = quarter * 3;
                            var yearForPP = year;
                            var interestDate = lastDateOfTheMonth(quarter * 3, year);
                            var toDate = new Date(interestDate);

                            if (firstLoanAgreement) {
                                toDate.setDate(toDate.getDate() - 1);
                            } else {
                                toDate.setDate(toDate.getDate() - 1);
                            }
                            //toDate.setDate(toDate.getDate() - 1);
                            //log.debug('dates', toDate + "from" + fromDate);
                            log.debug('effectiveDateForReset date', effectiveDateForReset);
                            if (effectiveDateForReset) {
                                if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                    //log.debug(true);
                                    var yesterday = new Date(effectiveDateForReset);
                                    yesterday.setDate(yesterday.getDate() - 1);
                                    log.debug('resetInterestRate', resetInterestRate);
                                    log.debug('interestRatehhhhhh', interestRate);
                                    log.debug('nnn', yesterday + "fromDate" + fromDate);
                                    var noOfdays = calculateNoOfDays(yesterday, fromDate);
                                    log.debug('nnn', noOfdays);
                                   /* if (firstLoanAgreement) {
                                    if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays', noOfdays);
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    }
                                }
                                if (firstLoanAgreement) {
                                    if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays', noOfdays);
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    }
                                }*/
                                    var interestAmount4 = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    log.debug('nnn', effectiveDateForReset + "fromDate" + toDate);
                                    var noOfdays1 = calculateNoOfDays(effectiveDateForReset, toDate);
                                    log.debug('nnn1', noOfdays1);
                                   /* if (firstLoanAgreement) {
                                    if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays', noOfdays);
                                        noOfdays1 = parseFloat(noOfdays1) - parseFloat(1);
                                    }
                                }
                                if (firstLoanAgreement) {
                                    if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays', noOfdays);
                                        noOfdays1 = parseFloat(noOfdays1) - parseFloat(1);
                                    }
                                }*/
                                    log.debug('interestAmount4', interestAmount4);
                                    var interestAmount1 = (((noOfdays1) * (resetInterestRate / 100) * (outStandingLoanAmount)) / 365);
                                    var interestAmount = parseFloat(interestAmount4) + parseFloat(interestAmount1);
                                    log.debug('interestAmount', interestAmount);

                                    var noOfdays2 = parseFloat(noOfdays1) - parseFloat(toDate.getDate() - parseFloat(1));
                                    var interestAmount2 = (((noOfdays2) * (resetInterestRate / 100) * (outStandingLoanAmount)) / 365);
                                    var interestAmountForAccured = parseFloat(interestAmount4) + parseFloat(interestAmount2);

                                    // noOfdays = parseFloat(noOfdays) + parseFloat(noOfdays1);
                                    // var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(interestDate.getDate()) + parseFloat(1);
                                    // log.debug('aaa, noOfDaysForAccured', noOfDaysForAccured);
                                    // var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                } else {
                                    var noOfdays = calculateNoOfDays(interestDate, fromDate);
                                    log.debug('details1', noOfdays + " interestDate " + interestDate + " fromDate " + fromDate);
                                    if (effectiveDateForReset < fromDate) {
                                        interestRate = resetInterestRate;
                                    }
                                    noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                    log.debug('interestRate', interestRate);
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    if (excludeFirstDay) {
                                    if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                        log.debug('nooooOfdays', noOfdays);
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    }
                                }
                                    noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    log.debug('nnnnnoOfdays', noOfdays);
                                    var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(interestDate.getDate());

                                    if (firstLoanAgreement) {
                                    } else {
                                        noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(2);
                                    }
                                    if (excludeFirstDay) {
                                        if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                            log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                    noOfDaysForAccured = parseFloat(noOfDaysForAccured) - parseFloat(2);
                                }
                                       else if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                            log.debug('noOfdays', noOfdays);
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) - parseFloat(1);
                                        } else{}
                                    } else {
                                        //noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(2);
                                        if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                            log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) - parseFloat(1);
                                        }
                                        else if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                            log.debug('noOfDaysForAccured', noOfDaysForAccured);
                                            noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                        } else{}
                                    }


                                    var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    log.debug('interestAmountForAccured',interestAmountForAccured);
                                }
                            } else {
                                var noOfdays = calculateNoOfDays(interestDate, fromDate);
                                var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                if (excludeFirstDay) {
                                if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                    log.debug('noOfdays', noOfdays);
                                    noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                }
                            }
                                var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(interestDate.getDate());
                                if (firstLoanAgreement) {

                                } else {
                                    noOfDaysForAccured = parseFloat(noOfDaysForAccured) + parseFloat(1);
                                }
                                if (excludeFirstDay) {
                                    if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                    noOfDaysForAccured = parseFloat(noOfDaysForAccured) - parseFloat(1);
                                }
                                }

                                var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                log.debug('interestAmountForAccured',interestAmountForAccured);
                            }
                            var additionalInterestAmount = 0;
                            if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                    var yesterday = new Date(additionalEffectiveDateFrom);
                                    yesterday.setDate(yesterday.getDate() + 1);
                                    //yesterday.setDate(yesterday.getDate() - 1);
                                    var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                    additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                } else {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                        var yesterday = new Date(additionalEffectiveDateFrom);
                                        yesterday.setDate(yesterday.getDate() + 1);
                                        //yesterday.setDate(yesterday.getDate() - 1);
                                        var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, toDate);
                                        additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                    }

                                }
                            } else {
                                if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                        var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, fromDate);
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                            noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                        }
                                        additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                    } else {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                            noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                                noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                            }
                                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        }
                                    }
                                }
                            }
                            if ((fromDate >= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                //log.debug('noOfdays',noOfdays);
                                noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                    noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                }
                                additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                //log.debug('additionalInterestAmount',additionalInterestAmount);
                            }


                            var additionalAccuredAmount = 0;
                            if (applyAdditional) {

                                var month = toDate.getMonth();

                                if (month == 0) {
                                    month = 12;
                                } else {
                                    month = month;
                                }

                                var checkingDate = lastDateOfTheMonth(month, year);

                                if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= checkingDate)) {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= checkingDate)) {
                                        var yesterday = new Date(additionalEffectiveDateFrom);
                                        //yesterday.setDate(yesterday.getDate() - 1);
                                        var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                        additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                    } else {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                            var yesterday = new Date(additionalEffectiveDateFrom);
                                            //yesterday.setDate(yesterday.getDate() - 1);
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, checkingDate);
                                            //log.debug('noOfdays',noOfdays);
                                            additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                        }

                                    }
                                } else {
                                    if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= checkingDate)) {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= checkingDate)) {
                                            var noOfdays = calculateNoOfDays(fromDate, checkingDate);
                                            //log.debug('noOfdays',noOfdays);
                                            if (firstLoanAgreement) {

                                            } else {
                                                noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                            }
                                            if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                                noOfdays = parseFloat(noOfdays) - parseFloat(1);

                                            }
                                            additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        } else {
                                            if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                                var noOfdays = calculateNoOfDays(fromDate, checkingDate);
                                                if (firstLoanAgreement) {

                                                } else {
                                                    noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                                }
                                                if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                                    noOfdays = parseFloat(noOfdays) - parseFloat(1);

                                                }
                                                additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                                //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                            }
                                        }
                                    }
                                    if ((fromDate >= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                        var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                        //log.debug('noOfdays',noOfdays);
                                        if (firstLoanAgreement) {

                                        } else {
                                            noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        }
                                        if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                            noOfdays = parseFloat(noOfdays) - parseFloat(1);

                                        }
                                        additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                    }

                                }

                            }
                            var loanInteSchRec = record.create({
                                type: 'customrecord_da_loan_interest_payment_sc'
                            });
                            loanInteSchRec.setValue('custrecord_da_created_from_loan', scriptContext.newRecord.getValue('custrecord_da_created_from_loan_agree'));
                            loanInteSchRec.setValue('custrecord_da_loan_interest_from', fromDate);
                            loanInteSchRec.setValue('custrecord_loan_agree_interest_date', interestDate);
                            loanInteSchRec.setValue('custrecord_da_loan_agrmnt_parent', scriptContext.newRecord.id);
                            if (applyAdditional) {
                                loanInteSchRec.setValue('custrecord_da_additionaal_int_amount', additionalInterestAmount.toFixed(3));
                                loanInteSchRec.setValue('custrecord_da_add_accrued_amount', additionalAccuredAmount.toFixed(3));
                            }
                            loanInteSchRec.setValue('custrecord_da_loan_interest_to', toDate);
                            loanInteSchRec.setValue('custrecord_da_loan_interest_loan_amt', interestAmount.toFixed(3));
                            //log.debug('pps', monthForPP +'yearForPP' + yearForPP);

                            loanInteSchRec.setValue('custrecord_da_interest_schedule_period', getPostingPeriod(monthForPP, yearForPP));
                            loanInteSchRec.setValue('custrecord_da_prior_periods_accrued_loan', interestAmountForAccured.toFixed(3));
                            loanInteSchRec.save();
                        }
                    } else {
                        var fromDate = new Date(loanDate);
                        fromDate.setDate(fromDate.getDate() + 1);
                        var toDate = new Date(loanLastPaymentDate);
                        toDate.setDate(toDate.getDate() + 1);
                        var noOfdays = calculateNoOfDays(loanLastPaymentDate, fromDate);
                        var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                        var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(interestDate.getDate());
                        var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                        if (effectiveDateForReset) {
                            if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                //log.debug(true);
                                var yesterday = new Date(effectiveDateForReset)
                                yesterday.setDate(yesterday.getDate() + 1);
                                var noOfdays = calculateNoOfDays(yesterday, fromDate);
                                var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                var noOfdays1 = calculateNoOfDays(effectiveDateForReset, toDate);
                                var interestAmount1 = (((noOfdays1) * (resetInterestRate / 100) * (outStandingLoanAmount)) / 365);
                                interestAmount = parseFloat(interestAmount) + parseFloat(interestAmount1);
                                var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(loanLastPaymentDate.getDate());
                                var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                            } else {
                                var noOfdays = calculateNoOfDays(loanLastPaymentDate, fromDate);
                                if (effectiveDateForReset < fromDate) {
                                    interestRate = resetInterestRate;
                                }
                                var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(loanLastPaymentDate.getDate());
                                var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                            }
                        } else {
                            var noOfdays = calculateNoOfDays(toDate, fromDate);
                            var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                            var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(interestDate.getDate());
                            var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                        }
                        var additionalInterestAmount = 0;
                        if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                            if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                var yesterday = new Date(additionalEffectiveDateFrom);
                                yesterday.setDate(yesterday.getDate() + 1);
                                //yesterday.setDate(yesterday.getDate() - 1);
                                var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                            } else {
                                if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                    var yesterday = new Date(additionalEffectiveDateFrom);
                                    yesterday.setDate(yesterday.getDate() + 1);
                                    var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, toDate);
                                    additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                }

                            }
                        } else {
                            if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                    var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, fromDate);
                                    additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                } else {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                        var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                        additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                    }
                                }
                            }
                        }
                        if ((fromDate >= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                            var noOfdays = calculateNoOfDays(fromDate, toDate);
                            //log.debug('noOfdays',noOfdays);

                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                            //log.debug('additionalInterestAmount',additionalInterestAmount);
                        }

                        var additionalAccuredAmount = 0;
                        if (applyAdditional) {

                            var month = toDate.getMonth();

                            if (month == 0) {
                                month = 12;
                            } else {
                                month = month;
                            }

                            var checkingDate = lastDateOfTheMonth(month, year);

                            if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= checkingDate)) {
                                if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= checkingDate)) {
                                    var yesterday = new Date(additionalEffectiveDateFrom);
                                    var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                    //log.debug('noOfdays',noOfdays);
                                    additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                    //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                } else {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                        var yesterday = new Date(additionalEffectiveDateFrom);
                                        //yesterday.setDate(yesterday.getDate() - 1);
                                        var noOfdays = calculateNoOfDays(checkingDate, additionalEffectiveDateTo);
                                        //log.debug('noOfdays',noOfdays);
                                        additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                    }

                                }
                            } else {
                                if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= checkingDate)) {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= checkingDate)) {
                                        var noOfdays = calculateNoOfDays(fromDate, additionalEffectiveDateTo);
                                        //log.debug('noOfdays',noOfdays);
                                        additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                    } else {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                            var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                            //log.debug('noOfdays',noOfdays);
                                            additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                        }
                                    }
                                }
                                if ((fromDate >= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= checkingDate)) {
                                    var noOfdays = calculateNoOfDays(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                    //log.debug('noOfdays',noOfdays);
                                    additionalAccuredAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                    //log.debug('additionalAccuredAmount',additionalAccuredAmount);
                                }
                            }


                        }
                        var loanInteSchRec = record.create({
                            type: 'customrecord_da_loan_interest_payment_sc'
                        });
                        loanInteSchRec.setValue('custrecord_da_created_from_loan', scriptContext.newRecord.getValue('custrecord_da_created_from_loan_agree'));
                        loanInteSchRec.setValue('custrecord_da_loan_interest_from', fromDate);
                        loanInteSchRec.setValue('custrecord_loan_agree_interest_date', loanLastPaymentDate);
                        loanInteSchRec.setValue('custrecord_da_loan_agrmnt_parent', scriptContext.newRecord.id);
                        if (applyAdditional) {
                            loanInteSchRec.setValue('custrecord_da_additionaal_int_amount', additionalInterestAmount.toFixed(3));
                            loanInteSchRec.setValue('custrecord_da_add_accrued_amount', additionalAccuredAmount.toFixed(3));
                        }
                        loanInteSchRec.setValue('custrecord_da_loan_interest_to', toDate);
                        loanInteSchRec.setValue('custrecord_da_loan_interest_loan_amt', interestAmount.toFixed(3));
                        var year = noOfQuarters[i].split(" ")[0];
                        var month = noOfQuarters[i].split(" ")[1];
                        month = month * 3;
                        loanInteSchRec.setValue('custrecord_da_interest_schedule_period', getPostingPeriod(month, year));
                        loanInteSchRec.setValue('custrecord_da_prior_periods_accrued_loan', interestAmountForAccured.toFixed(3));
                        loanInteSchRec.save();
                    }
                }
                var noOfMonths = dateRange(loanDate, loanLastPaymentDate);

                var interestRate = scriptContext.newRecord.getValue('custrecord_da_bank_loan_interest_rate');
                var previousInterestRate = scriptContext.newRecord.getValue('custrecord_da_bla_previous_interest_rate');
                if (previousInterestRate) {
                    interestRate = previousInterestRate;
                }
                ////log.debug('noOfMonths', noOfMonths);
                for (var i = 0; i < noOfMonths.length; i++) {
                    if (noOfMonths.length > 1) {
                        if (i == 0 || i == (noOfMonths.length - 1)) {
                            if (i == 0) {
                                var month = noOfMonths[i].getMonth() + 1;
                                var year = noOfMonths[i].getFullYear();
                                var fromDate = new Date(loanDate);
                                var toDate;
                                if (month % 3 == 0) {
                                    fromDate = lastDateOfTheMonth(month, year);
                                    toDate = lastDateOfTheMonth(month, year);
                                } else {
                                    //fromDate = new Date(month+"01/"+ year);
                                    toDate = lastDateOfTheMonth(month, year);
                                }
                                if (effectiveDateForReset) {
                                    if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {

                                        var yesterday = new Date(effectiveDateForReset)
                                        //yesterday.setDate(yesterday.getDate() - 1);
                                        var noOfdays = calculateNoOfDays1(yesterday, fromDate);
                                        //if(firstLoanAgreement){
                                        noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                        // }  
                                        var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                        var noOfdays1 = calculateNoOfDays1(effectiveDateForReset, toDate);
                                        var interestAmount1 = (((noOfdays1) * (resetInterestRate / 100) * (outStandingLoanAmount)) / 365);
                                        interestAmount = parseFloat(interestAmount) + parseFloat(interestAmount1);
                                        var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(loanLastPaymentDate.getDate());
                                        var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    } else {
                                        var noOfdays = calculateNoOfDays1(fromDate, toDate);

                                        log.debug('details', noOfdays + " from date " + fromDate + " to date " + toDate);
                                        if (firstLoanAgreement) {

                                        } else {
                                            //noOfdays = parseFloat(noOfdays) - parseFloat(1);

                                        }
                                        if (effectiveDateForReset < fromDate) {
                                            interestRate = resetInterestRate;
                                        }
                                        // noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                        var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    }
                                } else {
                                    var noOfdays = calculateNoOfDays1(toDate, fromDate);
                                    log.debug('else log');
                                    //  if(firstLoanAgreement){
                                    noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                    //  }            
                                    if(excludeFirstDay){

                                    }   else{
                                        if ((!resetInterestRate) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        log.debug('noOfdaysssss',noOfdays);
                                    } 
                                        
                                    }                    
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                }
                                var additionalInterestAmount = 0;
                                if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                        var yesterday = new Date(additionalEffectiveDateFrom);
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        var noOfdays = calculateNoOfDays1(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                        //log.debug('noOfdays',noOfdays);
                                        if (firstLoanAgreement) {
                                            noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                        }
                                        additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        //log.debug('additionalInterestAmount',additionalInterestAmount);
                                    } else {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                            var yesterday = new Date(additionalEffectiveDateFrom);
                                            yesterday.setDate(yesterday.getDate() - 1);
                                            //yesterday.setDate(yesterday.getDate() - 1);
                                            var noOfdays = calculateNoOfDays1(additionalEffectiveDateFrom, toDate);
                                            //log.debug('noOfdays',noOfdays);
                                            if (firstLoanAgreement) {
                                                noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                            }
                                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalInterestAmount',additionalInterestAmount);
                                        }

                                    }
                                } else {
                                    if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                            var noOfdays = calculateNoOfDays1(fromDate, additionalEffectiveDateTo);
                                            //log.debug('noOfdays',noOfdays);
                                            if (firstLoanAgreement) {
                                                noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                            }
                                            if (excludeFirstDay) {
                                                //noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                            } else{
                                                if ((!resetInterestRate) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                            log.debug('noOfdays', noOfdays);
                                            noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                        }
                                            }
                                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalInterestAmount',additionalInterestAmount);
                                        } else {
                                            if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                                var noOfdays = calculateNoOfDays1(fromDate, toDate);
                                                //log.debug('noOfdays',noOfdays);
                                                if (firstLoanAgreement) {
                                                    noOfdays = parseFloat(noOfdays) - parseFloat(1);
                                                }
                                                additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                                //log.debug('additionalInterestAmount',additionalInterestAmount);
                                            }
                                        }
                                    }
                                }
                                var loanInteSchRec = record.create({
                                    type: 'customrecord_da__loan_accrued_interest_s'
                                });
                                loanInteSchRec.setValue('custrecord_da_created_from_loan_accr', scriptContext.newRecord.getValue('custrecord_da_created_from_loan_agree'));
                                loanInteSchRec.setValue('custrecord_da_loan_accrued_f', fromDate);
                                loanInteSchRec.setValue('custrecord_da_loan_accrued_release_date', toDate);
                                loanInteSchRec.setValue('custrecord_da_bank_loan_agrmnt_ref', scriptContext.newRecord.id);
                                loanInteSchRec.setValue('custrecord_da_loan_accrued_to', toDate);
                                loanInteSchRec.setValue('custrecord_da_accured_add_interest', additionalInterestAmount.toFixed(3));
                                loanInteSchRec.setValue('custrecord_da_loan_accrued_loan_amt', interestAmount.toFixed(3));
                                loanInteSchRec.save();
                            }
                            if (i == (noOfMonths.length - 1)) {
                                var month = noOfMonths[i].getMonth() + 1;
                                var year = noOfMonths[i].getFullYear();
                                var fromDate;
                                var toDate = new Date(loanLastPaymentDate);
                                if (month % 3 == 0) {
                                    fromDate = lastDateOfTheMonth(month, year);
                                    toDate = lastDateOfTheMonth(month, year);
                                } else {
                                    fromDate = new Date(month + "/01/" + year);
                                    //toDate = lastDateOfTheMonth(month, year);
                                }
                                if (effectiveDateForReset) {
                                    if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                        //log.debug(true);
                                        var yesterday = new Date(effectiveDateForReset);
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        var noOfdays = calculateNoOfDays1(yesterday, fromDate);
                                        
                                        var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                        var noOfdays1 = calculateNoOfDays1(effectiveDateForReset, toDate);
                                        
                                        var interestAmount1 = (((noOfdays1) * (resetInterestRate / 100) * (outStandingLoanAmount)) / 365);
                                        interestAmount = parseFloat(interestAmount) + parseFloat(interestAmount1);
                                        var noOfDaysForAccured = parseFloat(noOfdays) - parseFloat(loanLastPaymentDate.getDate());
                                        var interestAmountForAccured = (((noOfDaysForAccured) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    } else {
                                        var noOfdays = calculateNoOfDays1(fromDate, toDate);
                                        if (effectiveDateForReset < fromDate) {
                                            interestRate = resetInterestRate;
                                        }
                                        var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    }
                                } else {
                                    var noOfdays = calculateNoOfDays1(toDate, fromDate);
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                }
                                var additionalInterestAmount = 0;
                                if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                        var yesterday = new Date(additionalEffectiveDateFrom);
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        var noOfdays = calculateNoOfDays1(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                        //log.debug('noOfdays',noOfdays);
                                        additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        //log.debug('additionalInterestAmount',additionalInterestAmount);
                                    } else {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                            var yesterday = new Date(additionalEffectiveDateFrom);
                                            yesterday.setDate(yesterday.getDate() - 1);
                                            //yesterday.setDate(yesterday.getDate() - 1);
                                            var noOfdays = calculateNoOfDays1(additionalEffectiveDateFrom, toDate);
                                            //log.debug('noOfdays',noOfdays);
                                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalInterestAmount',additionalInterestAmount);
                                        }

                                    }
                                } else {
                                    if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                            var noOfdays = calculateNoOfDays1(fromDate, additionalEffectiveDateTo);
                                            //log.debug('noOfdays',noOfdays);
                                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalInterestAmount',additionalInterestAmount);
                                        } else {
                                            if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                                var noOfdays = calculateNoOfDays1(fromDate, toDate);
                                                //log.debug('noOfdays',noOfdays);
                                                additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                                //log.debug('additionalInterestAmount',additionalInterestAmount);
                                            }
                                        }
                                    }
                                }

                                var loanInteSchRec = record.create({
                                    type: 'customrecord_da__loan_accrued_interest_s'
                                });
                                loanInteSchRec.setValue('custrecord_da_created_from_loan_accr', scriptContext.newRecord.getValue('custrecord_da_created_from_loan_agree'));
                                loanInteSchRec.setValue('custrecord_da_loan_accrued_f', fromDate);
                                loanInteSchRec.setValue('custrecord_da_loan_accrued_release_date', toDate);
                                loanInteSchRec.setValue('custrecord_da_bank_loan_agrmnt_ref', scriptContext.newRecord.id);
                                loanInteSchRec.setValue('custrecord_da_loan_accrued_to', toDate);
                                loanInteSchRec.setValue('custrecord_da_accured_add_interest', additionalInterestAmount.toFixed(3));
                                loanInteSchRec.setValue('custrecord_da_loan_accrued_loan_amt', interestAmount.toFixed(3));
                                if (Number(toDate) != Number(loanEndDate)) {
                                    // log.debug('toDate',toDate);
                                    // log.debug('loanEndDate',loanEndDate);
                                    var recordLoan = loanInteSchRec.save();
                                    // log.debug('recordLoan', recordLoan);
                                }

                            }
                        } else {
                            var month = noOfMonths[i].getMonth() + 1;
                            var year = noOfMonths[i].getFullYear();
                            var fromDate;
                            var toDate;
                            if (month % 3 == 0) {
                                fromDate = lastDateOfTheMonth(month, year);
                                toDate = lastDateOfTheMonth(month, year);
                            } else {
                                fromDate = new Date(month + "/01/" + year);
                                toDate = lastDateOfTheMonth(month, year);
                            }
                            log.debug('else case');
                            if (effectiveDateForReset) {
                                if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                    //log.debug(true);
                                    var yesterday = new Date(effectiveDateForReset)
                                    yesterday.setDate(yesterday.getDate() - 1);
                                    var noOfdays = calculateNoOfDays1(yesterday, fromDate);
                                   /* if (firstLoanAgreement) {
                                    if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays', noOfdays);
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    }
                                    else if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays', noOfdays);
                                        noOfdays = parseFloat(noOfdays) + parseFloat(1);
                                    }
                                    else{

                                    }
                                }*/
                                
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                    var noOfdays1 = calculateNoOfDays1(effectiveDateForReset, toDate);
                                   /* if (firstLoanAgreement) {
                                    if ((resetInterestRate > 0) && (Number(loanEndDate) != Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays1', noOfdays1);
                                        noOfdays1 = parseFloat(noOfdays1) - parseFloat(1);
                                    } else if ((resetInterestRate > 0) && (Number(loanEndDate) == Number(loanLastPaymentDate))) {
                                        log.debug('noOfdays1', noOfdays1);
                                        noOfdays1 = parseFloat(noOfdays1) - parseFloat(1);
                                    } else {

                                    }
                                }*/
                                    var interestAmount1 = (((noOfdays1) * (resetInterestRate / 100) * (outStandingLoanAmount)) / 365);
                                    interestAmount = parseFloat(interestAmount) + parseFloat(interestAmount1);
                                } else {
                                    var noOfdays = calculateNoOfDays1(fromDate, toDate);
                                    if (effectiveDateForReset < fromDate) {
                                        interestRate = resetInterestRate;
                                    }
                                    var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                }
                            } else {
                                log.debug(' case');
                                var noOfdays = calculateNoOfDays1(toDate, fromDate);
                                var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                            }
                            var additionalInterestAmount = 0;
                            if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                log.debug('else case1');
                                if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                    log.debug('else case2');
                                    var yesterday = new Date(additionalEffectiveDateFrom);
                                    yesterday.setDate(yesterday.getDate() - 1);
                                    var noOfdays = calculateNoOfDays1(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                    //log.debug('noOfdays',noOfdays);

                                    additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                    //log.debug('additionalInterestAmount',additionalInterestAmount);
                                } else {
                                    log.debug('else case3');
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                        var yesterday = new Date(additionalEffectiveDateFrom);
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        //yesterday.setDate(yesterday.getDate() - 1);
                                        var noOfdays = calculateNoOfDays1(additionalEffectiveDateFrom, toDate);
                                        //log.debug('noOfdays',noOfdays);
                                        additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        //log.debug('additionalInterestAmount',additionalInterestAmount);
                                    }

                                }
                            } else {
                                log.debug('else case4');
                                if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                        var noOfdays = calculateNoOfDays1(fromDate, additionalEffectiveDateTo);
                                        //log.debug('noOfdays',noOfdays);
                                        additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        //log.debug('additionalInterestAmount',additionalInterestAmount);
                                    } else {
                                        if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                            var noOfdays = calculateNoOfDays1(fromDate, toDate);
                                            //log.debug('noOfdays',noOfdays);
                                            additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                            //log.debug('additionalInterestAmount',additionalInterestAmount);
                                        }
                                    }
                                }
                            }

                            var loanInteSchRec = record.create({
                                type: 'customrecord_da__loan_accrued_interest_s'
                            });
                            loanInteSchRec.setValue('custrecord_da_created_from_loan_accr', scriptContext.newRecord.getValue('custrecord_da_created_from_loan_agree'));
                            loanInteSchRec.setValue('custrecord_da_loan_accrued_f', fromDate);
                            loanInteSchRec.setValue('custrecord_da_loan_accrued_release_date', toDate);
                            loanInteSchRec.setValue('custrecord_da_accured_add_interest', additionalInterestAmount.toFixed(3));
                            loanInteSchRec.setValue('custrecord_da_bank_loan_agrmnt_ref', scriptContext.newRecord.id);
                            loanInteSchRec.setValue('custrecord_da_loan_accrued_to', toDate);
                            loanInteSchRec.setValue('custrecord_da_loan_accrued_loan_amt', interestAmount.toFixed(3));
                            loanInteSchRec.save();
                        }
                    } else {
                        var fromDate = new Date(loanDate);
                        //var yesterday = new Date(loanLastPaymentDate);
                        var toDate = loanLastPaymentDate;
                        if (effectiveDateForReset) {
                            if ((fromDate <= effectiveDateForReset) && (effectiveDateForReset <= toDate)) {
                                //log.debug(true);
                                var yesterday = new Date(effectiveDateForReset)
                                yesterday.setDate(yesterday.getDate() - 1);
                                var noOfdays = calculateNoOfDays(yesterday, fromDate);
                                
                                var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                                var noOfdays1 = calculateNoOfDays(effectiveDateForReset, toDate);
                                
                                var interestAmount1 = (((noOfdays1) * (resetInterestRate / 100) * (outStandingLoanAmount)) / 365);
                                interestAmount = parseFloat(interestAmount) + parseFloat(interestAmount1);
                            } else {
                                var noOfdays = calculateNoOfDays1(fromDate, toDate);
                                if (effectiveDateForReset < fromDate) {
                                    interestRate = resetInterestRate;
                                }
                                var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                            }
                        } else {
                            var noOfdays = calculateNoOfDays1(toDate, fromDate);
                            var interestAmount = (((noOfdays) * (interestRate / 100) * (outStandingLoanAmount)) / 365);
                        }
                        var additionalInterestAmount = 0;
                        if ((fromDate <= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                            if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                var yesterday = new Date(additionalEffectiveDateFrom);
                                yesterday.setDate(yesterday.getDate() - 1);
                                var noOfdays = calculateNoOfDays1(additionalEffectiveDateFrom, additionalEffectiveDateTo);
                                //log.debug('noOfdays',noOfdays);
                                additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                //log.debug('additionalInterestAmount',additionalInterestAmount);
                            } else {
                                if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                    var yesterday = new Date(additionalEffectiveDateFrom);
                                    yesterday.setDate(yesterday.getDate() - 1);
                                    //yesterday.setDate(yesterday.getDate() - 1);
                                    var noOfdays = calculateNoOfDays1(additionalEffectiveDateFrom, toDate);
                                    //log.debug('noOfdays',noOfdays);
                                    additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                    //log.debug('additionalInterestAmount',additionalInterestAmount);
                                }

                            }
                        } else {
                            if ((fromDate >= additionalEffectiveDateFrom) && (additionalEffectiveDateFrom <= toDate)) {
                                if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo <= toDate)) {
                                    var noOfdays = calculateNoOfDays1(fromDate, additionalEffectiveDateTo);
                                    //log.debug('noOfdays',noOfdays);
                                    additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                    //log.debug('additionalInterestAmount',additionalInterestAmount);
                                } else {
                                    if ((fromDate <= additionalEffectiveDateTo) && (additionalEffectiveDateTo >= toDate)) {
                                        var noOfdays = calculateNoOfDays1(fromDate, toDate);
                                        //log.debug('noOfdays',noOfdays);
                                        additionalInterestAmount = (((noOfdays) * (additionalIntRate / 100) * (outStandingLoanAmount)) / 365);
                                        //log.debug('additionalInterestAmount',additionalInterestAmount);
                                    }
                                }
                            }
                        }
                        var loanInteSchRec = record.create({
                            type: 'customrecord_da__loan_accrued_interest_s'
                        });
                        loanInteSchRec.setValue('custrecord_da_created_from_loan_accr', scriptContext.newRecord.getValue('custrecord_da_created_from_loan_agree'));
                        loanInteSchRec.setValue('custrecord_da_loan_accrued_f', fromDate);
                        loanInteSchRec.setValue('custrecord_da_loan_accrued_release_date', loanLastPaymentDate);
                        loanInteSchRec.setValue('custrecord_da_bank_loan_agrmnt_ref', scriptContext.newRecord.id);
                        loanInteSchRec.setValue('custrecord_da_accured_add_interest', additionalInterestAmount.toFixed(3));
                        loanInteSchRec.setValue('custrecord_da_loan_accrued_to', loanLastPaymentDate);
                        loanInteSchRec.setValue('custrecord_da_loan_accrued_loan_amt', interestAmount.toFixed(3));
                        loanInteSchRec.save();
                    }
                }

                var customrecord_da_loan_interest_payment_scSearchObj = search.create({
                    type: "customrecord_da_loan_interest_payment_sc",
                    filters: [
                        ["custrecord_da_loan_agrmnt_parent", "anyof", scriptContext.newRecord.id]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_da_loan_interest_trans_no",
                            sort: search.Sort.DESC,
                            label: "Transaction#"
                        }),
                        search.createColumn({
                            name: "custrecord_da_int_sch_reverese_gl",
                            sort: search.Sort.DESC,
                            label: "Reverse Transaction#"
                        }),
                        search.createColumn({
                            name: "custrecord_da_interest_schedule_period",
                            label: "Payment Period"
                        }),
                    ]
                });
                var searchResultCount = customrecord_da_loan_interest_payment_scSearchObj.runPaged().count;
                //log.debug("customrecord_da_loan_interest_payment_scSearchObj result count",searchResultCount);

                var comparePeriodIds = [];
                customrecord_da_loan_interest_payment_scSearchObj.run().each(function(result) {
                    var ppId = result.getValue('custrecord_da_interest_schedule_period');
                    var tranExists = result.getValue('custrecord_da_loan_interest_trans_no');
                    var reverseTranExists = result.getValue('custrecord_da_int_sch_reverese_gl');
                    //log.debug(tranExists, comparePeriodIds);
                    //log.debug(reverseTranExists);
                    //log.debug('check ', comparePeriodIds.indexOf(ppId) != -1);
                    if (tranExists > 0 || reverseTranExists > 0) {
                        comparePeriodIds.push(ppId);
                    } else {
                        if (comparePeriodIds.indexOf(ppId) != -1) {
                            //log.debug('record deleting');
                            record.delete({
                                type: 'customrecord_da_loan_interest_payment_sc',
                                id: result.id
                            })
                        } else {
                            comparePeriodIds.push(ppId);
                        }
                    }

                    return true;
                });

                var customrecord_da_loan_interest_payment_scSearchObj = search.create({
                    type: "customrecord_da__loan_accrued_interest_s",
                    filters: [
                        ["custrecord_da_bank_loan_agrmnt_ref", "anyof", scriptContext.newRecord.id]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_da_loan_accrued_trans_no",
                            sort: search.Sort.DESC,
                            label: "Transaction#"
                        }),
                        search.createColumn({
                            name: "custrecord_da_loan_accrued_f",
                            label: "From Date"
                        }),
                    ]
                });
                var searchResultCount = customrecord_da_loan_interest_payment_scSearchObj.runPaged().count;
                //log.debug("customrecord_da_loan_interest_payment_scSearchObj result count",searchResultCount);

                var comparePeriodIds = [];
                customrecord_da_loan_interest_payment_scSearchObj.run().each(function(result) {
                    var ppId = result.getValue('custrecord_da_loan_accrued_f');
                    var tranExists = result.getValue('custrecord_da_loan_accrued_trans_no');
                    //log.debug(tranExists, comparePeriodIds);
                    //log.debug('check ', comparePeriodIds.indexOf(ppId) != -1);
                    if (tranExists > 0) {
                        comparePeriodIds.push(ppId);
                    } else {
                        if (comparePeriodIds.indexOf(ppId) != -1) {
                            //log.debug('record deleting');
                            record.delete({
                                type: 'customrecord_da__loan_accrued_interest_s',
                                id: result.id
                            })
                        } else {
                            comparePeriodIds.push(ppId);
                        }
                    }

                    return true;
                });
            } catch (ex) {
                //log.error(ex.name, ex.message);
            }
        }

        function calculateNoOfDays1(date2, date1) {
            var res = Math.abs(date1 - date2) / 1000;
            var days = Math.floor(res / 86400);
            return days + 1;
        }

        function calculateNoOfDays(date2, date1) {
            // The number of milliseconds in one day
            var ONEDAY = 1000 * 60 * 60 * 24;
            // Convert both dates to milliseconds
            var date1_ms = date1.getTime();
            var date2_ms = date2.getTime();
            // Calculate the difference in milliseconds
            var difference_ms = Math.abs(date1_ms - date2_ms);

            // Convert back to days and return
            return Math.round(difference_ms / ONEDAY) + 1;
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
            //log.debug(month, year);
            return new Date(year, month, 0);
        }

        function getQuarter(date) {
            return date.getFullYear() + ' ' + Math.ceil((date.getMonth() + 1) / 3);
        }

        function noOfquarters(sDate, eDate) {
            //log.debug('sDate', sDate);
            //log.debug('eDate', eDate);
            // Ensure start is the earlier date;
            if (sDate > eDate) {
                var t = eDate;
                eDate = sDate;
                sDate = t;
            }
            // Copy input start date do don't affect original
            sDate = new Date(sDate);
            //log.debug('1sDate', sDate);
            //log.debug('1eDate', eDate);
            // Set to 2nd of month so adding months doesn't roll over
            // and not affected by daylight saving
            sDate.setDate(2);
            //log.debug('2sDate', sDate);
            //log.debug('2eDate', eDate);
            // Initialise result array with start quarter
            var startQ = getQuarter(sDate);
            //log.debug();
            var endQ = getQuarter(eDate);
            var result = [startQ];
            // List quarters from start to end
            while (startQ != endQ) {
                sDate.setMonth(sDate.getMonth() + 3);
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
            //log.debug('postingperiodMonth', postingperiodMonth + " " + year);
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
            //log.debug("accountingperiodSearchObj result count", searchResultCount);
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
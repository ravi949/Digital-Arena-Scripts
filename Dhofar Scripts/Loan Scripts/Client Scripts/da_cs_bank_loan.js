/**
 * @NScriptName ClientScript
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(["require", "exports", "N/search"], function (require, exports, search) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var InterestFrequency;
    (function (InterestFrequency) {
        InterestFrequency[InterestFrequency["MONTHLY"] = 1] = "MONTHLY";
        InterestFrequency[InterestFrequency["QUARTERLY"] = 2] = "QUARTERLY";
        InterestFrequency[InterestFrequency["SIX_MONTHS"] = 3] = "SIX_MONTHS";
        InterestFrequency[InterestFrequency["YEARLY"] = 4] = "YEARLY";
    })(InterestFrequency || (InterestFrequency = {}));
    var TransactionStatus;
    (function (TransactionStatus) {
        TransactionStatus[TransactionStatus["UNPAID"] = 1] = "UNPAID";
        TransactionStatus[TransactionStatus["PAID"] = 2] = "PAID";
    })(TransactionStatus || (TransactionStatus = {}));
    function saveRecord(context) {
        var bankLoan = context.currentRecord;
        var loanAgreementSubListId = 'recmachcustrecord_da_created_from_loan_agree';
        // Validate Entered Payments in Load Agreement
        if (!validateTotalPayments(bankLoan, loanAgreementSubListId)) {
            alert('Total sum of loan payments in Loan Agreement must be equal to "Total Amount of Loan"');
            return false;
        }
        var interestFreq = Number(bankLoan.getValue('custrecord_da_loan_interest_payment_freq'));
        var isCalculated = false;
        switch (interestFreq) {
            case InterestFrequency.QUARTERLY:
                isCalculated = createQuarterlyInterestSchedule(bankLoan, loanAgreementSubListId);
                break;
            default:
                //TODO: To be removed after implementation.
                alert('Sorry! Chosen "Interest Frequency" is under development and not supported yet!');
                break;
        }
        return isCalculated;
    }
    exports.saveRecord = saveRecord;
    var getLoanDateSettings = function () {
        var loanSettingsSearch = search.create({
            type: 'customrecord_da_loan_settings',
            columns: ['custrecord_da_load_date_format', 'custrecord_da_load_date_separator']
        }).run().getRange({ start: 0, end: 1 });
        if (!loanSettingsSearch.length) {
            alert('No Loan Settings has been found. Please contact your administrator');
            return false;
        }
        var loanSettings = loanSettingsSearch[0];
        var format = loanSettings.getText('custrecord_da_load_date_format');
        var separator = loanSettings.getText('custrecord_da_load_date_separator');
        return { format: format, separator: separator };
    };
    var validateTotalPayments = function (bankLoan, subListId) {
        var totalLoan = bankLoan.getValue('custrecord_da_total_amount_of_loan');
        var loanAgreementLineCount = bankLoan.getLineCount({ sublistId: subListId });
        var totalEnteredPayments = 0;
        for (var i = 0; i < loanAgreementLineCount; i++) {
            totalEnteredPayments += Number(bankLoan.getSublistValue({ sublistId: subListId, fieldId: 'custrecord_da_loan_payment', line: i }));
        }
        return (totalEnteredPayments === totalLoan);
    };
    var createQuarterlyInterestSchedule = function (bankLoan, loanAgreementSubListId) {
        var quarters = [new Date('3/30'), new Date('6/29'), new Date('9/29'), new Date('12/30')];
        // const dateSettings = getLoanDateSettings();
        // if (!dateSettings)
        //     return false;
        var loanDate = new Date(bankLoan.getValue('custrecord_da_loan_date').toString());
        var firstQuarter = quarters.filter(function (quarter) {
            quarter = new Date(quarter.setFullYear(loanDate.getFullYear()));
            return quarter.getTime() > loanDate.getTime();
        })[0];
        var loanPaymentsCount = bankLoan.getLineCount({ sublistId: loanAgreementSubListId });
        var lastPaymentDate = new Date(bankLoan.getSublistValue({
            sublistId: loanAgreementSubListId,
            fieldId: 'custrecord_da_loan_payment_date',
            line: loanPaymentsCount - 1
        }).toString());
        var totalLoan = Number(bankLoan.getValue('custrecord_da_total_amount_of_loan'));
        var rate = Number(bankLoan.getValue('custrecord_da_loan_interest_rate'));
        var additionalRate = Number(bankLoan.getValue('custrecord_da_additional_interest_rate'));
        var interestPaymentSubListId = 'customrecord_da_loan_interest_payment_sc';
        var fromDate = new Date(loanDate.getTime());
        var toDate = new Date(firstQuarter.getTime());
        var currentQuarter = new Date(firstQuarter.getTime());
        var lineNo = 0;
        do {
            var interestAmount = (totalLoan * (rate / 100 + additionalRate / 100) / 365) * ((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
            var transactionNo = bankLoan.getCurrentSublistValue({ sublistId: interestPaymentSubListId, fieldId: '	custrecord_da_loan_interest_trans_no' });
            bankLoan.setCurrentSublistValue({
                sublistId: interestPaymentSubListId,
                fieldId: 'custrecord_da_loan_interest_from',
                value: fromDate,
                ignoreFieldChange: true,
            });
            bankLoan.setCurrentSublistValue({
                sublistId: interestPaymentSubListId,
                fieldId: 'custrecord_da_loan_interest_to',
                value: toDate,
                ignoreFieldChange: true,
            });
            bankLoan.setCurrentSublistValue({
                sublistId: interestPaymentSubListId,
                fieldId: 'custrecord_da_loan_interest_status',
                value: (transactionNo) ? TransactionStatus.PAID : TransactionStatus.UNPAID,
                ignoreFieldChange: true,
            });
            bankLoan.setCurrentSublistValue({
                sublistId: interestPaymentSubListId,
                fieldId: 'custrecord_da_loan_interest_loan_amt',
                value: interestAmount,
                ignoreFieldChange: true,
            });
            bankLoan.selectNewLine({ sublistId: interestPaymentSubListId });
            // Prepare for the next iteration
            toDate = quarters[quarters.indexOf(fromDate) + 1] || quarters.map(function (quarter) { return new Date(quarter.setFullYear(quarter.getFullYear() + 1)); })[0];
            fromDate = new Date(toDate.getTime());
            fromDate = new Date(fromDate.setDate(fromDate.getDate() + 1));
        } while (toDate.getTime() < lastPaymentDate.getTime());
        //TODO: Handle last period between last selected quarter to the last payment day
        return true;
    };
});

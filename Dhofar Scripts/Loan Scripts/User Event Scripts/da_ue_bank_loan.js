/**
 * @NScriptName UserEventScript
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(["require", "exports", "N/search", "N/log"], function (require, exports, search, log) {
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
    function afterSubmit(context) {
        var bankLoan = context.newRecord;
        var loanAgreementSubListId = 'customrecord_da_bank_loan_agreement';
        // Validate Entered Payments in Load Agreement
        if (!validateTotalPayments(bankLoan, loanAgreementSubListId)) {
            // alert('Total sum of loan payments in Loan Agreement must be equal to "Total Amount of Loan"');
            return false;
        }
        return false;
    }
    exports.afterSubmit = afterSubmit;
    var validateTotalPayments = function (bankLoan, subListId) {
        var totalLoan = bankLoan.getValue('custrecord_da_total_amount_of_loan');
        var results = search.create({
            type: subListId,
        }).run().getRange({ start: 0, end: 999 });
        log.debug('records from search', results);
        return false;
    };
});

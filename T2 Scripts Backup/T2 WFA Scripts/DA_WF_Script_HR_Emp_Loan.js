/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/ui/serverWidget', 'N/record','N/search'],
    function(serverWidget, record, search) {
        function onAction(scriptContext) {
            try {
                log.debug('scripttype', scriptContext.type);
                var recId = scriptContext.newRecord.id;
                var type = scriptContext.newRecord.type;
                log.debug('Record ID', recId);
                log.debug('type', type);
                var employeeLoanRecord = scriptContext.newRecord;
                var startDate = scriptContext.newRecord.getValue('custrecord_da_loan_start_date');
                var deductionDate = scriptContext.newRecord.getValue('custrecord_da_prefer_start_deduction');
                var totalAmount = scriptContext.newRecord.getValue('custrecord_da_loan_total_amount');
                var installments = scriptContext.newRecord.getValue('custrecord_da_no_of_installments');
                log.debug('startdate', startDate);
                log.debug('deductiondate', deductionDate);
                log.debug('totalamount', totalAmount);
                log.debug('installments', installments);
                if (totalAmount && installments) {
                    var installment_amount = (parseFloat(totalAmount) / parseFloat(installments)).toFixed(2);
                    log.debug('installment amount', installment_amount);
                    for (var i = 0; i < installments; i++) {
                        var rec = record.create({
                            type: 'customrecord_da_hr_loan_installment'
                        });
                        rec.setValue('custrecord_da_loan_sequence', i + 1);                       
                        rec.setValue('custrecord_da_installment_amount_hr', installment_amount);
                        rec.setValue('custrecord_da_installment_date', deductionDate);
                        rec.setValue('custrecord_da_hr_loan_id', recId);
                        rec.save();
                        deductionDate.setMonth(deductionDate.getMonth() + 1);
                    }
                }
                employeeLoanRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function getPostingPeriod(month, year) {

            log.debug('month', month+" "+ year);
            var monthObj = {
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
            };
            var monthId = monthObj[month];            
            var sample = search.create({
                type: search.Type.ACCOUNTING_PERIOD,
                filters: [
                    ['periodname', 'is', monthId + ' ' + year]
                ]
            });
            var id;
            sample.run().each(function(result) {
                id = result.id;                
            });
            return id;
        }
        return {
            onAction: onAction
        }
    });
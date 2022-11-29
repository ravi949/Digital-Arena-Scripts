/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/ui/message', 'N/ui/serverWidget', 'N/search', 'N/runtime', 'N/record'],
    function(message, serverWidget, search, runtime, record) {
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {
            try {} catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {}
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {
            try {
                if (scriptContext.type == 'create') {
                    var courseStartDate = scriptContext.newRecord.getValue('custrecord_da_coursestartdate');
                    var courseYear = courseStartDate.getFullYear();
                    log.debug('courseYear', courseYear);
                    var departmentId = scriptContext.newRecord.getValue('custrecord_da_employee_department');
                    var traningPlanSearchObj = search.create({
                        type: 'customrecord_da_training_plan_details',
                        filters: [
                            ["custrecord_da_training_link.custrecord_da_training_plan_year", "is", "2020"],
                            "AND",
                            ["custrecord_da_training_department", "anyof", departmentId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custrecord_da_training_department",
                                summary: "GROUP",
                                label: "Department"
                            }),
                            search.createColumn({
                                name: "custrecord_da_training_emp_count",
                                summary: "SUM",
                                label: "Employee Count"
                            })
                        ]
                    });
                    var totalCount = 0;
                    traningPlanSearchObj.run().each(function(result) {
                        log.debug('t');
                        totalCount = result.getValue({
                            name: 'custrecord_da_training_emp_count',
                            summary: search.Summary.SUM
                        });
                    });
                    log.debug('totalCount', totalCount);
                  
                  if(totalCount > 0){
                    var trainingSearchObj = search.create({
                        type: 'customrecord_da_training',
                        filters: [
                            ["custrecord_da_coursestartdate", "within", "01/01/" + courseYear, "31/12/" + courseYear], "AND",
                            ["custrecord_da_employee_department", "anyof", departmentId], "AND",["custrecord_da_include_plan", "is", true]
                        ],
                        columns: ['internalid']
                    });
                    var resultCount = trainingSearchObj.runPaged().count;
                    if (resultCount <= totalCount) {
                        var rec = record.load({
                            type: scriptContext.newRecord.type,
                            id: scriptContext.newRecord.id
                        }).setValue('custrecord_da_include_plan', true).save();
                    }
                  }
                    
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    });
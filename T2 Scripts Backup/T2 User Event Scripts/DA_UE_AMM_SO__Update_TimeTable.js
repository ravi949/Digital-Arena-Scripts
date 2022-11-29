/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/task', 'N/record', 'N/email','N/search','N/ui/serverWidget'],
    function(task, record, email, search, ui) {
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
            try {
              
              var field = scriptContext.form.getField({
                  id : 'price'
              });
              field.updateDisplayType({
                displayType : ui.FieldDisplayType.DISABLED
            });
            } catch (ex) {
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
        function beforeSubmit(scriptContext) {
            log.debug('beforeSubmit', 'beforeSubmit');
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
        function afterSubmit(scriptContext) {
            try {
                var contextType = scriptContext.type;
                log.debug('contextType', contextType);
                var batchId = scriptContext.newRecord.getValue('custbody_da_amm_so_batch');
                var timeAllocated = false;
              var sender = scriptContext.newRecord.getValue('custbody3_2');
                if (batchId) {
                    var batchRec = record.load({
                        type: 'customrecord_da_amm_setup_batch',
                        id: batchId
                    });
                    var status = batchRec.getValue('custrecord_da_amm_setup_batch_status_1');
                    var batchName = batchRec.getValue('name');
                    var userToNotify = batchRec.getValue('custrecord_da_user_to_notify');
                    var minStudentCount = batchRec.getValue('custrecord_da_amm_min_students_for_start');
                    if (userToNotify && contextType == "edit") {
                        var transactionSearchObj = search.create({
                            type: "salesorder",
                            filters: [
                              ["type","anyof","SalesOrd"], 
      							"AND", 
                                ["custbody_da_amm_so_batch", "anyof", batchId],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                            columns: [
                                search.createColumn({
                                    name: "internalid",
                                    summary: "COUNT",
                                    label: "Name"
                                })
                            ]
                        });
                        var searchResultCount = transactionSearchObj.runPaged().count;
                        log.debug("transactionSearchObj result count", searchResultCount);
                        var registeredStudents = 0;
                        transactionSearchObj.run().each(function(result) {
                            registeredStudents = result.getValue({
                                name: 'internalid',
                                summary: search.Summary.COUNT
                            })
                            return true;
                        });
                        log.debug('registeredStudents', registeredStudents);
                        if (minStudentCount <= registeredStudents) {
                          log.debug('email sending');
                            email.send({
                                author: sender,
                                recipients: userToNotify,
                                subject: 'Students Addmissions Notification for Batch - ' + batchName,
                                body: 'Hi, <br> ' + registeredStudents + ' Students are registered for the Batch -' + batchName + ', Please Proceed to start the Batch.',
                                RelatedRecords: {
                                    customRecord: {
                                        id: batchId,
                                        recordType: 585
                                    }
                                }
                            });
                        }
                    }
                    if (status == 5) {
                        timeAllocated = true;
                    }
                }
                if (contextType == "create" && batchId && timeAllocated) {
                    var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_da_mr_create_time_table',
                        deploymentId: 'customdeploy_da_mr_create_time_table',
                        params: {
                            'custscript_da_sales_order_id': scriptContext.newRecord.id
                        }
                    }).submit();
                }
                var updateTimeTable = scriptContext.newRecord.getValue('custbody_da_update_time_table');
                if (updateTimeTable && batchId && timeAllocated && contextType == "edit") {
                    var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_da_mr_create_time_table',
                        deploymentId: 'customdeploy_da_mr_create_time_table',
                        params: {
                            'custscript_da_sales_order_id': scriptContext.newRecord.id
                        }
                    }).submit();
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
/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task', 'N/search', 'N/record'],
    function(task, search, record) {
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
                var subjectIds = scriptContext.newRecord.getValue('custrecord_da_revise_batch_subject_names');
                var salesOrderId = scriptContext.newRecord.getValue('custrecord_da_amm_revise_batch_so');
                var newBatchId = scriptContext.newRecord.getValue('custrecord_da_amm_revise_batch_new');
                var oldBatchId = scriptContext.newRecord.getValue('custrecord_da_amm_revise_batch');

                log.debug('subjectIds', subjectIds);
                var customrecord_da_amm_time_table_recordSearchObj = search.create({
                    type: "customrecord_da_amm_time_table_record",
                    filters: [
                        ["custrecord_da_amm_tt_batch", "anyof", oldBatchId],
                        "AND",
                        ["custrecord_da_amm_tt_sub_name", "anyof", subjectIds],
                        "AND",
                        ["custrecord_da_amm_tt_student", "anyof", scriptContext.newRecord.getValue('custrecord_da_amm_rev_batch_student')]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount = customrecord_da_amm_time_table_recordSearchObj.runPaged().count;
                log.debug("customrecord_da_amm_time_table_recordSearchObj result count", searchResultCount);
                customrecord_da_amm_time_table_recordSearchObj.run().each(function(result) {
                    record.delete({
                        type: 'customrecord_da_amm_time_table_record',
                        id: result.id
                    })
                    return true;
                });
                record.submitFields({
                    type: 'salesorder',
                    id: salesOrderId,
                    values: {
                        'custbody_da_amm_so_batch': newBatchId
                    }
                });
              
              var option = scriptContext.newRecord.getValue('custrecord_da_choose_option');
              
              
              
              var customrecord_da_amm_batch_subjectsSearchObj = search.create({
                   type: "customrecord_da_amm_batch_subjects",
                   filters:
                   [
                      ["custrecord_da_amm_batch_parent","anyof",newBatchId], 
                      "AND", 
                      ["custrecord_da_amm_subject_name","anyof",subjectIds]
                   ],
                   columns:
                   [
                      search.createColumn({
                         name: "id",
                         sort: search.Sort.ASC,
                         label: "ID"
                      })
                   ]
                });
                if(option == 2){
                    customrecord_da_amm_batch_subjectsSearchObj.filters.push(search.createFilter({
                         "name"    : "custrecord_da_amm_subject_name",
                         "operator": "anyof",
                         "values"  : subjectIds
                     }));
                }
                var subjectInternalIds = [];
                var searchResultCount = customrecord_da_amm_batch_subjectsSearchObj.runPaged().count;
                log.debug("customrecord_da_amm_batch_subjectsSearchObj result count",searchResultCount);
                customrecord_da_amm_batch_subjectsSearchObj.run().each(function(result){
                   subjectInternalIds.push(result.id);
                   return true;
                });
                var mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_da_mr_create_time_table',
                    deploymentId: 'customdeploy_da_mr_create_time_table',
                    params: {
                        'custscript_da_subject_ids': subjectInternalIds
                    }
                }).submit();
                log.debug('mrTask', mrTask);
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            onAction: onAction
        };
    });
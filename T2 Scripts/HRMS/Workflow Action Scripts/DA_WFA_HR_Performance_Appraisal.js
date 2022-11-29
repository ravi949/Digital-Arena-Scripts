    /**
     * @NApiVersion 2.x
     * @NScriptType workflowactionscript
     */
    define(['N/search', 'N/record', 'N/format'],
        function(search, record, format) {
            /**
             * Definition of the Workflow Action script trigger point.
             *
             * @param {Object} scriptContext
             * @param {Record} scriptContext.newRecord - New record
             * @param {Record} scriptContext.oldRecord - Old record
             * @Since 2016.1
             */
            function onAction(scriptContext) {
                try {

                    var id = scriptContext.newRecord.id;

                    var customrecord_da_objective_feedbackSearchObj = search.create({
                       type: "customrecord_da_objective_feedback",
                       filters:
                       [
                          ["custrecord_da_employee_feedback_link","anyof",id]
                       ],
                       columns:
                       [
                          search.createColumn({
                             name: "custrecord_da_perform_appraisal_eval",
                             label: "Evaluation (%)"
                          })
                       ]
                    });
                    var searchResultCount = customrecord_da_objective_feedbackSearchObj.runPaged().count;
                    log.debug("customrecord_da_objective_feedbackSearchObj result count",searchResultCount);

                    var objectiveEvalutionpercent = 0;
                    customrecord_da_objective_feedbackSearchObj.run().each(function(result){
                       var percent  = result.getValue({
                          name:'custrecord_da_perform_appraisal_eval'
                       });
                       objectiveEvalutionpercent = parseFloat(percent) + parseFloat(objectiveEvalutionpercent);
                       return true;
                    });


                    var customrecord_da_perf_app_competenciesSearchObj = search.create({
                       type: "customrecord_da_perf_app_competencies",
                       filters:
                       [
                          ["custrecord_da_appraisal_ref","anyof",scriptContext.newRecord.id]
                       ],
                       columns:
                       [
                          search.createColumn({
                             name: "custrecord_da_appriasal_competencie_eval",
                             label: "Evaluation(%)"
                          })
                       ]
                    });
                    var competencyEvalutionPercent = 0;
                    var searchResultCount = customrecord_da_perf_app_competenciesSearchObj.runPaged().count;
                    log.debug("customrecord_da_perf_app_competenciesSearchObj result count",searchResultCount);
                    customrecord_da_perf_app_competenciesSearchObj.run().each(function(result){
                        var percent = result.getValue({
                          name:'custrecord_da_appriasal_competencie_eval'
                       });
                        competencyEvalutionPercent = parseFloat(competencyEvalutionPercent) + parseFloat(percent);
                       return true;
                    });

                    log.debug('objectiveEvalutionpercent', objectiveEvalutionpercent);
                    log.debug('competencyEvalutionPercent', competencyEvalutionPercent);

                    var jobTitle = scriptContext.newRecord.getValue('custrecord_da_perform_app_emp_job_title');

                    var customrecord_da_wight_rateSearchObj = search.create({
                           type: "customrecord_da_wight_rate",
                           filters:
                           [
                              ["custrecord_da_job_title_rate","anyof",jobTitle]
                           ],
                           columns:
                           [
                              search.createColumn({name: "custrecord_da_kpi_rate", label: "KPI Rate"}),
                              search.createColumn({name: "custrecord_da_competencies_rate", label: "Competencies Rate"})
                           ]
                    });
                    var searchResultCount = customrecord_da_wight_rateSearchObj.runPaged().count;
                    log.debug("customrecord_da_wight_rateSearchObj result count",searchResultCount);

                    var comptencyPercent = 0;
                    var evalPercent = 0;
                    customrecord_da_wight_rateSearchObj.run().each(function(result){
                           comptencyPercent = result.getValue('custrecord_da_competencies_rate');
                           evalPercent = result.getValue('custrecord_da_kpi_rate');
                           return true;
                    });

                   
                    comptencyPercent = comptencyPercent.split("%")[0];
                    evalPercent = evalPercent.split("%")[0];

                     log.debug('comptencyPercent', comptencyPercent);
                    log.debug('evalPercent', evalPercent);

                    var finalRate = ((objectiveEvalutionpercent * evalPercent) + (competencyEvalutionPercent * comptencyPercent))/100;
                    log

                    scriptContext.newRecord.setValue('custrecord_da_final_rate', finalRate.toFixed(2));
                } catch (ex) {
                    log.error(ex.name, ex.message);
                }
            }
      
            return {
                onAction: onAction
            };
        });
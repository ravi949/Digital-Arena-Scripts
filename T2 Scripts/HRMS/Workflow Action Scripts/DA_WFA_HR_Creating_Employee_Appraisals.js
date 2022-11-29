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

                     var subsidiary = scriptContext.newRecord.getValue('custrecord_da_set_obj_emp_subsidiary');
                     var department = scriptContext.newRecord.getValue('custrecord_da_department_app');
                  
                    var owner = scriptContext.newRecord.getValue('owner');

                     var employeeSearchObj = search.create({
                       type: "employee",
                       filters:
                       [
                          ["subsidiary","anyof",subsidiary], 
                          "AND", 
                          ["department","anyof",department]
                       ],
                       columns:
                       [
                          search.createColumn({name: "internalid", label: "Internal ID"})
                       ]
                    });
                    var searchResultCount = employeeSearchObj.runPaged().count;
                    log.debug("employeeSearchObj result count",searchResultCount);
                    employeeSearchObj.run().each(function(result){
                       var customrecord_da_set_objectiveSearchObj = search.create({
                           type: "customrecord_da_set_objective",
                           filters:
                           [
                              ["custrecord_da_employee_app","anyof",result.id]
                           ],
                           columns:
                           [
                              search.createColumn({
                                 name: "name",
                                 sort: search.Sort.ASC,
                                 label: "Name"
                              }),
                              search.createColumn({name: "scriptid", label: "Script ID"}),
                              search.createColumn({name: "custrecord_da_app_objective_ar", label: "Objective / Arabic"}),
                              search.createColumn({name: "custrecord_da_wight_app", label: "Weight"}),
                              search.createColumn({name: "custrecord_da_employee_app", label: "Employee"}),
                              search.createColumn({name: "custrecord_da_department_line", label: "Department"}),
                              search.createColumn({name: "custrecord_da_set_objective_subsidiary", label: "Subsidiary"}),
                              search.createColumn({name: "custrecord_da_attachment_required", label: "Attachment Required ?"})
                           ]
                        });
                        var searchResultCount = customrecord_da_set_objectiveSearchObj.runPaged().count;
                        log.debug("customrecord_da_set_objectiveSearchObj result count",searchResultCount);
                        if(searchResultCount > 0){
                            var appraisalRec = record.create({
                                type:'customrecord_da_employee_feedback',
                                isDynamic: true
                            });
                          if(owner == result.id){
                             appraisalRec.setValue('custrecord_da_hod_appraisal', true);
                          }
                            appraisalRec.setValue('custrecord_da_employee_feed', result.id);
                            appraisalRec.setValue('custrecord_da_period_ref', scriptContext.newRecord.getValue('custrecord_da_appraisal_period_main'));
                        
                            customrecord_da_set_objectiveSearchObj.run().each(function(result){
                                log.debug('name', result.getValue('name'));
                              log.debug('id', result.id);

                                appraisalRec.selectNewLine({
                                    sublistId:'recmachcustrecord_da_employee_feedback_link'
                                });
                                appraisalRec.setCurrentSublistValue({
                                    sublistId :'recmachcustrecord_da_employee_feedback_link',
                                    fieldId:'custrecord_da_objective_ref',
                                    value: result.id
                                });
                                appraisalRec.commitLine({
                                    sublistId :'recmachcustrecord_da_employee_feedback_link'
                                })
                               return true;
                            });
                           appraisalRec.save();
                        }
                       return true;
                    });
                } catch (ex) {
                    log.error(ex.name, ex.message);
                }
            }
            return {
                onAction: onAction
            };
        });
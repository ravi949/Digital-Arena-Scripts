/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search','N/record','N/runtime','N/format'],

        function(search,record, runtime, format) {

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
        try{

         var roleId = scriptContext.newRecord.getValue('custrecord_da_emp_loan_role'); 
            var employeeSearchObj = search.create({
             type: "employee",
             filters:
             [
                ["role","anyof",roleId]
             ],
             columns:
             [
                search.createColumn({
                   name: "entityid",
                   sort: search.Sort.ASC,
                   label: "ID"
                })
             ]
          });
        var searchResultCount = employeeSearchObj.runPaged().count;
        log.debug("employeeSearchObj result count",searchResultCount);
          
          var empId; 
        employeeSearchObj.run().each(function(result){
          log.debug(result.id);
          empId = result.id
          
        });
             return empId;
        }catch(ex){
            log.error(ex.name,ex.message);
        }

    }

    return {
        onAction : onAction
    };

});
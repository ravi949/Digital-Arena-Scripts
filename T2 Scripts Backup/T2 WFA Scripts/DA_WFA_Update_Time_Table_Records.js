/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', 'N/record'],
    function( search, record) {
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

                var customrecord_da_amm_attendee_detailsSearchObj = search.create({
                   type: "customrecord_da_amm_attendee_details",
                   filters:
                   [
                      ["custrecord_da_amm_atten_parent","anyof",scriptContext.newRecord.id], 
                      "AND", 
                      ["custrecord_da_amm_student_attnded","is","T"]
                   ],
                   columns:
                   [
                      search.createColumn({name: "custrecord_da_amm_student_attnded", label: "Attended?"}),
                      search.createColumn({name: "custrecord_da_att_db_tt_id", label: "Time Table Id"})
                   ]
                });
                var searchResultCount = customrecord_da_amm_attendee_detailsSearchObj.runPaged().count;
                log.debug("customrecord_da_amm_attendee_detailsSearchObj result count",searchResultCount);
                customrecord_da_amm_attendee_detailsSearchObj.run().each(function(result){
                   record.submitFields({
                    type: 'customrecord_da_amm_time_table_record',
                    id: result.getValue('custrecord_da_att_db_tt_id'),
                    values: {
                        'custrecord_da_student_attended': true
                        }
                    });
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